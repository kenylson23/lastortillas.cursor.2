#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('Building Las Tortilhas for Vercel deployment...');

try {
  // Run Vite build from client directory
  process.chdir('./client');
  execSync('npx vite build --outDir ../dist', { stdio: 'inherit' });
  
  console.log('Build completed successfully');
  console.log('Output directory: dist/');
  
  // Verify the build output
  const distPath = path.join(__dirname, 'dist');
  if (fs.existsSync(path.join(distPath, 'index.html'))) {
    console.log('index.html found in dist/');
  } else {
    console.error('index.html not found in dist/');
    process.exit(1);
  }
  
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}