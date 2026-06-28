import {
  GRADES, SLUMP_OPTIONS, AGG_SIZES, CEMENT_TYPES, PLACEMENTS,
  EXPOSURE_CLASSES, STDDEV_GUIDE, ADMIXTURE_WATER_REDUCTION,
} from '../lib/aci211.js'

const SCM_OPTIONS = [
  { value: 'none',     label: 'None' },
  { value: 'flyash_c', label: 'Fly Ash Class C' },
  { value: 'flyash_f', label: 'Fly Ash Class F' },
  { value: 'ggbs',     label: 'GGBS / Slag' },
  { value: 'silica',   label: 'Silica Fume' },
]

const ADMIXTURE_OPTIONS = [
  { value: 'none',        label: 'None' },
  { value: 'wr_normal',   label: 'Water Reducer Type A (−8%)' },
  { value: 'wr_mid',      label: 'Mid-Range WR (−12%)' },
  { value: 'hrwr',        label: 'Superplasticizer Type F (−20%)' },
  { value: 'hrwr_retard', label: 'HRWR + Retarder Type G (−20%)' },
]

export default function InputPanel({ inputs, setInputs, onCalculate }) {
  const set = (key, val) => setInputs(prev => ({ ...prev, [key]: val }))

  const handleGrade = (grade, fc) => {
    setInputs(prev => ({ ...prev, grade, fc }))
  }

  const isMetric = inputs.unitSystem !== 'imperial'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Unit System toggle — top */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="section-label" style={{ margin: 0 }}>Unit System</span>
        <div className="pill-group" style={{ gap: 4 }}>
          {['metric', 'imperial'].map(u => (
            <button
              key={u}
              className={`pill ${inputs.unitSystem === u ? 'active' : ''}`}
              style={{ fontSize: 12, minHeight: 32, padding: '0 12px' }}
              onClick={() => set('unitSystem', u)}
            >
              {u === 'metric' ? 'SI (kg/m³)' : 'Imperial (lb/yd³)'}
            </button>
          ))}
        </div>
      </div>

      <hr className="divider" style={{ margin: 0 }} />

      {/* Project Info */}
      <section>
        <div className="section-label">Project</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="field">
            <label>Project Name</label>
            <input
              type="text"
              value={inputs.projName}
              onChange={e => set('projName', e.target.value)}
              placeholder="My Project"
            />
          </div>
          <div className="field">
            <label>Mix ID</label>
            <input
              type="text"
              value={inputs.mixId}
              onChange={e => set('mixId', e.target.value)}
              placeholder="MX-001"
            />
          </div>
        </div>
      </section>

      <hr className="divider" style={{ margin: 0 }} />

      {/* Strength Parameters */}
      <section>
        <div className="section-label">Strength Parameters</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          <div className="field">
            <label>Concrete Grade</label>
            <div className="pill-group">
              {Object.entries(GRADES).map(([grade, fc]) => (
                <button
                  key={grade}
                  className={`pill ${inputs.grade === grade ? 'active' : ''}`}
                  onClick={() => handleGrade(grade, fc)}
                >
                  {grade}
                </button>
              ))}
            </div>
          </div>

          <div className="grid-2">
            <div className="field">
              <label>f'c ({isMetric ? 'MPa' : 'psi'})</label>
              <input
                type="number"
                min="10" max="80" step="1"
                value={inputs.fc}
                onChange={e => set('fc', parseFloat(e.target.value))}
              />
            </div>
            <div className="field">
              <label>
                Std Dev ({isMetric ? 'MPa' : 'psi'})
                <span style={{ color: 'var(--accent)', marginLeft: 6, fontSize: 10, fontWeight: 600, cursor: 'help' }} title={STDDEV_GUIDE.map(g => `${g.label}: ${g.value}`).join(' | ')}>
                  ?
                </span>
              </label>
              <input
                type="number"
                min="0" max="10" step="0.1"
                value={inputs.stddev}
                onChange={e => set('stddev', parseFloat(e.target.value))}
              />
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                {STDDEV_GUIDE.map(g => (
                  <button
                    key={g.label}
                    onClick={() => set('stddev', g.value)}
                    style={{
                      fontSize: 10, padding: '2px 7px', borderRadius: 4,
                      border: '1px solid var(--border)', background: 'transparent',
                      color: inputs.stddev === g.value ? 'var(--accent)' : 'var(--text-3)',
                      cursor: 'pointer', fontFamily: 'var(--font)',
                      borderColor: inputs.stddev === g.value ? 'var(--accent)' : 'var(--border)',
                    }}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid-2">
            <div className="field">
              <label>Design Age (days)</label>
              <select value={inputs.designAge} onChange={e => set('designAge', parseInt(e.target.value))}>
                {[7, 14, 28, 56].map(d => (
                  <option key={d} value={d}>{d} days</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Placement</label>
              <select value={inputs.placement} onChange={e => set('placement', e.target.value)}>
                {PLACEMENTS.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      <hr className="divider" style={{ margin: 0 }} />

      {/* Mix Parameters */}
      <section>
        <div className="section-label">Mix Parameters</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          <div className="field">
            <label>Slump Range</label>
            <select value={inputs.slump} onChange={e => set('slump', e.target.value)}>
              {SLUMP_OPTIONS.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="grid-2">
            <div className="field">
              <label>Max Agg. Size (mm)</label>
              <select value={inputs.maxAgg} onChange={e => set('maxAgg', parseFloat(e.target.value))}>
                {AGG_SIZES.map(s => (
                  <option key={s} value={s}>{s} mm</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Cement Type</label>
              <select value={inputs.cementType} onChange={e => set('cementType', e.target.value)}>
                {CEMENT_TYPES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="field">
            <label>Air Condition</label>
            <div className="pill-group">
              <button
                className={`pill ${inputs.airType === 'non' ? 'active' : ''}`}
                onClick={() => set('airType', 'non')}
              >
                Non-Air Entrained
              </button>
              <button
                className={`pill ${inputs.airType === 'air' ? 'active' : ''}`}
                onClick={() => set('airType', 'air')}
              >
                Air Entrained
              </button>
            </div>
          </div>

          {/* Exposure Class */}
          <div className="field">
            <label>Exposure Class (ACI 318)</label>
            <select value={inputs.exposureClass} onChange={e => set('exposureClass', e.target.value)}>
              {Object.keys(EXPOSURE_CLASSES).map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
            {inputs.exposureClass !== 'None' && EXPOSURE_CLASSES[inputs.exposureClass] && (
              <div style={{
                marginTop: 6, padding: '7px 10px', background: 'var(--accent-lt)',
                border: '1px solid var(--accent)', borderRadius: 'var(--r-sm)',
                fontSize: 11, color: 'var(--accent)', lineHeight: 1.55,
              }}>
                {EXPOSURE_CLASSES[inputs.exposureClass].maxWCM && `Max W/CM: ${EXPOSURE_CLASSES[inputs.exposureClass].maxWCM}  `}
                {EXPOSURE_CLASSES[inputs.exposureClass].minCement && `Min cement: ${EXPOSURE_CLASSES[inputs.exposureClass].minCement} kg/m³  `}
                {EXPOSURE_CLASSES[inputs.exposureClass].minFc && `Min f'c: ${EXPOSURE_CLASSES[inputs.exposureClass].minFc} MPa`}
              </div>
            )}
          </div>
        </div>
      </section>

      <hr className="divider" style={{ margin: 0 }} />

      {/* Admixtures */}
      <section>
        <div className="section-label">Chemical Admixtures</div>
        <div className="field">
          <label>Water Reducer / Plasticizer</label>
          <select value={inputs.admixture} onChange={e => set('admixture', e.target.value)}>
            {ADMIXTURE_OPTIONS.map(a => (
              <option key={a.value} value={a.value}>{a.label}</option>
            ))}
          </select>
        </div>
      </section>

      <hr className="divider" style={{ margin: 0 }} />

      {/* SCM */}
      <section>
        <div className="section-label">Supplementary Cementitious Materials</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="field">
            <label>SCM Type</label>
            <select value={inputs.scmType} onChange={e => set('scmType', e.target.value)}>
              {SCM_OPTIONS.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          {inputs.scmType !== 'none' && (
            <div className="field">
              <label>Replacement Level (%)</label>
              <input
                type="number"
                min="5" max="50" step="1"
                value={inputs.scmReplace}
                onChange={e => set('scmReplace', parseFloat(e.target.value))}
              />
              <div style={{
                marginTop: 6, padding: '6px 10px', background: 'var(--surface-2)',
                border: '1px solid var(--border)', borderRadius: 'var(--r-sm)',
                fontSize: 11, color: 'var(--text-3)',
              }}>
                {inputs.scmType === 'flyash_c' && 'Class C fly ash: 15–40% typical replacement'}
                {inputs.scmType === 'flyash_f' && 'Class F fly ash: 15–25% typical; may slow strength gain'}
                {inputs.scmType === 'ggbs' && 'GGBS: 25–50% typical; good sulfate resistance'}
                {inputs.scmType === 'silica' && 'Silica fume: 5–15% typical; reduces permeability significantly'}
              </div>
            </div>
          )}
        </div>
      </section>

      <hr className="divider" style={{ margin: 0 }} />

      {/* Material Properties */}
      <section>
        <div className="section-label">Material Properties</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          <div className="grid-2">
            <div className="field">
              <label>Gc Cement</label>
              <input
                type="number" step="0.01"
                value={inputs.gcCement}
                onChange={e => set('gcCement', parseFloat(e.target.value))}
              />
            </div>
            <div className="field">
              <label>Gfa (Fine Agg.)</label>
              <input
                type="number" step="0.01"
                value={inputs.gfa}
                onChange={e => set('gfa', parseFloat(e.target.value))}
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="field">
              <label>FM (Fine Agg.)</label>
              <input
                type="number" step="0.1"
                value={inputs.fm}
                onChange={e => set('fm', parseFloat(e.target.value))}
              />
            </div>
            <div className="field">
              <label>Gca (Coarse Agg.)</label>
              <input
                type="number" step="0.01"
                value={inputs.gca}
                onChange={e => set('gca', parseFloat(e.target.value))}
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="field">
              <label>DRUW ({isMetric ? 'kg/m³' : 'lb/ft³'})</label>
              <input
                type="number" step="10"
                value={inputs.druw}
                onChange={e => set('druw', parseFloat(e.target.value))}
              />
            </div>
          </div>
        </div>
      </section>

      <hr className="divider" style={{ margin: 0 }} />

      {/* Moisture */}
      <section>
        <div className="section-label">Moisture Conditions</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="grid-2">
            <div className="field">
              <label>FA Moisture (%)</label>
              <input
                type="number" step="0.1"
                value={inputs.faMoisture}
                onChange={e => set('faMoisture', parseFloat(e.target.value))}
              />
            </div>
            <div className="field">
              <label>FA Absorb (%)</label>
              <input
                type="number" step="0.1"
                value={inputs.faAbsorb}
                onChange={e => set('faAbsorb', parseFloat(e.target.value))}
              />
            </div>
          </div>
          <div className="grid-2">
            <div className="field">
              <label>CA Moisture (%)</label>
              <input
                type="number" step="0.1"
                value={inputs.caMoisture}
                onChange={e => set('caMoisture', parseFloat(e.target.value))}
              />
            </div>
            <div className="field">
              <label>CA Absorb (%)</label>
              <input
                type="number" step="0.1"
                value={inputs.caAbsorb}
                onChange={e => set('caAbsorb', parseFloat(e.target.value))}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Calculate button */}
      <button
        className="btn btn-primary btn-full"
        onClick={onCalculate}
        style={{ fontSize: 15, minHeight: 50 }}
      >
        Design Mix
      </button>

    </div>
  )
}
