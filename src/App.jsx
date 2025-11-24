import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Launcher from './pages/Launcher';
import Catalogo from './pages/Catalogo';
import TransactionManager from './pages/TransactionManager';
import ClientHub from './pages/ClientHub';
import BookingSystem from './pages/BookingSystem';
import Analytics from './pages/Analytics';
import Cassa from './pages/Cassa';
import Magazzino from './pages/Magazzino';
import AdminPanel from './pages/Admin/AdminPanel';
import AuthRoute from './components/AuthRoute';
import { isModuleEnabled } from './config/modules.config';
import { isAuthenticated } from './utils/auth';

// Componente Login con redirect se già autenticato
const LoginRoute = () => {
  if (isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  return <Login />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🔐 Login - accessibile solo se non autenticato */}
        <Route path="/login" element={<LoginRoute />} />
        
        {/* 🏠 Home - protetta da autenticazione */}
        <Route 
          path="/" 
          element={
            <AuthRoute>
              <Launcher />
            </AuthRoute>
          } 
        />
        
        {/* ⚙️ Admin Panel - protetto da autenticazione */}
        <Route 
          path="/admin/*" 
          element={
            <AuthRoute>
              <AdminPanel />
            </AuthRoute>
          } 
        />
        
        {/* 📦 Route moduli - protette da autenticazione e configurazione */}
        {/* 📋 Catalogo - PRECEDENTE a tutti gli altri moduli */}
        {isModuleEnabled('catalogo') && (
          <Route 
            path="/catalogo" 
            element={
              <AuthRoute>
                <Catalogo />
              </AuthRoute>
            } 
          />
        )}
        
        {isModuleEnabled('transactions') && (
          <Route 
            path="/transactions" 
            element={
              <AuthRoute>
                <TransactionManager />
              </AuthRoute>
            } 
          />
        )}
        
        {isModuleEnabled('clients') && (
          <Route 
            path="/clients" 
            element={
              <AuthRoute>
                <ClientHub />
              </AuthRoute>
            } 
          />
        )}
        
        {isModuleEnabled('bookings') && (
          <Route 
            path="/bookings" 
            element={
              <AuthRoute>
                <BookingSystem />
              </AuthRoute>
            } 
          />
        )}
        
        {isModuleEnabled('analytics') && (
          <Route 
            path="/analytics" 
            element={
              <AuthRoute>
                <Analytics />
              </AuthRoute>
            } 
          />
        )}
        
        {isModuleEnabled('cassa') && (
          <Route 
            path="/cassa" 
            element={
              <AuthRoute>
                <Cassa />
              </AuthRoute>
            } 
          />
        )}
        
        {isModuleEnabled('magazzino') && (
          <Route 
            path="/magazzino" 
            element={
              <AuthRoute>
                <Magazzino />
              </AuthRoute>
            } 
          />
        )}
        
        {/* Fallback - redirect a login se non autenticato, altrimenti home */}
        <Route 
          path="*" 
          element={
            isAuthenticated() ? <Navigate to="/" replace /> : <Navigate to="/login" replace />
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
