// 📦 CONFIGURAZIONE MODULO MAGAZZINO - SOUNDWAVE STUDIO
// Gestione completa inventario e stock prodotti
// Integrato con modulo Catalogo - Comunicazione tramite database centrale

export const MAGAZZINO_CONFIG = {
  // 🗄️ STORAGE KEYS (centralizzato come altri moduli)
  storageKeys: {
    products: 'studio_magazzino_products',
    movements: 'studio_magazzino_movements',
    categories: 'studio_magazzino_categories',
    settings: 'studio_magazzino_settings',
    alerts: 'studio_magazzino_alerts'
  },

  // ⚙️ IMPOSTAZIONI
  settings: {
    defaultLowStockThreshold: 5, // Soglia stock basso di default
    enableAutoAlerts: true,
    currency: 'EUR',
    currencySymbol: '€',
    locale: 'it-IT'
  },

  // 📊 TIPI MOVIMENTO
  movementTypes: {
    ENTRATA: {
      id: 'entrata',
      name: 'Entrata Merce',
      icon: '📥',
      color: '#10B981',
      description: 'Acquisto o ricevimento merce'
    },
    USCITA: {
      id: 'uscita',
      name: 'Uscita Merce',
      icon: '📤',
      color: '#DC2626',
      description: 'Vendita o rimozione merce'
    },
    TRASFERIMENTO: {
      id: 'trasferimento',
      name: 'Trasferimento',
      icon: '🔄',
      color: '#3B82F6',
      description: 'Spostamento interno tra ubicazioni'
    },
    RETTIFICA: {
      id: 'rettifica',
      name: 'Rettifica Inventario',
      icon: '✏️',
      color: '#F59E0B',
      description: 'Correzione manuale stock'
    },
    SCARTO: {
      id: 'scarto',
      name: 'Scarto',
      icon: '🗑️',
      color: '#6B7280',
      description: 'Eliminazione merce danneggiata'
    }
  },

  // 📂 CATEGORIE (verranno caricate dal Catalogo)
  categories: [],

  // 🔔 LIVELLI ALLARME STOCK
  stockLevels: {
    CRITICO: {
      threshold: 0,
      name: 'Stock Critico',
      icon: '🔴',
      color: '#DC2626',
      bgColor: '#FEE2E2'
    },
    BASSO: {
      threshold: 5,
      name: 'Stock Basso',
      icon: '🟡',
      color: '#F59E0B',
      bgColor: '#FEF3C7'
    },
    NORMALE: {
      threshold: 10,
      name: 'Stock Normale',
      icon: '🟢',
      color: '#10B981',
      bgColor: '#D1FAE5'
    }
  }
};

/**
 * 🔧 UTILITY FUNCTIONS
 */

/**
 * Genera ID univoco per movimento
 */
export const generateMovementId = () => {
  return `MOV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Ottieni tipo movimento
 */
export const getMovementType = (typeId) => {
  return MAGAZZINO_CONFIG.movementTypes[typeId] || MAGAZZINO_CONFIG.movementTypes.ENTRATA;
};

/**
 * Verifica se stock è basso
 */
export const isLowStock = (stock, stockMinimo) => {
  return stock <= (stockMinimo || MAGAZZINO_CONFIG.settings.defaultLowStockThreshold);
};

/**
 * Ottieni livello stock
 */
export const getStockLevel = (stock, stockMinimo) => {
  if (stock === 0) return MAGAZZINO_CONFIG.stockLevels.CRITICO;
  if (isLowStock(stock, stockMinimo)) return MAGAZZINO_CONFIG.stockLevels.BASSO;
  return MAGAZZINO_CONFIG.stockLevels.NORMALE;
};

/**
 * Formatta prezzo
 */
export const formatPrezzo = (amount) => {
  return new Intl.NumberFormat(MAGAZZINO_CONFIG.settings.locale, {
    style: 'currency',
    currency: MAGAZZINO_CONFIG.settings.currency
  }).format(amount);
};
