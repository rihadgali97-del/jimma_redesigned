self.addEventListener('push', (event) => {
  if (!event.data) return;
  const message = event.data.json();
  event.waitUntil(self.registration.showNotification(message.title || 'Jimma Islamic Council', {
    body: message.body || '',
    icon: '/favicon.ico',
    data: { url: message.url || '/' },
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || '/', self.location.origin).href;
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
    const existing = clients.find((client) => client.url === target);
    if (existing) return existing.focus();
    return self.clients.openWindow(target);
  }));
});
