// vite.config.ts — Phase 7 Final
import { defineConfig } from 'vite';
import react            from '@vitejs/plugin-react';
import { VitePWA }      from 'vite-plugin-pwa';
import { resolve }      from 'path';

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType:   'autoUpdate',
      // Registration is done manually via the `virtual:pwa-register/react`
      // hook (see src/hooks/usePwaUpdate.ts) instead of the auto-injected
      // script tag, so the app can show a "new version available" toast
      // instead of silently swapping content in the background.
      injectRegister: false,
      includeAssets: ['favicon.svg', 'icons/*.svg', 'icons/*.png'],

      manifest: {
        name:             'Aura Square',
        short_name:       'Aura Square',
        description:      'Game puzzle block — Isi. Sapu. Menang. Tanpa login, langsung main!',
        theme_color:      '#0B0C14',
        background_color: '#0B0C14',
        display:          'standalone',
        display_override: ['window-controls-overlay', 'standalone'],
        orientation:      'portrait-primary',
        start_url:        '/',
        scope:            '/',
        lang:             'id',
        dir:              'ltr',
        categories:       ['games', 'entertainment'],
        icons: [
          { src:'icons/icon-48.png',  sizes:'48x48',   type:'image/png', purpose:'any' },
          { src:'icons/icon-72.png',  sizes:'72x72',   type:'image/png', purpose:'any' },
          { src:'icons/icon-96.png',  sizes:'96x96',   type:'image/png', purpose:'any' },
          { src:'icons/icon-128.png', sizes:'128x128', type:'image/png', purpose:'any' },
          { src:'icons/icon-144.png', sizes:'144x144', type:'image/png', purpose:'any' },
          { src:'icons/icon-152.png', sizes:'152x152', type:'image/png', purpose:'any' },
          { src:'icons/icon-192.png', sizes:'192x192', type:'image/png', purpose:'any' },
          { src:'icons/icon-384.png', sizes:'384x384', type:'image/png', purpose:'any' },
          { src:'icons/icon-512.png', sizes:'512x512', type:'image/png', purpose:'any' },
          { src:'icons/icon-192-maskable.png', sizes:'192x192', type:'image/png', purpose:'maskable' },
          { src:'icons/icon-512-maskable.png', sizes:'512x512', type:'image/png', purpose:'maskable' },
        ],
        shortcuts: [
          { name:'Main Sekarang', short_name:'Main', url:'/play',  icons:[{src:'icons/icon-192.png',sizes:'192x192'}] },
          { name:'Tantangan Harian', short_name:'Harian', url:'/daily', icons:[{src:'icons/icon-192.png',sizes:'192x192'}] },
        ],
      },

      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        // Cache strategy per tipe aset
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler:    'CacheFirst',
            options: {
              cacheName:        'google-fonts-cache',
              expiration:       { maxEntries: 10, maxAgeSeconds: 60*60*24*365 },
              cacheableResponse:{ statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler:    'CacheFirst',
            options: {
              cacheName:        'google-fonts-woff2',
              expiration:       { maxEntries: 20, maxAgeSeconds: 60*60*24*365 },
              cacheableResponse:{ statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
            handler:    'NetworkFirst',
            options: {
              cacheName:        'firestore-cache',
              expiration:       { maxEntries: 50, maxAgeSeconds: 60*5 },
              networkTimeoutSeconds: 5,
            },
          },
        ],
        // Halaman offline fallback
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
      },

      devOptions: {
        enabled: false, // matikan PWA di dev supaya tidak ganggu HMR
      },
    }),
  ],

  resolve: {
    alias: {
      '@':           resolve(__dirname, 'src'),
      '@engine':     resolve(__dirname, 'src/engine'),
      '@ui':         resolve(__dirname, 'src/components/ui'),
      '@layout':     resolve(__dirname, 'src/components/layout'),
      '@pages':      resolve(__dirname, 'src/pages'),
      '@store':      resolve(__dirname, 'src/store'),
      '@hooks':      resolve(__dirname, 'src/hooks'),
      '@services':   resolve(__dirname, 'src/services'),
      '@types':      resolve(__dirname, 'src/types'),
      '@utils':      resolve(__dirname, 'src/utils'),
      '@i18n':       resolve(__dirname, 'src/i18n'),
      '@constants':  resolve(__dirname, 'src/constants'),
    },
  },

  build: {
    target:    'es2022',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react':    ['react', 'react-dom', 'react-router-dom'],
          'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'vendor-state':    ['zustand'],
          'vendor-i18n':     ['i18next', 'react-i18next'],
          'vendor-motion':   ['framer-motion'],
        },
      },
    },
    // Peringatan hanya untuk chunk > 800KB
    chunkSizeWarningLimit: 800,
  },

  server: {
    port: 5173,
    open: true,
    // Izinkan akses dari device lain di jaringan (HP untuk testing)
    host: '0.0.0.0',
  },
});
