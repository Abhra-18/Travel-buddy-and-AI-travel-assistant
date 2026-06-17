import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          background: 'var(--color-bg)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✈️💥</div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2rem', marginBottom: '0.75rem', color: 'var(--color-text)' }}>
            Oops! Something went wrong
          </h1>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', maxWidth: '480px' }}>
            An unexpected error occurred. Our team has been notified. Please try refreshing the page.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '0.75rem 2rem',
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                color: '#fff',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              🔄 Refresh Page
            </button>
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); window.history.back(); }}
              style={{
                padding: '0.75rem 2rem',
                background: 'transparent',
                color: '#6366f1',
                border: '2px solid #6366f1',
                borderRadius: '0.5rem',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              ← Go Back
            </button>
          </div>
          {import.meta.env.DEV && this.state.error && (
            <pre style={{
              marginTop: '2rem',
              padding: '1rem',
              background: '#1e2535',
              color: '#f87171',
              borderRadius: '0.5rem',
              fontSize: '0.8rem',
              textAlign: 'left',
              maxWidth: '600px',
              overflow: 'auto',
            }}>
              {this.state.error.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
