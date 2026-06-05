
// Location: urban-harvest-hub/src/utils/notifications.js
export function sendNotification(title, options) {
  if (Notification.permission === 'granted') {
    new Notification(title, options);
  }
}

export async function requestNotificationPermission() {
  return await Notification.requestPermission();
}