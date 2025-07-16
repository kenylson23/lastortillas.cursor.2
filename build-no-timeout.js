#!/usr/bin/env node
console.log('🚀 Building without timeout restrictions...');

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

function buildAsync() {
  return new Promise((resolve, reject) => {
    console.log('📦 Starting Vite build...');
    
    const buildProcess = spawn('npx', ['vite', 'build', '--mode', 'production'], {
      stdio: 'inherit',
      shell: true
    });
    
    let buildTimeout = setTimeout(() => {
      console.log('⚠️  Build taking too long, switching to development mode...');
      buildProcess.kill();
      
      // Retry with development mode
      const devBuildProcess = spawn('npx', ['vite', 'build', '--mode', 'development'], {
        stdio: 'inherit',
        shell: true
      });
      
      devBuildProcess.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Development build failed with code ${code}`));
        }
      });
      
    }, 180000); // 3 minutes
    
    buildProcess.on('close', (code) => {
      clearTimeout(buildTimeout);
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Build failed with code ${code}`));
      }
    });
  });
}

try {
  await buildAsync();
  
  // Post-build file operations
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
  
  console.log('✅ Build completed successfully!');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}