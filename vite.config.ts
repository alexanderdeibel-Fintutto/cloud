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
})
