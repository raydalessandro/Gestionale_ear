// 📋 UTILITY FUNCTIONS - CATALOGO PRODOTTI E SERVIZI
// Gestione database centrale per prodotti e servizi

import { getItem, setItem } from './storage';
import { logError } from './errorHandler';
import { CATALOGO_CONFIG } from '../config/catalogo.config';

// ==========================================
// PRODOTTI
// ==========================================

/**
 * Ottiene tutti i prodotti dal catalogo
 */
export const getProducts = () => {
  try {
    const products = getItem(CATALOGO_CONFIG.storageKeys.products, []);
    return Array.isArray(products) ? products : [];
  } catch (error) {
    logError(error, 'catalogo.getProducts', 'ERROR');
    return [];
  }
};

/**
 * Ottiene un prodotto per ID
 */
export const getProductById = (id) => {
  const products = getProducts();
  return products.find(p => p.id === id) || null;
};

/**
 * Ottiene prodotti per categoria
 */
export const getProductsByCategory = (categoryId) => {
  const products = getProducts();
  return products.filter(p => p.categoria === categoryId && p.attivo !== false);
};

/**
 * Ottiene solo prodotti attivi
 */
export const getActiveProducts = () => {
  const products = getProducts();
  return products.filter(p => p.attivo !== false);
};

/**
 * Crea un nuovo prodotto
 */
