// vite.config.js
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ command, mode }) => {
  // Carga las variables de entorno según el modo
  const env = loadEnv(mode, process.cwd(), '');
  
  // Usamos la URL directamente por ahora para evitar problemas
  const apiUrl = 'https://web-production-a06e.up.railway.app';
  
  return {
    server: {
      proxy: {
        // string shorthand
        '/remove-bg': apiUrl,
        // with options
        '/api': {
          target: apiUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    }
  }
})
