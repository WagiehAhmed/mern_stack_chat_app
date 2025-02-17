// frontend/src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import languageDetector from "i18next-browser-languagedetector"; // detect language from browser settings

import ar from "./locales/ar/translation.json";
import en from "./locales/en/translation.json";

// Initialize i18next
i18n
  .use(languageDetector) // detect browser language
  .use(initReactI18next) // pass i18n to react-i18next
  .init({
    fallbackLng: "en", // Default language
    resources: {
      en: { translation: en },
      ar: { translation: ar },
    },
  });

export default i18n;
