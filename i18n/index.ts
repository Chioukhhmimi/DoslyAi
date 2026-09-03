import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';

import en from './locales/en.json';
import fr from './locales/fr.json';
import ar from './locales/ar.json';

export const RTL_LANGUAGES = ['ar'];

export const SUPPORTED_LANGUAGES = [
  { code: 'fr', label: 'Français', nativeLabel: 'Français' },
  { code: 'en', label: 'English',  nativeLabel: 'English' },
  { code: 'ar', label: 'Arabic',   nativeLabel: 'العربية' },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]['code'];

const deviceLocale = getLocales()[0]?.languageCode ?? 'fr';
const defaultLanguage: LanguageCode =
  SUPPORTED_LANGUAGES.some((l) => l.code === deviceLocale)
    ? (deviceLocale as LanguageCode)
    : 'fr';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
    ar: { translation: ar },
  },
  lng: defaultLanguage,
  fallbackLng: 'fr',
  interpolation: { escapeValue: false },
  compatibilityJSON: 'v4',
});

export default i18n;
