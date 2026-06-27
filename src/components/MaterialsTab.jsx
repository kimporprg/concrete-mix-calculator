export default function MaterialsTab({ result }) {
  const { ssd, field, ratio, inp } = result

  const materials = [
    { label: 'Cement',  ssd: ssd.cement,  field: field.cement, color: '#8FA3B1', unit: 'kg/m³' },
    { label: 'Water',   ssd: ssd.water,   field: field.water,  color: '#1D6FA4', unit: 'kg/m³' },
    { label: 'Sand',    ssd: ssd.sand,    field: field.sand,   color: '#C47A00', unit: 'kg/m³' },
    { label: 'Coarse',  ssd: ssd.ca,      field: field.ca,     color: '#5D7185', unit: 'kg/m³' },
  ]

  const maxVal = Math.max(...materials.map(m => parseFloat(m.field)))

  const handleExport = () => {
    const rows = [
      ['MixDesign ACI 211.1 Export'],
      ['Project', inp.projName, 'Mix ID', inp.mixId],
      ['Grade', inp.grade, "f'c (MPa)", inp.fc, 'Std Dev', inp.stddev],
      ['Slump', inp.slump, 'Max Agg (mm)', inp.maxAgg, 'Air Type', inp.airType],
      [],
      ['Material', 'SSD (kg/m³)', 'Field (kg/m³)'],
      ['Cement', ssd.cement, field.cement],
      ['Water',  ssd.water,  field.water],
      ['Sand',   ssd.sand,   field.sand],
      ['Coarse', ssd.ca,     field.ca],
      [],
      ['Mix Ratio (Cement=1)', `1 : ${ratio.w.toFixed(2)} : ${ratio.s.toFixed(2)} : ${ratio.ca.toFixed(2)}`],
      ["f'cr (MPa)", result.step1.fcr.toFixed(2)],
      ['W/C Ratio', result.wc.toFixed(3)],
      ['Cement Bags/m³', result.step4.cementBags.toFixed(2)],
      ['Total Volume', result.step10.totalVol.toFixed(4)],
    ]
    const csv = rows.map(r => r.map(v => `"${v ?? ''}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `mix-${inp.mixId}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Bar chart */}
      <div className="card-sm">
        <div className="section-title" style={{ marginBottom: 16 }}>Material Proportions (Field-Corrected)</div>
        {materials.map(m => (
          <div key={m.label} style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--white)' }}>{m.label}</span>
              <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: m.color }}>{parseFloat(m.field).toFixed(1)} {m.unit}</span>
            </div>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: `${(parseFloat(m.field)/maxVal)*100}%`, background: m.color }} />
            </div>
          </div>
        ))}
      </div>

      {/* SSD vs Field table */}
      <div className="card-sm">
        <div className="section-title">SSD vs Field-Corrected</div>
        <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', color: 'var(--muted)', padding: '6px 0', fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>Material</th>
              <th style={{ textAlign: 'right', color: 'var(--muted)', padding: '6px 0', fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>SSD (kg/m³)</th>
              <th style={{ textAlign: 'right', color: 'var(--muted)', padding: '6px 0', fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>Field (kg/m³)</th>
            </tr>
          </thead>
          <tbody>
            {materials.map(m => (
              <tr key={m.label}>
                <td style={{ padding: '7px 0', borderBottom: '1px solid var(--steel)', color: 'var(--white)' }}>{m.label}</td>
                <td style={{ padding: '7px 0', borderBottom: '1px solid var(--steel)', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>{parseFloat(m.ssd).toFixed(1)}</td>
                <td style={{ padding: '7px 0', borderBottom: '1px solid var(--steel)', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>{parseFloat(m.field).toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mix ratio */}
      <div className="card-sm">
        <div className="section-title">Mix Ratio (C : W : S : CA)</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, color: 'var(--accent)', letterSpacing: '0.04em' }}>
          1 : {ratio.w.toFixed(2)} : {ratio.s.toFixed(2)} : {ratio.ca.toFixed(2)}
        </div>
      </div>

      <button className="btn btn-ghost btn-full" onClick={handleExport}>⬇ Export CSV</button>
    </div>
  )
}
