// Location: urban-harvest-hub/src/context/LanguageContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const { t, i18n } = useTranslation();
  const [language, setLanguageState] = useState(i18n.language || 'en');

  useEffect(() => {
    // Sync state if language is changed elsewhere
    const handleLngChange = (newLng) => {
      setLanguageState(newLng);
    };
    i18n.on?.('languageChanged', handleLngChange);
    return () => {
      i18n.off?.('languageChanged', handleLngChange);
    };
  }, [i18n]);

  const setLanguage = async (lng) => {
    if (i18n.changeLanguage) {
      await i18n.changeLanguage(lng);
      setLanguageState(lng);
      localStorage.setItem('i18nextLng', lng);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
