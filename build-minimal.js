import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Minimal build for Vercel...');

try {
  // Clean dist first
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }
  
  // Build with minimal configuration
  console.log('📦 Building frontend (minimal)...');
  execSync('NODE_ENV=production npx vite build --minify false --sourcemap false', { 
    stdio: 'inherit',
    timeout: 120000,
    env: { ...process.env, NODE_ENV: 'production' }
  });
  
  console.log('✅ Build completed successfully!');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  // Try fallback approach
  console.log('🔄 Trying fallback build...');
  try {
    execSync('npx vite build --mode development --minify false', { 
      stdio: 'inherit',
      timeout: 60000
    });
    console.log('✅ Fallback build completed!');
  } catch (fallbackError) {
    console.error('❌ Fallback also failed:', fallbackError.message);
    process.exit(1);
  }
}