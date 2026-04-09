import {
  FiArrowLeft, FiMapPin, FiFileText, FiHash,
  FiCheckCircle, FiAlertCircle, FiClock, FiMap,
  FiArrowRight, FiLayers, FiGrid, FiRadio,
} from 'react-icons/fi'
import ParcelMap from '../components/maps/ParcelMap.jsx'
import { CAT_COLOR, STATUS_CFG, TYPE_ICON, TYPE_COLOR } from '../components/GlobalSearch.jsx'
import landData from '../data/land.js'

function Row({ label, value }) {
  return (
    <div className="sd-row">
      <span className="sd-label">{label}</span>
      <span className="sd-value">{value || '—'}</span>
    </div>
  )
}

function Card({ head, headColor = '#2563eb', children }) {
  return (
    <div className="sd-card">
      <div className="sd-card-head" style={{ color: headColor }}>{head}</div>
      {children}
    </div>
  )
}

function InfoCard({ title, icon: Icon, color, rows, children }) {
  return (
    <Card head={<>{Icon && <Icon />} {title}</>} headColor={color}>
      {rows?.map(([l, v]) => <Row key={l} label={l} value={v} />)}
      {children}
    </Card>
  )
}

/* ── Parcel detail ── */
function ParcelDetail({ parcel, onBack }) {
  const sc = STATUS_CFG[parcel.status] || STATUS_CFG.Active
  const catColor = CAT_COLOR[parcel.category] || '#64748b'
  const StatusIcon = parcel.status === 'Active' ? FiCheckCircle
    : parcel.status === 'Inactive' ? FiAlertCircle : FiClock

  return (
    <div className="sd-page">
      <button className="sd-back" onClick={onBack}><FiArrowLeft /> Back to results</button>
      <div className="sd-hero" style={{ '--sc': sc.color }}>
        <div className="sd-hero-badges">
          <span className="sd-badge" style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
            <StatusIcon /> {parcel.status}
          </span>
          <span className="sd-badge" style={{ background: catColor + '18', color: catColor }}>{parcel.category}</span>
          {parcel.deanery && <span className="sd-badge sd-badge-muted">{parcel.deanery}</span>}
        </div>
        <h2 className="sd-hero-title">{parcel.name}</h2>
        <p className="sd-hero-loc">
          <FiMapPin />
          {[parcel.village, parcel.parish, parcel.subcounty, parcel.county, parcel.district].filter(Boolean).join(' · ')}
        </p>
        <div className="sd-kpi">
          <span className="sd-kpi-num">{parcel.acreage}</span>
          <span className="sd-kpi-unit">acres</span>
        </div>
      </div>
      <div className="sd-grid">
        <InfoCard title="Property" icon={FiHash} color="#2563eb" rows={[
          ['Parcel ID', parcel.id], ['Category', parcel.category], ['Status', parcel.status],
          ['Acreage', `${parcel.acreage} acres`], ['Acquired', parcel.acquisition], ['Last Survey', parcel.lastSurvey],
        ]} />
        <InfoCard title="Location" icon={FiMapPin} color="#059669" rows={[
          ['District', parcel.district], ['County', parcel.county], ['Subcounty', parcel.subcounty],
          ['Village', parcel.village], ['Parish', parcel.parish], ['Outstation', parcel.outstation], ['Deanery', parcel.deanery],
        ]} />
        <InfoCard title="Tenure & Contact" icon={FiFileText} color="#7c3aed" rows={[
          ['Tenure', parcel.tenureType], ['Lease', parcel.leaseType], ['Tenant', parcel.tenant], ['Contact', parcel.contact],
        ]}>
          {parcel.remarks && (
            <div className="sd-remarks">
              <span className="sd-label">Remarks</span>
              <p>{parcel.remarks}</p>
            </div>
          )}
        </InfoCard>
        <Card head={<><FiMap /> Map — {parcel.district}</>} headColor="#0891b2">
          <ParcelMap parcel={parcel} />
        </Card>
      </div>
    </div>
  )
}

