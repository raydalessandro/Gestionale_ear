// 🔐 AUTH UTILITY - Sistema Autenticazione Modulare
// Comunicazione con database centrale tramite localStorage
// Modulo indipendente che può essere facilmente sostituito con Supabase

import { getItem, setItem, removeItem } from './storage.js';

// 🗄️ STORAGE KEYS (centralizzato come gli altri moduli)
const AUTH_STORAGE_KEY = 'studio_auth_session';
const USERS_STORAGE_KEY = 'studio_users';

// 👤 UTENTI DEFAULT (per ora in memoria, poi migreremo a Supabase)
const DEFAULT_USERS = [
  {
    id: 'admin',
    username: 'admin',
    password: 'admin123', // TODO: Hash password quando integriamo Supabase
    role: 'admin',
    name: 'Administrator',
    email: 'admin@soundwavestudio.com',
    createdAt: new Date().toISOString()
  }
];

/**
 * Inizializza utenti default se non esistono
 */
export const initDefaultUsers = () => {
  const existingUsers = getItem(USERS_STORAGE_KEY, []);
  if (existingUsers.length === 0) {
    const result = setItem(USERS_STORAGE_KEY, DEFAULT_USERS);
    if (!result.success) {
      console.error('Failed to initialize default users:', result.error);
    }
  }
};

/**
 * Verifica se l'utente è autenticato
 */
export const isAuthenticated = () => {
  const session = getItem(AUTH_STORAGE_KEY, null);
  if (!session) return false;
  
  // Verifica che la sessione non sia scaduta (24 ore)
  const sessionAge = Date.now() - new Date(session.timestamp).getTime();
  const maxAge = 24 * 60 * 60 * 1000; // 24 ore
  
  if (sessionAge > maxAge) {
    logout();
    return false;
  }
  
  return true;
};

/**
 * Ottiene la sessione corrente
 */
export const getCurrentSession = () => {
  if (!isAuthenticated()) return null;
  return getItem(AUTH_STORAGE_KEY, null);
};

/**
 * Ottiene l'utente corrente
 */
export const getCurrentUser = () => {
  const session = getCurrentSession();
  if (!session) return null;
  
  const users = getItem(USERS_STORAGE_KEY, []);
  return users.find(u => u.id === session.userId) || null;
};

/**
 * Login utente
 */
export const login = (username, password) => {
  // Inizializza utenti se necessario
  initDefaultUsers();
  
  const users = getItem(USERS_STORAGE_KEY, []);
  const user = users.find(u => u.username === username && u.password === password);
  
  if (!user) {
    return {
      success: false,
      error: 'Credenziali non valide'
    };
  }
  
  // Crea sessione
  const session = {
    userId: user.id,
    username: user.username,
    role: user.role,
    timestamp: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 ore
  };
  
  const result = setItem(AUTH_STORAGE_KEY, session);
  
  if (!result.success) {
    return {
      success: false,
      error: result.error || 'Errore nel salvare la sessione'
    };
  }
  
  return {
    success: true,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
};

/**
 * Logout utente
 */
export const logout = () => {
  const result = removeItem(AUTH_STORAGE_KEY);
  return result.success;
};

/**
 * Verifica se l'utente ha un determinato ruolo
 */
export const hasRole = (role) => {
  const user = getCurrentUser();
  if (!user) return false;
  return user.role === role || user.role === 'admin'; // Admin ha sempre accesso
};

/**
 * Verifica se l'utente è admin
 */
export const isAdmin = () => {
  return hasRole('admin');
};

/**
 * Registra nuovo utente (per uso futuro con Supabase)
 */
export const registerUser = (userData) => {
  const users = getItem(USERS_STORAGE_KEY, []);
  
  // Verifica username già esistente
  if (users.find(u => u.username === userData.username)) {
    return {
      success: false,
      error: 'Username già esistente'
    };
  }
  
  const newUser = {
    id: `user_${Date.now()}`,
    ...userData,
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  const result = setItem(USERS_STORAGE_KEY, users);
  
  if (!result.success) {
    return {
      success: false,
      error: result.error || 'Errore nel salvare l\'utente'
    };
  }
  
  return {
    success: true,
    user: newUser
  };
};

/**
 * Aggiorna password utente
 */
export const updatePassword = (userId, oldPassword, newPassword) => {
  const users = getItem(USERS_STORAGE_KEY, []);
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return { success: false, error: 'Utente non trovato' };
  }
  
  if (users[userIndex].password !== oldPassword) {
    return { success: false, error: 'Password corrente non valida' };
  }
  
  users[userIndex].password = newPassword;
  const result = setItem(USERS_STORAGE_KEY, users);
  
  if (!result.success) {
    return {
      success: false,
      error: result.error || 'Errore nel salvare la password'
    };
  }
  
  return { success: true };
};

