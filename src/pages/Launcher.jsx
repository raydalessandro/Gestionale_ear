import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActiveModules } from '../config/modules.config';

// 🎵 CONFIGURAZIONE (in produzione importata da config)
// import { STUDIO_CONFIG } from '../config/studio.config';

const CONFIG = {
  brand: {
    name: "Soundwave Studio",
    tagline: "Where Music Comes to Life",
    logo: "🎵",
    colors: {
      primary: "#8B5CF6",
      secondary: "#10B981",
      warning: "#F59E0B",
      danger: "#DC2626",
      info: "#3B82F6"
    },
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
  },
  studio: {
    address: "Via della Musica, 42",
    city: "Milano",
    phone: "+39 02 1234567",
    email: "info@soundwavestudio.com"
  },
  storageKeys: {
    artists: "studio_artists",
    transactions: "studio_transactions",
    bookings: "studio_bookings"
  }
};

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

  .app-card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 30px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
  }

  .app-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%);
    opacity: 0;
    transition: opacity 0.3s;
  }

  .app-card:hover {
    transform: translateY(-8px);
    border-color: rgba(139, 92, 246, 0.5);
    box-shadow: 0 20px 60px rgba(139, 92, 246, 0.3);
  }

  .app-card:hover::before {
    opacity: 1;
  }

  .stat-mini {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 20px;
    transition: all 0.2s;
  }

  .stat-mini:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(139, 92, 246, 0.3);
  }

  .quick-action-btn {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border: 2px solid rgba(255, 255, 255, 0.1);
    color: white;
    padding: 12px 24px;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .quick-action-btn:hover {
    background: rgba(139, 92, 246, 0.2);
    border-color: rgba(139, 92, 246, 0.5);
    transform: translateY(-2px);
  }

  .activity-item {
    background: rgba(255, 255, 255, 0.03);
    padding: 15px;
    border-radius: 12px;
    margin-bottom: 10px;
    border-left: 3px solid;
    transition: all 0.2s;
  }

  .activity-item:hover {
    background: rgba(255, 255, 255, 0.06);
    transform: translateX(5px);
  }

  .pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  .shimmer {
    background: linear-gradient(90deg, 
      rgba(255,255,255,0) 0%, 
      rgba(255,255,255,0.1) 50%, 
      rgba(255,255,255,0) 100%);
    background-size: 200% 100%;
    animation: shimmer 2s infinite;
  }

  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
`;

const StudioLauncher = () => {
  const navigate = useNavigate();
  const [artists, setArtists] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeModules, setActiveModules] = useState([]);

// 🔄 LOAD DATA
useEffect(() => {
  const loadData = () => {
    // Carica moduli attivi
    setActiveModules(getActiveModules());
    
    // Carica dati esistenti
    const loadedArtists = JSON.parse(localStorage.getItem(CONFIG.storageKeys.artists) || '[]');
    const loadedTransactions = JSON.parse(localStorage.getItem(CONFIG.storageKeys.transactions) || '[]');
    const loadedBookings = JSON.parse(localStorage.getItem(CONFIG.storageKeys.bookings) || '[]');
    setArtists(loadedArtists);
    setTransactions(loadedTransactions);
    setBookings(loadedBookings);
  };

  loadData();
  const interval = setInterval(loadData, 5000);

  return () => clearInterval(interval);
}, []);

  // ⏰ UPDATE TIME
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 🧮 QUICK STATS
  const getQuickStats = () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();

    // Today's stats
    const todayBookings = bookings.filter(b => b.date === todayStr);
    const todayTransactions = transactions.filter(t => 
      new Date(t.timestamp).toDateString() === today.toDateString()
    );

    // Month stats
    const monthTransactions = transactions.filter(t => {
      const date = new Date(t.timestamp);
      return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
    });

    const monthRevenue = monthTransactions.reduce((sum, t) => {
      const paid = t.payments?.reduce((s, p) => s + p.amount, 0) || 0;
      return sum + paid;
    }, 0);

    const pendingRevenue = transactions.reduce((sum, t) => {
      const total = t.total;
      const paid = t.payments?.reduce((s, p) => s + p.amount, 0) || 0;
      return sum + (total - paid);
    }, 0);

    // Next booking
    const upcomingBookings = bookings
      .filter(b => new Date(b.date + 'T' + b.startTime) > new Date())
      .sort((a, b) => new Date(a.date + 'T' + a.startTime) - new Date(b.date + 'T' + b.startTime));

    return {
      totalArtists: artists.length,
      todayBookings: todayBookings.length,
      todayRevenue: todayTransactions.reduce((sum, t) => {
        const paid = t.payments?.reduce((s, p) => s + p.amount, 0) || 0;
        return sum + paid;
      }, 0),
      monthRevenue,
      pendingRevenue,
      nextBooking: upcomingBookings[0] || null,
      totalBookings: bookings.length,
      totalTransactions: transactions.length
    };
  };

  const stats = getQuickStats();

  // 📝 RECENT ACTIVITY
  const getRecentActivity = () => {
    const activities = [];

    // Recent transactions
    transactions
      .slice()
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 3)
      .forEach(t => {
        activities.push({
          type: 'transaction',
          icon: '💰',
          title: `Transazione - ${t.artistName}`,
          subtitle: `€${t.total.toFixed(2)} - ${t.services.map(s => s.name).join(', ')}`,
          time: new Date(t.timestamp),
          color: '#10B981'
        });
      });

    // Recent bookings
    bookings
      .slice()
      .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
      .slice(0, 2)
      .forEach(b => {
        activities.push({
          type: 'booking',
          icon: '📅',
          title: `Prenotazione - ${b.artistName}`,
          subtitle: `${new Date(b.date).toLocaleDateString()} alle ${b.startTime}`,
          time: new Date(b.createdAt || b.date),
          color: '#3B82F6'
        });
      });

    return activities
      .sort((a, b) => b.time - a.time)
      .slice(0, 5);
  };

  const recentActivity = getRecentActivity();

  // 📱 APP MODULES
  const apps = [
    {
      id: 'transactions',
      name: 'Transaction Manager',
      icon: '💰',
      description: 'Gestione transazioni e pagamenti',
      color: '#8B5CF6',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      stats: [
        { label: 'Oggi', value: `€${stats.todayRevenue.toFixed(0)}` },
        { label: 'In Attesa', value: `€${stats.pendingRevenue.toFixed(0)}` }
      ],
      route: '/transactions'
    },
    {
      id: 'clients',
      name: 'Client Hub',
      icon: '👥',
      description: 'Gestione completa artisti e clienti',
      color: '#EC4899',
      gradient: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
      stats: [
        { label: 'Artisti', value: stats.totalArtists },
        { label: 'VIP', value: artists.filter(a => a.vip).length }
      ],
      route: '/clients'
    },
    {
      id: 'bookings',
      name: 'Booking System',
      icon: '📅',
      description: 'Calendario prenotazioni e sale',
      color: '#10B981',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      stats: [
        { label: 'Oggi', value: stats.todayBookings },
        { label: 'Totali', value: stats.totalBookings }
      ],
      route: '/bookings'
    },
    {
      id: 'analytics',
      name: 'Analytics Dashboard',
      icon: '📊',
      description: 'Report avanzati e business intelligence',
      color: '#F59E0B',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      stats: [
        { label: 'Mese', value: `€${stats.monthRevenue.toFixed(0)}` },
        { label: 'Sessioni', value: stats.totalTransactions }
      ],
      route: '/analytics'
    },
   {
    id: 'cassa',
    name: 'Cassa & Vendite',
    icon: '💰',
    description: 'Punto vendita accessori studio. Gestisci vendite rapide, carrello, pagamenti e storico completo.',
    color: '#EC4899',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #f59e0b 100%)',
    stats: [
      { label: 'Oggi', value: '€0' },
      { label: 'Totale', value: '0' }
    ],
    route: '/cassa'
   }
  ];

  return (
    <div style={{ 
      minHeight: '100vh',
      background: '#0F172A',
      color: 'white',
      fontFamily: 'Inter, sans-serif'
    }}>
      <style>{styles}</style>

      {/* 🌟 HERO HEADER */}
      <div style={{
        background: CONFIG.brand.gradient,
        padding: '60px 20px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated background circles */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          left: '-10%',
          width: '500px',
          height: '500px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          animation: 'float 20s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-50%',
          right: '-10%',
          width: '400px',
          height: '400px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          animation: 'float 15s ease-in-out infinite reverse'
        }} />

        <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '4rem', marginBottom: '10px' }}>{CONFIG.brand.logo}</div>
              <h1 style={{ 
                fontFamily: 'Playfair Display, serif',
                fontSize: '3.5rem',
                margin: '0 0 10px 0',
                fontWeight: 700,
                letterSpacing: '-1px'
              }}>
                {CONFIG.brand.name}
              </h1>
              <p style={{ 
                fontSize: '1.3rem',
                opacity: 0.9,
                margin: 0
              }}>
                {CONFIG.brand.tagline}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '5px' }}>
                {currentTime.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div style={{ fontSize: '1.1rem', opacity: 0.9 }}>
                {currentTime.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px' }}>
        {/* 📊 QUICK STATS */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '20px',
          marginBottom: '40px'
        }}>
          <div className="stat-mini">
            <div style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '8px' }}>INCASSO OGGI</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: CONFIG.brand.colors.secondary }}>
              €{stats.todayRevenue.toFixed(0)}
            </div>
          </div>
          <div className="stat-mini">
            <div style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '8px' }}>INCASSO MESE</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: CONFIG.brand.colors.primary }}>
              €{stats.monthRevenue.toFixed(0)}
            </div>
          </div>
          <div className="stat-mini">
            <div style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '8px' }}>DA INCASSARE</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: CONFIG.brand.colors.warning }}>
              €{stats.pendingRevenue.toFixed(0)}
            </div>
          </div>
          <div className="stat-mini">
            <div style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '8px' }}>PRENOTAZIONI OGGI</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: CONFIG.brand.colors.info }}>
              {stats.todayBookings}
            </div>
          </div>
        </div>

        {/* 🎯 NEXT BOOKING ALERT */}
        {stats.nextBooking && (
          <div style={{
            background: 'rgba(59, 130, 246, 0.1)',
            border: '2px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '40px',
            display: 'flex',
            alignItems: 'center',
            gap: '20px'
          }}>
            <div className="pulse" style={{ fontSize: '2.5rem' }}>📅</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '5px' }}>PROSSIMA PRENOTAZIONE</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '5px' }}>
                {stats.nextBooking.artistName} - {stats.nextBooking.roomName}
              </div>
              <div style={{ fontSize: '1rem', opacity: 0.9 }}>
                {new Date(stats.nextBooking.date).toLocaleDateString('it-IT')} alle {stats.nextBooking.startTime} ({stats.nextBooking.duration}h)
              </div>
            </div>
          </div>
        )}

        {/* 📱 APP GRID */}
        <h2 style={{ 
          fontSize: '2rem',
          marginBottom: '30px',
          fontWeight: 700
        }}>
          Applicazioni
        </h2>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
          gap: '25px',
          marginBottom: '50px'
        }}>
          {apps.map(app => (
            <div 
              key={app.id}
              className="app-card"
              onClick={() => navigate(app.route)}
            >
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: '3rem', marginBottom: '15px' }}>{app.icon}</div>
                <h3 style={{ 
                  fontSize: '1.5rem',
                  marginBottom: '10px',
                  fontWeight: 700
                }}>
                  {app.name}
                </h3>
                <p style={{ 
                  fontSize: '0.95rem',
                  opacity: 0.8,
                  marginBottom: '20px',
                  lineHeight: 1.6
                }}>
                  {app.description}
                </p>

                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '15px',
                  marginTop: '20px',
                  paddingTop: '20px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  {app.stats.map((stat, idx) => (
                    <div key={idx}>
                      <div style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '5px' }}>
                        {stat.label}
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                        {stat.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 📝 RECENT ACTIVITY */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', marginBottom: '50px' }}>
          <div>
            <h2 style={{ 
              fontSize: '1.8rem',
              marginBottom: '20px',
              fontWeight: 700
            }}>
              Attività Recente
            </h2>

            {recentActivity.length === 0 ? (
              <div style={{ 
                textAlign: 'center',
                padding: '60px 20px',
                opacity: 0.5
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📭</div>
                <p>Nessuna attività recente</p>
              </div>
            ) : (
              recentActivity.map((activity, idx) => (
                <div 
                  key={idx}
                  className="activity-item"
                  style={{ borderLeftColor: activity.color }}
                >
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <div style={{ fontSize: '1.8rem' }}>{activity.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '4px' }}>
                        {activity.title}
                      </div>
                      <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>
                        {activity.subtitle}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.85rem', opacity: 0.6, textAlign: 'right' }}>
                      {activity.time.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
                      <br />
                      {activity.time.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 🚀 QUICK ACTIONS */}
          <div>
            <h2 style={{ 
              fontSize: '1.8rem',
              marginBottom: '20px',
              fontWeight: 700
            }}>
              Azioni Rapide
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                className="quick-action-btn"
                onClick={() => navigate('/transactions')}
              >
                💰 Nuova Transazione
              </button>
              <button 
                className="quick-action-btn"
                onClick={() => navigate('/clients')}
              >
                👤 Nuovo Artista
              </button>
              <button 
                className="quick-action-btn"
                onClick={() => navigate('/bookings')}
              >
                📅 Nuova Prenotazione
              </button>
              <button 
                className="quick-action-btn"
                onClick={() => navigate('/analytics')}
              >
                📊 Visualizza Report
              </button>
            </div>

            {/* Studio Info */}
            <div style={{
              marginTop: '30px',
              padding: '20px',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '15px', fontWeight: 600 }}>
                Info Studio
              </h3>
              <div style={{ fontSize: '0.9rem', opacity: 0.8, lineHeight: 1.8 }}>
                <div>📍 {CONFIG.studio.address}</div>
                <div>🏙️ {CONFIG.studio.city}</div>
                <div>📞 {CONFIG.studio.phone}</div>
                <div>📧 {CONFIG.studio.email}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 🎨 FOOTER */}
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          paddingTop: '30px',
          textAlign: 'center',
          opacity: 0.6,
          fontSize: '0.9rem'
        }}>
          <p>
            {CONFIG.brand.name} - Studio Management Suite
          </p>
          <p style={{ marginTop: '10px' }}>
            Sistema gestionale modulare per studi di registrazione
          </p>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>
    </div>
  );
};

export default StudioLauncher;
