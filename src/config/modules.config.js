// 🎵 SOUNDWAVE STUDIO - MODULES REGISTRY
// Registry centralizzato di tutti i moduli del sistema
// L'admin può attivare/disattivare moduli da qui

export const MODULES_REGISTRY = {
  transactions: {
    id: 'transactions',
    name: 'Transaction Manager',
    icon: '💰',
    description: 'Gestione transazioni e pagamenti',
    route: '/transactions',
    enabled: true,
    dependencies: [], // Nessuna dipendenza
    category: 'finance',
    color: '#8B5CF6',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  
  clients: {
    id: 'clients',
    name: 'Client Hub',
    icon: '👥',
    description: 'Gestione completa artisti e clienti',
    route: '/clients',
    enabled: true,
    dependencies: [],
    category: 'crm',
    color: '#EC4899',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)'
  },
  
  bookings: {
    id: 'bookings',
    name: 'Booking System',
    icon: '📅',
    description: 'Calendario prenotazioni e sale',
    route: '/bookings',
    enabled: true,
    dependencies: ['clients'], // Richiede gestione clienti
    category: 'operations',
    color: '#10B981',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
  },
  
  analytics: {
    id: 'analytics',
    name: 'Analytics Dashboard',
    icon: '📊',
    description: 'Report avanzati e business intelligence',
    route: '/analytics',
    enabled: true,
    dependencies: ['transactions', 'bookings'], // Richiede dati da altri moduli
    category: 'insights',
    color: '#F59E0B',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
  },
  cassa: {
  id: 'cassa',
  name: 'Cassa & Vendite',
  icon: '💰',
  description: 'Punto vendita accessori studio',
  route: '/cassa',
  enabled: true,
  dependencies: [],
  category: 'finance',
  color: '#EC4899',
  gradient: 'linear-gradient(135deg, #ec4899 0%, #f59e0b 100%)'
  }
};

// 🔧 UTILITY FUNCTIONS

/**
 * Carica la configurazione moduli dal localStorage
 * Se non esiste, usa il registry di default
 */
export const loadModulesConfig = () => {
  const saved = localStorage.getItem('modules_config');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Merge con registry per avere sempre tutti i campi aggiornati
      return Object.keys(MODULES_REGISTRY).reduce((acc, key) => {
        acc[key] = {
          ...MODULES_REGISTRY[key],
          enabled: parsed[key]?.enabled ?? MODULES_REGISTRY[key].enabled
        };
        return acc;
      }, {});
    } catch (e) {
      console.error('Errore nel parsing modules_config:', e);
      return MODULES_REGISTRY;
    }
  }
  return MODULES_REGISTRY;
};

/**
 * Salva la configurazione moduli nel localStorage
 */
export const saveModulesConfig = (config) => {
  localStorage.setItem('modules_config', JSON.stringify(config));
};

/**
 * Ottiene solo i moduli attivi
 */
export const getActiveModules = () => {
  const config = loadModulesConfig();
  return Object.values(config).filter(module => module.enabled);
};

/**
 * Verifica se un modulo è attivo
 */
export const isModuleEnabled = (moduleId) => {
  const config = loadModulesConfig();
  return config[moduleId]?.enabled ?? false;
};

/**
 * Verifica le dipendenze di un modulo
 * Ritorna array di moduli mancanti (se tutti ok, array vuoto)
 */
export const checkDependencies = (moduleId) => {
  const config = loadModulesConfig();
  const module = config[moduleId];
  
  if (!module || !module.dependencies || module.dependencies.length === 0) {
    return [];
  }
  
  return module.dependencies.filter(depId => !config[depId]?.enabled);
};

/**
 * Trova tutti i moduli che dipendono da un dato modulo
 */
export const findDependentModules = (moduleId) => {
  const config = loadModulesConfig();
  return Object.values(config).filter(module => 
    module.dependencies && module.dependencies.includes(moduleId)
  );
};

/**
 * Attiva/Disattiva un modulo
 */
export const toggleModule = (moduleId) => {
  const config = loadModulesConfig();
  
  if (!config[moduleId]) {
    console.error(`Modulo ${moduleId} non trovato`);
    return false;
  }
  
  // Se stiamo disattivando, controlla se altri moduli dipendono da questo
  if (config[moduleId].enabled) {
    const dependents = findDependentModules(moduleId);
    const activeDependents = dependents.filter(m => m.enabled);
    
    if (activeDependents.length > 0) {
      return {
        success: false,
        error: 'dependency_conflict',
        dependents: activeDependents
      };
    }
  }
  
  // Se stiamo attivando, controlla che le dipendenze siano soddisfatte
  if (!config[moduleId].enabled) {
    const missingDeps = checkDependencies(moduleId);
    
    if (missingDeps.length > 0) {
      return {
        success: false,
        error: 'missing_dependencies',
        missing: missingDeps
      };
    }
  }
  
  // Toggle
  config[moduleId].enabled = !config[moduleId].enabled;
  saveModulesConfig(config);
  
  return { success: true, newState: config[moduleId].enabled };
};

/**
 * Log attività admin
 */
export const logAdminActivity = (action, moduleId, details = {}) => {
  const logs = JSON.parse(localStorage.getItem('admin_activity_log') || '[]');
  
  logs.unshift({
    timestamp: new Date().toISOString(),
    action,
    moduleId,
    ...details
  });
  
  // Mantieni solo ultimi 100 log
  if (logs.length > 100) {
    logs.splice(100);
  }
  
  localStorage.setItem('admin_activity_log', JSON.stringify(logs));
};

/**
 * Ottiene i log attività admin
 */
export const getAdminLogs = (limit = 50) => {
  const logs = JSON.parse(localStorage.getItem('admin_activity_log') || '[]');
  return logs.slice(0, limit);
};
