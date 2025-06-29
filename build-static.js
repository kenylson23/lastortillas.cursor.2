#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('Building static version for Vercel...');

try {
  // Remove problematic UI components and simplify
  console.log('Simplifying components...');
  
  // Create a simple static build without complex dependencies
  execSync('cd client && npx vite build --outDir ../dist --emptyOutDir --mode production', { 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });
  
  console.log('Build completed successfully');
  
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}