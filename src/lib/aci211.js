// ────────────────────────────────────────────────────────────
//  ACI 211.1 Absolute Volume Method — Pure JS, no React deps
// ────────────────────────────────────────────────────────────

// ACI Table 6.3.3 — Mixing water content (kg/m³)
const WATER_TABLE = {
  non: {
    10:   { sl1: 207, sl2: 228, sl3: 243, sl4: 255 },
    19:   { sl1: 181, sl2: 202, sl3: 216, sl4: 228 },
    25:   { sl1: 175, sl2: 193, sl3: 208, sl4: 220 },
    37.5: { sl1: 163, sl2: 181, sl3: 193, sl4: 202 },
  },
  air: {
    10:   { sl1: 181, sl2: 202, sl3: 216, sl4: 228 },
    19:   { sl1: 160, sl2: 181, sl3: 196, sl4: 208 },
    25:   { sl1: 154, sl2: 172, sl3: 184, sl4: 196 },
    37.5: { sl1: 145, sl2: 160, sl3: 172, sl4: 181 },
  },
}

// ACI Table 6.3.3 — Entrapped/entrained air content (%)
const AIR_TABLE = {
  non: { 10: 3.0, 19: 2.0, 25: 1.5, 37.5: 1.0 },
  air: { 10: 8.0, 19: 6.0, 25: 5.0, 37.5: 4.5 },
}

// ACI Table 6.3.4(a) — W/C ratio vs compressive strength (MPa)
const WC_TABLE = {
  non: [[45,0.38],[40,0.43],[35,0.48],[30,0.55],[25,0.62],[20,0.70],[15,0.80],[10,0.90]],
  air: [[40,0.30],[35,0.40],[30,0.45],[25,0.52],[20,0.60],[15,0.70],[10,0.82]],
}

// ACI Table 6.3.6 — Volume of dry-rodded CA per unit volume (b/b₀)
const CA_TABLE = {
  2.4: { 10: 0.50, 19: 0.64, 25: 0.68, 37.5: 0.72 },
  2.6: { 10: 0.48, 19: 0.62, 25: 0.66, 37.5: 0.70 },
  2.8: { 10: 0.46, 19: 0.60, 25: 0.64, 37.5: 0.68 },
  3.0: { 10: 0.44, 19: 0.58, 25: 0.62, 37.5: 0.66 },
}

export const GRADES = { M10:10, M15:15, M20:20, M25:25, M30:30, M35:35, M40:40 }
export const AGG_SIZES = [10, 19, 25, 37.5]
export const SLUMP_OPTIONS = [
  { label: '25–50 mm',   value: 'sl1' },
  { label: '75–100 mm',  value: 'sl2' },
  { label: '100–150 mm', value: 'sl3' },
  { label: '150–175 mm', value: 'sl4' },
]
export const CEMENT_TYPES  = ['OPC / Type I', 'Type II', 'Type III (HES)', 'PPC']
export const PLACEMENTS    = ['Footing', 'Slab', 'Beam', 'Column', 'Pavement']
export const DEFAULT_INPUTS = {
  projName: 'My Project', mixId: 'MX-001',
  grade: 'M20', designAge: 28,
  fc: 20, stddev: 3.5,
  placement: 'Slab', slump: 'sl2', maxAgg: 19,
  cementType: 'OPC / Type I', airType: 'non',
  gcCement: 3.15,
  gfa: 2.65, fm: 2.7, faMoisture: 2.5, faAbsorb: 1.2,
  gca: 2.70, druw: 1600, caMoisture: 1.0, caAbsorb: 0.8,
}

// Linear interpolation helper
function interp(x, pts) {
  if (x >= pts[0][0]) return pts[0][1]
  if (x <= pts[pts.length-1][0]) return pts[pts.length-1][1]
  for (let i = 0; i < pts.length-1; i++) {
    const [x1,y1] = pts[i], [x2,y2] = pts[i+1]
    if (x >= x2) {
      const t = (x - x2) / (x1 - x2)
      return y2 + t * (y1 - y2)
    }
  }
  return pts[pts.length-1][1]
}

