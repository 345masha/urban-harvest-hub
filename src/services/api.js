// Location: urban-harvest-hub/src/services/api.js
import { products as initialProducts, workshops as initialWorkshops, events as initialEvents } from '../data/mockData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Sync local storage state helper for offline mock fallback
const getLocalStorageState = (key, defaultData) => {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(defaultData));
    return defaultData;
  }

  try {
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) {
      localStorage.setItem(key, JSON.stringify(defaultData));
      return defaultData;
    }

    const needsReset = parsed.length !== defaultData.length ||
      parsed.some((item, index) => {
        const defaultItem = defaultData[index];
        return !defaultItem || item.id !== defaultItem.id || item.image !== defaultItem.image;
      });

    if (needsReset) {
      localStorage.setItem(key, JSON.stringify(defaultData));
      return defaultData;
    }

    return parsed;
  } catch (error) {
    console.warn(`Failed to parse localStorage key ${key}, resetting to default data.`, error);
    localStorage.setItem(key, JSON.stringify(defaultData));
    return defaultData;
  }
};

const setLocalStorageState = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Seed local storage mock states
let mockProducts = getLocalStorageState('mock_products', initialProducts);
let mockWorkshops = getLocalStorageState('mock_workshops', initialWorkshops);
let mockEvents = getLocalStorageState('mock_events', initialEvents);
let mockBookings = getLocalStorageState('mock_bookings', []);
let mockUsers = getLocalStorageState('mock_users', [
  { id: 1, name: 'Admin User', email: 'admin@urbanharvest.com', role: 'admin', created_at: new Date().toISOString() },
  { id: 2, name: 'Regular User', email: 'user@urbanharvest.com', role: 'user', created_at: new Date().toISOString() }
]);
let mockReviews = getLocalStorageState('mock_reviews', []);
let mockHistory = getLocalStorageState('mock_history', []);
let mockSubscriptions = getLocalStorageState('mock_subscriptions', []);

// Safe fetch wrapper with automated local mock fallbacks
const safeFetch = async (url, options = {}, mockFallback) => {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.warn(`API call failed: ${url}. Triggering local offline fallback.`, error.message);
    return mockFallback();
  }
};

export const productsAPI = {
  getAll: (category = 'all', search = '') => {
    return safeFetch(
      `${API_BASE_URL}/products?category=${category}&search=${search}`,
      {},
      () => {
        let filtered = [...mockProducts];
        if (category && category !== 'all') {
          filtered = filtered.filter(p => p.category === category);
        }
        if (search) {
          filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.description.toLowerCase().includes(search.toLowerCase())
          );
        }
        return filtered;
      }
    );
  },
  getById: (id) => {
    return safeFetch(
      `${API_BASE_URL}/products/${id}`,
      {},
      () => mockProducts.find(p => p.id === Number(id)) || null
    );
  },
  create: (data) => {
    return safeFetch(
      `${API_BASE_URL}/products`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => {
        const newProduct = {
          ...data,
          id: Date.now(),
          rating: 4.5,
          reviews: 0,
          created_at: new Date().toISOString()
        };
        mockProducts = [newProduct, ...mockProducts];
        setLocalStorageState('mock_products', mockProducts);
        return newProduct;
      }
    );
  },
  update: (id, data) => {
    return safeFetch(
      `${API_BASE_URL}/products/${id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => {
        mockProducts = mockProducts.map(p => p.id === Number(id) ? { ...p, ...data } : p);
        setLocalStorageState('mock_products', mockProducts);
        return mockProducts.find(p => p.id === Number(id));
      }
    );
  },
  delete: (id) => {
    return safeFetch(
      `${API_BASE_URL}/products/${id}`,
      { method: 'DELETE' },
      () => {
        mockProducts = mockProducts.filter(p => p.id !== Number(id));
        setLocalStorageState('mock_products', mockProducts);
        return { message: 'Product deleted successfully' };
      }
    );
  },
  // Reviews
  getReviews: (productId) => {
    return safeFetch(
      `${API_BASE_URL}/products/${productId}/reviews`,
      {},
      () => mockReviews.filter(r => r.product_id === Number(productId))
    );
  },
  createReview: (productId, reviewData) => {
    return safeFetch(
      `${API_BASE_URL}/products/${productId}/reviews`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData)
      },
      () => {
        const newReview = {
          id: Date.now(),
          product_id: Number(productId),
          user_name: reviewData.user_name || 'Anonymous',
          rating: Number(reviewData.rating) || 5,
          comment: reviewData.comment || '',
          created_at: new Date().toISOString()
        };
        mockReviews = [newReview, ...mockReviews];
        setLocalStorageState('mock_reviews', mockReviews);
        
        // Update product statistics
        mockProducts = mockProducts.map(p => {
          if (p.id === Number(productId)) {
            const currentReviews = p.reviews || 0;
            const currentRating = p.rating || 0;
            const newCount = currentReviews + 1;
            const newRating = ((currentRating * currentReviews) + newReview.rating) / newCount;
            return {
              ...p,
              reviews: newCount,
              rating: Number(newRating.toFixed(1))
            };
          }
          return p;
        });
        setLocalStorageState('mock_products', mockProducts);

        return newReview;
      }
    );
  }
};

export const workshopsAPI = {
  getAll: (category = 'all', search = '') => {
    return safeFetch(
      `${API_BASE_URL}/workshops?category=${category}&search=${search}`,
      {},
      () => {
        let filtered = [...mockWorkshops];
        if (category && category !== 'all') {
          filtered = filtered.filter(w => w.category === category);
        }
        if (search) {
          filtered = filtered.filter(w =>
            w.title.toLowerCase().includes(search.toLowerCase()) ||
            w.description.toLowerCase().includes(search.toLowerCase())
          );
        }
        return filtered;
      }
    );
  },
  getById: (id) => {
    return safeFetch(
      `${API_BASE_URL}/workshops/${id}`,
      {},
      () => mockWorkshops.find(w => w.id === Number(id)) || null
    );
  },
  create: (data) => {
    return safeFetch(
      `${API_BASE_URL}/workshops`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => {
        const newWorkshop = {
          ...data,
          id: Date.now(),
          rating: 4.8,
          created_at: new Date().toISOString()
        };
        mockWorkshops = [newWorkshop, ...mockWorkshops];
        setLocalStorageState('mock_workshops', mockWorkshops);
        return newWorkshop;
      }
    );
  },
  update: (id, data) => {
    return safeFetch(
      `${API_BASE_URL}/workshops/${id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => {
        mockWorkshops = mockWorkshops.map(w => w.id === Number(id) ? { ...w, ...data } : w);
        setLocalStorageState('mock_workshops', mockWorkshops);
        return mockWorkshops.find(w => w.id === Number(id));
      }
    );
  },
  delete: (id) => {
    return safeFetch(
      `${API_BASE_URL}/workshops/${id}`,
      { method: 'DELETE' },
      () => {
        mockWorkshops = mockWorkshops.filter(w => w.id !== Number(id));
        setLocalStorageState('mock_workshops', mockWorkshops);
        return { message: 'Workshop deleted successfully' };
      }
    );
  }
};

