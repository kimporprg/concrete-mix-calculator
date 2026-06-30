// StepsTab.jsx
export default function StepsTab({ result }) {
  const { step1,step2,step3,step4,step5,step6,step7,step8,step9,step10 } = result
  const rows = [
    { n:'01', name:"Required Avg. Strength f'cr", ref:'ACI 301-10 §4.2.3',  formula:step1.formula,  val:`${step1.fcr.toFixed(2)} MPa` },
    { n:'02', name:"Water–Cement Ratio",          ref:'ACI 211.1 T6.3.4a',  formula:step2.formula,  val:step2.wc.toFixed(3) },
    { n:'03', name:'Mixing Water Content',         ref:'ACI 211.1 T6.3.3',   formula:step3.formula,  val:`${step3.waterNominal} kg/m³` },
    { n:'04', name:'Cement Content',               ref:'W ÷ (W/C)',           formula:step4.formula,  val:`${step4.cement.toFixed(1)} kg/m³ · ${step4.cementBags.toFixed(1)} bags` },
    { n:'05', name:'Air Content',                  ref:'ACI 211.1 T6.3.3',   formula:step5.formula,  val:`${step5.airPct}% → ${step5.Vair.toFixed(4)} m³` },
    { n:'06', name:'Abs. Volumes - Water & Cement',ref:'ACI 211.1 §6.3.7',   formula:step6.formula,  val:`Vw=${step6.Vw.toFixed(4)} · Vc=${step6.Vc.toFixed(4)} m³` },
    { n:'07', name:'Coarse Aggregate',             ref:'ACI 211.1 T6.3.6',   formula:step7.formula,  val:`${step7.caKgSSD.toFixed(1)} kg · ${step7.Vca.toFixed(4)} m³` },
    { n:'08', name:'Fine Aggregate (by diff.)',    ref:'Volume diff. method', formula:step8.formula,  val:`${step8.faKgSSD.toFixed(1)} kg · ${step8.Vfa.toFixed(4)} m³` },
    { n:'09', name:'Moisture Corrections (field)', ref:'ACI 211.1 §6.3.10',  formula:step9.formula,  val:`W=${step9.waterField.toFixed(1)} · FA=${step9.faField.toFixed(1)} · CA=${step9.caField.toFixed(1)} kg` },
    { n:'10', name:'Yield Verification',           ref:'ACI 211.1 §6.3.11',  formula:step10.formula, val:`${step10.totalVol.toFixed(4)} m³` },
  ]

  return (
    <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <table className="step-table" style={{ minWidth: 540 }}>
        <thead>
          <tr>
            <th style={{ width: 36 }}>#</th>
            <th>Step</th>
            <th>ACI Ref.</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.n}>
              <td><span className="step-num">{r.n}</span></td>
              <td>
                <div className="step-name">{r.name}</div>
                <div className="step-ref" style={{ marginTop: 2 }}>{r.formula}</div>
              </td>
              <td><span className="step-ref">{r.ref}</span></td>
              <td><span className="step-result">{r.val}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
