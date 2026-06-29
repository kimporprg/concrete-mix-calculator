// ResultsPanel.jsx
// Shows: header card → 6 metric tiles → compliance alerts → tab bar (Steps / Materials / Volumes / Quantity / Guide)

import { useState } from 'react'
import StepsTab     from './StepsTab'
import MaterialsTab from './MaterialsTab'
import VolumesTab   from './VolumesTab'
import QuantityTab  from './QuantityTab'
import GuideTab     from './GuideTab'   // ← NEW

const TABS = [
  { id: 'steps',     label: 'Steps'     },
  { id: 'materials', label: 'Materials' },
  { id: 'volumes',   label: 'Volumes'   },
  { id: 'quantity',  label: 'Quantity'  },
  { id: 'guide',     label: '📖 Guide'  }, // ← NEW
]

export default function ResultsPanel({ result, onSaveToLibrary }) {
  const [tab, setTab] = useState('steps')

  if (!result) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '100%', padding: 32, textAlign: 'center',
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🧱</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--white)', marginBottom: 8 }}>
          No results yet
        </div>
        <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
          Fill in the inputs and tap <strong style={{ color: 'var(--accent)' }}>Calculate Mix</strong> to see the ACI 211.1 design.
        </div>
        {/* Show guide even before first calculation */}
        <div style={{ marginTop: 32, width: '100%', maxWidth: 480, textAlign: 'left' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
            📖 Field Reference — not sure what an input means?
          </div>
          <GuideTab />
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

  const hasWarns = warnings?.some(w => w.level !== 'ok')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* ── Header card ── */}
      <div style={{
        background: 'var(--ink2)', borderRadius: 10,
        padding: '12px 16px', margin: '0 0 12px', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--white)' }}>
              {inp?.projName ?? 'Mix Design'} — {inp?.mixId ?? ''}
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
              {inp?.grade} · {inp?.placement} · {inp?.cementType}
            </div>
          </div>
          <button
            onClick={onSaveToLibrary}
            style={{
              background: 'var(--accent)', color: 'var(--white)',
              border: 'none', borderRadius: 6, padding: '6px 12px',
              fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              whiteSpace: 'nowrap', flexShrink: 0,
            }}
          >
            Save
          </button>
        </div>
      </div>

      {/* ── 6 Metric tiles ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 8, marginBottom: 12, flexShrink: 0,
      }}>
        {[
          { label: "f'cr", value: fcr != null ? fcr.toFixed(1) : '—', unit: 'MPa' },
          { label: 'W/C',  value: wc  != null ? wc.toFixed(3)  : '—', unit: 'ratio' },
          { label: 'Cement', value: cement != null ? Math.round(cement) : '—', unit: 'kg/m³' },
          { label: 'Bags/m³', value: bags != null ? bags.toFixed(1) : '—', unit: '50 kg' },
          { label: 'Water', value: waterF != null ? Math.round(waterF) : '—', unit: 'kg (field)' },
          { label: 'Air', value: airPct != null ? airPct.toFixed(1) : '—', unit: '%' },
        ].map(t => (
          <div key={t.label} className="metric-tile">
            <div className="metric-label">{t.label}</div>
            <div className="metric-value">{t.value}</div>
            <div className="metric-unit">{t.unit}</div>
          </div>
        ))}
      </div>

      {/* ── Compliance alerts ── */}
      {warnings?.map((w, i) => (
        <div key={i} className={`alert alert-${w.level}`} style={{ marginBottom: 6, flexShrink: 0 }}>
          {w.msg}
        </div>
      ))}

      {/* ── Tab bar ── */}
      <div style={{
        display: 'flex', gap: 2, marginBottom: 12, flexShrink: 0,
        overflowX: 'auto', WebkitOverflowScrolling: 'touch',
      }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '7px 13px',
              border: 'none',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
              whiteSpace: 'nowrap',
              background: tab === t.id ? 'var(--accent)' : 'var(--ink2)',
              color:      tab === t.id ? 'var(--white)'  : 'var(--muted)',
              transition: 'background 0.15s, color 0.15s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {tab === 'steps'     && <StepsTab     result={result} />}
        {tab === 'materials' && <MaterialsTab result={result} />}
        {tab === 'volumes'   && <VolumesTab   result={result} />}
        {tab === 'quantity'  && <QuantityTab  result={result} />}
        {tab === 'guide'     && <GuideTab />}  {/* ← NEW */}
      </div>

    </div>
  )
}
