import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { STUDIO_CONFIG } from '../config/studio.config';
import Header from '../components/Header';
import { useToast } from '../components/Toast';
import { getItem, setItem } from '../utils/storage';

// 🎨 CONFIGURAZIONE - Vibes Studio (configurazione centralizzata)
const CONFIG = STUDIO_CONFIG;

// 🎨 STILI GLOBALI
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  
  * { box-sizing: border-box; }
  
  .artist-card {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    cursor: pointer;
    transition: all 0.2s;
    border: 2px solid transparent;
  }
  
  .artist-card:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    transform: translateY(-2px);
    border-color: ${CONFIG.brand.colors.primary};
  }
  
  .stat-box {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }
  
  input, select, textarea {
    padding: 10px 12px;
    border: 2px solid #E5E7EB;
    border-radius: 8px;
    font-family: inherit;
    font-size: 0.95rem;
    transition: border-color 0.2s;
    width: 100%;
  }
  
  input:focus, select:focus, textarea:focus {
    outline: none;
    border-color: ${CONFIG.brand.colors.primary};
  }
  
  button {
    cursor: pointer;
    transition: all 0.2s;
    font-weight: 600;
    border: none;
    border-radius: 8px;
    font-family: inherit;
  }
  
  button:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
  
  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
  }
  
  .modal-content {
    background: white;
    border-radius: 16px;
    padding: 30px;
    max-width: 600px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
  }

  .tab-btn {
    padding: 10px 20px;
    background: none;
    border: none;
    border-bottom: 3px solid transparent;
    color: #666;
    font-weight: 600;
    transition: all 0.2s;
  }

  .tab-btn.active {
    color: ${CONFIG.brand.colors.primary};
    border-bottom-color: ${CONFIG.brand.colors.primary};
  }

  .tab-btn:hover {
    transform: none;
    box-shadow: none;
    color: ${CONFIG.brand.colors.primary};
  }

  .note-card {
    background: #FFFBEB;
    border-left: 4px solid ${CONFIG.brand.colors.warning};
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 10px;
  }

  .activity-item {
    display: flex;
    gap: 15px;
    padding: 15px;
    border-bottom: 1px solid #F3F4F6;
  }

  .activity-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    flex-shrink: 0;
  }
