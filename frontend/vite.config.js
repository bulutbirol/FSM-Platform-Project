import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('recharts') || id.includes('d3-')) return 'charts'
          if (id.includes('react')) return 'react'
          if (id.includes('axios') || id.includes('@tanstack') || id.includes('react-hook-form')) return 'data'
          return 'vendor'
        }
      }
    }
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    globals: true
  }
})
