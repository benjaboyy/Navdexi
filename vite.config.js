import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import mockServer from './src/api/mockServer.js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [vue(), mockServer()],
    define: {
      __FIREBASE_URL__: JSON.stringify(env.VITE_FIREBASE_URL || ''),
    },
  }
})
