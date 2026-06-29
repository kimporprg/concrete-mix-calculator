// aci211.js — Pure ACI 211.1 calculation engine. No React deps.

// ─── Lookup tables ───────────────────────────────────────────────────────────

const WATER_TABLE = {
  non: {
    10:   { sl1: 207, sl2: 228, sl3: 243, sl4: 255 },
    19:   { sl1: 181, sl2: 202, sl3: 216, sl4: 228 },
    25:   { sl1: 175, sl2: 193, sl3: 208, sl4: 220 },
    37.5: { sl1: 163, sl2: 181, sl3: 193, sl4: 202 },
  },
  air: {
    10:   { sl1: 181, sl2: 202, sl3: 216, sl4: 225 },
    19:   { sl1: 160, sl2: 181, sl3: 196, sl4: 208 },
    25:   { sl1: 154, sl2: 172, sl3: 184, sl4: 196 },
    37.5: { sl1: 145, sl2: 160, sl3: 172, sl4: 181 },
  },
}

const AIR_TABLE = {
  non: { 10: 3.0, 19: 2.0, 25: 1.5, 37.5: 1.0 },
  air: { 10: 8.0, 19: 6.0, 25: 5.0, 37.5: 4.5 },
}

// ACI Table 6.3.4(a) — [fcr_MPa, wc_ratio]
const WC_TABLE = {
  non: [[45,0.38],[40,0.43],[35,0.48],[30,0.55],[25,0.62],[20,0.70],[15,0.80],[10,0.90]],
  air: [[40,0.30],[35,0.40],[30,0.45],[25,0.52],[20,0.60],[15,0.70],[10,0.82]],
}

