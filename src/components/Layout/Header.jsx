// Location: urban-harvest-hub/src/components/Layout/Header.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { isPushSupported, requestNotificationPermission, subscribeToPush, unsubscribeFromPush, getPushSubscription } from '../../services/pushService';
import './Header.css';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [cartCount, setCartCount] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isPushSupportedBrowser, setIsPushSupportedBrowser] = useState(false);

  // Sync cart count badge
  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('shopping_cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    setCartCount(totalItems);
  };

  useEffect(() => {
    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    
    // Check push support
    if (isPushSupported()) {
      setIsPushSupportedBrowser(true);
      getPushSubscription().then(sub => {
        setIsSubscribed(!!sub);
      });
    }

    return () => window.removeEventListener('storage', updateCartCount);
  }, []);

  const handlePushToggle = async () => {
    try {
      if (isSubscribed) {
        await unsubscribeFromPush();
        setIsSubscribed(false);
        alert("Unsubscribed from Push Notifications.");
      } else {
        await requestNotificationPermission();
        await subscribeToPush();
        setIsSubscribed(true);
        alert("Subscribed to Push Notifications successfully!");
      }
    } catch (err) {
      alert(err.message || "Failed to toggle notifications");
    }
  };

  return (
    <header className="header bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 fixed top-0 left-0 right-0 z-40 transition-colors select-none" role="banner">
      <div className="header-container max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <div className="logo font-poppins font-black text-lg text-forest-750 dark:text-sage-300">
          <Link to="/" aria-label="Urban Harvest Hub home" className="hover:opacity-90 transition">
            🌱 Urban Harvest Hub
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="nav-desktop hidden md:flex items-center gap-5 text-xs font-bold uppercase tracking-wider text-slate-655 dark:text-slate-350" role="navigation" aria-label="Main navigation">
          <Link to="/" className="hover:text-forest-600 dark:hover:text-sage-300 transition">{t('navHome')}</Link>
          <Link to="/products" className="hover:text-forest-600 dark:hover:text-sage-300 transition">{t('navProducts')}</Link>
          <Link to="/workshops" className="hover:text-forest-600 dark:hover:text-sage-300 transition">{t('navWorkshops')}</Link>
          <Link to="/events" className="hover:text-forest-600 dark:hover:text-sage-300 transition">{t('navEvents')}</Link>
          <Link to="/booking" className="hover:text-forest-600 dark:hover:text-sage-300 transition">{t('navBooking')}</Link>
          <Link to="/admin" className="hover:text-forest-600 dark:hover:text-sage-300 transition bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-forest-750 dark:text-sage-350">
            🛡️ {t('navAdmin')}
          </Link>
          
          {/* Cart Status link */}
          {cartCount > 0 && (
            <Link to="/products" className="relative flex items-center text-slate-700 dark:text-slate-300 hover:opacity-80">
              <span>🛒</span>
              <span className="absolute -top-2 -right-2 h-4 w-4 bg-red-500 rounded-full text-[8px] font-bold flex items-center justify-center text-white">
                {cartCount}
              </span>
            </Link>
          )}

          {/* Push Notification Switcher */}
          {isPushSupportedBrowser && (
            <button onClick={handlePushToggle} className={`h-8 w-8 rounded-lg transition flex items-center justify-center border ${isSubscribed ? 'bg-forest-600 text-white border-forest-600' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`} aria-label="Toggle notifications">
              🔔
            </button>
          )}

          {/* Theme switcher */}
          <button onClick={toggleTheme} className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center justify-center border border-slate-200 dark:border-slate-700" aria-label="Toggle theme">
            {isDark ? '☀️' : '🌙'}
          </button>

          {/* Language Switcher */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-slate-800" aria-label="Language selector">
            <button
              type="button"
              className={`px-2 py-1 rounded text-[10px] font-black tracking-wide transition ${
                language === 'en'
                  ? 'bg-forest-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500'
              }`}
              onClick={() => setLanguage('en')}
            >
              🇬🇧 EN
            </button>
            <button
              type="button"
              className={`px-2 py-1 rounded text-[10px] font-black tracking-wide transition ${
                language === 'si'
                  ? 'bg-forest-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500'
              }`}
              onClick={() => setLanguage('si')}
            >
              🇱🇰 සිංහල
            </button>
            <button
              type="button"
              className={`px-2 py-1 rounded text-[10px] font-black tracking-wide transition ${
                language === 'ta'
                  ? 'bg-forest-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500'
              }`}
              onClick={() => setLanguage('ta')}
            >
              🇱🇰 தமிழ்
            </button>
          </div>
        </nav>

        {/* Mobile Navigation Btn */}
        <button 
          className="mobile-menu-btn block md:hidden p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          ☰
        </button>
      </div>

      {/* Mobile collapsable Menu */}
      {isMenuOpen && (
        <nav className="nav-mobile flex md:hidden flex-col gap-3.5 bg-white dark:bg-slate-900 border-b border-slate-200/50 dark:border-slate-800/50 p-6 text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-350" role="navigation" aria-label="Mobile navigation">
          <Link to="/" onClick={() => setIsMenuOpen(false)}>{t('navHome')}</Link> 
          <Link to="/products" onClick={() => setIsMenuOpen(false)}>{t('navProducts')}</Link> 
          <Link to="/workshops" onClick={() => setIsMenuOpen(false)}>{t('navWorkshops')}</Link> 
          <Link to="/events" onClick={() => setIsMenuOpen(false)}>{t('navEvents')}</Link> 
          <Link to="/booking" onClick={() => setIsMenuOpen(false)}>{t('navBooking')}</Link> 
          <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="py-2.5 px-4 bg-slate-100 dark:bg-slate-800 rounded-xl text-center border border-slate-200 dark:border-slate-700 text-forest-750 dark:text-sage-350">
            🛡️ {t('navAdmin')}
          </Link>
          
          <div className="flex items-center justify-between border-t border-slate-150 pt-4 mt-2">
            {/* Theme trigger */}
            <button onClick={toggleTheme} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-xs font-bold rounded-lg border border-slate-250">
              {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>

            {/* Language Selection */}
            <div className="flex items-center gap-1">
              <button onClick={() => { setLanguage('en'); setIsMenuOpen(false); }} className={`px-2 py-1 text-[10px] rounded ${language === 'en' ? 'bg-forest-600 text-white' : 'bg-slate-100'}`}>EN</button>
              <button onClick={() => { setLanguage('si'); setIsMenuOpen(false); }} className={`px-2 py-1 text-[10px] rounded ${language === 'si' ? 'bg-forest-600 text-white' : 'bg-slate-100'}`}>සිංහල</button>
              <button onClick={() => { setLanguage('ta'); setIsMenuOpen(false); }} className={`px-2 py-1 text-[10px] rounded ${language === 'ta' ? 'bg-forest-600 text-white' : 'bg-slate-100'}`}>தமிழ்</button>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}

export default Header;