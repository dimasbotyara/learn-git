import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Всё приложение живёт на одном порту 13444 (Flask) в проде.
// В разработке Vite отдаёт UI сам и проксирует /api в Flask на 13444.
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:13444',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsInlineLimit: 0, // шрифты отдельными файлами — их кэширует браузер
  },
})
