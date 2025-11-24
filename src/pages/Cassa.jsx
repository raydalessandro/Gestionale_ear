import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CASSA_CONFIG, formatPrezzo, generateNumeroVendita } from '../config/cassa.config';
import Header from '../components/Header';
import { useToast } from '../components/Toast';
import { syncStockFromSale } from '../utils/inventory';
import { getInventoryProducts } from '../utils/inventory';
import { getProducts as getCatalogoProducts, getProductCategories } from '../utils/catalogo';

// 🎨 STILI GLOBALI
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  
  * { box-sizing: border-box; margin: 0; padding: 0; }
  
  body { font-family: 'Inter', sans-serif; }

  .product-card {
    background: white;
    border-radius: 12px;
    padding: 15px;
    cursor: pointer;
    transition: all 0.2s;
    border: 2px solid #E5E7EB;
    text-align: center;
  }

  .product-card:hover {
    border-color: #F97316;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(249, 115, 22, 0.2);
  }

  .cart-item {
    background: #F9FAFB;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 10px;
    border: 1px solid #E5E7EB;
  }

  .btn-primary {
    background: linear-gradient(135deg, #FCD34D 0%, #FB923C 50%, #F97316 100%);
    color: #1F2937;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  }

  .btn-secondary {
    background: white;
    color: #6B7280;
    border: 2px solid #E5E7EB;
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-secondary:hover {
    border-color: #F97316;
    color: #F97316;
  }

  .btn-danger {
    background: #DC2626;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .category-btn {
    padding: 10px 20px;
    border: 2px solid #E5E7EB;
    background: white;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    font-weight: 600;
  }

  .category-btn.active {
    background: #F97316;
    color: white;
    border-color: #F97316;
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  }

  .modal-content {
    background: white;
    border-radius: 16px;
    padding: 30px;
    max-width: 500px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
  }

  input, select {
    width: 100%;
    padding: 10px 12px;
    border: 2px solid #E5E7EB;
    border-radius: 8px;
    font-family: inherit;
    font-size: 1rem;
  }

  input:focus, select:focus {
    outline: none;
    border-color: #F97316;
  }
`;

const Cassa = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [view, setView] = useState('pos'); // 'pos' | 'storico' | 'analytics'
  const [categoriaSelezionata, setCategoriaSelezionata] = useState('tutti');
  const [searchTerm, setSearchTerm] = useState('');
  const [carrello, setCarrello] = useState([]);
  const [clienteSelezionato, setClienteSelezionato] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [metodoPagamento, setMetodoPagamento] = useState('cash');
  const [vendite, setVendite] = useState([]);
  const [showClientModal, setShowClientModal] = useState(false);
  const [clienti, setClienti] = useState([]);
  const [prodotti, setProdotti] = useState([]);
  const [categorie, setCategorie] = useState([]);

  // 📦 Carica dati iniziali
  useEffect(() => {
    try {
      const savedSales = localStorage.getItem(CASSA_CONFIG.storageKeys.sales);
      if (savedSales) {
        try {
          setVendite(JSON.parse(savedSales));
        } catch (e) {
          console.error('Errore nel parsing vendite:', e);
          setVendite([]);
        }
      }

      // Carica clienti usando la stessa storage key di ClientHub
      try {
        const loadedClients = getItem(STUDIO_CONFIG.storageKeys.artists, []);
        if (Array.isArray(loadedClients)) {
          setClienti(loadedClients);
        }
      } catch (e) {
        console.error('Errore nel caricamento clienti:', e);
        setClienti([]);
      }
      
      // Carica prodotti da Magazzino (che ha info stock/prezzo) basati su Catalogo
      loadProducts();
      
      // Carica categorie
      try {
        setCategorie(getProductCategories());
      } catch (e) {
        console.error('Errore nel caricamento categorie:', e);
        setCategorie([]);
      }
    } catch (error) {
      console.error('Errore generale nel caricamento dati Cassa:', error);
      toast.error('Errore nel caricamento dei dati. Controlla la console.');
    }
  }, []);

  const loadProducts = () => {
    try {
      // Carica prodotti inventario (che hanno stock e prezzo)
      const inventoryProducts = getInventoryProducts();
      
      // Verifica che sia un oggetto
      if (!inventoryProducts || typeof inventoryProducts !== 'object') {
        console.warn('Inventory products non è un oggetto valido:', inventoryProducts);
        setProdotti([]);
        return;
      }
      
      // Carica prodotti dal catalogo per verifica
      let catalogoProducts = [];
      try {
        catalogoProducts = getCatalogoProducts();
      } catch (e) {
        console.error('Errore nel caricamento catalogo:', e);
      }
      
      // Converti in array e filtra
      const prodottiArray = Object.values(inventoryProducts);
      const prodottiDisponibili = prodottiArray.filter(p => {
        if (!p || typeof p !== 'object') return false;
        
        // Verifica che il prodotto esista ancora nel catalogo
        const catalogoProd = catalogoProducts.find(cp => cp && cp.id === p.id && cp.attivo !== false);
        if (!catalogoProd) return false;
        
        // Solo prodotti con prezzo impostato
        return p.prezzo && p.prezzo > 0;
      });
      
      setProdotti(prodottiDisponibili);
    } catch (error) {
      console.error('Errore nel caricamento prodotti:', error);
      toast.error('Errore nel caricamento prodotti. Controlla la console.');
      setProdotti([]);
    }
  };

  // 🛒 Aggiungi al carrello
  const aggiungiAlCarrello = (prodotto) => {
    const itemEsistente = carrello.find(item => item.id === prodotto.id);
    
    if (itemEsistente) {
      setCarrello(carrello.map(item =>
        item.id === prodotto.id
          ? { ...item, quantita: item.quantita + 1 }
          : item
      ));
    } else {
      setCarrello([...carrello, { ...prodotto, quantita: 1, sconto: 0 }]);
    }
  };

  // ➖ Rimuovi dal carrello
  const rimuoviDalCarrello = (id) => {
    setCarrello(carrello.filter(item => item.id !== id));
  };

  // 🔢 Modifica quantità
  const modificaQuantita = (id, nuovaQuantita) => {
    if (nuovaQuantita < 1) {
      rimuoviDalCarrello(id);
      return;
    }
    setCarrello(carrello.map(item =>
      item.id === id ? { ...item, quantita: nuovaQuantita } : item
    ));
  };

  // 💰 Calcola totali
  const calcolaTotali = () => {
    const subtotale = carrello.reduce((sum, item) => 
      sum + (item.prezzo * item.quantita), 0
    );
    const scontoTotale = carrello.reduce((sum, item) => 
      sum + ((item.prezzo * item.quantita) * (item.sconto / 100)), 0
    );
    const totale = subtotale - scontoTotale;
    
    return { subtotale, scontoTotale, totale };
  };

  // ✅ Completa vendita
  const completaVendita = () => {
    if (carrello.length === 0) {
      toast.error('Carrello vuoto!');
      return;
    }

    const { subtotale, scontoTotale, totale } = calcolaTotali();

    const vendita = {
  id: Date.now().toString(),
  numero: generateNumeroVendita(),
  data: new Date().toISOString(),
    cliente: clienteSelezionato ? {
      id: clienteSelezionato.id,
      nome: clienteSelezionato.artistName || clienteSelezionato.nome,
      email: clienteSelezionato.email || '',
      telefono: clienteSelezionato.phone || clienteSelezionato.telefono || ''
    } : null,
  items: carrello,
  subtotale,
  sconto: scontoTotale,
  totale,
  pagamento: {
    metodo: metodoPagamento,
    importo: totale
  },
  operatore: 'Admin' // TODO: sostituire con utente loggato
};

    const nuoveVendite = [vendita, ...vendite];
    setVendite(nuoveVendite);
    localStorage.setItem(CASSA_CONFIG.storageKeys.sales, JSON.stringify(nuoveVendite));

    // 📦 Sincronizza stock con Magazzino
    try {
      const syncResults = syncStockFromSale(carrello);
      const failedSyncs = syncResults.filter(r => !r.success);
      
      if (failedSyncs.length > 0) {
        console.warn('Alcuni prodotti non sono stati sincronizzati:', failedSyncs);
        toast.warning(`Vendita completata, ma ${failedSyncs.length} prodotto/i non sincronizzati con magazzino`);
      }
    } catch (error) {
      console.error('Errore nella sincronizzazione stock:', error);
      // Non blocchiamo la vendita se la sincronizzazione fallisce
    }

    // Reset
    setCarrello([]);
    setClienteSelezionato(null);
    setShowPaymentModal(false);
    setMetodoPagamento('cash');

    toast.success(`✅ Vendita completata! N° ${vendita.numero} - Totale: ${formatPrezzo(totale)}`);
  };

  // 🔍 Filtra prodotti
  const prodottiFiltrati = () => {
    let filtered = prodotti;
    
    // Filtra per categoria
    if (categoriaSelezionata !== 'tutti') {
      filtered = filtered.filter(p => p.categoria === categoriaSelezionata);
    }
    
    // Filtra per ricerca
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.codice && p.codice.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    return filtered;
  };

  // 📊 Statistiche
  const getStatistiche = () => {
    const oggi = new Date().toISOString().split('T')[0];
    const venditeOggi = vendite.filter(v => v.data.startsWith(oggi));
    const incassoOggi = venditeOggi.reduce((sum, v) => sum + v.totale, 0);
    const incassoTotale = vendite.reduce((sum, v) => sum + v.totale, 0);

    return {
      venditeOggi: venditeOggi.length,
      incassoOggi,
      totalVendite: vendite.length,
      incassoTotale
    };
  };

  const stats = getStatistiche();
  const totali = calcolaTotali();

  return (
    <div style={{ minHeight: '100vh', background: '#F3F4F6', fontFamily: 'Inter, sans-serif' }}>
      <style>{styles}</style>

      {/* 🔐 HEADER CON LOGOUT */}
      <Header title="💰 Cassa Studio" />

      {/* 🎨 MODULE HEADER */}
      <div style={{
        background: 'linear-gradient(135deg, #FCD34D 0%, #FB923C 50%, #F97316 100%)',
        color: 'white',
        padding: '15px 20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Vendite accessori e prodotti</h2>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setView('pos')}
              className="btn-secondary"
              style={{
                background: view === 'pos' ? 'white' : 'rgba(255,255,255,0.2)',
                color: view === 'pos' ? '#F97316' : 'white',
                border: 'none'
              }}
            >
              🛒 Punto Vendita
            </button>
            <button
              onClick={() => setView('storico')}
              className="btn-secondary"
              style={{
                background: view === 'storico' ? 'white' : 'rgba(255,255,255,0.2)',
                color: view === 'storico' ? '#F97316' : 'white',
                border: 'none'
              }}
            >
              📋 Storico
            </button>
            <button
              onClick={() => setView('analytics')}
              className="btn-secondary"
              style={{
                background: view === 'analytics' ? 'white' : 'rgba(255,255,255,0.2)',
                color: view === 'analytics' ? '#F97316' : 'white',
                border: 'none'
              }}
            >
              📊 Statistiche
            </button>
          </div>
        </div>
      </div>

      {/* 📱 CONTENUTO PRINCIPALE */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
        
        {/* ═══════════════════════════════════════════ */}
        {/* 🛒 VISTA POS */}
        {/* ═══════════════════════════════════════════ */}
        {view === 'pos' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '20px' }}>
            
            {/* COLONNA SINISTRA - PRODOTTI */}
            <div>
              {/* Barra ricerca e categorie */}
              <div style={{ background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
                <input
                  type="text"
                  placeholder="🔍 Cerca prodotto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ marginBottom: '15px' }}
                />
                
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setCategoriaSelezionata('tutti')}
                    className={`category-btn ${categoriaSelezionata === 'tutti' ? 'active' : ''}`}
                  >
                    📦 Tutti
                  </button>
                  {categorie.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setCategoriaSelezionata(cat.id)}
                      className={`category-btn ${categoriaSelezionata === cat.id ? 'active' : ''}`}
                    >
                      {cat.icon} {cat.nome}
                    </button>
                  ))}
                </div>
              </div>

              {/* Griglia prodotti */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '15px' }}>
                {prodottiFiltrati().map(prodotto => (
                  <div
                    key={prodotto.id}
                    className="product-card"
                    onClick={() => aggiungiAlCarrello(prodotto)}
                  >
                    <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📦</div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '5px' }}>{prodotto.nome}</div>
                    {prodotto.codice && (
                      <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginBottom: '5px' }}>
                        {prodotto.codice}
                      </div>
                    )}
                    <div style={{ color: '#F97316', fontWeight: 700, fontSize: '1.1rem' }}>
                      {formatPrezzo(prodotto.prezzo)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '5px' }}>
                      Stock: {prodotto.stock || 0}
                    </div>
                  </div>
                ))}
              </div>

              {prodottiFiltrati().length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>
                  Nessun prodotto trovato
                </div>
              )}
            </div>

            {/* COLONNA DESTRA - CARRELLO */}
            <div style={{ position: 'sticky', top: '20px', height: 'fit-content' }}>
              <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <h2 style={{ margin: '0 0 20px 0', fontSize: '1.3rem', fontWeight: 700 }}>🛒 Carrello</h2>

                {/* Cliente opzionale */}
                <div style={{ marginBottom: '20px', padding: '15px', background: '#F9FAFB', borderRadius: '8px' }}>
                  {clienteSelezionato ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>👤 {clienteSelezionato.nome}</div>
                        <div style={{ fontSize: '0.85rem', color: '#6B7280' }}>{clienteSelezionato.email}</div>
                      </div>
                      <button onClick={() => setClienteSelezionato(null)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                        Rimuovi
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setShowClientModal(true)} className="btn-secondary" style={{ width: '100%' }}>
                      + Associa Cliente (opzionale)
                    </button>
                  )}
                </div>

                {/* Items carrello */}
                <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px' }}>
                  {carrello.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>
                      Carrello vuoto
                    </div>
                  ) : (
                    carrello.map(item => (
                      <div key={item.id} className="cart-item">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.nome}</div>
                          <button onClick={() => rimuoviDalCarrello(item.id)} className="btn-danger" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                            ✕
                          </button>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                            <button
                              onClick={() => modificaQuantita(item.id, item.quantita - 1)}
                              style={{ padding: '4px 8px', border: '1px solid #E5E7EB', borderRadius: '4px', background: 'white', cursor: 'pointer' }}
                            >
                              -
                            </button>
                            <span style={{ width: '40px', textAlign: 'center', fontWeight: 600 }}>{item.quantita}</span>
                            <button
                              onClick={() => modificaQuantita(item.id, item.quantita + 1)}
                              style={{ padding: '4px 8px', border: '1px solid #E5E7EB', borderRadius: '4px', background: 'white', cursor: 'pointer' }}
                            >
                              +
                            </button>
                          </div>
                          <div style={{ marginLeft: 'auto', fontWeight: 700, color: '#F97316' }}>
                            {formatPrezzo(item.prezzo * item.quantita)}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Totali */}
                {carrello.length > 0 && (
                  <>
                    <div style={{ borderTop: '2px solid #E5E7EB', paddingTop: '15px', marginBottom: '15px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#6B7280' }}>
                        <span>Subtotale:</span>
                        <span>{formatPrezzo(totali.subtotale)}</span>
                      </div>
                      {totali.scontoTotale > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#DC2626' }}>
                          <span>Sconto:</span>
                          <span>-{formatPrezzo(totali.scontoTotale)}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.3rem', fontWeight: 700, color: '#F97316' }}>
                        <span>TOTALE:</span>
                        <span>{formatPrezzo(totali.totale)}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => setCarrello([])} className="btn-secondary" style={{ flex: 1 }}>
                        Svuota
                      </button>
                      <button onClick={() => setShowPaymentModal(true)} className="btn-primary" style={{ flex: 2 }}>
                        💰 Incassa
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════ */}
        {/* 📋 VISTA STORICO */}
        {/* ═══════════════════════════════════════════ */}
        {view === 'storico' && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '30px' }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '1.5rem', fontWeight: 700 }}>📋 Storico Vendite</h2>

            {vendite.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#9CA3AF' }}>
                Nessuna vendita registrata
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Numero</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Data</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Cliente</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Items</th>
                      <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>Totale</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontWeight: 600 }}>Pagamento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendite.map(vendita => (
                      <tr key={vendita.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                        <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '0.9rem' }}>{vendita.numero}</td>
                        <td style={{ padding: '12px', fontSize: '0.9rem' }}>
                          {new Date(vendita.data).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td style={{ padding: '12px', fontSize: '0.9rem' }}>
                          {vendita.cliente ? vendita.cliente.nome : <em style={{ color: '#9CA3AF' }}>Vendita rapida</em>}
                        </td>
                        <td style={{ padding: '12px', fontSize: '0.9rem' }}>{vendita.items.length} prodotti</td>
                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: 700, color: '#F97316' }}>
                          {formatPrezzo(vendita.totale)}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          {CASSA_CONFIG.paymentMethods.find(m => m.id === vendita.pagamento.metodo)?.icon || '💳'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════ */}
        {/* 📊 VISTA STATISTICHE */}
        {/* ═══════════════════════════════════════════ */}
        {view === 'analytics' && (
          <div>
            {/* Cards statistiche */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              <div style={{ background: 'white', borderRadius: '12px', padding: '25px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <div style={{ color: '#6B7280', fontSize: '0.9rem', marginBottom: '8px' }}>Vendite Oggi</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#F97316' }}>{stats.venditeOggi}</div>
              </div>
              <div style={{ background: 'white', borderRadius: '12px', padding: '25px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <div style={{ color: '#6B7280', fontSize: '0.9rem', marginBottom: '8px' }}>Incasso Oggi</div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10B981' }}>{formatPrezzo(stats.incassoOggi)}</div>
              </div>
              <div style={{ background: 'white', borderRadius: '12px', padding: '25px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <div style={{ color: '#6B7280', fontSize: '0.9rem', marginBottom: '8px' }}>Vendite Totali</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#F97316' }}>{stats.totalVendite}</div>
              </div>
              <div style={{ background: 'white', borderRadius: '12px', padding: '25px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <div style={{ color: '#6B7280', fontSize: '0.9rem', marginBottom: '8px' }}>Incasso Totale</div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10B981' }}>{formatPrezzo(stats.incassoTotale)}</div>
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: '12px', padding: '30px' }}>
              <h3 style={{ margin: '0 0 20px 0', fontWeight: 700 }}>📊 Analisi Dettagliata</h3>
              <p style={{ color: '#6B7280' }}>Funzionalità in sviluppo: grafici vendite, prodotti più venduti, trend mensili.</p>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* 💳 MODALE PAGAMENTO */}
      {/* ═══════════════════════════════════════════ */}
      {showPaymentModal && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '1.5rem', fontWeight: 700 }}>💰 Incassa Vendita</h2>

            <div style={{ marginBottom: '25px', padding: '20px', background: '#F3F4F6', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ color: '#6B7280', marginBottom: '5px' }}>Totale da incassare</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#F97316' }}>
                {formatPrezzo(totali.totale)}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Metodo di pagamento</label>
              <select value={metodoPagamento} onChange={(e) => setMetodoPagamento(e.target.value)}>
                {CASSA_CONFIG.paymentMethods.map(metodo => (
                  <option key={metodo.id} value={metodo.id}>
                    {metodo.icon} {metodo.nome}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowPaymentModal(false)} className="btn-secondary" style={{ flex: 1 }}>
                Annulla
              </button>
              <button onClick={completaVendita} className="btn-primary" style={{ flex: 2 }}>
                ✅ Conferma Pagamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════ */}
      {/* 👤 MODALE SELEZIONE CLIENTE */}
      {/* ═══════════════════════════════════════════ */}
      {showClientModal && (
        <div className="modal-overlay" onClick={() => setShowClientModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '1.5rem', fontWeight: 700 }}>👤 Seleziona Cliente</h2>

            {clienti.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>
                Nessun cliente registrato.
                <br />Vai al modulo Clienti per aggiungerne.
              </div>
            ) : (
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {clienti.map(cliente => (
                  <div
                    key={cliente.id}
                    onClick={() => {
                      setClienteSelezionato(cliente);
                      setShowClientModal(false);
                    }}
                    style={{
                      padding: '15px',
                      marginBottom: '10px',
                      background: '#F9FAFB',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: '2px solid transparent',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.borderColor = '#F97316'}
                    onMouseLeave={(e) => e.target.style.borderColor = 'transparent'}
                  >
                    <div style={{ fontWeight: 600, marginBottom: '5px' }}>{cliente.nome}</div>
                    <div style={{ fontSize: '0.85rem', color: '#6B7280' }}>
                      {cliente.email} • {cliente.telefono}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button onClick={() => setShowClientModal(false)} className="btn-secondary" style={{ width: '100%', marginTop: '20px' }}>
              Chiudi
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cassa;
