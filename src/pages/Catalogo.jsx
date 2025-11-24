import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useToast } from '../components/Toast';
import { STUDIO_CONFIG } from '../config/studio.config';
import {
  getProducts,
  getServices,
  createProduct,
  updateProduct,
  deleteProduct,
  createService,
  updateService,
  deleteService,
  getProductCategories,
  getServiceCategories
} from '../utils/catalogo';

const CONFIG = STUDIO_CONFIG;

// 🎨 STILI GLOBALI
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  
  * { box-sizing: border-box; margin: 0; padding: 0; }
  
  body { font-family: 'Inter', sans-serif; }

  .card {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    transition: all 0.2s;
  }

  .card:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    transform: translateY(-2px);
  }

  input, select, textarea {
    width: 100%;
    padding: 12px;
    border: 2px solid #E5E7EB;
    border-radius: 8px;
    font-size: 1rem;
    font-family: 'Inter', sans-serif;
    transition: all 0.2s;
  }

  input:focus, select:focus, textarea:focus {
    outline: none;
    border-color: ${CONFIG.brand.colors.secondary};
    box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
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
    min-height: 44px;
  }

  .btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
  }

  .btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-secondary {
    background: white;
    color: #1F2937;
    border: 2px solid #E5E7EB;
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    min-height: 44px;
  }

  .btn-secondary:hover {
    border-color: ${CONFIG.brand.colors.secondary};
    background: #F9FAFB;
  }

  .btn-danger {
    background: #DC2626;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    min-height: 44px;
  }

  .btn-danger:hover {
    background: #B91C1C;
    transform: translateY(-2px);
  }

  /* 📱 MOBILE RESPONSIVE */
  @media (max-width: 768px) {
    input, select, textarea {
      font-size: 16px; /* Previene zoom su iOS */
    }
  }
