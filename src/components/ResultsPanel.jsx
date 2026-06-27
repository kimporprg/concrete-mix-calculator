import { useState } from 'react'
import StepsTab    from './StepsTab.jsx'
import MaterialsTab from './MaterialsTab.jsx'
import VolumesTab  from './VolumesTab.jsx'
import QuantityTab from './QuantityTab.jsx'

const TABS = [
  { key:'steps',     label:'Steps' },
  { key:'materials', label:'Materials' },
  { key:'volumes',   label:'Volumes' },
  { key:'quantity',  label:'Quantity' },
]

export default function ResultsPanel({ result }) {
  const [activeTab, setActiveTab] = useState('steps')
  const { step1, step2, step4, step5, step9, inp } = result

  const tiles = [
    { label:"f'cr Required",    val: step1.fcr.toFixed(1),                         unit:'MPa' },
    { label:'W/C Ratio',         val: step2.wc.toFixed(3),                           unit:'' },
    { label:'Cement',            val: parseFloat(step4.cement.toFixed(0)),            unit:'kg/m³' },
    { label:'Cement Bags',       val: step4.cementBags.toFixed(2),                   unit:'bags/m³' },
    { label:'Water (field)',     val: parseFloat(step9.waterField.toFixed(1)),        unit:'kg/m³' },
    { label:'Air Content',       val: step5.airPct,                                   unit:'%' },
  ]

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      {/* Header card */}
      <div className="card">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
          <div>
            <div style={{ fontSize:18, fontWeight:700 }}>{inp.projName}</div>
            <div style={{ color:'var(--muted)', fontSize:13, marginTop:2 }}>
              Mix ID: <span style={{ fontFamily:'var(--font-mono)', color:'var(--accent)' }}>{inp.mixId}</span>
            </div>
          </div>
          <span className="badge badge-ok">{inp.grade}</span>
        </div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <span className="badge badge-warn">{inp.cementType}</span>
          <span className="badge">{inp.maxAgg}mm agg</span>
          <span className="badge">{inp.airType === 'air' ? 'Air Entrained' : 'Non-Air'}</span>
          <span className="badge">{inp.designAge}d</span>
        </div>
      </div>

      {/* Metric tiles */}
      <div className="grid-3">
        {tiles.map(t => (
          <div key={t.label} className="metric-tile">
            <div className="metric-label">{t.label}</div>
            <div className="metric-value">{t.val}</div>
            {t.unit && <div className="metric-unit">{t.unit}</div>}
          </div>
        ))}
      </div>

      {/* Compliance alerts */}
      {result.warnings.map((w,i) => (
        <div key={i} className={`alert alert-${w.level}`}>
          <span>{w.level === 'ok' ? '✓' : '⚠'}</span>
          <span>{w.msg}</span>
        </div>
      ))}

      {/* Tabs */}
      <div className="tabs">
        {TABS.map(t => (
          <button key={t.key} className={`tab ${activeTab===t.key?'active':''}`}
            onClick={() => setActiveTab(t.key)}>{t.label}</button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'steps'     && <StepsTab     result={result} />}
      {activeTab === 'materials' && <MaterialsTab result={result} />}
      {activeTab === 'volumes'   && <VolumesTab   result={result} />}
      {activeTab === 'quantity'  && <QuantityTab  result={result} />}
    </div>
  )
}
