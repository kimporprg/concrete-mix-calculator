// ResultsPanel.jsx — Steps / Materials / Volumes / Quantity tabs
import { useState } from 'react'
import StepsTab     from './StepsTab'
import MaterialsTab from './MaterialsTab'
import VolumesTab   from './VolumesTab'
import QuantityTab  from './QuantityTab'

const TABS = [
  { id: 'steps',     label: 'Steps'     },
  { id: 'materials', label: 'Materials' },
  { id: 'volumes',   label: 'Volumes'   },
  { id: 'quantity',  label: 'Quantity'  },
]

export default function ResultsPanel({ result, onSave }) {
  const [tab, setTab] = useState('steps')

  if (!result) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '100%', padding: 40, textAlign: 'center',
      }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--white)', marginBottom: 8 }}>
          No results yet
        </div>
        <div style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6, maxWidth: 280 }}>
          Fill in the inputs and tap <strong style={{ color: 'var(--accent)' }}>Calculate Mix</strong> to run the ACI 211.1 design.
        </div>
      </div>
    )
  }

  const { step1, step2, step4, step5, step9, warnings, inp } = result
  const fcr    = step1?.fcr
  const wc     = step2?.wc
  const cement = step4?.cement
  const bags   = step4?.cementBags
  const airPct = step5?.airPct
  const waterF = step9?.waterField

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Header card */}
      <div className="card" style={{ borderRadius: 10, padding: '12px 16px', marginBottom: 12, flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--white)' }}>
              {inp?.projName} — {inp?.mixId}
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
              {inp?.grade} · {inp?.placement} · {inp?.cementType}
            </div>
          </div>
          <button onClick={onSave} className="btn btn-primary"
            style={{ minHeight: 36, padding: '0 14px', fontSize: 12, borderRadius: 7, flexShrink: 0 }}>
            Save
          </button>
        </div>
      </div>

      {/* 6 metric tiles */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
        gap: 8, marginBottom: 10, flexShrink: 0,
      }}>
        {[
          { label:"f'cr",  value: fcr    != null ? fcr.toFixed(1)    : '—', unit:'MPa' },
          { label:'W/C',   value: wc     != null ? wc.toFixed(3)     : '—', unit:'ratio' },
          { label:'Cement',value: cement != null ? Math.round(cement): '—', unit:'kg/m³' },
          { label:'Bags',  value: bags   != null ? bags.toFixed(1)   : '—', unit:'per m³' },
          { label:'Water', value: waterF != null ? Math.round(waterF): '—', unit:'kg field' },
          { label:'Air',   value: airPct != null ? airPct.toFixed(1) : '—', unit:'%' },
        ].map(t => (
          <div key={t.label} className="metric-tile">
            <div className="metric-label">{t.label}</div>
            <div className="metric-value">{t.value}</div>
            <div className="metric-unit">{t.unit}</div>
          </div>
        ))}
      </div>

      {/* Compliance alerts */}
      <div style={{ flexShrink: 0 }}>
        {warnings?.map((w, i) => (
          <div key={i} className={`alert alert-${w.level}`}>{w.msg}</div>
        ))}
      </div>

      {/* Tab bar */}
      <div className="tabs" style={{ marginTop: 10, marginBottom: 10, flexShrink: 0 }}>
        {TABS.map(t => (
          <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab body */}
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {tab === 'steps'     && <StepsTab     result={result} />}
        {tab === 'materials' && <MaterialsTab result={result} />}
        {tab === 'volumes'   && <VolumesTab   result={result} />}
        {tab === 'quantity'  && <QuantityTab  result={result} />}
      </div>
    </div>
  )
}