export const createProduct = (productData) => {
  try {
    const products = getProducts();
    
    // Genera ID se non fornito
    const id = productData.id || `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Verifica duplicati
    if (products.find(p => p.id === id)) {
      return {
        success: false,
        error: 'ID prodotto già esistente'
      };
    }
    
    // Verifica codice duplicato (se fornito)
    if (productData.codice) {
      if (products.find(p => p.codice === productData.codice)) {
        return {
          success: false,
          error: 'Codice prodotto già esistente'
        };
      }
    }
    
    const newProduct = {
      id,
      codice: productData.codice || '',
      nome: productData.nome,
      categoria: productData.categoria || 'altro',
      attivo: productData.attivo !== undefined ? productData.attivo : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    products.push(newProduct);
    
    const result = setItem(CATALOGO_CONFIG.storageKeys.products, products);
    if (result.success) {
      return {
        success: true,
        data: newProduct
      };
    }
    
    return {
      success: false,
      error: result.error || 'Errore nel salvataggio'
    };
  } catch (error) {
    logError(error, 'catalogo.createProduct', 'ERROR');
    return {
      success: false,
      error: error.message || 'Errore nella creazione del prodotto'
    };
  }
};

/**
 * Aggiorna un prodotto esistente
 */
export const updateProduct = (id, updates) => {
  try {
    const products = getProducts();
    const index = products.findIndex(p => p.id === id);
    
    if (index === -1) {
      return {
        success: false,
        error: 'Prodotto non trovato'
      };
    }
    
    // Verifica codice duplicato (se modificato)
    if (updates.codice && updates.codice !== products[index].codice) {
      if (products.find(p => p.codice === updates.codice && p.id !== id)) {
        return {
          success: false,
          error: 'Codice prodotto già esistente'
        };
      }
    }
    
    products[index] = {
      ...products[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    const result = setItem(CATALOGO_CONFIG.storageKeys.products, products);
    if (result.success) {
      return {
        success: true,
        data: products[index]
      };
    }
    
    return {
      success: false,
      error: result.error || 'Errore nel salvataggio'
    };
  } catch (error) {
    logError(error, 'catalogo.updateProduct', 'ERROR');
    return {
      success: false,
      error: error.message || 'Errore nell\'aggiornamento del prodotto'
    };
  }
};

/**
 * Elimina un prodotto
 */
export const deleteProduct = (id) => {
  try {
    const products = getProducts();
    const filtered = products.filter(p => p.id !== id);
    
    const result = setItem(CATALOGO_CONFIG.storageKeys.products, filtered);
    if (result.success) {
      return { success: true };
    }
    
    return {
      success: false,
      error: result.error || 'Errore nell\'eliminazione'
    };
  } catch (error) {
    logError(error, 'catalogo.deleteProduct', 'ERROR');
    return {
      success: false,
      error: error.message || 'Errore nell\'eliminazione del prodotto'
    };
  }
};

// ==========================================
// SERVIZI
// ==========================================

/**
 * Ottiene tutti i servizi dal catalogo
 */
export const getServices = () => {
  try {
    const services = getItem(CATALOGO_CONFIG.storageKeys.services, []);
    return Array.isArray(services) ? services : [];
  } catch (error) {
    logError(error, 'catalogo.getServices', 'ERROR');
    return [];
  }
};

/**
 * Ottiene un servizio per ID
 */
export const getServiceById = (id) => {
  const services = getServices();
  return services.find(s => s.id === id) || null;
};

/**
 * Ottiene servizi per categoria
 */
export const getServicesByCategory = (categoryId) => {
  const services = getServices();
  return services.filter(s => s.categoria === categoryId && s.available !== false);
};

/**
 * Ottiene solo servizi disponibili
 */
export const getAvailableServices = () => {
  const services = getServices();
  return services.filter(s => s.available !== false);
};

/**
 * Crea un nuovo servizio
 */
export const createService = (serviceData) => {
  try {
    const services = getServices();
    
    // Genera ID se non fornito
    const id = serviceData.id || `serv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Verifica duplicati
    if (services.find(s => s.id === id)) {
      return {
        success: false,
        error: 'ID servizio già esistente'
      };
    }
    
    // Verifica codice duplicato (se fornito)
    if (serviceData.codice) {
      if (services.find(s => s.codice === serviceData.codice)) {
        return {
          success: false,
          error: 'Codice servizio già esistente'
        };
      }
    }
    
    const newService = {
      id,
      codice: serviceData.codice || '',
      nome: serviceData.nome,
      categoria: serviceData.categoria || 'altro',
      pricePerHour: serviceData.pricePerHour || 0,
      icon: serviceData.icon || '🎵',
      color: serviceData.color || '#8B5CF6',
      description: serviceData.description || '',
      available: serviceData.available !== undefined ? serviceData.available : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    services.push(newService);
    
    const result = setItem(CATALOGO_CONFIG.storageKeys.services, services);
    if (result.success) {
      return {
        success: true,
        data: newService
      };
    }
    
    return {
      success: false,
      error: result.error || 'Errore nel salvataggio'
    };
  } catch (error) {
    logError(error, 'catalogo.createService', 'ERROR');
    return {
      success: false,
      error: error.message || 'Errore nella creazione del servizio'
    };
  }
};

/**
 * Aggiorna un servizio esistente
 */
export const updateService = (id, updates) => {
  try {
    const services = getServices();
    const index = services.findIndex(s => s.id === id);
    
    if (index === -1) {
      return {
        success: false,
        error: 'Servizio non trovato'
      };
    }
    
    // Verifica codice duplicato (se modificato)
    if (updates.codice && updates.codice !== services[index].codice) {
      if (services.find(s => s.codice === updates.codice && s.id !== id)) {
        return {
          success: false,
          error: 'Codice servizio già esistente'
        };
      }
    }
    
    services[index] = {
      ...services[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    const result = setItem(CATALOGO_CONFIG.storageKeys.services, services);
    if (result.success) {
      return {
        success: true,
        data: services[index]
      };
    }
    
    return {
      success: false,
      error: result.error || 'Errore nel salvataggio'
    };
  } catch (error) {
    logError(error, 'catalogo.updateService', 'ERROR');
    return {
      success: false,
      error: error.message || 'Errore nell\'aggiornamento del servizio'
    };
  }
};

/**
 * Elimina un servizio
 */
export const deleteService = (id) => {
  try {
    const services = getServices();
    const filtered = services.filter(s => s.id !== id);
    
    const result = setItem(CATALOGO_CONFIG.storageKeys.services, filtered);
    if (result.success) {
      return { success: true };
    }
    
    return {
      success: false,
      error: result.error || 'Errore nell\'eliminazione'
    };
  } catch (error) {
    logError(error, 'catalogo.deleteService', 'ERROR');
    return {
      success: false,
      error: error.message || 'Errore nell\'eliminazione del servizio'
    };
  }
};

// ==========================================
// CATEGORIE
// ==========================================

/**
 * Ottiene le categorie prodotti
 */
export const getProductCategories = () => {
  try {
    const categories = getItem(CATALOGO_CONFIG.storageKeys.productCategories, []);
    if (Array.isArray(categories) && categories.length > 0) {
      return categories;
    }
    // Se non ci sono categorie, inizializza con quelle default
    const defaultCategories = CATALOGO_CONFIG.defaultProductCategories;
    setItem(CATALOGO_CONFIG.storageKeys.productCategories, defaultCategories);
    return defaultCategories;
  } catch (error) {
    logError(error, 'catalogo.getProductCategories', 'ERROR');
    return CATALOGO_CONFIG.defaultProductCategories;
  }
};

/**
 * Ottiene le categorie servizi
 */
export const getServiceCategories = () => {
  try {
    const categories = getItem(CATALOGO_CONFIG.storageKeys.serviceCategories, []);
    if (Array.isArray(categories) && categories.length > 0) {
      return categories;
    }
    // Se non ci sono categorie, inizializza con quelle default
    const defaultCategories = CATALOGO_CONFIG.defaultServiceCategories;
    setItem(CATALOGO_CONFIG.storageKeys.serviceCategories, defaultCategories);
    return defaultCategories;
  } catch (error) {
    logError(error, 'catalogo.getServiceCategories', 'ERROR');
    return CATALOGO_CONFIG.defaultServiceCategories;
  }
};

