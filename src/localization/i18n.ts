// src/localization/i18n.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import translationEN from "./en/translation.json";
import translationZHCN from "./zhcn/translation.json";
import { Settings, I18nManager, Platform } from "react-native";

function getLocale() {
  let currentLocale = "en";

  if (Platform.OS === "ios") {
    const settings = Settings.get("AppleLocale");
    const locale = settings || settings?.[0];
    if (locale) currentLocale = locale;
  } else {
    const locale = I18nManager.getConstants().localeIdentifier;
    if (locale) currentLocale = locale;
  }

  return currentLocale;
}
const deviceLanguage = getLocale();
/**
  Platform.OS === 'ios'
    ? NativeModules.SettingsManager.settings.AppleLocale ||
      NativeModules.SettingsManager.settings.AppleLanguages[0] //iOS 13
    : NativeModules.I18nManager.localeIdentifier;
 */

export const resources = {
  "zh_CN_#Hans": {
    translation: translationZHCN,
  },
  en: {
    translation: translationEN,
  },
};

i18n.use(initReactI18next).init({
  resources,
  compatibilityJSON: "v3",
  lng: deviceLanguage,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});
