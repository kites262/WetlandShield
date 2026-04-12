import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createConfig } from './src/config'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, fileURLToPath(new URL('.', import.meta.url)), '')
  const config = createConfig(env as Record<string, string | undefined>)

  return {
    base: './',
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: {
      outDir: 'build',
      emptyOutDir: true,
    },
    server: {
      host: config.devHost,
      port: config.devPort,
      proxy: config.apiBase
        ? {
            [config.apiBase]: {
              target: config.proxyTarget,
              changeOrigin: true,
            },
          }
        : undefined,
    },
    preview: {
      host: config.previewHost,
      port: config.previewPort,
    },
  }
})
