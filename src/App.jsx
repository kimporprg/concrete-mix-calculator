import { useState } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage.js'
import { designMix, DEFAULT_INPUTS } from './lib/aci211.js'
import InputPanel   from './components/InputPanel.jsx'
import ResultsPanel from './components/ResultsPanel.jsx'
import MixLibrary, { useMixLibrary } from './components/MixLibrary.jsx'

export default function App() {
  const [inputs, setInputs] = useLocalStorage('mixdesign-inputs', DEFAULT_INPUTS)
  const [result, setResult]  = useState(null)
  const [mobileTab, setMobileTab] = useState('inputs')
  const [sidebarTab, setSidebarTab] = useState('inputs') // 'inputs' | 'library'
  const [error, setError]  = useState(null)
  const [saved, setSaved]  = useState(false) // brief save confirmation
  const { library, saveMix, deleteMix, clearAll } = useMixLibrary()

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

  const handleSaveToLibrary = () => {
    if (!result) return
    saveMix(inputs, result)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleLoadFromLibrary = (savedInputs) => {
    setInputs({ ...DEFAULT_INPUTS, ...savedInputs })
    setSidebarTab('inputs')
    setMobileTab('inputs')
  }

  return (
    <>
      <style>{`
        /* ─ Breakpoint helpers ─ */
        @media (min-width: 768px) { .mob-only { display: none !important; } }
        @media (max-width: 767px)  { .dsk-only { display: none !important; } }

        /* ─ Desktop / tablet two-column shell ─ */
        .shell {
          display: grid;
          grid-template-columns: 300px 1fr;
          height: 100dvh;
          min-height: 0;
          overflow: hidden;
        }
        @media (min-width: 1024px) {
          .shell { grid-template-columns: 340px 1fr; }
        }

        /* ─ Sidebar ─ */
        .sidebar {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: var(--surface);
          border-right: 1px solid var(--border);
          overflow: hidden;
        }
        .sidebar-head {
          flex-shrink: 0;
          padding: 16px 18px 0;
          border-bottom: 1px solid var(--border);
        }
        .sidebar-tabs {
          display: flex;
          gap: 0;
          margin-top: 12px;
        }
        .sidebar-tab {
          flex: 1;
          padding: 8px 6px;
          font-size: 11px;
          font-weight: 700;
          font-family: var(--font);
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--text-3);
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          transition: color 0.12s, border-color 0.12s;
        }
        .sidebar-tab:hover { color: var(--text-2); }
        .sidebar-tab.active { color: var(--accent); border-bottom-color: var(--accent); }
        .sidebar-body {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
          padding: 16px 18px 20px;
        }

        /* ─ Main content ─ */
        .main {
          height: 100%;
          overflow-y: auto;
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
          padding: 24px 28px;
          background: var(--bg);
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .main { padding: 20px 22px; }
        }

        /* ─ Mobile shell ─ */
        .mob-shell {
          display: flex;
          flex-direction: column;
          height: 100dvh;
        }
        .mob-head {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          padding-top: calc(12px + env(safe-area-inset-top));
          background: var(--surface);
          border-bottom: 1px solid var(--border);
        }
        .mob-body {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
          padding: 16px;
        }
        .mob-nav {
          flex-shrink: 0;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          background: var(--surface);
          border-top: 1px solid var(--border);
          padding-bottom: env(safe-area-inset-bottom);
        }
        .mob-nav-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          padding: 10px 8px;
          font-size: 10px;
          font-weight: 600;
          font-family: var(--font);
          letter-spacing: 0.03em;
          text-transform: uppercase;
          color: var(--text-3);
          background: transparent;
          border: none;
          cursor: pointer;
          transition: color 0.12s;
          -webkit-tap-highlight-color: transparent;
          min-height: 52px;
        }
        .mob-nav-btn svg { width: 20px; height: 20px; }
        .mob-nav-btn.active { color: var(--accent); }

        /* ─ Wordmark ─ */
        .wordmark { font-size: 17px; font-weight: 800; letter-spacing: -0.03em; line-height: 1; }
        .wordmark-sub { font-size: 10px; color: var(--text-3); font-weight: 500; letter-spacing: 0.04em; margin-top: 3px; text-transform: uppercase; }

        /* ─ Save confirmation flash ─ */
        .save-flash {
          position: fixed;
          bottom: 80px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--ok);
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          padding: 8px 18px;
          border-radius: 999px;
          z-index: 999;
          pointer-events: none;
          animation: fadeUp 0.2s ease;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateX(-50%) translateY(8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>

      {saved && <div className="save-flash">Saved to Library ✓</div>}

      {/* ── DESKTOP / TABLET ── */}
      <div className="shell dsk-only">
        <aside className="sidebar">
          <div className="sidebar-head">
            <div style={{ paddingBottom: 0 }}>
              <div className="wordmark">MixDesign</div>
              <div className="wordmark-sub">ACI 211.1 Calculator</div>
            </div>
            <div className="sidebar-tabs">
              <button
                className={`sidebar-tab ${sidebarTab === 'inputs' ? 'active' : ''}`}
                onClick={() => setSidebarTab('inputs')}
              >
                Inputs
              </button>
              <button
                className={`sidebar-tab ${sidebarTab === 'library' ? 'active' : ''}`}
                onClick={() => setSidebarTab('library')}
              >
                Library {library.length > 0 && `(${library.length})`}
              </button>
            </div>
          </div>
          <div className="sidebar-body">
            {sidebarTab === 'inputs'
              ? <InputPanel inputs={inputs} setInputs={setInputs} onCalculate={handleCalculate} />
              : <MixLibrary library={library} deleteMix={deleteMix} clearAll={clearAll} onLoad={handleLoadFromLibrary} />
            }
          </div>
        </aside>

        <main className="main">
          {error && <div className="alert alert-danger" style={{ marginBottom: 20 }}>{error}</div>}
          {result
            ? <ResultsPanel result={result} inputs={inputs} onSaveToLibrary={handleSaveToLibrary} />
            : <EmptyState />
          }
        </main>
      </div>

      {/* ── MOBILE ── */}
      <div className="mob-shell mob-only">
        <header className="mob-head">
          <div>
            <div className="wordmark">MixDesign</div>
            <div className="wordmark-sub">ACI 211.1</div>
          </div>
          {result && (
            <span className="badge badge-ok" style={{ marginLeft: 'auto' }}>
              {inputs.grade}
            </span>
          )}
        </header>

        <div className="mob-body">
          {error && <div className="alert alert-danger" style={{ marginBottom: 14 }}>{error}</div>}
          {mobileTab === 'inputs' && <InputPanel inputs={inputs} setInputs={setInputs} onCalculate={handleCalculate} />}
          {mobileTab === 'results' && (result
            ? <ResultsPanel result={result} inputs={inputs} onSaveToLibrary={handleSaveToLibrary} />
            : <EmptyState />
          )}
          {mobileTab === 'library' && (
            <MixLibrary library={library} deleteMix={deleteMix} clearAll={clearAll} onLoad={handleLoadFromLibrary} />
          )}
        </div>

        <nav className="mob-nav">
          {[
            {
              id: 'inputs', label: 'Inputs',
              icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>
                <circle cx="9" cy="6" r="2" fill="currentColor" stroke="none"/><circle cx="15" cy="12" r="2" fill="currentColor" stroke="none"/><circle cx="9" cy="18" r="2" fill="currentColor" stroke="none"/>
              </svg>,
            },
            {
              id: 'results', label: 'Results',
              icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="12" width="4" height="9" rx="1"/><rect x="10" y="7" width="4" height="14" rx="1"/><rect x="17" y="3" width="4" height="18" rx="1"/>
              </svg>,
            },
            {
              id: 'library', label: `Library${library.length > 0 ? ` (${library.length})` : ''}`,
              icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>,
            },
          ].map(btn => (
            <button
              key={btn.id}
              className={`mob-nav-btn ${mobileTab === btn.id ? 'active' : ''}`}
              onClick={() => setMobileTab(btn.id)}
            >
              {btn.icon}
              {btn.label}
            </button>
          ))}
        </nav>
      </div>
    </>
  )
}

function EmptyState() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: 380, height: '100%',
      gap: 18, padding: 40, textAlign: 'center',
    }}>
      <div style={{
        width: 64, height: 64, background: 'var(--surface)',
        border: '1px solid var(--border)', borderRadius: 'var(--r-xl)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="15" rx="1"/>
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
          <line x1="12" y1="12" x2="12" y2="17"/>
          <line x1="9" y1="14.5" x2="15" y2="14.5"/>
        </svg>
      </div>
      <div>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
          Ready to Design
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.65, maxWidth: 260 }}>
          Enter your mix parameters and click{' '}
          <strong style={{ color: 'var(--accent)' }}>Design Mix</strong>{' '}
          to run the ACI 211.1 calculations.
        </div>
      </div>
    </div>
  )
}
