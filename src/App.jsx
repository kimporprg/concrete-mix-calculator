// App.jsx — KEY CHANGES ONLY (replace your existing App.jsx with this)
// Changes vs previous version:
//   1. InputPanel tab now has two sub-tabs: INPUTS | LIBRARY (n)
//   2. Save to Library stores BOTH inputs AND result object
//   3. LibraryPanel receives onLoad which restores inputs AND result
//   4. ResultsPanel now receives onSaveToLibrary callback
//   5. GuideTab is available from ResultsPanel's tab bar (no changes needed in App.jsx for that)

import { useState }          from 'react'
import { useLocalStorage }   from './hooks/useLocalStorage'
import { designMix, DEFAULT_INPUTS } from './lib/aci211'
import InputPanel   from './components/InputPanel'
import ResultsPanel from './components/ResultsPanel'
import LibraryPanel from './components/LibraryPanel'

export default function App() {
  const [inputs, setInputs]   = useLocalStorage('mixdesign-inputs', DEFAULT_INPUTS)
  const [result, setResult]   = useState(null)
  const [library, setLibrary] = useLocalStorage('mixdesign-library', [])

  // ── Left-panel sub-tab (mobile: bottom nav tab 0 has two sub-tabs)
  const [leftTab, setLeftTab] = useState('inputs') // 'inputs' | 'library'

  function handleCalculate() {
    const r = designMix(inputs)
    setResult(r)
  }

  // Save current inputs + result to library
  function handleSaveToLibrary() {
    if (!result) return
    const entry = {
      id: Date.now().toString(),
      savedAt: new Date().toISOString(),
      inp: { ...inputs },
      result: result,
    }
    setLibrary(prev => [entry, ...prev])
  }

  // Load entry from library — restores inputs AND recalculates result
  function handleLoadFromLibrary(entry) {
    setInputs(entry.inp)
    // Recalculate from stored inputs to get a fresh result
    const r = designMix(entry.inp)
    setResult(r)
    // Switch to inputs/results view on mobile
    setLeftTab('inputs')
  }

  const libCount = library.length

  // ─────────────────────────────────────────────
  // DESKTOP LAYOUT (≥768px)
  // ─────────────────────────────────────────────
  return (
    <>
      <style>{`
        @media (min-width: 768px) { .mobile-only { display: none !important; } }
        @media (max-width: 767px)  { .desktop-only { display: none !important; } }
      `}</style>

      {/* ── DESKTOP ── */}
      <div className="desktop-only" style={{
        display: 'grid', gridTemplateColumns: '340px 1fr',
        height: '100dvh', background: 'var(--ink)', overflow: 'hidden',
      }}>
        {/* Left sidebar */}
        <div style={{
          background: 'var(--ink2)',
          display: 'flex', flexDirection: 'column',
          height: '100dvh', overflow: 'hidden',
        }}>
          {/* Sidebar header */}
          <div style={{
            padding: 'calc(12px + env(safe-area-inset-top)) 16px 0',
            flexShrink: 0,
          }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--white)', letterSpacing: '-0.3px' }}>
              MixDesign
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 12 }}>
              ACI 211.1 CALCULATOR
            </div>

            {/* INPUTS / LIBRARY sub-tabs */}
            <div style={{ display: 'flex', gap: 2, marginBottom: 0 }}>
              {['inputs', 'library'].map(t => (
                <button
                  key={t}
                  onClick={() => setLeftTab(t)}
                  style={{
                    flex: 1, padding: '8px 0',
                    border: 'none', borderRadius: '6px 6px 0 0',
                    fontSize: 11, fontWeight: 700, cursor: 'pointer',
                    fontFamily: 'inherit', letterSpacing: '0.5px', textTransform: 'uppercase',
                    background: leftTab === t ? 'var(--ink)' : 'transparent',
                    color: leftTab === t ? 'var(--accent)' : 'var(--muted)',
                    borderBottom: leftTab === t ? '2px solid var(--accent)' : '2px solid transparent',
                  }}
                >
                  {t === 'library' ? `Library${libCount > 0 ? ` (${libCount})` : ''}` : 'Inputs'}
                </button>
              ))}
            </div>
          </div>

          {/* Sidebar content */}
          <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '12px 16px 16px' }}>
            {leftTab === 'inputs'
              ? <InputPanel inputs={inputs} setInputs={setInputs} onCalculate={handleCalculate} />
              : <LibraryPanel onLoad={handleLoadFromLibrary} />
            }
          </div>
        </div>

        {/* Right — Results */}
        <div style={{
          height: '100dvh', overflowY: 'auto', WebkitOverflowScrolling: 'touch',
          padding: '16px 20px', background: 'var(--ink)',
        }}>
          <ResultsPanel result={result} onSaveToLibrary={handleSaveToLibrary} />
        </div>
      </div>

      {/* ── MOBILE ── */}
      <MobileLayout
        inputs={inputs} setInputs={setInputs}
        result={result}
        leftTab={leftTab} setLeftTab={setLeftTab}
        libCount={libCount}
        onCalculate={handleCalculate}
        onSaveToLibrary={handleSaveToLibrary}
        onLoadFromLibrary={handleLoadFromLibrary}
      />
    </>
  )
}

