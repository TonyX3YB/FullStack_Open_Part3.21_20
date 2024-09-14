import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',  // This ensures relative paths in production
  build: {
    outDir: 'dist', // Make sure this matches where the build files are generated
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',  
        changeOrigin: true,
      },
    }
  },
})
