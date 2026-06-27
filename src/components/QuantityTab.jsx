import { useState } from 'react'
import { calcElementVolume, scaleToVolume } from '../lib/aci211.js'

const ELEMENTS = [
  { key:'slab',    label:'Slab',        dims:[{k:'L',label:'Length (m)'},{k:'W',label:'Width (m)'},{k:'T',label:'Thickness (m)'}] },
  { key:'beam',    label:'Beam',        dims:[{k:'L',label:'Length (m)'},{k:'W',label:'Width (m)'},{k:'D',label:'Depth (m)'}] },
  { key:'column',  label:'Column (rect)',dims:[{k:'H',label:'Height (m)'},{k:'W',label:'Width (m)'},{k:'D',label:'Depth (m)'}] },
  { key:'footing', label:'Footing',     dims:[{k:'L',label:'Length (m)'},{k:'W',label:'Width (m)'},{k:'T',label:'Thickness (m)'}] },
  { key:'circ',    label:'Circ. Col.',  dims:[{k:'Dia',label:'Diameter (m)'},{k:'H',label:'Height (m)'}] },
]

export default function QuantityTab({ result }) {
  const [elemType, setElemType] = useState('slab')
  const [dims, setDims] = useState({})
  const [qty, setQty] = useState(null)
  const [count, setCount] = useState(1)
  const [scaled, setScaled] = useState(null)

  const elem = ELEMENTS.find(e => e.key === elemType)

  const compute = () => {
    const vol = calcElementVolume(elemType, dims)
    const totalVol = vol * (parseInt(count)||1)
    setQty(vol)
    setScaled(scaleToVolume(result, totalVol))
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      {/* Element type selector */}
      <div className="card-sm">
        <div className="section-title">Element Type</div>
        <div className="pill-group">
          {ELEMENTS.map(e => (
            <button key={e.key} className={`pill ${elemType===e.key?'active':''}`}
              onClick={() => { setElemType(e.key); setDims({}); setQty(null); setScaled(null) }}>
              {e.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dimensions */}
      <div className="card-sm">
        <div className="section-title">Dimensions</div>
        <div className="grid-2" style={{ marginBottom: 12 }}>
          {elem.dims.map(d => (
            <div key={d.k} className="field">
              <label>{d.label}</label>
              <input type="number" step="0.01" placeholder="0.00"
                value={dims[d.k]||''}
                onChange={e => setDims(prev => ({...prev, [d.k]: parseFloat(e.target.value)||0}))} />
            </div>
          ))}
          <div className="field">
            <label>Count (pcs)</label>
            <input type="number" min="1" value={count} onChange={e => setCount(parseInt(e.target.value)||1)} />
          </div>
        </div>
        <button className="btn btn-primary btn-full" onClick={compute}>Calculate Quantities</button>
      </div>

      {/* Results */}
      {scaled && (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div className="card-sm">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
              <span style={{ fontSize:13, color:'var(--muted)' }}>Volume per element</span>
              <span style={{ fontFamily:'var(--font-mono)', color:'var(--white)' }}>{(qty||0).toFixed(3)} m³</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:13, color:'var(--muted)' }}>Total volume ({count} pcs)</span>
              <span style={{ fontFamily:'var(--font-mono)', color:'var(--accent)', fontSize:18, fontWeight:700 }}>{scaled.vol} m³</span>
            </div>
          </div>
          <div className="grid-2">
            {[
              { label:'Cement', val:scaled.cement, unit:'kg' },
              { label:'Bags',   val:scaled.bags,   unit:'bags (50kg)' },
              { label:'Water',  val:scaled.water,  unit:'kg' },
              { label:'Sand',   val:scaled.sand,   unit:'kg' },
              { label:'Coarse', val:scaled.ca,     unit:'kg' },
            ].map(t => (
              <div key={t.label} className="metric-tile">
                <div className="metric-label">{t.label}</div>
                <div className="metric-value">{t.val}</div>
                <div className="metric-unit">{t.unit}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
