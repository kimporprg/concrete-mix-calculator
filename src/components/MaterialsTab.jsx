// MaterialsTab.jsx
export default function MaterialsTab({ result }) {
  const { step3, step4, step8, step9, ratio, inp } = result
  const cement  = step4.cement
  const waterS  = step3.waterNominal
  const sandS   = step8.faKgSSD
  const caS     = result.step7.caKgSSD
  const waterF  = step9.waterField
  const sandF   = step9.faField
  const caF     = step9.caField

  const total = cement + waterS + sandS + caS
  const pct   = v => (v / total * 100).toFixed(1)

  const BARS = [
    { label:'Cement',      val:cement, pct:pct(cement), color:'var(--accent)' },
    { label:'Water (SSD)', val:waterS, pct:pct(waterS), color:'#5FA8E8' },
    { label:'Sand (SSD)',  val:sandS,  pct:pct(sandS),  color:'var(--warn)' },
    { label:'Coarse Agg.', val:caS,    pct:pct(caS),    color:'var(--muted)' },
  ]
  const maxVal = Math.max(cement, waterS, sandS, caS)

  function exportCSV() {
    const rows = [
      ['MixDesign - ACI 211.1 Export'],
      ['Project', inp.projName], ['Mix ID', inp.mixId], ['Grade', inp.grade],
      ["f'c (MPa)", inp.fc], ['Std. Dev.', inp.stddev], ['Slump', inp.slump],
      ['Max Agg (mm)', inp.maxAgg], ['Air Type', inp.airType], ['Cement Type', inp.cementType],
      [],
      ['--- DESIGN (SSD) ---'],
      ['Cement (kg/m³)', cement.toFixed(1)],
      ['Water (kg/m³)', waterS],
      ['Sand/FA (kg/m³)', sandS.toFixed(1)],
      ['Coarse Agg (kg/m³)', caS.toFixed(1)],
      ['Cement Bags/m³', step4.cementBags.toFixed(2)],
      ['Mix Ratio (C:FA:CA)', `1 : ${ratio.fa.toFixed(2)} : ${ratio.ca.toFixed(2)}`],
      [],
      ['--- FIELD CORRECTED ---'],
      ['Water Field (kg/m³)', waterF.toFixed(1)],
      ['Sand Field (kg/m³)', sandF.toFixed(1)],
      ['Coarse Agg Field (kg/m³)', caF.toFixed(1)],
    ]
    const csv = rows.map(r => r.map(v => `"${v ?? ''}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `mix-${inp.mixId}.csv`
    a.click()
    // L1: revoke after browser has had a tick to initiate download
    setTimeout(() => URL.revokeObjectURL(url), 100)
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="section-label">Proportions (kg/m³)</div>
        {BARS.map(b => (
          <div key={b.label} style={{ marginBottom: 10 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom: 4 }}>
              <span style={{ fontSize:12, color:'var(--muted)' }}>{b.label}</span>
              <span style={{ fontSize:12, fontFamily:'var(--font-mono)', fontWeight:700, color:'var(--white)' }}>
                {b.val.toFixed ? b.val.toFixed(1) : b.val} kg <span style={{ color:'var(--mid)' }}>({b.pct}%)</span>
              </span>
            </div>
            <div className="bar-track">
              <div className="bar-fill" style={{ width:`${(b.val/maxVal)*100}%`, background:b.color }} />
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <div className="section-label">SSD vs. Field Quantities</div>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
          <thead>
            <tr>
              {['Material','SSD (kg/m³)','Field (kg/m³)'].map(h => (
                <th key={h} style={{ padding:'6px 8px', textAlign:'left', color:'var(--muted)', borderBottom:'1px solid var(--line)', fontWeight:700, fontSize:10, textTransform:'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['Cement', cement.toFixed(1), cement.toFixed(1)],
              ['Water',  waterS,             waterF.toFixed(1)],
              ['Sand',   sandS.toFixed(1),   sandF.toFixed(1)],
              ['Coarse', caS.toFixed(1),     caF.toFixed(1)],
            ].map(([m,s,f]) => (
              <tr key={m}>
                <td style={{ padding:'7px 8px', color:'var(--white)', fontWeight:600 }}>{m}</td>
                <td style={{ padding:'7px 8px', fontFamily:'var(--font-mono)', color:'var(--muted)' }}>{s}</td>
                <td style={{ padding:'7px 8px', fontFamily:'var(--font-mono)', color:'var(--white)', fontWeight:700 }}>{f}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <div className="section-label">Mix Ratio</div>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:18, fontWeight:700, color:'var(--white)', textAlign:'center', padding:'8px 0' }}>
          1 : {ratio.fa.toFixed(2)} : {ratio.ca.toFixed(2)}
        </div>
        <div style={{ textAlign:'center', fontSize:11, color:'var(--muted)' }}>Cement : Fine Agg. : Coarse Agg.</div>
      </div>

      <button type="button" onClick={exportCSV} className="btn btn-ghost btn-full" style={{ marginTop: 4 }}>
        ⬇ Export CSV
      </button>
    </div>
  )
}
