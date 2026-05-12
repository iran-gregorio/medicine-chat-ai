import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "appTitle": "Medicine Chat AI",
      "homeTitle": "Home",
      "scanTitle": "Scan Prescription",
      "chatTitle": "Chat"
    }
  },
  pt: {
    translation: {
      "appTitle": "Medicine Chat AI",
      "homeTitle": "Início",
      "scanTitle": "Escanear Receita",
      "chatTitle": "Chat"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'pt', // fallback language
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;
