#!/usr/bin/env node

// Vercel build script for Las Tortillas Mexican Grill
// This script prepares the project for deployment on Vercel

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🏗️  Starting Vercel build process...');

try {
  // 1. Build the frontend
  console.log('📦 Building frontend with Vite...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // 2. Generate Prisma client
  console.log('🔧 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // 3. Copy API files to correct location
  console.log('📁 Preparing API files...');
  
  // 4. Create build info
  const buildInfo = {
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    platform: process.platform,
  };
  
  fs.writeFileSync(
    path.join(__dirname, 'dist', 'build-info.json'),
    JSON.stringify(buildInfo, null, 2)
  );
  
  console.log('✅ Build completed successfully!');
  
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}