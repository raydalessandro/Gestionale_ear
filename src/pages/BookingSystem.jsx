import React, { useState, useEffect } from 'react';
import { STUDIO_CONFIG } from '../config/studio.config';
import Header from '../components/Header';

// 🎨 CONFIGURAZIONE - Vibes Studio (configurazione centralizzata)
const CONFIG = STUDIO_CONFIG;

// 🎨 STILI GLOBALI
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  
  * { box-sizing: border-box; }
  
  .calendar-grid {
    display: grid;
    grid-template-columns: 80px repeat(7, 1fr);
    gap: 1px;
    background: #E5E7EB;
    border: 1px solid #E5E7EB;
    border-radius: 8px;
    overflow: hidden;
  }

  .calendar-header {
    background: white;
    padding: 15px 10px;
    text-align: center;
    font-weight: 600;
    color: #666;
    font-size: 0.9rem;
  }

  .time-slot {
    background: white;
    padding: 10px;
    text-align: center;
    font-size: 0.85rem;
    color: #666;
    font-weight: 500;
  }

  .booking-slot {
    background: white;
    padding: 5px;
    min-height: 60px;
    position: relative;
    cursor: pointer;
    transition: background 0.2s;
  }

  .booking-slot:hover {
    background: #F9FAFB;
  }

  .booking-slot.has-booking {
    cursor: pointer;
  }

  .booking-block {
    background: linear-gradient(135deg, #FCD34D 0%, #FB923C 50%, #F97316 100%);
    color: white;
    padding: 8px;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 600;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    cursor: pointer;
    transition: all 0.2s;
  }

  .booking-block:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  }

  .list-booking-card {
    background: white;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 15px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    border-left: 4px solid;
    transition: all 0.2s;
    cursor: pointer;
  }

  .list-booking-card:hover {
    transform: translateX(5px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }

  input, select, textarea {
    padding: 10px 12px;
    border: 2px solid #E5E7EB;
    border-radius: 8px;
    font-family: inherit;
    font-size: 0.95rem;
    transition: border-color 0.2s;
    width: 100%;
  }
  
  input:focus, select:focus, textarea:focus {
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
  
  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
  }
  
  .modal-content {
    background: white;
    border-radius: 16px;
    padding: 30px;
    max-width: 600px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
  }

  .stat-card {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }

  .view-toggle-btn {
    padding: 10px 20px;
    background: white;
    color: #666;
    border: 2px solid #E5E7EB;
    font-weight: 600;
    transition: all 0.2s;
  }

  .view-toggle-btn.active {
    background: ${CONFIG.brand.colors.primary};
    color: white;
    border-color: ${CONFIG.brand.colors.primary};
  }
`;

const BookingSystem = () => {
  // 📊 STATE
  const [artists, setArtists] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [view, setView] = useState('calendar'); // calendar, list, detail, new
  const [calendarView, setCalendarView] = useState('week'); // week, day
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedRoom, setSelectedRoom] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showNewBookingModal, setShowNewBookingModal] = useState(false);
  const [prefilledSlot, setPrefilledSlot] = useState(null);

  // 📝 NEW BOOKING STATE
  const [newBooking, setNewBooking] = useState({
    artistId: null,
    roomId: CONFIG.rooms[0].id,
    serviceId: Object.keys(CONFIG.services)[0],
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    duration: 2,
    notes: '',
    status: 'confirmed'
  });

  // 🔄 LOAD DATA
  useEffect(() => {
    const loadedArtists = JSON.parse(localStorage.getItem(CONFIG.storageKeys.artists) || '[]');
    const loadedBookings = JSON.parse(localStorage.getItem(CONFIG.storageKeys.bookings) || '[]');
    setArtists(loadedArtists);
    setBookings(loadedBookings);
  }, []);

  // 💾 SAVE DATA
  useEffect(() => {
    localStorage.setItem(CONFIG.storageKeys.bookings, JSON.stringify(bookings));
  }, [bookings]);

  // 📅 DATE HELPERS
  const getWeekDates = (date) => {
    const week = [];
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay() + 1); // Monday
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const formatTime = (hour) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  const formatDateHeader = (date) => {
    const days = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
    return `${days[date.getDay()]} ${date.getDate()}/${date.getMonth() + 1}`;
  };

  const isToday = (date) => {
    const today = new Date();
    return formatDate(date) === formatDate(today);
  };

  // 🧮 BOOKING HELPERS
  const getBookingsForSlot = (date, hour, roomId = null) => {
    const dateStr = formatDate(date);
    const timeStr = formatTime(hour);
    
    return bookings.filter(booking => {
      if (booking.date !== dateStr) return false;
      if (roomId && roomId !== 'all' && booking.roomId !== roomId) return false;
      
      const bookingStart = parseInt(booking.startTime.split(':')[0]);
      const bookingEnd = bookingStart + booking.duration;
      
      return hour >= bookingStart && hour < bookingEnd;
    });
  };

  const isSlotAvailable = (date, hour, roomId, duration, excludeBookingId = null) => {
    const dateStr = formatDate(date);
    
    for (let i = 0; i < duration; i++) {
      const checkHour = hour + i;
      const slotBookings = bookings.filter(booking => {
        if (booking.id === excludeBookingId) return false;
        if (booking.date !== dateStr) return false;
        if (booking.roomId !== roomId) return false;
        
        const bookingStart = parseInt(booking.startTime.split(':')[0]);
        const bookingEnd = bookingStart + booking.duration;
        
        return checkHour >= bookingStart && checkHour < bookingEnd;
      });
      
      if (slotBookings.length > 0) return false;
    }
    
    return true;
  };

  // ➕ ADD BOOKING
  const addBooking = () => {
    if (!newBooking.artistId) {
      alert('Seleziona un artista');
      return;
    }

    const artist = artists.find(a => a.id === newBooking.artistId);
    const room = CONFIG.rooms.find(r => r.id === newBooking.roomId);
    const service = CONFIG.services[newBooking.serviceId];
    const startHour = parseInt(newBooking.startTime.split(':')[0]);

    // Check availability
    if (!isSlotAvailable(new Date(newBooking.date), startHour, newBooking.roomId, newBooking.duration)) {
      alert('Slot non disponibile! C\'è già una prenotazione in conflitto.');
      return;
    }

    const booking = {
      id: Date.now(),
      artistId: newBooking.artistId,
      artistName: artist.artistName,
      roomId: newBooking.roomId,
      roomName: room.name,
      serviceId: newBooking.serviceId,
      serviceName: service.name,
      date: newBooking.date,
      startTime: newBooking.startTime,
      duration: newBooking.duration,
      notes: newBooking.notes,
      status: newBooking.status,
      createdAt: new Date().toISOString()
    };

    setBookings(prev => [...prev, booking]);
    setNewBooking({
      artistId: null,
      roomId: CONFIG.rooms[0].id,
      serviceId: Object.keys(CONFIG.services)[0],
      date: new Date().toISOString().split('T')[0],
      startTime: '10:00',
      duration: 2,
      notes: '',
      status: 'confirmed'
    });
    setShowNewBookingModal(false);
    setPrefilledSlot(null);
  };

  // 🗑️ DELETE BOOKING
  const deleteBooking = (bookingId) => {
    if (window.confirm('Sei sicuro di voler eliminare questa prenotazione?')) {
      setBookings(prev => prev.filter(b => b.id !== bookingId));
      setSelectedBooking(null);
      setView('calendar');
    }
  };

  // ✏️ UPDATE BOOKING STATUS
  const updateBookingStatus = (bookingId, newStatus) => {
    setBookings(prev => prev.map(b => 
      b.id === bookingId ? { ...b, status: newStatus } : b
    ));
    if (selectedBooking && selectedBooking.id === bookingId) {
      setSelectedBooking(prev => ({ ...prev, status: newStatus }));
    }
  };

  // 📊 STATS
  const getStats = () => {
    const today = new Date();
    const todayStr = formatDate(today);
    const weekDates = getWeekDates(today).map(d => formatDate(d));

    return {
      today: bookings.filter(b => b.date === todayStr).length,
      thisWeek: bookings.filter(b => weekDates.includes(b.date)).length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      completed: bookings.filter(b => b.status === 'completed').length
    };
  };

  const stats = getStats();
  const weekDates = calendarView === 'week' ? getWeekDates(selectedDate) : [selectedDate];

  return (
    <div style={{ 
      fontFamily: 'Inter, sans-serif',
      minHeight: '100vh',
      background: '#F9FAFB',
      padding: '20px'
    }}>
      <style>{styles}</style>

      {/* 🔐 HEADER CON LOGOUT */}
      <Header title="📅 Booking System" />

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
                Gestione Calendario & Prenotazioni Sale
              </h2>
            </div>
            {view !== 'detail' && (
              <button
                onClick={() => {
                  setShowNewBookingModal(true);
                  setPrefilledSlot(null);
                }}
                style={{
                  padding: '12px 24px',
                  background: 'white',
                  color: CONFIG.brand.colors.primary,
                  fontSize: '1rem',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                ➕ Nuova Prenotazione
              </button>
            )}
            {view === 'detail' && (
              <button
                onClick={() => {
                  setView('calendar');
                  setSelectedBooking(null);
                }}
                style={{
                  padding: '12px 24px',
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontSize: '1rem',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                ← Indietro
              </button>
            )}
          </div>
        </div>

        {/* 📊 STATS */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '15px', 
          marginBottom: '30px' 
        }}>
          <div className="stat-card">
            <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '8px', fontWeight: 600 }}>
              OGGI
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 700, color: CONFIG.brand.colors.primary }}>
              {stats.today}
            </div>
          </div>
          <div className="stat-card">
            <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '8px', fontWeight: 600 }}>
              QUESTA SETTIMANA
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 700, color: CONFIG.brand.colors.info }}>
              {stats.thisWeek}
            </div>
          </div>
          <div className="stat-card">
            <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '8px', fontWeight: 600 }}>
              CONFERMATE
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 700, color: CONFIG.brand.colors.secondary }}>
              {stats.confirmed}
            </div>
          </div>
          <div className="stat-card">
            <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '8px', fontWeight: 600 }}>
              COMPLETATE
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 700, color: CONFIG.brand.colors.warning }}>
              {stats.completed}
            </div>
          </div>
        </div>

        {/* CALENDAR VIEW */}
        {view === 'calendar' && (
          <>
            {/* Controls */}
            <div style={{ 
              background: 'white',
              padding: '20px',
              borderRadius: '12px',
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '15px'
            }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button
                  onClick={() => {
                    const newDate = new Date(selectedDate);
                    newDate.setDate(newDate.getDate() - 7);
                    setSelectedDate(newDate);
                  }}
                  style={{
                    padding: '10px 15px',
                    background: CONFIG.brand.colors.primary,
                    color: 'white'
                  }}
                >
                  ← Settimana Prec
                </button>
                <button
                  onClick={() => setSelectedDate(new Date())}
                  style={{
                    padding: '10px 20px',
                    background: 'white',
                    color: CONFIG.brand.colors.primary,
                    border: `2px solid ${CONFIG.brand.colors.primary}`
                  }}
                >
                  Oggi
                </button>
                <button
                  onClick={() => {
                    const newDate = new Date(selectedDate);
                    newDate.setDate(newDate.getDate() + 7);
                    setSelectedDate(newDate);
                  }}
                  style={{
                    padding: '10px 15px',
                    background: CONFIG.brand.colors.primary,
                    color: 'white'
                  }}
                >
                  Settimana Succ →
                </button>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <select
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                  style={{ width: 'auto', minWidth: '200px' }}
                >
                  <option value="all">Tutte le Sale</option>
                  {CONFIG.rooms.map(room => (
                    <option key={room.id} value={room.id}>
                      {room.icon} {room.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setView('list')}
                  style={{
                    padding: '10px 20px',
                    background: 'white',
                    color: '#666',
                    border: '2px solid #E5E7EB'
                  }}
                >
                  📋 Vista Lista
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '20px', overflowX: 'auto' }}>
              <div className="calendar-grid">
                {/* Header Row */}
                <div className="calendar-header" style={{ background: '#F9FAFB' }}>Ora</div>
                {weekDates.map(date => (
                  <div 
                    key={formatDate(date)}
                    className="calendar-header"
                    style={{ 
                      background: isToday(date) ? CONFIG.brand.colors.primary : '#F9FAFB',
                      color: isToday(date) ? 'white' : '#666'
                    }}
                  >
                    {formatDateHeader(date)}
                  </div>
                ))}

                {/* Time Slots */}
                {Array.from({ length: CONFIG.workingHours.end - CONFIG.workingHours.start }, (_, i) => {
                  const hour = CONFIG.workingHours.start + i;
                  return (
                    <React.Fragment key={hour}>
                      <div className="time-slot">{formatTime(hour)}</div>
                      {weekDates.map(date => {
                        const slotBookings = getBookingsForSlot(date, hour, selectedRoom !== 'all' ? selectedRoom : null);
                        
                        // Group by room if showing all rooms
                        const bookingsByRoom = {};
                        slotBookings.forEach(booking => {
                          if (!bookingsByRoom[booking.roomId]) {
                            bookingsByRoom[booking.roomId] = [];
                          }
                          bookingsByRoom[booking.roomId].push(booking);
                        });

                        return (
                          <div 
                            key={`${formatDate(date)}-${hour}`}
                            className={`booking-slot ${slotBookings.length > 0 ? 'has-booking' : ''}`}
                            onClick={() => {
                              if (slotBookings.length === 0) {
                                // Empty slot - open booking modal with prefilled data
                                setPrefilledSlot({
                                  date: formatDate(date),
                                  startTime: formatTime(hour),
                                  roomId: selectedRoom !== 'all' ? selectedRoom : CONFIG.rooms[0].id
                                });
                                setNewBooking({
                                  ...newBooking,
                                  date: formatDate(date),
                                  startTime: formatTime(hour),
                                  roomId: selectedRoom !== 'all' ? selectedRoom : CONFIG.rooms[0].id
                                });
                                setShowNewBookingModal(true);
                              }
                            }}
                            style={{
                              position: 'relative'
                            }}
                          >
                            {Object.entries(bookingsByRoom).map(([roomId, roomBookings]) => {
                              const booking = roomBookings[0];
                              const bookingStart = parseInt(booking.startTime.split(':')[0]);
                              const isFirstSlot = hour === bookingStart;
                              
                              if (!isFirstSlot) return null;

                              const room = CONFIG.rooms.find(r => r.id === booking.roomId);
                              const service = CONFIG.services[booking.serviceId];
                              
                              // Calcola l'altezza in base alla durata
                              const slotHeight = 60; // min-height dello slot
                              const blockHeight = (booking.duration * slotHeight) + ((booking.duration - 1) * 1); // +1px per ogni gap

                              return (
                                <div
                                  key={booking.id}
                                  className="booking-block"
                                  style={{
                                    background: service.color,
                                    marginBottom: '4px',
                                    position: 'absolute',
                                    top: '5px',
                                    left: '5px',
                                    right: '5px',
                                    height: `${blockHeight}px`,
                                    zIndex: 10,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center'
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedBooking(booking);
                                    setView('detail');
                                  }}
                                >
                                  <div style={{ fontSize: '0.75rem', opacity: 0.9, marginBottom: '2px' }}>
                                    {room.icon} {selectedRoom === 'all' ? room.name.split(' - ')[1] : ''}
                                  </div>
                                  <div style={{ fontWeight: 700, marginBottom: '2px' }}>
                                    {booking.artistName}
                                  </div>
                                  <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                                    {service.icon} {booking.startTime} - {booking.duration}h
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* LIST VIEW */}
        {view === 'list' && (
          <>
            <div style={{ 
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '15px'
            }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#1F2937' }}>
                Tutte le Prenotazioni
              </h2>
              <button
                onClick={() => setView('calendar')}
                style={{
                  padding: '10px 20px',
                  background: CONFIG.brand.colors.primary,
                  color: 'white'
                }}
              >
                📅 Vista Calendario
              </button>
            </div>

            {bookings.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '60px 20px',
                background: 'white',
                borderRadius: '12px',
                color: '#999'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📅</div>
                <p style={{ fontSize: '1.2rem' }}>Nessuna prenotazione ancora</p>
              </div>
            ) : (
              bookings
                .slice()
                .sort((a, b) => {
                  const dateCompare = a.date.localeCompare(b.date);
                  if (dateCompare !== 0) return dateCompare;
                  return a.startTime.localeCompare(b.startTime);
                })
                .map(booking => {
                  const room = CONFIG.rooms.find(r => r.id === booking.roomId);
                  const service = CONFIG.services[booking.serviceId];
                  const isPast = new Date(booking.date) < new Date(new Date().toDateString());

                  return (
                    <div
                      key={booking.id}
                      className="list-booking-card"
                      style={{ 
                        borderLeftColor: service.color,
                        opacity: isPast ? 0.6 : 1
                      }}
                      onClick={() => {
                        setSelectedBooking(booking);
                        setView('detail');
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
                        <div>
                          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#1F2937', marginBottom: '8px' }}>
                            {booking.artistName}
                          </div>
                          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', fontSize: '0.9rem', color: '#666', marginBottom: '10px' }}>
                            <span>📅 {new Date(booking.date).toLocaleDateString()}</span>
                            <span>🕐 {booking.startTime} ({booking.duration}h)</span>
                            <span>{room.icon} {room.name}</span>
                          </div>
                          <div style={{ 
                            display: 'inline-block',
                            padding: '4px 12px',
                            background: service.color,
                            color: 'white',
                            borderRadius: '12px',
                            fontSize: '0.85rem',
                            fontWeight: 600
                          }}>
                            {service.icon} {service.name}
                          </div>
                        </div>
                        <span style={{
                          padding: '8px 16px',
                          borderRadius: '20px',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          background: booking.status === 'confirmed' ? '#DBEAFE' : 
                                     booking.status === 'completed' ? '#D1FAE5' : '#FEF3C7',
                          color: booking.status === 'confirmed' ? '#1E40AF' : 
                                 booking.status === 'completed' ? '#065F46' : '#92400E'
                        }}>
                          {booking.status === 'confirmed' ? '✓ Confermata' :
                           booking.status === 'completed' ? '✓ Completata' : '⏳ In Attesa'}
                        </span>
                      </div>
                    </div>
                  );
                })
            )}
          </>
        )}

        {/* BOOKING DETAIL VIEW */}
        {view === 'detail' && selectedBooking && (() => {
          const room = CONFIG.rooms.find(r => r.id === selectedBooking.roomId);
          const service = CONFIG.services[selectedBooking.serviceId];

          return (
            <div style={{ background: 'white', borderRadius: '12px', padding: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                  <h2 style={{ margin: '0 0 10px 0', fontSize: '2rem', color: '#1F2937' }}>
                    {selectedBooking.artistName}
                  </h2>
                  <div style={{ fontSize: '1.1rem', color: '#666' }}>
                    {new Date(selectedBooking.date).toLocaleDateString('it-IT', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
                <span style={{
                  padding: '10px 20px',
                  borderRadius: '20px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  background: selectedBooking.status === 'confirmed' ? '#DBEAFE' : 
                             selectedBooking.status === 'completed' ? '#D1FAE5' : '#FEF3C7',
                  color: selectedBooking.status === 'confirmed' ? '#1E40AF' : 
                         selectedBooking.status === 'completed' ? '#065F46' : '#92400E'
                }}>
                  {selectedBooking.status === 'confirmed' ? '✓ Confermata' :
                   selectedBooking.status === 'completed' ? '✓ Completata' : '⏳ In Attesa'}
                </span>
              </div>

              {/* Details */}
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px',
                marginBottom: '30px',
                padding: '20px',
                background: '#F9FAFB',
                borderRadius: '12px'
              }}>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '5px' }}>Orario</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#1F2937' }}>
                    🕐 {selectedBooking.startTime}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '5px' }}>
                    Durata: {selectedBooking.duration}h
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '5px' }}>Sala</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#1F2937' }}>
                    {room.icon} {room.name}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '5px' }}>Servizio</div>
                  <div style={{ 
                    fontSize: '1.1rem', 
                    fontWeight: 700, 
                    color: 'white',
                    background: service.color,
                    padding: '8px 16px',
                    borderRadius: '8px',
                    display: 'inline-block'
                  }}>
                    {service.icon} {service.name}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '5px' }}>Costo Stimato</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: CONFIG.brand.colors.primary }}>
                    €{(service.pricePerHour * selectedBooking.duration).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedBooking.notes && (
                <div style={{ 
                  padding: '20px',
                  background: '#FFFBEB',
                  borderRadius: '12px',
                  borderLeft: `4px solid ${CONFIG.brand.colors.warning}`,
                  marginBottom: '30px'
                }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#92400E', fontSize: '0.9rem', fontWeight: 600 }}>
                    NOTE
                  </h4>
                  <p style={{ margin: 0, color: '#1F2937' }}>
                    {selectedBooking.notes}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {selectedBooking.status === 'pending' && (
                  <button
                    onClick={() => updateBookingStatus(selectedBooking.id, 'confirmed')}
                    style={{
                      padding: '12px 24px',
                      background: CONFIG.brand.colors.secondary,
                      color: 'white',
                      fontSize: '1rem'
                    }}
                  >
                    ✓ Conferma Prenotazione
                  </button>
                )}
                {selectedBooking.status === 'confirmed' && (
                  <button
                    onClick={() => updateBookingStatus(selectedBooking.id, 'completed')}
                    style={{
                      padding: '12px 24px',
                      background: CONFIG.brand.colors.secondary,
                      color: 'white',
                      fontSize: '1rem'
                    }}
                  >
                    ✓ Segna come Completata
                  </button>
                )}
                <button
                  onClick={() => deleteBooking(selectedBooking.id)}
                  style={{
                    padding: '12px 24px',
                    background: CONFIG.brand.colors.danger,
                    color: 'white',
                    fontSize: '1rem'
                  }}
                >
                  🗑️ Elimina Prenotazione
                </button>
              </div>
            </div>
          );
        })()}

        {/* NEW BOOKING MODAL */}
        {showNewBookingModal && (
          <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowNewBookingModal(false)}>
            <div className="modal-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <h2 style={{ margin: 0, fontSize: '1.8rem', color: '#1F2937' }}>
                  ➕ Nuova Prenotazione
                </h2>
                <button
                  onClick={() => {
                    setShowNewBookingModal(false);
                    setPrefilledSlot(null);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.8rem',
                    cursor: 'pointer',
                    color: '#999'
                  }}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: 'grid', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#666' }}>
                    Artista *
                  </label>
                  <select
                    value={newBooking.artistId || ''}
                    onChange={(e) => setNewBooking({ ...newBooking, artistId: parseInt(e.target.value) })}
                  >
                    <option value="">Seleziona artista...</option>
                    {artists.map(artist => (
                      <option key={artist.id} value={artist.id}>
                        {artist.artistName} ({artist.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#666' }}>
                      Data *
                    </label>
                    <input
                      type="date"
                      value={newBooking.date}
                      onChange={(e) => setNewBooking({ ...newBooking, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#666' }}>
                      Ora Inizio *
                    </label>
                    <select
                      value={newBooking.startTime}
                      onChange={(e) => setNewBooking({ ...newBooking, startTime: e.target.value })}
                    >
                      {Array.from({ length: CONFIG.workingHours.end - CONFIG.workingHours.start }, (_, i) => {
                        const hour = CONFIG.workingHours.start + i;
                        return (
                          <option key={hour} value={formatTime(hour)}>
                            {formatTime(hour)}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#666' }}>
                      Sala *
                    </label>
                    <select
                      value={newBooking.roomId}
                      onChange={(e) => setNewBooking({ ...newBooking, roomId: e.target.value })}
                    >
                      {CONFIG.rooms.map(room => (
                        <option key={room.id} value={room.id}>
                          {room.icon} {room.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#666' }}>
                      Durata (ore) *
                    </label>
                    <select
                      value={newBooking.duration}
                      onChange={(e) => setNewBooking({ ...newBooking, duration: parseInt(e.target.value) })}
                    >
                      {[1, 2, 3, 4, 5, 6, 8].map(hours => (
                        <option key={hours} value={hours}>{hours}h</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#666' }}>
                    Servizio *
                  </label>
                  <select
                    value={newBooking.serviceId}
                    onChange={(e) => setNewBooking({ ...newBooking, serviceId: e.target.value })}
                  >
                    {Object.entries(CONFIG.services).map(([id, service]) => (
                      <option key={id} value={id}>
                        {service.icon} {service.name} (€{service.pricePerHour}/h)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#666' }}>
                    Note
                  </label>
                  <textarea
                    value={newBooking.notes}
                    onChange={(e) => setNewBooking({ ...newBooking, notes: e.target.value })}
                    placeholder="Note aggiuntive per la sessione..."
                    rows={3}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                {/* Cost Preview */}
                <div style={{
                  padding: '15px',
                  background: '#F0FDF4',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontWeight: 600, color: '#065F46' }}>Costo Stimato:</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 700, color: CONFIG.brand.colors.secondary }}>
                    €{(CONFIG.services[newBooking.serviceId].pricePerHour * newBooking.duration).toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={addBooking}
                  disabled={!newBooking.artistId}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: CONFIG.brand.colors.primary,
                    color: 'white',
                    fontSize: '1.1rem',
                    marginTop: '10px'
                  }}
                >
                  ✓ Crea Prenotazione
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingSystem;
