// 🛡️ ERROR HANDLER - Sistema Centralizzato Gestione Errori
// Modulo indipendente per logging, notifiche e gestione errori

/**
 * Log errori in localStorage per debugging
 */
const ERROR_LOG_KEY = 'studio_error_log';
const MAX_ERRORS = 50; // Mantieni solo ultimi 50 errori

/**
 * Livelli di errore
 */
export const ERROR_LEVELS = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical'
};

/**
 * Logga un errore
 */
export const logError = (error, context = {}, level = ERROR_LEVELS.ERROR) => {
  const errorEntry = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    level,
    message: error?.message || String(error),
    stack: error?.stack,
    context: {
      userAgent: navigator.userAgent,
      url: window.location.href,
      ...context
    }
  };

  try {
    const existingLogs = JSON.parse(localStorage.getItem(ERROR_LOG_KEY) || '[]');
    existingLogs.unshift(errorEntry);
    
    // Mantieni solo ultimi N errori
    if (existingLogs.length > MAX_ERRORS) {
      existingLogs.splice(MAX_ERRORS);
    }
    
    localStorage.setItem(ERROR_LOG_KEY, JSON.stringify(existingLogs));
  } catch (e) {
    // Fallback: log nella console se localStorage fallisce
    console.error('Failed to log error to storage:', e);
    console.error('Original error:', errorEntry);
  }

  // Log anche nella console per debugging immediato
  if (level === ERROR_LEVELS.CRITICAL || level === ERROR_LEVELS.ERROR) {
    console.error(`[${level.toUpperCase()}]`, error, context);
  } else if (level === ERROR_LEVELS.WARNING) {
    console.warn(`[${level.toUpperCase()}]`, error, context);
  } else {
    console.info(`[${level.toUpperCase()}]`, error, context);
  }
};

/**
 * Ottieni gli errori loggati
 */
export const getErrorLogs = (limit = 20) => {
  try {
    const logs = JSON.parse(localStorage.getItem(ERROR_LOG_KEY) || '[]');
    return logs.slice(0, limit);
  } catch (e) {
    console.error('Failed to read error logs:', e);
    return [];
  }
};

/**
 * Pulisci i log errori
 */
export const clearErrorLogs = () => {
  try {
    localStorage.removeItem(ERROR_LOG_KEY);
    return true;
  } catch (e) {
    console.error('Failed to clear error logs:', e);
    return false;
  }
};

/**
 * Wrapper per funzioni async con error handling automatico
 */
export const withErrorHandling = async (fn, errorMessage = 'Operazione fallita', context = {}) => {
  try {
    return await fn();
  } catch (error) {
    logError(error, { ...context, customMessage: errorMessage }, ERROR_LEVELS.ERROR);
    throw error;
  }
};

/**
 * Wrapper per funzioni sync con error handling
 */
export const safeExecute = (fn, errorMessage = 'Operazione fallita', context = {}) => {
  try {
    return fn();
  } catch (error) {
    logError(error, { ...context, customMessage: errorMessage }, ERROR_LEVELS.ERROR);
    return null;
  }
};

/**
 * Valida se un valore è valido JSON
 */
export const isValidJSON = (str) => {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
};

/**
 * Crea un errore strutturato
 */
export const createError = (message, code = 'UNKNOWN_ERROR', details = {}) => {
  const error = new Error(message);
  error.code = code;
  error.details = details;
  error.timestamp = new Date().toISOString();
  return error;
};

/**
 * Messaggi di errore user-friendly
 */
export const ERROR_MESSAGES = {
  STORAGE_FULL: 'Spazio di archiviazione esaurito. Prova a liberare spazio o contatta il supporto.',
  STORAGE_READ_ERROR: 'Errore nella lettura dei dati. I dati potrebbero essere corrotti.',
  STORAGE_WRITE_ERROR: 'Errore nel salvataggio dei dati. Verifica lo spazio disponibile.',
  NETWORK_ERROR: 'Errore di connessione. Verifica la tua connessione internet.',
  AUTH_ERROR: 'Errore di autenticazione. Effettua nuovamente il login.',
  VALIDATION_ERROR: 'I dati inseriti non sono validi. Controlla i campi compilati.',
  PERMISSION_ERROR: 'Non hai i permessi per eseguire questa operazione.',
  UNKNOWN_ERROR: 'Si è verificato un errore imprevisto. Riprova più tardi.'
};

/**
 * Ottieni messaggio errore user-friendly
 */
export const getUserFriendlyMessage = (error) => {
  if (error?.code && ERROR_MESSAGES[error.code]) {
    return ERROR_MESSAGES[error.code];
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return ERROR_MESSAGES.UNKNOWN_ERROR;
};

