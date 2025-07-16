import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Final Vercel build solution...');

const MAX_RETRIES = 3;
let attempt = 0;

async function buildWithRetry() {
  while (attempt < MAX_RETRIES) {
    attempt++;
    console.log(`📦 Build attempt ${attempt}/${MAX_RETRIES}...`);
    
    try {
      // Use development mode with faster builds
      if (attempt === 1) {
        execSync('NODE_ENV=production npx vite build --mode production --minify false', { 
          stdio: 'inherit',
          timeout: 120000
        });
      } else if (attempt === 2) {
        execSync('NODE_ENV=development npx vite build --mode development', { 
          stdio: 'inherit',
          timeout: 90000
        });
      } else {
        // Last attempt - minimal build
        execSync('npx vite build --mode development --minify false --sourcemap false', { 
          stdio: 'inherit',
          timeout: 60000
        });
      }
      
      console.log('✅ Build completed successfully!');
      return true;
      
    } catch (error) {
      console.error(`❌ Build attempt ${attempt} failed:`, error.message);
      
      if (attempt < MAX_RETRIES) {
        console.log('🔄 Retrying with different configuration...');
        // Clean dist before retry
        if (fs.existsSync('dist')) {
          fs.rmSync('dist', { recursive: true, force: true });
        }
      }
    }
  }
  
  return false;
}

try {
  const success = await buildWithRetry();
  
  if (!success) {
    console.error('❌ All build attempts failed');
    process.exit(1);
  }
  
  // Post-build operations
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
    fs.copyFileSync(indexPath, path.join(dist, '404.html'));
  }
  
  console.log('✅ Final build completed successfully!');
  
} catch (error) {
  console.error('❌ Final build failed:', error.message);
  process.exit(1);
}