// App.jsx
import { useState }       from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import { designMix, DEFAULT_INPUTS } from './lib/aci211'
import InputPanel   from './components/InputPanel'
import ResultsPanel from './components/ResultsPanel'
import LibraryPanel from './components/LibraryPanel'
import GuideTab     from './components/GuideTab'

const LEFT_TABS = [
  { id: 'inputs',  label: 'Inputs'  },
  { id: 'library', label: 'Library' },
  { id: 'guide',   label: '📖 Guide' },
]

export default function App() {
  const [inputs, setInputs]   = useLocalStorage('mixdesign-inputs',  DEFAULT_INPUTS)
  const [library, setLibrary] = useLocalStorage('mixdesign-library', [])
  const [result,  setResult]  = useState(null)
  const [leftTab, setLeftTab] = useState('inputs')
  const [mobileView, setMobileView] = useState('left') // 'left' | 'results'

  function handleCalculate() {
    const r = designMix(inputs)
    setResult(r)
    setMobileView('results')
  }

  function handleSave() {
    if (!result) return
    const entry = {
      id: Date.now().toString(),
      savedAt: new Date().toISOString(),
      inp: { ...inputs },
      result,
    }
    setLibrary(prev => [entry, ...prev])
    setLeftTab('library')
  }

  function handleLoad(entry) {
    setInputs(entry.inp)
    const r = designMix(entry.inp)
    setResult(r)
    setLeftTab('inputs')
    setMobileView('results')
  }

  const libCount = library.length

  // ── Credit block (shared between desktop/mobile) ──────────────────────
  const Credits = ({ small }) => (
    <div style={{
      fontSize: small ? 9 : 10,
      color: 'var(--mid)',
      lineHeight: 1.6,
      marginTop: small ? 4 : 6,
    }}>
      <span style={{ color: 'var(--muted)', fontWeight: 600 }}>By </span>
      Lyhour Oem &amp; Kimpor Kang
      <br />
      <span style={{ color: '#3A5F78', fontSize: small ? 8 : 9 }}>Singbuild Construction Co., Ltd.</span>
    </div>
  )

  // ── Left panel tab bar ────────────────────────────────────────────────
  function LeftTabBar() {
    return (
      <div style={{
        display: 'flex', gap: 2,
        paddingBottom: 0,
      }}>
        {LEFT_TABS.map(t => {
          const lbl = t.id === 'library' && libCount > 0
            ? `Library (${libCount})`
            : t.label
          return (
            <button
              key={t.id}
              onClick={() => setLeftTab(t.id)}
              style={{
                flex: 1, padding: '9px 4px',
                border: 'none', background: 'transparent',
                fontFamily: 'inherit', fontSize: 11, fontWeight: 700,
                cursor: 'pointer', letterSpacing: '0.3px',
                color: leftTab === t.id ? 'var(--accent)' : 'var(--muted)',
                borderBottom: leftTab === t.id
                  ? '2px solid var(--accent)'
                  : '2px solid transparent',
                transition: 'color .15s, border-color .15s',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                touchAction: 'manipulation',
                minHeight: 40,
              }}
            >
              {lbl}
            </button>
          )
        })}
      </div>
    )
  }

  // ── Left panel body ───────────────────────────────────────────────────
  function LeftBody() {
    if (leftTab === 'inputs')  return <InputPanel inputs={inputs} setInputs={setInputs} onCalculate={handleCalculate} />
    if (leftTab === 'library') return <LibraryPanel onLoad={handleLoad} />
    if (leftTab === 'guide')   return <GuideTab />
    return null
  }

  // ─────────────────────────────────────────────────────────────────────
  // DESKTOP (≥ 768px)
  // ─────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── DESKTOP ── */}
      <div className="desktop-only" style={{
        display: 'grid', gridTemplateColumns: '340px 1fr',
        height: '100dvh', background: 'var(--ink)', overflow: 'hidden',
      }}>
        {/* Sidebar */}
        <div style={{
          background: 'var(--ink2)',
          display: 'flex', flexDirection: 'column',
          height: '100dvh', overflow: 'hidden',
          borderRight: '1px solid var(--line)',
        }}>
          {/* Sidebar header + credits */}
          <div style={{
            padding: 'calc(14px + var(--sat)) 18px 0',
            flexShrink: 0,
          }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--white)', letterSpacing: '-0.5px' }}>
              MixDesign
            </div>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--accent)', letterSpacing: '2px', textTransform: 'uppercase' }}>
              ACI 211.1 CALCULATOR
            </div>
            <Credits small={false} />
            <div style={{ marginTop: 14 }}>
              <LeftTabBar />
            </div>
          </div>

          {/* Scrollable body */}
          <div style={{
            flex: 1, overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            padding: '14px 18px calc(16px + var(--sab))',
          }}>
            <LeftBody />
          </div>
        </div>

        {/* Results panel */}
        <div style={{
          height: '100dvh', display: 'flex', flexDirection: 'column',
          overflow: 'hidden', background: 'var(--ink)',
          padding: '16px 20px calc(16px + var(--sab)) 20px',
        }}>
          <ResultsPanel result={result} onSave={handleSave} />
        </div>
      </div>

      {/* ── MOBILE ── */}
      <div className="mobile-only" style={{
        display: 'flex', flexDirection: 'column',
        height: '100dvh', background: 'var(--ink)', overflow: 'hidden',
      }}>
        {/* Mobile header */}
        <div style={{
          background: 'var(--ink2)',
          flexShrink: 0,
          paddingTop: 'calc(10px + var(--sat))',
          borderBottom: '1px solid var(--line)',
        }}>
          <div style={{ padding: '0 16px 10px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--white)', letterSpacing: '-0.3px' }}>
                MixDesign
              </div>
              <div style={{ fontSize: 8, fontWeight: 700, color: 'var(--accent)', letterSpacing: '2px', textTransform: 'uppercase' }}>
                ACI 211.1 CALCULATOR
              </div>
              <Credits small={true} />
            </div>
            {/* Mobile view toggle */}
            <div style={{ display: 'flex', gap: 4 }}>
              {[['left','Inputs'],['results','Results']].map(([v,l]) => (
                <button key={v} onClick={() => setMobileView(v)}
                  style={{
                    padding: '7px 12px', border: 'none', borderRadius: 7,
                    fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                    background: mobileView === v ? 'var(--accent)' : 'var(--surface)',
                    color: mobileView === v ? 'var(--white)' : 'var(--muted)',
                    minHeight: 36, touchAction: 'manipulation',
                  }}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Left sub-tabs only when on left view */}
          {mobileView === 'left' && (
            <div style={{ padding: '0 16px' }}>
              <LeftTabBar />
            </div>
          )}
        </div>

        {/* Scrollable content */}
        <div style={{
          flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch',
          padding: '14px 16px',
        }}>
          {mobileView === 'left'
            ? <LeftBody />
            : <ResultsPanel result={result} onSave={handleSave} />
          }
        </div>

        {/* iOS home-bar spacer */}
        <div style={{ height: 'var(--sab)', background: 'var(--ink2)', flexShrink: 0 }} />
      </div>
    </>
  )
}
