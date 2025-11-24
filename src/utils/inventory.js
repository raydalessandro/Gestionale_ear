// 📦 INVENTORY UTILITY - Gestione Movimenti Magazzino
// Modulo indipendente che comunica con database centrale (localStorage)
// LEGGE PRODOTTI DAL CATALOGO invece che da config hardcoded

import { getItem, setItem } from './storage.js';
import { MAGAZZINO_CONFIG, generateMovementId, getMovementType, isLowStock, getStockLevel, formatPrezzo } from '../config/magazzino.config.js';
import { getProducts as getCatalogoProducts } from './catalogo.js';
import { logError, ERROR_LEVELS } from './errorHandler.js';

/**
 * Inizializza prodotti magazzino dal CATALOGO (se non esistono ancora)
 * Sincronizza con i prodotti del catalogo e crea le entry magazzino
 */
export const initInventoryProducts = () => {
  const existing = getItem(MAGAZZINO_CONFIG.storageKeys.products, {});
  
  // Ottieni prodotti dal catalogo
  const catalogoProducts = getCatalogoProducts().filter(p => p.attivo !== false);
  
  // Se non ci sono prodotti in magazzino, inizializza da Catalogo
  if (Object.keys(existing).length === 0 && catalogoProducts.length > 0) {
    const products = {};
    catalogoProducts.forEach(prod => {
      products[prod.id] = {
        // Info base dal catalogo
        id: prod.id,
        nome: prod.nome,
        codice: prod.codice || '',
        categoria: prod.categoria,
        
        // Info magazzino (valori default)
        stock: 0,
        stockMinimo: MAGAZZINO_CONFIG.settings.defaultLowStockThreshold,
        stockMassimo: 100,
        prezzo: 0, // Prezzo di vendita (da impostare nel magazzino)
        costoAcquisto: 0, // Costo di acquisto (da impostare nel magazzino)
        fornitore: '',
        ubicazione: 'Magazzino Principale',
        note: '',
        
        // Metadati
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    });
    
    const result = setItem(MAGAZZINO_CONFIG.storageKeys.products, products);
    if (!result.success) {
      logError(
        new Error('Failed to initialize inventory products'),
        { products },
        ERROR_LEVELS.ERROR
      );
    }
    
    return products;
  }
  
  // Sincronizza: aggiungi nuovi prodotti dal catalogo e rimuovi quelli non più nel catalogo
  if (catalogoProducts.length > 0) {
    let needsSync = false;
    const updatedProducts = {};
    
    // Pulisci: mantieni solo prodotti che esistono nel catalogo
    const catalogoIds = new Set(catalogoProducts.map(p => p.id));
    
    catalogoProducts.forEach(catalogoProd => {
      const existingProduct = existing[catalogoProd.id];
      
      if (existingProduct) {
        // Prodotto esiste: mantieni i dati magazzino ma aggiorna info base dal catalogo
        updatedProducts[catalogoProd.id] = {
          ...existingProduct,
          nome: catalogoProd.nome,
          codice: catalogoProd.codice || '',
          categoria: catalogoProd.categoria,
          updatedAt: new Date().toISOString()
        };
        // Mantieni anche il prezzo se era stato impostato dal catalogo
        if (catalogoProd.prezzo && catalogoProd.prezzo > 0) {
          updatedProducts[catalogoProd.id].prezzo = catalogoProd.prezzo;
        }
      } else {
        // Nuovo prodotto: crea entry con valori default
        updatedProducts[catalogoProd.id] = {
          id: catalogoProd.id,
          nome: catalogoProd.nome,
          codice: catalogoProd.codice || '',
          categoria: catalogoProd.categoria,
          stock: 0,
          stockMinimo: MAGAZZINO_CONFIG.settings.defaultLowStockThreshold,
          stockMassimo: 100,
          prezzo: catalogoProd.prezzo || 0, // Usa prezzo dal catalogo se disponibile
          costoAcquisto: 0,
          fornitore: '',
          ubicazione: 'Magazzino Principale',
          note: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        needsSync = true;
      }
      
      // Controlla se qualcosa è cambiato
      if (existingProduct && (
        existingProduct.nome !== catalogoProd.nome ||
        existingProduct.codice !== (catalogoProd.codice || '') ||
        existingProduct.categoria !== catalogoProd.categoria
      )) {
        needsSync = true;
      }
    });
    
    // Rimuovi prodotti che non sono più nel catalogo
    // (non vengono aggiunti a updatedProducts, quindi vengono rimossi)
    
    // Controlla se ci sono state rimozioni o modifiche
    const hadRemovals = Object.keys(existing).length !== Object.keys(updatedProducts).length;
    
    if (needsSync || hadRemovals) {
      const result = setItem(MAGAZZINO_CONFIG.storageKeys.products, updatedProducts);
      if (result.success) {
        return updatedProducts;
      } else {
        logError(
          new Error('Failed to sync inventory products'),
          { updatedProducts },
          ERROR_LEVELS.ERROR
        );
        return existing; // Fallback su existing in caso di errore
      }
    }
    
    return updatedProducts;
  }
  
  // Se non ci sono prodotti nel catalogo, svuota magazzino
  if (catalogoProducts.length === 0 && Object.keys(existing).length > 0) {
    setItem(MAGAZZINO_CONFIG.storageKeys.products, {});
    return {};
  }
  
  return existing;
};

/**
 * Ottieni tutti i prodotti inventario
 * Sincronizza sempre con il catalogo per avere i prodotti aggiornati
 */
export const getInventoryProducts = () => {
  // Sincronizza sempre con il catalogo
  initInventoryProducts();
  
  const products = getItem(MAGAZZINO_CONFIG.storageKeys.products, {});
  return products;
};

/**
 * Ottieni prodotto per ID
 */
export const getProductById = (productId) => {
  const products = getInventoryProducts();
  return products[productId] || null;
};

/**
 * Aggiorna prodotto esistente
 */
export const updateProduct = (productId, updates) => {
  const products = getInventoryProducts();
  
  if (!products[productId]) {
    return {
      success: false,
      error: 'Prodotto non trovato'
    };
  }
  
  products[productId] = {
    ...products[productId],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  const result = setItem(MAGAZZINO_CONFIG.storageKeys.products, products);
  
  if (!result.success) {
    logError(
      new Error('Failed to update product'),
      { productId, updates },
      ERROR_LEVELS.ERROR
    );
  }
  
  return result;
};

/**
 * Crea nuovo prodotto inventario
 */
export const createProduct = (productData) => {
  const products = getInventoryProducts();
  
  if (products[productData.id]) {
    return {
      success: false,
      error: 'Prodotto già esistente'
    };
  }
  
  const newProduct = {
    ...productData,
    stock: productData.stock || 0,
    stockMinimo: productData.stockMinimo || MAGAZZINO_CONFIG.settings.defaultLowStockThreshold,
    stockMassimo: productData.stockMassimo || 100,
    costoAcquisto: productData.costoAcquisto || 0,
    ubicazione: productData.ubicazione || 'Magazzino Principale',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  products[productData.id] = newProduct;
  
  const result = setItem(MAGAZZINO_CONFIG.storageKeys.products, products);
  
  if (!result.success) {
    logError(
      new Error('Failed to create product'),
      { productData },
      ERROR_LEVELS.ERROR
    );
    return { success: false, error: result.error };
  }
  
  return { success: true, product: newProduct };
};

/**
 * Registra movimento inventario
 */
export const registerMovement = (movementData) => {
  const { productId, type, quantity, motivo, operatore, fornitore, ubicazioneDestinazione, note } = movementData;
  
  const products = getInventoryProducts();
  const product = products[productId];
  
  if (!product) {
    return {
      success: false,
      error: 'Prodotto non trovato'
    };
  }
  
  // Calcola nuovo stock in base al tipo movimento
  let newStock = product.stock;
  
  if (type === 'entrata') {
    newStock += quantity;
  } else if (type === 'uscita') {
    if (newStock < quantity) {
      return {
        success: false,
        error: `Stock insufficiente. Disponibile: ${newStock}, Richiesto: ${quantity}`
      };
    }
    newStock -= quantity;
  } else if (type === 'rettifica') {
    newStock = quantity; // Imposta stock direttamente
  } else if (type === 'scarto') {
    if (newStock < quantity) {
      return {
        success: false,
        error: `Stock insufficiente per scartare. Disponibile: ${newStock}, Richiesto: ${quantity}`
      };
    }
    newStock -= quantity;
  }
  // Trasferimento non modifica stock totale, solo ubicazione
  
  // Aggiorna prodotto
  const updateData = { stock: newStock };
  if (type === 'trasferimento' && ubicazioneDestinazione) {
    updateData.ubicazione = ubicazioneDestinazione;
  }
  
  const updateResult = updateProduct(productId, updateData);
  if (!updateResult.success) {
    return updateResult;
  }
  
  // Crea movimento
  const movement = {
    id: generateMovementId(),
    productId,
    productName: product.nome,
    type,
    quantity,
    stockBefore: product.stock,
    stockAfter: newStock,
    motivo: motivo || '',
    operatore: operatore || 'System',
    fornitore: fornitore || '',
    ubicazione: product.ubicazione,
    ubicazioneDestinazione: ubicazioneDestinazione || '',
    note: note || '',
    timestamp: new Date().toISOString()
  };
  
  // Salva movimento
  const movements = getItem(MAGAZZINO_CONFIG.storageKeys.movements, []);
  movements.unshift(movement);
  
  const result = setItem(MAGAZZINO_CONFIG.storageKeys.movements, movements);
  
  if (!result.success) {
    logError(
      new Error('Failed to save movement'),
      { movement },
      ERROR_LEVELS.ERROR
    );
    // Rollback stock update?
    return { success: false, error: result.error };
  }
  
  // Verifica allarmi stock
  checkStockAlerts(productId);
  
  return {
    success: true,
    movement,
    newStock
  };
};

/**
 * Ottieni movimenti inventario (con filtri opzionali)
 */
export const getMovements = (filters = {}) => {
  let movements = getItem(MAGAZZINO_CONFIG.storageKeys.movements, []);
  
  // Filtra per prodotto
  if (filters.productId) {
    movements = movements.filter(m => m.productId === filters.productId);
  }
  
  // Filtra per tipo
  if (filters.type) {
    movements = movements.filter(m => m.type === filters.type);
  }
  
  // Filtra per data
  if (filters.dateFrom) {
    movements = movements.filter(m => m.timestamp >= filters.dateFrom);
  }
  
  if (filters.dateTo) {
    movements = movements.filter(m => m.timestamp <= filters.dateTo);
  }
  
  // Ordina per data (più recenti prima)
  movements.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  // Limita risultati se richiesto
  if (filters.limit) {
    movements = movements.slice(0, filters.limit);
  }
  
  return movements;
};

/**
 * Ottieni prodotti con stock basso
 */
export const getLowStockProducts = () => {
  const products = getInventoryProducts();
  
  return Object.values(products).filter(prod => {
    return isLowStock(prod.stock, prod.stockMinimo);
  });
};

/**
 * Ottieni prodotti esauriti
 */
export const getOutOfStockProducts = () => {
  const products = getInventoryProducts();
  
  return Object.values(products).filter(prod => prod.stock === 0);
};

/**
 * Verifica e aggiorna allarmi stock per un prodotto
 */
export const checkStockAlerts = (productId) => {
  if (!MAGAZZINO_CONFIG.settings.enableAutoAlerts) return;
  
  const product = getProductById(productId);
  if (!product) return;
  
  const stockLevel = getStockLevel(product.stock, product.stockMinimo);
  const alerts = getItem(MAGAZZINO_CONFIG.storageKeys.alerts, []);
  
  // Rimuovi alert esistenti per questo prodotto
  const filteredAlerts = alerts.filter(a => a.productId !== productId);
  
  // Aggiungi nuovo alert se necessario
  if (stockLevel.id === 'CRITICO' || stockLevel.id === 'BASSO') {
    filteredAlerts.push({
      id: `alert-${productId}-${Date.now()}`,
      productId,
      productName: product.nome,
      level: stockLevel.id,
      stock: product.stock,
      stockMinimo: product.stockMinimo,
      message: stockLevel.id === 'CRITICO' 
        ? `${product.nome} è esaurito!`
        : `Stock basso per ${product.nome}: ${product.stock} rimasti`,
      timestamp: new Date().toISOString(),
      read: false
    });
  }
  
  setItem(MAGAZZINO_CONFIG.storageKeys.alerts, filteredAlerts);
};

/**
 * Ottieni allarmi non letti
 */
export const getUnreadAlerts = () => {
  const alerts = getItem(MAGAZZINO_CONFIG.storageKeys.alerts, []);
  return alerts.filter(a => !a.read);
};

/**
 * Marca alert come letto
 */
export const markAlertAsRead = (alertId) => {
  const alerts = getItem(MAGAZZINO_CONFIG.storageKeys.alerts, []);
  const updatedAlerts = alerts.map(a => 
    a.id === alertId ? { ...a, read: true } : a
  );
  setItem(MAGAZZINO_CONFIG.storageKeys.alerts, updatedAlerts);
};

/**
 * Calcola statistiche inventario
 */
export const getInventoryStats = () => {
  const products = getInventoryProducts();
  const movements = getMovements();
  
  const productsArray = Object.values(products);
  
  // Stock totale (somma quantità)
  const totalStock = productsArray.reduce((sum, p) => sum + (p.stock || 0), 0);
  
  // Valore inventario totale (costo acquisto)
  const valoreInventario = productsArray.reduce((sum, p) => {
    return sum + (p.stock * (p.costoAcquisto || 0));
  }, 0);
  
  // Valore inventario a prezzo vendita
  const valoreVendita = productsArray.reduce((sum, p) => {
    return sum + (p.stock * (p.prezzo || 0));
  }, 0);
  
  // Movimenti oggi
  const oggi = new Date().toISOString().split('T')[0];
  const movimentiOggi = movements.filter(m => m.timestamp.startsWith(oggi));
  
  // Movimenti ultimi 30 giorni
  const trentaGiorniFa = new Date();
  trentaGiorniFa.setDate(trentaGiorniFa.getDate() - 30);
  const movimentiRecent = movements.filter(m => 
    new Date(m.timestamp) >= trentaGiorniFa
  );
  
  // Movimenti per tipo (ultimi 30 giorni)
  const movementsByType = {};
  movimentiRecent.forEach(m => {
    movementsByType[m.type] = (movementsByType[m.type] || 0) + 1;
  });
  
  return {
    // Compatibilità con componenti esistenti
    totalProducts: productsArray.length,
    totalStock: totalStock,
    inventoryValue: valoreInventario,
    inventorySaleValue: valoreVendita,
    lowStockCount: getLowStockProducts().length,
    outOfStockCount: productsArray.filter(p => p.stock === 0).length,
    recentMovements: movimentiRecent.length,
    movementsByType: movementsByType,
    // Alias per compatibilità
    totaleProdotti: productsArray.length,
    prodottiInStock: productsArray.filter(p => p.stock > 0).length,
    prodottiEsauriti: productsArray.filter(p => p.stock === 0).length,
    prodottiStockBasso: getLowStockProducts().length,
    valoreInventario: valoreInventario,
    valoreVendita: valoreVendita,
    movimentiOggi: movimentiOggi.length,
    movimentiMese: movimentiRecent.length,
    totaleMovimenti: movements.length
  };
};

/**
 * Sincronizza stock con vendite Cassa (chiamato automaticamente quando si vende)
 */
export const syncStockFromSale = (saleItems) => {
  const results = [];
  
  for (const item of saleItems) {
    const result = registerMovement({
      productId: item.id,
      type: 'uscita',
      quantity: item.quantita,
      motivo: 'Vendita da Cassa',
      operatore: 'System',
      note: `Vendita automatica da modulo Cassa`
    });
    
    results.push({
      productId: item.id,
      success: result.success,
      error: result.error
    });
  }
  
  return results;
};
