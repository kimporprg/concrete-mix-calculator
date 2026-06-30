// VolumesTab.jsx
export default function VolumesTab({ result }) {
  const { step6, step5, step7, step8, step10 } = result
  const segs = [
    { label:'Water',      vol:step6.Vw,   color:'#0071E3' },
    { label:'Cement',     vol:step6.Vc,   color:'#1D1D1F' },
    { label:'Air',        vol:step5.Vair, color:'#C7C7CC' },
    { label:'Coarse Agg.',vol:step7.Vca,  color:'#6E6E73' },
    { label:'Fine Agg.',  vol:step8.Vfa,  color:'#B9740A' },
  ]
  const total = step10.totalVol
  let cx = 0
  const W = 320, H = 36

  return (
    <div>
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="section-label">Absolute Volume - 1 m³ Breakdown</div>

        {/* Stacked bar */}
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width:'100%', borderRadius: 6, overflow:'hidden', marginBottom:12 }}>
          {segs.map(s => {
            const w = (s.vol / total) * W
            const x = cx; cx += w
            return (
              <rect key={s.label} x={x} y={0} width={w} height={H} fill={s.color} />
            )
          })}
        </svg>

        {/* Legend */}
        <div style={{ display:'flex', flexWrap:'wrap', gap:'8px 16px', marginBottom:12 }}>
          {segs.map(s => (
            <div key={s.label} style={{ display:'flex', alignItems:'center', gap:6, fontSize:12 }}>
              <div style={{ width:10, height:10, borderRadius:2, background:s.color, flexShrink:0 }} />
              <span style={{ color:'var(--muted)' }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Table */}
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
          <thead>
            <tr>
              {['Component','Volume (m³)','Share (%)'].map(h => (
                <th key={h} style={{ padding:'5px 8px', textAlign:'left', color:'var(--muted)', borderBottom:'1px solid var(--line)', fontSize:10, textTransform:'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {segs.map(s => (
              <tr key={s.label}>
                <td style={{ padding:'6px 8px', color:'var(--white)', fontWeight:600 }}>
                  <span style={{ display:'inline-block', width:8, height:8, background:s.color, borderRadius:2, marginRight:6 }} />
                  {s.label}
                </td>
                <td style={{ padding:'6px 8px', fontFamily:'var(--font-mono)', color:'var(--muted)' }}>{s.vol.toFixed(4)}</td>
                <td style={{ padding:'6px 8px', fontFamily:'var(--font-mono)', color:'var(--white)', fontWeight:700 }}>{(s.vol/total*100).toFixed(1)}%</td>
              </tr>
            ))}
            <tr style={{ borderTop:'1px solid var(--line)' }}>
              <td style={{ padding:'6px 8px', color:'var(--white)', fontWeight:700 }}>TOTAL</td>
              <td style={{ padding:'6px 8px', fontFamily:'var(--font-mono)', fontWeight:700,
                color: Math.abs(total-1)>0.025 ? 'var(--warn)' : 'var(--ok)' }}>
                {total.toFixed(4)}
              </td>
              <td style={{ padding:'6px 8px', fontFamily:'var(--font-mono)', color:'var(--muted)' }}>100%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
