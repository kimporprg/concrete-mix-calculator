// aci211.js — ACI 211.1 absolute-volume mix design engine

// ─── Constants ─────────────────────────────────────────────────────────────

export const GRADES = {
  'M15': 15, 'M20': 20, 'M25': 25, 'M30': 30,
  'M35': 35, 'M40': 40, 'M45': 45, 'M50': 50,
}

export const AGG_SIZES = [10, 12.5, 19, 25, 37.5]

export const SLUMP_OPTIONS = [
  { label: '25–50 mm',   value: '25-50'   },
  { label: '75–100 mm',  value: '75-100'  },
  { label: '100–150 mm', value: '100-150' },
  { label: '150–175 mm', value: '150-175' },
]

export const CEMENT_TYPES = ['OPC / Type I', 'Type II', 'Type III', 'PPC / Blended']

export const PLACEMENTS = ['Slab', 'Beam', 'Column', 'Footing', 'Pavement', 'Other']

export const DEFAULT_INPUTS = {
  projName:   'My Project',
  mixId:      'MX-01',
  placement:  'Slab',
  grade:      'M25',
  fc:         25,
  stddev:     4.0,
  designAge:  28,
  slump:      '75-100',
  maxAgg:     19,
  cementType: 'OPC / Type I',
  airType:    'non',
  gcCement:   3.15,
  gfa:        2.65,
  fm:         2.7,
  faMoisture: 2.0,
  faAbsorb:   1.2,
  gca:        2.68,
  druw:       1600,
  caMoisture: 1.0,
  caAbsorb:   0.5,
}

// ─── ACI 211.1 Table 6.3.3 — Mixing Water (kg/m³) ─────────────────────────
// Keys: slump range → agg size → [non-air, air-entrained]
const WATER_TABLE = {
  '25-50': {
    10:   [207, 181],
    12.5: [199, 175],
    19:   [190, 168],
    25:   [179, 160],
    37.5: [166, 150],
  },
  '75-100': {
    10:   [228, 202],
    12.5: [216, 193],
    19:   [205, 184],
    25:   [193, 175],
    37.5: [178, 160],
  },
  '100-150': {
    10:   [243, 216],
    12.5: [228, 205],
    19:   [216, 197],
    25:   [202, 184],
    37.5: [190, 172],
  },
  '150-175': {
    10:   [255, 228],
    12.5: [243, 216],
    19:   [228, 205],
    25:   [216, 197],
    37.5: [203, 184],
  },
}

// ACI 211.1 Table 6.3.3 — Approximate air content (%)
const AIR_TABLE = {
  non: { 10: 3, 12.5: 2.5, 19: 2, 25: 1.5, 37.5: 1 },
  air: { 10: 6, 12.5: 5.5, 19: 5, 25: 4.5, 37.5: 4.5 },
}

// ACI 211.1 Table 6.3.4a — Max W/C for strength (non-air, by 28-day f'c MPa)
// Interpolated: [fc_mpa, wc]
const WC_TABLE_NON_AIR = [
  [17, 0.67], [21, 0.58], [24, 0.53],
  [28, 0.48], [31, 0.44], [35, 0.40],
  [41, 0.35], [48, 0.30],
]
const WC_TABLE_AIR = [
  [17, 0.54], [21, 0.46], [24, 0.40],
  [28, 0.35], [31, 0.30],
]

