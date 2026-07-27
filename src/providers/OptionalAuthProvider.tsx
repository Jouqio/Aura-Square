// OptionalAuthProvider.tsx — Phase 6 stub
import React from 'react';
interface Props { children: React.ReactNode; }
export function OptionalAuthProvider({ children }: Props): React.JSX.Element {
  return <>{children}</>;
}
export function getDisplayName(): string { return 'Pemain'; }
export function getUid(): string { return `local_${Date.now()}`; }
