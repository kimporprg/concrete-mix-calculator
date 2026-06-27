import { useState } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage.js'
import { designMix, DEFAULT_INPUTS } from './lib/aci211.js'
import InputPanel  from './components/InputPanel.jsx'
import ResultsPanel from './components/ResultsPanel.jsx'

export default function App() {
  const [inputs, setInputs] = useLocalStorage('mixdesign-inputs', DEFAULT_INPUTS)
  const [result, setResult]  = useState(null)
  const [mobileTab, setMobileTab] = useState('inputs') // 'inputs' | 'results'
  const [error, setError] = useState(null)

  const handleCalculate = () => {
    try {
      setError(null)
      const res = designMix(inputs)
      setResult(res)
      setMobileTab('results')
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <>
      <style>{`
        @media (min-width: 768px) { .mobile-only { display: none !important; } }
        @media (max-width: 767px)  { .desktop-only { display: none !important; } }
        .app-layout {
          display: grid;
          grid-template-columns: 340px 1fr;
          grid-template-rows: 100vh;
          overflow: hidden;
        }
        .sidebar {
          overflow-y: auto;
          background: var(--ink2);
          border-right: 1px solid var(--steel);
          padding: 20px;
          display: flex; flex-direction: column; gap: 0;
        }
        .sidebar-header {
          padding-bottom: 20px;
          margin-bottom: 4px;
          border-bottom: 1px solid var(--steel);
        }
        .main-area {
          overflow-y: auto;
          padding: 24px;
        }
        @media (max-width: 767px) {
          .app-layout { display: flex; flex-direction: column; height: 100dvh; }
          .mob-header {
            background: var(--ink2);
            border-bottom: 1px solid var(--steel);
            padding: 14px 16px;
            padding-top: calc(14px + env(safe-area-inset-top));
            display: flex; align-items: center; gap: 12px; flex-shrink: 0;
          }
          .mob-content { flex: 1; overflow-y: auto; padding: 16px; }
          .mob-nav {
            display: flex;
            background: var(--ink2);
            border-top: 1px solid var(--steel);
            padding-bottom: env(safe-area-inset-bottom);
            flex-shrink: 0;
          }
          .mob-nav-btn {
            flex: 1; padding: 12px 8px; text-align: center;
            font-size: 12px; font-weight: 600; cursor: pointer;
            border: none; background: transparent;
            color: var(--muted); font-family: var(--font-body);
            transition: color 0.15s;
          }
          .mob-nav-btn.active { color: var(--accent); }
        }
      `}</style>

      {/* ── DESKTOP ── */}
      <div className="app-layout desktop-only">
        <aside className="sidebar">
          <div className="sidebar-header">
            <div style={{ fontSize:20, fontWeight:800, letterSpacing:'-0.02em' }}>MixDesign</div>
            <div style={{ fontSize:12, color:'var(--muted)', marginTop:2 }}>ACI 211.1 Calculator</div>
          </div>
          <div style={{ paddingTop: 20 }}>
            <InputPanel inputs={inputs} setInputs={setInputs} onCalculate={handleCalculate} />
          </div>
        </aside>
        <main className="main-area">
          {error && <div className="alert alert-danger" style={{ marginBottom:20 }}>⚠ {error}</div>}
          {result
            ? <ResultsPanel result={result} />
            : <EmptyState />}
        </main>
      </div>

      {/* ── MOBILE ── */}
      <div className="mobile-only" style={{ display:'flex', flexDirection:'column', height:'100dvh' }}>
        <div className="mob-header">
          <div>
            <div style={{ fontSize:17, fontWeight:800 }}>MixDesign</div>
            <div style={{ fontSize:11, color:'var(--muted)' }}>ACI 211.1</div>
          </div>
          {result && (
            <span className="badge badge-ok" style={{ marginLeft:'auto' }}>{inputs.grade} ✓</span>
          )}
        </div>
        <div className="mob-content">
          {error && <div className="alert alert-danger" style={{ marginBottom:16 }}>⚠ {error}</div>}
          {mobileTab === 'inputs'  && <InputPanel  inputs={inputs} setInputs={setInputs} onCalculate={handleCalculate} />}
          {mobileTab === 'results' && (result ? <ResultsPanel result={result} /> : <EmptyState />)}
        </div>
        <nav className="mob-nav">
          <button className={`mob-nav-btn ${mobileTab==='inputs'?'active':''}`}   onClick={() => setMobileTab('inputs')}>⚙ Inputs</button>
          <button className={`mob-nav-btn ${mobileTab==='results'?'active':''}`}  onClick={() => setMobileTab('results')}>📊 Results</button>
        </nav>
      </div>
    </>
  )
}

function EmptyState() {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', gap:16, color:'var(--muted)', textAlign:'center', padding:40, minHeight:400 }}>
      <div style={{ fontSize:56 }}>🏗</div>
      <div style={{ fontSize:20, fontWeight:700, color:'var(--white)' }}>Ready to Design</div>
      <div style={{ fontSize:14, maxWidth:300, lineHeight:1.6 }}>
        Enter your mix parameters on the left and click <strong style={{ color:'var(--accent)' }}>Design Mix</strong> to run ACI 211.1 calculations.
      </div>
    </div>
  )
}
