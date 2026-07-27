// ============================================================
// main.tsx
// Aura Square — Vite application entry point
// Owner: Syauqi Nuzul Abdi
// ============================================================

import React           from 'react';
import ReactDOM        from 'react-dom/client';
import App             from './App';
import './assets/globals.css';
// i18n must be imported before App renders
import './i18n';

// ── Strict Mode in development only ──────────────────────────
const root = document.getElementById('root');
if (!root) throw new Error('[main] #root element not found in index.html');

ReactDOM.createRoot(root).render(
  import.meta.env.DEV ? (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  ) : (
    <App />
  ),
);
