#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Building Las Tortillas for Vercel...');

try {
  // 1. Build frontend with Vite
  console.log('📦 Building frontend...');
  execSync('vite build', { stdio: 'inherit' });

  // 2. Move files from dist/public to dist if needed
  if (fs.existsSync('dist/public')) {
    console.log('📁 Moving files from dist/public to dist...');
    const files = fs.readdirSync('dist/public');
    files.forEach(file => {
      fs.renameSync(path.join('dist/public', file), path.join('dist', file));
    });
    fs.rmdirSync('dist/public');
  }

  // 3. Copy uploads directory
  if (fs.existsSync('public/uploads')) {
    console.log('📸 Copying uploads directory...');
    if (!fs.existsSync('dist/uploads')) {
      fs.mkdirSync('dist/uploads', { recursive: true });
    }
    const copyDir = (src, dest) => {
      const files = fs.readdirSync(src);
      files.forEach(file => {
        const srcPath = path.join(src, file);
        const destPath = path.join(dest, file);
        if (fs.statSync(srcPath).isDirectory()) {
          fs.mkdirSync(destPath, { recursive: true });
          copyDir(srcPath, destPath);
        } else {
          fs.copyFileSync(srcPath, destPath);
        }
      });
    };
    copyDir('public/uploads', 'dist/uploads');
  }

  // 4. Create 404.html for SPA routing
  if (fs.existsSync('dist/index.html')) {
    console.log('🔄 Creating 404.html for SPA routing...');
    fs.copyFileSync('dist/index.html', 'dist/404.html');
  }

  console.log('✅ Build completed successfully!');
  console.log('📁 Files in dist directory:');
  const distFiles = fs.readdirSync('dist');
  distFiles.forEach(file => console.log(`  - ${file}`));

} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}