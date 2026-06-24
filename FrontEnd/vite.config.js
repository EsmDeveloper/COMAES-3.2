import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5175,
    // Proxy: redireciona /api e /socket.io para o backend local
    // Assim o frontend nunca precisa de saber o IP da máquina —
    // o browser usa sempre o mesmo host que serviu o frontend
    proxy: {
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        ws: false,
      },
      '/socket.io': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        ws: true,
      },
      '/torneios': {
        target: 'http://localhost:3002',
        changeOrigin: true,
      },
      '/auth': {
        target: 'http://localhost:3002',
        changeOrigin: true,
      },
    }
  }
})
