import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.svg', '_headers'],
      manifest: {
        name: 'ORS Map - Hiking Planner',
        short_name: 'ORSMap',
        description: 'Plan your hiking routes with OpenRouteService',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'logo.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,vue,txt,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.openrouteservice\.org\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'ors-api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
            },
          },
          {
            urlPattern: /^https:\/\/overpass-api\.de\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'overpass-api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 12, // 12 hours
              },
            },
          },
          {
            urlPattern: /^https:\/\/.*\.openstreetmap\.(fr|org)\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'osm-tiles-cache',
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 1 week
              },
            },
          },
          {
            urlPattern: /^https:\/\/api\.open-elevation\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'elevation-api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
        ],
      },
    }),
  ],
  base: '/ors-map/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/constants': path.resolve(__dirname, './src/constants'),
      '@/ui': path.resolve(__dirname, './src/ui'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/assets': path.resolve(__dirname, './src/assets'),
    },
  },
  build: {
    // Optimize build output
    target: 'esnext',
    minify: 'esbuild', // Use esbuild instead of terser for faster builds
    cssCodeSplit: true, // Enable CSS code splitting
    sourcemap: false, // Disable sourcemaps in production for smaller bundle
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],

          // Large external libraries - separate chunks for better caching
          leaflet: ['leaflet'],

          // Icons - separate chunk since they're used throughout the app
          icons: ['react-icons/fa', 'react-icons/md', 'react-icons/hi'],

          // DnD libraries
          dnd: ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
        },
        // Optimize asset file names
        assetFileNames: assetInfo => {
          if (!assetInfo.name) return 'assets/[name]-[hash][extname]';

          if (/\.(png|jpe?g|gif|svg|webp|avif)$/i.test(assetInfo.name)) {
            return `img/[name]-[hash][extname]`;
          }
          if (/\.(css)$/i.test(assetInfo.name)) {
            return `css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        // Optimize chunk file names for better caching
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
      },
      treeshake: {
        // Enable aggressive tree-shaking
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false,
      },
    },
    chunkSizeWarningLimit: 800, // Lower warning limit to catch large chunks
    reportCompressedSize: true, // Report gzipped sizes for better insights
  },
  // Performance optimizations
  optimizeDeps: {
    include: [
      'leaflet',
      'react',
      'react-dom',
      'react-router-dom',
      'react-icons/fa',
      '@dnd-kit/core',
      '@dnd-kit/sortable',
    ],
    exclude: ['@testing-library/react', '@testing-library/user-event'],
  },
  // Development server optimizations
  server: {
    fs: {
      allow: ['..'],
    },
    // Enable HMR for faster development
    hmr: {
      overlay: true,
    },
    // Security headers for development
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
    },
  },
  // Enable CSS optimization
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      // Configure CSS preprocessing if needed
    },
  },
});
