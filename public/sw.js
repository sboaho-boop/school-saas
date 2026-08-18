const CACHE_NAME = 'eduplatform-v1';
const PRECACHE = ['/', '/login', '/dashboard', '/favicon-192.png', '/favicon-512.png', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match('/')))
  );
});

self.addEventListener('push', (event) => {
  let data = { title: 'EDUPLATFORM SOFTWARE SERVICES', message: '', type: '', id: '' };
  try {
    if (event.data) data = event.data.json();
  } catch {}
  const options = {
    body: data.message,
    icon: '/favicon-192.png',
    badge: '/favicon-192.png',
    tag: data.type || 'notification',
    data: { url: data.type === 'task_deadline' ? '/tasks' : '/dashboard', id: data.id },
  };
  event.waitUntil(self.registration.showNotification(data.title || 'EDUPLATFORM SOFTWARE SERVICES', options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/dashboard';
  event.waitUntil(clients.openWindow(urlToOpen));
});
