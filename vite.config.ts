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
      },
      '/kakao-navi': {
        target: 'https://apis-navi.kakaomobility.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/kakao-navi/, '')
      },
      '/kakao-local': {
        target: 'https://dapi.kakao.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/kakao-local/, '')
      }
    }
  }
})
