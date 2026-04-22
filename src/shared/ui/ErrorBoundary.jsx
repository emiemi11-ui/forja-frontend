import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    void 0; // silenced for production
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--c-ink)',
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          padding: 24,
        }}>
          <div style={{ maxWidth: 480, textAlign: 'center' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>⚠️</div>
            <div style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontSize: 32, fontWeight: 900,
              color: '#fff', marginBottom: 8,
            }}>
              Ceva a mers prost
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 28, lineHeight: 1.6 }}>
              A apărut o eroare neașteptată. Încearcă să reîmprospătezi pagina.
            </div>
            {this.state.error && (
              <div style={{
                background: 'rgba(255,68,34,0.06)',
                border: '1px solid rgba(255,68,34,0.15)',
                borderRadius: 10, padding: '10px 14px',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 11, color: 'rgba(255,100,80,0.7)',
                marginBottom: 24, textAlign: 'left',
                wordBreak: 'break-word',
              }}>
                {this.state.error.message}
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  background: '#B8ED00', color: '#000',
                  border: 'none', borderRadius: 10,
                  padding: '11px 22px', fontWeight: 800,
                  fontSize: 13, cursor: 'pointer',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                }}
              >
                🔄 Reîmprospătează
              </button>
              <button
                onClick={() => { window.location.href = '/'; }}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  color: 'rgba(255,255,255,0.6)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10, padding: '11px 22px',
                  fontWeight: 600, fontSize: 13, cursor: 'pointer',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                }}
              >
                ← Acasă
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
