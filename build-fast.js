import { execSync } from 'child_process';
import fs from 'fs';

console.log('🚀 Fast build for Vercel...');

try {
  // Simplified build without complex operations
  console.log('📦 Building...');
  execSync('npx vite build --config vite.config.prod.ts --mode production', { 
    stdio: 'inherit',
    timeout: 60000  // 1 minute timeout
  });
  
  // Simple file operations
  if (fs.existsSync('dist/index.html')) {
    fs.copyFileSync('dist/index.html', 'dist/404.html');
    console.log('✅ SPA routing configured');
  }
  
  console.log('✅ Build completed successfully!');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}