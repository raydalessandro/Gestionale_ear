import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Launcher from './pages/Launcher';
import TransactionManager from './pages/TransactionManager';
import ClientHub from './pages/ClientHub';
import BookingSystem from './pages/BookingSystem';
import Analytics from './pages/Analytics';
import AdminPanel from './pages/Admin/AdminPanel';
import { isModuleEnabled } from './config/modules.config';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home - sempre accessibile */}
        <Route path="/" element={<Launcher />} />
        
        {/* Admin Panel - sempre accessibile (solo chi conosce la route) */}
        <Route path="/admin/*" element={<AdminPanel />} />
        
        {/* Route moduli - protette da configurazione */}
        {isModuleEnabled('transactions') && (
          <Route path="/transactions" element={<TransactionManager />} />
        )}
        
        {isModuleEnabled('clients') && (
          <Route path="/clients" element={<ClientHub />} />
        )}
        
        {isModuleEnabled('bookings') && (
          <Route path="/bookings" element={<BookingSystem />} />
        )}
        
        {isModuleEnabled('analytics') && (
          <Route path="/analytics" element={<Analytics />} />
        )}
        
        {/* Fallback - redirect a home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
