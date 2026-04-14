import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/B551011': {
        target: 'https://apis.data.go.kr',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
