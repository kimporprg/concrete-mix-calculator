import { useState } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage.js'
import { designMix, DEFAULT_INPUTS } from './lib/aci211.js'
import InputPanel   from './components/InputPanel.jsx'
import ResultsPanel from './components/ResultsPanel.jsx'

export default function App() {
  const [inputs, setInputs] = useLocalStorage('mixdesign-inputs', DEFAULT_INPUTS)
  const [result, setResult]  = useState(null)
  const [mobileTab, setMobileTab] = useState('inputs')
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
        /* ── Responsive visibility ── */
        @media (min-width: 768px) { .mobile-only { display: none !important; } }
        @media (max-width: 767px)  { .desktop-only { display: none !important; } }

        /* ── Desktop two-column layout ── */
        .app-layout {
          display: grid;
          grid-template-columns: 360px 1fr;
          height: 100vh;
          overflow: hidden;
        }

        /* iPad landscape — narrow sidebar */
        @media (min-width: 768px) and (max-width: 1024px) {
          .app-layout { grid-template-columns: 320px 1fr; }
        }

        .sidebar {
          overflow-y: auto;
          overflow-x: hidden;
          background: var(--surface);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          /* Smooth momentum scroll on iOS */
          -webkit-overflow-scrolling: touch;
        }

        .sidebar-header {
          position: sticky;
          top: 0;
          z-index: 10;
          background: var(--surface);
          border-bottom: 1px solid var(--border);
          padding: 20px 24px 18px;
        }

        .sidebar-body {
          padding: 20px 24px;
          flex: 1;
        }

        .main-area {
          overflow-y: auto;
          overflow-x: hidden;
          background: var(--bg);
          padding: 28px 32px;
          -webkit-overflow-scrolling: touch;
        }

        @media (min-width: 768px) and (max-width: 1024px) {
          .main-area { padding: 22px 24px; }
        }

        /* ── Mobile layout ── */
        @media (max-width: 767px) {
          .app-layout { display: none; }

          .mob-root {
            display: flex;
            flex-direction: column;
            height: 100dvh;
            background: var(--bg);
          }

          .mob-header {
            flex-shrink: 0;
            background: var(--surface);
            border-bottom: 1px solid var(--border);
            padding: 14px 18px;
            padding-top: calc(14px + env(safe-area-inset-top));
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .mob-content {
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;
            -webkit-overflow-scrolling: touch;
            padding: 18px 16px;
          }

          .mob-nav {
            flex-shrink: 0;
            display: grid;
            grid-template-columns: 1fr 1fr;
            background: var(--surface);
            border-top: 1px solid var(--border);
            padding-bottom: env(safe-area-inset-bottom);
          }

          .mob-nav-btn {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 4px;
            padding: 11px 8px;
            font-size: 11px;
            font-weight: 600;
            font-family: var(--font-body);
            letter-spacing: 0.03em;
            text-transform: uppercase;
            cursor: pointer;
            border: none;
            background: transparent;
            color: var(--text-3);
            transition: color 0.15s;
            -webkit-tap-highlight-color: transparent;
          }
          .mob-nav-btn .nav-icon { font-size: 20px; line-height: 1; }
          .mob-nav-btn.active { color: var(--accent); }
          .mob-nav-btn.active .nav-dot {
            width: 4px; height: 4px; border-radius: 50%;
            background: var(--accent);
            margin-top: 2px;
          }
        }

        /* ── App branding wordmark ── */
        .wordmark-title {
          font-size: 18px;
          font-weight: 800;
          letter-spacing: -0.04em;
          color: var(--text);
          line-height: 1;
        }
        .wordmark-sub {
          font-size: 11px;
          color: var(--text-3);
          font-weight: 500;
          margin-top: 3px;
          letter-spacing: 0.02em;
        }
      `}</style>

      {/* ── DESKTOP / TABLET ── */}
      <div className="app-layout desktop-only">
        <aside className="sidebar">
          <div className="sidebar-header">
            <div className="wordmark-title">MixDesign</div>
            <div className="wordmark-sub">ACI 211.1 Calculator</div>
          </div>
          <div className="sidebar-body">
            <InputPanel inputs={inputs} setInputs={setInputs} onCalculate={handleCalculate} />
          </div>
        </aside>

        <main className="main-area">
          {error && (
            <div className="alert alert-danger" style={{ marginBottom: 24 }}>⚠ {error}</div>
          )}
          {result ? <ResultsPanel result={result} inputs={inputs} /> : <EmptyState />}
        </main>
      </div>

      {/* ── MOBILE ── */}
      <div className="mob-root mobile-only">
        <header className="mob-header">
          <div>
            <div className="wordmark-title">MixDesign</div>
            <div className="wordmark-sub">ACI 211.1</div>
          </div>
          {result && (
            <span className="badge badge-ok" style={{ marginLeft: 'auto' }}>
              {inputs.grade} ✓
            </span>
          )}
        </header>

        <div className="mob-content">
          {error && (
            <div className="alert alert-danger" style={{ marginBottom: 16 }}>⚠ {error}</div>
          )}
          {mobileTab === 'inputs' && (
            <InputPanel inputs={inputs} setInputs={setInputs} onCalculate={handleCalculate} />
          )}
          {mobileTab === 'results' && (
            result ? <ResultsPanel result={result} inputs={inputs} /> : <EmptyState />
          )}
        </div>

        <nav className="mob-nav">
          <button
            className={`mob-nav-btn ${mobileTab === 'inputs' ? 'active' : ''}`}
            onClick={() => setMobileTab('inputs')}
          >
            <span className="nav-icon">⚙️</span>
            Inputs
            {mobileTab === 'inputs' && <span className="nav-dot" />}
          </button>
          <button
            className={`mob-nav-btn ${mobileTab === 'results' ? 'active' : ''}`}
            onClick={() => setMobileTab('results')}
          >
            <span className="nav-icon">📊</span>
            Results
            {mobileTab === 'results' && <span className="nav-dot" />}
          </button>
        </nav>
      </div>
    </>
  )
}

function EmptyState() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      minHeight: 420,
      gap: 20,
      color: 'var(--text-3)',
      textAlign: 'center',
      padding: 48,
    }}>
      <div style={{
        width: 72, height: 72,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-xl)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 36,
      }}>
        🏗
      </div>
      <div>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
          Ready to Design
        </div>
        <div style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--text-2)', maxWidth: 280 }}>
          Enter your mix parameters and tap{' '}
          <strong style={{ color: 'var(--accent)' }}>Design Mix</strong>{' '}
          to run the ACI 211.1 calculations.
        </div>
      </div>
    </div>
  )
}
