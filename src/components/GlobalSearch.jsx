import { useState, useMemo, useRef, useEffect } from 'react'
import {
  FiSearch, FiMapPin, FiFileText, FiLayers, FiX,
  FiHome, FiBarChart2, FiArrowRight, FiGrid, FiRadio,
} from 'react-icons/fi'
import landData from '../data/land.js'

/* ── exported constants ── */
export const PAGE_ITEMS = [
  { label: 'Dashboard',    page: 'Dashboard', icon: FiHome,      desc: 'Overview & statistics' },
  { label: 'Hierarchy',    page: 'Hierarchy', icon: FiLayers,    desc: 'Diocese structure' },
  { label: 'Land Records', page: 'Inventory', icon: FiFileText,  desc: 'Browse all parcels' },
  { label: 'Add Land',     page: 'AddLand',   icon: FiMapPin,    desc: 'Register new parcel' },
  { label: 'Reports',      page: 'Reports',   icon: FiBarChart2, desc: 'Analytics & export' },
]

export const CAT_COLOR = {
  'Parish land':              '#2563eb',
  'Treasury land':            '#7c3aed',
  'Commission / Institution': '#0891b2',
}

export const STATUS_CFG = {
  Active:   { color: '#059669', bg: '#f0fdf4', border: '#bbf7d0' },
  Inactive: { color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  Reserved: { color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
}

/* ── build full index from landData ── */
function buildIndex(parcels) {
  const items = []

  // Pages
  PAGE_ITEMS.forEach(p => {
    items.push({
      type: 'page', id: `page-${p.page}`,
      label: p.label, desc: p.desc, page: p.page, icon: p.icon,
      searchText: `${p.label} ${p.desc}`.toLowerCase(),
    })
  })

  // Parcels — every single field
  parcels.forEach(p => {
    items.push({
      type: 'parcel', ...p,
      searchText: [
        p.id, p.name, p.category, p.status, p.tenureType, p.leaseType,
        p.parish, p.outstation, p.village, p.subcounty, p.county,
        p.district, p.deanery, p.tenant, p.contact, p.acquisition,
        p.lastSurvey, p.remarks, String(p.acreage),
      ].filter(Boolean).join(' ').toLowerCase(),
    })
  })

  // Districts
  landData.districts.forEach(d => {
    const distParcels = parcels.filter(p => p.district === d)
    items.push({
      type: 'district', id: `district-${d}`,
      label: d,
      count: distParcels.length,
      acreage: distParcels.reduce((s, p) => s + (p.acreage || 0), 0),
      searchText: `${d} district`.toLowerCase(),
    })
  })

  // Categories
  landData.categories.forEach(c => {
    const catParcels = parcels.filter(p => p.category === c)
    items.push({
      type: 'category', id: `cat-${c}`,
      label: c,
      count: catParcels.length,
      searchText: `${c} category land`.toLowerCase(),
    })
  })

  // Statuses
  landData.statuses.forEach(s => {
    const sParcels = parcels.filter(p => p.status === s)
    items.push({
      type: 'status', id: `status-${s}`,
      label: s,
      count: sParcels.length,
      searchText: `${s} status`.toLowerCase(),
    })
  })

  // Tenure types
  landData.tenureTypes.forEach(t => {
    const tParcels = parcels.filter(p => p.tenureType === t)
    items.push({
      type: 'tenure', id: `tenure-${t}`,
      label: t,
      count: tParcels.length,
      searchText: `${t} tenure`.toLowerCase(),
    })
  })

  // Hierarchy — deaneries, parishes, subparishes, outstations
  landData.hierarchy.forEach(diocese => {
    ;(diocese.deaneries || []).forEach(deanery => {
      items.push({
        type: 'deanery', id: `deanery-${deanery.name}`,
        label: deanery.name,
        diocese: diocese.name,
        parishes: deanery.parishes?.map(p => p.name) || [],
        searchText: `${deanery.name} deanery ${diocese.name}`.toLowerCase(),
      })
      ;(deanery.parishes || []).forEach(parish => {
        items.push({
          type: 'parish', id: `parish-${parish.name}`,
          label: parish.name,
          deanery: deanery.name,
          subparishes: parish.subparishes?.map(s => s.name) || [],
          searchText: `${parish.name} parish ${deanery.name}`.toLowerCase(),
        })
        ;(parish.subparishes || []).forEach(sub => {
          items.push({
            type: 'subparish', id: `sub-${sub.name}`,
            label: sub.name,
            parish: parish.name,
            outstations: sub.outstations || [],
            searchText: `${sub.name} subparish ${parish.name}`.toLowerCase(),
          })
          ;(sub.outstations || []).forEach(o => {
            items.push({
              type: 'outstation', id: `out-${o}`,
              label: o,
              subparish: sub.name,
              parish: parish.name,
              searchText: `${o} outstation ${sub.name} ${parish.name}`.toLowerCase(),
            })
          })
        })
      })
    })
  })

  return items
}

/* ── score an item against query ── */
function score(item, q) {
  const t = item.searchText
  if (!t.includes(q)) return 0
  // exact label match = highest
  if (item.label?.toLowerCase() === q) return 10
  if (item.label?.toLowerCase().startsWith(q)) return 8
  if (item.label?.toLowerCase().includes(q)) return 6
  return 2
}

const TYPE_ICON = {
  page:      FiHome,
  parcel:    FiMapPin,
  district:  FiMapPin,
  category:  FiLayers,
  status:    FiGrid,
  tenure:    FiFileText,
  deanery:   FiLayers,
  parish:    FiHome,
  subparish: FiGrid,
  outstation:FiRadio,
}

const TYPE_COLOR = {
  page:      '#2563eb',
  parcel:    '#059669',
  district:  '#0891b2',
  category:  '#7c3aed',
  status:    '#d97706',
  tenure:    '#64748b',
  deanery:   '#7c3aed',
  parish:    '#2563eb',
  subparish: '#d97706',
  outstation:'#dc2626',
}

export default function GlobalSearch({ parcels, onSearch }) {
  const [query, setQuery]     = useState('')
  const [open, setOpen]       = useState(false)
  const [focused, setFocused] = useState(-1)
  const inputRef = useRef()
  const wrapRef  = useRef()

  const index = useMemo(() => buildIndex(parcels), [parcels])

  const q = query.trim().toLowerCase()

  const suggestions = useMemo(() => {
    if (!q) return []
    return index
      .map(item => ({ ...item, _score: score(item, q) }))
      .filter(item => item._score > 0)
      .sort((a, b) => b._score - a._score)
      .slice(0, 5)
  }, [q, index])

  useEffect(() => {
    const h = (e) => { if (!wrapRef.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const doSearch = (val) => {
    const v = (val ?? query).trim()
    if (!v) return
    onSearch(v)
    setOpen(false)
    inputRef.current?.blur()
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') { doSearch(); return }
    if (!open) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setFocused(f => Math.min(f + 1, suggestions.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setFocused(f => Math.max(f - 1, 0)) }
    else if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur() }
  }

  const clear = () => { setQuery(''); onSearch(''); inputRef.current?.focus() }

  return (
    <div className="gs-wrap" ref={wrapRef}>
      <div className={`gs-input-wrap ${open && q ? 'gs-focused' : ''}`}>
        <FiSearch className="gs-icon" />
        <input
          ref={inputRef}
          className="gs-input"
          type="text"
          value={query}
          placeholder="Search anything — parcels, districts, parishes, tenure…"
          onChange={e => { setQuery(e.target.value); setOpen(true); setFocused(-1) }}
          onFocus={() => { setOpen(true); setFocused(-1) }}
          onKeyDown={handleKey}
          autoComplete="off"
        />
        {query && <button className="gs-clear" onClick={clear}><FiX /></button>}
        <button className="gs-search-btn" onClick={() => doSearch()}><FiSearch /> Search</button>
      </div>

      {open && q && suggestions.length > 0 && (
        <div className="gs-suggestions">
          {suggestions.map((item, idx) => {
            const isActive = focused === idx
            const Icon = TYPE_ICON[item.type] || FiSearch
            const color = TYPE_COLOR[item.type] || '#64748b'
            const sub = item.type === 'parcel'  ? `${item.id} · ${item.parish} · ${item.district}`
                      : item.type === 'district' ? `${item.count} parcels · ${item.acreage?.toFixed(1)} ac`
                      : item.type === 'deanery'  ? `Deanery · ${item.diocese}`
                      : item.type === 'parish'   ? `Parish · ${item.deanery}`
                      : item.type === 'subparish'? `Subparish · ${item.parish}`
                      : item.type === 'outstation'?`Outstation · ${item.subparish}`
                      : item.type === 'category' ? `${item.count} parcels`
                      : item.type === 'status'   ? `${item.count} parcels`
                      : item.type === 'tenure'   ? `${item.count} parcels`
                      : item.desc || ''
            return (
              <button key={item.id}
                className={`gs-sug-item ${isActive ? 'gs-sug-active' : ''}`}
                onMouseEnter={() => setFocused(idx)}
                onClick={() => { setQuery(item.label); doSearch(item.label) }}
              >
                <span className="gs-sug-icon" style={{ background: color + '18', color }}>
                  <Icon />
                </span>
                <span className="gs-sug-body">
                  <span className="gs-sug-title">{item.label}</span>
                  <span className="gs-sug-sub">{sub}</span>
                </span>
                <span className="gs-sug-type">{item.type}</span>
              </button>
            )
          })}
          <div className="gs-sug-footer">Press <kbd>Enter</kbd> to see all results</div>
        </div>
      )}
    </div>
  )
}

export { buildIndex, score, TYPE_ICON, TYPE_COLOR }
