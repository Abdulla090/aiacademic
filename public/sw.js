const CACHE_NAME = 'ai-academic-hub-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

// Files to cache immediately
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/manifest.json',
  '/favicon.ico',
  // Add other critical assets
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  '/api/',
  'https://generativelanguage.googleapis.com/',
];

// Maximum cache size
const MAX_CACHE_SIZE = 50;
const MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache static assets', error);
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activated');
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Handle different types of requests
  if (isStaticAsset(request.url)) {
    event.respondWith(handleStaticAsset(request));
  } else if (isAPIRequest(request.url)) {
    event.respondWith(handleAPIRequest(request));
  } else if (isNavigationRequest(request)) {
    event.respondWith(handleNavigationRequest(request));
  } else {
    event.respondWith(handleDynamicRequest(request));
  }
});

// Check if request is for static assets
function isStaticAsset(url) {
  return url.includes('/static/') || 
         url.includes('/assets/') || 
         url.endsWith('.js') || 
         url.endsWith('.css') || 
         url.endsWith('.png') || 
         url.endsWith('.jpg') || 
         url.endsWith('.svg') || 
         url.endsWith('.ico') ||
         url.endsWith('.woff') ||
         url.endsWith('.woff2');
}

// Check if request is for API
function isAPIRequest(url) {
  return API_CACHE_PATTERNS.some(pattern => url.includes(pattern));
}

// Check if request is navigation
function isNavigationRequest(request) {
  return request.mode === 'navigate';
}

// Handle static assets with cache-first strategy
async function handleStaticAsset(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('Failed to handle static asset:', error);
    return new Response('Asset not available offline', { status: 503 });
  }
}

// Handle API requests with network-first strategy
async function handleAPIRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok && request.method === 'GET') {
      const cache = await caches.open(DYNAMIC_CACHE);
      const clonedResponse = networkResponse.clone();
      
      // Add timestamp for cache invalidation
      const responseWithTimestamp = new Response(clonedResponse.body, {
        status: clonedResponse.status,
        statusText: clonedResponse.statusText,
        headers: {
          ...Object.fromEntries(clonedResponse.headers.entries()),
          'sw-cache-timestamp': Date.now().toString(),
        },
      });
      
      cache.put(request, responseWithTimestamp);
      limitCacheSize(DYNAMIC_CACHE, MAX_CACHE_SIZE);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache for API request');
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      const cacheTimestamp = cachedResponse.headers.get('sw-cache-timestamp');
      const isExpired = cacheTimestamp && (Date.now() - parseInt(cacheTimestamp)) > MAX_AGE;
      
      if (!isExpired) {
        return cachedResponse;
      }
    }
    
    return new Response(
      JSON.stringify({ 
        error: 'Service unavailable offline',
        message: 'This feature requires an internet connection'
      }), 
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle navigation with SPA fallback
async function handleNavigationRequest(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.log('Navigation failed, serving app shell');
    const cache = await caches.open(STATIC_CACHE);
    const appShell = await cache.match('/');
    return appShell || new Response('App not available offline', { status: 503 });
  }
}

// Handle other dynamic requests
async function handleDynamicRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
      limitCacheSize(DYNAMIC_CACHE, MAX_CACHE_SIZE);
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Content not available offline', { status: 503 });
  }
}

// Limit cache size
async function limitCacheSize(cacheName, maxSize) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > maxSize) {
    const keysToDelete = keys.slice(0, keys.length - maxSize);
    await Promise.all(keysToDelete.map(key => cache.delete(key)));
  }
}

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(handleBackgroundSync());
  }
});

async function handleBackgroundSync() {
  console.log('Service Worker: Background sync triggered');
  // Handle offline actions when back online
  // This would typically sync queued data or retry failed requests
}

// Handle push notifications (if implemented)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: data.tag || 'default',
      requireInteraction: false,
      actions: data.actions || [],
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'AI Academic Hub', options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action) {
    // Handle action buttons
    clients.openWindow(event.action);
  } else {
    // Default action - open app
    event.waitUntil(
      clients.matchAll().then((clientList) => {
        if (clientList.length > 0) {
          return clientList[0].focus();
        }
        return clients.openWindow('/');
      })
    );
  }
});

// Periodic background sync for cache cleanup
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'cache-cleanup') {
    event.waitUntil(cleanupExpiredCache());
  }
});

async function cleanupExpiredCache() {
  const cache = await caches.open(DYNAMIC_CACHE);
  const requests = await cache.keys();
  
  const expiredRequests = await Promise.all(
    requests.map(async (request) => {
      const response = await cache.match(request);
      const timestamp = response?.headers.get('sw-cache-timestamp');
      
      if (timestamp && (Date.now() - parseInt(timestamp)) > MAX_AGE) {
        return request;
      }
      return null;
    })
  );

  const toDelete = expiredRequests.filter(Boolean);
  await Promise.all(toDelete.map(request => cache.delete(request)));
  
  console.log(`Service Worker: Cleaned up ${toDelete.length} expired cache entries`);
}