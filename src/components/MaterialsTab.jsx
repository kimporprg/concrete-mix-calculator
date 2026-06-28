export default function MaterialsTab({ result: r, inputs }) {
  const materials = [
    { label: 'Cement',       ssd: r.step4.cement,      field: r.step4.cement,      color: '#8B98A8' },
    { label: 'Water',        ssd: r.step3.waterNominal, field: r.step9.waterField,  color: '#2478CC' },
    { label: 'Fine Agg.',    ssd: r.step8.faKgSSD,     field: r.step9.faField,     color: '#D4810A' },
    { label: 'Coarse Agg.',  ssd: r.step7.caKgSSD,     field: r.step9.caField,     color: '#22A55A' },
  ]

  const totalSSD = materials.reduce((s, m) => s + m.ssd, 0)

  const exportCSV = () => {
    const rows = [
      ['MixDesign ACI 211.1 Export'],
      ['Project', inputs.projName],
      ['Mix ID', inputs.mixId],
      ['Grade', inputs.grade],
      [],
      ['Material', 'SSD (kg/m³)', 'Field (kg/m³)'],
      ...materials.map(m => [m.label, m.ssd.toFixed(2), m.field.toFixed(2)]),
      [],
      ["f'cr (MPa)", r.step1.fcr.toFixed(2)],
      ['W/C Ratio', r.step2.wc.toFixed(3)],
      ['Air (%)', r.step5.airPct],
      ['Yield (m³)', r.step10.totalVol.toFixed(4)],
    ]
    const csv = rows.map(r => r.map(v => `"${v ?? ''}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mix-${inputs.mixId}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const ratio = (() => {
    const c = r.step4.cement
    const w = r.step3.waterNominal
    const fa = r.step8.faKgSSD
    const ca = r.step7.caKgSSD
    return `1 : ${(fa/c).toFixed(2)} : ${(ca/c).toFixed(2)}   (W/C = ${(w/c).toFixed(2)})`
  })()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Bar chart */}
      <div className="card">
        <div className="section-label" style={{ marginBottom: 16 }}>Proportions by Mass — SSD</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {materials.map(m => (
            <div key={m.label} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>{m.label}</span>
                <span style={{ fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text)' }}>
                  {m.ssd.toFixed(1)} kg/m³
                </span>
              </div>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{
                    width: `${(m.ssd / totalSSD * 100).toFixed(1)}%`,
                    background: m.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
            Mix Ratio (Cement : FA : CA)
          </div>
          <div style={{ fontSize: 13, fontFamily: 'var(--mono)', color: 'var(--text)' }}>{ratio}</div>
        </div>
      </div>

      {/* SSD vs Field table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table className="step-table" style={{ minWidth: 340 }}>
            <thead>
              <tr>
                <th>Material</th>
                <th style={{ textAlign: 'right' }}>SSD (kg/m³)</th>
                <th style={{ textAlign: 'right' }}>Field (kg/m³)</th>
              </tr>
            </thead>
            <tbody>
              {materials.map(m => (
                <tr key={m.label}>
                  <td style={{ color: 'var(--text)', fontWeight: 500 }}>{m.label}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--mono)', color: 'var(--text-2)' }}>
                    {m.ssd.toFixed(2)}
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--mono)', color: 'var(--accent)' }}>
                    {m.field.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export */}
      <button className="btn btn-ghost btn-full" onClick={exportCSV}>
        Export CSV
      </button>

    </div>
  )
}
