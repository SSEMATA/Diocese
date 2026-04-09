import { useMemo } from 'react'
import { FiSearch, FiArrowRight } from 'react-icons/fi'
import { buildIndex, score, TYPE_ICON, TYPE_COLOR, CAT_COLOR, STATUS_CFG } from '../components/GlobalSearch.jsx'

function highlight(text, q) {
  if (!q || !text) return text
  const str = String(text)
  const idx = str.toLowerCase().indexOf(q.toLowerCase())
  if (idx === -1) return str
  return (
    <>
      {str.slice(0, idx)}
      <mark className="gs-hl">{str.slice(idx, idx + q.length)}</mark>
      {str.slice(idx + q.length)}
    </>
  )
}

const TYPE_LABEL = {
  page:       'Pages',
  parcel:     'Land Parcels',
  district:   'Districts',
  category:   'Categories',
  status:     'Statuses',
  tenure:     'Tenure Types',
  deanery:    'Deaneries',
  parish:     'Parishes',
  subparish:  'Subparishes',
  outstation: 'Outstations',
}

const TYPE_ORDER = ['page','parcel','district','deanery','parish','subparish','outstation','category','status','tenure']

function snippet(item) {
  if (item.type === 'parcel')
    return `${[item.village, item.subcounty, item.county, item.district].filter(Boolean).join(', ')} · ${item.acreage} acres · ${item.tenureType} · ${item.status}`
  if (item.type === 'district')
    return `${item.count} parcel${item.count !== 1 ? 's' : ''} · ${item.acreage?.toFixed(1)} total acres`
  if (item.type === 'deanery')
    return `Deanery · ${item.diocese} · ${item.parishes?.length || 0} parishes`
  if (item.type === 'parish')
    return `Parish · ${item.deanery} · ${item.subparishes?.length || 0} subparishes`
  if (item.type === 'subparish')
    return `Subparish · ${item.parish} · ${item.outstations?.length || 0} outstations`
  if (item.type === 'outstation')
    return `Outstation · ${item.subparish} · ${item.parish}`
  if (item.type === 'category')
    return `${item.count} parcel${item.count !== 1 ? 's' : ''} in this category`
  if (item.type === 'status')
    return `${item.count} parcel${item.count !== 1 ? 's' : ''} with this status`
  if (item.type === 'tenure')
    return `${item.count} parcel${item.count !== 1 ? 's' : ''} with this tenure type`
  return item.desc || ''
}

function urlCrumb(item) {
  if (item.type === 'page')       return `fortportal.diocese / ${item.label.toLowerCase().replace(/ /g, '-')}`
  if (item.type === 'parcel')     return `land-records / ${item.id} / ${item.district}`
  if (item.type === 'district')   return `districts / ${item.label.toLowerCase()}`
  if (item.type === 'deanery')    return `hierarchy / deanery / ${item.label.toLowerCase()}`
  if (item.type === 'parish')     return `hierarchy / parish / ${item.label.toLowerCase()}`
  if (item.type === 'subparish')  return `hierarchy / subparish / ${item.label.toLowerCase()}`
  if (item.type === 'outstation') return `hierarchy / outstation / ${item.label.toLowerCase()}`
  if (item.type === 'category')   return `categories / ${item.label.toLowerCase()}`
  if (item.type === 'status')     return `statuses / ${item.label.toLowerCase()}`
  if (item.type === 'tenure')     return `tenure / ${item.label.toLowerCase()}`
  return ''
}

export default function SearchResultsPage({ query, parcels, onSelectResult, onClear }) {
  const q = query.trim().toLowerCase()

  const index = useMemo(() => buildIndex(parcels), [parcels])

  const allResults = useMemo(() => {
    if (!q) return []
    return index
      .map(item => ({ ...item, _score: score(item, q) }))
      .filter(item => item._score > 0)
      .sort((a, b) => b._score - a._score)
  }, [q, index])

  // group by type in display order
  const grouped = useMemo(() => {
    const map = {}
    allResults.forEach(item => {
      if (!map[item.type]) map[item.type] = []
      map[item.type].push(item)
    })
    return TYPE_ORDER.filter(t => map[t]).map(t => ({ type: t, items: map[t] }))
  }, [allResults])

  return (
    <div className="sr-page">
      <div className="sr-meta-row">
        <p className="sr-meta">
          About <strong>{allResults.length}</strong> result{allResults.length !== 1 ? 's' : ''} for <strong>"{query}"</strong>
        </p>
        <button className="sr-clear-btn" onClick={onClear}>Clear search</button>
      </div>

      {allResults.length === 0 && (
        <div className="sr-empty">
          <FiSearch className="sr-empty-icon" />
          <h3>No results for "{query}"</h3>
          <p>Try different keywords — parcel name, district, parish, tenure type, status…</p>
        </div>
      )}

      {grouped.map(({ type, items }) => {
        const Icon = TYPE_ICON[type] || FiSearch
        const color = TYPE_COLOR[type] || '#64748b'
        return (
          <div key={type} className="sr-section">
            <div className="sr-section-label">{TYPE_LABEL[type] || type} — {items.length}</div>
            {items.map(item => (
              <button key={item.id} className="sr-card" onClick={() => onSelectResult(item)}>
                <div className="sr-card-icon" style={{ background: color + '15', color }}>
                  <Icon />
                </div>
                <div className="sr-card-body">
                  <div className="sr-card-url">{urlCrumb(item)}</div>
                  <div className="sr-card-title">{highlight(item.label || item.name, query)}</div>
                  <div className="sr-card-snippet">{snippet(item)}</div>
                </div>
                {item.type === 'parcel' && (() => {
                  const sc = STATUS_CFG[item.status] || STATUS_CFG.Active
                  return (
                    <span className="sr-card-status" style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                      {item.status}
                    </span>
                  )
                })()}
                {item.type !== 'parcel' && <FiArrowRight className="sr-card-arrow" />}
              </button>
            ))}
          </div>
        )
      })}
    </div>
  )
}
