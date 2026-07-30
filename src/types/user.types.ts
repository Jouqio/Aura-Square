// user.types.ts — Phase 6 (no auth types, zero-login)
export type AppLocale = "en" | "id";
/** 'system' auto-resolves to dark-aura or light-aura based on OS
 *  preference. green-aura is always an explicit choice. */
export type AppTheme =
  | "dark-aura"
  | "light-aura"
  | "green-aura"
  | "celestial-aura"
  | "system";
/** The theme that's actually applied to the DOM after resolving 'system'. */
export type ResolvedTheme =
  | "dark-aura"
  | "light-aura"
  | "green-aura"
  | "celestial-aura";
