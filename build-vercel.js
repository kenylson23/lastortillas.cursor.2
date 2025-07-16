import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Building Las Tortillas for Vercel...');

try {
  // Build frontend com Vite
  console.log('📦 Building frontend...');
  execSync('npx vite build', { 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });
  
  // Verifica se build foi bem-sucedido
  if (!fs.existsSync('dist')) {
    throw new Error('Build failed - dist directory not found');
  }
  
  // Cria 404.html para SPA routing
  const indexPath = path.join('dist', 'index.html');
  if (fs.existsSync(indexPath)) {
    console.log('🔄 Creating 404.html for SPA routing...');
    fs.copyFileSync(indexPath, path.join('dist', '404.html'));
  }
  
  // Garante que diretório uploads existe
  const uploadsDir = path.join('dist', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    console.log('📁 Creating uploads directory...');
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  // Copia assets estáticos se existirem
  if (fs.existsSync('public')) {
    console.log('📋 Copying static assets...');
    execSync('cp -r public/* dist/ 2>/dev/null || true', { stdio: 'inherit' });
  }
  
  console.log('✅ Build completed successfully!');
  console.log('📊 Build size:', execSync('du -sh dist', { encoding: 'utf8' }).trim());
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}