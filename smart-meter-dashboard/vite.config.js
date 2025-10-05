import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy API requests to your backend during development
      '/api': 'http://localhost:5000',
    },
  },
  build: {
    chunkSizeWarningLimit: 1500, // avoid "chunk size" warnings
  },
});
