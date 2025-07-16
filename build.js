import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Building for Vercel...');

try {
  // Build with Vite
  console.log('📦 Building frontend...');
  execSync('vite build', { stdio: 'inherit' });
  
  // Handle output directory structure
  const distPublic = 'dist/public';
  const dist = 'dist';
  
  if (fs.existsSync(distPublic)) {
    console.log('📁 Moving files from dist/public to dist...');
    const files = fs.readdirSync(distPublic);
    files.forEach(file => {
      const src = path.join(distPublic, file);
      const dest = path.join(dist, file);
      if (fs.existsSync(dest)) {
        fs.rmSync(dest, { recursive: true, force: true });
      }
      fs.renameSync(src, dest);
    });
    fs.rmSync(distPublic, { recursive: true, force: true });
  }
  
  // Create 404.html for SPA routing
  if (fs.existsSync('dist/index.html')) {
    fs.copyFileSync('dist/index.html', 'dist/404.html');
  }
  
  console.log('✅ Build completed successfully!');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}