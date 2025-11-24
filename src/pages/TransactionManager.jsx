import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { STUDIO_CONFIG, getStatusesAlias } from '../config/studio.config';
import { getServices as getCatalogoServices, getServiceCategories } from '../utils/catalogo';

// 🎨 CONFIGURAZIONE - Vibes Studio (configurazione centralizzata)
const CONFIG = {
  ...STUDIO_CONFIG,
  // Alias per compatibilità con codice esistente
  statuses: getStatusesAlias(),
  // Servizi verranno caricati dinamicamente dal Catalogo
  services: {}
};

// 🎨 STILI GLOBALI
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  
  * { box-sizing: border-box; }
  
  .stat-card {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    transition: all 0.2s;
  }
  
  .stat-card:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    transform: translateY(-2px);
  }
  
  .transaction-card {
    background: white;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 15px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    border: 2px solid transparent;
    transition: all 0.2s;
  }
  
  .transaction-card:hover {
    border-color: ${CONFIG.brand.colors.primary};
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
    max-width: 700px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
  }
  
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
  }

  .payment-pill {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 600;
    margin: 2px;
  }
`;

const TransactionManager = () => {
  // 📊 STATE
  const [artists, setArtists] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [services, setServices] = useState({}); // Servizi dal catalogo
  const [view, setView] = useState('dashboard'); // dashboard, new, detail
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, partial, paid
  const [searchQuery, setSearchQuery] = useState('');
  
  // 📝 NEW TRANSACTION STATE
  const [newTransaction, setNewTransaction] = useState({
    artistId: null,
    services: [],
    notes: '',
    payments: []
  });
  const [transactionServices, setTransactionServices] = useState([]);

  // 💰 PAYMENT MODAL STATE
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);

  // 🔄 LOAD DATA
  useEffect(() => {
    const loadedArtists = JSON.parse(localStorage.getItem(CONFIG.storageKeys.artists) || '[]');
    const loadedTransactions = JSON.parse(localStorage.getItem(CONFIG.storageKeys.transactions) || '[]');
    setArtists(loadedArtists);
    setTransactions(loadedTransactions);
    
    // Carica servizi dal catalogo
    const catalogoServices = getCatalogoServices();
    const servicesMap = {};
    catalogoServices.forEach(s => {
      if (s.available !== false) {
        servicesMap[s.id] = {
          id: s.id,
          name: s.nome,
          pricePerHour: s.pricePerHour,
          category: s.categoria,
          icon: s.icon,
          color: s.color,
          description: s.description,
          available: s.available
        };
      }
    });
    setServices(servicesMap);
  }, []);

  // 💾 SAVE DATA
  useEffect(() => {
    localStorage.setItem(CONFIG.storageKeys.transactions, JSON.stringify(transactions));
  }, [transactions]);

  // 🧮 CALCULATIONS
  const calculateTotal = (servicesArray) => {
    return servicesArray.reduce((sum, s) => {
      const service = services[s.serviceId];
      if (!service) return sum;
      return sum + (service.pricePerHour * s.hours);
    }, 0);
  };

  const calculatePaid = (payments) => {
    return payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
  };

  const getTransactionStatus = (transaction) => {
    const total = transaction.total;
    const paid = calculatePaid(transaction.payments);
    
    if (paid === 0) return 'pending';
    if (paid < total) return 'partial';
    return 'paid';
  };

  // ➕ ADD TRANSACTION
  const addTransaction = () => {
    if (!newTransaction.artistId || transactionServices.length === 0) {
      alert('Seleziona un artista e aggiungi almeno un servizio');
      return;
    }

    const artist = artists.find(a => a.id === newTransaction.artistId);
    const servicesData = transactionServices.map(s => {
      const service = services[s.serviceId];
      if (!service) return null;
      return {
        serviceId: s.serviceId,
        name: service.name,
        hours: s.hours,
        price: service.pricePerHour,
        total: service.pricePerHour * s.hours
      };
    });

    const total = calculateTotal(transactionServices);
    
    const transaction = {
      id: Date.now(),
      artistId: newTransaction.artistId,
      artistName: artist.artistName,
      services: servicesData,
      total: total,
      payments: [],
      timestamp: new Date().toISOString(),
      notes: newTransaction.notes
    };

    setTransactions(prev => [transaction, ...prev]);
    setNewTransaction({ artistId: null, services: [], notes: '', payments: [] });
    setTransactionServices([]);
    setView('dashboard');
  };

  // 💳 ADD PAYMENT
  const addPayment = () => {
    if (!paymentAmount || !paymentMethod) {
      alert('Inserisci importo e metodo di pagamento');
      return;
    }

    const amount = parseFloat(paymentAmount);
    const paid = calculatePaid(selectedTransaction.payments);
    const remaining = selectedTransaction.total - paid;

    if (amount > remaining) {
      alert(`L'importo non può superare il saldo rimanente di €${remaining.toFixed(2)}`);
      return;
    }

    const payment = {
      id: Date.now(),
      amount: amount,
      method: paymentMethod,
      date: paymentDate,
      timestamp: new Date().toISOString()
    };

    setTransactions(prev => prev.map(t => 
      t.id === selectedTransaction.id 
        ? { ...t, payments: [...(t.payments || []), payment] }
        : t
    ));

    setSelectedTransaction(prev => ({
      ...prev,
      payments: [...(prev.payments || []), payment]
    }));

    setPaymentAmount('');
    setPaymentMethod('');
    setShowPaymentModal(false);
  };

  // 🔍 FILTER & SEARCH
  const getFilteredTransactions = () => {
    let filtered = transactions;

    // Filter by status
    if (filter !== 'all') {
      filtered = filtered.filter(t => getTransactionStatus(t) === filter);
    }

    // Search
    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.artistName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.notes?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredTransactions = getFilteredTransactions();

  // 📊 STATS
  const stats = {
    total: transactions.length,
    pending: transactions.filter(t => getTransactionStatus(t) === 'pending').length,
    partial: transactions.filter(t => getTransactionStatus(t) === 'partial').length,
    paid: transactions.filter(t => getTransactionStatus(t) === 'paid').length,
    totalRevenue: transactions.reduce((sum, t) => sum + calculatePaid(t.payments), 0),
    pendingAmount: transactions.reduce((sum, t) => {
      const status = getTransactionStatus(t);
      if (status === 'pending') return sum + t.total;
      if (status === 'partial') return sum + (t.total - calculatePaid(t.payments));
      return sum;
    }, 0)
  };

  return (
    <div style={{ 
      fontFamily: 'Inter, sans-serif',
      minHeight: '100vh',
      background: '#F9FAFB'
    }}>
      <style>{styles}</style>

      {/* 🔐 HEADER CON LOGOUT */}
      <Header title="💰 Transaction Manager" />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{
                width: '60px',
                height: '24px',
                backgroundImage: 'url(/assets/vibes-logo-small.png)',
                backgroundSize: 'contain',
                backgroundPosition: 'left center',
                backgroundRepeat: 'no-repeat',
                flexShrink: 0
              }}></div>
              <h2 style={{ margin: '0 0 5px 0', fontSize: '1.5rem', fontWeight: 700 }}>
                Gestione Pagamenti & Transazioni
              </h2>
            </div>
            {view === 'dashboard' && (
              <button
                onClick={() => setView('new')}
                style={{
                  padding: '12px 24px',
                  background: 'white',
                  color: CONFIG.brand.colors.primary,
                  fontSize: '1rem'
                }}
              >
                ➕ Nuova Transazione
              </button>
            )}
            {view !== 'dashboard' && (
              <button
                onClick={() => {
                  setView('dashboard');
                  setSelectedTransaction(null);
                }}
                style={{
                  padding: '12px 24px',
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontSize: '1rem'
                }}
              >
                ← Indietro
              </button>
            )}
          </div>
        </div>

        {/* 📊 DASHBOARD VIEW */}
        {view === 'dashboard' && (
          <>
            {/* Stats Cards */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
              gap: '15px', 
              marginBottom: '30px' 
            }}>
              <div className="stat-card">
                <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '8px', fontWeight: 600 }}>
                  TOTALE TRANSAZIONI
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 700, color: CONFIG.brand.colors.primary }}>
                  {stats.total}
                </div>
              </div>
              <div className="stat-card">
                <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '8px', fontWeight: 600 }}>
                  INCASSATO
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 700, color: CONFIG.brand.colors.secondary }}>
                  €{stats.totalRevenue.toFixed(0)}
                </div>
              </div>
              <div className="stat-card">
                <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '8px', fontWeight: 600 }}>
                  DA INCASSARE
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 700, color: CONFIG.brand.colors.warning }}>
                  €{stats.pendingAmount.toFixed(0)}
                </div>
              </div>
              <div className="stat-card">
                <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '8px', fontWeight: 600 }}>
                  IN ATTESA
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 700, color: '#666' }}>
                  {stats.pending}
                </div>
              </div>
            </div>

            {/* Filters & Search */}
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
                  placeholder="🔍 Cerca per artista o note..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {['all', 'pending', 'partial', 'paid'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    style={{
                      padding: '8px 16px',
                      background: filter === f ? CONFIG.brand.colors.primary : 'white',
                      color: filter === f ? 'white' : '#666',
                      border: `2px solid ${filter === f ? CONFIG.brand.colors.primary : '#E5E7EB'}`,
                      fontSize: '0.9rem'
                    }}
                  >
                    {f === 'all' ? 'Tutte' : CONFIG.statuses[f].name}
                  </button>
                ))}
              </div>
            </div>

            {/* Transactions List */}
            {filteredTransactions.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '60px 20px',
                background: 'white',
                borderRadius: '12px',
                color: '#999'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>💰</div>
                <p style={{ fontSize: '1.2rem' }}>
                  {searchQuery || filter !== 'all' ? 'Nessuna transazione trovata' : 'Nessuna transazione ancora'}
                </p>
              </div>
            ) : (
              filteredTransactions.map(transaction => {
                const status = getTransactionStatus(transaction);
                const statusConfig = CONFIG.statuses[status];
                const paid = calculatePaid(transaction.payments);
                const remaining = transaction.total - paid;

                return (
                  <div 
                    key={transaction.id} 
                    className="transaction-card"
                    onClick={() => {
                      setSelectedTransaction(transaction);
                      setView('detail');
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px', flexWrap: 'wrap', gap: '15px' }}>
                      <div>
                        <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#1F2937', marginBottom: '5px' }}>
                          {transaction.artistName}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>
                          {new Date(transaction.timestamp).toLocaleDateString()} - {new Date(transaction.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: 700, color: CONFIG.brand.colors.primary, marginBottom: '5px' }}>
                          €{transaction.total.toFixed(2)}
                        </div>
                        <span 
                          className="badge"
                          style={{
                            background: statusConfig.bg,
                            color: statusConfig.color
                          }}
                        >
                          {statusConfig.icon} {statusConfig.name}
                        </span>
                      </div>
                    </div>

                    <div style={{ 
                      display: 'flex', 
                      gap: '10px',
                      marginBottom: '15px',
                      flexWrap: 'wrap'
                    }}>
                      {transaction.services.map((service, idx) => (
                        <span 
                          key={idx}
                          style={{
                            padding: '4px 10px',
                            background: '#F3F4F6',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            color: '#666'
                          }}
                        >
                          {services[service.serviceId]?.icon || '🎵'} {service.name} ({service.hours}h)
                        </span>
                      ))}
                    </div>

                    {status !== 'paid' && (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '12px',
                        background: '#FEF3C7',
                        borderRadius: '8px',
                        fontSize: '0.9rem'
                      }}>
                        <span>💰 Pagato: <strong>€{paid.toFixed(2)}</strong></span>
                        <span style={{ color: '#92400E', fontWeight: 600 }}>
                          Rimanente: €{remaining.toFixed(2)}
                        </span>
                      </div>
                    )}

                    {transaction.notes && (
                      <div style={{ 
                        marginTop: '10px',
                        padding: '10px',
                        background: '#F9FAFB',
                        borderRadius: '6px',
                        fontSize: '0.9rem',
                        color: '#666'
                      }}>
                        📝 {transaction.notes}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </>
        )}

        {/* ➕ NEW TRANSACTION VIEW */}
        {view === 'new' && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '30px' }}>
            <h2 style={{ margin: '0 0 25px 0', fontSize: '1.8rem', color: '#1F2937' }}>
              ➕ Nuova Transazione
            </h2>

            <div style={{ display: 'grid', gap: '20px' }}>
              {/* Select Artist */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#666' }}>
                  Seleziona Artista *
                </label>
                <select
                  value={newTransaction.artistId || ''}
                  onChange={(e) => setNewTransaction({ ...newTransaction, artistId: parseInt(e.target.value) })}
                >
                  <option value="">Scegli un artista...</option>
                  {artists.map(artist => (
                    <option key={artist.id} value={artist.id}>
                      {artist.artistName} ({artist.name})
                    </option>
                  ))}
                </select>
              </div>

              {/* Services */}
              <div style={{
                border: '2px dashed #E5E7EB',
                borderRadius: '12px',
                padding: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#1F2937' }}>Servizi</h3>
                  <button
                    onClick={() => {
                      const firstServiceId = Object.keys(services)[0];
                      if (firstServiceId) {
                        setTransactionServices(prev => [...prev, { serviceId: firstServiceId, hours: 1 }]);
                      }
                    }}
                    style={{
                      padding: '8px 16px',
                      background: CONFIG.brand.colors.secondary,
                      color: 'white',
                      fontSize: '0.9rem'
                    }}
                  >
                    ➕ Aggiungi Servizio
                  </button>
                </div>

                {transactionServices.map((service, idx) => (
                  <div 
                    key={idx}
                    style={{
                      background: '#F9FAFB',
                      padding: '15px',
                      borderRadius: '8px',
                      marginBottom: '10px'
                    }}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '10px', alignItems: 'end' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: '#666' }}>
                          Servizio
                        </label>
                        <select
                          value={service.serviceId}
                          onChange={(e) => {
                            const newServices = [...transactionServices];
                            newServices[idx].serviceId = e.target.value;
                            setTransactionServices(newServices);
                          }}
                        >
                          {Object.entries(services).map(([id, s]) => (
                            <option key={id} value={id}>
                              {s.icon} {s.name} (€{s.pricePerHour}/h)
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: '#666' }}>
                          Ore
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          min="0.5"
                          value={service.hours}
                          onChange={(e) => {
                            const newServices = [...transactionServices];
                            newServices[idx].hours = parseFloat(e.target.value);
                            setTransactionServices(newServices);
                          }}
                        />
                      </div>
                      <button
                        onClick={() => setTransactionServices(prev => prev.filter((_, i) => i !== idx))}
                        style={{
                          padding: '10px',
                          background: CONFIG.brand.colors.danger,
                          color: 'white'
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                    <div style={{ marginTop: '8px', fontSize: '0.9rem', color: '#666', textAlign: 'right' }}>
                      Subtotale: <strong style={{ color: CONFIG.brand.colors.primary }}>
                        €{services[service.serviceId] ? (services[service.serviceId].pricePerHour * service.hours).toFixed(2) : '0.00'}
                      </strong>
                    </div>
                  </div>
                ))}

                {transactionServices.length === 0 && (
                  <p style={{ textAlign: 'center', color: '#999', padding: '20px 0' }}>
                    Nessun servizio aggiunto
                  </p>
                )}

                {transactionServices.length > 0 && (
                  <div style={{
                    marginTop: '15px',
                    paddingTop: '15px',
                    borderTop: '2px solid #E5E7EB',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: CONFIG.brand.colors.primary,
                    textAlign: 'right'
                  }}>
                    TOTALE: €{calculateTotal(transactionServices).toFixed(2)}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#666' }}>
                  Note
                </label>
                <textarea
                  value={newTransaction.notes}
                  onChange={(e) => setNewTransaction({ ...newTransaction, notes: e.target.value })}
                  placeholder="Nome traccia, progetto, informazioni aggiuntive..."
                  rows={3}
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={addTransaction}
                disabled={!newTransaction.artistId || transactionServices.length === 0}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: CONFIG.brand.colors.primary,
                  color: 'white',
                  fontSize: '1.1rem',
                  marginTop: '10px'
                }}
              >
                ✓ Crea Transazione
              </button>
            </div>
          </div>
        )}

        {/* 🔍 TRANSACTION DETAIL VIEW */}
        {view === 'detail' && selectedTransaction && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
              <div>
                <h2 style={{ margin: '0 0 10px 0', fontSize: '2rem', color: '#1F2937' }}>
                  {selectedTransaction.artistName}
                </h2>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>
                  {new Date(selectedTransaction.timestamp).toLocaleDateString()} - {new Date(selectedTransaction.timestamp).toLocaleTimeString()}
                </div>
              </div>
              <span 
                className="badge"
                style={{
                  background: CONFIG.statuses[getTransactionStatus(selectedTransaction)].bg,
                  color: CONFIG.statuses[getTransactionStatus(selectedTransaction)].color,
                  fontSize: '1rem',
                  padding: '10px 20px'
                }}
              >
                {CONFIG.statuses[getTransactionStatus(selectedTransaction)].icon} {CONFIG.statuses[getTransactionStatus(selectedTransaction)].name}
              </span>
            </div>

            {/* Services */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ fontSize: '1.3rem', color: '#1F2937', marginBottom: '15px' }}>
                Servizi
              </h3>
              {selectedTransaction.services.map((service, idx) => (
                <div 
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '12px',
                    borderBottom: idx < selectedTransaction.services.length - 1 ? '1px solid #F3F4F6' : 'none'
                  }}
                >
                  <span style={{ color: '#666' }}>
                    {services[service.serviceId]?.icon || '🎵'} {service.name} ({service.hours}h @ €{service.price}/h)
                  </span>
                  <span style={{ fontWeight: 600, color: '#1F2937' }}>
                    €{service.total.toFixed(2)}
                  </span>
                </div>
              ))}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '15px',
                marginTop: '15px',
                borderTop: '2px solid #E5E7EB',
                fontSize: '1.3rem',
                fontWeight: 700
              }}>
                <span>TOTALE</span>
                <span style={{ color: CONFIG.brand.colors.primary }}>
                  €{selectedTransaction.total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Payments */}
            <div style={{ marginBottom: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ fontSize: '1.3rem', color: '#1F2937', margin: 0 }}>
                  Pagamenti
                </h3>
                {getTransactionStatus(selectedTransaction) !== 'paid' && (
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    style={{
                      padding: '10px 20px',
                      background: CONFIG.brand.colors.secondary,
                      color: 'white',
                      fontSize: '0.9rem'
                    }}
                  >
                    ➕ Aggiungi Pagamento
                  </button>
                )}
              </div>

              {(!selectedTransaction.payments || selectedTransaction.payments.length === 0) ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '40px 20px',
                  background: '#FEF3C7',
                  borderRadius: '8px',
                  color: '#92400E'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '10px' }}>💰</div>
                  <p>Nessun pagamento registrato</p>
                </div>
              ) : (
                <>
                  {selectedTransaction.payments.map((payment, idx) => {
                    const method = CONFIG.paymentMethods.find(m => m.id === payment.method);
                    return (
                      <div 
                        key={payment.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '15px',
                          background: '#F9FAFB',
                          borderRadius: '8px',
                          marginBottom: '10px'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, color: '#1F2937', marginBottom: '5px' }}>
                            {method?.icon} {method?.name}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: '#666' }}>
                            {new Date(payment.date).toLocaleDateString()}
                          </div>
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: CONFIG.brand.colors.secondary }}>
                          €{payment.amount.toFixed(2)}
                        </div>
                      </div>
                    );
                  })}

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '15px',
                    background: '#D1FAE5',
                    borderRadius: '8px',
                    marginTop: '15px'
                  }}>
                    <span style={{ fontWeight: 600, color: '#065F46' }}>
                      Totale Pagato
                    </span>
                    <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#065F46' }}>
                      €{calculatePaid(selectedTransaction.payments).toFixed(2)}
                    </span>
                  </div>

                  {getTransactionStatus(selectedTransaction) !== 'paid' && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '15px',
                      background: '#FEF3C7',
                      borderRadius: '8px',
                      marginTop: '10px'
                    }}>
                      <span style={{ fontWeight: 600, color: '#92400E' }}>
                        Rimanente
                      </span>
                      <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#92400E' }}>
                        €{(selectedTransaction.total - calculatePaid(selectedTransaction.payments)).toFixed(2)}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Notes */}
            {selectedTransaction.notes && (
              <div style={{ 
                padding: '15px',
                background: '#F9FAFB',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '0.9rem', fontWeight: 600 }}>
                  NOTE
                </h4>
                <p style={{ margin: 0, color: '#1F2937' }}>
                  {selectedTransaction.notes}
                </p>
              </div>
            )}
          </div>
        )}

        {/* 💳 PAYMENT MODAL */}
        {showPaymentModal && (
          <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowPaymentModal(false)}>
            <div className="modal-content" style={{ maxWidth: '500px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <h2 style={{ margin: 0, fontSize: '1.8rem', color: '#1F2937' }}>
                  ➕ Aggiungi Pagamento
                </h2>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.8rem',
                    cursor: 'pointer',
                    color: '#999'
                  }}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: 'grid', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#666' }}>
                    Importo * (Max: €{(selectedTransaction.total - calculatePaid(selectedTransaction.payments)).toFixed(2)})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#666' }}>
                    Metodo di Pagamento *
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="">Seleziona...</option>
                    {CONFIG.paymentMethods.map(method => (
                      <option key={method.id} value={method.id}>
                        {method.icon} {method.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#666' }}>
                    Data Pagamento
                  </label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                  />
                </div>

                <button
                  onClick={addPayment}
                  disabled={!paymentAmount || !paymentMethod}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: CONFIG.brand.colors.secondary,
                    color: 'white',
                    fontSize: '1.1rem',
                    marginTop: '10px'
                  }}
                >
                  ✓ Registra Pagamento
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionManager;
