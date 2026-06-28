// ────────────────────────────────────────────────────────────
//  ACI 211.1 Absolute Volume Method — Pure JS, no React deps
//  v2: SCM/admixture support, exposure class checks, imperial
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

// ACI 318 Table 19.3.3 — Durability / exposure class max W/CM and min cement
// Format: { maxWCM, minCement (kg/m³), minFc (MPa) }
export const EXPOSURE_CLASSES = {
  'None': null,
  // Freezing & thawing (F)
  'F0 — No exposure':         { maxWCM: null, minCement: null, minFc: null },
  'F1 — Moderate':            { maxWCM: 0.55, minCement: 310,  minFc: 28  },
  'F2 — Severe':              { maxWCM: 0.45, minCement: 335,  minFc: 31  },
  // Sulfate (S)
  'S0 — Negligible':          { maxWCM: null, minCement: null, minFc: null },
  'S1 — Moderate (150 ppm)':  { maxWCM: 0.50, minCement: 335,  minFc: 28  },
  'S2 — Severe (1500 ppm)':   { maxWCM: 0.45, minCement: 360,  minFc: 31  },
  'S3 — Very Severe':         { maxWCM: 0.40, minCement: 390,  minFc: 35  },
  // Water/permeability (W)
  'W0 — Dry or low perm.':    { maxWCM: null, minCement: null, minFc: null },
  'W1 — Moderate':            { maxWCM: 0.50, minCement: null, minFc: null },
  'W2 — Severe':              { maxWCM: 0.45, minCement: null, minFc: null },
  // Corrosion (C)
  'C0 — Dry / protected':     { maxWCM: null, minCement: null, minFc: null },
  'C1 — Moderate':            { maxWCM: 0.50, minCement: 290,  minFc: null },
  'C2 — Severe':              { maxWCM: 0.40, minCement: 335,  minFc: 35  },
}

export const GRADES    = { M10:10, M15:15, M20:20, M25:25, M30:30, M35:35, M40:40, M45:45, M50:50 }
export const AGG_SIZES = [10, 19, 25, 37.5]
export const SLUMP_OPTIONS = [
  { label: '25–50 mm',   value: 'sl1' },
  { label: '75–100 mm',  value: 'sl2' },
  { label: '100–150 mm', value: 'sl3' },
  { label: '150–175 mm', value: 'sl4' },
]
export const CEMENT_TYPES  = ['OPC / Type I', 'Type II', 'Type III (HES)', 'PPC', 'SRC / Type V']
export const PLACEMENTS    = ['Footing', 'Slab', 'Beam', 'Column', 'Pavement', 'Wall', 'Pile']

// Typical stddev by QC level, for UI hint
export const STDDEV_GUIDE = [
  { label: 'Excellent QC', value: 2.5 },
  { label: 'Good QC',      value: 3.5 },
  { label: 'Fair QC',      value: 5.0 },
  { label: 'Poor QC',      value: 7.0 },
]

// Water reducer effect: removes this % of mixing water
export const ADMIXTURE_WATER_REDUCTION = {
  none:         0,
  wr_normal:    8,   // Normal water reducer (ASTM C494 Type A)
  wr_mid:       12,  // Mid-range WR
  hrwr:         20,  // High-range WR / superplasticizer (Type F)
  hrwr_retard:  20,  // HRWR + retarder (Type G)
}

// SCM specific gravity (typical)
export const SCM_SG = {
  flyash_c:  2.70,
  flyash_f:  2.20,
  ggbs:      2.90,
  silica:    2.20,
}

