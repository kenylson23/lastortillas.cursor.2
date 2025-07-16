#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🚀 Build Frontend Only - Vercel Ready');

try {
  // Limpar dist anterior
  if (fs.existsSync('dist')) {
    console.log('🧹 Limpando dist anterior...');
    fs.rmSync('dist', { recursive: true, force: true });
  }

  // Criar vite.config.vercel.ts temporário
  const vercelConfig = `
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
      input: {
        main: resolve(__dirname, 'client/index.html')
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'client/src'),
      '@shared': resolve(__dirname, 'shared'),
      '@assets': resolve(__dirname, 'attached_assets')
    }
  }
});
  `;
  
  fs.writeFileSync('vite.config.vercel.ts', vercelConfig);
  
  // Build com timeout
  console.log('🔨 Executando build...');
  execSync('npx vite build --config vite.config.vercel.ts', { 
    stdio: 'inherit',
    timeout: 60000 // 60 segundos
  });
  
  // Verificar se dist foi criado
  if (fs.existsSync('dist/index.html')) {
    console.log('✅ Build concluído com sucesso!');
    
    // Criar 404.html para SPA
    fs.copyFileSync('dist/index.html', 'dist/404.html');
    
    // Listar arquivos criados
    console.log('📁 Arquivos criados:');
    const files = fs.readdirSync('dist');
    files.forEach(file => console.log(`   - ${file}`));
    
  } else {
    console.log('❌ Build falhou - index.html não encontrado');
    process.exit(1);
  }
  
  // Limpar arquivo temporário
  fs.unlinkSync('vite.config.vercel.ts');
  
} catch (error) {
  console.error('❌ Erro no build:', error.message);
  process.exit(1);
}