// Location: src/services/pushService.js

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const isPushSupported = () => {
  return 'serviceWorker' in navigator && 'PushManager' in window;
};

export const requestNotificationPermission = async () => {
  if (!isPushSupported()) {
    throw new Error('Push notifications are not supported by this browser.');
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Notification permission denied.');
  }
  return permission;
};

export const subscribeToPush = async () => {
  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Fetch VAPID public key from backend
    const response = await fetch('http://localhost:5000/api/notifications/vapidPublicKey');
    const { publicKey } = await response.json();
    
    const convertedVapidKey = urlBase64ToUint8Array(publicKey);

    // Subscribe
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey
    });

    // Send subscription to backend
    const res = await fetch('http://localhost:5000/api/notifications/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(subscription)
    });

    if (!res.ok) {
      throw new Error('Failed to save subscription on server');
    }

    console.log('Push Notification Subscribed Successfully');
    return subscription;
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error);
    throw error;
  }
};

export const unsubscribeFromPush = async () => {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      await subscription.unsubscribe();
      
      // Notify backend to remove subscription
      await fetch('http://localhost:5000/api/notifications/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ endpoint: subscription.endpoint })
      });
      
      console.log('Unsubscribed from Push Notifications');
    }
  } catch (error) {
    console.error('Error unsubscribing:', error);
  }
};

export const getPushSubscription = async () => {
  if (!isPushSupported()) return null;
  const registration = await navigator.serviceWorker.ready;
  return await registration.pushManager.getSubscription();
};
