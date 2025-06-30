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
  
  // Build with optimized settings for Vercel
  console.log('Building application with optimized settings...');
  execSync('vite build', { 
    stdio: 'inherit',
    env: { 
      ...process.env, 
      NODE_ENV: 'production',
      // Optimize build performance
      NODE_OPTIONS: '--max-old-space-size=4096',
      // Reduce Vite build complexity 
      VITE_LEGACY: 'false'
    },
    timeout: 300000 // 5 minutes timeout
  });
  
  // Verify build output - checking both possible locations
  const distPath = path.join(__dirname, 'dist');
  const publicPath = path.join(distPath, 'public');
  const indexPath = fs.existsSync(publicPath) 
    ? path.join(publicPath, 'index.html')
    : path.join(distPath, 'index.html');
  
  if (fs.existsSync(indexPath)) {
    console.log('✓ Build completed successfully');
    
    // Show actual output directory structure
    const outputDir = fs.existsSync(publicPath) ? publicPath : distPath;
    const contents = fs.readdirSync(outputDir);
    
    console.log('✓ Output directory:', outputDir);
    console.log('✓ Generated files:', contents.filter(f => 
      f.endsWith('.html') || f.endsWith('.js') || f.endsWith('.css')
    ).join(', '));
    
  } else {
    throw new Error(`Build output not found. Expected: ${indexPath}`);
  }
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  if (error.code === 'ETIMEDOUT') {
    console.error('💡 Build timed out - this can happen with complex dependencies');
  }
  process.exit(1);
}