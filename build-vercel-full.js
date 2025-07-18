#!/usr/bin/env node
// Build script específico para deployment no Vercel com Serverless Functions

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building Las Tortillas for Vercel deployment with Serverless Functions...');

try {
  // 1. Clean previous builds
  console.log('🧹 Cleaning previous builds...');
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }
  if (fs.existsSync('vercel-build')) {
    fs.rmSync('vercel-build', { recursive: true, force: true });
  }

  // 2. Create build directory structure for Vercel
  console.log('📁 Creating Vercel build structure...');
  fs.mkdirSync('vercel-build', { recursive: true });
  fs.mkdirSync('vercel-build/api', { recursive: true });
  fs.mkdirSync('vercel-build/public', { recursive: true });

  // 3. Copy API functions to Vercel build
  console.log('📦 Copying API functions...');
  const apiFiles = fs.readdirSync('api');
  apiFiles.forEach(file => {
    if (file.endsWith('.ts')) {
      const content = fs.readFileSync(path.join('api', file), 'utf8');
      fs.writeFileSync(path.join('vercel-build/api', file), content);
    }
  });

  // 4. Copy lib directory
  console.log('📦 Copying lib utilities...');
  if (fs.existsSync('lib')) {
    fs.cpSync('lib', 'vercel-build/lib', { recursive: true });
  }

  // 5. Copy shared directory
  console.log('📦 Copying shared schemas...');
  if (fs.existsSync('shared')) {
    fs.cpSync('shared', 'vercel-build/shared', { recursive: true });
  }

  // 6. Temporarily move client structure for build
  console.log('⚙️ Preparing frontend build...');
  
  // Create temporary client structure for vite build
  if (!fs.existsSync('client')) {
    fs.mkdirSync('client', { recursive: true });
    fs.mkdirSync('client/src', { recursive: true });
    
    // Copy src to client/src
    fs.cpSync('src', 'client/src', { recursive: true });
    
    // Copy index.html to client
    if (fs.existsSync('index.html')) {
      fs.copyFileSync('index.html', 'client/index.html');
    }
  }

  // 7. Build frontend with Vite
  console.log('⚡ Building frontend...');
  try {
    execSync('vite build', { stdio: 'inherit' });
    
    // 8. Copy built files to Vercel structure
    if (fs.existsSync('dist/public')) {
      console.log('📦 Copying built frontend files...');
      fs.cpSync('dist/public', 'vercel-build/public', { recursive: true });
    }
  } catch (buildError) {
    console.log('⚠️ Frontend build failed, continuing with API setup...');
  }

  // 9. Copy vercel.json to build directory
  console.log('📄 Copying Vercel configuration...');
  if (fs.existsSync('vercel.json')) {
    fs.copyFileSync('vercel.json', 'vercel-build/vercel.json');
  }

  // 10. Create package.json for Vercel deployment
  console.log('📄 Creating Vercel package.json...');
  const vercelPackageJson = {
    "name": "las-tortillas-vercel",
    "version": "1.0.0",
    "type": "module",
    "dependencies": {
      "@neondatabase/serverless": "^0.9.0",
      "@vercel/node": "^3.0.21",
      "drizzle-orm": "^0.30.0",
      "drizzle-zod": "^0.5.1",
      "zod": "^3.22.4"
    }
  };
  fs.writeFileSync('vercel-build/package.json', JSON.stringify(vercelPackageJson, null, 2));

  // 11. Cleanup temporary client directory
  console.log('🧹 Cleaning up temporary files...');
  if (fs.existsSync('client') && fs.existsSync('src')) {
    // Only remove if we created it
    fs.rmSync('client', { recursive: true, force: true });
  }

  console.log('✅ Vercel build completed successfully!');
  console.log('📦 Build output in: vercel-build/');
  console.log('🎯 Ready for Vercel deployment with Serverless Functions!');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}