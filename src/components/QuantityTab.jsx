import { useState } from 'react'
import { calcElementVolume, scaleToVolume } from '../lib/aci211.js'

const ELEMENTS = [
  {
    id: 'slab',    label: 'Slab',
    dims: [
      { key: 'l', label: 'Length (m)'    },
      { key: 'w', label: 'Width (m)'     },
      { key: 't', label: 'Thickness (m)' },
    ],
  },
  {
    id: 'beam',    label: 'Beam',
    dims: [
      { key: 'l', label: 'Length (m)' },
      { key: 'w', label: 'Width (m)'  },
      { key: 'd', label: 'Depth (m)'  },
    ],
  },
  {
    id: 'column',  label: 'Column (Rect.)',
    dims: [
      { key: 'h', label: 'Height (m)' },
      { key: 'w', label: 'Width (m)'  },
      { key: 'd', label: 'Depth (m)'  },
    ],
  },
  {
    id: 'footing', label: 'Footing',
    dims: [
      { key: 'l', label: 'Length (m)'    },
      { key: 'w', label: 'Width (m)'     },
      { key: 't', label: 'Thickness (m)' },
    ],
  },
  {
    id: 'circ',    label: 'Circ. Column',
    dims: [
      { key: 'dia', label: 'Diameter (m)' },
      { key: 'h',   label: 'Height (m)'   },
    ],
  },
]

export default function QuantityTab({ result, inputs }) {
  const [elementId, setElementId] = useState('slab')
  const [dims, setDims] = useState({ l: 6, w: 6, t: 0.15, d: 0.5, h: 3, dia: 0.6 })
  const [qty, setQty] = useState(null)

  const element = ELEMENTS.find(e => e.id === elementId)

  const compute = () => {
    try {
      const volM3 = calcElementVolume(elementId, dims)
      const scaled = scaleToVolume(result, volM3)
      setQty({ volM3, ...scaled })
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Element type */}
      <div className="card">
        <div className="section-label" style={{ marginBottom: 10 }}>Element Type</div>
        <div className="pill-group">
          {ELEMENTS.map(e => (
            <button
              key={e.id}
              className={`pill ${elementId === e.id ? 'active' : ''}`}
              onClick={() => { setElementId(e.id); setQty(null) }}
            >
              {e.label}
            </button>
          ))}
        </div>

        <hr className="divider" />

        {/* Dimension inputs */}
        <div className="section-label" style={{ marginBottom: 10 }}>Dimensions</div>
        <div className="grid-2" style={{ marginBottom: 16 }}>
          {element.dims.map(d => (
            <div key={d.key} className="field">
              <label>{d.label}</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={dims[d.key]}
                onChange={e => setDims(prev => ({ ...prev, [d.key]: parseFloat(e.target.value) || 0 }))}
              />
            </div>
          ))}
        </div>

        <button className="btn btn-primary btn-full" onClick={compute}>
          Calculate Quantity
        </button>
      </div>

      {/* Results */}
      {qty && (
        <div className="card">
          <div className="section-label" style={{ marginBottom: 12 }}>
            Quantities for {qty.volM3.toFixed(3)} m³
          </div>
          <div className="grid-2">
            {[
              { label: 'Volume',  value: qty.volM3.toFixed(3), unit: 'm³'  },
              { label: 'Cement',  value: qty.cement.toFixed(1), unit: 'kg'  },
              { label: 'Water',   value: qty.water.toFixed(1),  unit: 'kg'  },
              { label: 'Sand',    value: qty.sand.toFixed(1),   unit: 'kg'  },
              { label: 'Coarse',  value: qty.ca.toFixed(1),     unit: 'kg'  },
              { label: 'Bags',    value: qty.bags.toFixed(1),   unit: '×50kg' },
            ].map(m => (
              <div key={m.label} className="metric-tile">
                <div className="metric-label">{m.label}</div>
                <div className="metric-value" style={{ fontSize: 18 }}>{m.value}</div>
                <div className="metric-unit">{m.unit}</div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
