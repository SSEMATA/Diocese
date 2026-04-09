import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  FiMapPin,
  FiLayers,
  FiBarChart2,
  FiAlertTriangle,
  FiActivity,
  FiClipboard,
  FiFileText,
  FiStar,
  FiCheck,
  FiX,
  FiBriefcase,
  FiGlobe,
  FiPlusCircle,
  FiEdit2,
  FiCheckCircle,
  FiBookmark,
  FiEye,
} from 'react-icons/fi'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PieController,
  Filler,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import DiocesanMap from './maps/DiocesanMap.jsx'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PieController,
  Filler,
)

function Dashboard({ parcels, categories, statuses, districts, onNavigateToPage }) {
  const [showAllIssues, setShowAllIssues] = useState(false)
  const [showAllDistricts, setShowAllDistricts] = useState(false)

  const totalParcels = parcels.length
  const landWithTitles = parcels.filter((p) => p.tenureType === 'Freehold').length
  const landWithoutTitles = parcels.filter((p) => p.tenureType !== 'Freehold').length
  const churchInstitutions = parcels.filter((p) => p.category === 'Commission / Institution').length
  const districtsCovered = new Set(parcels.map((parcel) => parcel.district)).size
  const activeParcels = parcels.filter((p) => p.status === 'Active').length
  const reservedParcels = parcels.filter((p) => p.status === 'Reserved').length

  const activities = [
    { date: '23 Apr 2026', time: '09:14 AM', activity: 'Added new land parcel for St. Francis Parish', user: 'Admin', type: 'add' },
    { date: '22 Apr 2026', time: '02:30 PM', activity: 'Updated tenure type for Treasury Compound', user: 'Treasury', type: 'edit' },
    { date: '20 Apr 2026', time: '11:05 AM', activity: 'Survey completed for Education Center lands', user: 'Survey Team', type: 'survey' },
    { date: '18 Apr 2026', time: '04:20 PM', activity: 'Reserved Youth Center Plot for development', user: 'Admin', type: 'reserve' },
    { date: '16 Apr 2026', time: '10:00 AM', activity: 'Reviewed parish land boundaries in Kabarole', user: 'Land Officer', type: 'review' },
    { date: '14 Apr 2026', time: '03:15 PM', activity: 'Updated contact details for Our Lady Parish', user: 'Admin', type: 'edit' },
    { date: '12 Apr 2026', time: '08:45 AM', activity: 'New survey request submitted for Bundibugyo', user: 'Survey Team', type: 'survey' },
  ]

  const recentActivities = activities.slice(0, 4)

  const issues = [
    { outstation: 'Outstation 1', village: 'Kicwamba', parish: 'St. Francis', issue: 'Boundary dispute', status: 'Pending' },
    { outstation: 'Outstation 2', village: 'Kyarumba', parish: 'Our Lady', issue: 'Tenure review', status: 'In progress' },
    { outstation: 'Outstation 3', village: 'Kicwamba', parish: 'St. John', issue: 'Ownership conflict', status: 'Pending' },
    { outstation: 'Outstation 4', village: 'Rwebisengo', parish: 'St. Peter', issue: 'Survey documentation', status: 'Pending' },
  ]

  const pendingIssues = issues.filter((issue) => issue.status.toLowerCase().includes('pending')).length

  const categoryData = useMemo(() => {
    const categoryCounts = categories.map((category) =>
      parcels.filter((p) => p.category === category).length,
    )

    return {
      labels: categories,
      datasets: [
        {
          label: 'Parcels by Category',
          data: categoryCounts,
          backgroundColor: ['rgba(59, 130, 246, 0.85)', 'rgba(34, 197, 94, 0.85)', 'rgba(249, 115, 22, 0.85)'],
          borderColor: ['rgba(59, 130, 246, 1)', 'rgba(34, 197, 94, 1)', 'rgba(249, 115, 22, 1)'],
          borderWidth: 1,
        },
      ],
    }
  }, [parcels, categories])

  const statusData = useMemo(() => {
    const statusCounts = statuses.map((status) =>
      parcels.filter((p) => p.status === status).length,
    )

    return {
      labels: statuses,
      datasets: [
        {
          label: 'Parcels by Status',
          data: statusCounts,
          backgroundColor: ['rgba(34, 197, 94, 0.85)', 'rgba(249, 115, 22, 0.85)', 'rgba(239, 68, 68, 0.85)'],
          borderColor: ['rgba(34, 197, 94, 1)', 'rgba(249, 115, 22, 1)', 'rgba(239, 68, 68, 1)'],
          borderWidth: 1,
        },
      ],
    }
  }, [parcels, statuses])

  const districtData = useMemo(() => {
    const districts = [...new Set(parcels.map((p) => p.district))]
    const districtCounts = districts.map((district) =>
      parcels.filter((p) => p.district === district).length,
    )

    return {
      labels: districts,
      datasets: [
        {
          label: 'Parcels by District',
          data: districtCounts,
          backgroundColor: 'rgba(79, 70, 229, 0.85)',
          borderColor: 'rgba(79, 70, 229, 1)',
          borderWidth: 1,
        },
      ],
    }
  }, [parcels])

  const recentParcels = parcels.slice(-5).reverse()

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  }

  return (
    <div className="dashboard-page">
      <section className="dashboard-intro-card">
        <div className="intro-content">
          <p className="eyebrow">Church Land Management</p>
          <h1>Fort Portal Diocese Dashboard</h1>
          <p>Monitor land holdings, parish assets, survey updates, and attention items all in one place.</p>
        </div>
      </section>

      <div className="summary-panels">
        <div className="summary-card summary-card-primary">
          <div className="summary-card-icon">
            <FiMapPin />
          </div>
          <div>
            <p>Total Land Parcels</p>
            <h2>{totalParcels}</h2>
          </div>
        </div>

        <div className="summary-card summary-card-alt-1">
          <div className="summary-card-icon summary-card-icon-check">
            <FiCheck />
          </div>
          <div>
            <p>Land With Titles</p>
            <h2>{landWithTitles}</h2>
          </div>
        </div>

        <div className="summary-card summary-card-alt-2">
          <div className="summary-card-icon summary-card-icon-x">
            <FiX />
          </div>
          <div>
            <p>Land Without Titles</p>
            <h2>{landWithoutTitles}</h2>
          </div>
        </div>

        <div className="summary-card summary-card-alt-4">
          <div className="summary-card-icon summary-card-icon-globe">
            <FiGlobe />
          </div>
          <div>
            <p>Districts Covered</p>
            <h2>{districtsCovered}</h2>
          </div>
        </div>
      </div>

      <section className="panel panel-modern panel-attention">
        <div className="panel-header">
          <div className="panel-header-content">
            <div className="panel-header-icon">
              <FiAlertTriangle />
            </div>
            <div>
              <h3>Issues Requiring Attention</h3>
              <p>Critical land concerns that need immediate resolution</p>
            </div>
          </div>
          <div className="panel-header-actions">
            <div className="stat-badge">
              <span className="stat-number">{pendingIssues}</span>
              <span className="stat-label">Pending</span>
            </div>
            <button
              type="button"
              className="view-all-issues-btn"
              onClick={() => setShowAllIssues(true)}
            >
              <FiClipboard />
              View All Issues
            </button>
          </div>
        </div>

        <div className="issues-grid">
          {issues.map((issue) => (
            <div key={`${issue.outstation}-${issue.issue}`} className="issue-card">
              <div className="issue-card-header">
                <div className="issue-location">
                  <span className="issue-outstation">{issue.outstation}</span>
                  <span className="issue-village">{issue.village}</span>
                </div>
                <span className={`issue-status ${issue.status.toLowerCase().replace(' ', '-')}`}>
                  {issue.status}
                </span>
              </div>
              <div className="issue-details">
                <p className="issue-description">{issue.issue}</p>
                <p className="issue-parish">{issue.parish}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Issues Modal */}
      {showAllIssues &&
        createPortal(
          <div className="modal-overlay" onClick={() => setShowAllIssues(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-header-content">
                  <div className="modal-header-icon">
                    <FiAlertTriangle />
                  </div>
                  <div>
                    <h2>All Issues Requiring Attention</h2>
                    <p>Complete list of critical land concerns that need immediate resolution</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setShowAllIssues(false)}
                >
                  ×
                </button>
              </div>

              <div className="modal-body">
                <div className="issues-grid-modal">
                  {issues.map((issue) => (
                    <div key={`${issue.outstation}-${issue.issue}`} className="issue-card-modal">
                      <div className="issue-card-header">
                        <div className="issue-location">
                          <span className="issue-outstation">{issue.outstation}</span>
                          <span className="issue-village">{issue.village}</span>
                        </div>
                        <span className={`issue-status ${issue.status.toLowerCase().replace(' ', '-')}`}>
                          {issue.status}
                        </span>
                      </div>
                      <div className="issue-details">
                        <p className="issue-description">{issue.issue}</p>
                        <p className="issue-parish">{issue.parish}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}

      <div className="panel-grid">
        <div className="panel-stack">
          <section className="panel panel-medium map-panel">
            <div className="panel-header">
              <div>
                <h3>Location Overview</h3>
                <p>Diocese land parcels across 8 districts</p>
              </div>
            </div>
            <DiocesanMap parcels={parcels} />
          </section>
        </div>
      </div>

      <div className="charts-section">
        <div className="chart-container chart-combined full-width">
          <div className="combined-half">
            <div className="category-chart-header">
              <div>
                <h3>Parcels by Category</h3>
                <p className="category-chart-sub">Distribution across land types</p>
              </div>
              <span className="category-total-badge">{totalParcels} total</span>
            </div>
            <div className="category-donut-wrap">
              <svg viewBox="0 0 120 120" className="category-donut-svg">
                {(() => {
                  const COLORS = ['#3b82f6', '#22c55e', '#f97316']
                  const counts = categories.map((cat) => parcels.filter((p) => p.category === cat).length)
                  const total = counts.reduce((a, b) => a + b, 0) || 1
                  const r = 46, cx = 60, cy = 60
                  const circumference = 2 * Math.PI * r
                  let offset = 0
                  return counts.map((count, i) => {
                    const dash = (count / total) * circumference
                    const el = (
                      <circle key={categories[i]} cx={cx} cy={cy} r={r} fill="none"
                        stroke={COLORS[i % COLORS.length]} strokeWidth="14"
                        strokeDasharray={`${dash} ${circumference - dash}`}
                        strokeDashoffset={-offset} strokeLinecap="butt"
                        style={{ transition: 'stroke-dasharray 0.6s ease' }}
                      />
                    )
                    offset += dash
                    return el
                  })
                })()}
                <text x="60" y="56" textAnchor="middle" className="donut-center-num">{totalParcels}</text>
                <text x="60" y="68" textAnchor="middle" className="donut-center-label">parcels</text>
              </svg>
            </div>
            <div className="category-rows">
              {(() => {
                const COLORS = ['#3b82f6', '#22c55e', '#f97316']
                const BG = ['rgba(59,130,246,0.1)', 'rgba(34,197,94,0.1)', 'rgba(249,115,22,0.1)']
                const counts = categories.map((cat) => parcels.filter((p) => p.category === cat).length)
                const total = counts.reduce((a, b) => a + b, 0) || 1
                return categories.map((cat, i) => (
                  <div key={cat} className="category-row">
                    <div className="category-row-top">
                      <div className="category-row-label">
                        <span className="category-dot" style={{ background: COLORS[i] }} />
                        <span>{cat}</span>
                      </div>
                      <div className="category-row-right">
                        <span className="category-count" style={{ color: COLORS[i], background: BG[i] }}>{counts[i]}</span>
                        <span className="category-pct">{Math.round((counts[i] / total) * 100)}%</span>
                      </div>
                    </div>
                    <div className="category-bar-track">
                      <div className="category-bar-fill" style={{ width: `${(counts[i] / total) * 100}%`, background: COLORS[i] }} />
                    </div>
                  </div>
                ))
              })()}
            </div>
          </div>

          <div className="combined-divider" />

          <div className="combined-half">
            <div className="category-chart-header">
              <div>
                <h3>Parcels by Status</h3>
                <p className="category-chart-sub">Active, reserved and inactive land</p>
              </div>
              <span className="category-total-badge">{totalParcels} total</span>
            </div>
            <div className="category-donut-wrap">
              <svg viewBox="0 0 120 120" className="category-donut-svg">
                {(() => {
                  const COLORS = ['#22c55e', '#f97316', '#ef4444']
                  const counts = statuses.map((s) => parcels.filter((p) => p.status === s).length)
                  const total = counts.reduce((a, b) => a + b, 0) || 1
                  const r = 46, cx = 60, cy = 60
                  const circumference = 2 * Math.PI * r
                  let offset = 0
                  return counts.map((count, i) => {
                    const dash = (count / total) * circumference
                    const el = (
                      <circle key={statuses[i]} cx={cx} cy={cy} r={r} fill="none"
                        stroke={COLORS[i % COLORS.length]} strokeWidth="14"
                        strokeDasharray={`${dash} ${circumference - dash}`}
                        strokeDashoffset={-offset} strokeLinecap="butt"
                        style={{ transition: 'stroke-dasharray 0.6s ease' }}
                      />
                    )
                    offset += dash
                    return el
                  })
                })()}
                <text x="60" y="56" textAnchor="middle" className="donut-center-num">{totalParcels}</text>
                <text x="60" y="68" textAnchor="middle" className="donut-center-label">parcels</text>
              </svg>
            </div>
            <div className="category-rows">
              {(() => {
                const COLORS = ['#22c55e', '#f97316', '#ef4444']
                const BG = ['rgba(34,197,94,0.1)', 'rgba(249,115,22,0.1)', 'rgba(239,68,68,0.1)']
                const counts = statuses.map((s) => parcels.filter((p) => p.status === s).length)
                const total = counts.reduce((a, b) => a + b, 0) || 1
                return statuses.map((s, i) => (
                  <div key={s} className="category-row">
                    <div className="category-row-top">
                      <div className="category-row-label">
                        <span className="category-dot" style={{ background: COLORS[i] }} />
                        <span>{s}</span>
                      </div>
                      <div className="category-row-right">
                        <span className="category-count" style={{ color: COLORS[i], background: BG[i] }}>{counts[i]}</span>
                        <span className="category-pct">{Math.round((counts[i] / total) * 100)}%</span>
                      </div>
                    </div>
                    <div className="category-bar-track">
                      <div className="category-bar-fill" style={{ width: `${(counts[i] / total) * 100}%`, background: COLORS[i] }} />
                    </div>
                  </div>
                ))
              })()}
            </div>
          </div>
        </div>

        <div className="chart-container district-card full-width">
          <div className="district-card-header">
            <div>
              <h3>Parcels by District</h3>
              <p className="category-chart-sub">Coverage across all 8 diocese districts in Western Uganda</p>
            </div>
            <div className="district-header-right">
              <span className="category-total-badge">{totalParcels} parcels</span>
              <span className="category-total-badge">{districts.length} districts</span>
            </div>
          </div>
          <div className="district-hbar-list">
            {(() => {
              const RANK_COLORS = [
                { bar: 'linear-gradient(90deg,#f59e0b,#fbbf24)', badge: '#fef3c7', text: '#92400e', rank: '1' },
                { bar: 'linear-gradient(90deg,#94a3b8,#cbd5e1)', badge: '#f1f5f9', text: '#475569', rank: '2' },
                { bar: 'linear-gradient(90deg,#f97316,#fb923c)', badge: '#fff7ed', text: '#9a3412', rank: '3' },
              ]
              const DEFAULT = { bar: 'linear-gradient(90deg,#2563eb,#60a5fa)', badge: '#eff6ff', text: '#1d4ed8', rank: null }
              const rows = districts
                .map((d) => ({
                  name: d,
                  count: parcels.filter((p) => p.district === d).length,
                  acreage: parcels.filter((p) => p.district === d).reduce((s, p) => s + (p.acreage || 0), 0),
                }))
                .sort((a, b) => b.count - a.count)
              const max = rows[0]?.count || 1
              const visibleRows = showAllDistricts ? rows : rows.slice(0, 3)
              return (
                <>
                  {visibleRows.map(({ name, count, acreage }, i) => {
                    const style = RANK_COLORS[i] || DEFAULT
                    return (
                      <div key={name} className="district-hbar-row">
                        <div className="district-hbar-meta">
                          <span
                            className="district-hbar-rank"
                            style={style.rank ? { background: style.badge, color: style.text, border: `1px solid ${style.text}33` } : {}}
                          >
                            {i + 1}
                          </span>
                          <span className="district-hbar-label">{name}</span>
                        </div>
                        <div className="district-hbar-track">
                          <div className="district-hbar-fill" style={{ width: `${(count / max) * 100}%`, background: style.bar }} />
                        </div>
                        <div className="district-hbar-stats">
                          <span className="district-hbar-count" style={{ background: style.badge, color: style.text }}>
                            {count} {count === 1 ? 'parcel' : 'parcels'}
                          </span>
                          <span className="district-hbar-acreage">{acreage.toFixed(1)} ac</span>
                        </div>
                      </div>
                    )
                  })}
                  <button
                    type="button"
                    className="district-view-more-btn"
                    onClick={() => setShowAllDistricts(!showAllDistricts)}
                  >
                    {showAllDistricts ? 'Show Less' : `View More (${rows.length - 3} more districts)`}
                  </button>
                </>
              )
            })()}
          </div>
        </div>
      </div>

      <section className="activity-section">
        <div className="activity-section-header">
          <div className="activity-section-title">
            <div className="activity-section-icon"><FiActivity /></div>
            <div>
              <h3>Recent Activities</h3>
              <p>Latest updates from parish managers and survey teams</p>
            </div>
          </div>
          <button type="button" className="activity-view-all-btn">View all</button>
        </div>

        <div className="activity-timeline">
          {recentActivities.map((item, i) => {
            const TYPE_CONFIG = {
              add:     { icon: <FiPlusCircle />,  bg: '#eff6ff', color: '#2563eb', label: 'Added' },
              edit:    { icon: <FiEdit2 />,       bg: '#faf5ff', color: '#7c3aed', label: 'Updated' },
              survey:  { icon: <FiCheckCircle />, bg: '#f0fdf4', color: '#16a34a', label: 'Survey' },
              reserve: { icon: <FiBookmark />,    bg: '#fff7ed', color: '#ea580c', label: 'Reserved' },
              review:  { icon: <FiEye />,         bg: '#fefce8', color: '#ca8a04', label: 'Reviewed' },
            }
            const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.edit
            const initials = item.user.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
            return (
              <div key={item.date + item.user} className="activity-item">
                <div className="activity-timeline-left">
                  <div className="activity-type-icon" style={{ background: cfg.bg, color: cfg.color }}>
                    {cfg.icon}
                  </div>
                  {i < recentActivities.length - 1 && <div className="activity-connector" />}
                </div>
                <div className="activity-item-body">
                  <div className="activity-item-top">
                    <span className="activity-type-badge" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                    <span className="activity-time">{item.date} · {item.time}</span>
                  </div>
                  <p className="activity-text">{item.activity}</p>
                  <div className="activity-user">
                    <div className="activity-avatar">{initials}</div>
                    <span>{item.user}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}

export default Dashboard