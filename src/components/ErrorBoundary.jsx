import React from 'react';
import { logError, ERROR_LEVELS } from '../utils/errorHandler';

// 🎨 STILI
const styles = `
  .error-boundary {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 20px;
  }

  .error-content {
    background: white;
    border-radius: 16px;
    padding: 40px;
    max-width: 600px;
    width: 100%;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    text-align: center;
  }

  .error-icon {
    font-size: 4rem;
    margin-bottom: 20px;
  }

  .error-title {
    font-size: 2rem;
    font-weight: 700;
    color: #1F2937;
    margin-bottom: 15px;
  }

  .error-message {
    color: #6B7280;
    margin-bottom: 30px;
    line-height: 1.6;
  }

  .error-actions {
    display: flex;
    gap: 15px;
    justify-content: center;
    flex-wrap: wrap;
  }

  .btn {
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
    font-size: 1rem;
  }

  .btn-primary {
    background: #8B5CF6;
    color: white;
  }

  .btn-primary:hover {
    background: #7C3AED;
    transform: translateY(-2px);
  }

  .btn-secondary {
    background: #F3F4F6;
    color: #6B7280;
  }

  .btn-secondary:hover {
    background: #E5E7EB;
  }

  .error-details {
    margin-top: 20px;
    padding: 15px;
    background: #F9FAFB;
    border-radius: 8px;
    text-align: left;
    font-family: monospace;
    font-size: 0.85rem;
    color: #6B7280;
    max-height: 200px;
    overflow-y: auto;
  }
`;

/**
 * 🛡️ ErrorBoundary - Cattura errori React
 * 
 * Wrapper per componenti che può catturare errori durante il rendering,
 * nei lifecycle methods, e nei costruttori dell'intero tree React.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Aggiorna lo state per mostrare UI di fallback
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Logga l'errore
    logError(
      error,
      {
        componentStack: errorInfo.componentStack,
        errorInfo
      },
      ERROR_LEVELS.CRITICAL
    );

    this.setState({
      error,
      errorInfo
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      // UI di fallback personalizzata
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.state.errorInfo);
      }

      // UI di fallback di default
      return (
        <>
          <style>{styles}</style>
          <div className="error-boundary">
            <div className="error-content">
              <div className="error-icon">⚠️</div>
              <h1 className="error-title">Oops! Qualcosa è andato storto</h1>
              <p className="error-message">
                Si è verificato un errore imprevisto. Puoi provare a ricaricare la pagina
                o tornare alla home.
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="error-details">
                  <strong>Errore:</strong> {this.state.error.toString()}
                  {this.state.errorInfo && (
                    <>
                      <br /><br />
                      <strong>Stack:</strong>
                      <pre style={{ marginTop: '10px', whiteSpace: 'pre-wrap' }}>
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </>
                  )}
                </div>
              )}

              <div className="error-actions">
                <button className="btn btn-primary" onClick={this.handleReload}>
                  🔄 Ricarica Pagina
                </button>
                <button className="btn btn-secondary" onClick={() => window.location.href = '/'}>
                  🏠 Torna alla Home
                </button>
                {process.env.NODE_ENV === 'development' && (
                  <button className="btn btn-secondary" onClick={this.handleReset}>
                    🔁 Riprova
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