export const eventsAPI = {
  getAll: (category = 'all', search = '') => {
    return safeFetch(
      `${API_BASE_URL}/events?category=${category}&search=${search}`,
      {},
      () => {
        let filtered = [...mockEvents];
        if (category && category !== 'all') {
          filtered = filtered.filter(e => e.category === category);
        }
        if (search) {
          filtered = filtered.filter(e =>
            e.title.toLowerCase().includes(search.toLowerCase()) ||
            e.description.toLowerCase().includes(search.toLowerCase())
          );
        }
        return filtered;
      }
    );
  },
  getById: (id) => {
    return safeFetch(
      `${API_BASE_URL}/events/${id}`,
      {},
      () => mockEvents.find(e => e.id === Number(id)) || null
    );
  },
  create: (data) => {
    return safeFetch(
      `${API_BASE_URL}/events`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => {
        const newEvent = {
          ...data,
          id: Date.now(),
          price: Number(data.price) || 0,
          spots: Number(data.spots) || 50,
          created_at: new Date().toISOString()
        };
        mockEvents = [newEvent, ...mockEvents];
        setLocalStorageState('mock_events', mockEvents);
        return newEvent;
      }
    );
  },
  update: (id, data) => {
    return safeFetch(
      `${API_BASE_URL}/events/${id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => {
        mockEvents = mockEvents.map(e => e.id === Number(id) ? { ...e, ...data } : e);
        setLocalStorageState('mock_events', mockEvents);
        return mockEvents.find(e => e.id === Number(id));
      }
    );
  },
  delete: (id) => {
    return safeFetch(
      `${API_BASE_URL}/events/${id}`,
      { method: 'DELETE' },
      () => {
        mockEvents = mockEvents.filter(e => e.id !== Number(id));
        setLocalStorageState('mock_events', mockEvents);
        return { message: 'Event deleted successfully' };
      }
    );
  }
};

export const bookingsAPI = {
  getAll: () => {
    return safeFetch(
      `${API_BASE_URL}/bookings`,
      {},
      () => mockBookings
    );
  },
  create: async (data) => {
    // Check if offline
    if (!navigator.onLine) {
      console.log('Offline detected. Storing booking in IndexedDB queue.');
      // Push to IndexedDB queue and trigger a Service Worker sync register
      try {
        const dbRequest = indexedDB.open('urban-harvest-pwa', 1);
        dbRequest.onsuccess = (e) => {
          const db = e.target.result;
          const tx = db.transaction('pending-bookings', 'readwrite');
          const store = tx.objectStore('pending-bookings');
          store.add({ ...data, id: Date.now() });
        };
        
        // Register sync tag if support is present
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
          const reg = await navigator.serviceWorker.ready;
          await reg.sync.register('sync-bookings');
        }
      } catch (idbErr) {
        console.error('Failed to store in IndexedDB, fallback to localStorage queue', idbErr);
      }

      // Also append to local mock state to display immediately
      const newBooking = {
        ...data,
        id: Date.now(),
        status: 'pending',
        created_at: new Date().toISOString()
      };
      mockBookings = [newBooking, ...mockBookings];
      setLocalStorageState('mock_bookings', mockBookings);
      return newBooking;
    }

    return safeFetch(
      `${API_BASE_URL}/bookings`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => {
        const newBooking = {
          ...data,
          id: Date.now(),
          status: 'pending',
          created_at: new Date().toISOString()
        };
        mockBookings = [newBooking, ...mockBookings];
        setLocalStorageState('mock_bookings', mockBookings);
        return newBooking;
      }
    );
  },
  updateStatus: (id, status) => {
    return safeFetch(
      `${API_BASE_URL}/bookings/${id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      },
      () => {
        mockBookings = mockBookings.map(b => b.id === Number(id) ? { ...b, status } : b);
        setLocalStorageState('mock_bookings', mockBookings);
        return mockBookings.find(b => b.id === Number(id));
      }
    );
  },
  delete: (id) => {
    return safeFetch(
      `${API_BASE_URL}/bookings/${id}`,
      { method: 'DELETE' },
      () => {
        mockBookings = mockBookings.filter(b => b.id !== Number(id));
        setLocalStorageState('mock_bookings', mockBookings);
        return { message: 'Booking deleted successfully' };
      }
    );
  }
};