`;

const ClientHub = () => {
  const toast = useToast();
  
  // 📊 STATE
  const [artists, setArtists] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [view, setView] = useState('list'); // list, detail, new, edit
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview, sessions, notes, stats
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent'); // recent, name, spent, sessions
  
  // 📝 FORM STATE
  const [formData, setFormData] = useState({
    name: '',
    artistName: '',
    email: '',
    phone: '',
    genre: '',
    instagram: '',
    spotify: '',
    notes: '',
    address: '',
    birthDate: '',
    vip: false
  });

  const [newNote, setNewNote] = useState('');

  // 🔄 LOAD DATA
  useEffect(() => {
    loadArtists();
    loadTransactions();
  }, []);

  const loadArtists = () => {
    const loadedArtists = getItem(CONFIG.storageKeys.artists, []);
    setArtists(Array.isArray(loadedArtists) ? loadedArtists : []);
  };

  const loadTransactions = () => {
    const loadedTransactions = getItem(CONFIG.storageKeys.transactions, []);
    setTransactions(Array.isArray(loadedTransactions) ? loadedTransactions : []);
  };

  const saveArtists = (artistsToSave) => {
    const result = setItem(CONFIG.storageKeys.artists, artistsToSave);
    if (!result.success) {
      toast.error('Errore nel salvataggio dei clienti: ' + (result.error || 'Errore sconosciuto'));
      console.error('Errore salvataggio clienti:', result);
      return false;
    }
    return true;
  };

  // 🧮 CALCULATIONS
  const getArtistStats = (artistId) => {
    const artistTransactions = transactions.filter(t => t.artistId === artistId);
    const totalSpent = artistTransactions.reduce((sum, t) => {
      const paid = t.payments?.reduce((s, p) => s + p.amount, 0) || 0;
      return sum + paid;
    }, 0);
    
    const totalHours = artistTransactions.reduce((sum, t) => 
      sum + t.services.reduce((s, service) => s + service.hours, 0), 0
    );

    const lastSession = artistTransactions.length > 0 
      ? new Date(Math.max(...artistTransactions.map(t => new Date(t.timestamp))))
      : null;

    // Sessioni per mese (ultimi 6 mesi)
    const monthlyData = {};
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    artistTransactions
      .filter(t => new Date(t.timestamp) >= sixMonthsAgo)
      .forEach(t => {
        const date = new Date(t.timestamp);
        const monthKey = `${date.getMonth() + 1}/${date.getFullYear()}`;
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { month: monthKey, sessions: 0, spent: 0 };
        }
        monthlyData[monthKey].sessions += 1;
        const paid = t.payments?.reduce((s, p) => s + p.amount, 0) || 0;
        monthlyData[monthKey].spent += paid;
      });

    const monthlyTrend = Object.values(monthlyData).sort((a, b) => {
      const [aMonth, aYear] = a.month.split('/').map(Number);
      const [bMonth, bYear] = b.month.split('/').map(Number);
      return aYear - bYear || aMonth - bMonth;
    });

    return {
      totalSpent,
      totalHours,
      sessionsCount: artistTransactions.length,
      lastSession,
      monthlyTrend,
      avgPerSession: artistTransactions.length > 0 ? totalSpent / artistTransactions.length : 0
    };
  };

  // 🔍 FILTER & SORT
  const getFilteredArtists = () => {
    let filtered = artists;

    // Search
    if (searchQuery) {
      filtered = filtered.filter(a => 
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.artistName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.genre?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    switch (sortBy) {
      case 'name':
        filtered = [...filtered].sort((a, b) => a.artistName.localeCompare(b.artistName));
        break;
      case 'spent':
        filtered = [...filtered].sort((a, b) => {
          const aSpent = getArtistStats(a.id).totalSpent;
          const bSpent = getArtistStats(b.id).totalSpent;
          return bSpent - aSpent;
        });
        break;
      case 'sessions':
        filtered = [...filtered].sort((a, b) => {
          const aSessions = getArtistStats(a.id).sessionsCount;
          const bSessions = getArtistStats(b.id).sessionsCount;
          return bSessions - aSessions;
        });
        break;
      case 'recent':
      default:
        filtered = [...filtered].sort((a, b) => {
          const aLast = getArtistStats(a.id).lastSession || new Date(a.createdAt);
          const bLast = getArtistStats(b.id).lastSession || new Date(b.createdAt);
          return bLast - aLast;
        });
    }

    return filtered;
  };

  // ➕ ADD ARTIST
  const addArtist = () => {
    if (!formData.name || !formData.artistName) {
      toast.error('Nome e Nome d\'Arte sono obbligatori');
      return;
    }

    const artist = {
      id: Date.now(),
      ...formData,
      createdAt: new Date().toISOString(),
      noteHistory: []
    };

    const updatedArtists = [artist, ...artists];
    setArtists(updatedArtists);
    
    // Salva immediatamente
    if (saveArtists(updatedArtists)) {
      toast.success('Cliente creato con successo!');
      resetForm();
      setView('list');
    } else {
      // Rollback in caso di errore
      setArtists(artists);
    }
  };

  // ✏️ UPDATE ARTIST
  const updateArtist = () => {
    if (!formData.name || !formData.artistName) {
      toast.error('Nome e Nome d\'Arte sono obbligatori');
      return;
    }

    const updatedArtists = artists.map(a => 
      a.id === selectedArtist.id ? { ...a, ...formData, updatedAt: new Date().toISOString() } : a
    );
    
    setArtists(updatedArtists);
    
    // Aggiorna anche selectedArtist
    const updatedSelectedArtist = { ...selectedArtist, ...formData, updatedAt: new Date().toISOString() };
    setSelectedArtist(updatedSelectedArtist);
    
    // Salva immediatamente
    if (saveArtists(updatedArtists)) {
      toast.success('Cliente aggiornato con successo!');
      setView('detail');
    } else {
      // Rollback in caso di errore
      setArtists(artists);
      setSelectedArtist(selectedArtist);
    }
  };

  // 🗑️ DELETE ARTIST
  const deleteArtist = (artistId) => {
    if (window.confirm('Sei sicuro di voler eliminare questo artista? Verranno eliminate anche tutte le sue transazioni.')) {
      const updatedArtists = artists.filter(a => a.id !== artistId);
      const updatedTransactions = transactions.filter(t => t.artistId !== artistId);
      
      setArtists(updatedArtists);
      setTransactions(updatedTransactions);
      
      // Salva immediatamente
      if (saveArtists(updatedArtists)) {
        // Salva anche transazioni aggiornate
        const result = setItem(CONFIG.storageKeys.transactions, updatedTransactions);
        if (result.success) {
          toast.success('Cliente eliminato con successo!');
          setSelectedArtist(null);
          setView('list');
        } else {
          // Rollback in caso di errore
          setArtists(artists);
          setTransactions(transactions);
        }
      } else {
        // Rollback in caso di errore
        setArtists(artists);
        setTransactions(transactions);
      }
    }
  };

  // 📝 ADD NOTE
  const addNote = () => {
    if (!newNote.trim()) return;

    const note = {
      id: Date.now(),
      text: newNote,
      timestamp: new Date().toISOString()
    };

    const updatedArtists = artists.map(a => 
      a.id === selectedArtist.id 
        ? { ...a, noteHistory: [note, ...(a.noteHistory || [])] }
        : a
    );

    setArtists(updatedArtists);
    
    const updatedSelectedArtist = {
      ...selectedArtist,
      noteHistory: [note, ...(selectedArtist.noteHistory || [])]
    };
    setSelectedArtist(updatedSelectedArtist);

    // Salva immediatamente
    if (saveArtists(updatedArtists)) {
      setNewNote('');
      toast.success('Nota aggiunta!');
    } else {
      // Rollback in caso di errore
      setArtists(artists);
      setSelectedArtist(selectedArtist);
    }
  };

  // 🔄 RESET FORM
  const resetForm = () => {
    setFormData({
      name: '',
      artistName: '',
      email: '',
      phone: '',
      genre: '',
      instagram: '',
      spotify: '',
      notes: '',
      address: '',
      birthDate: '',
      vip: false
    });
  };

  const filteredArtists = getFilteredArtists();

  return (
    <div style={{ 
      fontFamily: 'Inter, sans-serif',
      minHeight: '100vh',
      background: '#F9FAFB',
      padding: '20px'
    }}>
      <style>{styles}</style>

      {/* 🔐 HEADER CON LOGOUT */}
      <Header title="👤 Client Hub" />

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
        {/* 🎨 MODULE HEADER */}
        <div style={{ 
          background: CONFIG.brand.gradient,
          color: 'white',
          padding: '20px',
          borderRadius: '16px',
          marginBottom: '30px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <h2 style={{ margin: '0 0 5px 0', fontSize: '1.5rem', fontWeight: 700 }}>
                Gestione Completa Artisti & Clienti
              </h2>
            </div>
            {view === 'list' && (
              <button
                onClick={() => {
                  resetForm();
                  setView('new');
                }}
                style={{
                  padding: '12px 24px',
                  background: 'white',
                  color: CONFIG.brand.colors.primary,
                  fontSize: '1rem',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                ➕ Nuovo Artista
              </button>
            )}
            {view !== 'list' && (
              <button
                onClick={() => {
                  setView('list');
                  setSelectedArtist(null);
                  resetForm();
                }}
                style={{
                  padding: '12px 24px',
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontSize: '1rem',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                ← Torna alla Lista
              </button>
            )}
          </div>
        </div>

        {/* 📋 ARTISTS LIST VIEW */}
        {view === 'list' && (
          <>
            {/* Stats Overview */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '15px', 
              marginBottom: '30px' 
            }}>
              <div className="stat-box">
                <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '8px', fontWeight: 600 }}>
                  ARTISTI TOTALI
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 700, color: CONFIG.brand.colors.primary }}>
                  {artists.length}
                </div>
              </div>
              <div className="stat-box">
                <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '8px', fontWeight: 600 }}>
                  ARTISTI VIP
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 700, color: CONFIG.brand.colors.warning }}>
                  {artists.filter(a => a.vip).length}
                </div>
              </div>
              <div className="stat-box">
                <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '8px', fontWeight: 600 }}>
                  GENERI DIVERSI
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 700, color: CONFIG.brand.colors.info }}>
                  {new Set(artists.map(a => a.genre).filter(Boolean)).size}
                </div>
              </div>
              <div className="stat-box">
                <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '8px', fontWeight: 600 }}>
                  ATTIVI QUESTO MESE
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 700, color: CONFIG.brand.colors.secondary }}>
                  {artists.filter(a => {
                    const lastSession = getArtistStats(a.id).lastSession;
                    if (!lastSession) return false;
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                    return lastSession >= thirtyDaysAgo;
                  }).length}
                </div>
              </div>
            </div>

            {/* Search & Sort */}
            <div style={{ 
              background: 'white',
              padding: '20px',
              borderRadius: '12px',
              marginBottom: '20px',
              display: 'flex',
              gap: '15px',
              flexWrap: 'wrap',
              alignItems: 'center'
            }}>
              <div style={{ flex: 1, minWidth: '250px' }}>
                <input
                  type="text"
                  placeholder="🔍 Cerca per nome, email, genere..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div style={{ minWidth: '200px' }}>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="recent">Più Recenti</option>
                  <option value="name">Nome A-Z</option>
                  <option value="spent">Più Speso</option>
                  <option value="sessions">Più Sessioni</option>
                </select>
              </div>
            </div>

            {/* Artists Grid */}
            {filteredArtists.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '60px 20px',
                background: 'white',
                borderRadius: '12px',
                color: '#999'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>👥</div>
                <p style={{ fontSize: '1.2rem' }}>
                  {searchQuery ? 'Nessun artista trovato' : 'Nessun artista ancora'}
                </p>
                {!searchQuery && (
                  <button
                    onClick={() => setView('new')}
                    style={{
                      marginTop: '20px',
                      padding: '12px 24px',
                      background: CONFIG.brand.colors.primary,
                      color: 'white',
                      fontSize: '1rem'
                    }}
                  >
                    ➕ Aggiungi il Primo Artista
                  </button>
                )}
              </div>
            ) : (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
                gap: '20px' 
              }}>
                {filteredArtists.map(artist => {
                  const stats = getArtistStats(artist.id);
                  return (
                    <div
                      key={artist.id}
                      className="artist-card"
                      onClick={() => {
                        setSelectedArtist(artist);
                        setView('detail');
                        setActiveTab('overview');
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                        <div style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '50%',
                          background: CONFIG.brand.gradient,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '1.5rem',
                          flexShrink: 0
                        }}>
                          {artist.artistName.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <div style={{ 
                              fontWeight: 700, 
                              fontSize: '1.2rem', 
                              color: '#1F2937',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {artist.artistName}
                            </div>
                            {artist.vip && (
                              <span style={{
                                background: CONFIG.brand.colors.warning,
                                color: 'white',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                fontWeight: 600
                              }}>
                                VIP
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.9rem', color: '#666' }}>
                            {artist.name}
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ 
                        fontSize: '0.85rem', 
                        color: '#666', 
                        marginBottom: '15px',
                        display: 'grid',
                        gap: '5px'
                      }}>
                        {artist.email && <div>📧 {artist.email}</div>}
                        {artist.phone && <div>📱 {artist.phone}</div>}
                        {artist.genre && (
                          <div style={{ 
                            display: 'inline-block',
                            background: '#F3F4F6',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            marginTop: '5px'
                          }}>
                            🎵 {artist.genre}
                          </div>
                        )}
                      </div>
                      
                      <div style={{ 
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '10px',
                        paddingTop: '15px',
                        borderTop: '2px solid #F3F4F6'
                      }}>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#666' }}>SPESO</div>
                          <div style={{ fontWeight: 700, color: CONFIG.brand.colors.primary, fontSize: '1.2rem' }}>
                            €{stats.totalSpent.toFixed(0)}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#666' }}>SESSIONI</div>
                          <div style={{ fontWeight: 700, color: CONFIG.brand.colors.secondary, fontSize: '1.2rem' }}>
                            {stats.sessionsCount}
                          </div>
                        </div>
                      </div>

                      {stats.lastSession && (
                        <div style={{ 
                          marginTop: '10px',
                          fontSize: '0.8rem',
                          color: '#999',
                          textAlign: 'center'
                        }}>
                          Ultima sessione: {stats.lastSession.toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ➕ NEW ARTIST VIEW */}
        {view === 'new' && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '30px', maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ margin: '0 0 25px 0', fontSize: '1.8rem', color: '#1F2937' }}>
              ➕ Nuovo Artista
            </h2>

            <div style={{ display: 'grid', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#666' }}>
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Mario Rossi"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#666' }}>
                    Nome d'Arte *
                  </label>
                  <input
                    type="text"
                    value={formData.artistName}
                    onChange={(e) => setFormData({ ...formData, artistName: e.target.value })}
                    placeholder="MC Flow"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#666' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@esempio.com"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#666' }}>
                    Telefono
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+39 333 1234567"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#666' }}>
                    Genere Musicale
                  </label>
                  <select
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                  >
                    <option value="">Seleziona...</option>
                    {CONFIG.musicGenres.map(genre => (
                      <option key={genre} value={genre}>{genre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#666' }}>
                    Data di Nascita
                  </label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#666' }}>
                    Instagram
                  </label>
                  <input
                    type="text"
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    placeholder="@username"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#666' }}>
                    Spotify Artist ID
                  </label>
                  <input
                    type="text"
                    value={formData.spotify}
                    onChange={(e) => setFormData({ ...formData, spotify: e.target.value })}
                    placeholder="spotify:artist:..."
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#666' }}>
                  Indirizzo
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Via, Città, CAP"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#666' }}>
                  Note Generali
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Preferenze, informazioni aggiuntive..."
                  rows={3}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  checked={formData.vip}
                  onChange={(e) => setFormData({ ...formData, vip: e.target.checked })}
                  id="vip-checkbox"
                />
                <label htmlFor="vip-checkbox" style={{ fontWeight: 600, color: '#666', cursor: 'pointer' }}>
                  ⭐ Cliente VIP
                </label>
              </div>

              <button
                onClick={addArtist}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: CONFIG.brand.colors.primary,
                  color: 'white',
                  fontSize: '1.1rem',
                  marginTop: '10px'
                }}
              >
                ✓ Crea Artista
              </button>
            </div>
          </div>
        )}

        {/* ✏️ EDIT ARTIST VIEW */}
        {view === 'edit' && selectedArtist && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '30px', maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ margin: '0 0 25px 0', fontSize: '1.8rem', color: '#1F2937' }}>
              ✏️ Modifica Artista
            </h2>

            <div style={{ display: 'grid', gap: '20px' }}>
              {/* Same form as new artist */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#666' }}>
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#666' }}>
                    Nome d'Arte *
                  </label>
                  <input
                    type="text"
                    value={formData.artistName}
                    onChange={(e) => setFormData({ ...formData, artistName: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#666' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#666' }}>
                    Telefono
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#666' }}>
                    Genere Musicale
                  </label>
                  <select
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                  >
                    <option value="">Seleziona...</option>
                    {CONFIG.musicGenres.map(genre => (
                      <option key={genre} value={genre}>{genre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#666' }}>
                    Data di Nascita
                  </label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#666' }}>
                    Instagram
                  </label>
                  <input
                    type="text"
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#666' }}>
                    Spotify Artist ID
                  </label>
                  <input
                    type="text"
                    value={formData.spotify}
                    onChange={(e) => setFormData({ ...formData, spotify: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#666' }}>
                  Indirizzo
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#666' }}>
                  Note Generali
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  checked={formData.vip}
                  onChange={(e) => setFormData({ ...formData, vip: e.target.checked })}
                  id="vip-checkbox-edit"
                />
                <label htmlFor="vip-checkbox-edit" style={{ fontWeight: 600, color: '#666', cursor: 'pointer' }}>
                  ⭐ Cliente VIP
                </label>
              </div>

              <button
                onClick={updateArtist}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: CONFIG.brand.colors.primary,
                  color: 'white',
                  fontSize: '1.1rem',
                  marginTop: '10px'
                }}
              >
                ✓ Salva Modifiche
              </button>
            </div>
          </div>
        )}

        {/* 🔍 ARTIST DETAIL VIEW */}
        {view === 'detail' && selectedArtist && (() => {
          const stats = getArtistStats(selectedArtist.id);
          const artistTransactions = transactions.filter(t => t.artistId === selectedArtist.id).reverse();
          
          return (
            <div>
              {/* Artist Header */}
              <div style={{ 
                background: 'white', 
                borderRadius: '12px', 
                padding: '30px',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      background: CONFIG.brand.gradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '2rem'
                    }}>
                      {selectedArtist.artistName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                        <h2 style={{ margin: 0, fontSize: '2rem', color: '#1F2937' }}>
                          {selectedArtist.artistName}
                        </h2>
                        {selectedArtist.vip && (
                          <span style={{
                            background: CONFIG.brand.colors.warning,
                            color: 'white',
                            padding: '4px 12px',
                            borderRadius: '16px',
                            fontSize: '0.9rem',
                            fontWeight: 600
                          }}>
                            ⭐ VIP
                          </span>
                        )}
                      </div>
                      <p style={{ margin: '0 0 10px 0', fontSize: '1.1rem', color: '#666' }}>
                        {selectedArtist.name}
                      </p>
                      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', fontSize: '0.9rem', color: '#666' }}>
                        {selectedArtist.email && <span>📧 {selectedArtist.email}</span>}
                        {selectedArtist.phone && <span>📱 {selectedArtist.phone}</span>}
                        {selectedArtist.genre && <span>🎵 {selectedArtist.genre}</span>}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => {
                        setFormData({
                          name: selectedArtist.name,
                          artistName: selectedArtist.artistName,
                          email: selectedArtist.email || '',
                          phone: selectedArtist.phone || '',
                          genre: selectedArtist.genre || '',
                          instagram: selectedArtist.instagram || '',
                          spotify: selectedArtist.spotify || '',
                          notes: selectedArtist.notes || '',
                          address: selectedArtist.address || '',
                          birthDate: selectedArtist.birthDate || '',
                          vip: selectedArtist.vip || false
                        });
                        setView('edit');
                      }}
                      style={{
                        padding: '10px 20px',
                        background: CONFIG.brand.colors.primary,
                        color: 'white'
                      }}
                    >
                      ✏️ Modifica
                    </button>
                    <button
                      onClick={() => deleteArtist(selectedArtist.id)}
                      style={{
                        padding: '10px 20px',
                        background: CONFIG.brand.colors.danger,
                        color: 'white'
                      }}
                    >
                      🗑️ Elimina
                    </button>
                  </div>
                </div>

                {/* Quick Stats */}
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '15px',
                  paddingTop: '20px',
                  borderTop: '2px solid #F3F4F6'
                }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '5px' }}>
                      Speso Totale
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 700, color: CONFIG.brand.colors.primary }}>
                      €{stats.totalSpent.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '5px' }}>
                      Sessioni Totali
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 700, color: CONFIG.brand.colors.secondary }}>
                      {stats.sessionsCount}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '5px' }}>
                      Ore Totali
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 700, color: CONFIG.brand.colors.info }}>
                      {stats.totalHours.toFixed(1)}h
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '5px' }}>
                      Media/Sessione
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 700, color: CONFIG.brand.colors.warning }}>
                      €{stats.avgPerSession.toFixed(0)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div style={{ 
                background: 'white',
                borderRadius: '12px 12px 0 0',
                padding: '0 20px',
                display: 'flex',
                gap: '10px',
                borderBottom: '2px solid #F3F4F6'
              }}>
                {[
                  { key: 'overview', label: '📋 Panoramica' },
                  { key: 'sessions', label: '🎵 Sessioni' },
                  { key: 'notes', label: '📝 Note' },
                  { key: 'stats', label: '📊 Statistiche' }
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div style={{ 
                background: 'white', 
                borderRadius: '0 0 12px 12px', 
                padding: '30px'
              }}>
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div style={{ display: 'grid', gap: '20px' }}>
                    {selectedArtist.notes && (
                      <div style={{ 
                        padding: '15px',
                        background: '#F9FAFB',
                        borderRadius: '8px',
                        borderLeft: '4px solid ' + CONFIG.brand.colors.primary
                      }}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '0.9rem', fontWeight: 600 }}>
                          NOTE GENERALI
                        </h4>
                        <p style={{ margin: 0, color: '#1F2937' }}>
                          {selectedArtist.notes}
                        </p>
                      </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      {selectedArtist.instagram && (
                        <div>
                          <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '5px' }}>Instagram</div>
                          <div style={{ color: '#1F2937', fontWeight: 500 }}>{selectedArtist.instagram}</div>
                        </div>
                      )}
                      {selectedArtist.spotify && (
                        <div>
                          <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '5px' }}>Spotify</div>
                          <div style={{ color: '#1F2937', fontWeight: 500 }}>{selectedArtist.spotify}</div>
                        </div>
                      )}
                      {selectedArtist.address && (
                        <div>
                          <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '5px' }}>Indirizzo</div>
                          <div style={{ color: '#1F2937', fontWeight: 500 }}>{selectedArtist.address}</div>
                        </div>
                      )}
                      {selectedArtist.birthDate && (
                        <div>
                          <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '5px' }}>Data di Nascita</div>
                          <div style={{ color: '#1F2937', fontWeight: 500 }}>
                            {new Date(selectedArtist.birthDate).toLocaleDateString()}
                          </div>
                        </div>
                      )}
                    </div>

                    {stats.lastSession && (
                      <div style={{ 
                        padding: '15px',
                        background: '#DBEAFE',
                        borderRadius: '8px',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '0.9rem', color: '#1E40AF', fontWeight: 600 }}>
                          Ultima Sessione: {stats.lastSession.toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Sessions Tab */}
                {activeTab === 'sessions' && (
                  <div>
                    {artistTransactions.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🎵</div>
                        <p>Nessuna sessione ancora</p>
                      </div>
                    ) : (
                      artistTransactions.map(transaction => (
                        <div 
                          key={transaction.id}
                          className="activity-item"
                        >
                          <div 
                            className="activity-icon"
                            style={{ background: '#F3E8FF', color: CONFIG.brand.colors.primary }}
                          >
                            🎵
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, color: '#1F2937', marginBottom: '5px' }}>
                              {transaction.services.map(s => s.name).join(', ')}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#666' }}>
                              {new Date(transaction.timestamp).toLocaleDateString()} - 
                              {transaction.services.reduce((sum, s) => sum + s.hours, 0)}h - 
                              €{transaction.total.toFixed(2)}
                            </div>
                            {transaction.notes && (
                              <div style={{ 
                                marginTop: '5px',
                                fontSize: '0.85rem',
                                color: '#666',
                                fontStyle: 'italic'
                              }}>
                                📝 {transaction.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Notes Tab */}
                {activeTab === 'notes' && (
                  <div>
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                          type="text"
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          placeholder="Aggiungi una nota..."
                          onKeyPress={(e) => e.key === 'Enter' && addNote()}
                        />
                        <button
                          onClick={addNote}
                          style={{
                            padding: '10px 20px',
                            background: CONFIG.brand.colors.primary,
                            color: 'white',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          ➕ Aggiungi
                        </button>
                      </div>
                    </div>

                    {(!selectedArtist.noteHistory || selectedArtist.noteHistory.length === 0) ? (
                      <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📝</div>
                        <p>Nessuna nota ancora</p>
                      </div>
                    ) : (
                      selectedArtist.noteHistory.map(note => (
                        <div key={note.id} className="note-card">
                          <div style={{ fontSize: '0.85rem', color: '#92400E', marginBottom: '8px' }}>
                            {new Date(note.timestamp).toLocaleString()}
                          </div>
                          <div style={{ color: '#1F2937' }}>
                            {note.text}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Stats Tab */}
                {activeTab === 'stats' && (
                  <div>
                    {stats.monthlyTrend.length > 0 && (
                      <>
                        <h3 style={{ margin: '0 0 20px 0', fontSize: '1.3rem', color: '#1F2937' }}>
                          Trend Ultimi 6 Mesi
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={stats.monthlyTrend}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis yAxisId="left" />
                            <YAxis yAxisId="right" orientation="right" />
                            <Tooltip />
                            <Line yAxisId="left" type="monotone" dataKey="sessions" stroke={CONFIG.brand.colors.primary} name="Sessioni" strokeWidth={2} />
                            <Line yAxisId="right" type="monotone" dataKey="spent" stroke={CONFIG.brand.colors.secondary} name="Speso €" strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      </>
                    )}

                    {stats.sessionsCount === 0 && (
                      <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📊</div>
                        <p>Nessuna statistica disponibile</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default ClientHub;
