import {
  FiMapPin, FiLayers, FiFileText, FiUser,
  FiCalendar, FiCheckCircle, FiAlertCircle, FiClock,
  FiMap, FiHash, FiMaximize2,
} from 'react-icons/fi'
import ParcelMap from '../components/maps/ParcelMap.jsx'

const STATUS_CONFIG = {
  Active:   { cls: 'pd-status-active',   icon: FiCheckCircle },
  Inactive: { cls: 'pd-status-inactive', icon: FiAlertCircle },
  Reserved: { cls: 'pd-status-reserved', icon: FiClock },
}

const CATEGORY_CLS = {
  'Parish land':              'pd-cat-parish',
  'Treasury land':            'pd-cat-treasury',
  'Commission / Institution': 'pd-cat-commission',
}

const TENURE_CLS = {
  Freehold:  'pd-tenure-freehold',
  Lease:     'pd-tenure-lease',
  Customary: 'pd-tenure-customary',
}

function Badge({ label, cls = '', icon: Icon }) {
  return (
    <span className={`pd-badge ${cls}`}>
      {Icon && <Icon />} {label}
    </span>
  )
}

function InfoRow({ label, value, icon: Icon }) {
  return (
    <div className="pd-info-row">
      <span className="pd-info-label">
        {Icon && <Icon />} {label}
      </span>
      <span className="pd-info-value">{value || '—'}</span>
    </div>
  )
}

function Section({ title, icon: Icon, colorCls = 'pd-sec-blue', children }) {
  return (
    <div className="pd-section">
      <div className="pd-section-head">
        <span className={`pd-section-icon ${colorCls}`}><Icon /></span>
        <span className="pd-section-title">{title}</span>
      </div>
      <div className="pd-section-body">{children}</div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="pd-empty">
      <div className="pd-empty-icon"><FiMapPin /></div>
      <h3>No parcel selected</h3>
      <p>Select a parcel from the Land Records to view its details here.</p>
    </div>
  )
}

function LandDetailPage({ parcel }) {
  if (!parcel) return <div className="pd-page"><EmptyState /></div>

  const status     = STATUS_CONFIG[parcel.status]   || STATUS_CONFIG.Active
  const categoryCls = CATEGORY_CLS[parcel.category]  || ''
  const tenureCls   = TENURE_CLS[parcel.tenureType]  || ''
  const StatusIcon  = status.icon

  return (
    <div className="pd-page">

      {/* ── Hero ── */}
      <div className="pd-hero">
        <div className="pd-hero-left">
          <div className="pd-hero-badges">
            <Badge label={parcel.status}   cls={status.cls}  icon={StatusIcon} />
            <Badge label={parcel.category} cls={categoryCls} />
            <Badge label={parcel.deanery}  cls="pd-badge-muted" />
          </div>
          <h2 className="pd-hero-title">{parcel.name}</h2>
          <p className="pd-hero-location">
            <FiMapPin />
            {[parcel.village, parcel.parish, parcel.subcounty, parcel.county, parcel.district]
              .filter(Boolean).join(' · ')}
          </p>
        </div>

        <div className="pd-hero-right">
          <div className="pd-kpi">
            <span className="pd-kpi-num">{parcel.acreage}</span>
            <span className="pd-kpi-unit">acres</span>
          </div>
          <span className="pd-kpi-label">Total Area</span>
        </div>
      </div>

      {/* ── Grid ── */}
      <div className="pd-grid">

        <Section title="Property" icon={FiHash} colorCls="pd-sec-blue">
          <InfoRow label="Parcel ID"    value={parcel.id}       icon={FiHash} />
          <InfoRow label="Category"     value={parcel.category} icon={FiLayers} />
          <InfoRow label="Status"       value={parcel.status}   icon={FiCheckCircle} />
          <InfoRow label="Acreage"      value={`${parcel.acreage} acres`} icon={FiMaximize2} />
          <InfoRow label="Acquired"     value={parcel.acquisition} icon={FiCalendar} />
          <InfoRow label="Last Survey"  value={parcel.lastSurvey}  icon={FiCalendar} />
        </Section>

        <Section title="Location" icon={FiMapPin} colorCls="pd-sec-green">
          <InfoRow label="District"   value={parcel.district}   icon={FiMapPin} />
          <InfoRow label="County"     value={parcel.county}     icon={FiMapPin} />
          <InfoRow label="Subcounty"  value={parcel.subcounty}  icon={FiMapPin} />
          <InfoRow label="Village"    value={parcel.village}    icon={FiMapPin} />
          <InfoRow label="Parish"     value={parcel.parish}     icon={FiMapPin} />
          <InfoRow label="Outstation" value={parcel.outstation} icon={FiMapPin} />
          <InfoRow label="Deanery"    value={parcel.deanery}    icon={FiLayers} />
        </Section>

        <Section title="Tenure & Lease" icon={FiFileText} colorCls="pd-sec-purple">
          <div className="pd-tenure-badge-wrap">
            <Badge label={parcel.tenureType} cls={tenureCls} />
          </div>
          <InfoRow label="Tenure Type" value={parcel.tenureType} icon={FiFileText} />
          <InfoRow label="Lease Type"  value={parcel.leaseType}  icon={FiFileText} />
          <InfoRow label="Tenant"      value={parcel.tenant}     icon={FiUser} />
          <InfoRow label="Contact"     value={parcel.contact}    icon={FiUser} />
        </Section>

        {/* Map */}
        <div className="pd-section pd-map-section">
          <div className="pd-section-head">
            <span className="pd-section-icon pd-sec-cyan"><FiMap /></span>
            <span className="pd-section-title">Location Map — {parcel.district}</span>
          </div>
          <ParcelMap parcel={parcel} />
        </div>

        {/* Remarks — full width */}
        <div className="pd-section pd-remarks">
          <div className="pd-section-head">
            <span className="pd-section-icon pd-sec-amber"><FiFileText /></span>
            <span className="pd-section-title">Remarks</span>
          </div>
          <div className="pd-section-body">
            <p className="pd-remarks-text">{parcel.remarks || 'No remarks recorded.'}</p>
          </div>
        </div>

      </div>
    </div>
  )
}

export default LandDetailPage
