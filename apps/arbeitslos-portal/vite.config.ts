import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5175,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': [
            '@radix-ui/react-slot',
            '@radix-ui/react-label',
            '@radix-ui/react-progress',
            'class-variance-authority',
            'clsx',
            'tailwind-merge',
          ],
          'vendor-supabase': ['@supabase/supabase-js'],
        },
      },
    },
  },
})
