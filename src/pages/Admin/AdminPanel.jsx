import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import {
  loadModulesConfig,
  toggleModule,
  logAdminActivity,
  getAdminLogs,
  checkDependencies,
  findDependentModules
} from '../../config/modules.config';

// 🎨 STILI
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  
  * { box-sizing: border-box; }
  
  body {
    font-family: 'Inter', sans-serif;
    background: #0F172A;
    color: white;
  }
  
  .admin-container {
    min-height: 100vh;
    background: #0F172A;
    color: white;
    padding: 40px 20px;
  }
  
  .admin-card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 30px;
    margin-bottom: 20px;
  }
  
  .module-item {
    background: rgba(255, 255, 255, 0.03);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: all 0.3s;
  }
  
  .module-item:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(139, 92, 246, 0.5);
  }
  
  .module-item.disabled {
    opacity: 0.5;
  }
  
  .toggle-switch {
    position: relative;
    width: 60px;
    height: 30px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 15px;
    cursor: pointer;
    transition: all 0.3s;
  }
  
  .toggle-switch.active {
    background: #10B981;
  }
  
  .toggle-switch::after {
    content: '';
    position: absolute;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: white;
    top: 2px;
    left: 2px;
    transition: all 0.3s;
  }
  
  .toggle-switch.active::after {
    left: 32px;
  }
  
  .badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    margin-right: 8px;
  }
  
  .badge.finance { background: rgba(139, 92, 246, 0.2); color: #C4B5FD; }
  .badge.crm { background: rgba(236, 72, 153, 0.2); color: #F9A8D4; }
  .badge.operations { background: rgba(16, 185, 129, 0.2); color: #6EE7B7; }
  .badge.insights { background: rgba(245, 158, 11, 0.2); color: #FCD34D; }
  
  .btn {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    font-family: inherit;
  }
  
  .btn-primary {
    background: linear-gradient(135deg, #FCD34D 0%, #FB923C 50%, #F97316 100%);
    color: white;
  }
  
  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(139, 92, 246, 0.4);
  }
  
  .btn-secondary {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.2);
  }
  
  .btn-secondary:hover {
    background: rgba(255, 255, 255, 0.15);
  }
  
  .stat-box {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 20px;
    text-align: center;
  }
  
  .stat-value {
    font-size: 2.5rem;
    font-weight: 800;
    margin: 10px 0;
    background: linear-gradient(135deg, #FCD34D 0%, #FB923C 50%, #F97316 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  .log-item {
    background: rgba(255, 255, 255, 0.03);
    border-left: 3px solid #F97316;
    padding: 12px 16px;
    margin-bottom: 8px;
    border-radius: 8px;
    font-size: 0.9rem;
  }
  
  .dependency-badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 8px;
    font-size: 0.7rem;
    background: rgba(59, 130, 246, 0.2);
    color: #93C5FD;
    margin-left: 5px;
  }
  
  .alert {
    padding: 15px 20px;
    border-radius: 12px;
    margin-bottom: 20px;
    border-left: 4px solid;
  }
  
  .alert.warning {
    background: rgba(245, 158, 11, 0.1);
    border-color: #F59E0B;
    color: #FCD34D;
  }
  
  .alert.error {
    background: rgba(220, 38, 38, 0.1);
    border-color: #DC2626;
    color: #FCA5A5;
  }
`;

const AdminPanel = () => {
  const navigate = useNavigate();
  const [modules, setModules] = useState({});
  const [logs, setLogs] = useState([]);
  const [alertMessage, setAlertMessage] = useState(null);
  const [view, setView] = useState('modules'); // modules | logs | stats

  // 🔄 Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setModules(loadModulesConfig());
    setLogs(getAdminLogs(20));
  };

  // 🎚️ Toggle Module
  const handleToggleModule = (moduleId) => {
    const result = toggleModule(moduleId);

    if (result.success) {
      logAdminActivity(
        result.newState ? 'module_enabled' : 'module_disabled',
        moduleId
      );
      setAlertMessage({
        type: 'success',
        text: `Modulo ${modules[moduleId].name} ${result.newState ? 'attivato' : 'disattivato'} con successo!`
      });
      loadData();
      
      // Rimuovi alert dopo 3 secondi
      setTimeout(() => setAlertMessage(null), 3000);
    } else {
      // Gestisci errori
      if (result.error === 'dependency_conflict') {
        const depNames = result.dependents.map(d => d.name).join(', ');
        setAlertMessage({
          type: 'error',
          text: `Impossibile disattivare: i seguenti moduli dipendono da questo: ${depNames}`
        });
      } else if (result.error === 'missing_dependencies') {
        const config = loadModulesConfig();
        const depNames = result.missing.map(id => config[id].name).join(', ');
        setAlertMessage({
          type: 'error',
          text: `Impossibile attivare: mancano le dipendenze: ${depNames}`
        });
      }
      
      setTimeout(() => setAlertMessage(null), 5000);
    }
  };

  // 📊 Stats
  const stats = {
    total: Object.keys(modules).length,
    active: Object.values(modules).filter(m => m.enabled).length,
    inactive: Object.values(modules).filter(m => !m.enabled).length,
    totalLogs: logs.length
  };

  return (
    <div className="admin-container">
      <style>{styles}</style>

      {/* 🔐 HEADER CON LOGOUT */}
      <Header title="⚙️ Admin Panel" />

      {/* HEADER */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ 
              fontSize: '2rem', 
              fontWeight: 800, 
              margin: '0 0 10px 0',
              background: 'linear-gradient(135deg, #FCD34D 0%, #FB923C 50%, #F97316 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Gestione moduli e configurazione sistema
            </h2>
          </div>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/')}
          >
            ← Torna al Launcher
          </button>
        </div>

        {/* ALERT */}
        {alertMessage && (
          <div className={`alert ${alertMessage.type}`}>
            {alertMessage.text}
          </div>
        )}

        {/* TABS */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
          <button 
            className={`btn ${view === 'modules' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setView('modules')}
          >
            📦 Moduli
          </button>
          <button 
            className={`btn ${view === 'stats' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setView('stats')}
          >
            📊 Statistiche
          </button>
          <button 
            className={`btn ${view === 'logs' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setView('logs')}
          >
            📜 Log Attività
          </button>
        </div>

        {/* VIEW: MODULES */}
        {view === 'modules' && (
          <div className="admin-card">
            <h2 style={{ margin: '0 0 25px 0', fontSize: '1.5rem' }}>
              Gestione Moduli
            </h2>
            
            {Object.values(modules).map(module => {
              const deps = checkDependencies(module.id);
              const dependents = findDependentModules(module.id).filter(m => m.enabled);
              
              return (
                <div 
                  key={module.id} 
                  className={`module-item ${!module.enabled ? 'disabled' : ''}`}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '2rem', marginRight: '15px' }}>
                        {module.icon}
                      </span>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <h3 style={{ margin: 0, fontSize: '1.2rem' }}>
                            {module.name}
                          </h3>
                          <span className={`badge ${module.category}`}>
                            {module.category}
                          </span>
                          {!module.enabled && (
                            <span style={{ 
                              padding: '2px 8px', 
                              background: 'rgba(220, 38, 38, 0.2)', 
                              color: '#FCA5A5',
                              borderRadius: '8px',
                              fontSize: '0.7rem',
                              fontWeight: 600
                            }}>
                              DISATTIVATO
                            </span>
                          )}
                        </div>
                        <p style={{ margin: '5px 0 0 0', opacity: 0.7, fontSize: '0.9rem' }}>
                          {module.description}
                        </p>
                        {module.dependencies && module.dependencies.length > 0 && (
                          <div style={{ marginTop: '8px', fontSize: '0.8rem', opacity: 0.6 }}>
                            Richiede:
                            {module.dependencies.map(depId => {
                              const depModule = modules[depId];
                              return (
                                <span key={depId} className="dependency-badge">
                                  {depModule?.icon} {depModule?.name}
                                </span>
                              );
                            })}
                          </div>
                        )}
                        {dependents.length > 0 && module.enabled && (
                          <div style={{ marginTop: '8px', fontSize: '0.8rem', opacity: 0.6 }}>
                            ⚠️ Usato da:
                            {dependents.map(dep => (
                              <span key={dep.id} className="dependency-badge">
                                {dep.icon} {dep.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div
                    className={`toggle-switch ${module.enabled ? 'active' : ''}`}
                    onClick={() => handleToggleModule(module.id)}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* VIEW: STATS */}
        {view === 'stats' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
              <div className="stat-box">
                <div style={{ opacity: 0.7, fontSize: '0.9rem' }}>Moduli Totali</div>
                <div className="stat-value">{stats.total}</div>
              </div>
              <div className="stat-box">
                <div style={{ opacity: 0.7, fontSize: '0.9rem' }}>Moduli Attivi</div>
                <div className="stat-value" style={{ 
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  {stats.active}
                </div>
              </div>
              <div className="stat-box">
                <div style={{ opacity: 0.7, fontSize: '0.9rem' }}>Moduli Disattivati</div>
                <div className="stat-value" style={{ 
                  background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  {stats.inactive}
                </div>
              </div>
              <div className="stat-box">
                <div style={{ opacity: 0.7, fontSize: '0.9rem' }}>Eventi Log</div>
                <div className="stat-value">{stats.totalLogs}</div>
              </div>
            </div>

            <div className="admin-card">
              <h3 style={{ margin: '0 0 20px 0' }}>Moduli per Categoria</h3>
              {['finance', 'crm', 'operations', 'insights'].map(cat => {
                const modulesInCat = Object.values(modules).filter(m => m.category === cat);
                const active = modulesInCat.filter(m => m.enabled).length;
                return (
                  <div key={cat} style={{ marginBottom: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span className={`badge ${cat}`}>{cat}</span>
                      <span style={{ opacity: 0.7 }}>{active}/{modulesInCat.length} attivi</span>
                    </div>
                    <div style={{ 
                      background: 'rgba(255, 255, 255, 0.05)', 
                      height: '8px', 
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{ 
                        background: 'linear-gradient(135deg, #FCD34D 0%, #FB923C 50%, #F97316 100%)',
                        height: '100%',
                        width: `${(active / modulesInCat.length) * 100}%`,
                        transition: 'width 0.3s'
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW: LOGS */}
        {view === 'logs' && (
          <div className="admin-card">
            <h2 style={{ margin: '0 0 25px 0', fontSize: '1.5rem' }}>
              Log Attività Admin
            </h2>
            
            {logs.length === 0 ? (
              <p style={{ opacity: 0.5, textAlign: 'center', padding: '40px 0' }}>
                Nessuna attività registrata
              </p>
            ) : (
              logs.map((log, idx) => (
                <div key={idx} className="log-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>
                        {log.action === 'module_enabled' ? '✅ Modulo attivato' : '⛔ Modulo disattivato'}
                      </strong>
                      {' - '}
                      <span style={{ opacity: 0.7 }}>
                        {modules[log.moduleId]?.name || log.moduleId}
                      </span>
                    </div>
                    <span style={{ opacity: 0.5, fontSize: '0.85rem' }}>
                      {new Date(log.timestamp).toLocaleString('it-IT')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
