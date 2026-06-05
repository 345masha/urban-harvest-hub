import { useState, useEffect } from 'react';

export const usePushNotifications = () => {
  const [permission, setPermission] = useState(Notification?.permission || 'default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported('serviceWorker' in navigator && 'PushManager' in window);
  }, []);

  const requestPermission = async () => {
    if (!isSupported) {
      console.warn('Push notifications not supported');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const sendNotification = (title, options = {}) => {
    if (permission === 'granted') {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification(title, {
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            ...options
          });
        });
      } else {
        new Notification(title, options);
      }
    }
  };

  return { permission, isSupported, requestPermission, sendNotification };
};
