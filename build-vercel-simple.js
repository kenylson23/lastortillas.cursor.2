import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Simple Vercel build...');

try {
  // Build with vite
  console.log('📦 Building frontend...');
  execSync('npx vite build', { stdio: 'inherit' });
  
  // Handle the output directory structure
  const distPublic = path.join(process.cwd(), 'dist', 'public');
  const dist = path.join(process.cwd(), 'dist');
  
  if (fs.existsSync(distPublic)) {
    // Move files from dist/public to dist
    const files = fs.readdirSync(distPublic);
    files.forEach(file => {
      const src = path.join(distPublic, file);
      const dest = path.join(dist, file);
      fs.renameSync(src, dest);
    });
    fs.rmdirSync(distPublic);
  }
  
  // Create 404.html for SPA routing
  const indexPath = path.join(dist, 'index.html');
  if (fs.existsSync(indexPath)) {
    fs.copyFileSync(indexPath, path.join(dist, '404.html'));
  }
  
  console.log('✅ Build completed successfully!');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}