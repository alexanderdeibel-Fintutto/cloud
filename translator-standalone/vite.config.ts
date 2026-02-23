import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Fintutto Translator',
        short_name: 'Translator',
        description: 'Kostenloser Übersetzer mit Spracheingabe, Sprachausgabe und Live-Übersetzung',
        theme_color: '#0369a1',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        // Cache static assets (exclude large WASM — loaded on demand via runtime cache)
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // Exclude ONNX WASM from precache (21MB+), handle via runtime caching
        globIgnores: ['**/*.wasm'],
        // Offline navigation fallback
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        // Runtime caching for API requests and ML models
        runtimeCaching: [
          {
            // Cache translation API responses
            urlPattern: /^https:\/\/api\.mymemory\.translated\.net/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'translation-cache',
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
            },
          },
          {
            // Cache Google Translation API responses
            urlPattern: /^https:\/\/translation\.googleapis\.com/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-translate-cache',
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
            },
          },
          {
            // Cache Google TTS audio responses
            urlPattern: /^https:\/\/texttospeech\.googleapis\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'tts-audio-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          {
            // Cache HuggingFace model files (Opus-MT, Whisper)
            urlPattern: /^https:\/\/huggingface\.co\/.*\.(onnx|json|wasm|bin)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'offline-models',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 90, // 90 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Also cache CDN-served model files
            urlPattern: /^https:\/\/cdn-lfs(-us-1)?\.huggingface\.co/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'offline-models-cdn',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 90, // 90 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Cache local WASM files (ONNX Runtime) on first use
            urlPattern: /\.wasm$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'wasm-runtime',
              expiration: {
                maxEntries: 5,
                maxAgeSeconds: 60 * 60 * 24 * 90, // 90 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Cache Google Fonts
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5180,
  },
})
