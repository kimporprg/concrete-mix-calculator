import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          padding: 32, fontFamily: 'var(--font-body)', color: 'var(--white)',
          background: 'var(--ink)', minHeight: '100dvh',
          display: 'flex', flexDirection: 'column', gap: 16,
        }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--danger)' }}>
            Something went wrong
          </div>
          <div style={{
            background: 'var(--ink2)', border: '1px solid var(--danger)',
            borderRadius: 8, padding: 16,
            fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--muted)',
            whiteSpace: 'pre-wrap', wordBreak: 'break-all',
          }}>
            {this.state.error?.message}
            {'\n\n'}
            {this.state.error?.stack}
          </div>
          <button
            className="btn btn-primary"
            onClick={() => {
              localStorage.removeItem('mixdesign-inputs')
              window.location.reload()
            }}
          >
            Reset & Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
