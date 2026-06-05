// Location: urban-harvest-hub/src/libs/react-i18next.js
import { useState, useEffect } from 'react';
import i18n from './i18next.js';

export const initReactI18next = {
  type: '3rdParty',
  init(instance) {
    // Fluent initialization plugin compatibility
  }
};

export function useTranslation() {
  const [lng, setLng] = useState(i18n.language);

  useEffect(() => {
    const handleLngChange = (newLng) => {
      setLng(newLng);
    };
    i18n.on('languageChanged', handleLngChange);
    return () => {
      i18n.off('languageChanged', handleLngChange);
    };
  }, []);

  const t = (key, options) => {
    return i18n.t(key, options);
  };

  return {
    t,
    i18n
  };
}

export function Trans({ i18nKey, children }) {
  const { t } = useTranslation();
  return t(i18nKey) || children;
}

export const I18nextProvider = ({ children }) => {
  return children;
};
