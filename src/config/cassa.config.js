// 🎵 CONFIGURAZIONE MODULO CASSA - SOUNDWAVE STUDIO
// Questo file estende studio.config.js con prodotti/accessori vendibili in cassa

export const CASSA_CONFIG = {
  // 🎸 PRODOTTI / ACCESSORI VENDIBILI
  products: {
    // CAVI AUDIO
    'cable-xlr-3m': {
      id: 'cable-xlr-3m',
      nome: 'Cavo XLR 3m',
      categoria: 'cavi',
      prezzo: 15,
      stock: 20,
      icon: '🔌',
      descrizione: 'Cavo XLR bilanciato professionale 3 metri',
      attivo: true
    },
    'cable-xlr-5m': {
      id: 'cable-xlr-5m',
      nome: 'Cavo XLR 5m',
      categoria: 'cavi',
      prezzo: 22,
      stock: 15,
      icon: '🔌',
      descrizione: 'Cavo XLR bilanciato professionale 5 metri',
      attivo: true
    },
    'cable-jack-3m': {
      id: 'cable-jack-3m',
      nome: 'Cavo Jack 6.3mm 3m',
      categoria: 'cavi',
      prezzo: 12,
      stock: 25,
      icon: '🔌',
      descrizione: 'Cavo Jack mono/stereo 3 metri',
      attivo: true
    },
    'cable-aux': {
      id: 'cable-aux',
      nome: 'Cavo AUX 1.5m',
      categoria: 'cavi',
      prezzo: 8,
      stock: 30,
      icon: '🔌',
      descrizione: 'Cavo AUX 3.5mm stereo',
      attivo: true
    },

    // CUFFIE
    'headphones-monitor': {
      id: 'headphones-monitor',
      nome: 'Cuffie Monitor Professionali',
      categoria: 'cuffie',
      prezzo: 89,
      stock: 5,
      icon: '🎧',
      descrizione: 'Cuffie chiuse da studio per monitoring',
      attivo: true
    },
    'headphones-basic': {
      id: 'headphones-basic',
      nome: 'Cuffie Standard',
      categoria: 'cuffie',
      prezzo: 35,
      stock: 10,
      icon: '🎧',
      descrizione: 'Cuffie entry-level per registrazione',
      attivo: true
    },

    // ACCESSORI MICROFONO
    'pop-filter': {
      id: 'pop-filter',
      nome: 'Pop Filter',
      categoria: 'accessori',
      prezzo: 18,
      stock: 12,
      icon: '⭕',
      descrizione: 'Filtro anti-pop professionale',
      attivo: true
    },
    'mic-stand': {
      id: 'mic-stand',
      nome: 'Asta Microfono',
      categoria: 'accessori',
      prezzo: 25,
      stock: 8,
      icon: '🎤',
      descrizione: 'Asta microfono regolabile da studio',
      attivo: true
    },
    'shock-mount': {
      id: 'shock-mount',
      nome: 'Shock Mount',
      categoria: 'accessori',
      prezzo: 32,
      stock: 6,
      icon: '🎤',
      descrizione: 'Supporto antivibrazioni per microfono',
      attivo: true
    },

    // PLETTRI & PICCOLI ACCESSORI
    'picks-set': {
      id: 'picks-set',
      nome: 'Set Plettri (10pz)',
      categoria: 'accessori',
      prezzo: 5,
      stock: 50,
      icon: '🎸',
      descrizione: 'Set 10 plettri spessori assortiti',
      attivo: true
    },
    'strings-guitar': {
      id: 'strings-guitar',
      nome: 'Corde Chitarra',
      categoria: 'accessori',
      prezzo: 12,
      stock: 20,
      icon: '🎸',
      descrizione: 'Set corde per chitarra elettrica/acustica',
      attivo: true
    },
    'strings-bass': {
      id: 'strings-bass',
      nome: 'Corde Basso',
      categoria: 'accessori',
      prezzo: 28,
      stock: 10,
      icon: '🎸',
      descrizione: 'Set corde per basso 4 corde',
      attivo: true
    },

    // SUPPORTI & VARIE
    'music-stand': {
      id: 'music-stand',
      nome: 'Leggio Spartiti',
      categoria: 'supporti',
      prezzo: 22,
      stock: 5,
      icon: '🎼',
      descrizione: 'Leggio pieghevole professionale',
      attivo: true
    },
    'guitar-stand': {
      id: 'guitar-stand',
      nome: 'Supporto Chitarra',
      categoria: 'supporti',
      prezzo: 18,
      stock: 8,
      icon: '🎸',
      descrizione: 'Stand universale per chitarra/basso',
      attivo: true
    },

    // CONSUMABILI
    'usb-stick-16gb': {
      id: 'usb-stick-16gb',
      nome: 'Chiavetta USB 16GB',
      categoria: 'media',
      prezzo: 10,
      stock: 30,
      icon: '💾',
      descrizione: 'USB 3.0 per export tracce',
      attivo: true
    },
    'cd-audio': {
      id: 'cd-audio',
      nome: 'CD Audio Vergine',
      categoria: 'media',
      prezzo: 2,
      stock: 50,
      icon: '💿',
      descrizione: 'CD-R audio 80min',
      attivo: true
    }
  },

  // 📂 CATEGORIE PRODOTTI
  productCategories: [
    { id: 'cavi', nome: 'Cavi Audio', icon: '🔌', color: '#8B5CF6' },
    { id: 'cuffie', nome: 'Cuffie', icon: '🎧', color: '#EC4899' },
    { id: 'accessori', nome: 'Accessori Mic', icon: '🎤', color: '#10B981' },
    { id: 'supporti', nome: 'Supporti', icon: '🎼', color: '#F59E0B' },
    { id: 'media', nome: 'Media Storage', icon: '💾', color: '#3B82F6' },
    { id: 'tutti', nome: 'Tutti', icon: '📦', color: '#6B7280' }
  ],

  // 💳 METODI PAGAMENTO (estensione)
  paymentMethods: [
    { id: 'cash', nome: 'Contanti', icon: '💵' },
    { id: 'card', nome: 'Carta', icon: '💳' },
    { id: 'bank', nome: 'Bonifico', icon: '🏦' },
    { id: 'paypal', nome: 'PayPal', icon: '💙' },
    { id: 'satispay', nome: 'Satispay', icon: '📱' }
  ],

  // 🗄️ STORAGE KEYS
  storageKeys: {
    products: 'studio_cassa_products',
    sales: 'studio_cassa_sales',
    settings: 'studio_cassa_settings'
  },

  // ⚙️ IMPOSTAZIONI CASSA
  settings: {
    currency: 'EUR',
    currencySymbol: '€',
    locale: 'it-IT',
    printReceipt: true,
    requireClientForServices: true,  // 🔥 IMPORTANTE: servizi richiedono cliente
    allowQuickSaleProducts: true      // 🔥 IMPORTANTE: prodotti possono essere venduti senza cliente
  }
};

// 🔧 UTILITY FUNCTIONS
export const getProdottoById = (id) => {
  return CASSA_CONFIG.products[id];
};

export const getProdottiByCategoria = (categoriaId) => {
  if (categoriaId === 'tutti') {
    return Object.values(CASSA_CONFIG.products).filter(p => p.attivo);
  }
  return Object.values(CASSA_CONFIG.products).filter(
    p => p.categoria === categoriaId && p.attivo
  );
};

export const formatPrezzo = (amount) => {
  return new Intl.NumberFormat(CASSA_CONFIG.settings.locale, {
    style: 'currency',
    currency: CASSA_CONFIG.settings.currency
  }).format(amount);
};

export const generateNumeroVendita = () => {
  const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `V${today}-${random}`;
};
