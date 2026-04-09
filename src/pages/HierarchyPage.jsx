import { useState } from 'react'
import {
  FiChevronRight, FiChevronDown,
  FiMapPin, FiLayers, FiHome, FiGrid, FiRadio,
} from 'react-icons/fi'

const LEVELS = [
  { key: 'diocese',    label: 'Diocese',    icon: FiLayers,  cls: 'hl-blue'   },
  { key: 'deanery',   label: 'Deanery',    icon: FiGrid,    cls: 'hl-purple'  },
  { key: 'parish',    label: 'Parish',     icon: FiHome,    cls: 'hl-green'   },
  { key: 'subparish', label: 'Subparish',  icon: FiMapPin,  cls: 'hl-amber'   },
  { key: 'outstation',label: 'Outstation', icon: FiRadio,   cls: 'hl-red'     },
]

function countAll(node) {
  let deaneries = 0, parishes = 0, subparishes = 0, outstations = 0
  for (const d of node.deaneries || []) {
    deaneries++
    for (const p of d.parishes || []) {
      parishes++
      for (const s of p.subparishes || []) {
        subparishes++
        outstations += (s.outstations || []).length
      }
    }
  }
  return { deaneries, parishes, subparishes, outstations }
}

function Node({ name, level, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  const lvl = LEVELS[level]
  const Icon = lvl.icon
  const hasChildren = children && children.length > 0

  return (
    <div className="hier-node">
      <button
        type="button"
        className={`hier-row hier-row-l${level} ${lvl.cls} ${open ? 'hier-row-open' : ''}`}
        onClick={() => hasChildren && setOpen(o => !o)}
      >
        <span className="hier-row-left">
          <span className={`hier-icon-wrap ${lvl.cls}`}><Icon /></span>
          <span className="hier-name">{name}</span>
          <span className={`hier-badge ${lvl.cls}`}>{lvl.label}</span>
        </span>
        {hasChildren && (
          <span className={`hier-chevron ${lvl.cls}`}>
            {open ? <FiChevronDown /> : <FiChevronRight />}
          </span>
        )}
      </button>

      {open && hasChildren && (
        <div className="hier-children">{children}</div>
      )}
    </div>
  )
}

function buildTree(hierarchy) {
  return hierarchy.map(diocese => (
    <Node key={diocese.name} name={diocese.name} level={0} defaultOpen>
      {(diocese.deaneries || []).map(deanery => (
        <Node key={deanery.name} name={deanery.name} level={1} defaultOpen>
          {(deanery.parishes || []).map(parish => (
            <Node key={parish.name} name={parish.name} level={2}>
              {(parish.subparishes || []).map(sub => (
                <Node key={sub.name} name={sub.name} level={3}>
                  {(sub.outstations || []).map(o => (
                    <Node key={o} name={o} level={4} />
                  ))}
                </Node>
              ))}
            </Node>
          ))}
        </Node>
      ))}
    </Node>
  ))
}

function HierarchyPage({ hierarchy }) {
  const stats = hierarchy.length ? countAll(hierarchy[0]) : {}

  const summary = [
    { label: 'Deaneries',   value: stats.deaneries,   icon: LEVELS[1].icon, cls: LEVELS[1].cls },
    { label: 'Parishes',    value: stats.parishes,    icon: LEVELS[2].icon, cls: LEVELS[2].cls },
    { label: 'Subparishes', value: stats.subparishes, icon: LEVELS[3].icon, cls: LEVELS[3].cls },
    { label: 'Outstations', value: stats.outstations, icon: LEVELS[4].icon, cls: LEVELS[4].cls },
  ]

  return (
    <div className="hier-page">

      {/* Header */}
      <div className="hier-header">
        <div className="hier-header-left">
          <span className="hier-eyebrow">Organisational Structure</span>
          <h2 className="hier-title">Church Hierarchy</h2>
          <p className="hier-subtitle">
            Browse the diocese from deaneries down to individual outstations.
          </p>
        </div>
        <div className="hier-stats">
          {summary.map(({ label, value, icon: Icon, cls }) => (
            <div key={label} className={`hier-stat ${cls}`}>
              <span className="hier-stat-icon"><Icon /></span>
              <span className="hier-stat-num">{value}</span>
              <span className="hier-stat-label">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="hier-legend">
        {LEVELS.map(({ label, cls, icon: Icon }) => (
          <span key={label} className={`hier-legend-item ${cls}`}>
            <Icon /> {label}
          </span>
        ))}
      </div>

      {/* Tree */}
      <div className="hier-tree">
        {buildTree(hierarchy)}
      </div>

    </div>
  )
}

export default HierarchyPage