/* ── District detail ── */
function DistrictDetail({ item, parcels, onBack, onSelectResult }) {
  const distParcels = parcels.filter(p => p.district === item.label)
  const byCategory = landData.categories.map(c => ({
    cat: c, count: distParcels.filter(p => p.category === c).length,
  }))
  return (
    <div className="sd-page">
      <button className="sd-back" onClick={onBack}><FiArrowLeft /> Back to results</button>
      <div className="sd-generic-hero" style={{ '--gc': TYPE_COLOR.district }}>
        <div className="sd-generic-icon"><FiMapPin /></div>
        <div>
          <div className="sd-generic-type">District</div>
          <h2 className="sd-generic-title">{item.label}</h2>
          <p className="sd-generic-sub">{item.count} parcels · {item.acreage?.toFixed(1)} total acres</p>
        </div>
      </div>
      <div className="sd-grid">
        <InfoCard title="Summary" icon={FiGrid} color="#0891b2" rows={[
          ['Total Parcels', item.count], ['Total Acreage', `${item.acreage?.toFixed(1)} ac`],
          ...byCategory.map(({ cat, count }) => [cat, count]),
        ]} />
        <div className="sd-card" style={{ gridColumn: '1 / -1' }}>
          <div className="sd-card-head" style={{ color: '#059669' }}><FiMapPin /> Parcels in {item.label}</div>
          {distParcels.map(p => {
            const sc = STATUS_CFG[p.status] || STATUS_CFG.Active
            return (
              <button key={p.id} className="sd-parcel-row" onClick={() => onSelectResult(p)}>
                <span className="sd-parcel-name">{p.name}</span>
                <span className="sd-parcel-meta">{p.parish} · {p.acreage} ac</span>
                <span className="sd-parcel-status" style={{ color: sc.color }}>{p.status}</span>
                <FiArrowRight className="sd-parcel-arrow" />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ── Hierarchy node detail (deanery / parish / subparish / outstation) ── */
function HierarchyDetail({ item, parcels, onBack, onSelectResult }) {
  const color = TYPE_COLOR[item.type] || '#64748b'
  const Icon  = TYPE_ICON[item.type]  || FiLayers

  // find related parcels
  const related = parcels.filter(p => {
    if (item.type === 'deanery')    return p.deanery === item.label
    if (item.type === 'parish')     return p.parish === item.label
    if (item.type === 'subparish')  return false // no direct field
    if (item.type === 'outstation') return p.outstation === item.label
    return false
  })

  const metaRows = item.type === 'deanery'    ? [['Diocese', item.diocese], ['Parishes', item.parishes?.join(', ')]]
    : item.type === 'parish'    ? [['Deanery', item.deanery], ['Subparishes', item.subparishes?.join(', ')]]
    : item.type === 'subparish' ? [['Parish', item.parish], ['Outstations', item.outstations?.join(', ')]]
    : item.type === 'outstation'? [['Subparish', item.subparish], ['Parish', item.parish]]
    : []

  return (
    <div className="sd-page">
      <button className="sd-back" onClick={onBack}><FiArrowLeft /> Back to results</button>
      <div className="sd-generic-hero" style={{ '--gc': color }}>
        <div className="sd-generic-icon" style={{ background: color + '18', color }}><Icon /></div>
        <div>
          <div className="sd-generic-type">{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</div>
          <h2 className="sd-generic-title">{item.label}</h2>
          {related.length > 0 && <p className="sd-generic-sub">{related.length} related parcel{related.length !== 1 ? 's' : ''}</p>}
        </div>
      </div>
      <div className="sd-grid">
        <InfoCard title="Details" icon={Icon} color={color} rows={metaRows} />
        {related.length > 0 && (
          <div className="sd-card" style={{ gridColumn: '1 / -1' }}>
            <div className="sd-card-head" style={{ color: '#059669' }}><FiMapPin /> Related Parcels</div>
            {related.map(p => {
              const sc = STATUS_CFG[p.status] || STATUS_CFG.Active
              return (
                <button key={p.id} className="sd-parcel-row" onClick={() => onSelectResult(p)}>
                  <span className="sd-parcel-name">{p.name}</span>
                  <span className="sd-parcel-meta">{p.district} · {p.acreage} ac</span>
                  <span className="sd-parcel-status" style={{ color: sc.color }}>{p.status}</span>
                  <FiArrowRight className="sd-parcel-arrow" />
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Category / Status / Tenure detail ── */
function GroupDetail({ item, parcels, onBack, onSelectResult }) {
  const color = TYPE_COLOR[item.type] || '#64748b'
  const Icon  = TYPE_ICON[item.type]  || FiGrid

  const related = parcels.filter(p =>
    item.type === 'category' ? p.category === item.label
    : item.type === 'status' ? p.status === item.label
    : p.tenureType === item.label
  )

  return (
    <div className="sd-page">
      <button className="sd-back" onClick={onBack}><FiArrowLeft /> Back to results</button>
      <div className="sd-generic-hero" style={{ '--gc': color }}>
        <div className="sd-generic-icon" style={{ background: color + '18', color }}><Icon /></div>
        <div>
          <div className="sd-generic-type">{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</div>
          <h2 className="sd-generic-title">{item.label}</h2>
          <p className="sd-generic-sub">{related.length} parcel{related.length !== 1 ? 's' : ''}</p>
        </div>
      </div>
      <div className="sd-card" style={{ marginTop: 0 }}>
        <div className="sd-card-head" style={{ color }}><Icon /> All {item.label} Parcels</div>
        {related.map(p => {
          const sc = STATUS_CFG[p.status] || STATUS_CFG.Active
          return (
            <button key={p.id} className="sd-parcel-row" onClick={() => onSelectResult(p)}>
              <span className="sd-parcel-name">{p.name}</span>
              <span className="sd-parcel-meta">{p.district} · {p.parish} · {p.acreage} ac</span>
              <span className="sd-parcel-status" style={{ color: sc.color }}>{p.status}</span>
              <FiArrowRight className="sd-parcel-arrow" />
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ── Page detail ── */
function PageDetail({ item, onBack, onNavigate }) {
  const Icon = item.icon
  return (
    <div className="sd-page">
      <button className="sd-back" onClick={onBack}><FiArrowLeft /> Back to results</button>
      <div className="sd-page-card">
        <div className="sd-page-icon"><Icon /></div>
        <div className="sd-page-info">
          <h2 className="sd-page-title">{item.label}</h2>
          <p className="sd-page-desc">{item.desc}</p>
        </div>
        <button className="sd-page-btn" onClick={() => onNavigate(item.page)}>
          Go to {item.label} <FiArrowRight />
        </button>
      </div>
    </div>
  )
}

/* ── Root export ── */
export default function SearchDetailPage({ item, parcels, onBack, onNavigate, onSelectResult }) {
  if (item.type === 'page')
    return <PageDetail item={item} onBack={onBack} onNavigate={onNavigate} />

  if (item.type === 'parcel')
    return <ParcelDetail parcel={item} onBack={onBack} />

  if (item.type === 'district')
    return <DistrictDetail item={item} parcels={parcels} onBack={onBack} onSelectResult={onSelectResult} />

  if (['deanery','parish','subparish','outstation'].includes(item.type))
    return <HierarchyDetail item={item} parcels={parcels} onBack={onBack} onSelectResult={onSelectResult} />

  if (['category','status','tenure'].includes(item.type))
    return <GroupDetail item={item} parcels={parcels} onBack={onBack} onSelectResult={onSelectResult} />

  return null
}
