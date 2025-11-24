import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

/**
 * 🔐 AuthRoute - Componente per proteggere route
 * 
 * Comportamento modulare:
 * - Se autenticato: mostra il componente richiesto
 * - Se non autenticato: redirect a /login
 * 
 * Uso:
 * <Route path="/protected" element={<AuthRoute><ProtectedComponent /></AuthRoute>} />
 */
const AuthRoute = ({ children }) => {
  // Verifica autenticazione usando il sistema centrale
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Utente autenticato, mostra il componente
  return children;
};

export default AuthRoute;

