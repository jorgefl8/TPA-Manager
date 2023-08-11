import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  return {
    // vite config
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    define: {
      "process.env.ASSETS_MANAGER_URL": JSON.stringify(process.env.ASSETS_MANAGER_URL || 'http://localhost:5200'),
      "process.env.REGISTRY_URL": JSON.stringify(process.env.REGISTRY_URL || 'http://localhost:5400'),
      "process.env.SCOPE_MANAGER_URL": JSON.stringify(process.env.SCOPE_MANAGER_URL || 'http://localhost:5700'),
    },
  }
})
