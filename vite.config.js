// vite.config.js
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ command, mode }) => {
  // Carga las variables de entorno según el modo
  const env = loadEnv(mode, process.cwd(), '');
  
  // Utilizamos la URL de la API desde las variables de entorno
  const apiUrl = env.VITE_API_URL;
  
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
