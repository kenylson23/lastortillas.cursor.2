#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('Building Las Tortilhas for Vercel...');

try {
  // Clear any existing dist directory
  console.log('Cleaning previous build...');
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }
  
  // Use simpler build command that's more reliable
  console.log('Building application...');
  execSync('npm run build', { 
    stdio: 'inherit',
    env: { 
      ...process.env, 
      NODE_ENV: 'production',
      VITE_API_URL: '',
      // Optimize for production
      NODE_OPTIONS: '--max-old-space-size=4096'
    }
  });
  
  // Verify build output
  const distPath = path.join(__dirname, 'dist');
  const indexPath = path.join(distPath, 'index.html');
  
  if (fs.existsSync(indexPath)) {
    console.log('✓ Build completed successfully');
    console.log('✓ Static files ready for deployment');
    
    // List key files for verification
    const distContents = fs.readdirSync(distPath);
    const importantFiles = distContents.filter(file => 
      file.includes('.html') || file.includes('.js') || file.includes('.css')
    );
    console.log('✓ Generated files:', importantFiles.join(', '));
  } else {
    throw new Error('Build output not found - check build configuration');
  }
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  console.error('💡 Suggestion: Check if all dependencies are installed correctly');
  process.exit(1);
}