// CA fraction: interpolate across FM bands for given agg size
function getCAFraction(fm, aggSizeMm) {
  const fmBands = [2.4, 2.6, 2.8, 3.0]
  fm = Math.max(2.4, Math.min(3.0, fm))
  for (let i = 0; i < fmBands.length-1; i++) {
    const f1 = fmBands[i], f2 = fmBands[i+1]
    if (fm >= f1 && fm <= f2) {
      const t = (fm - f1) / (f2 - f1)
      return CA_TABLE[f1][aggSizeMm] + t * (CA_TABLE[f2][aggSizeMm] - CA_TABLE[f1][aggSizeMm])
    }
  }
  return CA_TABLE[3.0][aggSizeMm]
}

export function designMix(inp) {
  const { fc, stddev, airType, maxAgg, slump, gcCement, gfa, fm, gca, druw,
          faMoisture, faAbsorb, caMoisture, caAbsorb } = inp
  const fcN = parseFloat(fc), s = parseFloat(stddev)
  const Gc = parseFloat(gcCement), Gfa = parseFloat(gfa), Gca = parseFloat(gca)
  const DRUW = parseFloat(druw), FM = parseFloat(fm)
  const aggSize = parseFloat(maxAgg)

  // Step 1 — Required average strength f'cr
  let fcr, step1formula
  if (fcN < 35) {
    const a = fcN + 1.34 * s
    const b = fcN + 2.33 * s - 3.45
    fcr = Math.max(a, b)
    step1formula = `max(${fcN}+1.34×${s}=${a.toFixed(2)}, ${fcN}+2.33×${s}−3.45=${b.toFixed(2)})`
  } else {
    const a = fcN + 1.34 * s
    const b = 0.9 * fcN + 2.33 * s
    fcr = Math.max(a, b)
    step1formula = `max(${fcN}+1.34×${s}=${a.toFixed(2)}, 0.9×${fcN}+2.33×${s}=${b.toFixed(2)})`
  }

  // Step 2 — W/C ratio from ACI Table 6.3.4(a)
  const wcMax = airType === 'air' ? 0.65 : 0.80
  let wc = interp(fcr, WC_TABLE[airType])
  wc = Math.min(wc, wcMax)
  const step2formula = `Interpolated from ACI Table 6.3.4(a) for f'cr=${fcr.toFixed(1)} MPa → ${wc.toFixed(3)}, cap ${wcMax}`

  // Step 3 — Water content
  const waterNominal = WATER_TABLE[airType][aggSize][slump]
  const step3formula = `ACI Table 6.3.3: airType=${airType}, aggSize=${aggSize}mm, slump=${slump} → ${waterNominal} kg/m³`

  // Step 4 — Cement content
  const cement = waterNominal / wc
  const cementBags = cement / 50
  const step4formula = `C = W/WC = ${waterNominal}/${wc.toFixed(3)} = ${cement.toFixed(1)} kg/m³ = ${cementBags.toFixed(2)} bags`

  // Step 5 — Air volume
  const airPct = AIR_TABLE[airType][aggSize]
  const Vair = airPct / 100
  const step5formula = `ACI Table 6.3.3: ${airPct}% → Vair = ${Vair.toFixed(4)} m³/m³`

  // Step 6 — Absolute volumes of water and cement
  const Vw = waterNominal / 1000
  const Vc = cement / (Gc * 1000)
  const step6formula = `Vw=${waterNominal}/1000=${Vw.toFixed(4)}, Vc=${cement.toFixed(1)}/(${Gc}×1000)=${Vc.toFixed(4)}`

  // Step 7 — Coarse aggregate
  const caFraction = getCAFraction(FM, aggSize)
  const caKgSSD = caFraction * DRUW
  const Vca = caKgSSD / (Gca * 1000)
  const step7formula = `b/b₀=${caFraction.toFixed(3)} × DRUW=${DRUW} = ${caKgSSD.toFixed(1)} kg, Vca=${Vca.toFixed(4)}`

  // Step 8 — Fine aggregate (volume difference)
  const Vfa = 1 - Vw - Vc - Vair - Vca
  const faKgSSD = Vfa * Gfa * 1000
  const step8formula = `Vfa = 1−${Vw.toFixed(4)}−${Vc.toFixed(4)}−${Vair.toFixed(4)}−${Vca.toFixed(4)} = ${Vfa.toFixed(4)}, FA=${faKgSSD.toFixed(1)} kg`

  // Step 9 — Moisture corrections
  const faM = parseFloat(faMoisture), faA = parseFloat(faAbsorb)
  const caM = parseFloat(caMoisture), caA = parseFloat(caAbsorb)
  const faField = faKgSSD * (1 + faM / 100)
  const caField = caKgSSD * (1 + caM / 100)
  const waterFromFA = faKgSSD * (faM - faA) / 100
  const waterFromCA = caKgSSD * (caM - caA) / 100
  const waterField = waterNominal - waterFromFA - waterFromCA
  const step9formula = `W_field = ${waterNominal}−(${waterFromFA.toFixed(2)})−(${waterFromCA.toFixed(2)}) = ${waterField.toFixed(1)} kg`

  // Step 10 — Yield check
  const totalVol = Vw + Vc + Vair + Vca + Vfa
  const step10formula = `${Vw.toFixed(4)}+${Vc.toFixed(4)}+${Vair.toFixed(4)}+${Vca.toFixed(4)}+${Vfa.toFixed(4)} = ${totalVol.toFixed(4)} m³`

  // Mix ratio (cement=1)
  const ratio = { c: 1, w: waterField/cement, s: faField/cement, ca: caField/cement }

  // Warnings
  const warnings = []
  if (wc > 0.60)         warnings.push({ level:'warn',   msg:'W/C > 0.60 — consider reducing slump or adding plasticiser' })
  if (cement < 280)      warnings.push({ level:'warn',   msg:`Cement ${cement.toFixed(0)} kg/m³ below ACI minimum of 280 kg/m³` })
  if (cement > 540)      warnings.push({ level:'warn',   msg:`Cement ${cement.toFixed(0)} kg/m³ exceeds recommended maximum of 540 kg/m³` })
  const vfaPct = Vfa * 100
  if (vfaPct < 25 || vfaPct > 45) warnings.push({ level:'warn', msg:`Sand volume ${vfaPct.toFixed(1)}% outside typical 25–45% range` })
  if (Math.abs(totalVol - 1) > 0.025) warnings.push({ level:'warn', msg:`Yield ${totalVol.toFixed(4)} deviates >2.5% from 1.000 — verify specific gravities` })
  if (warnings.length === 0) warnings.push({ level:'ok', msg:'All ACI 211.1 compliance checks passed ✓' })

  return {
    step1:  { fcr, formula: step1formula },
    step2:  { wc, formula: step2formula },
    step3:  { waterNominal, formula: step3formula },
    step4:  { cement, cementBags, formula: step4formula },
    step5:  { airPct, Vair, formula: step5formula },
    step6:  { Vw, Vc, formula: step6formula },
    step7:  { caFraction, caKgSSD, Vca, formula: step7formula },
    step8:  { Vfa, faKgSSD, formula: step8formula },
    step9:  { faField, caField, waterField, waterFromFA, waterFromCA, formula: step9formula },
    step10: { totalVol, formula: step10formula },
    ssd:    { cement: cement.toFixed(1), water: waterNominal.toFixed(1), sand: faKgSSD.toFixed(1), ca: caKgSSD.toFixed(1) },
    field:  { cement: cement.toFixed(1), water: waterField.toFixed(1),   sand: faField.toFixed(1), ca: caField.toFixed(1) },
    volumes:{ Vc, Vw, Vfa, Vca, Vair, total: totalVol },
    wc, airPct, caFraction,
    ratio,
    warnings,
    inp,
  }
}

// Element volume calculator
export function calcElementVolume(type, dims) {
  const d = dims
  switch (type) {
    case 'slab':    return (d.L||0) * (d.W||0) * (d.T||0)
    case 'beam':    return (d.L||0) * (d.W||0) * (d.D||0)
    case 'column':  return (d.H||0) * (d.W||0) * (d.D||0)
    case 'footing': return (d.L||0) * (d.W||0) * (d.T||0)
    case 'circ':    return Math.PI * Math.pow((d.Dia||0)/2, 2) * (d.H||0)
    default: return 0
  }
}

// Scale per-m³ quantities to a target volume
export function scaleToVolume(result, volM3) {
  const v = parseFloat(volM3) || 0
  const f = result.field
  const bags = (parseFloat(f.cement) / 50) * v
  return {
    cement: (parseFloat(f.cement) * v).toFixed(1),
    water:  (parseFloat(f.water)  * v).toFixed(1),
    sand:   (parseFloat(f.sand)   * v).toFixed(1),
    ca:     (parseFloat(f.ca)     * v).toFixed(1),
    bags:   bags.toFixed(2),
    vol:    v.toFixed(3),
  }
}
