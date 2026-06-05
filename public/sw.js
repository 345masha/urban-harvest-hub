// Urban Harvest Hub Service Worker - Optimized for Performance
const CACHE_VERSION = 'v2-2024';
const CACHE_NAME = `urban-harvest-${CACHE_VERSION}`;
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;
const API_CACHE = `api-${CACHE_VERSION}`;
const IMAGE_CACHE = `images-${CACHE_VERSION}`;

// Files to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Failed to cache some assets:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (![STATIC_CACHE, DYNAMIC_CACHE, API_CACHE].includes(cacheName)) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // API calls - Network first, fallback to cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const responseToCache = response.clone();
            caches.open(API_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) return cachedResponse;
          return new Response(JSON.stringify({ error: 'Offline', offlineSimulated: true }), { 
            status: 503, 
            headers: { 'Content-Type': 'application/json' } 
          });
        })
    );
    return;
  }

  // HTML pages - Network first with cache fallback
  if (request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const responseToCache = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) return cachedResponse;
          return new Response('<h1>Offline Mode</h1><p>Please check your connection.</p>', {
            status: 503,
            headers: { 'Content-Type': 'text/html' }
          });
        })
    );
    return;
  }

  // Static assets (CSS, JS, images) - Cache first with network fallback
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      return cachedResponse || fetch(request).then((response) => {
        if (response.ok) {
          const responseToCache = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      }).catch(() => {
        // Return placeholder for images if offline
        if (request.destination === 'image') {
          return new Response(
            '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="#ddd" width="100" height="100"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="#999">Offline</text></svg>',
            { headers: { 'Content-Type': 'image/svg+xml' } }
          );
        }
        return new Response('', { status: 503, statusText: 'Service Unavailable' });
      });
    })
  );
});

// Background sync for bookings
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-bookings') {
    event.waitUntil(syncBookings());
  }
});

// IndexedDB Helper
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('urban-harvest-pwa', 1);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pending-bookings')) {
        db.createObjectStore('pending-bookings', { keyPath: 'id', autoIncrement: true });
      }
    };
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      resolve({
        getAll: (storeName) => new Promise((res, rej) => {
          const transaction = db.transaction(storeName, 'readonly');
          const store = transaction.objectStore(storeName);
          const getRequest = store.getAll();
          getRequest.onsuccess = () => res(getRequest.result);
          getRequest.onerror = () => rej(getRequest.error);
        }),
        delete: (storeName, id) => new Promise((res, rej) => {
          const transaction = db.transaction(storeName, 'readwrite');
          const store = transaction.objectStore(storeName);
          const deleteRequest = store.delete(id);
          deleteRequest.onsuccess = () => res();
          deleteRequest.onerror = () => rej(deleteRequest.error);
        })
      });
    };
    
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

async function syncBookings() {
  try {
    const db = await openDB();
    const bookings = await db.getAll('pending-bookings');
    
    for (const booking of bookings) {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(booking)
      });
      
      if (response.ok) {
        await db.delete('pending-bookings', booking.id);
      }
    }
  } catch (error) {
    console.error('Error syncing bookings:', error);
  }
}

// Push notification handler with JSON payload parsing
self.addEventListener('push', (event) => {
  let title = 'Urban Harvest Hub';
  let body = 'New update from Urban Harvest Hub';
  let data = {};

  if (event.data) {
    try {
      const jsonPayload = event.data.json();
      title = jsonPayload.title || title;
      body = jsonPayload.body || body;
      data = jsonPayload.data || jsonPayload; // store entire payload or custom data
    } catch (e) {
      body = event.data.text() || body;
    }
  }

  const options = {
    body: body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [100, 50, 100],
    data: data, // used for deep linking
    tag: 'urban-harvest-notification',
    requireInteraction: true
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click handler with deep linking support
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // Extract deep linking URL from notification data
  const redirectPath = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (let client of clientList) {
        if ('focus' in client) {
          // Check if there is an existing window, focus it and redirect
          client.postMessage({ type: 'NAVIGATE', url: redirectPath });
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(redirectPath);
      }
    })
  );
});

// Message handler for communication with the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
