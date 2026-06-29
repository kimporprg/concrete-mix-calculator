// Mix Library — save, load, compare named mix designs
import { useState, useEffect } from 'react'

const STORAGE_KEY = 'mixdesign-library'

function loadLib() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') }
  catch { return [] }
}
function saveLib(lib) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lib))
}

export function useMixLibrary() {
  const [library, setLibrary] = useState(loadLib)

  const saveMix = (inputs, result) => {
    const entry = {
      id:       Date.now(),
      savedAt:  new Date().toISOString(),
      name:     `${inputs.projName} / ${inputs.mixId}`,
      grade:    inputs.grade,
      placement:inputs.placement,
      wc:       result.step2.wc,
      cement:   result.step4.cement,
      bags:     result.step4.cementBags,
      airPct:   result.step5.airPct,
      fcr:      result.step1.fcr,
      inputs,
      // store compact result summary
      summary: {
        water:  parseFloat(result.field.water),
        sand:   parseFloat(result.field.sand),
        ca:     parseFloat(result.field.ca),
        scm:    parseFloat(result.field.scm || 0),
        scmType: result.scmType,
        admixture: result.admixture,
        yield:  result.step10.totalVol,
        warnings: result.warnings,
      },
    }
    setLibrary(prev => {
      const next = [entry, ...prev].slice(0, 20) // keep last 20
      saveLib(next)
      return next
    })
    return entry.id
  }

  const deleteMix = (id) => {
    setLibrary(prev => {
      const next = prev.filter(m => m.id !== id)
      saveLib(next)
      return next
    })
  }

  const clearAll = () => {
    setLibrary([])
    saveLib([])
  }

  return { library, saveMix, deleteMix, clearAll }
}

export default function MixLibrary({ library, deleteMix, clearAll, onLoad }) {
  if (library.length === 0) {
    return (
      <div style={{
        textAlign: 'center', padding: '40px 20px',
        color: 'var(--mid)', fontSize: 13,
      }}>
        No saved mixes yet. After designing a mix, click <strong style={{ color: 'var(--muted)' }}>Save to Library</strong> to store it here.
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-ghost btn-sm" style={{ fontSize: 11 }} onClick={clearAll}>
          Clear All
        </button>
      </div>

      {library.map(m => (
        <div key={m.id} className="card" style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--white)', marginBottom: 2 }}>{m.name}</div>
              <div style={{ fontSize: 11, color: 'var(--mid)' }}>
                {new Date(m.savedAt).toLocaleDateString()} · {m.placement}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              <span className="badge badge-ok">{m.grade}</span>
            </div>
          </div>

          {/* Quick metrics row */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 12 }}>
            {[
              { label: 'W/CM',    val: m.wc.toFixed(3) },
              { label: 'Cement',  val: `${m.cement.toFixed(0)} kg/m³` },
              { label: 'Bags/m³', val: m.bags.toFixed(1) },
              { label: "f'cr",    val: `${m.fcr.toFixed(1)} MPa` },
            ].map(x => (
              <div key={x.label} style={{ display: 'flex', gap: 4, alignItems: 'baseline' }}>
                <span style={{ fontSize: 10, color: 'var(--mid)', fontWeight: 700, textTransform: 'uppercase' }}>{x.label}</span>
                <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--white)' }}>{x.val}</span>
              </div>
            ))}
          </div>

          {/* Compliance indicator */}
          {m.summary.warnings?.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              {m.summary.warnings.slice(0, 1).map((w, i) => (
                <div key={i} className={`alert alert-${w.level}`} style={{ fontSize: 11, padding: '5px 9px' }}>
                  {w.msg}
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn btn-primary btn-sm"
              style={{ flex: 1 }}
              onClick={() => onLoad(m.inputs)}
            >
              Load Inputs
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => deleteMix(m.id)}
              style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