// ACI 211.1 Table 6.3.6 — Vol. of CA per unit vol. concrete (b/b₀)
// [MAS → { FM: fraction }] — interpolate between FM values
const CA_TABLE = {
  10:   { 2.40: 0.50, 2.60: 0.48, 2.80: 0.46, 3.00: 0.44 },
  12.5: { 2.40: 0.59, 2.60: 0.57, 2.80: 0.55, 3.00: 0.53 },
  19:   { 2.40: 0.66, 2.60: 0.64, 2.80: 0.62, 3.00: 0.60 },
  25:   { 2.40: 0.71, 2.60: 0.69, 2.80: 0.67, 3.00: 0.65 },
  37.5: { 2.40: 0.75, 2.60: 0.73, 2.80: 0.71, 3.00: 0.69 },
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function interpolate(table, x) {
  // table: [[x0,y0],[x1,y1],...] sorted by x ascending
  if (x <= table[0][0])                   return table[0][1]
  if (x >= table[table.length - 1][0])    return table[table.length - 1][1]
  for (let i = 0; i < table.length - 1; i++) {
    const [x0, y0] = table[i]
    const [x1, y1] = table[i + 1]
    if (x >= x0 && x <= x1) {
      return y0 + (y1 - y0) * (x - x0) / (x1 - x0)
    }
  }
  return table[table.length - 1][1]
}

function interpolateCA(mas, fm) {
  const row = CA_TABLE[mas] || CA_TABLE[19]
  const fmKeys = Object.keys(row).map(Number).sort((a,b) => a-b)
  if (fm <= fmKeys[0])                    return row[fmKeys[0]]
  if (fm >= fmKeys[fmKeys.length - 1])   return row[fmKeys[fmKeys.length - 1]]
  for (let i = 0; i < fmKeys.length - 1; i++) {
    const f0 = fmKeys[i], f1 = fmKeys[i + 1]
    if (fm >= f0 && fm <= f1) {
      return row[f0] + (row[f1] - row[f0]) * (fm - f0) / (f1 - f0)
    }
  }
  return row[fmKeys[fmKeys.length - 1]]
}

function nearestAggSize(mas) {
  const sizes = AGG_SIZES
  return sizes.reduce((prev, curr) =>
    Math.abs(curr - mas) < Math.abs(prev - mas) ? curr : prev
  )
}

// ─── Main design function ──────────────────────────────────────────────────

export function designMix(inp) {
  const {
    fc, stddev, airType, slump, maxAgg,
    gcCement, gfa, gca, druw, fm,
    faMoisture, faAbsorb, caMoisture, caAbsorb,
  } = inp

  const masKey = nearestAggSize(Number(maxAgg))
  const isAir  = airType === 'air'

  // ── Step 1: f'cr ──────────────────────────────────────────────
  const s = stddev
  let fcr, step1formula
  if (fc < 35) {
    const a = fc + 1.34 * s
    const b = fc + 2.33 * s - 3.45
    fcr = Math.max(a, b)
    step1formula = `max(f'c + 1.34s, f'c + 2.33s − 3.45) = max(${a.toFixed(2)}, ${b.toFixed(2)})`
  } else {
    const a = fc + 1.34 * s
    const b = 0.9 * fc + 2.33 * s
    fcr = Math.max(a, b)
    step1formula = `max(f'c + 1.34s, 0.9f'c + 2.33s) = max(${a.toFixed(2)}, ${b.toFixed(2)})`
  }
  const step1 = { fcr, formula: step1formula }

  // ── Step 2: W/C ───────────────────────────────────────────────
  const wcTable = isAir ? WC_TABLE_AIR : WC_TABLE_NON_AIR
  const wc = Math.min(interpolate(wcTable, fcr), 0.70)
  const step2 = { wc, formula: `Interpolated from ACI T6.3.4a at f'cr=${fcr.toFixed(2)} MPa → W/C=${wc.toFixed(3)}` }

  // ── Step 3: Mixing water ───────────────────────────────────────
  const waterRow  = WATER_TABLE[slump]?.[masKey] ?? WATER_TABLE['75-100'][19]
  const waterNominal = waterRow[isAir ? 1 : 0]
  const step3 = { waterNominal, formula: `ACI T6.3.3: slump=${slump}, MAS=${masKey}mm, ${isAir?'air':'non-air'} → ${waterNominal} kg/m³` }

  // ── Step 4: Cement ────────────────────────────────────────────
  const cement = waterNominal / wc
  const cementBags = cement / 50
  const step4 = {
    cement, cementBags,
    formula: `C = W÷(W/C) = ${waterNominal}÷${wc.toFixed(3)} = ${cement.toFixed(1)} kg/m³ (${cementBags.toFixed(1)} bags)`,
  }

  // ── Step 5: Air ───────────────────────────────────────────────
  const airPct = AIR_TABLE[airType]?.[masKey] ?? 2
  const Vair   = airPct / 100
  const step5  = { airPct, Vair, formula: `ACI T6.3.3: ${isAir?'air-entrained':'non-air'}, MAS=${masKey}mm → ${airPct}%` }

  // ── Step 6: Abs. volumes of water & cement ────────────────────
  const Vw = waterNominal / 1000
  const Vc = cement / (gcCement * 1000)
  const step6 = {
    Vw, Vc,
    formula: `Vw=${waterNominal}/1000=${Vw.toFixed(4)} m³ · Vc=${cement.toFixed(1)}/(${gcCement}×1000)=${Vc.toFixed(4)} m³`,
  }

  // ── Step 7: Coarse aggregate ──────────────────────────────────
  const caFraction = interpolateCA(masKey, fm)
  const caKgSSD    = caFraction * druw
  const Vca        = caKgSSD / (gca * 1000)
  const step7 = {
    caFraction, caKgSSD, Vca,
    formula: `b/b₀=${caFraction.toFixed(3)} (FM=${fm}, MAS=${masKey}mm) · CA=${caFraction.toFixed(3)}×${druw}=${caKgSSD.toFixed(1)} kg`,
  }

  // ── Step 8: Fine aggregate (by difference) ────────────────────
  const Vfa     = 1 - Vw - Vc - Vair - Vca
  const faKgSSD = Vfa * gfa * 1000
  const step8 = {
    Vfa, faKgSSD,
    formula: `Vfa = 1 − ${Vw.toFixed(4)} − ${Vc.toFixed(4)} − ${Vair.toFixed(4)} − ${Vca.toFixed(4)} = ${Vfa.toFixed(4)} m³`,
  }

  // ── Step 9: Moisture corrections ──────────────────────────────
  const faFreeMC   = (faMoisture - faAbsorb) / 100
  const caFreeMC   = (caMoisture - caAbsorb) / 100
  const waterFromFA = faKgSSD * faFreeMC
  const waterFromCA = caKgSSD * caFreeMC
  const faField    = faKgSSD * (1 + faMoisture / 100)
  const caField    = caKgSSD * (1 + caMoisture / 100)
  const waterField = waterNominal - waterFromFA - waterFromCA
  const step9 = {
    faField, caField, waterField, waterFromFA, waterFromCA,
    formula: `FA field=${faKgSSD.toFixed(1)}×(1+${faMoisture}%)=${faField.toFixed(1)} · CA field=${caKgSSD.toFixed(1)}×(1+${caMoisture}%)=${caField.toFixed(1)} · W adj=${waterNominal}−${waterFromFA.toFixed(1)}−${waterFromCA.toFixed(1)}=${waterField.toFixed(1)}`,
  }

  // ── Step 10: Yield verification ───────────────────────────────
  const totalVol = Vw + Vc + Vair + Vca + Vfa
  const step10 = {
    totalVol,
    formula: `Vw+Vc+Vair+Vca+Vfa = ${Vw.toFixed(4)}+${Vc.toFixed(4)}+${Vair.toFixed(4)}+${Vca.toFixed(4)}+${Vfa.toFixed(4)} = ${totalVol.toFixed(4)} m³`,
  }

  // ── Mix ratio ─────────────────────────────────────────────────
  const ratio = { fa: faKgSSD / cement, ca: caKgSSD / cement }

  // ── Warnings ──────────────────────────────────────────────────
  const warnings = []
  if (wc > 0.60)
    warnings.push({ level: 'warn', msg: `W/C = ${wc.toFixed(3)} exceeds 0.60 — durability concern (ACI 318).` })
  if (cement < 280)
    warnings.push({ level: 'warn', msg: `Cement = ${cement.toFixed(0)} kg/m³ is below ACI min of 280 kg/m³.` })
  if (cement > 540)
    warnings.push({ level: 'warn', msg: `Cement = ${cement.toFixed(0)} kg/m³ exceeds 540 kg/m³ — thermal cracking risk.` })
  const faSharePct = Vfa / totalVol * 100
  if (faSharePct < 25)
    warnings.push({ level: 'warn', msg: `FA volume = ${faSharePct.toFixed(1)}% is below 25% — harsh mix.` })
  if (faSharePct > 45)
    warnings.push({ level: 'warn', msg: `FA volume = ${faSharePct.toFixed(1)}% exceeds 45% — high shrinkage risk.` })
  if (Math.abs(totalVol - 1) > 0.025)
    warnings.push({ level: 'warn', msg: `Yield = ${totalVol.toFixed(4)} m³ deviates >2.5% from 1.000 — check Gc, Gfa, Gca.` })
  if (warnings.length === 0)
    warnings.push({ level: 'ok', msg: 'All ACI 211.1 compliance checks passed.' })

  return { inp, step1, step2, step3, step4, step5, step6, step7, step8, step9, step10, ratio, warnings }
}

// ─── Quantity helpers ──────────────────────────────────────────────────────

export function calcElementVolume(type, dims) {
  const d = (k) => parseFloat(dims[k]) || 0
  switch (type) {
    case 'slab':    return d('length') * d('width') * d('thickness')
    case 'beam':    return d('length') * d('width') * d('depth')
    case 'column':  return d('height') * d('width') * d('depth')
    case 'footing': return d('length') * d('width') * d('thickness')
    case 'circ':    return Math.PI * (d('diameter')/2) ** 2 * d('height')
    default:        return 0
  }
}

export function scaleToVolume(result, vol) {
  const { step4, step3, step8, step7, step9 } = result
  return {
    vol,
    cement: step4.cement    * vol,
    bags:   step4.cementBags * vol,
    water:  step9.waterField * vol,
    sand:   step9.faField    * vol,
    ca:     step9.caField    * vol,
  }
}
