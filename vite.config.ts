import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@fintutto/shared': path.resolve(__dirname, './packages/shared/src/index.ts'),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  build: {
    target: 'es2022',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['lucide-react', 'class-variance-authority', 'clsx', 'tailwind-merge', 'sonner'],
          'vendor-supabase': ['@supabase/supabase-js'],
        },
      },
    },
  },
})
