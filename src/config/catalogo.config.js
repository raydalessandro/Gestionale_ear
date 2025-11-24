// 📋 CONFIGURAZIONE MODULO CATALOGO - VIBES STUDIO
// Modulo base per gestione prodotti e servizi
// PRECEDENTE a: Magazzino, Cassa, Transaction Manager
// Comunicazione tramite database centrale (localStorage)

export const CATALOGO_CONFIG = {
  // 🗄️ STORAGE KEYS (centralizzato come altri moduli)
  storageKeys: {
    products: 'catalogo_products',        // Prodotti per Magazzino/Cassa
    services: 'catalogo_services',        // Servizi per Transaction Manager
    productCategories: 'catalogo_product_categories',
    serviceCategories: 'catalogo_service_categories'
  },

  // ⚙️ IMPOSTAZIONI
  settings: {
    currency: 'EUR',
    currencySymbol: '€',
    locale: 'it-IT'
  },

  // 📂 CATEGORIE PRODOTTI DEFAULT (possono essere modificate dall'utente)
  defaultProductCategories: [
    { id: 'cavi', nome: 'Cavi Audio', icon: '🔌', color: '#8B5CF6' },
    { id: 'cuffie', nome: 'Cuffie', icon: '🎧', color: '#EC4899' },
    { id: 'accessori', nome: 'Accessori', icon: '🎤', color: '#10B981' },
    { id: 'supporti', nome: 'Supporti', icon: '🎼', color: '#F59E0B' },
    { id: 'media', nome: 'Media Storage', icon: '💾', color: '#3B82F6' },
    { id: 'altro', nome: 'Altro', icon: '📦', color: '#6B7280' }
  ],

  // 📂 CATEGORIE SERVIZI DEFAULT (possono essere modificate dall'utente)
  defaultServiceCategories: [
    { id: 'registrazione', nome: 'Registrazione', icon: '🎤', color: '#8B5CF6' },
    { id: 'produzione', nome: 'Produzione', icon: '🎹', color: '#EC4899' },
    { id: 'post-produzione', nome: 'Post-Produzione', icon: '🎛️', color: '#10B981' },
    { id: 'altro', nome: 'Altro', icon: '🎵', color: '#6B7280' }
  ]
};

/**
 * Struttura PRODOTTO (per Magazzino e Cassa)
 * {
 *   id: string (univoco)
 *   codice: string (codice prodotto personalizzato)
 *   nome: string
 *   categoria: string (id categoria)
 *   attivo: boolean
 *   createdAt: ISO string
 *   updatedAt: ISO string
 * }
 * 
 * NOTA: Prezzo e stock NON sono qui - vengono gestiti in Magazzino
 */

/**
 * Struttura SERVIZIO (per Transaction Manager)
 * {
 *   id: string (univoco)
 *   codice: string (codice servizio personalizzato)
 *   nome: string
 *   categoria: string (id categoria)
 *   pricePerHour: number (prezzo per ora)
 *   icon: string (emoji)
 *   color: string (hex color)
 *   description: string
 *   available: boolean
 *   createdAt: ISO string
 *   updatedAt: ISO string
 * }
 */

