// 🧹 CLEAN INVENTORY - Rimuove prodotti hardcoded non più nel catalogo
// Funzione di utilità per pulire il magazzino da prodotti non più validi

import { getItem, setItem } from './storage';
import { MAGAZZINO_CONFIG } from '../config/magazzino.config';
import { getProducts as getCatalogoProducts } from './catalogo';

/**
 * Pulisce il magazzino rimuovendo tutti i prodotti che non sono nel catalogo
 * Questa funzione può essere chiamata manualmente per una pulizia completa
 */
export const cleanInventoryFromHardcodedProducts = () => {
  const existing = getItem(MAGAZZINO_CONFIG.storageKeys.products, {});
  const catalogoProducts = getCatalogoProducts().filter(p => p.attivo !== false);
  const catalogoIds = new Set(catalogoProducts.map(p => p.id));
  
  // Mantieni solo prodotti che esistono nel catalogo
  const cleanedProducts = {};
  
  Object.keys(existing).forEach(productId => {
    if (catalogoIds.has(productId)) {
      cleanedProducts[productId] = existing[productId];
    }
  });
  
  // Salva solo i prodotti puliti
  const result = setItem(MAGAZZINO_CONFIG.storageKeys.products, cleanedProducts);
  
  return {
    success: result.success,
    removed: Object.keys(existing).length - Object.keys(cleanedProducts).length,
    kept: Object.keys(cleanedProducts).length
  };
};

