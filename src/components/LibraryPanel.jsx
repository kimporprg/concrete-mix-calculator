// LibraryPanel.jsx — saved mixes with Water + Sand quantities on each card
import { useLocalStorage } from '../hooks/useLocalStorage'

export default function LibraryPanel({ onLoad }) {
  const [library, setLibrary] = useLocalStorage('mixdesign-library', [])

  function handleDelete(id) { setLibrary(prev => prev.filter(e => e.id !== id)) }
  function handleClearAll() { if (window.confirm('Delete all saved mixes?')) setLibrary([]) }

  if (library.length === 0) {
    return (
      <div style={{ padding: '40px 16px', textAlign: 'center' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--white)', marginBottom: 6 }}>No saved mixes yet</div>
        <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
          Calculate a mix and tap <span style={{ color: 'var(--accent)', fontWeight: 700 }}>Save to Library</span> to store it here.
        </div>
      </div>
    )
  }

  return (
    <div style={{ paddingBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
        <button onClick={handleClearAll} className="btn btn-ghost btn-sm-mobile" style={{ fontSize: 12, minHeight: 36 }}>
          Clear All
        </button>
      </div>
      {library.map(entry => (
        <LibCard key={entry.id} entry={entry}
          onLoad={() => onLoad(entry)}
          onDelete={() => handleDelete(entry.id)} />
      ))}
    </div>
  )
}

function LibCard({ entry, onLoad, onDelete }) {
  const { inp, result, savedAt } = entry
  const r = result || {}
  const wc       = r.step2?.wc
  const cement   = r.step4?.cement
  const bags     = r.step4?.cementBags
  const fcr      = r.step1?.fcr
  const waterField = r.step9?.waterField ?? r.step3?.waterNominal
  const waterSSD   = r.step3?.waterNominal
  const sandField  = r.step9?.faField    ?? r.step8?.faKgSSD
  const sandSSD    = r.step8?.faKgSSD
  const warns      = (r.warnings ?? []).filter(w => w.level !== 'ok')

  const dateStr = savedAt
    ? new Date(savedAt).toLocaleDateString(undefined, { day:'2-digit', month:'short', year:'numeric' })
    : ''

  const f = (v, d = 2) => v != null && !isNaN(v) ? Number(v).toFixed(d) : '—'

  return (
    <div style={{
      background: 'var(--ink2)', borderRadius: 12, marginBottom: 12,
      border: '1px solid var(--line)', overflow: 'hidden',
    }}>
      {/* Title */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        padding: '12px 14px 10px', borderBottom: '1px solid var(--line)',
      }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--white)', marginBottom: 2 }}>
            {inp?.projName ?? '—'} / {inp?.mixId ?? '—'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>
            {dateStr}{dateStr && inp?.placement ? ' · ' : ''}{inp?.placement ?? ''}
          </div>
        </div>
        {inp?.grade && (
          <span className="badge badge-grade" style={{ marginTop: 2, flexShrink: 0 }}>{inp.grade}</span>
        )}
      </div>

      {/* Primary stats */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', padding: '10px 14px 4px' }}>
        <Stat label="W/CM"    value={f(wc, 3)} />
        <Stat label="CEMENT"  value={cement != null ? `${Math.round(cement)} kg/m³` : '—'} />
        <Stat label="BAGS/M³" value={f(bags, 1)} />
      </div>
      <div style={{ padding: '0 14px 8px' }}>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>
          F&#x27;CR{' '}
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--white)', fontSize: 13 }}>
            {fcr != null ? `${f(fcr, 1)} MPa` : '—'}
          </span>
        </span>
      </div>

      {/* Water + Sand row */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: '8px 12px', margin: '0 14px 10px',
        background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: '10px 12px',
      }}>
        <MatBlock
          label="Water" accent="var(--accent)"
          fieldVal={waterField} ssdVal={waterSSD}
          unit="kg/m³"
        />
        <MatBlock
          label="Sand (FA)" accent="var(--warn)"
          fieldVal={sandField} ssdVal={sandSSD}
          unit="kg/m³"
        />
      </div>

      {/* Warnings */}
      {warns.length > 0 && (
        <div style={{ margin: '0 14px 10px' }}>
          {warns.map((w, i) => (
            <div key={i} className="alert alert-warn" style={{ marginBottom: 4 }}>
              {w.msg}
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, padding: '0 14px 14px' }}>
        <button onClick={onLoad} className="btn btn-primary" style={{ flex: 1 }}>
          Load Inputs
        </button>
        <button onClick={onDelete} className="btn btn-danger" style={{ padding: '0 18px' }}>
          Delete
        </button>
      </div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div style={{ minWidth: 56 }}>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.5px', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--line)' }}>
        {value}
      </div>
    </div>
  )
}

function MatBlock({ label, accent, fieldVal, ssdVal, unit }) {
  const hasField = fieldVal != null && !isNaN(fieldVal)
  const hasSSD   = ssdVal != null && !isNaN(ssdVal)
  const showBoth = hasField && hasSSD && Math.round(fieldVal) !== Math.round(ssdVal)

  return (
    <div>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.5px', color: accent, textTransform: 'uppercase', marginBottom: 3 }}>
        {label}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--white)' }}>
        {hasField ? `${Math.round(fieldVal)} ${unit}` : (hasSSD ? `${Math.round(ssdVal)} ${unit}` : '—')}
      </div>
      <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 1 }}>
        {hasField ? 'field-corrected' : (hasSSD ? 'design (SSD)' : '')}
        {showBoth ? ` · SSD ${Math.round(ssdVal)} kg` : ''}
      </div>
    </div>
  )
}
