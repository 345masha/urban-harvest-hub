import { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { isPushSupported, requestNotificationPermission, subscribeToPush, unsubscribeFromPush, getPushSubscription } from '../../services/pushService';

function PushNotificationBtn() {
  const { t } = useLanguage();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupportedBrowser, setIsSupportedBrowser] = useState(false);

  useEffect(() => {
    if (isPushSupported()) {
      setIsSupportedBrowser(true);
      checkSubscription();
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const subscription = await getPushSubscription();
      setIsSubscribed(!!subscription);
    } catch (err) {
      console.error('Failed to check subscription status:', err);
    }
  };

  const handleToggle = async () => {
    try {
      if (isSubscribed) {
        await unsubscribeFromPush();
        setIsSubscribed(false);
        alert("Unsubscribed from Push Notifications.");
      } else {
        await requestNotificationPermission();
        await subscribeToPush();
        setIsSubscribed(true);
        alert("Subscribed to Push Notifications successfully! 🌱");
      }
    } catch (error) {
      console.error('Failed to toggle push notifications: ', error);
      alert(error.message || 'Failed to update subscription status');
    }
  };

  if (!isSupportedBrowser) {
    return null; // Don't show button if not supported
  }

  return (
    <button
      onClick={handleToggle}
      className={`h-12 w-12 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 border-2 border-white dark:border-slate-800 ${
        isSubscribed 
          ? 'bg-slate-100 dark:bg-slate-800 text-forest-600 dark:text-sage-400' 
          : 'bg-forest-600 hover:bg-forest-700 text-white'
      }`}
      title={isSubscribed ? 'Unsubscribe from Notifications' : 'Subscribe to Notifications'}
    >
      <span className="text-xl">{isSubscribed ? '🔕' : '🔔'}</span>
    </button>
  );
}

export default PushNotificationBtn;

