#!/usr/bin/env node

// Build rápido para correção do problema Vercel

import { execSync } from 'child_process';
import { existsSync, mkdirSync, copyFileSync, rmSync } from 'fs';

console.log('🔧 Correção rápida do build para Vercel');

try {
  // Limpar dist anterior
  if (existsSync('dist')) {
    rmSync('dist', { recursive: true, force: true });
  }
  
  // Build usando configuração padrão (sem timeout)
  console.log('📦 Executando vite build...');
  execSync('cd client && npx vite build --outDir ../dist', { 
    stdio: 'inherit',
    timeout: 180000 // 3 minutos
  });
  
  console.log('✅ Build concluído!');
  
  // Verificar estrutura
  if (existsSync('dist/index.html')) {
    console.log('✅ index.html encontrado');
  } else {
    console.log('❌ index.html não encontrado');
  }
  
  if (existsSync('dist/assets')) {
    console.log('✅ assets/ encontrado');
  } else {
    console.log('❌ assets/ não encontrado');
  }
  
  // Copiar uploads
  if (existsSync('public/uploads')) {
    execSync('cp -r public/uploads dist/', { stdio: 'inherit' });
    console.log('✅ uploads copiados');
  }
  
  // Criar 404.html
  if (existsSync('dist/index.html')) {
    copyFileSync('dist/index.html', 'dist/404.html');
    console.log('✅ 404.html criado');
  }
  
  console.log('🎉 Build pronto para Vercel!');
  
} catch (error) {
  console.error('❌ Erro:', error.message);
  process.exit(1);
}