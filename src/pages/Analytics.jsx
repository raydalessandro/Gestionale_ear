import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { STUDIO_CONFIG } from '../config/studio.config';
import Header from '../components/Header';

// 🎨 CONFIGURAZIONE - Vibes Studio (configurazione centralizzata)
const CONFIG = STUDIO_CONFIG;

// 🎨 STILI GLOBALI
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  
  * { box-sizing: border-box; }
  
  .stat-card {
    background: white;
    border-radius: 12px;
    padding: 25px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    transition: all 0.2s;
  }

  .stat-card:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    transform: translateY(-2px);
  }

  .chart-card {
    background: white;
    border-radius: 12px;
    padding: 25px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    margin-bottom: 25px;
  }

  .filter-btn {
    padding: 10px 20px;
    border: 2px solid #E5E7EB;
    background: white;
    color: #666;
    border-radius: 8px;
    font-weight: 600;
    transition: all 0.2s;
    cursor: pointer;
  }

  .filter-btn.active {
    background: ${CONFIG.brand.colors.primary};
    color: white;
    border-color: ${CONFIG.brand.colors.primary};
  }

  .filter-btn:hover:not(.active) {
    border-color: ${CONFIG.brand.colors.primary};
    color: ${CONFIG.brand.colors.primary};
  }

  input, select {
    padding: 10px 12px;
    border: 2px solid #E5E7EB;
    border-radius: 8px;
    font-family: inherit;
    font-size: 0.95rem;
    transition: border-color 0.2s;
    width: 100%;
  }
  
  input:focus, select:focus {
    outline: none;
    border-color: ${CONFIG.brand.colors.primary};
  }

  button {
    cursor: pointer;
    transition: all 0.2s;
    font-weight: 600;
    border: none;
    border-radius: 8px;
    font-family: inherit;
  }
  
  button:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }

  .metric-row {
    display: flex;
    justify-content: space-between;
    padding: 12px 0;
    border-bottom: 1px solid #F3F4F6;
  }

  .metric-row:last-child {
    border-bottom: none;
  }

  .trend-up {
    color: ${CONFIG.brand.colors.secondary};
    font-weight: 600;
  }

  .trend-down {
    color: ${CONFIG.brand.colors.danger};
    font-weight: 600;
  }
