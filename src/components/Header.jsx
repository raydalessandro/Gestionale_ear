import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, getCurrentUser } from '../utils/auth';
import { STUDIO_CONFIG } from '../config/studio.config';
import VibesLogo from './VibesLogo';

// 🎨 STILI
const styles = `
  .app-header {
    background: linear-gradient(135deg, #1F2937 0%, #000000 50%, #1F2937 100%);
    color: white;
    padding: 15px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    position: sticky;
    top: 0;
    z-index: 100;
    backdrop-filter: blur(10px);
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 15px;
    cursor: pointer;
  }

  .header-logo {
    font-size: 1.8rem;
  }

  .header-title {
    font-size: 1.3rem;
    font-weight: 700;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 0.9rem;
    opacity: 0.9;
    padding: 4px 8px;
    border-radius: 6px;
    transition: all 0.2s;
  }

  .user-info:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .logout-btn {
    background: rgba(255, 255, 255, 0.2);
    border: 2px solid rgba(255, 255, 255, 0.3);
    color: white;
    padding: 8px 16px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.9rem;
    min-height: 36px;
  }

  .logout-btn:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-1px);
  }

  .logout-btn:active {
    transform: translateY(0);
  }

  .dashboard-btn {
    background: rgba(255, 255, 255, 0.15);
    border: 2px solid rgba(255, 255, 255, 0.3);
    color: white;
    padding: 8px 16px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.9rem;
    min-height: 36px;
    margin-right: 10px;
  }

  .dashboard-btn:hover {
    background: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-1px);
  }

  .dashboard-btn:active {
    transform: translateY(0);
  }

  /* 📱 MOBILE RESPONSIVE */
  @media (max-width: 768px) {
    .app-header {
      padding: 12px 15px;
    }

    .header-title {
      font-size: 1.1rem;
    }

    .header-logo {
      font-size: 1.5rem;
    }

    .user-info {
      display: none; /* Nascondi nome utente su mobile */
    }

    .logout-btn {
      padding: 8px 12px;
      font-size: 0.85rem;
    }

    .dashboard-btn {
      padding: 8px 12px;
      font-size: 0.85rem;
      margin-right: 5px;
    }
  }
`;

/**
 * 🔐 Header Component
 * 
 * Header comune per tutte le pagine con:
 * - Logo e titolo (click per home)
 * - Nome utente
 * - Pulsante logout
 * 
 * Modulo indipendente che usa il sistema auth centrale
 */
const Header = ({ title = STUDIO_CONFIG.brand.name, showHomeButton = true, showDashboardButton = false }) => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const isDashboard = window.location.pathname === '/';

  const handleLogout = () => {
    if (window.confirm('Sei sicuro di voler uscire?')) {
      logout();
      navigate('/login');
    }
  };

  const handleHomeClick = () => {
    if (showHomeButton) {
      navigate('/');
    }
  };

  const handleDashboardClick = () => {
    navigate('/');
  };

  return (
    <>
      <style>{styles}</style>
      <header className="app-header">
        <div 
          className="header-left"
          onClick={handleHomeClick}
          style={{ cursor: showHomeButton ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: '12px' }}
        >
          {/* Logo Vibes Studio - Immagine */}
          <div style={{
            width: 'clamp(100px, 20vw, 120px)',
            height: 'clamp(30px, 6vw, 40px)',
            backgroundImage: 'url(/assets/vibes-logo-small.png)',
            backgroundSize: 'contain',
            backgroundPosition: 'left center',
            backgroundRepeat: 'no-repeat',
            flexShrink: 0,
            minWidth: '100px',
            minHeight: '30px'
          }}>
            {/* Fallback se l'immagine non viene caricata */}
            <div style={{ opacity: 0, width: 0, height: 0, overflow: 'hidden' }}>
              <VibesLogo variant="default" size="small" />
            </div>
          </div>
          <span className="header-title">{title}</span>
        </div>

        <div className="header-right">
          {/* Pulsante Torna a Dashboard - mostrato solo se non siamo nella dashboard */}
          {!isDashboard && (showDashboardButton !== false) && (
            <button 
              className="dashboard-btn"
              onClick={handleDashboardClick}
              title="Torna alla Dashboard"
            >
              🏠 Dashboard
            </button>
          )}
          {user && (
            <div 
              className="user-info"
              onClick={() => {
                // Se l'utente è Administrator o admin, vai alla pagina admin
                const userName = (user.name || user.username || '').toLowerCase();
                if (userName.includes('admin') || user.role === 'admin') {
                  navigate('/admin');
                }
              }}
              style={{ 
                cursor: (user.name || user.username || '').toLowerCase().includes('admin') || user.role === 'admin' ? 'pointer' : 'default',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                const userName = (user.name || user.username || '').toLowerCase();
                if (userName.includes('admin') || user.role === 'admin') {
                  e.currentTarget.style.opacity = '0.8';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              title={(user.name || user.username || '').toLowerCase().includes('admin') || user.role === 'admin' ? 'Vai al pannello Admin' : ''}
            >
              <span>👤</span>
              <span>{user.name || user.username}</span>
            </div>
          )}
          <button 
            className="logout-btn"
            onClick={handleLogout}
            title="Logout"
          >
            🚪 Esci
          </button>
        </div>
      </header>
    </>
  );
};

export default Header;

