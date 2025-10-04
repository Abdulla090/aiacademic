import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import translationEN from './locales/en/translation.json';
import translationKU from './locales/ku/translation.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: import.meta.env.VITE_I18N_DEBUG === 'true' || import.meta.env.MODE !== 'production',
    fallbackLng: 'ku',
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    resources: {
      en: {
        translation: translationEN
      },
      ku: {
        translation: translationKU
      },
      ar: {
        translation: {
            // Add Arabic translations here
        }
      }
    }
  });

// Add RTL direction support
i18n.dir = (lng?: string) => {
  const language = lng || i18n.language;
  // Kurdish and Arabic use RTL
  return ['ku', 'ar', 'ckb', 'ar-SA'].includes(language) ? 'rtl' : 'ltr';
};

export default i18n;