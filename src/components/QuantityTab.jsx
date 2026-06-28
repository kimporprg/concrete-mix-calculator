import { useState } from 'react'
import { calcElementVolume, scaleToVolume } from '../lib/aci211.js'

const ELEMENTS = [
  {
    id: 'slab', label: 'Slab',
    dims: [
      { key: 'L', label: 'Length (m)'    },
      { key: 'W', label: 'Width (m)'     },
      { key: 'T', label: 'Thickness (m)' },
    ],
  },
  {
    id: 'beam', label: 'Beam',
    dims: [
      { key: 'L', label: 'Length (m)' },
      { key: 'W', label: 'Width (m)'  },
      { key: 'D', label: 'Depth (m)'  },
    ],
  },
  {
    id: 'column', label: 'Column (Rect.)',
    dims: [
      { key: 'H', label: 'Height (m)' },
      { key: 'W', label: 'Width (m)'  },
      { key: 'D', label: 'Depth (m)'  },
    ],
  },
  {
    id: 'footing', label: 'Footing',
    dims: [
      { key: 'L', label: 'Length (m)'    },
      { key: 'W', label: 'Width (m)'     },
      { key: 'T', label: 'Thickness (m)' },
    ],
  },
  {
    id: 'circ', label: 'Circ. Column',
    dims: [
      { key: 'Dia', label: 'Diameter (m)' },
      { key: 'H',   label: 'Height (m)'   },
    ],
  },
  {
    id: 'wall', label: 'Wall',
    dims: [
      { key: 'L', label: 'Length (m)'    },
      { key: 'H', label: 'Height (m)'    },
      { key: 'T', label: 'Thickness (m)' },
    ],
  },
  {
    id: 'pile', label: 'Pile',
    dims: [
      { key: 'Dia', label: 'Diameter (m)' },
      { key: 'H',   label: 'Length (m)'   },
    ],
  },
]

export default function QuantityTab({ result, inputs }) {
  const [elementId, setElementId] = useState('slab')
  const [dims, setDims] = useState({ L: 6, W: 6, T: 0.15, D: 0.5, H: 3, Dia: 0.6 })
  const [qty, setQty] = useState(null)
  const [savedMixes, setSavedMixes] = useState([])

  const isImperial = result._imperial
  const massUnit = isImperial ? 'lb' : 'kg'

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

  const saveToList = () => {
    if (!qty) return
    setSavedMixes(prev => [...prev, {
      id: Date.now(),
      element: element.label,
      dims: { ...dims },
      vol: qty.volM3,
      cement: qty.cement,
      water: qty.water,
      sand: qty.sand,
      ca: qty.ca,
      bags: qty.bags,
    }])
  }

  const removeRow = (id) => setSavedMixes(prev => prev.filter(m => m.id !== id))

  const totalCement = savedMixes.reduce((s, m) => s + parseFloat(m.cement), 0)
  const totalBags   = savedMixes.reduce((s, m) => s + parseFloat(m.bags),   0)

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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div className="section-label" style={{ margin: 0 }}>
              Quantities for {qty.volM3.toFixed(3)} m³
            </div>
            <button className="btn btn-ghost btn-sm" onClick={saveToList}>
              + Add to List
            </button>
          </div>
          <div className="grid-2">
            {[
              { label: 'Volume',  value: qty.volM3.toFixed(3), unit: 'm³'      },
              { label: 'Cement',  value: parseFloat(qty.cement).toFixed(1), unit: massUnit },
              { label: 'Water',   value: parseFloat(qty.water).toFixed(1),  unit: massUnit },
              { label: 'Sand',    value: parseFloat(qty.sand).toFixed(1),   unit: massUnit },
              { label: 'Coarse',  value: parseFloat(qty.ca).toFixed(1),     unit: massUnit },
              { label: 'Bags',    value: parseFloat(qty.bags).toFixed(1),   unit: '×50kg'  },
              ...(result.scmType !== 'none' && parseFloat(qty.scm) > 0
                ? [{ label: 'SCM', value: parseFloat(qty.scm).toFixed(1), unit: massUnit }]
                : []),
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

      {/* Saved mix list */}
      {savedMixes.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="section-label" style={{ margin: 0 }}>Quantity List</div>
            <button
              className="btn btn-ghost btn-sm"
              style={{ fontSize: 11 }}
              onClick={() => setSavedMixes([])}
            >
              Clear All
            </button>
          </div>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table className="step-table" style={{ minWidth: 460 }}>
              <thead>
                <tr>
                  <th>Element</th>
                  <th style={{ textAlign: 'right' }}>Vol (m³)</th>
                  <th style={{ textAlign: 'right' }}>Cement ({massUnit})</th>
                  <th style={{ textAlign: 'right' }}>Bags</th>
                  <th style={{ textAlign: 'right' }}>Water ({massUnit})</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {savedMixes.map(m => (
                  <tr key={m.id}>
                    <td style={{ color: 'var(--text)', fontWeight: 500 }}>{m.element}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--mono)', color: 'var(--text-2)' }}>{parseFloat(m.vol).toFixed(3)}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--mono)', color: 'var(--text-2)' }}>{parseFloat(m.cement).toFixed(1)}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--mono)', color: 'var(--accent)' }}>{parseFloat(m.bags).toFixed(1)}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--mono)', color: 'var(--text-2)' }}>{parseFloat(m.water).toFixed(1)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => removeRow(m.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: 16, padding: '0 4px' }}
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
                <tr style={{ borderTop: '2px solid var(--border-hi)' }}>
                  <td style={{ fontWeight: 700, color: 'var(--text)' }}>TOTAL</td>
                  <td style={{ textAlign: 'right' }}></td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--text)' }}>{totalCement.toFixed(1)}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--accent)' }}>{totalBags.toFixed(1)}</td>
                  <td style={{ textAlign: 'right' }}></td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  )
}
