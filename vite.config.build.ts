import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Configuração otimizada para build Vercel
export default defineConfig({
  plugins: [react()],
  root: 'client',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'client/index.html'),
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'client/src'),
      '@assets': resolve(__dirname, 'attached_assets'),
    },
  },
});