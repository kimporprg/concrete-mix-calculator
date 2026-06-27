export default function StepsTab({ result }) {
  const { step1,step2,step3,step4,step5,step6,step7,step8,step9,step10 } = result

  const steps = [
    { n:1,  name:"Required Avg. Strength f'cr", ref:"ACI 301 §4.2.3",      val:`${step1.fcr.toFixed(2)} MPa`,          formula:step1.formula },
    { n:2,  name:"W/C Ratio",                   ref:"ACI Table 6.3.4(a)",   val:step2.wc.toFixed(3),                    formula:step2.formula },
    { n:3,  name:"Water Content",               ref:"ACI Table 6.3.3",      val:`${step3.waterNominal} kg/m³`,          formula:step3.formula },
    { n:4,  name:"Cement Content",              ref:"C = W / (W/C)",        val:`${step4.cement.toFixed(1)} kg/m³ (${step4.cementBags.toFixed(2)} bags)`, formula:step4.formula },
    { n:5,  name:"Air Content",                 ref:"ACI Table 6.3.3",      val:`${step5.airPct}% → ${step5.Vair.toFixed(4)} m³`,    formula:step5.formula },
    { n:6,  name:"Water & Cement Volumes",      ref:"Abs. Volume Method",   val:`Vw=${step6.Vw.toFixed(4)}, Vc=${step6.Vc.toFixed(4)}`, formula:step6.formula },
    { n:7,  name:"Coarse Aggregate",            ref:"ACI Table 6.3.6",      val:`${step7.caKgSSD.toFixed(1)} kg/m³`,   formula:step7.formula },
    { n:8,  name:"Fine Aggregate",              ref:"Vol. Difference",       val:`${step8.faKgSSD.toFixed(1)} kg/m³`,   formula:step8.formula },
    { n:9,  name:"Moisture Corrections",        ref:"Field Adjustments",     val:`W_field=${step9.waterField.toFixed(1)} kg`, formula:step9.formula },
    { n:10, name:"Yield Check",                 ref:"Total = 1.000 m³",     val:`${step10.totalVol.toFixed(4)} m³`,     formula:step10.formula },
  ]

  return (
    <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <table className="step-table" style={{ minWidth: 600 }}>
        <thead>
          <tr>
            <th style={{ width: 32 }}>#</th>
            <th>Step</th>
            <th>ACI Reference</th>
            <th style={{ textAlign: 'right' }}>Result</th>
          </tr>
        </thead>
        <tbody>
          {steps.map(s => (
            <tr key={s.n}>
              <td className="step-num">{s.n}</td>
              <td>
                <div className="step-name">{s.name}</div>
                <div className="step-formula">{s.formula}</div>
              </td>
              <td className="step-ref">{s.ref}</td>
              <td className="step-result">{s.val}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
