// GuideTab.jsx — In-app Field & Output Reference Guide
// Embedded directly so it works offline with no network dependency.

const SECTIONS = [
  {
    id: 'project',
    title: '📋 Project Information',
    color: 'var(--mid)',
    items: [
      {
        symbol: 'Name',
        name: 'Project Name',
        body: 'A label for the project. Appears as a header in the CSV export. Use something descriptive like "Block A — Ground Slab" so you can identify the file later.',
        extra: null,
      },
      {
        symbol: 'Mix ID',
        name: 'Mix ID',
        body: 'A short code for this specific design (e.g. MX-B1-01). The exported CSV is named after this ID. Keep IDs unique per design so files don\'t overwrite each other.',
        extra: null,
      },
      {
        symbol: 'Type',
        name: 'Placement Type',
        body: 'Where the concrete will be placed — Slab, Beam, Column, Footing, or Pavement. Informational only. Does not change any calculation.',
        extra: null,
      },
    ],
  },
  {
    id: 'strength',
    title: '💪 Strength & Design',
    color: 'var(--accent)',
    items: [
      {
        symbol: "f'c",
        name: 'Specified Compressive Strength',
        body: "The strength your concrete must meet or exceed, as written on the structural drawings — 'M25' or '25 MPa' both mean f'c = 25 MPa. Tapping a Grade button sets this automatically.",
        extra: { label: 'Analogy', text: "f'c is the pass mark. The concrete must score at least this when tested at the design age." },
      },
      {
        symbol: "f'cr",
        name: "Required Average Strength (OUTPUT)",
        body: "The target average strength the mix must hit so that most individual batches still exceed f'c. Always higher than f'c because of production variability. The entire design is built around this number.",
        extra: { label: 'Formula', text: "f'c < 35: f'cr = max(f'c + 1.34s,  f'c + 2.33s − 3.45)\nf'c ≥ 35: f'cr = max(f'c + 1.34s,  0.9·f'c + 2.33s)", mono: true },
      },
      {
        symbol: 's',
        name: 'Standard Deviation',
        body: 'Measures how spread out your past concrete test results are. A higher s forces a higher f\'cr, which means more cement. Good batching control reduces s and saves cement cost.',
        extra: { label: 'No data?', text: 'Use 3.5–4.5 MPa as a conservative starting point when no historical records exist.' },
      },
      {
        symbol: 'Age',
        name: 'Design Age',
        body: "The curing age at which f'c must be achieved. 28 days is the standard for almost all structural concrete. 56 days is used for blended cements (PPC, fly ash) that gain strength slowly.",
        extra: null,
      },
    ],
  },
  {
    id: 'workability',
    title: '🌊 Workability & Aggregate',
    color: 'var(--ok)',
    items: [
      {
        symbol: 'Slump',
        name: 'Target Slump Range',
        body: 'How fluid the fresh concrete is. More slump = more workable, but requires more water, raising W/C and reducing strength. Controls the mixing water lookup in ACI Table 6.3.3.',
        extra: {
          label: 'Options',
          text: '25–50 mm → stiff, pavements\n75–100 mm → standard reinforced concrete ✓\n100–150 mm → congested steel, pump mixes\n150–175 mm → very fluid (use plasticiser instead)',
          mono: false,
        },
      },
      {
        symbol: 'MAS',
        name: 'Max. Aggregate Size',
        body: 'Largest particle size of your coarse aggregate. Larger aggregate needs less water for the same slump (less surface area to coat), which reduces cement. Limited by rebar spacing and member dimensions.',
        extra: { label: 'Common values', text: '10 mm thin slabs / congested cols · 19 mm general use · 25–37.5 mm mass concrete' },
      },
      {
        symbol: 'Air',
        name: 'Air Entrainment',
        body: 'Non-air → standard concrete for most tropical construction.\nAir-entrained → tiny bubbles introduced by admixture for freeze-thaw resistance. Changes all ACI lookup tables (water demand, W/C limits, air %).',
        extra: { label: 'Note', text: 'Select Non-air for most Southeast Asia projects. Air entrainment is required by ACI 318 for concrete exposed to freezing cycles.' },
      },
    ],
  },
  {
    id: 'cement',
    title: '🏭 Cement & Fine Aggregate',
    color: 'var(--warn)',
    items: [
      {
        symbol: 'Gc',
        name: 'Specific Gravity of Cement',
        body: 'How dense cement is relative to water (water = 1.0). OPC is ~3.15× denser. Used to convert cement mass to volume in Step 6.',
        extra: { label: 'Formula', text: 'Volume of cement (m³) = Mass (kg) ÷ (Gc × 1000)', mono: true },
      },
      {
        symbol: 'Gfa',
        name: 'Specific Gravity of Sand',
        body: 'Density of your sand relative to water. Used in Step 8 to convert the remaining volume back into a mass in kg.',
        extra: { label: 'Typical range', text: '2.60–2.70 for natural river sand. Get from your lab report (ASTM C128).' },
      },
      {
        symbol: 'FM',
        name: 'Fineness Modulus',
        body: 'A single number describing how coarse or fine your sand is overall, derived from a sieve analysis. Higher FM = coarser sand. Controls the coarse aggregate volume fraction lookup in ACI Table 6.3.6.',
        extra: { label: 'Typical range', text: '2.3 (very fine) → 2.6–2.8 (river sand) → 3.1 (coarse). ⚠️ Incorrect FM can shift CA content by 30–50 kg/m³.' },
      },
      {
        symbol: 'MC fa',
        name: 'FA Moisture Content (%)',
        body: 'Free surface water on your sand right now, as % of dry mass. The app adds this weight to the sand batch mass and removes it from the added water — so W/C stays correct.',
        extra: { label: 'Important', text: 'Measure on the day of casting. Changes daily with weather. Typical stockpile range: 1–5%.' },
      },
      {
        symbol: 'Abs fa',
        name: 'FA Absorption (%)',
        body: 'Maximum water sand particles absorb into their internal pores (SSD basis). A fixed material property. The moisture correction uses the difference between MC and Abs to find free surface moisture.',
        extra: { label: 'Typical range', text: '0.5–2.5%. Obtain from lab test report (ASTM C128).' },
      },
    ],
  },
  {
    id: 'ca',
    title: '🪨 Coarse Aggregate',
    color: 'var(--muted)',
    items: [
      {
        symbol: 'Gca',
        name: 'Specific Gravity of Coarse Agg.',
        body: 'Density of your crushed stone or gravel relative to water. Used in Step 7 to convert CA mass to absolute volume.',
        extra: { label: 'Typical range', text: '2.60–2.80 for crushed granite / limestone. Obtain from ASTM C127 test report.' },
      },
      {
        symbol: 'DRUW',
        name: 'Dry Rodded Unit Weight (kg/m³)',
        body: 'Mass of coarse aggregate that fits in 1 m³ when dry-rodded in a standard container — accounts for air voids between particles. Multiplied by the ACI Table 6.3.6 CA fraction to get the CA content per m³.',
        extra: { label: 'Formula', text: 'CA (kg/m³) = b/b₀ × DRUW\nTypical range: 1450–1750 kg/m³. Test per ASTM C29.', mono: true },
      },
      {
        symbol: 'MC ca',
        name: 'CA Moisture Content (%)',
        body: 'Free surface water on coarse aggregate. Works the same as FA moisture — batch mass of CA is increased, added water is reduced by the same amount.',
        extra: { label: 'Typical range', text: '0.5–2.0% for stockpiled crushed stone. Measure on the day of casting.' },
      },
      {
        symbol: 'Abs ca',
        name: 'CA Absorption (%)',
        body: 'Maximum water coarse aggregate particles absorb into their pores. Fixed material property. Used with CA moisture to compute the field water correction in Step 9.',
        extra: { label: 'Typical range', text: '0.3–1.5%. Obtain from ASTM C127 test report.' },
      },
    ],
  },
  {
    id: 'outputs',
    title: '📊 Output Values Explained',
    color: 'var(--accent)',
    items: [
      {
        symbol: "f'cr",
        name: "Required Average Strength",
        body: "The design target — higher than f'c to ensure most batches pass. Drives everything downstream.",
        extra: null,
      },
      {
        symbol: 'W/C',
        name: 'Water–Cement Ratio',
        body: 'Mass of water ÷ mass of cement. The most important factor for strength and durability. Lower = stronger. ACI warns when W/C > 0.60.',
        extra: { label: 'Range', text: '0.40–0.55 typical structural concrete · >0.60 durability concern' },
      },
      {
        symbol: 'C',
        name: 'Cement Content (kg/m³)',
        body: 'Kilograms of cement per cubic metre. Derived as Water ÷ W/C. ACI minimum = 280 kg/m³; practical maximum ~540 kg/m³ above which thermal cracking risk increases.',
        extra: { label: 'Formula', text: 'Cement = Water (kg/m³) ÷ W/C', mono: true },
      },
      {
        symbol: 'Bags',
        name: 'Cement Bags per m³',
        body: 'Practical procurement number = Cement ÷ 50. Multiply by total concrete volume (Quantity tab) to get your cement order quantity.',
        extra: null,
      },
      {
        symbol: 'W field',
        name: 'Water — Field Corrected',
        body: "The actual water you add at the mixer, after subtracting the free moisture already brought in by wet sand and stone. This is what you measure out — not the raw design water.",
        extra: { label: 'Key point', text: 'If aggregates are wet, this is lower than the design water. Always batch using field quantities.' },
      },
      {
        symbol: 'Air%',
        name: 'Air Content',
        body: 'Percentage of the concrete volume occupied by air voids. Looked up from ACI Table 6.3.3 based on aggregate size and air type. Non-air typical: 1–3%.',
        extra: null,
      },
      {
        symbol: 'SSD',
        name: 'SSD vs. Field Quantities',
        body: 'SSD (Saturated Surface Dry) = design proportions assuming perfectly neutral aggregates. Field = actual batch masses after moisture correction. Always batch using FIELD quantities.',
        extra: {
          label: 'Example',
          text: 'Sand SSD = 680 kg · MC = 3.5% · Abs = 1.2%\nField sand = 680 × 1.035 = 703.8 kg\nWater displaced = 680 × (3.5−1.2)/100 = 15.6 kg\nAdded water reduced by 15.6 kg',
          mono: true,
        },
      },
      {
        symbol: 'Yield',
        name: 'Yield — Total Volume',
        body: 'Sum of all absolute volumes (water + cement + air + CA + FA). Should equal 1.000 m³. Deviation > 2.5% means a specific gravity input is probably wrong.',
        extra: { label: 'Formula', text: 'Vw + Vc + Vair + Vca + Vfa ≈ 1.000 m³', mono: true },
      },
    ],
  },
  {
    id: 'warnings',
    title: '⚠️ Compliance Warnings',
    color: 'var(--warn)',
    items: [
      {
        symbol: 'W/C > 0.60',
        name: 'W/C Too High',
        body: "Concrete is too porous — durability suffers. Reduce slump, increase aggregate size, or add a water-reducing plasticiser to cut water by 10–15% while keeping the same workability.",
        extra: null,
      },
      {
        symbol: 'C < 280',
        name: 'Cement Below Minimum',
        body: "Below ACI 211.1 recommended minimum of 280 kg/m³. Not enough paste to coat all aggregate. Check if the project spec sets a minimum (often 300 kg/m³ for exposed RC).",
        extra: null,
      },
      {
        symbol: 'C > 540',
        name: 'Cement Too High',
        body: "Excess cement generates too much heat during curing (thermal cracking risk) and increases shrinkage. Try larger aggregate, lower slump, or partial replacement with fly ash/GGBS.",
        extra: null,
      },
      {
        symbol: 'Vfa out',
        name: 'Sand Volume Outside 25–45%',
        body: "< 25%: mix is harsh, hard to finish and compact. > 45%: sticky, high shrinkage, more water needed. Adjust fineness modulus or aggregate size.",
        extra: null,
      },
      {
        symbol: 'Yield ≠ 1',
        name: 'Yield Deviates > 2.5%',
        body: "Absolute volumes don't add up to 1 m³ — a specific gravity value is likely incorrect. Go back to your laboratory test reports and verify Gc, Gfa, and Gca.",
        extra: null,
      },
    ],
  },
]

