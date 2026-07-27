// ============================================================
// useOnlineStatus.ts
// Aura Square — Offline indicator support
// Owner: Syauqi Nuzul Abdi
// ============================================================
// Tracks browser online/offline state via the standard
// window 'online'/'offline' events. Aura Square works fully
// offline by design, so this is purely informational — it never
// blocks or degrades gameplay, it just lets the UI show a small
// "You're offline" indicator so players understand why (e.g.)
// the online leaderboard tab is unavailable.

import { useEffect, useState } from 'react';

export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(
    () => typeof navigator === 'undefined' ? true : navigator.onLine,
  );

  useEffect(() => {
    const handleOnline  = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online',  handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online',  handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
