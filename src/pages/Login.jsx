import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, isAuthenticated } from '../utils/auth';
import { STUDIO_CONFIG } from '../config/studio.config';
import VibesLogo from '../components/VibesLogo';

// 🎨 STILI GLOBALI
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500;600;700;800&display=swap');
  
  * { 
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  body {
    font-family: 'Inter', sans-serif;
    background: #0F172A;
    color: white;
  }

  .login-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #1F2937 0%, #000000 50%, #1F2937 100%);
    padding: 20px;
    position: relative;
    overflow: hidden;
  }

  .login-container::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -10%;
    width: 500px;
    height: 500px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    filter: blur(60px);
    animation: float 20s ease-in-out infinite;
  }

  .login-container::after {
    content: '';
    position: absolute;
    bottom: -50%;
    right: -10%;
    width: 400px;
    height: 400px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 50%;
    filter: blur(60px);
    animation: float 15s ease-in-out infinite reverse;
  }

  .login-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 24px;
    padding: clamp(30px, 6vw, 50px);
    width: 100%;
    max-width: 450px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    position: relative;
    z-index: 1;
  }

  .login-header {
    text-align: center;
    margin-bottom: 40px;
  }

  .login-logo {
    font-size: 4rem;
    margin-bottom: 15px;
    animation: pulse 2s ease-in-out infinite;
  }

  .login-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(2rem, 5vw, 2.5rem);
    font-weight: 700;
    margin-bottom: 10px;
    letter-spacing: -1px;
  }

  .login-subtitle {
    font-size: clamp(0.9rem, 2vw, 1rem);
    opacity: 0.9;
  }

  .login-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .form-label {
    font-size: 0.9rem;
    font-weight: 600;
    opacity: 0.9;
  }

  .form-input {
    width: 100%;
    padding: 14px 16px;
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    color: white;
    font-size: 1rem;
    font-family: inherit;
    transition: all 0.3s;
    min-height: 44px; /* Touch-friendly */
  }

  .form-input::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  .form-input:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.5);
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.1);
  }

  .login-btn {
    width: 100%;
    padding: 16px;
    background: linear-gradient(135deg, #FCD34D 0%, #FB923C 50%, #F97316 100%);
    color: #1F2937;
    border: none;
    border-radius: 12px;
    font-size: 1.1rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s;
    min-height: 44px;
    margin-top: 10px;
  }

  .login-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(249, 115, 22, 0.4);
    filter: brightness(1.1);
  }

  .login-btn:active:not(:disabled) {
    transform: translateY(0);
  }

  .login-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .error-message {
    background: rgba(220, 38, 38, 0.2);
    border: 2px solid rgba(220, 38, 38, 0.5);
    color: #FCA5A5;
    padding: 12px 16px;
    border-radius: 12px;
    font-size: 0.9rem;
    text-align: center;
    animation: shake 0.5s;
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-20px);
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
  }

  /* 📱 MOBILE RESPONSIVE */
  @media (max-width: 768px) {
    .login-card {
      padding: 30px 20px;
    }

    .login-title {
      font-size: 1.75rem;
    }
  }

  /* 🖱️ TOUCH OPTIMIZATIONS */
  @media (hover: none) and (pointer: coarse) {
    .login-btn:active {
      transform: scale(0.98);
    }
  }
`;

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Se già autenticato, redirect alla home
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simula un piccolo delay per UX migliore
    await new Promise(resolve => setTimeout(resolve, 300));

    const result = login(username.trim(), password);

    if (result.success) {
      // Redirect alla home
      navigate('/');
    } else {
      setError(result.error || 'Errore durante il login');
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <style>{styles}</style>
      
      <div className="login-card">
        <div className="login-header">
          {/* Logo Vibes Studio - Immagine */}
          <div style={{ 
            marginBottom: '20px',
            width: '250px',
            height: '125px',
            backgroundImage: 'url(/assets/vibes-logo.png)',
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            margin: '0 auto 20px auto',
            filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))'
          }}>
            {/* Fallback se l'immagine non viene caricata */}
            <div style={{ opacity: 0, width: 0, height: 0, overflow: 'hidden' }}>
              <VibesLogo variant="default" size="medium" />
            </div>
          </div>
          <p className="login-subtitle">Accedi al sistema gestionale</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              className="form-input"
              placeholder="Inserisci username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="Inserisci password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={loading || !username.trim() || !password.trim()}
          >
            {loading ? 'Accesso in corso...' : 'Accedi'}
          </button>
        </form>

        <div style={{
          marginTop: '30px',
          paddingTop: '20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.2)',
          textAlign: 'center',
          fontSize: '0.85rem',
          opacity: 0.7
        }}>
          <p>Credenziali di default:</p>
          <p style={{ marginTop: '5px', fontFamily: 'monospace' }}>
            admin / admin123
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