// ─────────────────────────────────────────────
// MOBILE LAYOUT (<768px)
// ─────────────────────────────────────────────
function MobileLayout({ inputs, setInputs, result, leftTab, setLeftTab, libCount, onCalculate, onSaveToLibrary, onLoadFromLibrary }) {
  // Bottom nav: 0 = Inputs/Library, 1 = Results
  const [bottomNav, setBottomNav] = useState(0)

  return (
    <div className="mobile-only" style={{
      display: 'flex', flexDirection: 'column',
      height: '100dvh', background: 'var(--ink)', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        background: 'var(--ink2)', flexShrink: 0,
        padding: 'calc(12px + env(safe-area-inset-top)) 16px 0',
      }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--white)', marginBottom: 2 }}>
          MixDesign
        </div>
        <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--accent)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 8 }}>
          ACI 211.1 CALCULATOR
        </div>

        {/* Sub-tabs for left panel (only shown when bottomNav === 0) */}
        {bottomNav === 0 && (
          <div style={{ display: 'flex', gap: 2 }}>
            {['inputs', 'library'].map(t => (
              <button
                key={t}
                onClick={() => setLeftTab(t)}
                style={{
                  flex: 1, padding: '7px 0',
                  border: 'none', borderRadius: '6px 6px 0 0',
                  fontSize: 11, fontWeight: 700, cursor: 'pointer',
                  fontFamily: 'inherit', letterSpacing: '0.5px', textTransform: 'uppercase',
                  background: leftTab === t ? 'var(--ink)' : 'transparent',
                  color: leftTab === t ? 'var(--accent)' : 'var(--muted)',
                  borderBottom: leftTab === t ? '2px solid var(--accent)' : '2px solid transparent',
                }}
              >
                {t === 'library' ? `Library${libCount > 0 ? ` (${libCount})` : ''}` : 'Inputs'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Scrollable content area */}
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '12px 16px' }}>
        {bottomNav === 0
          ? (leftTab === 'inputs'
              ? <InputPanel inputs={inputs} setInputs={setInputs} onCalculate={() => { onCalculate(); setBottomNav(1) }} />
              : <LibraryPanel onLoad={entry => { onLoadFromLibrary(entry); setBottomNav(1) }} />
            )
          : <ResultsPanel result={result} onSaveToLibrary={onSaveToLibrary} />
        }
      </div>

      {/* Bottom nav */}
      <div style={{
        background: 'var(--ink2)', flexShrink: 0,
        display: 'flex',
        paddingBottom: 'env(safe-area-inset-bottom)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        {[
          { label: 'Inputs', idx: 0 },
          { label: 'Results', idx: 1 },
        ].map(nav => (
          <button
            key={nav.idx}
            onClick={() => setBottomNav(nav.idx)}
            style={{
              flex: 1, padding: '12px 0',
              border: 'none', background: 'transparent',
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'inherit',
              color: bottomNav === nav.idx ? 'var(--accent)' : 'var(--muted)',
              borderTop: bottomNav === nav.idx ? '2px solid var(--accent)' : '2px solid transparent',
            }}
          >
            {nav.label}
          </button>
        ))}
      </div>
    </div>
  )
}
