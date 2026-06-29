// GuideTab.jsx — In-app reference guide (all data inline, works fully offline)

const SECTIONS = [
  {
    id: 'project', color: 'var(--muted)', title: 'Project Information',
    items: [
      { sym: 'Name',   name: 'Project Name',
        body: 'A label for the project. Appears in the CSV export header. Use something descriptive like "Block A — Ground Slab" so you can identify the file later.' },
      { sym: 'Mix ID', name: 'Mix ID',
        body: "A short code for this specific design (e.g. MX-B1-01). The exported CSV is named after this ID. Keep each ID unique so files don't overwrite each other." },
      { sym: 'Type',   name: 'Placement Type',
        body: 'Where the concrete will be placed — Slab, Beam, Column, Footing, or Pavement. Informational only, does not change any calculation.' },
    ],
  },
  {
    id: 'strength', color: 'var(--accent)', title: "Strength & Design",
    items: [
      { sym: "f'c", name: 'Specified Compressive Strength',
        body: "The strength your concrete must meet, written on the structural drawings. M25 = f'c 25 MPa. Tapping a Grade button sets this automatically.",
        extra: { label: 'Think of it as', text: "The pass mark — concrete must score at least this when tested at the design age." } },
      { sym: "f'cr", name: "Required Average Strength (OUTPUT)",
        body: "The design target — always higher than f'c because of batch-to-batch variability. The entire mix is proportioned to hit this number.",
        extra: { label: 'Formula', mono: true,
          text: "f'c < 35 MPa: max(f'c + 1.34s,  f'c + 2.33s − 3.45)\nf'c ≥ 35 MPa: max(f'c + 1.34s,  0.9·f'c + 2.33s)" } },
      { sym: 's', name: 'Standard Deviation',
        body: "How spread-out your past test results are. Higher s → higher f'cr → more cement and cost. Good batching control reduces s.",
        extra: { label: 'No records?', text: 'Use 3.5–4.5 MPa as a conservative default.' } },
      { sym: 'Age',  name: 'Design Age',
        body: "Age at which f'c must be achieved. 28 days is the industry standard for structural concrete. 56 days is used for slow-gaining blended cements (PPC, fly ash)." },
    ],
  },
  {
    id: 'workability', color: '#C0C0C0', title: 'Workability & Aggregate',
    items: [
      { sym: 'Slump', name: 'Target Slump Range',
        body: 'How fluid the fresh concrete is — more slump needs more water, which raises W/C and reduces strength. Drives the mixing water lookup in ACI Table 6.3.3.',
        extra: { label: 'Options',
          text: '25–50 mm → stiff, pavements\n75–100 mm → standard reinforced concrete (recommended)\n100–150 mm → congested steel, pump mixes\n150–175 mm → very fluid (better to use a plasticiser)' } },
      { sym: 'MAS',  name: 'Max. Aggregate Size',
        body: 'Largest coarse particle size. Larger aggregate needs less water for the same slump (less surface area to coat), reducing cement. Limited by rebar spacing.',
        extra: { label: 'Common', text: '10 mm thin/congested · 19 mm general use (recommended) · 25–37.5 mm mass concrete' } },
      { sym: 'Cem.', name: 'Cement Type',
        body: 'Identifies the binder. Informational only — label appears in the export but does not change any ACI number.',
        extra: { label: 'Options',
          text: 'OPC / Type I — standard structural concrete\nType II — moderate sulphate resistance\nType III — high early strength, faster strip\nPPC — blended with fly ash, slower gain, better durability' } },
      { sym: 'Air',  name: 'Air Entrainment',
        body: 'Non-air → standard for tropical & general structural concrete.\nAir-entrained → bubbles added by admixture for freeze-thaw durability. Changes all ACI lookup tables.',
        extra: { label: 'For SE Asia', text: 'Select Non-air for most projects. Air entrainment is required by ACI 318 only for freeze-thaw or de-icing salt exposure.' } },
    ],
  },
  {
    id: 'cement-fa', color: 'var(--warn)', title: 'Cement & Fine Aggregate (Sand)',
    items: [
      { sym: 'Gc',  name: 'Specific Gravity of Cement',
        body: 'How dense cement is compared to water (water = 1.0). OPC is ~3.15× denser. Used in Step 6 to convert cement mass to volume.',
        extra: { label: 'Formula', mono: true, text: 'V_cement (m³) = Mass (kg) ÷ (Gc × 1000)' } },
      { sym: 'Gfa', name: 'Specific Gravity of Sand',
        body: 'Density of your sand relative to water. Used in Step 8 to convert the remaining volume back to a mass in kg.',
        extra: { label: 'Typical', text: '2.60–2.70 for river sand. From your lab report (ASTM C128).' } },
      { sym: 'FM',  name: 'Fineness Modulus of Sand',
        body: 'One number that describes how coarse or fine your sand is overall, from a sieve analysis. Higher FM = coarser sand. Controls the ACI Table 6.3.6 CA fraction lookup.',
        extra: { label: 'Range', text: '2.3 very fine → 2.6–2.8 typical river sand → 3.1 coarse\nNote: wrong FM shifts CA content by 30–50 kg/m³.' } },
      { sym: 'MC fa',  name: 'FA Moisture Content (%)',
        body: 'Free surface water on the sand right now, as % of dry mass. The app adds this weight to the sand batch mass and removes it from added water — so W/C stays correct.',
        extra: { label: 'Important', text: 'Measure on the day of casting. Changes with weather. Typical stockpile: 1–5%.' } },
      { sym: 'Abs fa', name: 'FA Absorption (%)',
        body: 'Maximum water sand pores can absorb (SSD basis). Fixed material property. The correction uses MC minus Abs to find the net free surface moisture.',
        extra: { label: 'Typical', text: '0.5–2.5%. From lab report (ASTM C128).' } },
    ],
  },
  {
    id: 'ca', color: 'var(--muted)', title: 'Coarse Aggregate',
    items: [
      { sym: 'Gca',  name: 'Specific Gravity of Coarse Agg.',
        body: 'Density of your crushed stone or gravel relative to water. Used in Step 7 to convert CA mass to absolute volume.',
        extra: { label: 'Typical', text: '2.60–2.80 for granite/limestone. From ASTM C127 test report.' } },
      { sym: 'DRUW', name: 'Dry Rodded Unit Weight (kg/m³)',
        body: 'Mass of coarse aggregate that fits in 1 m³ when dry-rodded in a standard container. Accounts for voids between particles. Multiplied by the ACI 6.3.6 CA fraction to get kg/m³.',
        extra: { label: 'Formula', mono: true, text: 'CA (kg/m³) = b/b₀ × DRUW\nTypical: 1450–1750 kg/m³. Test per ASTM C29.' } },
      { sym: 'MC ca',  name: 'CA Moisture Content (%)',
        body: 'Free surface water on coarse aggregate. Same correction as FA — CA batch mass increases, added water decreases by the same amount.',
        extra: { label: 'Typical', text: '0.5–2.0% for stockpiled crushed stone. Measure on casting day.' } },
      { sym: 'Abs ca', name: 'CA Absorption (%)',
        body: 'Maximum water the CA particles absorb into their pores. Fixed material property. Used with CA moisture in the Step 9 field correction.',
        extra: { label: 'Typical', text: '0.3–1.5%. From ASTM C127 test report.' } },
    ],
  },
  {
    id: 'outputs', color: 'var(--accent)', title: 'Output Values',
    items: [
      { sym: "f'cr",    name: 'Required Average Strength',
        body: "Always higher than f'c. The entire design is built to hit this. Higher f'cr = more cement = higher cost." },
      { sym: 'W/C',     name: 'Water–Cement Ratio',
        body: 'Mass of water ÷ mass of cement. The single most important factor for strength and durability. Lower = stronger. ACI warns when W/C > 0.60.',
        extra: { label: 'Typical', text: '0.40–0.55 structural · 0.55–0.60 borderline · > 0.60 durability concern' } },
      { sym: 'C',       name: 'Cement (kg/m³)',
        body: 'Kilograms of cement per m³. = Water ÷ W/C. ACI min 280 kg/m³; max ~540 kg/m³ (above which thermal cracking risk rises).',
        extra: { label: 'Formula', mono: true, text: 'Cement (kg/m³) = Water (kg/m³) ÷ W/C' } },
      { sym: 'Bags',    name: 'Cement Bags / m³',
        body: 'Cement ÷ 50. Practical procurement number. Multiply by total pour volume (Quantity tab) to get your cement order.' },
      { sym: 'W field', name: 'Water — Field Corrected',
        body: "Actual water you add at the mixer, after subtracting free moisture brought in by the wet aggregates. Always batch from this number, not the raw design water.",
        extra: { label: 'Key', text: 'If aggregates are wet, this is lower than the design water. Using design water on wet agg makes the mix too wet.' } },
      { sym: 'Air%',    name: 'Air Content',
        body: 'Percentage of concrete volume occupied by air voids. Looked up from ACI Table 6.3.3 — not calculated. Non-air typical: 1–3%.' },
      { sym: 'SSD',     name: 'SSD vs. Field Quantities',
        body: "SSD = design quantities assuming perfectly neutral aggregates (pores filled, surface dry). Field = actual batch masses after moisture correction. Always batch using FIELD quantities.",
        extra: { label: 'Example', mono: true,
          text: 'Sand SSD=680 kg · MC=3.5% · Abs=1.2%\nField sand = 680×1.035 = 703.8 kg\nWater offset = 680×(3.5−1.2)/100 = 15.6 kg\nAdded water reduced by 15.6 kg' } },
      { sym: 'Yield',   name: 'Total Volume (Yield)',
        body: 'Sum of all absolute volumes. Must equal ≈ 1.000 m³. Deviation > 2.5% means a specific gravity input is likely wrong — check Gc, Gfa, Gca.',
        extra: { label: 'Formula', mono: true, text: 'Vw + Vc + Vair + Vca + Vfa ≈ 1.000 m³' } },
    ],
  },
  {
    id: 'warnings', color: 'var(--warn)', title: 'Compliance Warnings',
    items: [
      { sym: 'W/C>0.60', name: 'W/C Too High',
        body: 'Durability suffers — paste is too porous. Fix: reduce slump, increase aggregate size, or add a water-reducing plasticiser (10–15% water saving at same slump).' },
      { sym: 'C<280',    name: 'Cement Below Minimum',
        body: 'Below ACI 211.1 min of 280 kg/m³. Not enough paste to coat aggregates. Check if the project spec sets a minimum (often 300 kg/m³ for exposed RC).' },
      { sym: 'C>540',    name: 'Cement Too High',
        body: 'Excess heat of hydration → thermal cracking risk. Try larger aggregate, lower slump (use plasticiser), or partial SCM substitution (fly ash, GGBS).' },
      { sym: 'Vfa',      name: 'Sand Volume Outside 25–45%',
        body: '< 25%: harsh mix, hard to finish. > 45%: sticky, high shrinkage, excess water demand. Adjust FM or aggregate size.' },
      { sym: 'Yield',    name: 'Yield Deviates > 2.5%',
        body: "Absolute volumes don't sum to 1 m³. A specific gravity is likely wrong. Verify Gc, Gfa, and Gca from your laboratory test reports." },
    ],
  },
]

