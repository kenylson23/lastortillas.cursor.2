import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  root: 'client',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      external: ['lucide-react'],
      input: {
        main: resolve(__dirname, 'client/index.html'),
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'client/src'),
      '@assets': resolve(__dirname, 'attached_assets'),
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
});