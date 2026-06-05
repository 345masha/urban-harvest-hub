// Location: urban-harvest-hub/src/pages/EventsPage.jsx
import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { eventsAPI, bookingsAPI } from '../services/api';
import { lazy, Suspense } from 'react';
const Modal = lazy(() => import('../components/UI/Modal'));
import CategoryFilter from '../components/Common/CategoryFilter';
import './EventsPage.css';

function EventsPage() {
  const { t } = useLanguage();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Controls & Filters
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [viewMode, setViewMode] = useState('grid'); // grid, calendar, timeline, my-registrations
  
  // User interactions
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorite_events');
    return saved ? JSON.parse(saved) : [];
  });
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  // Registration form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [showRegModal, setShowRegModal] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [regMessage, setRegMessage] = useState('');

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayEvents, setSelectedDayEvents] = useState([]);
  const [selectedDayStr, setSelectedDayStr] = useState('');

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await eventsAPI.getAll(activeCategory, searchTerm);
      setEvents(data);
    } catch (err) {
      console.error('Failed to load events', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMyRegistrations = async () => {
    try {
      const email = localStorage.getItem('user_email') || '';
      if (email) {
        const response = await fetch(`http://localhost:5000/api/bookings/email/${email}`);
        if (response.ok) {
          const bookings = await response.json();
          setMyRegistrations(bookings.filter(b => b.itemType === 'event'));
        } else {
          // Fallback mock check
          const mockBookings = JSON.parse(localStorage.getItem('mock_bookings') || '[]');
          setMyRegistrations(mockBookings.filter(b => b.email === email && b.itemType === 'event'));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadEvents();
    loadMyRegistrations();
  }, [activeCategory, searchTerm]);

  // Handle local sorting
  useEffect(() => {
    let sorted = [...events];
    if (sortBy === 'date') {
      sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortBy === 'spots') {
      sorted.sort((a, b) => b.spots - a.spots);
    } else if (sortBy === 'price') {
      sorted.sort((a, b) => a.price - b.price);
    }
    setFilteredEvents(sorted);
  }, [events, sortBy]);

  const toggleFavorite = (eventId, e) => {
    e.stopPropagation();
    let updated;
    if (favorites.includes(eventId)) {
      updated = favorites.filter(id => id !== eventId);
    } else {
      updated = [...favorites, eventId];
    }
    setFavorites(updated);
    localStorage.setItem('favorite_events', JSON.stringify(updated));
  };

  // Register for event handler
  const handleRegisterClick = (event, e) => {
    if (e) e.stopPropagation();
    setSelectedEvent(event);
    setRegMessage('');
    
    // Auto-fill from localStorage user session if exists
    const loggedInUser = JSON.parse(localStorage.getItem('user_session') || '{}');
    setRegName(loggedInUser.name || '');
    setRegEmail(loggedInUser.email || '');
    
    setShowRegModal(true);
  };

  const submitRegistration = async (e) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim()) {
      setRegMessage(t('validEmail'));
      return;
    }

    setIsRegistering(true);
    try {
      const bookingData = {
        name: regName.trim(),
        email: regEmail.trim(),
        itemType: 'event',
        itemId: selectedEvent.id,
        itemName: selectedEvent.title,
        quantity: 1,
        totalPrice: selectedEvent.price || 0,
        specialRequests: `Registration for community event ${selectedEvent.title}`
      };

      const result = await bookingsAPI.create(bookingData);
      
      if (result) {
        setRegMessage('success');
        // Save user email to query registration history later
        localStorage.setItem('user_email', regEmail.trim());
        
        // Dynamically update slots
        setEvents(prev => prev.map(evt => {
          if (evt.id === selectedEvent.id) {
            return { ...evt, spots: Math.max(0, evt.spots - 1) };
          }
          return evt;
        }));
        
        loadMyRegistrations();
        setTimeout(() => {
          setShowRegModal(false);
          setSelectedEvent(null);
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      setRegMessage(t('errorMessage'));
    } finally {
      setIsRegistering(false);
    }
  };

  const cancelRegistration = async (bookingId) => {
    if (!window.confirm(t('confirmDelete'))) return;
    try {
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        // Find corresponding event to restore spot
        const cancelledBooking = myRegistrations.find(b => b.id === bookingId);
        if (cancelledBooking) {
          setEvents(prev => prev.map(evt => {
            if (evt.id === cancelledBooking.itemId) {
              return { ...evt, spots: evt.spots + 1 };
            }
            return evt;
          }));
        }
      } else {
        // Fallback mock deletion
        let mockBookings = JSON.parse(localStorage.getItem('mock_bookings') || '[]');
        const cancelledBooking = mockBookings.find(b => b.id === bookingId);
        mockBookings = mockBookings.filter(b => b.id !== bookingId);
        localStorage.setItem('mock_bookings', JSON.stringify(mockBookings));
        if (cancelledBooking) {
          setEvents(prev => prev.map(evt => {
            if (evt.id === cancelledBooking.itemId) {
              return { ...evt, spots: evt.spots + 1 };
            }
            return evt;
          }));
        }
      }
      loadMyRegistrations();
    } catch (err) {
      console.error(err);
    }
  };

  // Calendar View Helpers
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handleMonthChange = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const renderCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const calendarDays = [];

    // Empty spots for preceding month days
    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(<div key={`empty-${i}`} className="p-4 border border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/10"></div>);
    }

    // Days in current month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEvents = events.filter(e => e.date === dateStr);
      const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

      calendarDays.push(
        <div
          key={day}
          onClick={() => {
            if (dayEvents.length > 0) {
              setSelectedDayEvents(dayEvents);
              setSelectedDayStr(new Date(year, month, day).toLocaleDateString(undefined, { dateStyle: 'long' }));
            } else {
              setSelectedDayEvents([]);
            }
          }}
          className={`p-3 border border-slate-150 dark:border-slate-800/80 min-h-[90px] relative transition-all duration-200 cursor-pointer ${
            isToday ? 'bg-forest-50/50 dark:bg-forest-900/20 font-bold' : 'hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
          }`}
        >
          <span className={`text-sm ${isToday ? 'text-forest-600 dark:text-sage-400' : 'text-slate-700 dark:text-slate-300'}`}>{day}</span>
          
          <div className="flex flex-col gap-1 mt-1.5 overflow-hidden">
            {dayEvents.slice(0, 2).map(e => (
              <div
                key={e.id}
                className="text-[9px] px-1.5 py-0.5 rounded bg-forest-600 dark:bg-forest-700 text-white font-medium truncate"
                title={e.title}
              >
                {e.title}
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-[8px] text-slate-500 text-center font-bold">
                +{dayEvents.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return calendarDays;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <div className="container mx-auto px-4 py-12">
        {/* Header Block */}
        <header className="mb-10 text-center" role="banner">
          <h1 className="text-4xl md:text-5xl font-extrabold text-forest-800 dark:text-sage-300 mb-3 tracking-tight font-poppins">
            {t('communityEvents')}
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            {t('joinEvents')}
          </p>
        </header>

        {/* View Selection Controls */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div className="flex gap-2 p-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-xl glass-card">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-forest-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-350 hover:bg-slate-200/20 dark:hover:bg-slate-800/20'
              }`}
            >
              📅 Grid View
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'calendar'
                  ? 'bg-forest-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-350 hover:bg-slate-200/20 dark:hover:bg-slate-800/20'
              }`}
            >
              🗓️ Calendar View
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'timeline'
                  ? 'bg-forest-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-350 hover:bg-slate-200/20 dark:hover:bg-slate-800/20'
              }`}
            >
              ⏱️ Timeline View
            </button>
            <button
              onClick={() => setViewMode('my-registrations')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'my-registrations'
                  ? 'bg-forest-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-350 hover:bg-slate-200/20 dark:hover:bg-slate-800/20'
              }`}
            >
              👤 My Registrations ({myRegistrations.length})
            </button>
          </div>

          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 text-xs font-semibold rounded-lg bg-white dark:bg-slate-900 border border-slate-350 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-forest-600 cursor-pointer"
            >
              <option value="date">Sort by Date</option>
              <option value="spots">Spots Available</option>
              <option value="price">Free First</option>
            </select>
          </div>
        </div>

        {/* Filter controls */}
        {viewMode !== 'my-registrations' && (
          <div className="mb-8 space-y-4">
            <div className="flex gap-3">
              <input
                type="search"
                placeholder={`${t('search')}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 focus:outline-none focus:ring-2 focus:ring-forest-600 w-full glass-card text-sm"
              />
            </div>
            <CategoryFilter activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
          </div>
        )}

        {/* Loading Indicator */}
        {loading && viewMode !== 'my-registrations' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-96 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800/80 shadow-md"></div>
            ))}
          </div>
        ) : (
          <div className="animate-slide-up">
            {/* View Mode 1: GRID VIEW */}
            {viewMode === 'grid' && (
              filteredEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredEvents.map(event => (
                    <div
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      className="glass-card bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-white/20 dark:border-slate-850 shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-350 cursor-pointer"
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={event.image}
                          alt={event.title}
                          width="400"
                          height="300"
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase bg-forest-600 text-white shadow-md">
                          {event.category}
                        </span>
                        <button
                          onClick={(e) => toggleFavorite(event.id, e)}
                          className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/80 dark:bg-slate-900/80 flex items-center justify-center border border-white/10 shadow hover:scale-110 transition"
                          title="Bookmark Event"
                        >
                          {favorites.includes(event.id) ? '⭐' : '☆'}
                        </button>
                      </div>

                      <div className="p-6 flex flex-col justify-between h-[calc(100%-12rem)]">
                        <div>
                          <h3 className="text-lg font-bold font-poppins text-slate-900 dark:text-white group-hover:text-forest-600 dark:group-hover:text-sage-300 transition">
                            {event.title}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                            {event.description}
                          </p>

                          <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-655 mt-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                            <div>📅 {event.date}</div>
                            <div>⏰ {event.time}</div>
                            <div className="truncate">📍 {event.location}</div>
                            <div className="font-bold text-forest-750 dark:text-sage-400">👥 {event.spots} {t('spots')}</div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center mt-6 border-t border-slate-100 dark:border-slate-800 pt-4">
                          <span className="text-base font-extrabold text-forest-700 dark:text-sage-300">
                            {event.price === 0 ? t('free') : `$${event.price}`}
                          </span>
                          <button
                            onClick={(e) => handleRegisterClick(event, e)}
                            disabled={event.spots === 0}
                            className="px-4 py-2 text-xs font-bold bg-forest-600 hover:bg-forest-700 text-white rounded-lg transition disabled:opacity-50"
                          >
                            {event.spots === 0 ? 'Fully Booked' : t('registerNow')}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white/40 dark:bg-slate-900/40 rounded-2xl glass-card">
                  <p className="text-slate-500 dark:text-slate-400 font-semibold">{t('noResults')}</p>
                </div>
              )
            )}

            {/* View Mode 2: CALENDAR VIEW */}
            {viewMode === 'calendar' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Month grid */}
                <div className="lg:col-span-2 glass-card bg-white/70 dark:bg-slate-900/70 p-6 rounded-2xl border border-white/20 dark:border-slate-850">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold font-poppins text-forest-800 dark:text-sage-300 uppercase tracking-wider">
                      {currentDate.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
                    </h3>
                    <div className="flex gap-2">
                      <button onClick={() => handleMonthChange(-1)} className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300">◀</button>
                      <button onClick={() => handleMonthChange(1)} className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300">▶</button>
                    </div>
                  </div>

                  {/* Day Names */}
                  <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-400 dark:text-slate-500 mb-2">
                    <div>Sun</div>
                    <div>Mon</div>
                    <div>Tue</div>
                    <div>Wed</div>
                    <div>Thu</div>
                    <div>Fri</div>
                    <div>Sat</div>
                  </div>

                  {/* Grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {renderCalendarDays()}
                  </div>
                </div>

                {/* Day events sidebar details */}
                <div className="lg:col-span-1 glass-card bg-white/70 dark:bg-slate-900/70 p-6 rounded-2xl border border-white/20 dark:border-slate-850 min-h-[300px]">
                  <h3 className="font-bold text-base border-b border-slate-100 dark:border-slate-800 pb-3 mb-4 text-slate-800 dark:text-white">
                    {selectedDayStr ? `Events for ${selectedDayStr}` : 'Select a date with events'}
                  </h3>

                  {selectedDayEvents.length > 0 ? (
                    <div className="flex flex-col gap-4">
                      {selectedDayEvents.map(evt => (
                        <div
                          key={evt.id}
                          onClick={() => setSelectedEvent(evt)}
                          className="p-4 rounded-xl bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/50 hover:bg-slate-200/30 dark:hover:bg-slate-800/70 transition-all duration-300 cursor-pointer"
                        >
                          <h4 className="font-bold text-sm text-forest-750 dark:text-sage-300">{evt.title}</h4>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 my-1">🕐 {evt.time}</p>
                          <p className="text-xs text-slate-600 dark:text-slate-350 line-clamp-2 leading-relaxed">{evt.description}</p>
                          <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-200/20">
                            <span className="text-[10px] bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 font-bold">{evt.category}</span>
                            <span className="text-xs font-extrabold text-forest-700 dark:text-sage-300">
                              {evt.price === 0 ? t('free') : `$${evt.price}`}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-12">
                      No events on selected day. Click on days containing green items to inspect details.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* View Mode 3: TIMELINE VIEW */}
            {viewMode === 'timeline' && (
              filteredEvents.length > 0 ? (
                <div className="max-w-3xl mx-auto relative border-l-2 border-forest-100 dark:border-slate-800 pl-6 space-y-8 py-4">
                  {filteredEvents.map((event, index) => (
                    <div key={event.id} className="relative group animate-fade-in">
                      {/* Timeline dot */}
                      <span className="absolute -left-[33px] top-1.5 h-4.5 w-4.5 rounded-full bg-forest-600 border-4 border-slate-50 dark:border-slate-900 group-hover:scale-125 transition-transform"></span>

                      <div
                        onClick={() => setSelectedEvent(event)}
                        className="glass-card bg-white/70 dark:bg-slate-900/70 p-6 rounded-2xl border border-white/20 dark:border-slate-850 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                          <span className="text-xs font-bold text-forest-700 dark:text-sage-400">
                            {event.date} | {event.time}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-500 w-fit">
                            {event.category}
                          </span>
                        </div>
                        
                        <h3 className="text-base font-bold font-poppins text-slate-900 dark:text-white group-hover:text-forest-600 dark:group-hover:text-sage-300 transition">
                          {event.title}
                        </h3>
                        <p className="text-xs text-slate-650 dark:text-slate-400 mt-2 leading-relaxed">
                          {event.description}
                        </p>
                        
                        <div className="flex justify-between items-center mt-4 border-t border-slate-100 dark:border-slate-800/50 pt-3 text-xs">
                          <span>📍 {event.location} | 👥 {event.spots} spots</span>
                          <span className="font-extrabold text-forest-700 dark:text-sage-300">
                            {event.price === 0 ? t('free') : `$${event.price}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white/40 dark:bg-slate-900/40 rounded-2xl glass-card">
                  <p className="text-slate-500 dark:text-slate-400 font-semibold">{t('noResults')}</p>
                </div>
              )
            )}

            {/* View Mode 4: USER REGISTRATION HISTORY */}
            {viewMode === 'my-registrations' && (
              <div className="max-w-3xl mx-auto glass-card bg-white/70 dark:bg-slate-900/70 p-6 rounded-2xl border border-white/20 dark:border-slate-850">
                <h3 className="font-bold text-lg mb-6 text-slate-800 dark:text-white font-poppins">
                  {t('registeredEvents')}
                </h3>

                {myRegistrations.length > 0 ? (
                  <div className="space-y-4">
                    {myRegistrations.map(reg => (
                      <div
                        key={reg.id}
                        className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-white/50 dark:bg-slate-800/35 border border-slate-200/50 dark:border-slate-800/50"
                      >
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                            {reg.itemName}
                          </h4>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                            Registered Email: {reg.email} | Date Booked: {new Date(reg.created_at).toLocaleDateString()}
                          </p>
                          <span className={`inline-block mt-2 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            reg.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {reg.status}
                          </span>
                        </div>

                        <button
                          onClick={() => cancelRegistration(reg.id)}
                          className="px-3.5 py-1.5 text-xs font-semibold bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition"
                        >
                          {t('cancelRegistration')}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                    <p className="font-medium">You haven't registered for any community events yet.</p>
                    <p className="text-[11px] mt-1 text-slate-450">Register for events by clicking "Register Now" on any event details page.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* EVENT DETAILED INFO MODAL */}
      {selectedEvent && !showRegModal && (
        <Suspense fallback={null}>
          <Modal
            title={selectedEvent.title}
            onClose={() => setSelectedEvent(null)}
          >
            <div className="space-y-6 text-slate-800 dark:text-slate-100">
              <div className="relative h-60 rounded-xl overflow-hidden">
                <img src={selectedEvent.image} alt={selectedEvent.title} width="800" height="600" loading="lazy" className="w-full h-full object-cover" />
              </div>

              <div className="flex flex-wrap gap-2 items-center">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-forest-100 dark:bg-forest-900/50 text-forest-800 dark:text-forest-200">
                  {selectedEvent.category}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-slate-200 dark:bg-slate-800 text-slate-500">
                  {selectedEvent.price === 0 ? t('free') : `$${selectedEvent.price}`}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-sm text-slate-400 uppercase tracking-wider mb-1">
                  Description
                </h4>
                <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-350">
                  {selectedEvent.description}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-sm text-slate-400 uppercase tracking-wider mb-1">
                  Details & Logistics
                </h4>
                <div className="grid grid-cols-2 gap-4 text-xs bg-slate-100/50 dark:bg-slate-800/30 p-4 rounded-xl">
                  <div>📅 <strong>{t('date')}:</strong> {selectedEvent.date}</div>
                  <div>⏰ <strong>{t('time')}:</strong> {selectedEvent.time}</div>
                  <div>📍 <strong>{t('location')}:</strong> {selectedEvent.location}</div>
                  <div>🎯 <strong>{t('organizer')}:</strong> {selectedEvent.organizer}</div>
                  <div>👥 <strong>Capacity:</strong> {selectedEvent.spots} available spots</div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-sm text-slate-400 uppercase tracking-wider mb-1">
                  Full Plan
                </h4>
                <p className="text-xs leading-relaxed text-slate-655 dark:text-slate-400">
                  {selectedEvent.fullDescription || selectedEvent.description}
                </p>
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition text-xs"
                >
                  {t('close')}
                </button>
                <button
                  onClick={() => handleRegisterClick(selectedEvent)}
                  disabled={selectedEvent.spots === 0}
                  className="flex-1 py-2.5 rounded-xl bg-forest-600 hover:bg-forest-700 text-white font-bold transition text-xs disabled:opacity-50"
                >
                  {selectedEvent.spots === 0 ? 'Fully Booked' : t('registerNow')}
                </button>
              </div>
            </div>
          </Modal>
        </Suspense>
      )}

      {/* REGISTRATION BOOKING MODAL */}
      {showRegModal && selectedEvent && (
        <Suspense fallback={null}>
          <Modal
            title={`Register for ${selectedEvent.title}`}
            onClose={() => setShowRegModal(false)}
          >
            {regMessage === 'success' ? (
              <div className="text-center py-8">
                <div className="text-5xl text-green-500 mb-3">✓</div>
                <h3 className="font-bold text-lg mb-2">{t('bookingConfirmed')}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('thankYou')} {regName}!
                </p>
              </div>
            ) : (
              <form onSubmit={submitRegistration} className="space-y-4">
                {regMessage && regMessage !== 'success' && (
                  <div className="p-3 text-xs bg-red-50 text-red-500 rounded-lg">{regMessage}</div>
                )}

                <div>
                  <label className="block text-xs font-bold mb-1.5 uppercase text-slate-500">{t('name')} *</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-3 py-2 rounded-lg border border-slate-350 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-forest-600 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5 uppercase text-slate-500">{t('email')} *</label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full px-3 py-2 rounded-lg border border-slate-350 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-forest-600 text-sm"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowRegModal(false)}
                    className="flex-1 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 font-bold transition text-xs"
                  >
                    {t('back')}
                  </button>
                  <button
                    type="submit"
                    disabled={isRegistering}
                    className="flex-1 py-2 rounded-lg bg-forest-600 hover:bg-forest-700 text-white font-bold transition text-xs"
                  >
                    {isRegistering ? t('loading') : t('confirmSubscription')}
                  </button>
                </div>
              </form>
            )}
          </Modal>
        </Suspense>
      )}
    </div>
  );
}

export default EventsPage;