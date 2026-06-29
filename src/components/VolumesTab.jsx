export default function VolumesTab({ result: r }) {
  const hasSCM = r.scmType && r.scmType !== 'none' && r.step6.Vscm > 0

  const volumes = [
    { label: 'Cement',      v: r.step6.Vc,   color: '#8B98A8' },
    ...(hasSCM ? [{ label: scmLabel(r.scmType), v: r.step6.Vscm, color: '#9B59B6' }] : []),
    { label: 'Water',       v: r.step6.Vw,   color: '#2478CC' },
    { label: 'Air',         v: r.step5.Vair, color: '#4D5A6A' },
    { label: 'Coarse Agg.', v: r.step7.Vca,  color: '#22A55A' },
    { label: 'Fine Agg.',   v: r.step8.Vfa,  color: '#D4810A' },
  ]

  const total = volumes.reduce((s, v) => s + v.v, 0)

  let x = 0
  const W = 320, H = 36
  const rects = volumes.map(v => {
    const w = (v.v / total) * W
    const rect = { x, w, color: v.color, label: v.label, v: v.v }
    x += w
    return rect
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* SVG stacked bar */}
      <div className="card">
        <div className="section-label" style={{ marginBottom: 14 }}>Absolute Volume Distribution</div>
        <div style={{ overflowX: 'auto' }}>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', minWidth: 240, height: 'auto', borderRadius: 6, overflow: 'hidden', display: 'block' }}>
            {rects.map((r, i) => (
              <rect key={i} x={r.x} y={0} width={r.w} height={H} fill={r.color} />
            ))}
          </svg>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', marginTop: 14 }}>
          {volumes.map(v => (
            <div key={v.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: v.color, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{v.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Volume table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}>
          <table className="step-table" style={{ minWidth: 300 }}>
            <thead>
              <tr>
                <th>Component</th>
                <th style={{ textAlign: 'right' }}>Volume (m³)</th>
                <th style={{ textAlign: 'right' }}>Share (%)</th>
              </tr>
            </thead>
            <tbody>
              {volumes.map(v => (
                <tr key={v.label}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: v.color, flexShrink: 0 }} />
                      <span style={{ color: 'var(--text)', fontWeight: 500 }}>{v.label}</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--mono)', color: 'var(--text-2)' }}>
                    {v.v.toFixed(4)}
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--mono)', color: 'var(--accent)' }}>
                    {(v.v / total * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
              <tr>
                <td style={{ fontWeight: 700, color: 'var(--text)' }}>Total</td>
                <td style={{ textAlign: 'right', fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--text)' }}>
                  {total.toFixed(4)}
                </td>
                <td style={{ textAlign: 'right', fontFamily: 'var(--mono)', color: 'var(--text-3)' }}>
                  100.0%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}

function scmLabel(type) {
  return { flyash_c:'Fly Ash C', flyash_f:'Fly Ash F', ggbs:'GGBS', silica:'Silica Fume' }[type] || type
}
