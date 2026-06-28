import { useState } from 'react'
import StepsTab    from './StepsTab.jsx'
import MaterialsTab from './MaterialsTab.jsx'
import VolumesTab  from './VolumesTab.jsx'
import QuantityTab from './QuantityTab.jsx'

const TABS = [
  { id: 'steps',     label: 'Steps'     },
  { id: 'materials', label: 'Materials' },
  { id: 'volumes',   label: 'Volumes'   },
  { id: 'quantity',  label: 'Quantity'  },
]

export default function ResultsPanel({ result, inputs }) {
  const [tab, setTab] = useState('steps')
  const s = result

  const metrics = [
    { label: "f'cr",      value: s.step1.fcr.toFixed(1),        unit: 'MPa'    },
    { label: 'W/C Ratio', value: s.step2.wc.toFixed(2),         unit: '—'      },
    { label: 'Cement',    value: s.step4.cement.toFixed(0),      unit: 'kg/m³'  },
    { label: 'Bags/m³',   value: s.step4.cementBags.toFixed(1),  unit: 'bags'   },
    { label: 'Water',     value: s.step9.waterField.toFixed(0),   unit: 'kg/m³'  },
    { label: 'Air',       value: s.step5.airPct.toFixed(1),       unit: '%'      },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 900 }}>

      {/* Header card */}
      <div className="card">
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>
              {inputs.projName}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 3 }}>
              {inputs.mixId} · {inputs.grade} · {inputs.cementType} · {inputs.placement}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span className="badge badge-ok">{inputs.grade}</span>
            <span className={`badge ${s.warnings.some(w => w.level === 'warn') ? 'badge-warn' : 'badge-ok'}`}>
              {s.warnings.some(w => w.level === 'warn') ? 'Review' : 'Compliant'}
            </span>
          </div>
        </div>

        {/* Metric tiles */}
        <div className="grid-3" style={{ gap: 8 }}>
          {metrics.map(m => (
            <div key={m.label} className="metric-tile">
              <div className="metric-label">{m.label}</div>
              <div className="metric-value">{m.value}</div>
              <div className="metric-unit">{m.unit}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance alerts */}
      {s.warnings.map((w, i) => (
        <div key={i} className={`alert alert-${w.level}`}>
          {w.message}
        </div>
      ))}

      {/* Tabs */}
      <div className="tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {tab === 'steps'     && <StepsTab     result={result} />}
        {tab === 'materials' && <MaterialsTab result={result} inputs={inputs} />}
        {tab === 'volumes'   && <VolumesTab   result={result} />}
        {tab === 'quantity'  && <QuantityTab  result={result} inputs={inputs} />}
      </div>

    </div>
  )
}
