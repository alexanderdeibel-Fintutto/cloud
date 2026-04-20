import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  server: {
    host: '::',
    port: 5190,
    hmr: { overlay: false },
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    chunkSizeWarningLimit: 1000,

  },
  css: {
    postcss: path.resolve(__dirname, '../../'),
  },
})
