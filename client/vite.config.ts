import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/carapi': {
        target: 'https://api.carapi.dev/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/carapi/, ''),
      },
      '/api': {
        target: 'https://automotive-cars.onrender.com',
        changeOrigin: true,
        headers: {
          Origin: 'https://automotive-cars.onrender.com'
        }
      },
      '/api-docs': {
        target: 'https://automotive-cars.onrender.com',
        changeOrigin: true,
        headers: { Origin: 'https://automotive-cars.onrender.com' }
      },
      '/sitemap.xml': {
        target: 'https://automotive-cars.onrender.com',
        changeOrigin: true,
        headers: { Origin: 'https://automotive-cars.onrender.com' }
      },
    },
  },
})
