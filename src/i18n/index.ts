// ============================================================
// i18n/index.ts
// Aura Square — i18next configuration
// Owner: Syauqi Nuzul Abdi
// ============================================================

import i18n                          from 'i18next';
import { initReactI18next }          from 'react-i18next';
import LanguageDetector               from 'i18next-browser-languagedetector';
import en                            from './locales/en.json';
import id                            from './locales/id.json';

export const SUPPORTED_LOCALES = ['en', 'id'] as const;
export type  SupportedLocale   = (typeof SUPPORTED_LOCALES)[number];

// ── Detection order ───────────────────────────────────────────
// 1. Zustand uiStore (already-persisted user preference) — set via changeLanguage()
// 2. Browser navigator.language
// 3. Fallback to 'id' (Indonesian — primary market)

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      id: { translation: id },
    },

    fallbackLng: 'id',
    supportedLngs: SUPPORTED_LOCALES,

    detection: {
      order:  ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'aura-ui-prefs-locale',
    },

    interpolation: {
      escapeValue: false, // React already handles XSS
    },

    // In development, show keys for untranslated strings
    debug: import.meta.env.DEV,

    // Namespace
    defaultNS: 'translation',
    ns:        ['translation'],
  });

export default i18n;

// ── Programmatic language switch ──────────────────────────────
// Called by useTheme hook and Settings page
export function changeLocale(locale: SupportedLocale): void {
  void i18n.changeLanguage(locale);
  // uiStore.setLocale is called by the caller (avoids circular dep)
}
