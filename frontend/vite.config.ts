import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    cors: true,
    proxy: {
      '/api': {
        target: 'http://app:3000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      }
    }
  }
}); 