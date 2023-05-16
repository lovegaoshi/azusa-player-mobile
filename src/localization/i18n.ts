// src/localization/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationEN from './en/translation.json';
import translationZHCN from './zhcn/translation.json';

export const resources = {
  zhcn: {
    translation: translationZHCN,
  },
  en: {
    translation: translationEN,
  },
};

i18n.use(initReactI18next).init({
  resources,
  compatibilityJSON: 'v3',
  lng: 'zhcn',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});
