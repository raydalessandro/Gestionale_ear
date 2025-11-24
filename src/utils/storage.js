// 🗄️ STORAGE UTILITY - Helper functions per localStorage
// Integrato con sistema error handling centralizzato

import { logError, createError, ERROR_LEVELS, ERROR_MESSAGES } from './errorHandler';

/**
 * Verifica se localStorage è disponibile
 */
const isStorageAvailable = () => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

/**
 * Verifica se c'è spazio disponibile in localStorage
 */
const checkStorageSpace = (key, value) => {
  try {
    const itemSize = JSON.stringify(value).length;
    const currentSize = JSON.stringify(localStorage).length;
    const maxSize = 5 * 1024 * 1024; // 5MB (stima)
    
    if (currentSize + itemSize > maxSize * 0.9) {
      logError(
        createError(ERROR_MESSAGES.STORAGE_FULL, 'STORAGE_FULL', { key, itemSize }),
        { key, itemSize, currentSize },
        ERROR_LEVELS.WARNING
      );
      return false;
    }
    return true;
  } catch {
    return true; // Se non possiamo verificare, proviamo comunque
  }
};

/**
 * Valida formato dati prima di salvare
 */
const validateData = (value, key) => {
  // Valida che il valore sia serializzabile
  try {
    JSON.stringify(value);
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: `Valore non serializzabile per la chiave "${key}"`
    };
  }
};

/**
 * Leggi item da localStorage con error handling avanzato
 */
export const getItem = (key, defaultValue = null) => {
  // Valida input
  if (!key || typeof key !== 'string') {
    logError(
      createError('Key must be a non-empty string', 'INVALID_KEY', { key }),
      { key },
      ERROR_LEVELS.WARNING
    );
    return defaultValue;
  }

  // Verifica disponibilità storage
  if (!isStorageAvailable()) {
    logError(
      createError(ERROR_MESSAGES.STORAGE_READ_ERROR, 'STORAGE_UNAVAILABLE'),
      { key },
      ERROR_LEVELS.ERROR
    );
    return defaultValue;
  }

  try {
    const item = localStorage.getItem(key);
    
    // Se non esiste, ritorna default
    if (item === null) {
      return defaultValue;
    }

    // Parse JSON con validazione
    try {
      const parsed = JSON.parse(item);
      return parsed;
    } catch (parseError) {
      // Dati corrotti - logga e ritorna default
      logError(
        createError(ERROR_MESSAGES.STORAGE_READ_ERROR, 'CORRUPTED_DATA', { key }),
        { key, parseError },
        ERROR_LEVELS.ERROR
      );
      
      // Opzionalmente: rimuovi dati corrotti
      // localStorage.removeItem(key);
      
      return defaultValue;
    }
  } catch (error) {
    logError(
      createError(ERROR_MESSAGES.STORAGE_READ_ERROR, 'READ_ERROR', { key }),
      { key, error },
      ERROR_LEVELS.ERROR
    );
    return defaultValue;
  }
};

/**
 * Salva item in localStorage con validazione e error handling
 */
export const setItem = (key, value) => {
  // Valida input
  if (!key || typeof key !== 'string') {
    logError(
      createError('Key must be a non-empty string', 'INVALID_KEY', { key }),
      { key },
      ERROR_LEVELS.WARNING
    );
    return { success: false, error: 'Invalid key' };
  }

  // Verifica disponibilità storage
  if (!isStorageAvailable()) {
    logError(
      createError(ERROR_MESSAGES.STORAGE_WRITE_ERROR, 'STORAGE_UNAVAILABLE'),
      { key },
      ERROR_LEVELS.ERROR
    );
    return { success: false, error: ERROR_MESSAGES.STORAGE_WRITE_ERROR };
  }

  // Valida dati
  const validation = validateData(value, key);
  if (!validation.valid) {
    logError(
      createError(validation.error, 'INVALID_DATA', { key }),
      { key, value: typeof value },
      ERROR_LEVELS.WARNING
    );
    return { success: false, error: validation.error };
  }

  // Verifica spazio disponibile
  if (!checkStorageSpace(key, value)) {
    return { 
      success: false, 
      error: ERROR_MESSAGES.STORAGE_FULL,
      code: 'STORAGE_FULL'
    };
  }

  try {
    localStorage.setItem(key, JSON.stringify(value));
    return { success: true };
  } catch (error) {
    // Gestione errori specifici
    let errorCode = 'WRITE_ERROR';
    let errorMessage = ERROR_MESSAGES.STORAGE_WRITE_ERROR;

    if (error.name === 'QuotaExceededError') {
      errorCode = 'STORAGE_FULL';
      errorMessage = ERROR_MESSAGES.STORAGE_FULL;
    }

    logError(
      createError(errorMessage, errorCode, { key }),
      { key, error },
      ERROR_LEVELS.ERROR
    );

    return { 
      success: false, 
      error: errorMessage,
      code: errorCode
    };
  }
};

/**
 * Rimuovi item da localStorage
 */
export const removeItem = (key) => {
  // Valida input
  if (!key || typeof key !== 'string') {
    logError(
      createError('Key must be a non-empty string', 'INVALID_KEY', { key }),
      { key },
      ERROR_LEVELS.WARNING
    );
    return { success: false, error: 'Invalid key' };
  }

  // Verifica disponibilità storage
  if (!isStorageAvailable()) {
    logError(
      createError('Storage non disponibile', 'STORAGE_UNAVAILABLE'),
      { key },
      ERROR_LEVELS.ERROR
    );
    return { success: false, error: 'Storage non disponibile' };
  }

  try {
    localStorage.removeItem(key);
    return { success: true };
  } catch (error) {
    logError(
      createError('Errore nella rimozione', 'REMOVE_ERROR', { key }),
      { key, error },
      ERROR_LEVELS.ERROR
    );
    return { success: false, error: 'Errore nella rimozione' };
  }
};

/**
 * Pulisci tutto localStorage (attenzione!)
 */
export const clearAll = () => {
  if (!isStorageAvailable()) {
    return { success: false, error: 'Storage non disponibile' };
  }

  try {
    localStorage.clear();
    return { success: true };
  } catch (error) {
    logError(
      createError('Errore nel pulire storage', 'CLEAR_ERROR'),
      { error },
      ERROR_LEVELS.ERROR
    );
    return { success: false, error: 'Errore nel pulire storage' };
  }
};

/**
 * Ottieni tutte le chiavi del nostro storage (prefisso 'studio_')
 */
export const getStorageKeys = () => {
  if (!isStorageAvailable()) {
    return [];
  }

  try {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('studio_')) {
        keys.push(key);
      }
    }
    return keys;
  } catch (error) {
    logError(
      createError('Errore nel leggere le chiavi', 'KEYS_ERROR'),
      { error },
      ERROR_LEVELS.ERROR
    );
    return [];
  }
};
