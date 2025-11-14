import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Launcher from './pages/Launcher';
import TransactionManager from './pages/TransactionManager';
import ClientHub from './pages/ClientHub';
import BookingSystem from './pages/BookingSystem';
import Analytics from './pages/Analytics';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Launcher />} />
        <Route path="/transactions" element={<TransactionManager />} />
        <Route path="/clients" element={<ClientHub />} />
        <Route path="/bookings" element={<BookingSystem />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
