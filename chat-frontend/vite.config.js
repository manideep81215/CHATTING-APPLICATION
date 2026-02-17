import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  const devProxyTarget = env.VITE_DEV_PROXY_TARGET

  return {
    plugins: [react()],
    define: {
      global: "globalThis",
    },
    server: devProxyTarget
      ? {
          proxy: {
            "/api": {
              target: devProxyTarget,
              changeOrigin: true,
            },
            "/ws": {
              target: devProxyTarget,
              ws: true,
              changeOrigin: true,
            },
          },
        }
      : undefined,
  }
})
