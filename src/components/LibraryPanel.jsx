// LibraryPanel.jsx
// Mix Library — saved designs with Load / Delete actions.
// Each card now shows: W/CM · CEMENT · BAGS/M³ · F'CR · WATER · SAND + compliance warnings.

import { useLocalStorage } from '../hooks/useLocalStorage'

export default function LibraryPanel({ onLoad }) {
  const [library, setLibrary] = useLocalStorage('mixdesign-library', [])

  function handleDelete(id) {
    setLibrary(prev => prev.filter(e => e.id !== id))
  }

  function handleClearAll() {
    if (window.confirm('Delete all saved mixes?')) setLibrary([])
  }

  if (library.length === 0) {
    return (
      <div style={{ padding: '32px 16px', textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>📚</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--white)', marginBottom: 6 }}>
          No saved mixes yet
        </div>
        <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>
          Calculate a mix and tap{' '}
          <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Save to Library</span>{' '}
          to store it here.
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '4px 0 16px' }}>
      {/* Header row */}
      <div style={{
        display: 'flex', justifyContent: 'flex-end', marginBottom: 12,
      }}>
        <button
          onClick={handleClearAll}
          style={{
            background: 'transparent',
            border: '1px solid var(--line)',
            color: 'var(--muted)',
            borderRadius: 6,
            padding: '5px 12px',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Clear All
        </button>
      </div>

      {library.map(entry => (
        <LibraryCard
          key={entry.id}
          entry={entry}
          onLoad={() => onLoad(entry)}
          onDelete={() => handleDelete(entry.id)}
        />
      ))}
    </div>
  )
}

function LibraryCard({ entry, onLoad, onDelete }) {
  const { inp, result, savedAt } = entry

  // Safely pull values from result
  const wc        = result?.step2?.wc
  const cement    = result?.step4?.cement
  const bags      = result?.step4?.cementBags
  const fcr       = result?.step1?.fcr
  const waterSSD  = result?.step3?.waterNominal   // design water (SSD, kg/m³)
  const waterField= result?.step9?.waterField     // field-corrected water
  const sandSSD   = result?.step8?.faKgSSD        // FA SSD kg/m³
  const sandField = result?.step9?.faField        // FA field kg/m³
  const warnings  = result?.warnings ?? []

  const warnMsgs = warnings.filter(w => w.level === 'warn' || w.level === 'danger')

  const dateStr = savedAt
    ? new Date(savedAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })
    : ''

  return (
    <div style={{
      background: 'var(--ink2)',
      borderRadius: 10,
      marginBottom: 12,
      border: '1px solid rgba(255,255,255,0.06)',
      overflow: 'hidden',
    }}>
      {/* ── Title row ── */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        padding: '12px 14px 8px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--white)', marginBottom: 2 }}>
            {inp?.projName ?? '—'} / {inp?.mixId ?? '—'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>
            {dateStr}{dateStr && ' · '}{inp?.placement ?? ''}
          </div>
        </div>
        <GradeBadge grade={inp?.grade} />
      </div>

      {/* ── Primary stats row (W/C · Cement · Bags) ── */}
      <div style={{
        display: 'flex', gap: 16, flexWrap: 'wrap',
        padding: '10px 14px 6px',
      }}>
        <StatItem label="W/CM" value={fmt(wc, 3)} />
        <StatItem label="CEMENT" value={cement != null ? `${Math.round(cement)} kg/m³` : '—'} />
        <StatItem label="BAGS/M³" value={bags != null ? fmt(bags, 1) : '—'} />
      </div>

      {/* ── f'cr row ── */}
      <div style={{ padding: '0 14px 6px' }}>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>
          F&#x27;CR{' '}
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--line)', fontSize: 13 }}>
            {fcr != null ? `${fmt(fcr, 1)} MPa` : '—'}
          </span>
        </span>
      </div>

      {/* ── NEW: Water & Sand row ── */}
      <div style={{
        margin: '0 14px 8px',
        background: 'rgba(0,0,0,0.2)',
        borderRadius: 7,
        padding: '9px 12px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '6px 16px',
      }}>
        {/* Water */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.5px', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 3 }}>
            Water
          </div>
          <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--white)', fontWeight: 700 }}>
            {waterField != null ? `${Math.round(waterField)} kg` : (waterSSD != null ? `${Math.round(waterSSD)} kg` : '—')}
          </div>
          <div style={{ fontSize: 10, color: 'var(--muted)' }}>
            {waterField != null ? 'field-corrected' : 'design (SSD)'}
            {waterSSD != null && waterField != null && waterField !== waterSSD
              ? ` · SSD ${Math.round(waterSSD)} kg`
              : ''}
          </div>
        </div>

        {/* Sand */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.5px', color: '#C47A00', textTransform: 'uppercase', marginBottom: 3 }}>
            Sand (FA)
          </div>
          <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--white)', fontWeight: 700 }}>
            {sandField != null ? `${Math.round(sandField)} kg` : (sandSSD != null ? `${Math.round(sandSSD)} kg` : '—')}
          </div>
          <div style={{ fontSize: 10, color: 'var(--muted)' }}>
            {sandField != null ? 'field-corrected' : 'design (SSD)'}
            {sandSSD != null && sandField != null && Math.round(sandField) !== Math.round(sandSSD)
              ? ` · SSD ${Math.round(sandSSD)} kg`
              : ''}
          </div>
        </div>
      </div>

      {/* ── Warnings ── */}
      {warnMsgs.length > 0 && (
        <div style={{ margin: '0 14px 10px' }}>
          {warnMsgs.map((w, i) => (
            <div key={i} style={{
              fontSize: 12, color: '#C47A00',
              background: 'rgba(196,122,0,0.12)',
              borderRadius: 5, padding: '6px 10px',
              marginBottom: 4,
              lineHeight: 1.4,
            }}>
              ⚠ {w.msg}
            </div>
          ))}
        </div>
      )}

      {/* ── Action buttons ── */}
      <div style={{
        display: 'flex', gap: 8, padding: '0 14px 14px',
      }}>
        <button
          onClick={onLoad}
          style={{
            flex: 1,
            background: 'var(--accent)',
            color: 'var(--white)',
            border: 'none',
            borderRadius: 7,
            padding: '9px 0',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Load Inputs
        </button>
        <button
          onClick={onDelete}
          style={{
            background: 'transparent',
            color: 'var(--danger)',
            border: '1.5px solid var(--danger)',
            borderRadius: 7,
            padding: '9px 16px',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Delete
        </button>
      </div>
    </div>
  )
}

// ── Helpers ──────────────────────────────────────────────

function fmt(val, decimals = 2) {
  if (val == null || isNaN(val)) return '—'
  return Number(val).toFixed(decimals)
}

function StatItem({ label, value }) {
  return (
    <div style={{ minWidth: 60 }}>
      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.5px', color: 'var(--muted)', textTransform: 'uppercase' }}>
        {label}{' '}
      </span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--line)' }}>
        {value}
      </span>
    </div>
  )
}

function GradeBadge({ grade }) {
  if (!grade) return null
  return (
    <span style={{
      background: 'var(--ok)',
      color: 'var(--white)',
      fontSize: 11,
      fontWeight: 700,
      padding: '3px 9px',
      borderRadius: 5,
      flexShrink: 0,
    }}>
      {grade}
    </span>
  )
}
