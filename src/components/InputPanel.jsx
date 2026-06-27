import { GRADES, AGG_SIZES, SLUMP_OPTIONS, CEMENT_TYPES, PLACEMENTS } from '../lib/aci211.js'

export default function InputPanel({ inputs, setInputs, onCalculate }) {
  const set = (k, v) => setInputs(prev => ({ ...prev, [k]: v }))
  const num = (k, v) => set(k, parseFloat(v) || v)

  const handleGrade = (grade, fc) => setInputs(prev => ({ ...prev, grade, fc }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Project info */}
      <div className="card">
        <div className="section-title">Project Info</div>
        <div className="grid-2">
          <div className="field">
            <label>Project Name</label>
            <input value={inputs.projName} onChange={e => set('projName', e.target.value)} />
          </div>
          <div className="field">
            <label>Mix ID</label>
            <input value={inputs.mixId} onChange={e => set('mixId', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Strength */}
      <div className="card">
        <div className="section-title">Strength Parameters</div>
        <div style={{ marginBottom: 12 }}>
          <div className="field" style={{ marginBottom: 8 }}>
            <label>Concrete Grade</label>
          </div>
          <div className="pill-group">
            {Object.entries(GRADES).map(([g, fc]) => (
              <button key={g} className={`pill ${inputs.grade === g ? 'active' : ''}`}
                onClick={() => handleGrade(g, fc)}>{g}</button>
            ))}
          </div>
        </div>
        <div className="grid-2">
          <div className="field">
            <label>f'c (MPa)</label>
            <input type="number" value={inputs.fc} onChange={e => num('fc', e.target.value)} />
          </div>
          <div className="field">
            <label>Std Dev σ (MPa)</label>
            <input type="number" step="0.1" value={inputs.stddev} onChange={e => num('stddev', e.target.value)} />
          </div>
          <div className="field">
            <label>Design Age (days)</label>
            <select value={inputs.designAge} onChange={e => set('designAge', parseInt(e.target.value))}>
              {[7,14,28,56].map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Placement</label>
            <select value={inputs.placement} onChange={e => set('placement', e.target.value)}>
              {PLACEMENTS.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Mix Parameters */}
      <div className="card">
        <div className="section-title">Mix Parameters</div>
        <div style={{ display: 'grid', gap: 12 }}>
          <div className="field">
            <label>Slump Range</label>
            <select value={inputs.slump} onChange={e => set('slump', e.target.value)}>
              {SLUMP_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="grid-2">
            <div className="field">
              <label>Max Agg. Size (mm)</label>
              <select value={inputs.maxAgg} onChange={e => num('maxAgg', e.target.value)}>
                {AGG_SIZES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Cement Type</label>
              <select value={inputs.cementType} onChange={e => set('cementType', e.target.value)}>
                {CEMENT_TYPES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="field">
            <label>Air Condition</label>
            <div className="pill-group">
              <button className={`pill ${inputs.airType==='non'?'active':''}`} onClick={() => set('airType','non')}>Non-Air Entrained</button>
              <button className={`pill ${inputs.airType==='air'?'active':''}`} onClick={() => set('airType','air')}>Air Entrained</button>
            </div>
          </div>
        </div>
      </div>

      {/* Cement */}
      <div className="card">
        <div className="section-title">Cement</div>
        <div className="field">
          <label>Sp. Gravity of Cement (Gc)</label>
          <input type="number" step="0.01" value={inputs.gcCement} onChange={e => num('gcCement', e.target.value)} />
        </div>
      </div>

      {/* Fine Aggregate */}
      <div className="card">
        <div className="section-title">Fine Aggregate (Sand)</div>
        <div className="grid-2">
          <div className="field">
            <label>Sp. Gravity (Gfa)</label>
            <input type="number" step="0.01" value={inputs.gfa} onChange={e => num('gfa', e.target.value)} />
          </div>
          <div className="field">
            <label>Fineness Modulus</label>
            <input type="number" step="0.1" value={inputs.fm} onChange={e => num('fm', e.target.value)} />
          </div>
          <div className="field">
            <label>Moisture Content (%)</label>
            <input type="number" step="0.1" value={inputs.faMoisture} onChange={e => num('faMoisture', e.target.value)} />
          </div>
          <div className="field">
            <label>Absorption (%)</label>
            <input type="number" step="0.1" value={inputs.faAbsorb} onChange={e => num('faAbsorb', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Coarse Aggregate */}
      <div className="card">
        <div className="section-title">Coarse Aggregate</div>
        <div className="grid-2">
          <div className="field">
            <label>Sp. Gravity (Gca)</label>
            <input type="number" step="0.01" value={inputs.gca} onChange={e => num('gca', e.target.value)} />
          </div>
          <div className="field">
            <label>DRUW (kg/m³)</label>
            <input type="number" step="10" value={inputs.druw} onChange={e => num('druw', e.target.value)} />
          </div>
          <div className="field">
            <label>Moisture Content (%)</label>
            <input type="number" step="0.1" value={inputs.caMoisture} onChange={e => num('caMoisture', e.target.value)} />
          </div>
          <div className="field">
            <label>Absorption (%)</label>
            <input type="number" step="0.1" value={inputs.caAbsorb} onChange={e => num('caAbsorb', e.target.value)} />
          </div>
        </div>
      </div>

      <button className="btn btn-primary btn-full" style={{ padding: '14px', fontSize: 16 }} onClick={onCalculate}>
        ⚗️ Design Mix
      </button>
    </div>
  )
}
