/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />
/// <reference types="vite-plugin-pwa/react" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY:              string;
  readonly VITE_FIREBASE_AUTH_DOMAIN:          string;
  readonly VITE_FIREBASE_PROJECT_ID:           string;
  readonly VITE_FIREBASE_STORAGE_BUCKET:       string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID:  string;
  readonly VITE_FIREBASE_APP_ID:               string;
  readonly VITE_FIREBASE_DATABASE_URL:         string;
  readonly VITE_FIREBASE_MEASUREMENT_ID?:      string;
  readonly VITE_ENABLE_ANALYTICS:              string;
  readonly VITE_ENABLE_MULTIPLAYER:            string;
  readonly VITE_ENABLE_LEADERBOARD:            string;
  readonly VITE_APP_ENV:                       'development' | 'staging' | 'production';
  readonly VITE_GRID_SIZE?:                    string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