`;

const AnalyticsDashboard = () => {
  // 📊 STATE
  const [artists, setArtists] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [cassaSales, setCassaSales] = useState([]);
  const [dateRange, setDateRange] = useState('month'); // week, month, quarter, year, custom
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [compareMode, setCompareMode] = useState(false);
  

  // 🔄 LOAD DATA
  useEffect(() => {
    const loadedArtists = JSON.parse(localStorage.getItem(CONFIG.storageKeys.artists) || '[]');
    const loadedTransactions = JSON.parse(localStorage.getItem(CONFIG.storageKeys.transactions) || '[]');
    const loadedBookings = JSON.parse(localStorage.getItem(CONFIG.storageKeys.bookings) || '[]');
    const loadedCassaSales = JSON.parse(localStorage.getItem('studio_cassa_sales') || '[]');
    setArtists(loadedArtists);
    setTransactions(loadedTransactions);
    setBookings(loadedBookings);
    setCassaSales(loadedCassaSales);
  }, []);

  // 📅 DATE HELPERS
  const getDateRange = () => {
    const now = new Date();
    let startDate, endDate = new Date();

    switch (dateRange) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case 'custom':
        if (customStartDate && customEndDate) {
          startDate = new Date(customStartDate);
          endDate = new Date(customEndDate);
        } else {
          return { startDate: new Date(0), endDate: new Date() };
        }
        break;
      default:
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 1);
    }

    return { startDate, endDate };
  };

  const getPeriodLabel = () => {
    switch (dateRange) {
      case 'week': return 'Ultimi 7 giorni';
      case 'month': return 'Ultimo mese';
      case 'quarter': return 'Ultimi 3 mesi';
      case 'year': return 'Ultimo anno';
      case 'custom': 
        if (customStartDate && customEndDate) {
          return `${new Date(customStartDate).toLocaleDateString()} - ${new Date(customEndDate).toLocaleDateString()}`;
        }
        return 'Periodo personalizzato';
      default: return 'Ultimo mese';
    }
  };

  // 🧮 ANALYTICS CALCULATIONS
  const getAnalytics = () => {
    const { startDate, endDate } = getDateRange();
    
    // Filter data by date range
    const filteredTransactions = transactions.filter(t => {
      const date = new Date(t.timestamp);
      return date >= startDate && date <= endDate;
    });

    const filteredBookings = bookings.filter(b => {
      const date = new Date(b.date);
      return date >= startDate && date <= endDate;
    });

    // Revenue Analytics
    const totalRevenue = filteredTransactions.reduce((sum, t) => {
  const paid = t.payments?.reduce((s, p) => s + p.amount, 0) || 0;
  return sum + paid;
}, 0);

// 🛒 CASSA Revenue (filtra per data - usa startDate/endDate già dichiarati)
const filteredCassaSales = cassaSales.filter(sale => {
  const saleDate = new Date(sale.data);
  return saleDate >= startDate && saleDate <= endDate;
});

const cassaRevenue = filteredCassaSales.reduce((sum, sale) => sum + sale.totale, 0);
const cassaTransactionsCount = filteredCassaSales.length;

    const pendingRevenue = filteredTransactions.reduce((sum, t) => {
      const total = t.total;
      const paid = t.payments?.reduce((s, p) => s + p.amount, 0) || 0;
      return sum + (total - paid);
    }, 0);

    // Hours Analytics
    const totalHours = filteredTransactions.reduce((sum, t) => 
      sum + t.services.reduce((s, service) => s + service.hours, 0), 0
    );

    const bookedHours = filteredBookings.reduce((sum, b) => sum + b.duration, 0);

    // Service Performance (SOLO TRANSAZIONI PAGATE)
    const serviceStats = {};
    filteredTransactions.forEach(transaction => {
      const paidAmount = transaction.payments?.reduce((s, p) => s + p.amount, 0) || 0;
      if (paidAmount === 0) return; // Skip transazioni non pagate
      
      transaction.services.forEach(service => {
        if (!serviceStats[service.serviceId]) {
          serviceStats[service.serviceId] = {
            name: service.name,
            hours: 0,
            revenue: 0,
            sessions: 0
          };
        }
        // Calcola la proporzione di questo servizio sul totale
        const servicePercentage = service.total / transaction.total;
        const servicePaid = paidAmount * servicePercentage;
        
        serviceStats[service.serviceId].hours += service.hours;
        serviceStats[service.serviceId].revenue += servicePaid;
        serviceStats[service.serviceId].sessions += 1;
      });
    });

    const topServices = Object.values(serviceStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Artist Performance
    const artistStats = {};
    filteredTransactions.forEach(transaction => {
      if (!artistStats[transaction.artistId]) {
        artistStats[transaction.artistId] = {
          name: transaction.artistName,
          revenue: 0,
          sessions: 0,
          hours: 0
        };
      }
      const paid = transaction.payments?.reduce((s, p) => s + p.amount, 0) || 0;
      artistStats[transaction.artistId].revenue += paid;
      artistStats[transaction.artistId].sessions += 1;
      artistStats[transaction.artistId].hours += transaction.services.reduce((s, srv) => s + srv.hours, 0);
    });

    const topArtists = Object.values(artistStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Monthly Trend
    const monthlyData = {};
    filteredTransactions.forEach(transaction => {
      const date = new Date(transaction.timestamp);
      const monthKey = `${date.getMonth() + 1}/${date.getFullYear()}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          revenue: 0,
          sessions: 0,
          hours: 0
        };
      }
      
      const paid = transaction.payments?.reduce((s, p) => s + p.amount, 0) || 0;
      monthlyData[monthKey].revenue += paid;
      monthlyData[monthKey].sessions += 1;
      monthlyData[monthKey].hours += transaction.services.reduce((s, srv) => s + srv.hours, 0);
    });

    const monthlyTrend = Object.values(monthlyData).sort((a, b) => {
      const [aMonth, aYear] = a.month.split('/').map(Number);
      const [bMonth, bYear] = b.month.split('/').map(Number);
      return aYear - bYear || aMonth - bMonth;
    });

    // Category Distribution (SOLO PAGAMENTI EFFETTIVI)
    const categoryData = {};
    filteredTransactions.forEach(transaction => {
      const paidAmount = transaction.payments?.reduce((s, p) => s + p.amount, 0) || 0;
      if (paidAmount === 0) return;
      
      transaction.services.forEach(service => {
        const serviceData = CONFIG.services[service.serviceId];
        const category = serviceData?.category || 'Altro';
        if (!categoryData[category]) {
          categoryData[category] = 0;
        }
        // Calcola proporzione pagata
        const servicePercentage = service.total / transaction.total;
        const servicePaid = paidAmount * servicePercentage;
        categoryData[category] += servicePaid;
      });
    });

    const categoryDistribution = Object.entries(categoryData).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2))
    }));

    // Booking Stats
    const bookingUtilization = {
      confirmed: filteredBookings.filter(b => b.status === 'confirmed').length,
      completed: filteredBookings.filter(b => b.status === 'completed').length,
      pending: filteredBookings.filter(b => b.status === 'pending').length,
      total: filteredBookings.length
    };

    // Payment Methods
    const paymentMethods = {};
    filteredTransactions.forEach(transaction => {
      transaction.payments?.forEach(payment => {
        if (!paymentMethods[payment.method]) {
          paymentMethods[payment.method] = 0;
        }
        paymentMethods[payment.method] += payment.amount;
      });
    });

    const paymentMethodData = Object.entries(paymentMethods).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: parseFloat(value.toFixed(2))
    }));

    // Averages
    const avgRevenuePerSession = filteredTransactions.length > 0 
      ? totalRevenue / filteredTransactions.length 
      : 0;

    const avgHoursPerSession = filteredTransactions.length > 0
      ? totalHours / filteredTransactions.length
      : 0;

    // Growth Comparison (vs previous period)
    let growthStats = null;
    if (compareMode) {
      const periodLength = endDate - startDate;
      const prevStartDate = new Date(startDate - periodLength);
      const prevEndDate = new Date(startDate);

      const prevTransactions = transactions.filter(t => {
        const date = new Date(t.timestamp);
        return date >= prevStartDate && date < prevEndDate;
      });

      const prevRevenue = prevTransactions.reduce((sum, t) => {
        const paid = t.payments?.reduce((s, p) => s + p.amount, 0) || 0;
        return sum + paid;
      }, 0);

      const revenueGrowth = prevRevenue > 0 
        ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 
        : 0;

      const sessionsGrowth = prevTransactions.length > 0
        ? ((filteredTransactions.length - prevTransactions.length) / prevTransactions.length) * 100
        : 0;

      growthStats = {
        revenueGrowth,
        sessionsGrowth,
        prevRevenue,
        prevSessions: prevTransactions.length
      };
    }

    return {
      totalRevenue,
      pendingRevenue,
      totalHours,
      bookedHours,
      totalSessions: filteredTransactions.length,
      totalBookings: filteredBookings.length,
      topServices,
      topArtists,
      monthlyTrend,
      categoryDistribution,
      bookingUtilization,
      paymentMethodData,
      avgRevenuePerSession,
      avgHoursPerSession,
      growthStats,
      cassaRevenue,
      cassaTransactionsCount
    };
  };

  const analytics = getAnalytics();
  const COLORS = ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444'];

  // 📊 EXPORT FUNCTION
  const exportToCSV = () => {
    const { startDate, endDate } = getDateRange();
    const filteredTransactions = transactions.filter(t => {
      const date = new Date(t.timestamp);
      return date >= startDate && date <= endDate;
    });

    let csv = 'Data,Artista,Servizi,Ore,Totale,Pagato,Stato\n';
    
    filteredTransactions.forEach(t => {
      const paid = t.payments?.reduce((s, p) => s + p.amount, 0) || 0;
      const services = t.services.map(s => s.name).join('; ');
      const hours = t.services.reduce((s, srv) => s + srv.hours, 0);
      const status = paid === 0 ? 'In Attesa' : paid < t.total ? 'Parziale' : 'Pagato';
      
      csv += `${new Date(t.timestamp).toLocaleDateString()},${t.artistName},"${services}",${hours},${t.total},${paid},${status}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${getPeriodLabel()}.csv`;
    a.click();
  };

  return (
    <div style={{ 
      fontFamily: 'Inter, sans-serif',
      minHeight: '100vh',
      background: '#F9FAFB',
      padding: '20px'
    }}>
      <style>{styles}</style>

      {/* 🔐 HEADER CON LOGOUT */}
      <Header title="📊 Analytics Dashboard" />

      <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '20px' }}>
        {/* 🎨 MODULE HEADER */}
        <div style={{ 
          background: CONFIG.brand.gradient,
          color: 'white',
          padding: '20px',
          borderRadius: '16px',
          marginBottom: '30px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <h2 style={{ margin: '0 0 5px 0', fontSize: '1.5rem', fontWeight: 700 }}>
                Report Avanzati & Business Intelligence
              </h2>
            </div>
            <button
              onClick={exportToCSV}
              style={{
                padding: '12px 24px',
                background: 'white',
                color: CONFIG.brand.colors.primary,
                fontSize: '1rem'
              }}
            >
              📊 Esporta CSV
            </button>
          </div>
        </div>

        {/* 🎛️ FILTERS */}
        <div style={{ 
          background: 'white',
          padding: '25px',
          borderRadius: '12px',
          marginBottom: '30px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#1F2937' }}>
              Periodo: <span style={{ color: CONFIG.brand.colors.primary }}>{getPeriodLabel()}</span>
            </h3>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={compareMode}
                onChange={(e) => setCompareMode(e.target.checked)}
              />
              <span style={{ fontWeight: 600, color: '#666' }}>Confronta con periodo precedente</span>
            </label>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {['week', 'month', 'quarter', 'year', 'custom'].map(range => (
              <button
                key={range}
                className={`filter-btn ${dateRange === range ? 'active' : ''}`}
                onClick={() => setDateRange(range)}
              >
                {range === 'week' ? '7 giorni' :
                 range === 'month' ? '1 mese' :
                 range === 'quarter' ? '3 mesi' :
                 range === 'year' ? '1 anno' : 'Personalizzato'}
              </button>
            ))}
          </div>

          {dateRange === 'custom' && (
            <div style={{ 
              display: 'flex', 
              gap: '15px', 
              padding: '20px',
              background: '#F9FAFB',
              borderRadius: '8px',
              flexWrap: 'wrap'
            }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#666' }}>
                  Data Inizio
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                />
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#666' }}>
                  Data Fine
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* 📊 KEY METRICS */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
          gap: '20px', 
          marginBottom: '30px' 
        }}>
          <div className="stat-card">
            <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '8px', fontWeight: 600 }}>
              FATTURATO TOTALE
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: CONFIG.brand.colors.primary, marginBottom: '5px' }}>
              €{analytics.totalRevenue.toFixed(0)}
            </div>
            {analytics.growthStats && (
              <div className={analytics.growthStats.revenueGrowth >= 0 ? 'trend-up' : 'trend-down'}>
                {analytics.growthStats.revenueGrowth >= 0 ? '↑' : '↓'} {Math.abs(analytics.growthStats.revenueGrowth).toFixed(1)}%
              </div>
            )}
          </div>

          <div className="stat-card">
            <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '8px', fontWeight: 600 }}>
              DA INCASSARE
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: CONFIG.brand.colors.warning, marginBottom: '5px' }}>
              €{analytics.pendingRevenue.toFixed(0)}
            </div>
          </div>

          <div className="stat-card">
            <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '8px', fontWeight: 600 }}>
              SESSIONI TOTALI
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: CONFIG.brand.colors.secondary, marginBottom: '5px' }}>
              {analytics.totalSessions}
            </div>
            {analytics.growthStats && (
              <div className={analytics.growthStats.sessionsGrowth >= 0 ? 'trend-up' : 'trend-down'}>
                {analytics.growthStats.sessionsGrowth >= 0 ? '↑' : '↓'} {Math.abs(analytics.growthStats.sessionsGrowth).toFixed(1)}%
              </div>
            )}
          </div>

          <div className="stat-card">
            <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '8px', fontWeight: 600 }}>
              ORE LAVORATE
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: CONFIG.brand.colors.info, marginBottom: '5px' }}>
              {analytics.totalHours.toFixed(0)}h
            </div>
          </div>

          <div className="stat-card">
            <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '8px', fontWeight: 600 }}>
              MEDIA PER SESSIONE
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: CONFIG.brand.colors.primary, marginBottom: '5px' }}>
              €{analytics.avgRevenuePerSession.toFixed(0)}
            </div>
          </div>

          <div className="stat-card">
            <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '8px', fontWeight: 600 }}>
              PRENOTAZIONI
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: CONFIG.brand.colors.secondary, marginBottom: '5px' }}>
              {analytics.totalBookings}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#666' }}>
              {analytics.bookedHours.toFixed(0)}h prenotate
            </div>
          </div>

          <div className="stat-card">
  <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '8px', fontWeight: 600 }}>
    VENDITE CASSA
  </div>
  <div style={{ fontSize: '2.2rem', fontWeight: 700, color: '#EC4899' }}>
    €{analytics.cassaRevenue.toFixed(0)}
  </div>
  <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '8px' }}>
    {analytics.cassaTransactionsCount} vendite
  </div>
