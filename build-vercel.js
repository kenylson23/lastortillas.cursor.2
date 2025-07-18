#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('Building Las Tortillas Mexican Grill for Vercel...');

try {
  // Clean previous builds
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }

  // Build the application
  console.log('Building static application...');
  execSync('vite build --config vite.config.static.ts', {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'production'
    }
  });

  // Copy public assets if they exist
  const publicPath = path.join(__dirname, 'public');
  const distPath = path.join(__dirname, 'dist');
  
  if (fs.existsSync(publicPath)) {
    const files = fs.readdirSync(publicPath, { withFileTypes: true });
    files.forEach(file => {
      const srcPath = path.join(publicPath, file.name);
      const destPath = path.join(distPath, file.name);
      
      if (file.isDirectory()) {
        fs.cpSync(srcPath, destPath, { recursive: true });
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    });
    console.log('Public assets copied to dist/');
  }

  // Verify build - check both possible locations
  const publicDistPath = path.join(distPath, 'public');
  let indexFile = path.join(distPath, 'index.html');
  
  if (!fs.existsSync(indexFile) && fs.existsSync(publicDistPath)) {
    indexFile = path.join(publicDistPath, 'index.html');
    
    // Move files from dist/public to dist for Vercel
    if (fs.existsSync(indexFile)) {
      const files = fs.readdirSync(publicDistPath);
      files.forEach(file => {
        const srcPath = path.join(publicDistPath, file);
        const destPath = path.join(distPath, file);
        
        if (fs.statSync(srcPath).isDirectory()) {
          fs.cpSync(srcPath, destPath, { recursive: true });
        } else {
          fs.copyFileSync(srcPath, destPath);
        }
      });
      
      // Remove the public subdirectory
      fs.rmSync(publicDistPath, { recursive: true, force: true });
      console.log('Moved files from dist/public to dist/');
    }
  }
  
  // Final verification
  const finalIndexFile = path.join(distPath, 'index.html');
  if (fs.existsSync(finalIndexFile)) {
    console.log('Build completed successfully!');
    console.log(`Output: ${fs.readdirSync(distPath).length} files in dist/`);
  } else {
    throw new Error('Build failed: index.html not found');
  }

} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}