export default function VolumesTab({ result }) {
  const { volumes } = result
  const segments = [
    { label: 'Cement', value: volumes.Vc,   color: '#8FA3B1' },
    { label: 'Water',  value: volumes.Vw,   color: '#1D6FA4' },
    { label: 'Sand',   value: volumes.Vfa,  color: '#C47A00' },
    { label: 'Coarse', value: volumes.Vca,  color: '#5D7185' },
    { label: 'Air',    value: volumes.Vair, color: '#2C3E50' },
  ]
  const total = volumes.total

  // Build SVG stacked bar
  let cx = 0
  const bars = segments.map(s => {
    const w = (s.value / 1) * 320
    const bar = { ...s, x: cx, w }
    cx += w
    return bar
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Stacked bar */}
      <div className="card-sm">
        <div className="section-title">Absolute Volume Distribution (1 m³)</div>
        <svg viewBox="0 0 320 36" style={{ width: '100%', borderRadius: 6, overflow: 'hidden', marginBottom: 12 }}>
          {bars.map(b => (
            <rect key={b.label} x={b.x} y={0} width={Math.max(b.w,0)} height={36} fill={b.color} />
          ))}
        </svg>
        {/* Legend */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px' }}>
          {segments.map(s => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>{s.label}</span>
              <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--white)' }}>{(s.value*100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Detail table */}
      <div className="card-sm">
        <div className="section-title">Volume Breakdown</div>
        <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign:'left', color:'var(--muted)', padding:'6px 0', fontWeight:600, fontSize:11, textTransform:'uppercase' }}>Component</th>
              <th style={{ textAlign:'right', color:'var(--muted)', padding:'6px 0', fontWeight:600, fontSize:11, textTransform:'uppercase' }}>Volume (m³)</th>
              <th style={{ textAlign:'right', color:'var(--muted)', padding:'6px 0', fontWeight:600, fontSize:11, textTransform:'uppercase' }}>%</th>
            </tr>
          </thead>
          <tbody>
            {segments.map(s => (
              <tr key={s.label}>
                <td style={{ padding:'7px 0', borderBottom:'1px solid var(--steel)', color:'var(--white)' }}>
                  <span style={{ display:'inline-block', width:8, height:8, borderRadius:'50%', background:s.color, marginRight:8 }} />
                  {s.label}
                </td>
                <td style={{ padding:'7px 0', borderBottom:'1px solid var(--steel)', textAlign:'right', fontFamily:'var(--font-mono)', color:'var(--accent)' }}>{s.value.toFixed(4)}</td>
                <td style={{ padding:'7px 0', borderBottom:'1px solid var(--steel)', textAlign:'right', fontFamily:'var(--font-mono)', color:'var(--muted)' }}>{(s.value*100).toFixed(1)}%</td>
              </tr>
            ))}
            <tr>
              <td style={{ padding:'7px 0', color:'var(--white)', fontWeight:700 }}>Total</td>
              <td style={{ padding:'7px 0', textAlign:'right', fontFamily:'var(--font-mono)', color: Math.abs(total-1)<0.025 ? '#2ecc71':'#e74c3c', fontWeight:700 }}>{total.toFixed(4)}</td>
              <td style={{ padding:'7px 0', textAlign:'right', fontFamily:'var(--font-mono)', color:'var(--muted)', fontWeight:700 }}>{(total*100).toFixed(1)}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
