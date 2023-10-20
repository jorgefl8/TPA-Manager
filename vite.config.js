import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  // vite config
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  test: {
    globals: true,
  },
  define: {
    "process.env.ASSETS_MANAGER_URL": JSON.stringify(process.env.ASSETS_MANAGER_URL || 'http://localhost:5200'), // 'http://host.docker.internal:5200'
    "process.env.REGISTRY_URL": JSON.stringify(process.env.REGISTRY_URL || 'http://localhost:5400'), // 'http://host.docker.internal:5400'
    "process.env.COLLECTOR_EVENTS_URL": JSON.stringify(process.env.COLLECTOR_EVENTS_URL || 'http://localhost:5500'), // 'http://host.docker.internal:5500'
    "process.env.SCOPE_MANAGER_URL": JSON.stringify(process.env.SCOPE_MANAGER_URL || 'http://localhost:5700'), // 'http://host.docker.internal:5700'
  }
})