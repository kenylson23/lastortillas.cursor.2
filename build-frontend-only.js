import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Building frontend only for Vercel...');

try {
  // Only build frontend with Vite
  console.log('📦 Building frontend with Vite...');
  execSync('npx vite build', { 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });
  
  // Handle output directory structure
  const distPublic = path.join(process.cwd(), 'dist', 'public');
  const dist = path.join(process.cwd(), 'dist');
  
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
  const indexPath = path.join(dist, 'index.html');
  if (fs.existsSync(indexPath)) {
    console.log('🔄 Creating 404.html for SPA routing...');
    fs.copyFileSync(indexPath, path.join(dist, '404.html'));
  }
  
  console.log('✅ Frontend build completed successfully!');
  console.log('📁 Files in dist:', fs.readdirSync(dist));
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}