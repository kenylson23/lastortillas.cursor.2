#!/usr/bin/env node
// Simple build script for Vercel deployment

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Building frontend for Vercel...');

try {
  // Build frontend only
  execSync('npx vite build --config vite.config.vercel.ts', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'production',
      VERCEL: '1'
    }
  });
  
  // Create 404.html for SPA routing
  const indexPath = path.join('dist', 'index.html');
  if (fs.existsSync(indexPath)) {
    fs.copyFileSync(indexPath, path.join('dist', '404.html'));
    console.log('✅ Created 404.html for SPA routing');
  }
  
  // Create uploads directory
  const uploadsDir = path.join('dist', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✅ Created uploads directory');
  }
  
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}