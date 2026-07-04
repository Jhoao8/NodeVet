import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// Flow devuelve al usuario a la urlReturn con un POST, pero la SPA solo se
// sirve por GET (el POST daba 404). Este middleware responde 303 See Other,
// lo que obliga al navegador a repetir la petición como GET y cargar la SPA.
// En producción, nginx.conf hace lo mismo para /pago/resultado.
const flowReturnPost = (): Plugin => ({
  name: 'flow-return-post',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.method === 'POST' && req.url?.startsWith('/pago/resultado')) {
        res.statusCode = 303
        res.setHeader('Location', req.url)
        res.end()
        return
      }
      next()
    })
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    flowReturnPost()
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  }
})