// ACI Table 6.3.6 — CA volume fraction b/b0
const CA_TABLE = {
  2.4: { 10: 0.50, 19: 0.64, 25: 0.68, 37.5: 0.72 },
  2.6: { 10: 0.48, 19: 0.62, 25: 0.66, 37.5: 0.70 },
  2.8: { 10: 0.46, 19: 0.60, 25: 0.64, 37.5: 0.68 },
  3.0: { 10: 0.44, 19: 0.58, 25: 0.62, 37.5: 0.66 },
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function lerp(x, x0, x1, y0, y1) {
  return y0 + ((x - x0) / (x1 - x0)) * (y1 - y0)
}

function interpWC(fcr, airType) {
  const tbl = WC_TABLE[airType]
  const cap = airType === 'air' ? 0.65 : 0.80
  if (fcr >= tbl[0][0]) return tbl[0][1]
  if (fcr <= tbl[tbl.length - 1][0]) return cap
  for (let i = 0; i < tbl.length - 1; i++) {
    const [f1, w1] = tbl[i], [f0, w0] = tbl[i + 1]
    if (fcr <= f1 && fcr >= f0) return Math.min(cap, lerp(fcr, f0, f1, w0, w1))
  }
  return cap
}

function getCAFraction(fm, aggSize) {
  const fmBands = [2.4, 2.6, 2.8, 3.0]
  const clamp = v => Math.max(2.4, Math.min(3.0, v))
  const fm2 = clamp(fm)
  if (fm2 <= 2.4) return CA_TABLE[2.4][aggSize] ?? CA_TABLE[2.4][19]
  if (fm2 >= 3.0) return CA_TABLE[3.0][aggSize] ?? CA_TABLE[3.0][19]
  let lo = 2.4, hi = 2.6
  for (let i = 0; i < fmBands.length - 1; i++) {
    if (fm2 >= fmBands[i] && fm2 <= fmBands[i + 1]) { lo = fmBands[i]; hi = fmBands[i + 1]; break }
  }
  const vLo = CA_TABLE[lo][aggSize]  ?? CA_TABLE[lo][19]
  const vHi = CA_TABLE[hi][aggSize]  ?? CA_TABLE[hi][19]
  return lerp(fm2, lo, hi, vLo, vHi)
}

// ─── Exported constants ───────────────────────────────────────────────────────

export const GRADES = { M10:10, M15:15, M20:20, M25:25, M30:30, M35:35, M40:40 }
export const AGG_SIZES = [10, 19, 25, 37.5]
export const SLUMP_OPTIONS = [
  { label:'25–50 mm', value:'sl1' },
  { label:'75–100 mm', value:'sl2' },
  { label:'100–150 mm', value:'sl3' },
  { label:'150–175 mm', value:'sl4' },
]
export const CEMENT_TYPES = ['OPC / Type I','Type II','Type III (HES)','PPC']
export const PLACEMENTS   = ['Footing','Slab','Beam','Column','Pavement']

export const DEFAULT_INPUTS = {
  projName: 'My Project', mixId: 'MX-001', grade: 'M20', designAge: 28,
  fc: 20, stddev: 3.5, placement: 'Slab', slump: 'sl2', maxAgg: 19,
  cementType: 'OPC / Type I', airType: 'non',
  gcCement: 3.15, gfa: 2.65, fm: 2.7, faMoisture: 2.5, faAbsorb: 1.2,
  gca: 2.70, druw: 1600, caMoisture: 1.0, caAbsorb: 0.8,
}

// ─── Main design function ─────────────────────────────────────────────────────

export function designMix(inp) {
  const { fc, stddev, airType, maxAgg, slump, gcCement, gfa, fm,
          faMoisture, faAbsorb, gca, druw, caMoisture, caAbsorb } = inp
  const agg = Number(maxAgg)

  // Step 1 — f'cr
  const s = Number(stddev)
  const fc_ = Number(fc)
  let fcr
  if (fc_ < 35) {
    fcr = Math.max(fc_ + 1.34 * s, fc_ + 2.33 * s - 3.45)
  } else {
    fcr = Math.max(fc_ + 1.34 * s, 0.9 * fc_ + 2.33 * s)
  }
  const step1 = { fcr, formula: fc_ < 35
    ? `max(f'c + 1.34s, f'c + 2.33s − 3.45) = max(${(fc_+1.34*s).toFixed(2)}, ${(fc_+2.33*s-3.45).toFixed(2)})`
    : `max(f'c + 1.34s, 0.9f'c + 2.33s) = max(${(fc_+1.34*s).toFixed(2)}, ${(0.9*fc_+2.33*s).toFixed(2)})` }

  // Step 2 — W/C
  const wc = interpWC(fcr, airType)
  const step2 = { wc, formula: `Interpolated from ACI Table 6.3.4(a) at f'cr = ${fcr.toFixed(2)} MPa` }

  // Step 3 — Water
  const waterNominal = WATER_TABLE[airType]?.[agg]?.[slump] ?? 202
  const step3 = { waterNominal, formula: `ACI Table 6.3.3 [${airType}][${agg}mm][${slump}] = ${waterNominal} kg/m³` }

  // Step 4 — Cement
  const cement = waterNominal / wc
  const cementBags = cement / 50
  const step4 = { cement, cementBags, formula: `C = W / (W/C) = ${waterNominal} / ${wc.toFixed(3)} = ${cement.toFixed(1)} kg/m³` }

  // Step 5 — Air
  const airPct = AIR_TABLE[airType]?.[agg] ?? 2.0
  const Vair = airPct / 100
  const step5 = { airPct, Vair, formula: `ACI Table 6.3.3 [${airType}][${agg}mm] = ${airPct}%` }

  // Step 6 — Absolute volumes W + C
  const Vw = waterNominal / 1000
  const Vc = cement / (Number(gcCement) * 1000)
  const step6 = { Vw, Vc, formula: `Vw = ${waterNominal}/1000 = ${Vw.toFixed(4)} m³ | Vc = ${cement.toFixed(1)}/(${gcCement}×1000) = ${Vc.toFixed(4)} m³` }

  // Step 7 — Coarse aggregate
  const caFraction = getCAFraction(Number(fm), agg)
  const caKgSSD    = caFraction * Number(druw)
  const Vca        = caKgSSD / (Number(gca) * 1000)
  const step7 = { caFraction, caKgSSD, Vca,
    formula: `b/b₀ = ${caFraction.toFixed(3)} (FM=${fm}, ${agg}mm) | CA = ${caFraction.toFixed(3)}×${druw} = ${caKgSSD.toFixed(1)} kg | Vca = ${Vca.toFixed(4)} m³` }

  // Step 8 — Fine aggregate
  const Vfa    = 1 - Vw - Vc - Vair - Vca
  const faKgSSD = Vfa * Number(gfa) * 1000
  const step8 = { Vfa, faKgSSD,
    formula: `Vfa = 1 − ${Vw.toFixed(4)} − ${Vc.toFixed(4)} − ${Vair.toFixed(4)} − ${Vca.toFixed(4)} = ${Vfa.toFixed(4)} m³` }

  // Step 9 — Moisture corrections
  const faField      = faKgSSD  * (1 + Number(faMoisture) / 100)
  const caField      = caKgSSD  * (1 + Number(caMoisture) / 100)
  const waterFromFA  = faKgSSD  * (Number(faMoisture) - Number(faAbsorb)) / 100
  const waterFromCA  = caKgSSD  * (Number(caMoisture) - Number(caAbsorb)) / 100
  const waterField   = waterNominal - waterFromFA - waterFromCA
  const step9 = { faField, caField, waterField, waterFromFA, waterFromCA,
    formula: `FA_field=${faField.toFixed(1)} | CA_field=${caField.toFixed(1)} | W_field=${waterField.toFixed(1)} kg` }

  // Step 10 — Yield
  const totalVol = Vw + Vc + Vair + Vca + Vfa
  const step10 = { totalVol, formula: `ΣV = ${totalVol.toFixed(4)} m³ (target = 1.000)` }

  // Warnings
  const warnings = []
  if (wc > 0.60) warnings.push({ level:'warn', msg:`W/CM ${wc.toFixed(3)} > 0.60 — consider reducing slump or adding water reducer` })
  if (cement < 280) warnings.push({ level:'warn', msg:`Cement ${cement.toFixed(0)} kg/m³ is below ACI minimum of 280 kg/m³` })
  if (cement > 540) warnings.push({ level:'warn', msg:`Cement ${cement.toFixed(0)} kg/m³ exceeds recommended max of 540 kg/m³` })
  if (Vfa < 0.25 || Vfa > 0.45) warnings.push({ level:'warn', msg:`Sand volume ${(Vfa*100).toFixed(1)}% is outside typical 25–45% range` })
  if (Math.abs(totalVol - 1) > 0.025) warnings.push({ level:'warn', msg:`Yield ${totalVol.toFixed(4)} m³ deviates >2.5% — verify specific gravities` })
  if (warnings.length === 0) warnings.push({ level:'ok', msg:'All ACI 211.1 compliance checks passed ✓' })

  // Mix ratio (Cement : FA : CA)
  const ratio = { c: 1, fa: faKgSSD/cement, ca: caKgSSD/cement }

  return { inp, step1, step2, step3, step4, step5, step6, step7, step8, step9, step10, warnings, ratio }
}

// ─── Quantity calculator ──────────────────────────────────────────────────────

export function calcElementVolume(type, dims) {
  const n = k => Number(dims[k] || 0)
  switch (type) {
    case 'slab':    return n('length') * n('width') * n('thickness')
    case 'beam':    return n('length') * n('width') * n('depth')
    case 'column':  return n('height') * n('width') * n('depth')
    case 'footing': return n('length') * n('width') * n('thickness')
    case 'circ':    return Math.PI * Math.pow(n('diameter') / 2, 2) * n('height')
    default: return 0
  }
}

export function scaleToVolume(result, volM3) {
  const { step4, step3, step8, step9, step7 } = result
  const cement = step4.cement * volM3
  const bags   = step4.cementBags * volM3
  const water  = step9.waterField * volM3
  const sand   = step9.faField * volM3
  const ca     = step9.caField * volM3
  return { cement, bags, water, sand, ca, vol: volM3 }
}