export default function GuideTab() {
  return (
    <div style={{ padding: '4px 0 16px' }}>
      {/* Header */}
      <div style={{
        background: 'var(--ink2)', borderRadius: 10, padding: '14px 16px',
        marginBottom: 16, borderLeft: '3px solid var(--accent)',
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--white)', marginBottom: 4 }}>
          Field & Output Reference
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
          Every input and result explained — what it means, why it matters, and how it affects your mix.
        </div>
      </div>

      {SECTIONS.map(section => (
        <div key={section.id} style={{ marginBottom: 20 }}>
          {/* Section header */}
          <div style={{
            fontSize: 12, fontWeight: 700, letterSpacing: '0.5px',
            color: section.color, textTransform: 'uppercase',
            padding: '8px 4px 6px',
            borderBottom: `1px solid var(--line)`,
            marginBottom: 10,
          }}>
            {section.title}
          </div>

          {section.items.map(item => (
            <FieldCard key={item.symbol} item={item} accentColor={section.color} />
          ))}
        </div>
      ))}

      {/* Footer */}
      <div style={{
        textAlign: 'center', fontSize: 11, color: 'var(--muted)',
        paddingTop: 12, borderTop: '1px solid var(--line)', lineHeight: 1.8,
      }}>
        Based on ACI 211.1 (Absolute Volume Method) &amp; ACI 301-10<br />
        Values from lab tests always override assumed defaults.
      </div>
    </div>
  )
}

function FieldCard({ item, accentColor }) {
  return (
    <div style={{
      background: 'var(--ink2)', borderRadius: 8,
      marginBottom: 8, overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.06)',
    }}>
      {/* Card header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 14px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(255,255,255,0.03)',
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
          color: 'var(--ink)', background: accentColor,
          padding: '2px 8px', borderRadius: 4, whiteSpace: 'nowrap', flexShrink: 0,
        }}>
          {item.symbol}
        </span>
        <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--white)', lineHeight: 1.3 }}>
          {item.name}
        </span>
      </div>

      {/* Card body */}
      <div style={{ padding: '10px 14px' }}>
        <p style={{
          fontSize: 13, color: 'var(--muted)', lineHeight: 1.6,
          margin: 0, whiteSpace: 'pre-line',
        }}>
          {item.body}
        </p>

        {item.extra && (
          <div style={{
            marginTop: 8,
            background: 'rgba(0,0,0,0.25)',
            borderRadius: 6, padding: '8px 10px',
            borderLeft: `2px solid ${accentColor}`,
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: accentColor, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
              {item.extra.label}
            </div>
            <div style={{
              fontSize: 12,
              color: item.extra.mono ? '#7EC8E3' : 'var(--line)',
              fontFamily: item.extra.mono ? 'var(--font-mono)' : 'inherit',
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
            }}>
              {item.extra.text}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
