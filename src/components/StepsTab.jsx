export default function StepsTab({ result: r }) {
  const steps = [
    {
      n: '01', name: "Required Avg. Strength f'cr",
      ref: 'ACI 301-10 §4.2.3',
      formula: r.step1.formula,
      result: `${r.step1.fcr.toFixed(2)} MPa`,
    },
    {
      n: '02', name: 'Water/Cement Ratio',
      ref: 'ACI 211.1 Table 6.3.4(a)',
      formula: r.step2.formula,
      result: r.step2.wc.toFixed(3),
    },
    {
      n: '03', name: 'Mixing Water Content',
      ref: 'ACI 211.1 Table 6.3.3',
      formula: r.step3.formula,
      result: `${r.step3.waterNominal} kg/m³`,
    },
    {
      n: '04', name: 'Cement Content',
      ref: 'ACI 211.1 §6.3.5',
      formula: r.step4.formula,
      result: `${r.step4.cement.toFixed(1)} kg/m³ (${r.step4.cementBags.toFixed(1)} bags)`,
    },
    {
      n: '05', name: 'Air Content',
      ref: 'ACI 211.1 Table 6.3.3',
      formula: r.step5.formula,
      result: `${r.step5.airPct}% → ${r.step5.Vair.toFixed(4)} m³`,
    },
    {
      n: '06', name: 'Absolute Volumes — Water & Cement',
      ref: 'ACI 211.1 §6.3.7',
      formula: r.step6.formula,
      result: `Vw=${r.step6.Vw.toFixed(4)}, Vc=${r.step6.Vc.toFixed(4)} m³`,
    },
    {
      n: '07', name: 'Coarse Aggregate',
      ref: 'ACI 211.1 Table 6.3.6',
      formula: r.step7.formula,
      result: `${r.step7.caKgSSD.toFixed(1)} kg (SSD)`,
    },
    {
      n: '08', name: 'Fine Aggregate',
      ref: 'ACI 211.1 §6.3.8',
      formula: r.step8.formula,
      result: `${r.step8.faKgSSD.toFixed(1)} kg (SSD)`,
    },
    {
      n: '09', name: 'Moisture Corrections',
      ref: 'ACI 211.1 §6.3.9',
      formula: r.step9.formula,
      result: `W=${r.step9.waterField.toFixed(1)}, FA=${r.step9.faField.toFixed(1)}, CA=${r.step9.caField.toFixed(1)} kg`,
    },
    {
      n: '10', name: 'Yield Verification',
      ref: 'ACI 211.1 §6.3.10',
      formula: r.step10.formula,
      result: `${r.step10.totalVol.toFixed(4)} m³`,
    },
  ]

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* horizontal scroll wrapper for narrow screens */}
      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table className="step-table" style={{ minWidth: 520 }}>
          <thead>
            <tr>
              <th style={{ width: 36 }}>No.</th>
              <th>Step</th>
              <th>Reference</th>
              <th style={{ textAlign: 'right' }}>Result</th>
            </tr>
          </thead>
          <tbody>
            {steps.map(s => (
              <tr key={s.n}>
                <td className="step-num">{s.n}</td>
                <td>
                  <div className="step-name">{s.name}</div>
                  {s.formula && <div className="step-formula">{s.formula}</div>}
                </td>
                <td className="step-ref">{s.ref}</td>
                <td className="step-result">{s.result}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