export const DEFAULT_INPUTS = {
  projName: 'My Project', mixId: 'MX-001',
  grade: 'M20', designAge: 28,
  fc: 20, stddev: 3.5,
  placement: 'Slab', slump: 'sl2', maxAgg: 19,
  cementType: 'OPC / Type I', airType: 'non',
  exposureClass: 'None',
  gcCement: 3.15,
  gfa: 2.65, fm: 2.7, faMoisture: 2.5, faAbsorb: 1.2,
  gca: 2.70, druw: 1600, caMoisture: 1.0, caAbsorb: 0.8,
  // Admixtures
  admixture: 'none',
  // SCM
  scmType: 'none',
  scmReplace: 0,    // % cement replacement
  unitSystem: 'metric',
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
  const {
    fc, stddev, airType, maxAgg, slump, gcCement, gfa, fm, gca, druw,
    faMoisture, faAbsorb, caMoisture, caAbsorb,
    admixture = 'none',
    scmType = 'none', scmReplace = 0,
    exposureClass = 'None',
  } = inp

  const fcN   = parseFloat(fc)
  const s     = parseFloat(stddev)
  const Gc    = parseFloat(gcCement)
  const Gfa   = parseFloat(gfa)
  const Gca   = parseFloat(gca)
  const DRUW  = parseFloat(druw)
  const FM    = parseFloat(fm)
  const aggSize = parseFloat(maxAgg)
  const scmPct  = Math.min(parseFloat(scmReplace) || 0, 50) / 100

  // ── Step 1 — Required average strength f'cr ──────────────
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

  // ── Step 2 — W/CM ratio ───────────────────────────────────
  // Apply exposure class cap if set
  const expReq = EXPOSURE_CLASSES[exposureClass]
  let wcMax = airType === 'air' ? 0.65 : 0.80
  if (expReq?.maxWCM) wcMax = Math.min(wcMax, expReq.maxWCM)

  let wc = interp(fcr, WC_TABLE[airType])
  wc = Math.min(wc, wcMax)
  const step2formula = `Interpolated from ACI Table 6.3.4(a) for f'cr=${fcr.toFixed(1)} MPa → ${wc.toFixed(3)}, cap ${wcMax}${expReq?.maxWCM ? ` (${exposureClass})` : ''}`

  // ── Step 3 — Water content (before admixture reduction) ──
  const waterBase = WATER_TABLE[airType][aggSize][slump]
  const admixReduction = ADMIXTURE_WATER_REDUCTION[admixture] || 0
  const waterNominal = waterBase * (1 - admixReduction / 100)
  const step3formula = admixture !== 'none'
    ? `ACI Table 6.3.3: ${waterBase} kg/m³ × (1−${admixReduction}% WR) = ${waterNominal.toFixed(1)} kg/m³`
    : `ACI Table 6.3.3: airType=${airType}, aggSize=${aggSize}mm, slump=${slump} → ${waterNominal.toFixed(1)} kg/m³`

  // ── Step 4 — Total cementitious (CM) + Cement + SCM ──────
  const cm      = waterNominal / wc          // total cementitious kg/m³
  const cementKg = cm * (1 - scmPct)
  const scmKg   = cm * scmPct
  const cementBags = cementKg / 50

  // Apply exposure class min cement if needed
  const minCem = expReq?.minCement || 0
  const cementFinal = Math.max(cementKg, minCem / (1 - scmPct || 1))
  const cmFinal = cementFinal / (1 - scmPct || 1)

  const step4formula = scmType !== 'none'
    ? `CM = ${waterNominal.toFixed(1)}/${wc.toFixed(3)} = ${cm.toFixed(1)} kg/m³; Cement=${cementKg.toFixed(1)}, ${scmType.toUpperCase()}=${scmKg.toFixed(1)} kg`
    : `C = W/WC = ${waterNominal.toFixed(1)}/${wc.toFixed(3)} = ${cm.toFixed(1)} kg/m³ = ${cementBags.toFixed(2)} bags`

  // ── Step 5 — Air volume ────────────────────────────────────
  const airPct = AIR_TABLE[airType][aggSize]
  const Vair   = airPct / 100
  const step5formula = `ACI Table 6.3.3: ${airPct}% → Vair = ${Vair.toFixed(4)} m³/m³`

  // ── Step 6 — Absolute volumes of water and cementitious ──
  const Vw = waterNominal / 1000
  const Vc = cementKg / (Gc * 1000)

  // SCM volume
  const Gscm = scmType !== 'none' ? (SCM_SG[scmType] || 2.5) : 0
  const Vscm = scmType !== 'none' ? scmKg / (Gscm * 1000) : 0
  const step6formula = `Vw=${Vw.toFixed(4)}, Vc=${cementKg.toFixed(1)}/(${Gc}×1000)=${Vc.toFixed(4)}${Vscm > 0 ? `, Vscm=${Vscm.toFixed(4)}` : ''}`

  // ── Step 7 — Coarse aggregate ─────────────────────────────
  const caFraction = getCAFraction(FM, aggSize)
  const caKgSSD    = caFraction * DRUW
  const Vca        = caKgSSD / (Gca * 1000)
  const step7formula = `b/b₀=${caFraction.toFixed(3)} × DRUW=${DRUW} = ${caKgSSD.toFixed(1)} kg, Vca=${Vca.toFixed(4)}`

  // ── Step 8 — Fine aggregate ────────────────────────────────
  const Vfa   = 1 - Vw - Vc - Vscm - Vair - Vca
  const faKgSSD = Vfa * Gfa * 1000
  const step8formula = `Vfa = 1−${Vw.toFixed(4)}−${Vc.toFixed(4)}−${Vscm.toFixed(4)}−${Vair.toFixed(4)}−${Vca.toFixed(4)} = ${Vfa.toFixed(4)}, FA=${faKgSSD.toFixed(1)} kg`

  // ── Step 9 — Moisture corrections ─────────────────────────
  const faM = parseFloat(faMoisture), faA = parseFloat(faAbsorb)
  const caM = parseFloat(caMoisture), caA = parseFloat(caAbsorb)
  const faField    = faKgSSD * (1 + faM / 100)
  const caField    = caKgSSD * (1 + caM / 100)
  const waterFromFA = faKgSSD * (faM - faA) / 100
  const waterFromCA = caKgSSD * (caM - caA) / 100
  const waterField  = waterNominal - waterFromFA - waterFromCA
  const step9formula = `W_field = ${waterNominal.toFixed(1)}−(${waterFromFA.toFixed(2)})−(${waterFromCA.toFixed(2)}) = ${waterField.toFixed(1)} kg`

  // ── Step 10 — Yield ────────────────────────────────────────
  const totalVol = Vw + Vc + Vscm + Vair + Vca + Vfa
  const step10formula = `${Vw.toFixed(4)}+${Vc.toFixed(4)}+${Vscm.toFixed(4)}+${Vair.toFixed(4)}+${Vca.toFixed(4)}+${Vfa.toFixed(4)} = ${totalVol.toFixed(4)} m³`

  // Mix ratio (cement=1)
  const ratio = {
    c:  1,
    w:  waterField / cementKg,
    s:  faField    / cementKg,
    ca: caField    / cementKg,
  }

  // ── Compliance warnings ───────────────────────────────────
  const warnings = []
  if (wc > 0.60)         warnings.push({ level:'warn', msg:'W/CM > 0.60 — consider reducing slump or adding water reducer' })
  if (cementKg < 280)    warnings.push({ level:'warn', msg:`Cement ${cementKg.toFixed(0)} kg/m³ below ACI minimum of 280 kg/m³` })
  if (cementKg > 540)    warnings.push({ level:'warn', msg:`Cement ${cementKg.toFixed(0)} kg/m³ exceeds recommended maximum of 540 kg/m³` })
  const vfaPct = Vfa * 100
  if (vfaPct < 25 || vfaPct > 45) warnings.push({ level:'warn', msg:`Sand volume ${vfaPct.toFixed(1)}% outside typical 25–45% range` })
  if (Math.abs(totalVol - 1) > 0.025) warnings.push({ level:'warn', msg:`Yield ${totalVol.toFixed(4)} deviates >2.5% from 1.000 — verify specific gravities` })
  if (expReq?.minFc && fcN < expReq.minFc) warnings.push({ level:'warn', msg:`f'c ${fcN} MPa below exposure class minimum of ${expReq.minFc} MPa` })
  if (expReq?.minCement && cementKg < expReq.minCement) warnings.push({ level:'warn', msg:`Cement ${cementKg.toFixed(0)} kg/m³ below exposure class minimum of ${expReq.minCement} kg/m³` })
  if (scmPct > 0.40)     warnings.push({ level:'warn', msg:`SCM replacement ${(scmPct*100).toFixed(0)}% is high — verify long-term strength` })
  if (warnings.length === 0) warnings.push({ level:'ok', msg:'All ACI 211.1 compliance checks passed ✓' })

  return {
    step1:  { fcr, formula: step1formula },
    step2:  { wc, formula: step2formula },
    step3:  { waterNominal, formula: step3formula },
    step4:  { cement: cementKg, cementBags, scmKg, cm, formula: step4formula },
    step5:  { airPct, Vair, formula: step5formula },
    step6:  { Vw, Vc, Vscm, formula: step6formula },
    step7:  { caFraction, caKgSSD, Vca, formula: step7formula },
    step8:  { Vfa, faKgSSD, formula: step8formula },
    step9:  { faField, caField, waterField, waterFromFA, waterFromCA, formula: step9formula },
    step10: { totalVol, formula: step10formula },
    ssd:    { cement: cementKg.toFixed(1), water: waterNominal.toFixed(1), sand: faKgSSD.toFixed(1), ca: caKgSSD.toFixed(1), scm: scmKg.toFixed(1) },
    field:  { cement: cementKg.toFixed(1), water: waterField.toFixed(1),   sand: faField.toFixed(1), ca: caField.toFixed(1),  scm: scmKg.toFixed(1) },
    volumes:{ Vc, Vw, Vscm, Vfa, Vca, Vair, total: totalVol },
    wc, airPct, caFraction,
    ratio,
    warnings,
    scmType, scmKg, scmPct,
    admixture, admixReduction,
    inp,
  }
}

