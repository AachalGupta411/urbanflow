import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api/tickets': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/api/passengers': {
        target: 'http://localhost:3002',
        changeOrigin: true,
      },
      '/api/gps': {
        target: 'http://localhost:3003',
        changeOrigin: true,
      },
      '/api/notifications': {
        target: 'http://localhost:3004',
        changeOrigin: true,
      },
      '/api/analytics': {
        target: 'http://localhost:3005',
        changeOrigin: true,
      },
    },
  },
});
