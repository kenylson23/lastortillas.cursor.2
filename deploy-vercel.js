import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Vercel deployment build...');

try {
  // Build apenas o frontend diretamente
  console.log('📦 Building frontend only...');
  execSync('npx vite build', { 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });
  
  // Verifica se o build foi bem-sucedido
  if (!fs.existsSync('dist')) {
    throw new Error('Build failed - no dist directory');
  }
  
  // Cria 404.html para SPA
  const indexPath = path.join('dist', 'index.html');
  if (fs.existsSync(indexPath)) {
    fs.copyFileSync(indexPath, path.join('dist', '404.html'));
  }
  
  // Cria diretório uploads se não existir
  const uploadsDir = path.join('dist', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  console.log('✅ Build completed successfully!');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}