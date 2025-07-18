#!/usr/bin/env node
import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync, mkdirSync } from 'fs';

const execAsync = promisify(exec);

async function buildForVercel() {
  try {
    console.log('🚀 Starting Vercel build process...');
    
    // Ensure directories exist
    if (!existsSync('dist')) {
      mkdirSync('dist', { recursive: true });
    }
    
    if (!existsSync('dist/public')) {
      mkdirSync('dist/public', { recursive: true });
    }

    // Build frontend with Vite
    console.log('🔨 Building frontend with Vite...');
    await execAsync('npx vite build', { 
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'production' }
    });

    // Build backend with esbuild
    console.log('🔧 Building backend with esbuild...');
    await execAsync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist');

    console.log('✅ Build completed successfully!');
    
    // Verify build outputs
    console.log('📁 Verifying build outputs...');
    if (existsSync('dist/public/index.html')) {
      console.log('✅ Frontend build found at dist/public/index.html');
    } else {
      console.log('❌ Frontend build missing!');
    }
    
    if (existsSync('dist/index.js')) {
      console.log('✅ Backend build found at dist/index.js');
    } else {
      console.log('❌ Backend build missing!');
    }
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

buildForVercel();