import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

/**
 * Configuração Vite específica para Vercel
 * Remove todas as dependências Replit para evitar conflitos
 */
export default defineConfig({
  plugins: [
    react(),
    // NO Replit plugins - clean build for Vercel
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      external: [
        // Força exclusão de plugins Replit do bundle
        '@replit/vite-plugin-cartographer',
        '@replit/vite-plugin-runtime-error-modal'
      ]
    }
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
  define: {
    // Força environment para Vercel
    'process.env.REPL_ID': JSON.stringify(undefined),
    'process.env.VERCEL': JSON.stringify('1'),
  }
});