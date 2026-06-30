// InputPanel.jsx
import { GRADES, AGG_SIZES, SLUMP_OPTIONS, CEMENT_TYPES, PLACEMENTS } from '../lib/aci211'

export default function InputPanel({ inputs, setInputs, onCalculate }) {
  const set = (k, v) => setInputs(prev => ({ ...prev, [k]: v }))
  const num = (k, v) => set(k, parseFloat(v) || 0)
  const inp = inputs

  return (
    <div style={{ paddingBottom: 24 }}>

      {/* ── Project ─────────────────────────────── */}
      <div className="section-label">Project</div>
      <Field label="Project Name" htmlFor="inp-projName">
        <input id="inp-projName" className="field-input" value={inp.projName}
          onChange={e => set('projName', e.target.value)} />
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Field label="Mix ID" htmlFor="inp-mixId">
          <input id="inp-mixId" className="field-input" value={inp.mixId}
            onChange={e => set('mixId', e.target.value)} />
        </Field>
        <Field label="Placement" htmlFor="inp-placement">
          <select id="inp-placement" className="field-input" value={inp.placement}
            onChange={e => set('placement', e.target.value)}>
            {PLACEMENTS.map(p => <option key={p}>{p}</option>)}
          </select>
        </Field>
      </div>

      {/* ── Strength ────────────────────────────── */}
      <div className="section-label" style={{ marginTop: 18 }}>Strength</div>
      <Field label="Concrete Grade">
        <div className="pill-group">
          {Object.entries(GRADES).map(([g, v]) => (
            <button key={g} type="button"
              className={`pill ${inp.grade === g ? 'active' : ''}`}
              aria-pressed={inp.grade === g}
              onClick={() => { set('grade', g); set('fc', v) }}>
              {g}
            </button>
          ))}
        </div>
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        <Field label="f'c (MPa)" htmlFor="inp-fc">
          <input id="inp-fc" type="number" className="field-input" value={inp.fc}
            onChange={e => num('fc', e.target.value)} inputMode="decimal" />
        </Field>
        <Field label="Std. Dev. (MPa)" htmlFor="inp-stddev">
          <input id="inp-stddev" type="number" className="field-input" value={inp.stddev}
            onChange={e => num('stddev', e.target.value)} inputMode="decimal" />
        </Field>
        <Field label="Design Age" htmlFor="inp-designAge">
          <select id="inp-designAge" className="field-input" value={inp.designAge}
            onChange={e => set('designAge', Number(e.target.value))}>
            {[7,14,28,56].map(d => <option key={d} value={d}>{d} days</option>)}
          </select>
        </Field>
      </div>

      {/* ── Workability ──────────────────────────── */}
      <div className="section-label" style={{ marginTop: 18 }}>Workability</div>
      <Field label="Target Slump">
        <div className="pill-group">
          {SLUMP_OPTIONS.map(s => (
            <button key={s.value} type="button"
              className={`pill ${inp.slump === s.value ? 'active' : ''}`}
              aria-pressed={inp.slump === s.value}
              onClick={() => set('slump', s.value)}>
              {s.label}
            </button>
          ))}
        </div>
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 10 }}>
        {AGG_SIZES.map(s => (
          <button key={s} type="button"
            className={`pill ${Number(inp.maxAgg) === s ? 'active' : ''}`}
            aria-pressed={Number(inp.maxAgg) === s}
            style={{ borderRadius: 8, fontSize: 12 }}
            onClick={() => set('maxAgg', s)}>
            {s} mm
          </button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
        <Field label="Cement Type" htmlFor="inp-cementType">
          <select id="inp-cementType" className="field-input" value={inp.cementType}
            onChange={e => set('cementType', e.target.value)}>
            {CEMENT_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Air Entrainment">
          <div className="pill-group">
            {[['non','Non-air'],['air','Air']].map(([v,l]) => (
              <button key={v} type="button"
                className={`pill ${inp.airType === v ? 'active' : ''}`}
                aria-pressed={inp.airType === v}
                onClick={() => set('airType', v)} style={{ flex: 1 }}>{l}</button>
            ))}
          </div>
        </Field>
      </div>

      {/* ── Cement properties ───────────────────── */}
      <div className="section-label" style={{ marginTop: 18 }}>Cement Properties</div>
      <Field label="Gc - Specific Gravity of Cement" htmlFor="inp-gcCement">
        <input id="inp-gcCement" type="number" className="field-input" value={inp.gcCement}
          onChange={e => num('gcCement', e.target.value)} inputMode="decimal" step="0.01" />
      </Field>

      {/* ── Fine Aggregate ───────────────────────── */}
      <div className="section-label" style={{ marginTop: 18 }}>Fine Aggregate (Sand)</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Field label="Gfa - Specific Gravity" htmlFor="inp-gfa">
          <input id="inp-gfa" type="number" className="field-input" value={inp.gfa}
            onChange={e => num('gfa', e.target.value)} inputMode="decimal" step="0.01" />
        </Field>
        <Field label="FM - Fineness Modulus" htmlFor="inp-fm">
          <input id="inp-fm" type="number" className="field-input" value={inp.fm}
            onChange={e => num('fm', e.target.value)} inputMode="decimal" step="0.01" />
        </Field>
        <Field label="Moisture Content (%)" htmlFor="inp-faMoisture">
          <input id="inp-faMoisture" type="number" className="field-input" value={inp.faMoisture}
            onChange={e => num('faMoisture', e.target.value)} inputMode="decimal" step="0.1" />
        </Field>
        <Field label="Absorption (%)" htmlFor="inp-faAbsorb">
          <input id="inp-faAbsorb" type="number" className="field-input" value={inp.faAbsorb}
            onChange={e => num('faAbsorb', e.target.value)} inputMode="decimal" step="0.1" />
        </Field>
      </div>

      {/* ── Coarse Aggregate ─────────────────────── */}
      <div className="section-label" style={{ marginTop: 18 }}>Coarse Aggregate</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Field label="Gca - Specific Gravity" htmlFor="inp-gca">
          <input id="inp-gca" type="number" className="field-input" value={inp.gca}
            onChange={e => num('gca', e.target.value)} inputMode="decimal" step="0.01" />
        </Field>
        <Field label="DRUW (kg/m³)" htmlFor="inp-druw">
          <input id="inp-druw" type="number" className="field-input" value={inp.druw}
            onChange={e => num('druw', e.target.value)} inputMode="numeric" />
        </Field>
        <Field label="Moisture Content (%)" htmlFor="inp-caMoisture">
          <input id="inp-caMoisture" type="number" className="field-input" value={inp.caMoisture}
            onChange={e => num('caMoisture', e.target.value)} inputMode="decimal" step="0.1" />
        </Field>
        <Field label="Absorption (%)" htmlFor="inp-caAbsorb">
          <input id="inp-caAbsorb" type="number" className="field-input" value={inp.caAbsorb}
            onChange={e => num('caAbsorb', e.target.value)} inputMode="decimal" step="0.1" />
        </Field>
      </div>

      <button type="button" className="btn btn-primary btn-full" style={{ marginTop: 24 }}
        onClick={onCalculate}>
        Calculate Mix
      </button>
    </div>
  )
}

function Field({ label, htmlFor, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label htmlFor={htmlFor} className="field-label">{label}</label>
      {children}
    </div>
  )
}
