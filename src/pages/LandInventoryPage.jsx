import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  FiSearch, FiFilter, FiDownload, FiPlus,
  FiMapPin, FiLayers, FiCheckCircle, FiClock,
  FiXCircle, FiChevronRight, FiEdit2,
  FiHash, FiCalendar, FiUser, FiFileText, FiMaximize2, FiPrinter,
} from 'react-icons/fi'
import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'
import ParcelMap from '../components/maps/ParcelMap.jsx'

const STATUS_CONFIG = {
  Active:   { bg: 'var(--color-success-bg)',  color: 'var(--color-success)',  border: 'var(--color-success-border)' },
  Inactive: { bg: 'var(--color-danger-bg)',   color: 'var(--color-danger)',   border: 'var(--color-danger-border)' },
  Reserved: { bg: 'var(--color-warning-bg)',  color: 'var(--color-warning)',  border: 'var(--color-warning-border)' },
}

const CATEGORY_CONFIG = {
  'Parish land':              { bg: 'var(--color-blue-bg)',   color: 'var(--color-blue)' },
  'Treasury land':            { bg: 'var(--color-purple-bg)', color: 'var(--color-purple)' },
  'Commission / Institution': { bg: 'var(--color-green-bg)',  color: 'var(--color-green)' },
}

function LandInventoryPage({ parcels, categories, statuses, selectedParcelId, onSelectParcel, onUpdateParcel, onNavigateToPage }) {
  const [parishFilter, setParishFilter]     = useState('All')
  const [districtFilter, setDistrictFilter] = useState('All')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [statusFilter, setStatusFilter]     = useState('All')
  const [searchText, setSearchText]         = useState('')
  const [activeParcel, setActiveParcel]     = useState(null)
  const [editing, setEditing]               = useState(false)
  const [editForm, setEditForm]             = useState({})
  const [saved, setSaved]                   = useState(false)

  const exportToPDF = () => {
    try {
      const doc = new jsPDF()
      doc.setFontSize(18)
      doc.text('Land Records Report - Fort Portal Diocese', 20, 20)
      doc.setFontSize(12)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30)
      doc.text(`Filters Applied: Parish: ${parishFilter}, District: ${districtFilter}, Category: ${categoryFilter}, Status: ${statusFilter}`, 20, 40)
      if (searchText) doc.text(`Search: "${searchText}"`, 20, 50)

      // Summary Stats
      doc.setFontSize(14)
      doc.text('Summary Statistics:', 20, 65)
      doc.setFontSize(12)
      doc.text(`Total Parcels: ${filteredParcels.length}`, 30, 75)
      doc.text(`Total Acreage: ${totalAcreage.toFixed(1)} acres`, 30, 85)
      doc.text(`Active Parcels: ${activeCount}`, 30, 95)
      doc.text(`Reserved Parcels: ${reservedCount}`, 30, 105)

      // Simple chart representation
      doc.setFontSize(10)
      doc.text('Status Distribution:', 20, 120)
      const total = filteredParcels.length
      if (total > 0) {
        const activePercent = (activeCount / total * 100).toFixed(1)
        const reservedPercent = (reservedCount / total * 100).toFixed(1)
        const inactivePercent = ((total - activeCount - reservedCount) / total * 100).toFixed(1)
        doc.text(`Active: ${activePercent}% (${activeCount})`, 30, 130)
        doc.text(`Reserved: ${reservedPercent}% (${reservedCount})`, 30, 140)
        doc.text(`Inactive: ${inactivePercent}% (${total - activeCount - reservedCount})`, 30, 150)
      }

      // Parcel List
      doc.setFontSize(14)
      doc.text('Parcel Details:', 20, 170)
      doc.setFontSize(10)
      let y = 180
      filteredParcels.forEach((p, i) => {
        if (y > 270) {
          doc.addPage()
          y = 20
        }
        doc.text(`${i + 1}. Name: ${p.name}`, 20, y)
        doc.text(`   Parish: ${p.parish}, District: ${p.district}, Category: ${p.category}`, 25, y + 5)
        doc.text(`   Acreage: ${p.acreage} ac, Tenure: ${p.tenureType}, Status: ${p.status}`, 25, y + 10)
        y += 20
      })
      doc.save('land_records_report.pdf')
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error generating PDF. Check console for details.')
    }
  }

  const exportToExcel = () => {
    const data = filteredParcels.map((p, i) => ({
      '#': i + 1,
      'Parcel Name': p.name,
      Parish: p.parish,
      District: p.district,
      Category: p.category,
      Acreage: p.acreage,
      Tenure: p.tenureType,
      Status: p.status
    }))
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Land Records')
    XLSX.writeFile(wb, 'land_records.xlsx')
  }

  const printReport = () => {
    window.print()
  }

  const closeModal = () => { setActiveParcel(null); setEditing(false); setSaved(false) }

  const openEdit = (parcel) => {
    setEditForm({ ...parcel })
    setEditing(true)
    setSaved(false)
  }

  const handleEditChange = (key, val) =>
    setEditForm(f => ({ ...f, [key]: val }))

  const handleSave = () => {
    const updated = { ...editForm, acreage: parseFloat(editForm.acreage) || editForm.acreage }
    onUpdateParcel(updated)
    setActiveParcel(updated)
    setEditing(false)
    setSaved(true)
  }

  const parishes  = useMemo(() => [...new Set(parcels.map((p) => p.parish))].sort(),   [parcels])
  const districts = useMemo(() => [...new Set(parcels.map((p) => p.district))].sort(), [parcels])

  const filteredParcels = useMemo(() => {
    const q = searchText.trim().toLowerCase()
    return [...parcels].reverse().filter((p) => {
      return (
        (parishFilter   === 'All' || p.parish    === parishFilter)   &&
        (districtFilter === 'All' || p.district  === districtFilter) &&
        (categoryFilter === 'All' || p.category  === categoryFilter) &&
        (statusFilter   === 'All' || p.status    === statusFilter)   &&
        (!q || [p.id, p.name, p.category, p.parish, p.district, p.status, p.outstation].join(' ').toLowerCase().includes(q))
      )
    })
  }, [parcels, parishFilter, districtFilter, categoryFilter, statusFilter, searchText])

  const totalAcreage = filteredParcels.reduce((s, p) => s + p.acreage, 0)
  const activeCount  = filteredParcels.filter((p) => p.status === 'Active').length
  const reservedCount= filteredParcels.filter((p) => p.status === 'Reserved').length

  return (
    <div className="inv-page">

      {/* ── Header ── */}
      <div className="inv-header">
        <div className="inv-header-left">
          <p className="eyebrow">Fort Portal Diocese</p>
          <h1 className="inv-title">Land Records</h1>
          <p className="inv-subtitle">Browse, filter and manage all diocesan land parcels across 8 districts.</p>
        </div>
        <button type="button" className="inv-add-btn" onClick={() => onNavigateToPage?.('AddLand')}>
          <FiPlus /> Add Land Record
        </button>
      </div>

      {/* ── Stat pills ── */}
      <div className="inv-stats">
        <div className="inv-stat">
          <div className="inv-stat-icon inv-stat-icon-blue"><FiLayers /></div>
          <div>
            <span className="inv-stat-num">{filteredParcels.length}</span>
            <span className="inv-stat-label">Total Parcels</span>
          </div>
        </div>
        <div className="inv-stat">
          <div className="inv-stat-icon inv-stat-icon-green"><FiCheckCircle /></div>
          <div>
            <span className="inv-stat-num">{activeCount}</span>
            <span className="inv-stat-label">Active</span>
          </div>
        </div>
        <div className="inv-stat">
          <div className="inv-stat-icon inv-stat-icon-orange"><FiClock /></div>
          <div>
            <span className="inv-stat-num">{reservedCount}</span>
            <span className="inv-stat-label">Reserved</span>
          </div>
        </div>
        <div className="inv-stat">
          <div className="inv-stat-icon inv-stat-icon-purple"><FiMapPin /></div>
          <div>
            <span className="inv-stat-num">{totalAcreage.toFixed(1)}</span>
            <span className="inv-stat-label">Total Acres</span>
          </div>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="inv-toolbar">
        <div className="inv-search-wrap">
          <FiSearch className="inv-search-icon" />
          <input
            className="inv-search"
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search parcel, parish, district…"
          />
        </div>

        <div className="inv-filters">
          <FiFilter className="inv-filter-icon" />
          <select value={parishFilter}   onChange={(e) => setParishFilter(e.target.value)}>
            <option value="All">All Parishes</option>
            {parishes.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={districtFilter} onChange={(e) => setDistrictFilter(e.target.value)}>
            <option value="All">All Districts</option>
            {districts.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="All">All Categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={statusFilter}   onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Statuses</option>
            {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="inv-export">
          <button type="button" className="inv-export-btn" onClick={printReport}><FiPrinter /> Print</button>
          <button type="button" className="inv-export-btn" onClick={exportToPDF}><FiDownload /> PDF</button>
          <button type="button" className="inv-export-btn" onClick={exportToExcel}><FiDownload /> Excel</button>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="inv-table-wrap">
        <table className="inv-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Parcel Name</th>
              <th>Parish</th>
              <th>District</th>
              <th>Category</th>
              <th>Acreage</th>
              <th>Tenure</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredParcels.map((parcel, i) => {
              const sc = STATUS_CONFIG[parcel.status]   || {}
              const cc = CATEGORY_CONFIG[parcel.category] || { bg: '#f1f5f9', color: '#475569' }
              return (
                <tr
                  key={parcel.id}
                  className={`inv-row ${parcel.id === selectedParcelId ? 'inv-row-selected' : ''}`}
                  onClick={() => { setActiveParcel(parcel); onSelectParcel(parcel.id) }}
                >
                  <td className="inv-td-num">{i + 1}</td>
                  <td>
                    <div className="inv-parcel-name">{parcel.name}</div>
                    <div className="inv-parcel-sub">{parcel.outstation} · {parcel.village}</div>
                  </td>
                  <td>{parcel.parish}</td>
                  <td>
                    <span className="inv-district-chip">
                      <FiMapPin style={{ fontSize: '0.7rem' }} /> {parcel.district}
                    </span>
                  </td>
                  <td>
                    <span className="inv-chip" style={{ background: cc.bg, color: cc.color }}>{parcel.category}</span>
                  </td>
                  <td className="inv-td-acreage">{parcel.acreage} ac</td>
                  <td>{parcel.tenureType}</td>
                  <td>
                    <span
                      className="inv-status-badge"
                      style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}
                    >
                      {parcel.status}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="inv-row-edit-btn"
                      title="Edit"
                      onClick={(e) => { e.stopPropagation(); setActiveParcel(parcel); onSelectParcel(parcel.id); openEdit(parcel) }}
                    >
                      <FiEdit2 />
                    </button>
                  </td>
                </tr>
              )
            })}
            {filteredParcels.length === 0 && (
              <tr>
                <td colSpan="9" className="inv-empty">No parcels match the selected filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {activeParcel && createPortal(
        <div className="ipm-overlay" onClick={closeModal}>
          <div className="ipm-modal" onClick={(e) => e.stopPropagation()}>

            {/* ── Hero header ── */}
            <div className="ipm-hero" style={{ '--status-color': STATUS_CONFIG[activeParcel.status]?.color || '#2563eb' }}>
              {/* Row 1: badges + title + X */}
              <div className="ipm-hero-row1">
                <div className="ipm-hero-left">
                  <div className="ipm-hero-badges">
                    <span className="ipm-status-badge" style={{ background: STATUS_CONFIG[activeParcel.status]?.bg, color: STATUS_CONFIG[activeParcel.status]?.color, border: `1px solid ${STATUS_CONFIG[activeParcel.status]?.border}` }}>
                      {activeParcel.status}
                    </span>
                    <span className="ipm-cat-badge" style={{ background: CATEGORY_CONFIG[activeParcel.category]?.bg, color: CATEGORY_CONFIG[activeParcel.category]?.color }}>
                      {activeParcel.category}
                    </span>
                    {saved && <span className="ipm-saved-toast"><FiCheckCircle /> Saved</span>}
                  </div>
                  <h2 className="ipm-hero-title">{activeParcel.name}</h2>
                  <p className="ipm-hero-sub"><FiMapPin /> {[activeParcel.village, activeParcel.parish, activeParcel.district].filter(Boolean).join(' · ')}</p>
                </div>
                <button type="button" className="ipm-close-btn" onClick={closeModal} title="Close">
                  <FiXCircle />
                </button>
              </div>
              {/* Row 2: KPI only */}
              <div className="ipm-hero-row2">
                <div className="ipm-hero-kpi">
                  <span className="ipm-kpi-num">{activeParcel.acreage}</span>
                  <span className="ipm-kpi-unit">ac</span>
                </div>
              </div>
            </div>

            {/* ── Body ── */}
            <div className="ipm-body">
              {editing ? (
                /* ── Edit form ── */
                <div className="ipm-edit-form">
                  <div className="ipm-edit-header">
                    <span className="ipm-edit-title">Edit Parcel Record</span>
                    <span className="ipm-edit-id">{editForm.id}</span>
                  </div>

                  <div className="ipm-edit-section-label">Location</div>
                  <div className="ipm-edit-grid">
                    {[['name','Parcel Name'],['district','District'],['county','County'],
                      ['subcounty','Subcounty'],['village','Village'],['parish','Parish'],
                      ['outstation','Outstation'],['deanery','Deanery']
                    ].map(([key, label]) => (
                      <div key={key} className="ipm-edit-field">
                        <label className="ipm-edit-label">{label}</label>
                        <input className="ipm-edit-input" value={editForm[key] || ''}
                          onChange={e => handleEditChange(key, e.target.value)} />
                      </div>
                    ))}
                  </div>

                  <div className="ipm-edit-section-label">Details</div>
                  <div className="ipm-edit-grid">
                    <div className="ipm-edit-field">
                      <label className="ipm-edit-label">Category</label>
                      <select className="ipm-edit-input" value={editForm.category || ''}
                        onChange={e => handleEditChange('category', e.target.value)}>
                        {categories.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="ipm-edit-field">
                      <label className="ipm-edit-label">Status</label>
                      <select className="ipm-edit-input" value={editForm.status || ''}
                        onChange={e => handleEditChange('status', e.target.value)}>
                        {statuses.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="ipm-edit-field">
                      <label className="ipm-edit-label">Acreage (acres)</label>
                      <input className="ipm-edit-input" type="number" step="0.1" min="0"
                        value={editForm.acreage || ''}
                        onChange={e => handleEditChange('acreage', e.target.value)} />
                    </div>
                    <div className="ipm-edit-field">
                      <label className="ipm-edit-label">Tenure Type</label>
                      <select className="ipm-edit-input" value={editForm.tenureType || ''}
                        onChange={e => handleEditChange('tenureType', e.target.value)}>
                        {['Freehold','Lease','Customary'].map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="ipm-edit-field">
                      <label className="ipm-edit-label">Lease Type</label>
                      <input className="ipm-edit-input" value={editForm.leaseType || ''}
                        onChange={e => handleEditChange('leaseType', e.target.value)} />
                    </div>
                    <div className="ipm-edit-field">
                      <label className="ipm-edit-label">Year Acquired</label>
                      <input className="ipm-edit-input" value={editForm.acquisition || ''}
                        onChange={e => handleEditChange('acquisition', e.target.value)} />
                    </div>
                    <div className="ipm-edit-field">
                      <label className="ipm-edit-label">Last Survey</label>
                      <input className="ipm-edit-input" type="date" value={editForm.lastSurvey || ''}
                        onChange={e => handleEditChange('lastSurvey', e.target.value)} />
                    </div>
                  </div>

                  <div className="ipm-edit-section-label">Contact</div>
                  <div className="ipm-edit-grid">
                    <div className="ipm-edit-field">
                      <label className="ipm-edit-label">Tenant</label>
                      <input className="ipm-edit-input" value={editForm.tenant || ''}
                        onChange={e => handleEditChange('tenant', e.target.value)} />
                    </div>
                    <div className="ipm-edit-field">
                      <label className="ipm-edit-label">Contact</label>
                      <input className="ipm-edit-input" value={editForm.contact || ''}
                        onChange={e => handleEditChange('contact', e.target.value)} />
                    </div>
                  </div>

                  <div className="ipm-edit-section-label">Remarks</div>
                  <textarea className="ipm-edit-input ipm-edit-textarea"
                    value={editForm.remarks || ''}
                    onChange={e => handleEditChange('remarks', e.target.value)}
                    rows={3} />

                  <div className="ipm-edit-actions">
                    <button type="button" className="ipm-cancel-btn" onClick={() => setEditing(false)}>
                      Cancel
                    </button>
                    <button type="button" className="ipm-save-btn" onClick={handleSave}>
                      <FiCheckCircle /> Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                /* ── View grid ── */
                <div className="ipm-view-wrap">
                <div className="ipm-grid">
                  <div className="ipm-card">
                    <div className="ipm-card-head ipm-head-blue"><FiHash /> Property</div>
                    <div className="ipm-rows">
                      {[['ID', activeParcel.id, FiHash],
                        ['Category', activeParcel.category, FiLayers],
                        ['Tenure', activeParcel.tenureType, FiFileText],
                        ['Lease', activeParcel.leaseType || 'N/A', FiFileText],
                        ['Acreage', `${activeParcel.acreage} acres`, FiMaximize2],
                        ['Acquired', activeParcel.acquisition || '—', FiCalendar],
                        ['Last Survey', activeParcel.lastSurvey || '—', FiCalendar],
                      ].map(([label, value, Icon]) => (
                        <div key={label} className="ipm-row">
                          <span className="ipm-row-label"><Icon /> {label}</span>
                          <span className="ipm-row-value">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="ipm-card">
                    <div className="ipm-card-head ipm-head-green"><FiMapPin /> Location</div>
                    <div className="ipm-rows">
                      {[['District', activeParcel.district],
                        ['County', activeParcel.county],
                        ['Subcounty', activeParcel.subcounty],
                        ['Parish', activeParcel.parish],
                        ['Village', activeParcel.village],
                        ['Outstation', activeParcel.outstation || '—'],
                        ['Deanery', activeParcel.deanery || '—'],
                      ].map(([label, value]) => (
                        <div key={label} className="ipm-row">
                          <span className="ipm-row-label"><FiMapPin /> {label}</span>
                          <span className="ipm-row-value">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="ipm-card">
                    <div className="ipm-card-head ipm-head-purple"><FiUser /> Tenure & Contact</div>
                    <div className="ipm-rows">
                      {[['Tenant', activeParcel.tenant || '—', FiUser],
                        ['Contact', activeParcel.contact || '—', FiUser],
                      ].map(([label, value, Icon]) => (
                        <div key={label} className="ipm-row">
                          <span className="ipm-row-label"><Icon /> {label}</span>
                          <span className="ipm-row-value">{value}</span>
                        </div>
                      ))}
                    </div>
                    {activeParcel.remarks && (
                      <div className="ipm-remarks">
                        <span className="ipm-remarks-label">Remarks</span>
                        <p className="ipm-remarks-text">{activeParcel.remarks}</p>
                      </div>
                    )}
                  </div>

                  <div className="ipm-card ipm-map-card">
                    <div className="ipm-card-head ipm-head-cyan"><FiMapPin /> Location Map — {activeParcel.district}</div>
                    <ParcelMap parcel={activeParcel} />
                  </div>
                </div>
                <div className="ipm-footer-actions">
                  <button type="button" className="ipm-edit-full-btn" onClick={() => openEdit(activeParcel)}>
                    <FiEdit2 /> Edit Record
                  </button>
                </div>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── Footer ── */}
      <div className="inv-footer">
        <span>{filteredParcels.length} records</span>
        <span>{totalAcreage.toFixed(1)} total acres</span>
      </div>
    </div>
  )
}

export default LandInventoryPage
