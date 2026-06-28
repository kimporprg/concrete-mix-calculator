export default function MaterialsTab({ result: r, inputs }) {
  const isImperial = r._imperial
  const massUnit = isImperial ? 'lb/yd³' : 'kg/m³'

  const materials = [
    { label: 'Cement',      ssd: parseFloat(r.ssd.cement), field: parseFloat(r.field.cement), color: '#8B98A8' },
    { label: 'Water',       ssd: parseFloat(r.ssd.water),  field: parseFloat(r.field.water),  color: '#2478CC' },
    { label: 'Fine Agg.',   ssd: parseFloat(r.ssd.sand),   field: parseFloat(r.field.sand),   color: '#D4810A' },
    { label: 'Coarse Agg.', ssd: parseFloat(r.ssd.ca),     field: parseFloat(r.field.ca),     color: '#22A55A' },
  ]

  // SCM row if applicable
  if (r.scmType && r.scmType !== 'none' && parseFloat(r.ssd.scm) > 0) {
    materials.splice(1, 0, {
      label: scmLabel(r.scmType),
      ssd:   parseFloat(r.ssd.scm),
      field: parseFloat(r.field.scm),
      color: '#9B59B6',
    })
  }

  const totalSSD = materials.reduce((s, m) => s + m.ssd, 0)

  const exportCSV = () => {
    const rows = [
      ['MixDesign ACI 211.1 Export'],
      ['Project', inputs.projName],
      ['Mix ID',  inputs.mixId],
      ['Grade',   inputs.grade],
      ['Unit System', isImperial ? 'Imperial' : 'SI Metric'],
      [],
      ['Material', `SSD (${massUnit})`, `Field (${massUnit})`],
      ...materials.map(m => [m.label, m.ssd.toFixed(2), m.field.toFixed(2)]),
      [],
      ["f'cr (" + (isImperial ? 'psi' : 'MPa') + ')', r.step1.fcr.toFixed(isImperial ? 0 : 2)],
      ['W/CM Ratio', r.step2.wc.toFixed(3)],
      ['Air (%)',    r.step5.airPct],
      ['Yield (m³)', r.step10.totalVol.toFixed(4)],
      ...(r.admixture !== 'none' ? [['Admixture', r.admixture, `−${r.admixReduction}% water`]] : []),
      ...(r.scmType !== 'none' ? [['SCM', scmLabel(r.scmType), `${(r.scmPct * 100).toFixed(0)}%`]] : []),
      ...(inputs.exposureClass !== 'None' ? [['Exposure Class', inputs.exposureClass]] : []),
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

  const exportPrint = () => {
    const rows = materials.map(m =>
      `<tr><td>${m.label}</td><td>${m.ssd.toFixed(2)}</td><td>${m.field.toFixed(2)}</td></tr>`
    ).join('')

    const html = `<!DOCTYPE html>
<html><head><title>Mix Design Report — ${inputs.mixId}</title>
<style>
  body { font-family: Arial, sans-serif; font-size: 12px; padding: 24px; color: #111; }
  h1 { font-size: 18px; margin: 0 0 2px; }
  .sub { font-size: 11px; color: #555; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
  th { background: #222; color: #fff; padding: 7px 10px; text-align: left; font-size: 11px; }
  td { padding: 6px 10px; border-bottom: 1px solid #ddd; }
  tr:nth-child(even) td { background: #f5f5f5; }
  .metrics { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 14px; }
  .m-tile { border: 1px solid #ccc; border-radius: 6px; padding: 8px 12px; min-width: 90px; }
  .m-label { font-size: 9px; font-weight: 700; text-transform: uppercase; color: #777; }
  .m-val { font-size: 18px; font-weight: 700; font-family: monospace; }
  .m-unit { font-size: 10px; color: #999; }
  .warn { background: #fff7e6; border: 1px solid #f5a623; border-radius: 4px; padding: 7px 10px; margin-bottom: 8px; font-size: 11px; }
  .ok   { background: #f0faf4; border: 1px solid #22A55A; border-radius: 4px; padding: 7px 10px; margin-bottom: 8px; font-size: 11px; }
  @media print { body { padding: 0; } }
</style></head><body>
<h1>Concrete Mix Design Report</h1>
<div class="sub">${inputs.projName} &nbsp;·&nbsp; Mix ID: ${inputs.mixId} &nbsp;·&nbsp; Grade: ${inputs.grade} &nbsp;·&nbsp; ${inputs.cementType} &nbsp;·&nbsp; ${inputs.placement}</div>
<div class="metrics">
  <div class="m-tile"><div class="m-label">f'cr</div><div class="m-val">${r.step1.fcr.toFixed(isImperial ? 0 : 1)}</div><div class="m-unit">${isImperial ? 'psi' : 'MPa'}</div></div>
  <div class="m-tile"><div class="m-label">W/CM</div><div class="m-val">${r.step2.wc.toFixed(2)}</div><div class="m-unit">ratio</div></div>
  <div class="m-tile"><div class="m-label">Cement</div><div class="m-val">${parseFloat(r.ssd.cement).toFixed(0)}</div><div class="m-unit">${massUnit}</div></div>
  <div class="m-tile"><div class="m-label">Bags/m³</div><div class="m-val">${r.step4.cementBags.toFixed(1)}</div><div class="m-unit">×50 kg</div></div>
  <div class="m-tile"><div class="m-label">Air</div><div class="m-val">${r.step5.airPct}</div><div class="m-unit">%</div></div>
  <div class="m-tile"><div class="m-label">Yield</div><div class="m-val">${r.step10.totalVol.toFixed(4)}</div><div class="m-unit">m³</div></div>
</div>
${r.warnings.map(w => `<div class="${w.level}">${w.msg}</div>`).join('')}
<table>
  <tr><th>Material</th><th>SSD (${massUnit})</th><th>Field (${massUnit})</th></tr>
  ${rows}
</table>
${inputs.exposureClass !== 'None' ? `<p style="font-size:11px;color:#555;">Exposure class: ${inputs.exposureClass}</p>` : ''}
${r.admixture !== 'none' ? `<p style="font-size:11px;color:#555;">Admixture: ${r.admixture} (−${r.admixReduction}% mixing water)</p>` : ''}
<p style="font-size:10px;color:#999;margin-top:20px;">Generated by MixDesign ACI 211.1 Calculator · ${new Date().toLocaleDateString()}</p>
</body></html>`

    const w = window.open('', '_blank')
    w.document.write(html)
    w.document.close()
    w.focus()
    setTimeout(() => w.print(), 400)
  }

  const ratio = (() => {
    const c  = parseFloat(r.ssd.cement)
    const fa = parseFloat(r.ssd.sand)
    const ca = parseFloat(r.ssd.ca)
    const w  = parseFloat(r.ssd.water)
    return `1 : ${(fa/c).toFixed(2)} : ${(ca/c).toFixed(2)}   (W/CM = ${(w/c).toFixed(2)})`
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
                  {m.ssd.toFixed(1)} {massUnit}
                </span>
              </div>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${(m.ssd / totalSSD * 100).toFixed(1)}%`, background: m.color }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
          <div className="section-label" style={{ marginBottom: 4 }}>Mix Ratio (Cement : FA : CA)</div>
          <div style={{ fontSize: 13, fontFamily: 'var(--mono)', color: 'var(--text)' }}>{ratio}</div>
        </div>
      </div>

      {/* SCM info badge */}
      {r.scmType && r.scmType !== 'none' && (
        <div className="alert alert-ok" style={{ fontSize: 12 }}>
          {scmLabel(r.scmType)} at {(r.scmPct * 100).toFixed(0)}% replacement — {parseFloat(r.ssd.scm).toFixed(1)} {massUnit} per m³ concrete
        </div>
      )}
      {r.admixture && r.admixture !== 'none' && (
        <div className="alert alert-ok" style={{ fontSize: 12 }}>
          {r.admixture} applied — mixing water reduced by {r.admixReduction}%
        </div>
      )}

      {/* SSD vs Field table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table className="step-table" style={{ minWidth: 340 }}>
            <thead>
              <tr>
                <th>Material</th>
                <th style={{ textAlign: 'right' }}>SSD ({massUnit})</th>
                <th style={{ textAlign: 'right' }}>Field ({massUnit})</th>
              </tr>
            </thead>
            <tbody>
              {materials.map(m => (
                <tr key={m.label}>
                  <td style={{ color: 'var(--text)', fontWeight: 500 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: m.color, flexShrink: 0 }} />
                      {m.label}
                    </div>
                  </td>
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

      {/* Export buttons */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn-ghost btn-full" onClick={exportCSV} style={{ flex: 1 }}>
          Export CSV
        </button>
        <button className="btn btn-ghost btn-full" onClick={exportPrint} style={{ flex: 1 }}>
          Print / PDF
        </button>
      </div>

    </div>
  )
}

function scmLabel(type) {
  return {
    flyash_c: 'Fly Ash Class C',
    flyash_f: 'Fly Ash Class F',
    ggbs:     'GGBS',
    silica:   'Silica Fume',
  }[type] || type
}
