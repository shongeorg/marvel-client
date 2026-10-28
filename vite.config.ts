import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icon.svg'],
      manifest: {
        id: '/',
        name: 'Marvel Explorer — клієнт до Marvel API',
        short_name: 'Marvel',
        description:
          'Персонажі, комікси, творці, події, серії та історії з Marvel API: пошук, пагінація й улюблене.',
        lang: 'uk',
        dir: 'ltr',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'any',
        theme_color: '#e62429',
        background_color: '#0b0d12',
        categories: ['entertainment', 'books', 'reference'],
        icons: [
          { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,ico,webmanifest}'],
        // SPA у history-режимі: будь-який навігаційний запит віддаємо з index.html
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/v1\//],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            // Дані з власного Marvel API: свіже з мережі, кеш — як фолбек офлайн
            urlPattern: /\/v1\/public\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'marvel-api',
              networkTimeoutSeconds: 6,
              expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 7 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Обкладинки та постери
            urlPattern: /^https:\/\/static\.wikia\.nocookie\.net\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'marvel-images',
              expiration: { maxEntries: 400, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
