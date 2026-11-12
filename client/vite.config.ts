import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'cards/*.png'],
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
            src: '/cards/role_hitler.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/cards/role_hitler.png',
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

