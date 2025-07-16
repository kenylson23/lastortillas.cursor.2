import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🚀 Starting Vercel build process...');

try {
  // 1. Build frontend with Vite using production config
  console.log('📦 Building frontend with Vite...');
  execSync('npx vite build --config vite.config.prod.ts --logLevel warn', { stdio: 'inherit' });
  
  // 2. Move files from dist/public to dist (if they exist)
  const distPublicPath = path.join(process.cwd(), 'dist', 'public');
  const distPath = path.join(process.cwd(), 'dist');
  
  if (fs.existsSync(distPublicPath)) {
    console.log('📁 Moving files from dist/public to dist...');
    const files = fs.readdirSync(distPublicPath);
    files.forEach(file => {
      const srcPath = path.join(distPublicPath, file);
      const destPath = path.join(distPath, file);
      if (fs.existsSync(destPath)) {
        fs.rmSync(destPath, { recursive: true, force: true });
      }
      fs.renameSync(srcPath, destPath);
    });
    fs.rmSync(distPublicPath, { recursive: true, force: true });
  }
  
  // 3. Copy uploads directory if it exists
  const uploadsPath = path.join(process.cwd(), 'public', 'uploads');
  const distUploadsPath = path.join(distPath, 'uploads');
  
  if (fs.existsSync(uploadsPath)) {
    console.log('📁 Copying uploads directory...');
    if (fs.existsSync(distUploadsPath)) {
      fs.rmSync(distUploadsPath, { recursive: true, force: true });
    }
    fs.mkdirSync(distUploadsPath, { recursive: true });
    
    const copyDirectory = (src, dest) => {
      const entries = fs.readdirSync(src, { withFileTypes: true });
      entries.forEach(entry => {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
          fs.mkdirSync(destPath, { recursive: true });
          copyDirectory(srcPath, destPath);
        } else {
          fs.copyFileSync(srcPath, destPath);
        }
      });
    };
    
    copyDirectory(uploadsPath, distUploadsPath);
  }
  
  // 4. Create 404.html for SPA routing
  const indexPath = path.join(distPath, 'index.html');
  const notFoundPath = path.join(distPath, '404.html');
  
  if (fs.existsSync(indexPath)) {
    console.log('📁 Creating 404.html for SPA routing...');
    fs.copyFileSync(indexPath, notFoundPath);
  }
  
  console.log('✅ Vercel build completed successfully!');
  console.log('📊 Build output:');
  console.log(`   - Frontend built in: dist/`);
  console.log(`   - API functions: api/*.ts`);
  console.log(`   - Uploads directory: dist/uploads/`);
  console.log(`   - SPA routing: 404.html created`);
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}