// ── Element volume calculator ──────────────────────────────
export function calcElementVolume(type, dims) {
  const d = dims
  switch (type) {
    case 'slab':    return (d.L||0) * (d.W||0) * (d.T||0)
    case 'beam':    return (d.L||0) * (d.W||0) * (d.D||0)
    case 'column':  return (d.H||0) * (d.W||0) * (d.D||0)
    case 'footing': return (d.L||0) * (d.W||0) * (d.T||0)
    case 'circ':    return Math.PI * Math.pow((d.Dia||0)/2, 2) * (d.H||0)
    case 'wall':    return (d.L||0) * (d.H||0) * (d.T||0)
    case 'pile':    return Math.PI * Math.pow((d.Dia||0)/2, 2) * (d.H||0)
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
    scm:    (parseFloat(f.scm || 0)  * v).toFixed(1),
    bags:   bags.toFixed(2),
    vol:    v.toFixed(3),
  }
}

// ── Unit conversion helpers ────────────────────────────────
export function toImperial(result) {
  // kg/m³ → lb/yd³  (×1.6856)
  const K = 1.6856
  // MPa → psi (×145.038)
  const P = 145.038
  const r = result
  return {
    ...r,
    step1: { ...r.step1, fcr: r.step1.fcr * P },
    step3: { ...r.step3, waterNominal: r.step3.waterNominal * K },
    step4: { ...r.step4, cement: r.step4.cement * K, scmKg: r.step4.scmKg * K },
    step9: { ...r.step9, waterField: r.step9.waterField * K, faField: r.step9.faField * K, caField: r.step9.caField * K },
    ssd:   {
      cement: (parseFloat(r.ssd.cement) * K).toFixed(1),
      water:  (parseFloat(r.ssd.water)  * K).toFixed(1),
      sand:   (parseFloat(r.ssd.sand)   * K).toFixed(1),
      ca:     (parseFloat(r.ssd.ca)     * K).toFixed(1),
      scm:    (parseFloat(r.ssd.scm||0) * K).toFixed(1),
    },
    field: {
      cement: (parseFloat(r.field.cement) * K).toFixed(1),
      water:  (parseFloat(r.field.water)  * K).toFixed(1),
      sand:   (parseFloat(r.field.sand)   * K).toFixed(1),
      ca:     (parseFloat(r.field.ca)     * K).toFixed(1),
      scm:    (parseFloat(r.field.scm||0) * K).toFixed(1),
    },
    _imperial: true,
  }
}
