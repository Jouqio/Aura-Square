// ============================================================
// app.constants.ts
// Aura Square — App-wide constants
// Owner: Syauqi Nuzul Abdi
// ============================================================
// Single source of truth for the app version string. Keep this in
// sync with package.json's "version" field manually on release —
// it's duplicated here (rather than imported from package.json)
// because bundling package.json into client code is generally
// avoided (it can leak dependency names/versions unnecessarily).

export const APP_VERSION = '3.0.0';
