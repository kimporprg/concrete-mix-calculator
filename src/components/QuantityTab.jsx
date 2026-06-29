// QuantityTab.jsx
import { useState } from 'react'
import { calcElementVolume, scaleToVolume } from '../lib/aci211'

const ELEMENTS = [
  { key:'slab',    label:'Slab',         dims:[{k:'length',l:'Length (m)'},{k:'width',l:'Width (m)'},{k:'thickness',l:'Thickness (m)'}] },
  { key:'beam',    label:'Beam',         dims:[{k:'length',l:'Length (m)'},{k:'width',l:'Width (m)'},{k:'depth',l:'Depth (m)'}] },
  { key:'column',  label:'Column (Rect)',dims:[{k:'height',l:'Height (m)'},{k:'width',l:'Width (m)'},{k:'depth',l:'Depth (m)'}] },
  { key:'footing', label:'Footing',      dims:[{k:'length',l:'Length (m)'},{k:'width',l:'Width (m)'},{k:'thickness',l:'Thickness (m)'}] },
  { key:'circ',    label:'Circ. Col.',   dims:[{k:'diameter',l:'Diameter (m)'},{k:'height',l:'Height (m)'}] },
]

export default function QuantityTab({ result }) {
  const [type, setType]   = useState('slab')
  const [dims, setDims]   = useState({})
  const [qty,  setQty]    = useState(null)

  const elem = ELEMENTS.find(e => e.key === type)
  const setD = (k,v) => setDims(p => ({ ...p, [k]: v }))

  function compute() {
    const vol = calcElementVolume(type, dims)
    if (vol <= 0) return
    setQty(scaleToVolume(result, vol))
  }

  return (
    <div>
      {/* Element type */}
      <div className="section-label">Element Type</div>
      <div className="pill-group" style={{ marginBottom: 16 }}>
        {ELEMENTS.map(e => (
          <button key={e.key}
            className={`pill ${type === e.key ? 'active' : ''}`}
            onClick={() => { setType(e.key); setDims({}); setQty(null) }}>
            {e.label}
          </button>
        ))}
      </div>

      {/* Dimensions */}
      <div className="section-label">Dimensions</div>
      <div style={{ display:'grid', gridTemplateColumns:`repeat(${elem.dims.length > 2 ? 3 : 2}, 1fr)`, gap:10, marginBottom:16 }}>
        {elem.dims.map(d => (
          <div key={d.k}>
            <div className="field-label">{d.l}</div>
            <input type="number" className="field-input" inputMode="decimal"
              value={dims[d.k] ?? ''}
              onChange={e => setD(d.k, e.target.value)} />
          </div>
        ))}
      </div>

      <button onClick={compute} className="btn btn-primary btn-full">
        Compute Quantities
      </button>

      {/* Results */}
      {qty && (
        <div style={{ marginTop: 16 }}>
          <div className="section-label">Material Quantities</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8, marginBottom:8 }}>
            {[
              { label:'Volume',   val:`${qty.vol.toFixed(3)} m³`, unit:'' },
              { label:'Cement',   val:`${qty.cement.toFixed(1)}`, unit:'kg' },
              { label:'Bags',     val:`${qty.bags.toFixed(1)}`,   unit:'bags' },
              { label:'Water',    val:`${qty.water.toFixed(1)}`,  unit:'kg' },
              { label:'Sand',     val:`${qty.sand.toFixed(1)}`,   unit:'kg' },
              { label:'Coarse',   val:`${qty.ca.toFixed(1)}`,     unit:'kg' },
            ].map(t => (
              <div key={t.label} className="metric-tile">
                <div className="metric-label">{t.label}</div>
                <div className="metric-value" style={{ fontSize:16 }}>{t.val}</div>
                <div className="metric-unit">{t.unit}</div>
              </div>
            ))}
          </div>
          <div className="alert alert-warn" style={{ marginTop:6 }}>
            Add 3–5% wastage for procurement.
          </div>
        </div>
      )}
    </div>
  )
}
