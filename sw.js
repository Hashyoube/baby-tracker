// BabyTrack Service Worker — notifications push tétées
const SW_VERSION = 'babytrack-sw-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));

// Clic sur une notification → ouvre/focus l'app
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) {
        if ('focus' in c) return c.focus();
      }
      return clients.openWindow('./');
    })
  );
});

// Réception d'un message depuis la page principale
self.addEventListener('message', e => {
  if (e.data?.type === 'PING') {
    e.source?.postMessage({ type: 'PONG', version: SW_VERSION });
  }
});
