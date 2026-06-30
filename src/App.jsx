// App.jsx
import { useState }        from 'react'
import { useLocalStorage }  from './hooks/useLocalStorage'
import { designMix, DEFAULT_INPUTS } from './lib/aci211'
import InputPanel   from './components/InputPanel'
import ResultsPanel from './components/ResultsPanel'
import LibraryPanel from './components/LibraryPanel'
import GuideTab     from './components/GuideTab'

const LEFT_TABS = [
  { id: 'inputs',  label: 'Inputs'  },
  { id: 'library', label: 'Library' },
  { id: 'guide',   label: 'Guide'   },
]

export default function App() {
  const [inputs, setInputs]   = useLocalStorage('mixdesign-inputs',  DEFAULT_INPUTS)
  const [library, setLibrary] = useLocalStorage('mixdesign-library', [])
  const [result,  setResult]  = useState(null)
  const [leftTab, setLeftTab] = useState('inputs')
  const [mobileView, setMobileView] = useState('left')
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const [theme, setTheme]     = useLocalStorage('mixdesign-theme', systemDark ? 'dark' : 'light')

  // Apply theme to document root
  document.documentElement.setAttribute('data-theme', theme === 'light' ? 'light' : '')

  function handleCalculate() {
    setResult(designMix(inputs))
    setMobileView('results')
  }

  function handleSave() {
    if (!result) return
    setLibrary(prev => [{
      id: Date.now().toString(),
      savedAt: new Date().toISOString(),
      inp: { ...inputs },
      result,
    }, ...prev])
    setLeftTab('library')
  }

  function handleLoad(entry) {
    setInputs(entry.inp)
    setResult(designMix(entry.inp))
    setLeftTab('inputs')
    setMobileView('results')
  }

  function handleDelete(id) {
    setLibrary(prev => prev.filter(e => e.id !== id))
  }

  function handleClearAll() {
    if (window.confirm('Delete all saved mixes?')) setLibrary([])
  }

  function toggleTheme() {
    setTheme(t => t === 'dark' ? 'light' : 'dark')
  }

  const libCount = library.length

  const themeIcon = theme === 'dark' ? '☀️' : '🌙'
  const themeLabel = theme === 'dark' ? 'Light mode' : 'Dark mode'

  // ── Shared sub-components (stable references via closure) ─────
  const leftTabBar = (
    <div style={{ display: 'flex', gap: 2 }} role="tablist" aria-label="Left panel tabs">
      {LEFT_TABS.map(t => {
        const lbl = t.id === 'library' && libCount > 0 ? `Library (${libCount})` : t.label
        const isActive = leftTab === t.id
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => setLeftTab(t.id)}
            style={{
              flex: 1, padding: '9px 4px',
              border: 'none', background: 'transparent',
              fontFamily: 'inherit', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', letterSpacing: '0.3px',
              color: isActive ? 'var(--accent)' : 'var(--muted)',
              borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
              transition: 'color .15s, border-color .15s',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              touchAction: 'manipulation', minHeight: 40,
            }}
          >
            {lbl}
          </button>
        )
      })}
    </div>
  )

  const leftBody = (() => {
    if (leftTab === 'inputs')  return <InputPanel inputs={inputs} setInputs={setInputs} onCalculate={handleCalculate} />
    if (leftTab === 'library') return <LibraryPanel library={library} onLoad={handleLoad} onDelete={handleDelete} onClearAll={handleClearAll} />
    if (leftTab === 'guide')   return <GuideTab />
    return null
  })()

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
          <div style={{ padding: 'calc(14px + var(--sat)) 18px 0', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--white)', letterSpacing: '-0.5px' }}>
                  Concrete Design Calculator
                </div>
                <div style={{ fontSize: 10, color: 'var(--mid)', marginTop: 4 }}>
                  By Lyhour Oem &amp; Kimpor Kang
                </div>
              </div>
              <button
                type="button"
                className="btn-icon"
                onClick={toggleTheme}
                aria-label={themeLabel}
                title={themeLabel}
                style={{ marginTop: 2, flexShrink: 0 }}
              >
                {themeIcon}
              </button>
            </div>
            <div style={{ marginTop: 14 }}>{leftTabBar}</div>
          </div>
          <div style={{
            flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch',
            padding: '14px 18px calc(16px + var(--sab))',
          }}>
            {leftBody}
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
          background: 'var(--ink2)', flexShrink: 0,
          paddingTop: 'calc(10px + var(--sat))',
          borderBottom: '1px solid var(--line)',
        }}>
          <div style={{ padding: '0 16px 10px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--white)', letterSpacing: '-0.3px' }}>
                Concrete Design Calculator
              </div>
              <div style={{ fontSize: 9, color: 'var(--mid)', marginTop: 2 }}>
                By Lyhour Oem &amp; Kimpor Kang
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <button
                type="button"
                className="btn-icon"
                onClick={toggleTheme}
                aria-label={themeLabel}
                title={themeLabel}
              >
                {themeIcon}
              </button>
              {[['left','Inputs'],['results','Results']].map(([v,l]) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setMobileView(v)}
                  aria-pressed={mobileView === v}
                  style={{
                    padding: '7px 12px', border: 'none', borderRadius: 7,
                    fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                    background: mobileView === v ? 'var(--accent)' : 'var(--surface)',
                    color: mobileView === v ? '#FFFFFF' : 'var(--muted)',
                    minHeight: 36, touchAction: 'manipulation',
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {mobileView === 'left' && (
            <div style={{ padding: '0 16px' }}>{leftTabBar}</div>
          )}
        </div>

        <div style={{
          flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch',
          padding: '14px 16px',
        }}>
          {mobileView === 'left'
            ? leftBody
            : <ResultsPanel result={result} onSave={handleSave} />
          }
        </div>

        <div style={{ height: 'var(--sab)', background: 'var(--ink2)', flexShrink: 0 }} />
      </div>
    </>
  )
}
