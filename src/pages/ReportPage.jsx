import { useMemo, useRef } from 'react'
import {
  FiPrinter, FiDownload, FiMapPin, FiLayers,
  FiCheckCircle, FiClock, FiAlertCircle, FiFileText,
  FiTrendingUp, FiGrid,
} from 'react-icons/fi'
import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'

/* ── helpers ── */
function pct(n, total) { return total ? Math.round((n / total) * 100) : 0 }

const STATUS_CFG = {
  Active:   { color: '#059669', bg: '#f0fdf4', border: '#bbf7d0', icon: FiCheckCircle },
  Reserved: { color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: FiClock },
  Inactive: { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', icon: FiAlertCircle },
}

const CAT_COLORS  = ['#2563eb', '#7c3aed', '#0891b2']
const STAT_COLORS = ['#059669', '#d97706', '#dc2626']
const TEN_COLORS  = ['#2563eb', '#f97316', '#8b5cf6']

function DonutChart({ slices, total, label }) {
  const r = 46, cx = 60, cy = 60
  const circ = 2 * Math.PI * r
  let offset = 0
  return (
    <svg viewBox="0 0 120 120" className="rp-donut">
      {slices.map(({ value, color }, i) => {
        const dash = (value / (total || 1)) * circ
        const el = (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={color} strokeWidth="14"
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeDashoffset={-offset} strokeLinecap="butt" />
        )
        offset += dash
        return el
      })}
      <text x="60" y="55" textAnchor="middle" className="rp-donut-num">{total}</text>
      <text x="60" y="68" textAnchor="middle" className="rp-donut-label">{label}</text>
    </svg>
  )
}

function HBar({ label, value, max, color, count, acreage }) {
  return (
    <div className="rp-hbar-row">
      <span className="rp-hbar-label">{label}</span>
      <div className="rp-hbar-track">
        <div className="rp-hbar-fill" style={{ width: `${(value / (max || 1)) * 100}%`, background: color }} />
      </div>
      <span className="rp-hbar-count" style={{ color }}>{count}</span>
      <span className="rp-hbar-acreage">{acreage.toFixed(1)} ac</span>
    </div>
  )
}

export default function ReportPage({ parcels, categories, statuses, districts }) {
  const printRef = useRef()
  const total = parcels.length
  const totalAcreage = parcels.reduce((s, p) => s + (p.acreage || 0), 0)

  /* computed */
  const byCat = useMemo(() =>
    categories.map((c, i) => ({
      label: c, color: CAT_COLORS[i] || '#64748b',
      count: parcels.filter(p => p.category === c).length,
      acreage: parcels.filter(p => p.category === c).reduce((s, p) => s + p.acreage, 0),
    })), [parcels, categories])

  const byStat = useMemo(() =>
    statuses.map((s, i) => ({
      label: s, color: STAT_COLORS[i] || '#64748b',
      count: parcels.filter(p => p.status === s).length,
    })), [parcels, statuses])

  const byTenure = useMemo(() => {
    const types = [...new Set(parcels.map(p => p.tenureType))]
    return types.map((t, i) => ({
      label: t, color: TEN_COLORS[i] || '#64748b',
      count: parcels.filter(p => p.tenureType === t).length,
    }))
  }, [parcels])

  const byDistrict = useMemo(() =>
    districts.map(d => ({
      name: d,
      count: parcels.filter(p => p.district === d).length,
      acreage: parcels.filter(p => p.district === d).reduce((s, p) => s + p.acreage, 0),
    })).sort((a, b) => b.count - a.count),
  [parcels, districts])

  const maxDistCount = byDistrict[0]?.count || 1

  const handlePrint = () => window.print()

  const exportToPDF = () => {
    try {
      const doc = new jsPDF()
      doc.setFontSize(18)
      doc.text('Land Registry Report - Fort Portal Diocese', 20, 20)
      doc.setFontSize(12)
      doc.text(`Generated on: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`, 20, 30)

      // KPI Description
      doc.setFontSize(14)
      doc.text('Key Performance Indicators (KPIs)', 20, 50)
      doc.setFontSize(10)
      const kpiDesc = `The following table summarizes the key metrics for the diocesan land registry. These indicators provide a quick overview of the land holdings, including total parcels, acreage, status distribution, and geographical coverage.`
      const lines = doc.splitTextToSize(kpiDesc, 170)
      doc.text(lines, 20, 60)

      // KPI Table as text
      let y = 80 + lines.length * 5
      doc.setFontSize(12)
      doc.text('KPI Table:', 20, y)
      y += 10
      doc.setFontSize(9)
      const kpis = [
        ['Total Parcels', total.toString(), 'Total number of land parcels in the registry'],
        ['Total Acreage', `${totalAcreage.toFixed(1)} acres`, 'Combined acreage of all parcels'],
        ['Active Parcels', parcels.filter(p => p.status === 'Active').length.toString(), 'Parcels currently in active use'],
        ['Reserved Parcels', parcels.filter(p => p.status === 'Reserved').length.toString(), 'Parcels set aside for future use'],
        ['Districts Covered', districts.length.toString(), 'Number of administrative districts with parcels'],
        ['Land Categories', categories.length.toString(), 'Number of different land use categories']
      ]
      kpis.forEach(([metric, value, desc]) => {
        doc.text(`${metric}: ${value}`, 25, y)
        const descLines = doc.splitTextToSize(desc, 140)
        doc.text(descLines, 25, y + 5)
        y += 10 + descLines.length * 4
      })

      // Charts Description
      doc.setFontSize(14)
      doc.text('Land Distribution Analysis', 20, y + 10)
      doc.setFontSize(10)
      const chartDesc = `The land parcels are distributed across various categories, statuses, and tenure types. The analysis shows ${byCat.length} categories, with ${byCat[0]?.label} having the most parcels (${byCat[0]?.count}). Status-wise, ${byStat[0]?.label} parcels dominate at ${pct(byStat[0]?.count, total)}% of total. Tenure distribution indicates ${byTenure[0]?.label} as the primary type.`
      const chartLines = doc.splitTextToSize(chartDesc, 170)
      doc.text(chartLines, 20, y + 20)

      y += 30 + chartLines.length * 5

      // District Summary
      doc.setFontSize(12)
      doc.text('Parcels by District:', 20, y)
      doc.setFontSize(9)
      byDistrict.slice(0, 5).forEach((d, i) => {
        doc.text(`${d.name}: ${d.count} parcels (${d.acreage.toFixed(1)} acres)`, 30, y + 10 + i * 8)
      })

      y += 60

      // Table Description
      doc.setFontSize(14)
      doc.text('Detailed Parcel Listing', 20, y)
      doc.setFontSize(10)
      const tableDesc = `The following is a summary listing of all ${total} land parcels. For full details, refer to the system.`
      const tableLines = doc.splitTextToSize(tableDesc, 170)
      doc.text(tableLines, 20, y + 10)

      y += 20 + tableLines.length * 5

      // Parcel Summary
      doc.setFontSize(12)
      doc.text('Parcel Summary:', 20, y)
      doc.setFontSize(9)
      parcels.slice(0, 20).forEach((p, i) => { // Limit to first 20 for PDF length
        if (y > 250) {
          doc.addPage()
          y = 20
        }
        doc.text(`${i + 1}. ${p.name} (${p.district}, ${p.parish}) - ${p.category} - ${p.tenureType} - ${p.acreage} ac - ${p.status}`, 20, y)
        y += 8
      })
      if (parcels.length > 20) {
        doc.text(`... and ${parcels.length - 20} more parcels`, 20, y)
      }

      doc.save('land_registry_report.pdf')
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error generating PDF. Check console for details.')
    }
  }

  return (
    <div className="rp-page" ref={printRef}>

      {/* ── Header ── */}
      <div className="rp-header">
        <div className="rp-header-left">
          <span className="rp-eyebrow">Fort Portal Diocese</span>
          <h2 className="rp-title">Land Registry Report</h2>
          <p className="rp-subtitle">
            Summary of all diocesan land parcels across {districts.length} districts · Generated {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="rp-header-actions no-print">
          <button type="button" className="rp-btn-ghost" onClick={handlePrint}>
            <FiPrinter /> Print
          </button>
          <button type="button" className="rp-btn-primary" onClick={exportToPDF}>
            <FiDownload /> Export PDF
          </button>
        </div>
      </div>

      {/* ── KPI strip ── */}
      <div className="rp-kpis">
        {[
          { label: 'Total Parcels',  value: total,                                                  icon: FiGrid,        color: '#2563eb' },
          { label: 'Total Acreage',  value: `${totalAcreage.toFixed(1)} ac`,                        icon: FiMapPin,      color: '#7c3aed' },
          { label: 'Active Parcels', value: parcels.filter(p => p.status === 'Active').length,      icon: FiCheckCircle, color: '#059669' },
          { label: 'Reserved',       value: parcels.filter(p => p.status === 'Reserved').length,    icon: FiClock,       color: '#d97706' },
          { label: 'Districts',      value: districts.length,                                       icon: FiMapPin,      color: '#0891b2' },
          { label: 'Categories',     value: categories.length,                                      icon: FiLayers,      color: '#8b5cf6' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rp-kpi" style={{ '--kc': color }}>
            <span className="rp-kpi-icon"><Icon /></span>
            <span className="rp-kpi-value">{value}</span>
            <span className="rp-kpi-label">{label}</span>
          </div>
        ))}
      </div>

      {/* ── Description ── */}
      <div className="rp-description">
        <p>This comprehensive land registry report provides an overview of all diocesan land holdings. The summary statistics above highlight key metrics including total parcels, acreage, and distribution across different statuses and categories. The following visualizations offer detailed insights into land distribution patterns.</p>
      </div>

      {/* ── Charts row ── */}
      <div className="rp-charts">

        {/* Description */}
        <div className="rp-description rp-description-charts">
          <p>The charts below illustrate the distribution of land parcels by category (e.g., Parish land, Treasury land), status (Active, Reserved, Inactive), and tenure type (Freehold, Lease, Customary). The horizontal bar chart shows parcel counts by district, providing geographical insights.</p>
        </div>

        {/* Category donut */}
        <div className="rp-chart-card">
          <div className="rp-chart-head"><FiLayers /> By Category</div>
          <div className="rp-donut-wrap">
            <DonutChart slices={byCat.map(c => ({ value: c.count, color: c.color }))} total={total} label="parcels" />
          </div>
          <div className="rp-legend">
            {byCat.map(({ label, color, count }) => (
              <div key={label} className="rp-legend-row">
                <span className="rp-legend-dot" style={{ background: color }} />
                <span className="rp-legend-label">{label}</span>
                <span className="rp-legend-pct" style={{ color }}>{pct(count, total)}%</span>
                <span className="rp-legend-n">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status donut */}
        <div className="rp-chart-card">
          <div className="rp-chart-head"><FiCheckCircle /> By Status</div>
          <div className="rp-donut-wrap">
            <DonutChart slices={byStat.map(s => ({ value: s.count, color: s.color }))} total={total} label="parcels" />
          </div>
          <div className="rp-legend">
            {byStat.map(({ label, color, count }) => (
              <div key={label} className="rp-legend-row">
                <span className="rp-legend-dot" style={{ background: color }} />
                <span className="rp-legend-label">{label}</span>
                <span className="rp-legend-pct" style={{ color }}>{pct(count, total)}%</span>
                <span className="rp-legend-n">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tenure donut */}
        <div className="rp-chart-card">
          <div className="rp-chart-head"><FiFileText /> By Tenure</div>
          <div className="rp-donut-wrap">
            <DonutChart slices={byTenure.map(t => ({ value: t.count, color: t.color }))} total={total} label="parcels" />
          </div>
          <div className="rp-legend">
            {byTenure.map(({ label, color, count }) => (
              <div key={label} className="rp-legend-row">
                <span className="rp-legend-dot" style={{ background: color }} />
                <span className="rp-legend-label">{label}</span>
                <span className="rp-legend-pct" style={{ color }}>{pct(count, total)}%</span>
                <span className="rp-legend-n">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* District bar chart */}
        <div className="rp-chart-card rp-chart-wide">
          <div className="rp-chart-head"><FiTrendingUp /> Parcels by District</div>
          <div className="rp-hbar-list">
            {byDistrict.map(({ name, count, acreage }) => (
              <HBar key={name} label={name} value={count} max={maxDistCount}
                color="#2563eb" count={count} acreage={acreage} />
            ))}
          </div>
        </div>

      </div>

      {/* ── Full parcel table ── */}
      <div className="rp-table-card">
        <div className="rp-table-head">
          <span className="rp-chart-head"><FiFileText /> All Parcels — {total} records · {totalAcreage.toFixed(1)} total acres</span>
        </div>
        <div className="rp-description rp-description-table">
          <p>The table below lists all land parcels in detail, including parcel ID, name, location (district and parish), category, tenure type, acreage, status, and last survey date. This comprehensive listing enables detailed analysis and management of individual parcels.</p>
        </div>
        <div className="rp-table-wrap">
          <table className="rp-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Parcel Name</th>
                <th>District</th>
                <th>Parish</th>
                <th>Category</th>
                <th>Tenure</th>
                <th>Acreage</th>
                <th>Status</th>
                <th>Last Survey</th>
              </tr>
            </thead>
            <tbody>
              {parcels.map((p, i) => {
                const sc = STATUS_CFG[p.status] || STATUS_CFG.Active
                return (
                  <tr key={p.id}>
                    <td className="rp-td-num">{i + 1}</td>
                    <td>
                      <div className="rp-td-name">{p.name}</div>
                      <div className="rp-td-sub">{p.id} · {p.village}</div>
                    </td>
                    <td>{p.district}</td>
                    <td>{p.parish}</td>
                    <td>
                      <span className="rp-cat-chip" style={{ background: CAT_COLORS[categories.indexOf(p.category)] + '18', color: CAT_COLORS[categories.indexOf(p.category)] || '#64748b' }}>
                        {p.category}
                      </span>
                    </td>
                    <td>{p.tenureType}</td>
                    <td className="rp-td-acreage">{p.acreage} ac</td>
                    <td>
                      <span className="rp-status-chip" style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                        {p.status}
                      </span>
                    </td>
                    <td className="rp-td-date">{p.lastSurvey || '—'}</td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="rp-tfoot-row">
                <td colSpan="6" className="rp-tfoot-label">Total</td>
                <td className="rp-tfoot-val">{totalAcreage.toFixed(1)} ac</td>
                <td colSpan="2" />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="rp-footer">
        <div>Report generated by Fort Portal Diocese Land Management System</div>
        <div>Confidential Document - For Internal Use Only</div>
        <div>Page 1 of 1</div>
      </div>

    </div>
  )
}
