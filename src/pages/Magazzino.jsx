import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useToast } from '../components/Toast';
import {
  initInventoryProducts,
  getInventoryProducts,
  registerMovement,
  getMovements,
  getLowStockProducts,
  getInventoryStats,
  updateProduct,
  createProduct
} from '../utils/inventory';
import {
  MAGAZZINO_CONFIG,
  formatPrezzo,
  getStockLevel,
  getMovementType
} from '../config/magazzino.config';

// 🎨 STILI GLOBALI
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  
  * { box-sizing: border-box; margin: 0; padding: 0; }
  
  body { font-family: 'Inter', sans-serif; }

  .product-card {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    transition: all 0.2s;
    border: 2px solid transparent;
    cursor: pointer;
  }

  .product-card:hover {
    border-color: #F97316;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
  }

  .stat-card {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }

  .btn-primary {
    background: linear-gradient(135deg, #FCD34D 0%, #FB923C 50%, #F97316 100%);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    min-height: 44px;
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
    min-height: 44px;
  }

  .btn-secondary:hover {
    border-color: #F97316;
    color: #F97316;
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

  input, select, textarea {
    width: 100%;
    padding: 12px;
    border: 2px solid #E5E7EB;
    border-radius: 8px;
    font-family: inherit;
    font-size: 1rem;
    min-height: 44px;
  }

  input:focus, select:focus, textarea:focus {
    outline: none;
    border-color: #F97316;
  }

  .badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .alert-badge {
    padding: 8px 16px;
    border-radius: 8px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* 📱 MOBILE RESPONSIVE */
  @media (max-width: 768px) {
    .product-card {
      padding: 15px;
    }

    .stat-card {
      padding: 15px;
    }
  }
`;

const Magazzino = () => {
  const navigate = useNavigate();
  const toast = useToast();
  
  const [view, setView] = useState('products'); // products, movements, stats, alerts
  const [products, setProducts] = useState({});
  const [movements, setMovements] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('tutti');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Form movimento
  const [movementForm, setMovementForm] = useState({
    productId: '',
    type: 'entrata',
    quantity: 1,
    reason: '',
    note: ''
  });

  // Form prodotto
  const [productForm, setProductForm] = useState({
    id: '',
    nome: '',
    categoria: 'accessori',
    prezzo: 0,
    stock: 0,
    stockMinimo: 5,
    costoAcquisto: 0,
    descrizione: '',
    icon: '📦'
  });

  // 🔄 Carica dati
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      // Inizializza prodotti se necessario (sincronizza con catalogo)
      initInventoryProducts();
      
      // Carica prodotti (solo quelli dal catalogo)
      const loadedProducts = getInventoryProducts();
      
      // Verifica che sia un oggetto
      if (!loadedProducts || typeof loadedProducts !== 'object') {
        console.warn('Prodotti non validi, inizializzo a oggetto vuoto');
        setProducts({});
      } else {
        setProducts(loadedProducts);
      }
      
      // Carica movimenti
      const loadedMovements = getMovements();
      setMovements(Array.isArray(loadedMovements) ? loadedMovements : []);
      
      // Carica statistiche
      const loadedStats = getInventoryStats();
      setStats(loadedStats);
    } catch (error) {
      console.error('Errore nel caricamento dati Magazzino:', error);
      toast.error('Errore nel caricamento dati. Controlla la console.');
      setProducts({});
      setMovements([]);
      setStats(null);
    }
  };

  // 📦 Filtra prodotti
  const getFilteredProducts = () => {
    let filtered = Object.values(products);
    
    // Filtro categoria
    if (selectedCategory !== 'tutti') {
      filtered = filtered.filter(p => p.categoria === selectedCategory);
    }
    
    // Filtro ricerca
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.descrizione?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  // ➕ Registra movimento
  const handleRegisterMovement = () => {
    if (!movementForm.productId || !movementForm.quantity) {
      toast.error('Compila tutti i campi obbligatori');
      return;
    }

    const result = registerMovement({
      ...movementForm,
      operator: 'Admin' // TODO: da utente loggato
    });

    if (result.success) {
      toast.success(`Movimento registrato! Stock aggiornato: ${result.newStock}`);
      setShowMovementModal(false);
      setMovementForm({
        productId: '',
        type: 'entrata',
        quantity: 1,
        reason: '',
        note: ''
      });
      loadData();
    } else {
      toast.error(result.error || 'Errore nel registrare il movimento');
    }
  };

  // 💾 Salva prodotto
  const handleSaveProduct = () => {
    if (!productForm.nome || !productForm.id) {
      toast.error('Compila tutti i campi obbligatori');
      return;
    }

    let result;
    if (selectedProduct) {
      // Modifica prodotto esistente
      result = updateProduct(selectedProduct.id, productForm);
    } else {
      // Nuovo prodotto
      result = createProduct(productForm);
    }

    if (result.success) {
      toast.success(selectedProduct ? 'Prodotto aggiornato!' : 'Prodotto creato!');
      setShowProductModal(false);
      setSelectedProduct(null);
      setProductForm({
        id: '',
        nome: '',
        categoria: 'accessori',
        prezzo: 0,
        stock: 0,
        stockMinimo: 5,
        costoAcquisto: 0,
        descrizione: '',
        icon: '📦'
      });
      loadData();
    } else {
      toast.error(result.error || 'Errore nel salvare il prodotto');
    }
  };

  const filteredProducts = getFilteredProducts();
  const lowStockProducts = getLowStockProducts();

  return (
    <div style={{ minHeight: '100vh', background: '#F3F4F6', fontFamily: 'Inter, sans-serif' }}>
      <style>{styles}</style>

      {/* 🔐 HEADER */}
      <Header title="📦 Magazzino & Inventario" />

      {/* 🎨 MODULE HEADER */}
      <div style={{
        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
        color: 'white',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Gestione Inventario Completa</h2>
          
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setView('products')}
              className="btn-secondary"
              style={{
                background: view === 'products' ? 'white' : 'rgba(255,255,255,0.2)',
                color: view === 'products' ? '#3b82f6' : 'white',
                border: 'none'
              }}
            >
              📦 Prodotti
            </button>
            <button
              onClick={() => setView('movements')}
              className="btn-secondary"
              style={{
                background: view === 'movements' ? 'white' : 'rgba(255,255,255,0.2)',
                color: view === 'movements' ? '#3b82f6' : 'white',
                border: 'none'
              }}
            >
              📋 Movimenti
            </button>
            <button
              onClick={() => setView('stats')}
              className="btn-secondary"
              style={{
                background: view === 'stats' ? 'white' : 'rgba(255,255,255,0.2)',
                color: view === 'stats' ? '#3b82f6' : 'white',
                border: 'none'
              }}
            >
              📊 Statistiche
            </button>
            <button
              onClick={() => setView('alerts')}
              className="btn-secondary"
              style={{
                background: view === 'alerts' ? 'white' : 'rgba(255,255,255,0.2)',
                color: view === 'alerts' ? '#3b82f6' : 'white',
                border: 'none'
              }}
            >
              🔔 Allarmi {lowStockProducts.length > 0 && `(${lowStockProducts.length})`}
            </button>
          </div>
        </div>
      </div>

      {/* 📱 CONTENUTO PRINCIPALE */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
        
        {/* ═══════════════════════════════════════════ */}
        {/* 📦 VISTA PRODOTTI */}
        {/* ═══════════════════════════════════════════ */}
        {view === 'products' && (
          <>
            {/* Filtri e azioni */}
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '15px', alignItems: 'end', flexWrap: 'wrap' }}>
                <div>
                  <input
                    type="text"
                    placeholder="🔍 Cerca prodotto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {MAGAZZINO_CONFIG.categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className="btn-secondary"
                      style={{
                        background: selectedCategory === cat.id ? '#3b82f6' : 'white',
                        color: selectedCategory === cat.id ? 'white' : '#6B7280',
                        border: `2px solid ${selectedCategory === cat.id ? '#3b82f6' : '#E5E7EB'}`
                      }}
                    >
                      {cat.icon} {cat.nome}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => {
                    setSelectedProduct(null);
                    setProductForm({
                      id: '',
                      nome: '',
                      categoria: 'accessori',
                      prezzo: 0,
                      stock: 0,
                      stockMinimo: 5,
                      costoAcquisto: 0,
                      descrizione: '',
                      icon: '📦'
                    });
                    setShowProductModal(true);
                  }}
                  className="btn-primary"
                >
                  ➕ Nuovo Prodotto
                </button>
              </div>
            </div>

            {/* Statistiche rapide */}
            {stats && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                <div className="stat-card">
                  <div style={{ fontSize: '0.9rem', color: '#6B7280', marginBottom: '8px' }}>Prodotti Totali</div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: '#3b82f6' }}>{stats.totalProducts}</div>
                </div>
                <div className="stat-card">
                  <div style={{ fontSize: '0.9rem', color: '#6B7280', marginBottom: '8px' }}>Stock Totale</div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10B981' }}>{stats.totalStock}</div>
                </div>
                <div className="stat-card">
                  <div style={{ fontSize: '0.9rem', color: '#6B7280', marginBottom: '8px' }}>Valore Inventario</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#F97316' }}>
                    {formatPrezzo(stats.inventoryValue)}
                  </div>
                </div>
                <div className="stat-card">
                  <div style={{ fontSize: '0.9rem', color: '#6B7280', marginBottom: '8px' }}>Stock Basso</div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: '#F59E0B' }}>{stats.lowStockCount}</div>
                </div>
              </div>
            )}

            {/* Lista prodotti */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {filteredProducts.map(product => {
                const stockLevel = getStockLevel(product.stock, product.stockMinimo);
                
                return (
                  <div
                    key={product.id}
                    className="product-card"
                    onClick={() => {
                      setSelectedProduct(product);
                      setProductForm({
                        id: product.id,
                        nome: product.nome,
                        categoria: product.categoria,
                        prezzo: product.prezzo,
                        stock: product.stock,
                        stockMinimo: product.stockMinimo || 5,
                        costoAcquisto: product.costoAcquisto || 0,
                        descrizione: product.descrizione || '',
                        icon: product.icon || '📦'
                      });
                      setShowProductModal(true);
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                      <div style={{ fontSize: '2.5rem' }}>{product.icon}</div>
                      <span className="badge" style={{
                        background: stockLevel.color + '20',
                        color: stockLevel.color
                      }}>
                        {stockLevel.icon} {stockLevel.name}
                      </span>
                    </div>
                    
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px', color: '#1F2937' }}>
                      {product.nome}
                    </h3>
                    
                    <p style={{ fontSize: '0.9rem', color: '#6B7280', marginBottom: '15px' }}>
                      {product.descrizione}
                    </p>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginBottom: '4px' }}>Stock</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: stockLevel.color }}>
                          {product.stock}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginBottom: '4px' }}>Prezzo</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#F97316' }}>
                          {formatPrezzo(product.prezzo)}
                        </div>
                      </div>
                    </div>
                    
                    {product.stockMinimo && (
                      <div style={{ fontSize: '0.85rem', color: '#6B7280' }}>
                        Min: {product.stockMinimo} | Max: {product.stockMassimo || '∞'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {filteredProducts.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px', color: '#9CA3AF' }}>
                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📦</div>
                <p>Nessun prodotto trovato</p>
              </div>
            )}
          </>
        )}

        {/* ═══════════════════════════════════════════ */}
        {/* 📋 VISTA MOVIMENTI */}
        {/* ═══════════════════════════════════════════ */}
        {view === 'movements' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Movimenti Inventario</h3>
              <button
                onClick={() => {
                  setMovementForm({
                    productId: '',
                    type: 'entrata',
                    quantity: 1,
                    reason: '',
                    note: ''
                  });
                  setShowMovementModal(true);
                }}
                className="btn-primary"
              >
                ➕ Nuovo Movimento
              </button>
            </div>

            <div style={{ background: 'white', borderRadius: '12px', padding: '20px' }}>
              {movements.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#9CA3AF' }}>
                  Nessun movimento registrato
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Data</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Prodotto</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Tipo</th>
                        <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>Quantità</th>
                        <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>Stock Prima</th>
                        <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>Stock Dopo</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Operatore</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movements.slice(0, 50).map(movement => {
                        const movementType = getMovementType(movement.type);
                        return (
                          <tr key={movement.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                            <td style={{ padding: '12px', fontSize: '0.9rem' }}>
                              {new Date(movement.timestamp).toLocaleString('it-IT', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td style={{ padding: '12px', fontSize: '0.9rem', fontWeight: 600 }}>
                              {movement.productName}
                            </td>
                            <td style={{ padding: '12px' }}>
                              <span className="badge" style={{
                                background: movementType.color + '20',
                                color: movementType.color
                              }}>
                                {movementType.icon} {movementType.name}
                              </span>
                            </td>
                            <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>
                              {movement.type === 'uscita' || movement.type === 'scarto' ? '-' : '+'}
                              {movement.quantity}
                            </td>
                            <td style={{ padding: '12px', textAlign: 'right', color: '#6B7280' }}>
                              {movement.stockBefore}
                            </td>
                            <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>
                              {movement.stockAfter}
                            </td>
                            <td style={{ padding: '12px', fontSize: '0.9rem', color: '#6B7280' }}>
                              {movement.operator}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════ */}
        {/* 📊 VISTA STATISTICHE */}
        {/* ═══════════════════════════════════════════ */}
        {view === 'stats' && stats && (
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '20px' }}>Statistiche Inventario</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              <div className="stat-card">
                <div style={{ fontSize: '0.9rem', color: '#6B7280', marginBottom: '8px' }}>Valore Inventario (Costo)</div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#3b82f6' }}>
                  {formatPrezzo(stats.inventoryValue)}
                </div>
              </div>
              <div className="stat-card">
                <div style={{ fontSize: '0.9rem', color: '#6B7280', marginBottom: '8px' }}>Valore Inventario (Vendita)</div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10B981' }}>
                  {formatPrezzo(stats.inventorySaleValue)}
                </div>
              </div>
              <div className="stat-card">
                <div style={{ fontSize: '0.9rem', color: '#6B7280', marginBottom: '8px' }}>Prodotti Esauriti</div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#DC2626' }}>
                  {stats.outOfStockCount}
                </div>
              </div>
              <div className="stat-card">
                <div style={{ fontSize: '0.9rem', color: '#6B7280', marginBottom: '8px' }}>Movimenti (30gg)</div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#F97316' }}>
                  {stats.recentMovements}
                </div>
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: '12px', padding: '30px' }}>
              <h4 style={{ marginBottom: '20px', fontWeight: 700 }}>Movimenti per Tipo (Ultimi 30 giorni)</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                {Object.entries(stats.movementsByType).map(([type, count]) => {
                  const movementType = getMovementType(type);
                  return (
                    <div key={type} style={{ padding: '15px', background: '#F9FAFB', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '1.5rem' }}>{movementType.icon}</span>
                        <span style={{ fontWeight: 600 }}>{movementType.name}</span>
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: movementType.color }}>
                        {count}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════ */}
        {/* 🔔 VISTA ALLARMI */}
        {/* ═══════════════════════════════════════════ */}
        {view === 'alerts' && (
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '20px' }}>
              Allarmi Stock Basso
            </h3>

            {lowStockProducts.length === 0 ? (
              <div style={{ background: 'white', borderRadius: '12px', padding: '60px', textAlign: 'center', color: '#10B981' }}>
                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>✅</div>
                <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>Tutti i prodotti hanno stock sufficiente!</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {lowStockProducts.map(product => {
                  const stockLevel = getStockLevel(product.stock, product.stockMinimo);
                  const isCritical = product.stock === 0;
                  
                  return (
                    <div
                      key={product.id}
                      className="product-card"
                      style={{
                        borderColor: isCritical ? '#DC2626' : '#F59E0B',
                        borderWidth: '3px'
                      }}
                    >
                      <div className="alert-badge" style={{
                        background: isCritical ? '#FEE2E2' : '#FEF3C7',
                        color: isCritical ? '#DC2626' : '#F59E0B',
                        marginBottom: '15px'
                      }}>
                        {isCritical ? '🔴' : '🟡'} {isCritical ? 'ESAURITO' : 'STOCK BASSO'}
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                        <div style={{ fontSize: '2.5rem' }}>{product.icon}</div>
                        <div>
                          <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '4px' }}>
                            {product.nome}
                          </h4>
                          <p style={{ fontSize: '0.9rem', color: '#6B7280' }}>
                            {product.descrizione}
                          </p>
                        </div>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginBottom: '4px' }}>Stock Attuale</div>
                          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: stockLevel.color }}>
                            {product.stock}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginBottom: '4px' }}>Stock Minimo</div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#6B7280' }}>
                            {product.stockMinimo}
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => {
                          setMovementForm({
                            productId: product.id,
                            type: 'entrata',
                            quantity: product.stockMinimo - product.stock + 5,
                            reason: 'Riordino stock basso',
                            note: 'Riordino automatico da allarme'
                          });
                          setShowMovementModal(true);
                        }}
                        className="btn-primary"
                        style={{ width: '100%', marginTop: '15px' }}
                      >
                        📥 Riordina
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* 📝 MODALE MOVIMENTO */}
      {/* ═══════════════════════════════════════════ */}
      {showMovementModal && (
        <div className="modal-overlay" onClick={() => setShowMovementModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '1.5rem', fontWeight: 700 }}>
              ➕ Nuovo Movimento
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Prodotto *</label>
                <select
                  value={movementForm.productId}
                  onChange={(e) => setMovementForm({ ...movementForm, productId: e.target.value })}
                >
                  <option value="">Seleziona prodotto...</option>
                  {Object.values(products).map(prod => (
                    <option key={prod.id} value={prod.id}>
                      {prod.icon} {prod.nome} (Stock: {prod.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Tipo Movimento *</label>
                <select
                  value={movementForm.type}
                  onChange={(e) => setMovementForm({ ...movementForm, type: e.target.value })}
                >
                  {Object.values(MAGAZZINO_CONFIG.movementTypes).map(type => (
                    <option key={type.id} value={type.id}>
                      {type.icon} {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Quantità *</label>
                <input
                  type="number"
                  min="1"
                  value={movementForm.quantity}
                  onChange={(e) => setMovementForm({ ...movementForm, quantity: parseInt(e.target.value) || 1 })}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Motivo</label>
                <input
                  type="text"
                  value={movementForm.reason}
                  onChange={(e) => setMovementForm({ ...movementForm, reason: e.target.value })}
                  placeholder="Es: Acquisto, Vendita, Rettifica..."
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Note</label>
                <textarea
                  rows="3"
                  value={movementForm.note}
                  onChange={(e) => setMovementForm({ ...movementForm, note: e.target.value })}
                  placeholder="Note aggiuntive..."
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button onClick={() => setShowMovementModal(false)} className="btn-secondary" style={{ flex: 1 }}>
                  Annulla
                </button>
                <button onClick={handleRegisterMovement} className="btn-primary" style={{ flex: 2 }}>
                  ✅ Registra Movimento
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════ */}
      {/* 📝 MODALE PRODOTTO */}
      {/* ═══════════════════════════════════════════ */}
      {showProductModal && (
        <div className="modal-overlay" onClick={() => setShowProductModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '1.5rem', fontWeight: 700 }}>
              {selectedProduct ? '✏️ Modifica Prodotto' : '➕ Nuovo Prodotto'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>ID Prodotto *</label>
                <input
                  type="text"
                  value={productForm.id}
                  onChange={(e) => setProductForm({ ...productForm, id: e.target.value })}
                  disabled={!!selectedProduct}
                  placeholder="es: prodotto-001"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Nome *</label>
                <input
                  type="text"
                  value={productForm.nome}
                  onChange={(e) => setProductForm({ ...productForm, nome: e.target.value })}
                  placeholder="Nome prodotto"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Categoria</label>
                  <select
                    value={productForm.categoria}
                    onChange={(e) => setProductForm({ ...productForm, categoria: e.target.value })}
                  >
                    {MAGAZZINO_CONFIG.categories.filter(c => c.id !== 'tutti').map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Icona</label>
                  <input
                    type="text"
                    value={productForm.icon}
                    onChange={(e) => setProductForm({ ...productForm, icon: e.target.value })}
                    placeholder="📦"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Prezzo</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={productForm.prezzo}
                    onChange={(e) => setProductForm({ ...productForm, prezzo: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Stock Minimo</label>
                  <input
                    type="number"
                    min="0"
                    value={productForm.stockMinimo}
                    onChange={(e) => setProductForm({ ...productForm, stockMinimo: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Costo Acquisto</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={productForm.costoAcquisto}
                  onChange={(e) => setProductForm({ ...productForm, costoAcquisto: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Descrizione</label>
                <textarea
                  rows="3"
                  value={productForm.descrizione}
                  onChange={(e) => setProductForm({ ...productForm, descrizione: e.target.value })}
                  placeholder="Descrizione prodotto..."
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button onClick={() => setShowProductModal(false)} className="btn-secondary" style={{ flex: 1 }}>
                  Annulla
                </button>
                <button onClick={handleSaveProduct} className="btn-primary" style={{ flex: 2 }}>
                  ✅ {selectedProduct ? 'Aggiorna' : 'Crea'} Prodotto
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Magazzino;

