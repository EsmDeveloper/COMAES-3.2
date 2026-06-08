import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  root: 'FrontEnd',
  plugins: [react()],
  server: {
    port: 5176,
    host: '0.0.0.0'
  },
  build: {
    outDir: '../dist',
    rollupOptions: {
      onwarn(warning, warn) {
        // Ignorar warnings sobre imports faltando (false positives com alias)
        if (warning.code === 'UNRESOLVED_IMPORT') return;
        warn(warning);
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './FrontEnd/src')
    }
  }
})
