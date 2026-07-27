// useAuth.ts — Phase 6 stub (auth dihapus)
export function useAuth() {
  return {
    user: null, authStatus: 'authenticated' as const,
    isAnonymous: false, isLoggedIn: true, isLoading: false,
    signInGoogle: async () => {}, upgradeGoogle: async () => {},
    signOut: async () => {}, error: null, clearError: () => {},
  };
}
