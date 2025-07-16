#!/usr/bin/env node
// Build script otimizado para Vercel - apenas frontend

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Building frontend for Vercel deployment...');

try {
  // Build apenas do frontend com Vite
  console.log('📦 Building frontend with Vite...');
  
  execSync('npx vite build --config vite.config.vercel.ts', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'production',
      VERCEL: '1'
    }
  });
  
  // Verifica se o build foi bem-sucedido
  if (!fs.existsSync('dist')) {
    throw new Error('Build failed - dist directory not found');
  }
  
  // Cria 404.html para SPA routing
  const indexPath = path.join('dist', 'index.html');
  if (fs.existsSync(indexPath)) {
    fs.copyFileSync(indexPath, path.join('dist', '404.html'));
    console.log('✅ Created 404.html for SPA routing');
  }
  
  // Cria diretório uploads
  const uploadsDir = path.join('dist', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✅ Created uploads directory');
  }
  
  // Copia assets estáticos se existirem
  if (fs.existsSync('public')) {
    console.log('📋 Copying static assets...');
    execSync('cp -r public/* dist/ 2>/dev/null || true', { stdio: 'inherit' });
  }
  
  console.log('✅ Frontend build completed successfully!');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}