`;

const Catalogo = () => {
  const { toast } = useToast();
  const [view, setView] = useState('products'); // 'products' | 'services'
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [productCategories, setProductCategories] = useState([]);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Modal stati
  const [showProductModal, setShowProductModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingService, setEditingService] = useState(null);
  
  // Form stati
  const [productForm, setProductForm] = useState({
    nome: '',
    codice: '',
    categoria: 'altro',
    prezzo: '',
    attivo: true
  });
  
  const [serviceForm, setServiceForm] = useState({
    nome: '',
    codice: '',
    categoria: 'altro',
    pricePerHour: 0,
    icon: '🎵',
    color: '#8B5CF6',
    description: '',
    available: true
  });

  // Carica dati
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setProducts(getProducts());
    setServices(getServices());
    setProductCategories(getProductCategories());
    setServiceCategories(getServiceCategories());
  };

  // Filtri
  const filteredProducts = products.filter(p => {
    const matchesSearch = !searchTerm || 
      p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.codice && p.codice.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || p.categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredServices = services.filter(s => {
    const matchesSearch = !searchTerm || 
      s.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.codice && s.codice.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || s.categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Gestione Prodotti
  const handleOpenProductModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        nome: product.nome || '',
        codice: product.codice || '',
        categoria: product.categoria || 'altro',
        prezzo: product.prezzo || '',
        attivo: product.attivo !== false
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        nome: '',
        codice: '',
        categoria: 'altro',
        prezzo: '',
        attivo: true
      });
    }
    setShowProductModal(true);
  };

  const handleSaveProduct = () => {
    if (!productForm.nome.trim()) {
      toast.error('Il nome del prodotto è obbligatorio');
      return;
    }

    // Prepara i dati del prodotto
    const productData = {
      nome: productForm.nome.trim(),
      codice: productForm.codice.trim() || '',
      categoria: productForm.categoria,
      attivo: productForm.attivo
    };

    // Aggiungi prezzo se fornito (convertito a numero)
    if (productForm.prezzo && !isNaN(parseFloat(productForm.prezzo))) {
      productData.prezzo = parseFloat(productForm.prezzo);
    }

    let result;
    if (editingProduct) {
      result = updateProduct(editingProduct.id, productData);
    } else {
      result = createProduct(productData);
    }

    if (result && result.success) {
      toast.success(editingProduct ? 'Prodotto aggiornato!' : 'Prodotto creato!');
      loadData();
      setShowProductModal(false);
    } else {
      toast.error(result?.error || 'Errore nel salvataggio');
      console.error('Errore salvataggio prodotto:', result);
    }
  };

  const handleDeleteProduct = (id) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo prodotto?')) {
      return;
    }

    const result = deleteProduct(id);
    if (result.success) {
      toast.success('Prodotto eliminato!');
      loadData();
    } else {
      toast.error(result.error || 'Errore nell\'eliminazione');
    }
  };

  // Gestione Servizi
  const handleOpenServiceModal = (service = null) => {
    if (service) {
      setEditingService(service);
      setServiceForm({
        nome: service.nome || '',
        codice: service.codice || '',
        categoria: service.categoria || 'altro',
        pricePerHour: service.pricePerHour || 0,
        icon: service.icon || '🎵',
        color: service.color || '#8B5CF6',
        description: service.description || '',
        available: service.available !== false
      });
    } else {
      setEditingService(null);
      setServiceForm({
        nome: '',
        codice: '',
        categoria: 'altro',
        pricePerHour: 0,
        icon: '🎵',
        color: '#8B5CF6',
        description: '',
        available: true
      });
    }
    setShowServiceModal(true);
  };

  const handleSaveService = () => {
    if (!serviceForm.nome.trim()) {
      toast.error('Il nome del servizio è obbligatorio');
      return;
    }

    if (!serviceForm.pricePerHour || serviceForm.pricePerHour <= 0) {
      toast.error('Il prezzo per ora deve essere maggiore di 0');
      return;
    }

    let result;
    if (editingService) {
      result = updateService(editingService.id, serviceForm);
    } else {
      result = createService(serviceForm);
    }

    if (result.success) {
      toast.success(editingService ? 'Servizio aggiornato!' : 'Servizio creato!');
      loadData();
      setShowServiceModal(false);
    } else {
      toast.error(result.error || 'Errore nel salvataggio');
    }
  };

  const handleDeleteService = (id) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo servizio?')) {
      return;
    }

    const result = deleteService(id);
    if (result.success) {
      toast.success('Servizio eliminato!');
      loadData();
    } else {
      toast.error(result.error || 'Errore nell\'eliminazione');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F3F4F6', fontFamily: 'Inter, sans-serif' }}>
      <style>{styles}</style>

      {/* 🔐 HEADER */}
      <Header title="📋 Catalogo Prodotti & Servizi" />

      {/* 🎨 MODULE HEADER */}
      <div style={{
        background: CONFIG.brand.gradient,
        color: 'white',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h2 style={{ margin: '0 0 5px 0', fontSize: '1.5rem', fontWeight: 700 }}>
              Gestione Catalogo
            </h2>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>
              Crea e gestisci prodotti (per Magazzino/Cassa) e servizi (per Transaction Manager)
            </p>
          </div>
          
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                setView('products');
                setSelectedCategory('all');
                setSearchTerm('');
              }}
              style={{
                background: view === 'products' ? 'white' : 'rgba(255,255,255,0.2)',
                color: view === 'products' ? CONFIG.brand.colors.primary : 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              📦 Prodotti ({products.length})
            </button>
            <button
              onClick={() => {
                setView('services');
                setSelectedCategory('all');
                setSearchTerm('');
              }}
              style={{
                background: view === 'services' ? 'white' : 'rgba(255,255,255,0.2)',
                color: view === 'services' ? CONFIG.brand.colors.primary : 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              🎵 Servizi ({services.length})
            </button>
          </div>
        </div>
      </div>

      {/* 📱 CONTENUTO PRINCIPALE */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
        
        {/* Filtri e azioni */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '15px', alignItems: 'end', flexWrap: 'wrap' }}>
            <div>
              <input
                type="text"
                placeholder={`🔍 Cerca ${view === 'products' ? 'prodotto' : 'servizio'}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              className="btn-primary"
              onClick={() => view === 'products' ? handleOpenProductModal() : handleOpenServiceModal()}
            >
              ➕ Nuovo {view === 'products' ? 'Prodotto' : 'Servizio'}
            </button>
          </div>
          
          {/* Filtri categoria */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '15px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setSelectedCategory('all')}
              style={{
                background: selectedCategory === 'all' ? CONFIG.brand.colors.secondary : 'white',
                color: selectedCategory === 'all' ? 'white' : '#6B7280',
                border: `2px solid ${selectedCategory === 'all' ? CONFIG.brand.colors.secondary : '#E5E7EB'}`,
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Tutti
            </button>
            {(view === 'products' ? productCategories : serviceCategories).map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  background: selectedCategory === cat.id ? CONFIG.brand.colors.secondary : 'white',
                  color: selectedCategory === cat.id ? 'white' : '#6B7280',
                  border: `2px solid ${selectedCategory === cat.id ? CONFIG.brand.colors.secondary : '#E5E7EB'}`,
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {cat.icon} {cat.nome}
              </button>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════ */}
        {/* 📦 LISTA PRODOTTI */}
        {/* ═══════════════════════════════════════════ */}
        {view === 'products' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {filteredProducts.length === 0 ? (
              <div className="card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📦</div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '10px', color: '#1F2937' }}>
                  Nessun prodotto trovato
                </h3>
                <p style={{ color: '#6B7280', marginBottom: '20px' }}>
                  {searchTerm || selectedCategory !== 'all' 
                    ? 'Prova a modificare i filtri di ricerca'
                    : 'Crea il tuo primo prodotto per iniziare'}
                </p>
                {!searchTerm && selectedCategory === 'all' && (
                  <button className="btn-primary" onClick={() => handleOpenProductModal()}>
                    ➕ Crea Prodotto
                  </button>
                )}
              </div>
            ) : (
              filteredProducts.map(product => {
                const category = productCategories.find(c => c.id === product.categoria);
                return (
                  <div key={product.id} className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '5px', color: '#1F2937' }}>
                          {product.nome}
                        </h3>
                        {product.codice && (
                          <p style={{ fontSize: '0.9rem', color: '#6B7280', marginBottom: '5px' }}>
                            Codice: <strong>{product.codice}</strong>
                          </p>
                        )}
                        {product.prezzo && (
                          <p style={{ fontSize: '1.1rem', fontWeight: 700, color: CONFIG.brand.colors.secondary, marginBottom: '10px' }}>
                            €{parseFloat(product.prezzo).toFixed(2)}
                          </p>
                        )}
                        <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '20px', background: category?.color + '20', color: category?.color, fontSize: '0.85rem', fontWeight: 600 }}>
                          {category?.icon} {category?.nome}
                        </div>
                      </div>
                      <div style={{ 
                        width: '12px', 
                        height: '12px', 
                        borderRadius: '50%', 
                        background: product.attivo !== false ? '#10B981' : '#DC2626',
                        flexShrink: 0
                      }} title={product.attivo !== false ? 'Attivo' : 'Inattivo'} />
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #E5E7EB' }}>
                      <button
                        className="btn-secondary"
                        onClick={() => handleOpenProductModal(product)}
                        style={{ flex: 1 }}
                      >
                        ✏️ Modifica
                      </button>
                      <button
                        className="btn-danger"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════ */}
        {/* 🎵 LISTA SERVIZI */}
        {/* ═══════════════════════════════════════════ */}
        {view === 'services' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {filteredServices.length === 0 ? (
              <div className="card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🎵</div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '10px', color: '#1F2937' }}>
                  Nessun servizio trovato
                </h3>
                <p style={{ color: '#6B7280', marginBottom: '20px' }}>
                  {searchTerm || selectedCategory !== 'all' 
                    ? 'Prova a modificare i filtri di ricerca'
                    : 'Crea il tuo primo servizio per iniziare'}
                </p>
                {!searchTerm && selectedCategory === 'all' && (
                  <button className="btn-primary" onClick={() => handleOpenServiceModal()}>
                    ➕ Crea Servizio
                  </button>
                )}
              </div>
            ) : (
              filteredServices.map(service => {
                const category = serviceCategories.find(c => c.id === service.categoria);
                return (
                  <div key={service.id} className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                          <span style={{ fontSize: '1.5rem' }}>{service.icon}</span>
                          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1F2937' }}>
                            {service.nome}
                          </h3>
                        </div>
                        {service.codice && (
                          <p style={{ fontSize: '0.9rem', color: '#6B7280', marginBottom: '10px' }}>
                            Codice: <strong>{service.codice}</strong>
                          </p>
                        )}
                        <div style={{ fontSize: '1.3rem', fontWeight: 700, color: CONFIG.brand.colors.secondary, marginBottom: '10px' }}>
                          €{service.pricePerHour.toFixed(2)}/ora
                        </div>
                        {service.description && (
                          <p style={{ fontSize: '0.9rem', color: '#6B7280', marginBottom: '10px' }}>
                            {service.description}
                          </p>
                        )}
                        <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '20px', background: category?.color + '20', color: category?.color, fontSize: '0.85rem', fontWeight: 600 }}>
                          {category?.icon} {category?.nome}
                        </div>
                      </div>
                      <div style={{ 
                        width: '12px', 
                        height: '12px', 
                        borderRadius: '50%', 
                        background: service.available !== false ? '#10B981' : '#DC2626',
                        flexShrink: 0
                      }} title={service.available !== false ? 'Disponibile' : 'Non disponibile'} />
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #E5E7EB' }}>
                      <button
                        className="btn-secondary"
                        onClick={() => handleOpenServiceModal(service)}
                        style={{ flex: 1 }}
                      >
                        ✏️ Modifica
                      </button>
                      <button
                        className="btn-danger"
                        onClick={() => handleDeleteService(service.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* 📝 MODAL PRODOTTO */}
      {/* ═══════════════════════════════════════════ */}
      {showProductModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }} onClick={() => setShowProductModal(false)}>
          <div className="card" style={{
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '20px', color: '#1F2937' }}>
              {editingProduct ? 'Modifica Prodotto' : 'Nuovo Prodotto'}
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, color: '#1F2937' }}>
                  Nome Prodotto *
                </label>
                <input
                  type="text"
                  value={productForm.nome}
                  onChange={(e) => setProductForm({...productForm, nome: e.target.value})}
                  placeholder="Es: Cavo XLR 3m"
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, color: '#1F2937' }}>
                  Codice Prodotto
                </label>
                <input
                  type="text"
                  value={productForm.codice}
                  onChange={(e) => setProductForm({...productForm, codice: e.target.value})}
                  placeholder="Es: CBL-XLR-3M"
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, color: '#1F2937' }}>
                  Prezzo (€) - Opzionale
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={productForm.prezzo}
                  onChange={(e) => setProductForm({...productForm, prezzo: e.target.value})}
                  placeholder="0.00"
                />
                <p style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '5px' }}>
                  Il prezzo può essere impostato anche in Magazzino
                </p>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, color: '#1F2937' }}>
                  Categoria
                </label>
                <select
                  value={productForm.categoria}
                  onChange={(e) => setProductForm({...productForm, categoria: e.target.value})}
                >
                  {productCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.nome}</option>
                  ))}
                </select>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  id="productAttivo"
                  checked={productForm.attivo}
                  onChange={(e) => setProductForm({...productForm, attivo: e.target.checked})}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
                <label htmlFor="productAttivo" style={{ fontWeight: 600, color: '#1F2937', cursor: 'pointer' }}>
                  Prodotto attivo
                </label>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  className="btn-primary"
                  onClick={handleSaveProduct}
                  style={{ flex: 1 }}
                >
                  💾 Salva
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => setShowProductModal(false)}
                >
                  Annulla
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════ */}
      {/* 📝 MODAL SERVIZIO */}
      {/* ═══════════════════════════════════════════ */}
      {showServiceModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }} onClick={() => setShowServiceModal(false)}>
          <div className="card" style={{
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '20px', color: '#1F2937' }}>
              {editingService ? 'Modifica Servizio' : 'Nuovo Servizio'}
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, color: '#1F2937' }}>
                  Nome Servizio *
                </label>
                <input
                  type="text"
                  value={serviceForm.nome}
                  onChange={(e) => setServiceForm({...serviceForm, nome: e.target.value})}
                  placeholder="Es: Registrazione Voce"
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, color: '#1F2937' }}>
                  Codice Servizio
                </label>
                <input
                  type="text"
                  value={serviceForm.codice}
                  onChange={(e) => setServiceForm({...serviceForm, codice: e.target.value})}
                  placeholder="Es: REC-VOCE"
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, color: '#1F2937' }}>
                  Prezzo per Ora (€) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={serviceForm.pricePerHour}
                  onChange={(e) => setServiceForm({...serviceForm, pricePerHour: parseFloat(e.target.value) || 0})}
                  placeholder="50.00"
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, color: '#1F2937' }}>
                  Categoria
                </label>
                <select
                  value={serviceForm.categoria}
                  onChange={(e) => setServiceForm({...serviceForm, categoria: e.target.value})}
                >
                  {serviceCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.nome}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, color: '#1F2937' }}>
                  Icona (Emoji)
                </label>
                <input
                  type="text"
                  value={serviceForm.icon}
                  onChange={(e) => setServiceForm({...serviceForm, icon: e.target.value})}
                  placeholder="🎤"
                  maxLength="2"
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, color: '#1F2937' }}>
                  Colore
                </label>
                <input
                  type="color"
                  value={serviceForm.color}
                  onChange={(e) => setServiceForm({...serviceForm, color: e.target.value})}
                  style={{ width: '100%', height: '50px', cursor: 'pointer' }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, color: '#1F2937' }}>
                  Descrizione
                </label>
                <textarea
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({...serviceForm, description: e.target.value})}
                  placeholder="Descrizione del servizio..."
                  rows="3"
                />
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  id="serviceAvailable"
                  checked={serviceForm.available}
                  onChange={(e) => setServiceForm({...serviceForm, available: e.target.checked})}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
                <label htmlFor="serviceAvailable" style={{ fontWeight: 600, color: '#1F2937', cursor: 'pointer' }}>
                  Servizio disponibile
                </label>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  className="btn-primary"
                  onClick={handleSaveService}
                  style={{ flex: 1 }}
                >
                  💾 Salva
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => setShowServiceModal(false)}
                >
                  Annulla
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Catalogo;

