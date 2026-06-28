import { GRADES, SLUMP_OPTIONS, AGG_SIZES, CEMENT_TYPES, PLACEMENTS } from '../lib/aci211.js'

export default function InputPanel({ inputs, setInputs, onCalculate }) {
  const set = (key, val) => setInputs(prev => ({ ...prev, [key]: val }))

  const handleGrade = (grade, fc) => {
    setInputs(prev => ({ ...prev, grade, fc }))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

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
              <label>f'c (MPa)</label>
              <input
                type="number"
                min="10" max="60" step="1"
                value={inputs.fc}
                onChange={e => set('fc', parseFloat(e.target.value))}
              />
            </div>
            <div className="field">
              <label>Std Dev (MPa)</label>
              <input
                type="number"
                min="0" max="10" step="0.1"
                value={inputs.stddev}
                onChange={e => set('stddev', parseFloat(e.target.value))}
              />
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
              <label>DRUW (kg/m3)</label>
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
