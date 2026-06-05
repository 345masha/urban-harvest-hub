// Location: urban-harvest-hub/src/pages/Admin/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import {
  productsAPI,
  workshopsAPI,
  eventsAPI,
  bookingsAPI,
  usersAPI,
  notificationsAPI
} from '../../services/api';
import Modal from '../../components/UI/Modal';
import { triggerLocalNotification } from '../../utils/localNotification';

function Dashboard() {
  const { t } = useLanguage();
  const { isDark } = useTheme();

  // Authentication
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const saved = localStorage.getItem('admin_token');
    return saved === 'true';
  });
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState('analytics'); // analytics, products, workshops, events, bookings, users, notifications

  // State variables for CRUD tables
  const [products, setProducts] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [notifyHistory, setNotifyHistory] = useState([]);

  // Form modals state
  const [editingItem, setEditingItem] = useState(null); // stores item currently being edited/created
  const [editingType, setEditingType] = useState(''); // products, workshops, events, users
  const [showFormModal, setShowFormModal] = useState(false);
  const [formError, setFormError] = useState('');

  // Notifications state
  const [notifyTitle, setNotifyTitle] = useState('');
  const [notifyBody, setNotifyBody] = useState('');
  const [notifyAudience, setNotifyAudience] = useState('all');

  const [loading, setLoading] = useState(false);

  // Load dashboard data
  const loadDashboardData = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const prodData = await productsAPI.getAll();
      const shopData = await workshopsAPI.getAll();
      const evtData = await eventsAPI.getAll();
      const bookData = await bookingsAPI.getAll();
      const userData = await usersAPI.getAll();
      const notifyLogs = await notificationsAPI.getHistory();

      setProducts(prodData);
      setWorkshops(shopData);
      setEvents(evtData);
      setBookings(bookData);
      setUsers(userData);
      setNotifyHistory(notifyLogs);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [isAuthenticated]);

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const result = await usersAPI.login(loginEmail, loginPassword);
      if (result && result.user && result.user.role === 'admin') {
        localStorage.setItem('admin_token', 'true');
        localStorage.setItem('user_session', JSON.stringify(result.user));
        setIsAuthenticated(true);
      } else {
        setAuthError('Unauthorized access. Admin role required.');
      }
    } catch (err) {
      setAuthError(err.message || 'Invalid email or password');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('user_session');
    setIsAuthenticated(false);
  };

  // CSV Report Export
  const exportToCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'ID,Name,Email,Item Type,Item ID,Item Name,Quantity,Total Price,Status,Created At\n';
    
    bookings.forEach(b => {
      csvContent += `${b.id},"${b.name}","${b.email}",${b.itemType},${b.itemId},"${b.itemName || 'Subscription'}",${b.quantity || 1},${b.totalPrice},${b.status},${b.created_at}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `UrbanHarvestHub_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Trigger browser printing styled for PDF
  const triggerPDFPrint = () => {
    window.print();
  };

  // Bookings state updates
  const handleBookingAction = async (id, status) => {
    try {
      const result = await bookingsAPI.updateStatus(id, status);
      if (result) {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
        
        // Trigger OS notification
        if (status === 'confirmed') {
          triggerLocalNotification('Booking Confirmed! ✅', `The booking for ${result.itemName || 'an item'} has been approved.`);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteBooking = async (id) => {
    if (!window.confirm(t('confirmDelete'))) return;
    try {
      await bookingsAPI.delete(id);
      setBookings(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // User Management
  const changeUserRole = async (id, newRole) => {
    const userToEdit = users.find(u => u.id === id);
    if (!userToEdit) return;
    try {
      const result = await usersAPI.update(id, { ...userToEdit, role: newRole });
      if (result) {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm(t('confirmDelete'))) return;
    try {
      await usersAPI.delete(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Notifications broadcasting
  const sendBroadcast = async (e) => {
    e.preventDefault();
    if (!notifyTitle.trim() || !notifyBody.trim()) return;

    try {
      const result = await notificationsAPI.send({
        title: notifyTitle.trim(),
        body: notifyBody.trim(),
        audience: notifyAudience
      });

      if (result) {
        alert(result.message || 'Notification broadcasted successfully!');
        setNotifyTitle('');
        setNotifyBody('');
        
        // Trigger OS Notification immediately on this device to simulate the broadcast arriving!
        triggerLocalNotification(notifyTitle.trim(), notifyBody.trim());
        
        // Refresh history log
        const logs = await notificationsAPI.getHistory();
        setNotifyHistory(logs);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNotifyLog = async (id) => {
    if (!window.confirm(t('confirmDelete'))) return;
    try {
      await notificationsAPI.deleteHistory(id);
      setNotifyHistory(prev => prev.filter(h => h.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Generic Save for form models (Products, Workshops, Events)
  const openFormModal = (type, item = null) => {
    setEditingType(type);
    setFormError('');
    if (item) {
      setEditingItem(item);
    } else {
      // Default templates
      if (type === 'products') {
        setEditingItem({ name: '', description: '', fullDescription: '', price: 0, category: 'lifestyle', stock: 10, image: '/p1.jpg' });
      } else if (type === 'workshops') {
        setEditingItem({ title: '', description: '', fullDescription: '', price: 0, category: 'education', date: '', time: '', location: '', spots: 20, instructor: '', image: '/p9.webp' });
      } else if (type === 'events') {
        setEditingItem({ title: '', description: '', fullDescription: '', price: 0, category: 'sustainability', date: '', time: '', location: '', spots: 50, organizer: '', image: '/p12.jpg' });
      }
    }
    setShowFormModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    try {
      if (editingType === 'products') {
        if (editingItem.id) {
          await productsAPI.update(editingItem.id, editingItem);
        } else {
          await productsAPI.create(editingItem);
          triggerLocalNotification('New Product Added! 🛍️', `${editingItem.name} has been added to the store.`);
        }
        const data = await productsAPI.getAll();
        setProducts(data);
      } else if (editingType === 'workshops') {
        if (editingItem.id) {
          await workshopsAPI.update(editingItem.id, editingItem);
        } else {
          await workshopsAPI.create(editingItem);
          triggerLocalNotification('New Workshop Scheduled! 🎓', `${editingItem.title} is now open for registration.`);
        }
        const data = await workshopsAPI.getAll();
        setWorkshops(data);
      } else if (editingType === 'events') {
        if (editingItem.id) {
          await eventsAPI.update(editingItem.id, editingItem);
        } else {
          await eventsAPI.create(editingItem);
          triggerLocalNotification('New Event Announced! 📅', `${editingItem.title} is coming up soon.`);
        }
        const data = await eventsAPI.getAll();
        setEvents(data);
      }
      setShowFormModal(false);
    } catch (err) {
      setFormError(err.message || 'Failed to save record details');
    }
  };

  const deleteItem = async (type, id) => {
    if (!window.confirm(t('confirmDelete'))) return;
    try {
      if (type === 'products') {
        await productsAPI.delete(id);
        setProducts(prev => prev.filter(p => p.id !== id));
      } else if (type === 'workshops') {
        await workshopsAPI.delete(id);
        setWorkshops(prev => prev.filter(w => w.id !== id));
      } else if (type === 'events') {
        await eventsAPI.delete(id);
        setEvents(prev => prev.filter(e => e.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Login view layout
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full glass-card bg-white/70 dark:bg-slate-900/70 border border-white/20 dark:border-slate-850 p-8 rounded-3xl shadow-2xl animate-fade-in">
          <div className="text-center mb-6">
            <span className="text-5xl" role="img" aria-label="shield">🛡️</span>
            <h1 className="text-2xl font-bold font-poppins mt-3 text-forest-800 dark:text-sage-300">
              {t('adminLoginTitle')}
            </h1>
            <p className="text-xs text-slate-500 mt-1">Access restricted to authorized supervisors</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {authError && (
              <div className="p-3 text-xs bg-red-50 text-red-500 rounded-lg font-semibold">{authError}</div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{t('adminEmail')}</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@urbanharvest.com"
                className="w-full px-3 py-2 rounded-lg border border-slate-350 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{t('adminPassword')}</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-lg border border-slate-350 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-forest-600 hover:bg-forest-700 text-white font-bold rounded-xl transition text-xs shadow-md uppercase tracking-wider"
            >
              🔑 {t('adminLoginBtn')}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-slate-200/50 text-center text-[10px] text-slate-400">
            <p>Demo Admin: admin@urbanharvest.com / password: admin123</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col md:flex-row transition-colors duration-300">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white/70 dark:bg-slate-900/70 border-r border-slate-200/50 dark:border-slate-850 p-6 flex flex-col justify-between glass-card select-none">
        <div>
          <div className="flex items-center gap-2 mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
            <span className="text-2xl">🌱</span>
            <h2 className="font-bold text-sm tracking-wide text-forest-800 dark:text-sage-300 uppercase font-poppins">Admin Control</h2>
          </div>

          <nav className="space-y-1.5" role="navigation" aria-label="Dashboard views">
            {[
              { id: 'analytics', label: '📊 Analytics' },
              { id: 'products', label: '🛍️ Products CRUD' },
              { id: 'workshops', label: '🎓 Workshops CRUD' },
              { id: 'events', label: '📅 Events CRUD' },
              { id: 'bookings', label: '📋 Bookings' },
              { id: 'users', label: '👥 User Accounts' },
              { id: 'notifications', label: '📢 Notifications' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                  activeTab === tab.id
                    ? 'bg-forest-600 text-white shadow-md'
                    : 'hover:bg-slate-200/35 dark:hover:bg-slate-800/35 text-slate-600 dark:text-slate-350'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="w-full py-2 bg-red-50 dark:bg-red-950/20 text-red-650 hover:bg-red-100 dark:hover:bg-red-950/40 rounded-xl text-xs font-bold transition border border-red-200/50 dark:border-red-900/50 mt-8"
        >
          🚪 {t('navLogout')}
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto" role="main">
        {/* Top bar with quick buttons */}
        <div className="flex justify-between items-center gap-4 mb-8 border-b border-slate-200/50 dark:border-slate-850 pb-5">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-poppins capitalize">
              {activeTab} Management
            </h1>
            <p className="text-xs text-slate-500 mt-1">Supervisory tools & system preferences</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={exportToCSV}
              className="px-3.5 py-2 text-xs font-bold border border-slate-300 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition bg-white dark:bg-slate-900"
            >
              📥 CSV Export
            </button>
            <button
              onClick={triggerPDFPrint}
              className="px-3.5 py-2 text-xs font-bold border border-slate-300 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition bg-white dark:bg-slate-900"
            >
              🖨️ PDF Print
            </button>
          </div>
        </div>

        {/* Tab contents */}
        <div className="animate-slide-up">
          {/* View 1: ANALYTICS WIDGETS */}
          {activeTab === 'analytics' && (
            <div className="space-y-8">
              {/* Stats grids */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { title: t('adminTotalUsers'), val: users.length, icon: '👥', color: 'bg-blue-500' },
                  { title: t('adminTotalProducts'), val: products.length, icon: '🛍️', color: 'bg-green-500' },
                  { title: t('adminTotalEvents'), val: events.length, icon: '📅', color: 'bg-purple-500' },
                  { title: t('adminTotalWorkshops'), val: workshops.length, icon: '🎓', color: 'bg-yellow-500' },
                  { title: t('adminTotalBookings'), val: bookings.length, icon: '📋', color: 'bg-rose-500' }
                ].map((s, idx) => (
                  <div key={idx} className="glass-card bg-white/70 dark:bg-slate-900/70 border border-white/20 dark:border-slate-850 p-5 rounded-2xl shadow">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">{s.title}</span>
                      <span className="text-lg">{s.icon}</span>
                    </div>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">{s.val}</p>
                  </div>
                ))}
              </div>

              {/* Graphical Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Line Chart: Product Sales */}
                <div className="lg:col-span-1 glass-card bg-white/70 dark:bg-slate-900/70 p-5 rounded-2xl border border-white/20 dark:border-slate-850 shadow flex flex-col justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">{t('adminSales')}</h3>
                  <div className="h-44 w-full flex items-end justify-between px-2 pt-4 relative">
                    {/* SVG Line representation */}
                    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <path d="M 0 80 Q 25 50, 50 60 T 100 20" fill="none" stroke="#10b981" strokeWidth="3" />
                      <path d="M 0 80 Q 25 50, 50 60 T 100 20 L 100 100 L 0 100 Z" fill="rgba(16, 185, 129, 0.1)" />
                    </svg>
                    <div className="absolute left-2 top-2 text-[9px] text-slate-400 font-bold">$1,200 max</div>
                    <div className="absolute left-2 bottom-2 text-[9px] text-slate-400 font-bold">$100 min</div>
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-400 font-bold border-t pt-2 mt-4">
                    <span>Jan</span>
                    <span>Mar</span>
                    <span>Jun</span>
                    <span>Sep</span>
                    <span>Dec</span>
                  </div>
                </div>

                {/* Bar Chart: Registrations */}
                <div className="lg:col-span-1 glass-card bg-white/70 dark:bg-slate-900/70 p-5 rounded-2xl border border-white/20 dark:border-slate-850 shadow flex flex-col justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Monthly Registrations</h3>
                  <div className="h-44 w-full flex items-end justify-between px-2 gap-2">
                    {[35, 60, 45, 80, 55, 95, 70].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                        <div className="w-full bg-forest-600 rounded-t" style={{ height: `${h}%` }}></div>
                        <span className="text-[8px] text-slate-400 font-semibold">M{i+1}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pie Chart: Category shares */}
                <div className="lg:col-span-1 glass-card bg-white/70 dark:bg-slate-900/70 p-5 rounded-2xl border border-white/20 dark:border-slate-850 shadow flex flex-col justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">{t('adminParticipation')}</h3>
                  <div className="h-44 flex items-center justify-center relative">
                    <svg className="h-32 w-32" viewBox="0 0 32 32">
                      <circle cx="16" cy="16" r="14" fill="transparent" stroke="#e2e8f0" strokeWidth="4" />
                      <circle cx="16" cy="16" r="14" fill="transparent" stroke="#10b981" strokeWidth="4" strokeDasharray="88" strokeDashoffset="22" strokeLinecap="round" />
                      <circle cx="16" cy="16" r="14" fill="transparent" stroke="#6366f1" strokeWidth="4" strokeDasharray="88" strokeDashoffset="60" strokeLinecap="round" />
                    </svg>
                    <div className="absolute text-center">
                      <p className="text-sm font-black text-slate-800 dark:text-white">74%</p>
                      <p className="text-[9px] text-slate-450 uppercase font-bold">Capacity</p>
                    </div>
                  </div>
                  <div className="flex justify-around text-[9px] text-slate-400 font-bold border-t pt-2 mt-4">
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-forest-500"></span> Workshops</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-indigo-500"></span> Events</span>
                  </div>
                </div>
              </div>

              {/* Recent activity stream logs */}
              <div className="glass-card bg-white/70 dark:bg-slate-900/70 p-6 rounded-2xl border border-white/20 dark:border-slate-850 shadow">
                <h3 className="font-bold text-sm mb-4 font-poppins text-slate-850 dark:text-white">System Activity Logs</h3>
                <div className="space-y-4">
                  {bookings.slice(0, 5).map(b => (
                    <div key={b.id} className="flex justify-between items-center text-xs border-b border-slate-100 dark:border-slate-800/50 pb-2">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">{b.name}</span> booked{' '}
                        <span className="font-bold text-forest-700 dark:text-sage-400">
                          {b.quantity || 1}x {b.itemName || b.itemType}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">{new Date(b.created_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* View 2: PRODUCTS CRUD */}
          {activeTab === 'products' && (
            <div className="glass-card bg-white/70 dark:bg-slate-900/70 p-6 rounded-2xl border border-white/20 dark:border-slate-850 shadow">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-sm font-poppins text-slate-850 dark:text-white">Active Products ({products.length})</h3>
                <button
                  onClick={() => openFormModal('products')}
                  className="px-3.5 py-1.5 bg-forest-600 hover:bg-forest-750 text-white font-bold rounded-lg transition text-xs"
                >
                  ➕ {t('adminAddBtn')}
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">Item</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">Stock</th>
                      <th className="py-3 px-4">Rating</th>
                      <th className="py-3 px-4 text-center">{t('adminActions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id} className="border-b border-slate-100 dark:border-slate-850/50 hover:bg-slate-50/20 dark:hover:bg-slate-800/10">
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{p.name}</td>
                        <td className="py-3 px-4 capitalize">{p.category}</td>
                        <td className="py-3 px-4 font-bold">${p.price}</td>
                        <td className="py-3 px-4">{p.stock} units</td>
                        <td className="py-3 px-4">⭐ {p.rating} ({p.reviews})</td>
                        <td className="py-3 px-4 flex justify-center gap-2">
                          <button
                            onClick={() => openFormModal('products', p)}
                            className="px-2.5 py-1 bg-slate-150 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-350 dark:hover:bg-slate-750 rounded font-semibold transition text-[10px]"
                          >
                            {t('adminEditBtn')}
                          </button>
                          <button
                            onClick={() => deleteItem('products', p.id)}
                            className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-650 rounded font-semibold transition text-[10px]"
                          >
                            {t('adminDeleteBtn')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* View 3: WORKSHOPS CRUD */}
          {activeTab === 'workshops' && (
            <div className="glass-card bg-white/70 dark:bg-slate-900/70 p-6 rounded-2xl border border-white/20 dark:border-slate-850 shadow">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-sm font-poppins text-slate-850 dark:text-white">Active Workshops ({workshops.length})</h3>
                <button
                  onClick={() => openFormModal('workshops')}
                  className="px-3.5 py-1.5 bg-forest-600 hover:bg-forest-750 text-white font-bold rounded-lg transition text-xs"
                >
                  ➕ {t('adminAddBtn')}
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">Title</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Instructor</th>
                      <th className="py-3 px-4">Capacity</th>
                      <th className="py-3 px-4 text-center">{t('adminActions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workshops.map(w => (
                      <tr key={w.id} className="border-b border-slate-100 dark:border-slate-850/50 hover:bg-slate-50/20 dark:hover:bg-slate-800/10">
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{w.title}</td>
                        <td className="py-3 px-4">{w.date}</td>
                        <td className="py-3 px-4 truncate max-w-[120px]">{w.location}</td>
                        <td className="py-3 px-4">{w.instructor}</td>
                        <td className="py-3 px-4 font-bold">{w.spots} spots</td>
                        <td className="py-3 px-4 flex justify-center gap-2">
                          <button
                            onClick={() => openFormModal('workshops', w)}
                            className="px-2.5 py-1 bg-slate-150 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-350 dark:hover:bg-slate-750 rounded font-semibold transition text-[10px]"
                          >
                            {t('adminEditBtn')}
                          </button>
                          <button
                            onClick={() => deleteItem('workshops', w.id)}
                            className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-650 rounded font-semibold transition text-[10px]"
                          >
                            {t('adminDeleteBtn')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* View 4: EVENTS CRUD */}
          {activeTab === 'events' && (
            <div className="glass-card bg-white/70 dark:bg-slate-900/70 p-6 rounded-2xl border border-white/20 dark:border-slate-850 shadow">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-sm font-poppins text-slate-850 dark:text-white">Active Events ({events.length})</h3>
                <button
                  onClick={() => openFormModal('events')}
                  className="px-3.5 py-1.5 bg-forest-600 hover:bg-forest-750 text-white font-bold rounded-lg transition text-xs"
                >
                  ➕ {t('adminAddBtn')}
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">Title</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Spots</th>
                      <th className="py-3 px-4">Organizer</th>
                      <th className="py-3 px-4 text-center">{t('adminActions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map(e => (
                      <tr key={e.id} className="border-b border-slate-100 dark:border-slate-850/50 hover:bg-slate-50/20 dark:hover:bg-slate-800/10">
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{e.title}</td>
                        <td className="py-3 px-4 capitalize">{e.category}</td>
                        <td className="py-3 px-4">{e.date}</td>
                        <td className="py-3 px-4">{e.spots} slots</td>
                        <td className="py-3 px-4">{e.organizer}</td>
                        <td className="py-3 px-4 flex justify-center gap-2">
                          <button
                            onClick={() => openFormModal('events', e)}
                            className="px-2.5 py-1 bg-slate-150 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-350 dark:hover:bg-slate-750 rounded font-semibold transition text-[10px]"
                          >
                            {t('adminEditBtn')}
                          </button>
                          <button
                            onClick={() => deleteItem('events', e.id)}
                            className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-650 rounded font-semibold transition text-[10px]"
                          >
                            {t('adminDeleteBtn')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* View 5: BOOKINGS LIST */}
          {activeTab === 'bookings' && (
            <div className="glass-card bg-white/70 dark:bg-slate-900/70 p-6 rounded-2xl border border-white/20 dark:border-slate-850 shadow">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-sm font-poppins text-slate-850 dark:text-white">Reserved Orders & Bookings ({bookings.length})</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">Client</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Item Name</th>
                      <th className="py-3 px-4">Qty</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-center">{t('adminActions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(b => (
                      <tr key={b.id} className="border-b border-slate-100 dark:border-slate-850/50 hover:bg-slate-50/20 dark:hover:bg-slate-800/10">
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{b.name}</td>
                        <td className="py-3 px-4">{b.email}</td>
                        <td className="py-3 px-4 capitalize">{b.itemType}</td>
                        <td className="py-3 px-4 font-bold">{b.itemName || `Item #${b.itemId}`}</td>
                        <td className="py-3 px-4">{b.quantity || 1}</td>
                        <td className="py-3 px-4 font-black text-forest-750">${b.totalPrice}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            b.status === 'confirmed'
                              ? 'bg-green-100 text-green-800'
                              : b.status === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 flex justify-center gap-2">
                          {b.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleBookingAction(b.id, 'confirmed')}
                                className="px-2 py-1 bg-green-600 text-white font-semibold rounded text-[9px] hover:bg-green-700"
                              >
                                {t('adminApprove')}
                              </button>
                              <button
                                onClick={() => handleBookingAction(b.id, 'cancelled')}
                                className="px-2 py-1 bg-yellow-500 text-white font-semibold rounded text-[9px] hover:bg-yellow-600"
                              >
                                {t('adminReject')}
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => deleteBooking(b.id)}
                            className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-650 rounded text-[9px] font-semibold"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* View 6: USERS MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="glass-card bg-white/70 dark:bg-slate-900/70 p-6 rounded-2xl border border-white/20 dark:border-slate-850 shadow">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-sm font-poppins text-slate-850 dark:text-white">Active Accounts ({users.length})</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Created At</th>
                      <th className="py-3 px-4 text-center">{t('adminActions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className="border-b border-slate-100 dark:border-slate-850/50 hover:bg-slate-50/20 dark:hover:bg-slate-800/10">
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{u.name}</td>
                        <td className="py-3 px-4">{u.email}</td>
                        <td className="py-3 px-4">
                          <select
                            value={u.role}
                            onChange={(e) => changeUserRole(u.id, e.target.value)}
                            className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-350 dark:border-slate-850 text-[10px] font-bold rounded"
                          >
                            <option value="user">{t('adminUserRoleUser')}</option>
                            <option value="admin">{t('adminUserRoleAdmin')}</option>
                          </select>
                        </td>
                        <td className="py-3 px-4">{new Date(u.created_at || Date.now()).toLocaleDateString()}</td>
                        <td className="py-3 px-4 flex justify-center gap-2">
                          <button
                            onClick={() => deleteUser(u.id)}
                            className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-650 rounded font-semibold transition text-[10px]"
                          >
                            {t('adminDeleteBtn')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* View 7: NOTIFICATIONS CENTER */}
          {activeTab === 'notifications' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
              {/* Broadcast Send Panel */}
              <div className="lg:col-span-1 glass-card bg-white/70 dark:bg-slate-900/70 p-6 rounded-2xl border border-white/20 dark:border-slate-850 shadow h-fit">
                <h3 className="font-bold text-sm mb-4 font-poppins text-slate-850 dark:text-white">📢 Broadcast Announcement</h3>
                <form onSubmit={sendBroadcast} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">{t('adminNotifyTitle')}</label>
                    <input
                      type="text"
                      required
                      value={notifyTitle}
                      onChange={(e) => setNotifyTitle(e.target.value)}
                      placeholder="Special Workshop Alert!"
                      className="w-full px-3 py-2 rounded-lg border border-slate-350 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-forest-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">{t('adminNotifyBody')}</label>
                    <textarea
                      required
                      rows={4}
                      value={notifyBody}
                      onChange={(e) => setNotifyBody(e.target.value)}
                      placeholder="We have added Composting 101 to this weekend's schedule. Spot limits apply, book now!"
                      className="w-full px-3 py-2 rounded-lg border border-slate-350 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-forest-600 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">{t('adminAudience')}</label>
                    <select
                      value={notifyAudience}
                      onChange={(e) => setNotifyAudience(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-350 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-forest-600"
                    >
                      <option value="all">All Subscribed Users</option>
                      <option value="users">Standard Users Only</option>
                      <option value="admins">System Admins Only</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-forest-600 hover:bg-forest-750 text-white font-bold rounded-xl transition text-xs shadow"
                  >
                    🚀 {t('adminSendNotification')}
                  </button>
                </form>
              </div>

              {/* History logs */}
              <div className="lg:col-span-2 glass-card bg-white/70 dark:bg-slate-900/70 p-6 rounded-2xl border border-white/20 dark:border-slate-850 shadow">
                <h3 className="font-bold text-sm mb-4 font-poppins text-slate-850 dark:text-white">📜 {t('adminNotifyHistory')}</h3>
                
                {notifyHistory.length > 0 ? (
                  <div className="space-y-4">
                    {notifyHistory.map(log => (
                      <div
                        key={log.id}
                        className="p-4 rounded-xl bg-white/50 dark:bg-slate-800/35 border border-slate-200/50 dark:border-slate-800/50 flex justify-between items-start gap-4"
                      >
                        <div className="text-xs">
                          <h4 className="font-bold text-slate-900 dark:text-white">{log.title}</h4>
                          <p className="text-slate-655 dark:text-slate-400 mt-1 leading-relaxed">{log.body}</p>
                          <div className="flex gap-2 items-center text-[9px] text-slate-400 mt-3 font-bold uppercase tracking-wider">
                            <span>Audience: {log.audience}</span>
                            <span>•</span>
                            <span>Status: {log.status}</span>
                            <span>•</span>
                            <span>{new Date(log.created_at).toLocaleString()}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => deleteNotifyLog(log.id)}
                          className="text-[10px] text-red-500 font-bold hover:scale-105 transition"
                        >
                          {t('adminDeleteBtn')}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-12">
                    No push notifications have been sent yet.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* CRUD MODAL CREATE / UPDATE FORM */}
      {showFormModal && editingItem && (
        <Modal
          title={editingItem.id ? `Edit ${editingType.slice(0, -1)}` : `Create New ${editingType.slice(0, -1)}`}
          onClose={() => setShowFormModal(false)}
        >
          <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
            {formError && (
              <div className="p-3 bg-red-50 text-red-500 rounded-lg">{formError}</div>
            )}

            {/* Product Forms */}
            {editingType === 'products' && (
              <>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-350 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-forest-600"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={editingItem.price}
                      onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-350 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-forest-600"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Stock</label>
                    <input
                      type="number"
                      required
                      value={editingItem.stock}
                      onChange={(e) => setEditingItem({ ...editingItem, stock: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-350 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-forest-600"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Category</label>
                  <select
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-350 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-forest-600"
                  >
                    <option value="food">Food</option>
                    <option value="lifestyle">Lifestyle</option>
                    <option value="gardening">Gardening</option>
                    <option value="education">Education</option>
                    <option value="sustainable_living">Sustainable Living</option>
                    <option value="eco_products">Eco Products</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Short Description</label>
                  <input
                    type="text"
                    required
                    value={editingItem.description}
                    onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-350 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-forest-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Full Description</label>
                  <textarea
                    rows={4}
                    required
                    value={editingItem.fullDescription || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, fullDescription: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-350 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-forest-600 resize-none"
                  />
                </div>
              </>
            )}

            {/* Workshop Forms */}
            {editingType === 'workshops' && (
              <>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Workshop Title</label>
                  <input
                    type="text"
                    required
                    value={editingItem.title}
                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-350 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-forest-600"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Price ($)</label>
                    <input
                      type="number"
                      required
                      value={editingItem.price}
                      onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-350 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-forest-600"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Spots Available</label>
                    <input
                      type="number"
                      required
                      value={editingItem.spots}
                      onChange={(e) => setEditingItem({ ...editingItem, spots: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-350 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-forest-600"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Date</label>
                    <input
                      type="date"
                      required
                      value={editingItem.date}
                      onChange={(e) => setEditingItem({ ...editingItem, date: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-350 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-forest-600"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Time</label>
                    <input
                      type="text"
                      required
                      value={editingItem.time}
                      onChange={(e) => setEditingItem({ ...editingItem, time: e.target.value })}
                      placeholder="10:00 AM - 12:00 PM"
                      className="w-full px-3 py-2 rounded-lg border border-slate-350 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-forest-600"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Location</label>
                    <input
                      type="text"
                      required
                      value={editingItem.location}
                      onChange={(e) => setEditingItem({ ...editingItem, location: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-350 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-forest-600"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Instructor</label>
                    <input
                      type="text"
                      required
                      value={editingItem.instructor}
                      onChange={(e) => setEditingItem({ ...editingItem, instructor: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-350 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-forest-600"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Category</label>
                  <select
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-350 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-forest-600"
                  >
                    <option value="education">Education</option>
                    <option value="food">Food</option>
                    <option value="lifestyle">Lifestyle</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Full Description</label>
                  <textarea
                    rows={3}
                    required
                    value={editingItem.fullDescription || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, fullDescription: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-350 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-forest-600 resize-none"
                  />
                </div>
              </>
            )}

            {/* Event Forms */}
            {editingType === 'events' && (
              <>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Event Title</label>
                  <input
                    type="text"
                    required
                    value={editingItem.title}
                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-350 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-forest-600"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Price (0 for Free)</label>
                    <input
                      type="number"
                      required
                      value={editingItem.price}
                      onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-350 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-forest-600"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Spots Available</label>
                    <input
                      type="number"
                      required
                      value={editingItem.spots}
                      onChange={(e) => setEditingItem({ ...editingItem, spots: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-350 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-forest-600"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Date</label>
                    <input
                      type="date"
                      required
                      value={editingItem.date}
                      onChange={(e) => setEditingItem({ ...editingItem, date: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-350 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-forest-600"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Time</label>
                    <input
                      type="text"
                      required
                      value={editingItem.time}
                      onChange={(e) => setEditingItem({ ...editingItem, time: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-350 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-forest-600"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Location / GPS</label>
                    <input
                      type="text"
                      required
                      value={editingItem.location}
                      onChange={(e) => setEditingItem({ ...editingItem, location: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-350 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-forest-600"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Organizer</label>
                    <input
                      type="text"
                      required
                      value={editingItem.organizer}
                      onChange={(e) => setEditingItem({ ...editingItem, organizer: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-350 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-forest-600"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Category</label>
                  <select
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-350 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-forest-600"
                  >
                    <option value="workshops">Workshops</option>
                    <option value="campaigns">Sustainability Campaigns</option>
                    <option value="gatherings">Community Gatherings</option>
                    <option value="programs">Environmental Awareness Programs</option>
                    <option value="launch">Product Launch Events</option>
                    <option value="educational">Educational Sessions</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Full Description</label>
                  <textarea
                    rows={3}
                    required
                    value={editingItem.fullDescription || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, fullDescription: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-350 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-forest-600 resize-none"
                  />
                </div>
              </>
            )}

            <div className="pt-4 flex gap-3 border-t border-slate-200/50 dark:border-slate-800/50">
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="flex-1 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 font-bold transition text-xs"
              >
                {t('back')}
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-forest-600 hover:bg-forest-750 text-white font-bold rounded-lg transition text-xs"
              >
                Save Record
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default Dashboard;
