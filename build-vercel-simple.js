#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Building Las Tortillas Mexican Grill for Vercel...');

try {
  // Clean previous builds
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }

  // Build the static application using our simple config
  console.log('Building static application...');
  
  // Create a simple vite config inline to avoid import issues
  const viteConfig = `
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

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
        manualChunks: undefined
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve('./client/src'),
      '@shared': path.resolve('./shared'),
      '@assets': path.resolve('./attached_assets')
    }
  },
  define: {
    'process.env.NODE_ENV': '"production"'
  }
});
`;

  // Write temporary config
  fs.writeFileSync('vite.config.vercel.js', viteConfig);

  // Run build
  execSync('vite build --config vite.config.vercel.js', {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'production'
    }
  });

  // Copy public assets
  const publicPath = './public';
  const distPath = './dist';
  
  if (fs.existsSync(publicPath)) {
    const files = fs.readdirSync(publicPath);
    files.forEach(file => {
      const srcPath = path.join(publicPath, file);
      const destPath = path.join(distPath, file);
      
      if (fs.statSync(srcPath).isDirectory()) {
        fs.cpSync(srcPath, destPath, { recursive: true });
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    });
    console.log('Public assets copied to dist/');
  }

  // Clean up temp config
  fs.unlinkSync('vite.config.vercel.js');

  // Verify build
  const indexFile = path.join(distPath, 'index.html');
  if (fs.existsSync(indexFile)) {
    console.log('Build completed successfully!');
    console.log(`Output: ${fs.readdirSync(distPath).length} files in dist/`);
  } else {
    throw new Error('Build failed: index.html not found');
  }

} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}