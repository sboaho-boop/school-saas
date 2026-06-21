self.addEventListener('push', (event) => {
  let data = { title: 'EduPlatform', message: '', type: '', id: '' };
  try {
    if (event.data) data = event.data.json();
  } catch {}
  const options = {
    body: data.message,
    icon: '/icon.png',
    badge: '/badge.png',
    tag: data.type || 'notification',
    data: { url: data.type === 'task_deadline' ? '/tasks' : '/dashboard', id: data.id },
  };
  event.waitUntil(self.registration.showNotification(data.title || 'EduPlatform', options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/dashboard';
  event.waitUntil(clients.openWindow(urlToOpen));
});

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(clients.claim()));
