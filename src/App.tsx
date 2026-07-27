// App.tsx — V3: Zero Auth, Instant Play, PWA update notification, BGM
import React from 'react';
import { RootProviders } from './providers';
import { AppRouter }     from './router/AppRouter';
import { PwaUpdateToast } from './components/layout/PwaUpdateToast/PwaUpdateToast';
import { useBgm } from './hooks/useBgm';

export default function App(): React.JSX.Element {
  useBgm();

  return (
    <RootProviders>
      <AppRouter />
      <PwaUpdateToast />
    </RootProviders>
  );
}
