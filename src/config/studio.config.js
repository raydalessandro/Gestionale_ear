// 🎵 STUDIO MANAGER - CONFIGURAZIONE CENTRALIZZATA
// Modifica solo questo file per personalizzare l'intera suite

export const STUDIO_CONFIG = {
  // 🎨 BRAND IDENTITY
  brand: {
    name: "Soundwave Studio",
    tagline: "Where Music Comes to Life",
    logo: "🎵",
    colors: {
      primary: "#8B5CF6",
      secondary: "#10B981",
      accent: "#F59E0B",
      danger: "#DC2626",
      success: "#10B981",
      warning: "#F59E0B",
      info: "#3B82F6"
    },
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
  },

  // 🏢 INFORMAZIONI STUDIO
  studio: {
    address: "Via della Musica, 42",
    city: "Milano",
    zip: "20100",
    country: "Italia",
    phone: "+39 02 1234567",
    email: "info@soundwavestudio.com",
    website: "www.soundwavestudio.com",
    vatNumber: "IT12345678901",
    fiscalCode: "12345678901"
  },

  // 💰 IMPOSTAZIONI FINANZIARIE
  financial: {
    currency: "EUR",
    currencySymbol: "€",
    locale: "it-IT",
    taxRate: 22,
    invoicePrefix: "INV",
    receiptPrefix: "RIC",
    minimumDeposit: 30
  },

  // 🎵 SERVIZI DISPONIBILI
  services: {
    'rec-voice': {
      id: 'rec-voice',
      name: 'Registrazione Voce',
      pricePerHour: 50,
      category: 'Registrazione',
      icon: '🎤',
      color: '#8B5CF6',
      description: 'Sessione di registrazione voce professionale',
      available: true
    },
    'rec-instruments': {
      id: 'rec-instruments',
      name: 'Registrazione Strumenti',
      pricePerHour: 60,
      category: 'Registrazione',
      icon: '🎸',
      color: '#EC4899',
      description: 'Chitarre, basso, batteria, tastiere',
      available: true
    },
    'mix-master': {
      id: 'mix-master',
      name: 'Mix & Master',
      pricePerHour: 80,
      category: 'Post-Produzione',
      icon: '🎛️',
      color: '#10B981',
      description: 'Mix professionale e mastering',
      available: true
    },
    'beat-prod': {
      id: 'beat-prod',
      name: 'Produzione Beat',
      pricePerHour: 70,
      category: 'Produzione',
      icon: '🎹',
      color: '#F59E0B',
      description: 'Creazione beat originali',
      available: true
    },
    'editing': {
      id: 'editing',
      name: 'Editing Audio',
      pricePerHour: 45,
      category: 'Post-Produzione',
      icon: '✂️',
      color: '#3B82F6',
      description: 'Editing e pulizia tracce audio',
      available: true
    },
    'vocal-tuning': {
      id: 'vocal-tuning',
      name: 'Vocal Tuning',
      pricePerHour: 40,
      category: 'Post-Produzione',
      icon: '🎵',
      color: '#EC4899',
      description: 'Auto-tune e correzione intonazione',
      available: true
    }
  },

  // 🏠 SALE DISPONIBILI
  rooms: [
    { id: 'room-a', name: 'Sala A - Main Studio', icon: '🎤', color: '#8B5CF6' },
    { id: 'room-b', name: 'Sala B - Vocal Booth', icon: '🎧', color: '#EC4899' },
    { id: 'room-c', name: 'Sala C - Mix Room', icon: '🎛️', color: '#10B981' }
  ],

  // 📂 CATEGORIE SERVIZI
  serviceCategories: [
    { id: 'Registrazione', name: 'Registrazione', icon: '🎤', color: '#8B5CF6' },
    { id: 'Produzione', name: 'Produzione', icon: '🎹', color: '#EC4899' },
    { id: 'Post-Produzione', name: 'Post-Produzione', icon: '🎛️', color: '#10B981' }
  ],

  // 💳 METODI DI PAGAMENTO
  paymentMethods: [
    { id: 'cash', name: 'Contanti', icon: '💵' },
    { id: 'bank', name: 'Bonifico Bancario', icon: '🏦' },
    { id: 'paypal', name: 'PayPal', icon: '💙' },
    { id: 'card', name: 'Carta di Credito/Debito', icon: '💳' },
    { id: 'satispay', name: 'Satispay', icon: '📱' },
    { id: 'stripe', name: 'Stripe', icon: '💜' }
  ],

  // 🎭 GENERI MUSICALI
  musicGenres: [
    'Hip Hop', 'Trap', 'Pop', 'Rock', 'Electronic',
    'Jazz', 'R&B', 'Soul', 'Reggae', 'Indie',
    'Metal', 'Punk', 'Folk', 'Country', 'Blues', 'Altro'
  ],

  // 📊 STATI TRANSAZIONI
  transactionStatuses: {
    pending: {
      id: 'pending',
      name: 'In Attesa',
      icon: '⏳',
      color: '#F59E0B',
      bgColor: '#FEF3C7',
      textColor: '#92400E'
    },
    partial: {
      id: 'partial',
      name: 'Parziale',
      icon: '💰',
      color: '#3B82F6',
      bgColor: '#DBEAFE',
      textColor: '#1E40AF'
    },
    paid: {
      id: 'paid',
      name: 'Pagato',
      icon: '✓',
      color: '#10B981',
      bgColor: '#D1FAE5',
      textColor: '#065F46'
    },
    cancelled: {
      id: 'cancelled',
      name: 'Annullato',
      icon: '✕',
      color: '#DC2626',
      bgColor: '#FEE2E2',
      textColor: '#991B1B'
    }
  },

  // ⏰ ORARI LAVORATIVI
  workingHours: {
    start: 9,
    end: 22,
    slotDuration: 1
  },

  // 🗄️ STORAGE KEYS
  storageKeys: {
    artists: 'studio_artists',
    transactions: 'studio_transactions',
    services: 'studio_services',
    bookings: 'studio_bookings',
    projects: 'studio_projects',
    invoices: 'studio_invoices',
    config: 'studio_custom_config'
  }
};

// 🔧 UTILITY FUNCTIONS
export const getServiceById = (id) => {
  return STUDIO_CONFIG.services[id];
};

export const getServicesByCategory = (category) => {
  return Object.values(STUDIO_CONFIG.services).filter(s => s.category === category && s.available);
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat(STUDIO_CONFIG.financial.locale, {
    style: 'currency',
    currency: STUDIO_CONFIG.financial.currency
  }).format(amount);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString(STUDIO_CONFIG.financial.locale);
};

export const formatDateTime = (date) => {
  return new Date(date).toLocaleString(STUDIO_CONFIG.financial.locale);
};

export const getStatusConfig = (statusId) => {
  return STUDIO_CONFIG.transactionStatuses[statusId];
};