export const usersAPI = {
  login: (email, password) => {
    return safeFetch(
      `${API_BASE_URL}/users/login`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      },
      () => {
        const matched = mockUsers.find(u => u.email === email && password === 'admin123'); // fallback mock authentication
        if (matched) {
          return { message: 'Login successful', user: matched };
        }
        throw new Error('Invalid email or password');
      }
    );
  },
  getAll: () => {
    return safeFetch(
      `${API_BASE_URL}/users`,
      {},
      () => mockUsers
    );
  },
  create: (data) => {
    return safeFetch(
      `${API_BASE_URL}/users`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => {
        if (mockUsers.some(u => u.email === data.email)) {
          throw new Error('Email is already registered');
        }
        const newUser = {
          ...data,
          id: Date.now(),
          created_at: new Date().toISOString()
        };
        mockUsers = [newUser, ...mockUsers];
        setLocalStorageState('mock_users', mockUsers);
        return newUser;
      }
    );
  },
  update: (id, data) => {
    return safeFetch(
      `${API_BASE_URL}/users/${id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => {
        mockUsers = mockUsers.map(u => u.id === Number(id) ? { ...u, ...data } : u);
        setLocalStorageState('mock_users', mockUsers);
        return mockUsers.find(u => u.id === Number(id));
      }
    );
  },
  delete: (id) => {
    return safeFetch(
      `${API_BASE_URL}/users/${id}`,
      { method: 'DELETE' },
      () => {
        mockUsers = mockUsers.filter(u => u.id !== Number(id));
        setLocalStorageState('mock_users', mockUsers);
        return { message: 'User deleted successfully' };
      }
    );
  }
};

export const notificationsAPI = {
  getHistory: () => {
    return safeFetch(
      `${API_BASE_URL}/notifications/history`,
      {},
      () => mockHistory
    );
  },
  send: (data) => {
    return safeFetch(
      `${API_BASE_URL}/notifications/send`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => {
        const newLog = {
          id: Date.now(),
          title: data.title,
          body: data.body,
          audience: data.audience || 'all',
          status: 'sent',
          created_at: new Date().toISOString()
        };
        mockHistory = [newLog, ...mockHistory];
        setLocalStorageState('mock_history', mockHistory);
        return { message: 'Notification broadcasted', id: newLog.id };
      }
    );
  },
  deleteHistory: (id) => {
    return safeFetch(
      `${API_BASE_URL}/notifications/history/${id}`,
      { method: 'DELETE' },
      () => {
        mockHistory = mockHistory.filter(h => h.id !== Number(id));
        setLocalStorageState('mock_history', mockHistory);
        return { message: 'History record deleted successfully' };
      }
    );
  },
  subscribe: (subscription) => {
    return safeFetch(
      `${API_BASE_URL}/notifications/subscribe`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      },
      () => {
        mockSubscriptions = [...mockSubscriptions.filter(s => s.endpoint !== subscription.endpoint), subscription];
        setLocalStorageState('mock_subscriptions', mockSubscriptions);
        return { message: 'Subscribed successfully' };
      }
    );
  },
  unsubscribe: (endpoint) => {
    return safeFetch(
      `${API_BASE_URL}/notifications/unsubscribe`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint })
      },
      () => {
        mockSubscriptions = mockSubscriptions.filter(s => s.endpoint !== endpoint);
        setLocalStorageState('mock_subscriptions', mockSubscriptions);
        return { message: 'Unsubscribed successfully' };
      }
    );
  }
};