export const triggerLocalNotification = (title, body) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    navigator.serviceWorker.ready.then(registration => {
      registration.showNotification(title, {
        body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        vibrate: [200, 100, 200],
        tag: 'urban-harvest-notification'
      });
    }).catch(err => {
      console.error('Service worker not ready for notification:', err);
    });
  } else if ('Notification' in window && Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        triggerLocalNotification(title, body);
      }
    });
  }
};
