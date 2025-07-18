#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Building clean static app for Vercel...');

try {
  // Clean previous builds
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }

  // Create minimal Vite config for clean build
  const cleanConfig = `
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: './client',
  base: '/',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    assetsDir: 'assets',
    sourcemap: false,
    minify: true,
    rollupOptions: {
      output: {
        manualChunks: undefined,
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js'
      }
    }
  },
  resolve: {
    alias: {
      '@': './client/src',
      '@shared': './shared',
      '@assets': './attached_assets'
    }
  },
  define: {
    'process.env.NODE_ENV': '"production"'
  }
});
`;

  // Write clean config
  fs.writeFileSync('vite.config.clean.js', cleanConfig);

  // Build only what's needed
  execSync('vite build --config vite.config.clean.js', {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'production'
    }
  });

  // Only copy essential public assets (no duplicates)
  const publicPath = './public';
  const distPath = './dist';
  
  if (fs.existsSync(publicPath)) {
    // Copy only specific folders we need
    const essentialFolders = ['uploads']; // Only images uploaded by users
    
    essentialFolders.forEach(folder => {
      const srcPath = path.join(publicPath, folder);
      const destPath = path.join(distPath, folder);
      
      if (fs.existsSync(srcPath)) {
        fs.cpSync(srcPath, destPath, { recursive: true });
        console.log(`Copied ${folder}/ to dist/`);
      }
    });
  }

  // Clean up temp config
  fs.unlinkSync('vite.config.clean.js');

  // Verify build
  const indexFile = path.join(distPath, 'index.html');
  if (fs.existsSync(indexFile)) {
    const files = fs.readdirSync(distPath, { recursive: true }).filter(f => 
      typeof f === 'string' && !f.includes('/')
    );
    console.log('Clean build completed!');
    console.log(`Output: ${files.length} files in dist/`);
    console.log('Files:', files);
  } else {
    throw new Error('Build failed: index.html not found');
  }

} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}