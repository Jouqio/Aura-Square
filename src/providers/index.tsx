// providers/index.tsx — Phase 9 (Zero Auth + Reduced Motion accessibility)
import React from 'react';
import { ThemeProvider } from './ThemeProvider';
import { I18nProvider }  from './I18nProvider';
import { MotionPreferenceProvider } from './MotionPreferenceProvider';

export { ThemeProvider } from './ThemeProvider';
export { I18nProvider }  from './I18nProvider';
export { MotionPreferenceProvider } from './MotionPreferenceProvider';

interface RootProvidersProps { children: React.ReactNode; }

export function RootProviders({ children }: RootProvidersProps): React.JSX.Element {
  return (
    <I18nProvider>
      <ThemeProvider>
        <MotionPreferenceProvider>
          {children}
        </MotionPreferenceProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}
