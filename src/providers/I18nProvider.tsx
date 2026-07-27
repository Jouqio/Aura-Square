// ============================================================
// I18nProvider.tsx
// Aura Square — i18n / locale sync provider
// Owner: Syauqi Nuzul Abdi
// ============================================================
// Ensures i18next language always matches the uiStore locale.
// Must be rendered AFTER uiStore has rehydrated from localStorage.

import React, { useEffect } from 'react';
import { I18nextProvider }   from 'react-i18next';
import i18n                  from '../i18n';
import { useUiStore, selectLocale } from '../store/uiStore';

interface I18nProviderProps {
  children: React.ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps): React.JSX.Element {
  const locale = useUiStore(selectLocale);

  // Keep i18next in sync with persisted locale preference
  useEffect(() => {
    if (i18n.language !== locale) {
      void i18n.changeLanguage(locale);
    }
  }, [locale]);

  // Sync document lang attribute for accessibility
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
