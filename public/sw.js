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
  let data = { title: 'EDUPLATFORM', message: '', type: '', id: '' };
  try {
    if (event.data) data = event.data.json();
  } catch {}

  const typeRouteMap = {
    student_absent: '/attendance',
    student_late: '/attendance',
    fee_payment_received: '/finance',
    fee_payment_overdue: '/finance',
    result_published: '/marks',
    assignment_posted: '/assignments',
    announcement_created: '/communication',
    event_reminder: '/calendar',
    new_message: '/communication',
    report_card_available: '/reports',
    task_assigned: '/tasks',
    task_completed: '/tasks',
    incident_reported: '/behavior',
    subscription_changed: '/settings',
    low_wallet_balance: '/wallet',
    submission_graded: '/assignments',
    exam_published: '/exams',
    fee_reminder: '/finance',
    task_deadline: '/tasks',
    attendance_alert: '/attendance',
    exam_announcement: '/exams',
  };

  const url = typeRouteMap[data.type] || '/dashboard';

  const options = {
    body: data.message,
    icon: '/favicon-192.png',
    badge: '/favicon-192.png',
    tag: `${data.type}-${data.id || Date.now()}`,
    renotify: true,
    data: { url, id: data.id, type: data.type },
    actions: data.type === 'new_message' ? [{ action: 'reply', title: 'Reply' }] : [],
  };
  event.waitUntil(self.registration.showNotification(data.title || 'EDUPLATFORM', options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'reply') {
    event.waitUntil(clients.openWindow('/communication'));
    return;
  }
  const urlToOpen = event.notification.data?.url || '/dashboard';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(urlToOpen) && 'focus' in client) return client.focus();
      }
      return clients.openWindow(urlToOpen);
    })
  );
});
