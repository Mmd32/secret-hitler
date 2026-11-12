import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png'],
      workbox: {
        // Card/board artwork is cached on first use instead of being pre-downloaded at install
        runtimeCaching: [
          {
            urlPattern: /\/game-assets\/.*\.(?:webp|svg|png)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'game-art',
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 90 },
            },
          },
        ],
      },
      manifest: {
        name: 'Secret Hitler — راز هیتلر',
        short_name: 'SecretHitler',
        description: 'Official Multiplayer Secret Hitler Web Game',
        theme_color: '#0a0d13',
        background_color: '#0a0d13',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:3001',
        ws: true,
      },
    },
  },
});

