#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🚀 Building Las Tortilhas for Vercel deployment...');

try {
  // Ensure clean slate
  console.log('🧹 Cleaning previous builds...');
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }

  // Create directory structure early to avoid issues
  fs.mkdirSync('dist/public', { recursive: true });
  console.log('📁 Created output directory: dist/public');

  // Run optimized build with increased resources
  console.log('⚡ Starting build process...');
  console.log('ℹ️  This may take 2-3 minutes due to dependencies...');
  
  execSync('vite build', {
    stdio: 'inherit', // Show build output for debugging
    env: {
      ...process.env,
      NODE_ENV: 'production',
      NODE_OPTIONS: '--max-old-space-size=8192',
      CI: 'true', // Optimize for CI environment
      VITE_LEGACY: 'false'
    }
  });

  // Verify the build output
  const outputPath = path.join(__dirname, 'dist', 'public');
  const indexFile = path.join(outputPath, 'index.html');

  if (fs.existsSync(indexFile)) {
    const files = fs.readdirSync(outputPath);
    const staticFiles = files.filter(f => 
      f.endsWith('.html') || f.endsWith('.js') || f.endsWith('.css')
    );
    
    console.log('✅ Build completed successfully!');
    console.log(`📦 Output: ${staticFiles.length} static files in dist/public/`);
    console.log(`🎯 Files: ${staticFiles.slice(0, 5).join(', ')}${staticFiles.length > 5 ? '...' : ''}`);
    
    // Ensure proper structure for Vercel
    const stats = fs.statSync(indexFile);
    console.log(`📄 index.html: ${Math.round(stats.size / 1024)}KB`);
    
  } else {
    throw new Error('Build completed but index.html not found in expected location');
  }

} catch (error) {
  console.error('❌ Build failed:', error.message);
  
  // Provide helpful error context
  if (error.code === 'ETIMEDOUT') {
    console.error('💡 Build timed out. This is usually due to complex dependencies.');
  } else if (error.status === 137) {
    console.error('💡 Out of memory. Try increasing NODE_OPTIONS memory.');
  }
  
  process.exit(1);
}