export default function GuideTab() {
  return (
    <div style={{ paddingBottom: 24 }}>
      {/* Intro banner */}
      <div style={{
        background: 'var(--accent-lt)', borderRadius: 10,
        padding: '12px 16px', marginBottom: 20,
        borderLeft: '3px solid var(--accent)',
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--white)', marginBottom: 3 }}>
          Field & Output Reference
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
          Every input and result explained — what it means, why it matters, and how it affects your mix.
        </div>
      </div>

      {SECTIONS.map(sec => (
        <div key={sec.id} style={{ marginBottom: 22 }}>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.8px',
            color: sec.color, textTransform: 'uppercase',
            borderBottom: '1px solid var(--line)', paddingBottom: 8, marginBottom: 10,
          }}>
            {sec.title}
          </div>
          {sec.items.map(item => (
            <FieldCard key={item.sym} item={item} color={sec.color} />
          ))}
        </div>
      ))}

      <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--mid)', paddingTop: 8, lineHeight: 1.8 }}>
        Based on ACI 211.1 & ACI 301-10<br />
        Lab-tested values always override assumed defaults.
      </div>
    </div>
  )
}

function FieldCard({ item, color }) {
  return (
    <div style={{
      background: 'var(--surface)', borderRadius: 8,
      border: '1px solid var(--line)', marginBottom: 8, overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '9px 14px',
        borderBottom: item.body || item.extra ? '1px solid var(--line)' : 'none',
        background: 'rgba(255,255,255,0.03)',
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
          background: color, color: 'var(--ink)',
          padding: '2px 7px', borderRadius: 4, whiteSpace: 'nowrap', flexShrink: 0,
        }}>
          {item.sym}
        </span>
        <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--white)' }}>
          {item.name}
        </span>
      </div>

      {(item.body || item.extra) && (
        <div style={{ padding: '10px 14px' }}>
          {item.body && (
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-line' }}>
              {item.body}
            </p>
          )}
          {item.extra && (
            <div style={{
              marginTop: 8, background: 'rgba(0,0,0,0.3)',
              borderRadius: 6, padding: '7px 10px',
              borderLeft: `2px solid ${color}`,
            }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: color, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>
                {item.extra.label}
              </div>
              <div style={{
                fontSize: 12, lineHeight: 1.6, whiteSpace: 'pre-wrap',
                fontFamily: item.extra.mono ? 'var(--font-mono)' : 'inherit',
                color: item.extra.mono ? '#D0D0D0' : 'var(--line)',
              }}>
                {item.extra.text}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