</div>

          <div className="stat-card" style={{ background: CONFIG.brand.gradient, color: 'white' }}>
  <div style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '8px', fontWeight: 600 }}>
    INCASSO TOTALE
  </div>
  <div style={{ fontSize: '2.2rem', fontWeight: 700 }}>
    €{(analytics.totalRevenue + analytics.cassaRevenue).toFixed(0)}
  </div>
  <div style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '8px' }}>
    Studio + Cassa
  </div>
</div>
        </div>

        {/* 📈 CHARTS ROW 1 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '25px', marginBottom: '25px' }}>
          {/* Monthly Trend */}
          {analytics.monthlyTrend.length > 0 && (
            <div className="chart-card">
              <h3 style={{ margin: '0 0 20px 0', fontSize: '1.3rem', color: '#1F2937' }}>
                📊 Trend Temporale - Incassi Effettivi
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="revenue" stroke={CONFIG.brand.colors.primary} name="Incassato €" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="sessions" stroke={CONFIG.brand.colors.secondary} name="Sessioni" strokeWidth={2} />
                  <Line yAxisId="left" type="monotone" dataKey="hours" stroke={CONFIG.brand.colors.info} name="Ore" strokeWidth={2} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Top Services */}
          {analytics.topServices.length > 0 && (
            <div className="chart-card">
              <h3 style={{ margin: '0 0 20px 0', fontSize: '1.3rem', color: '#1F2937' }}>
                🎵 Servizi Più Redditizi - Incassi Effettivi
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.topServices}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-20} textAnchor="end" height={80} style={{ fontSize: '0.75rem' }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill={CONFIG.brand.colors.primary} name="Incassato €" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* 📈 CHARTS ROW 2 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '25px', marginBottom: '25px' }}>
          {/* Category Distribution */}
          {analytics.categoryDistribution.length > 0 && (
            <div className="chart-card">
              <h3 style={{ margin: '0 0 20px 0', fontSize: '1.3rem', color: '#1F2937' }}>
                🎯 Incassi per Categoria
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.categoryDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => `${name}: €${value.toFixed(0)} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `€${value.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Payment Methods */}
          {analytics.paymentMethodData.length > 0 && (
            <div className="chart-card">
              <h3 style={{ margin: '0 0 20px 0', fontSize: '1.3rem', color: '#1F2937' }}>
                💳 Metodi di Pagamento
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.paymentMethodData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: €${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.paymentMethodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Booking Utilization */}
          <div className="chart-card">
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.3rem', color: '#1F2937' }}>
              📅 Utilizzo Prenotazioni
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Confermate', value: analytics.bookingUtilization.confirmed },
                    { name: 'Completate', value: analytics.bookingUtilization.completed },
                    { name: 'In Attesa', value: analytics.bookingUtilization.pending }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill={CONFIG.brand.colors.info} />
                  <Cell fill={CONFIG.brand.colors.secondary} />
                  <Cell fill={CONFIG.brand.colors.warning} />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 📊 TABLES */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '25px' }}>
          {/* Top Artists */}
          {analytics.topArtists.length > 0 && (
            <div className="chart-card">
              <h3 style={{ margin: '0 0 20px 0', fontSize: '1.3rem', color: '#1F2937' }}>
                ⭐ Top 10 Artisti - Incassi Effettivi
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                      <th style={{ textAlign: 'left', padding: '12px', color: '#666', fontWeight: 600 }}>#</th>
                      <th style={{ textAlign: 'left', padding: '12px', color: '#666', fontWeight: 600 }}>Artista</th>
                      <th style={{ textAlign: 'center', padding: '12px', color: '#666', fontWeight: 600 }}>Sessioni</th>
                      <th style={{ textAlign: 'center', padding: '12px', color: '#666', fontWeight: 600 }}>Ore</th>
                      <th style={{ textAlign: 'right', padding: '12px', color: '#666', fontWeight: 600 }}>Incassato</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.topArtists.map((artist, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #F3F4F6' }}>
                        <td style={{ padding: '12px', fontWeight: 700, color: CONFIG.brand.colors.primary }}>
                          {idx + 1}
                        </td>
                        <td style={{ padding: '12px', color: '#1F2937', fontWeight: 600 }}>
                          {artist.name}
                        </td>
                        <td style={{ textAlign: 'center', padding: '12px', color: '#666' }}>
                          {artist.sessions}
                        </td>
                        <td style={{ textAlign: 'center', padding: '12px', color: '#666' }}>
                          {artist.hours.toFixed(1)}h
                        </td>
                        <td style={{ textAlign: 'right', padding: '12px', fontWeight: 700, color: CONFIG.brand.colors.primary }}>
                          €{artist.revenue.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Service Details */}
          {analytics.topServices.length > 0 && (
            <div className="chart-card">
              <h3 style={{ margin: '0 0 20px 0', fontSize: '1.3rem', color: '#1F2937' }}>
                💰 Dettaglio Servizi - Incassi Effettivi
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                      <th style={{ textAlign: 'left', padding: '12px', color: '#666', fontWeight: 600 }}>Servizio</th>
                      <th style={{ textAlign: 'center', padding: '12px', color: '#666', fontWeight: 600 }}>Sessioni</th>
                      <th style={{ textAlign: 'center', padding: '12px', color: '#666', fontWeight: 600 }}>Ore</th>
                      <th style={{ textAlign: 'right', padding: '12px', color: '#666', fontWeight: 600 }}>Incassato</th>
                      <th style={{ textAlign: 'right', padding: '12px', color: '#666', fontWeight: 600 }}>€/h Medio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.topServices.map((service, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #F3F4F6' }}>
                        <td style={{ padding: '12px', color: '#1F2937', fontWeight: 600 }}>
                          {service.name}
                        </td>
                        <td style={{ textAlign: 'center', padding: '12px', color: '#666' }}>
                          {service.sessions}
                        </td>
                        <td style={{ textAlign: 'center', padding: '12px', color: '#666' }}>
                          {service.hours.toFixed(1)}h
                        </td>
                        <td style={{ textAlign: 'right', padding: '12px', fontWeight: 700, color: CONFIG.brand.colors.secondary }}>
                          €{service.revenue.toFixed(2)}
                        </td>
                        <td style={{ textAlign: 'right', padding: '12px', color: '#666' }}>
                          €{(service.revenue / service.hours).toFixed(0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* 📝 KEY INSIGHTS */}
        <div className="chart-card" style={{ marginTop: '25px' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '1.3rem', color: '#1F2937' }}>
            💡 Insights Chiave
          </h3>
          <div style={{ display: 'grid', gap: '15px' }}>
            <div className="metric-row">
              <span style={{ color: '#666' }}>Incasso Medio per Sessione</span>
              <span style={{ fontWeight: 700, color: CONFIG.brand.colors.primary }}>
                €{analytics.avgRevenuePerSession.toFixed(2)}
              </span>
            </div>
            <div className="metric-row">
              <span style={{ color: '#666' }}>Ore Medie per Sessione</span>
              <span style={{ fontWeight: 700, color: CONFIG.brand.colors.info }}>
                {analytics.avgHoursPerSession.toFixed(1)}h
              </span>
            </div>
            <div className="metric-row">
              <span style={{ color: '#666' }}>Tasso di Utilizzo Studio</span>
              <span style={{ fontWeight: 700, color: CONFIG.brand.colors.secondary }}>
                {analytics.totalHours > 0 ? ((analytics.totalHours / (analytics.totalSessions * 4)) * 100).toFixed(0) : 0}%
              </span>
            </div>
            <div className="metric-row">
              <span style={{ color: '#666' }}>Servizio Più Redditizio</span>
              <span style={{ fontWeight: 700, color: CONFIG.brand.colors.warning }}>
                {analytics.topServices[0]?.name || 'N/A'}
              </span>
            </div>
            <div className="metric-row">
              <span style={{ color: '#666' }}>Cliente Top</span>
              <span style={{ fontWeight: 700, color: CONFIG.brand.colors.primary }}>
                {analytics.topArtists[0]?.name || 'N/A'} (€{analytics.topArtists[0]?.revenue.toFixed(0) || 0})
              </span>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {analytics.totalSessions === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            background: 'white',
            borderRadius: '12px',
            color: '#999',
            marginTop: '30px'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📊</div>
            <p style={{ fontSize: '1.2rem' }}>Nessun dato disponibile per il periodo selezionato</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
