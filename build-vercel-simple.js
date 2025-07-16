#!/usr/bin/env node

import { build } from 'vite';
import { execSync } from 'child_process';
import fs from 'fs';

async function buildForVercel() {
  console.log('🏗️ Building Las Tortillas for Vercel...');
  
  try {
    // 1. Gerar Prisma Client
    console.log('🔗 Generating Prisma Client...');
    execSync('npx prisma generate', { stdio: 'inherit' });

    // 2. Build frontend
    console.log('📦 Building frontend...');
    await build({
      build: {
        outDir: 'dist',
        emptyOutDir: true,
        target: 'es2015',
        minify: 'terser',
        rollupOptions: {
          output: {
            manualChunks: {
              vendor: ['react', 'react-dom'],
              ui: ['@radix-ui/react-dialog', '@radix-ui/react-select'],
              query: ['@tanstack/react-query']
            }
          }
        }
      }
    });

    // 3. Copiar arquivos estáticos
    console.log('📁 Copying static files...');
    if (fs.existsSync('public')) {
      execSync('cp -r public/* dist/', { stdio: 'inherit' });
    }

    // 4. Verificar arquivos API
    console.log('🔍 Checking API files...');
    const apiFiles = ['auth.ts', 'menu.ts', 'restaurant.ts', 'tables.ts', 'health.ts', 'index.ts'];
    for (const file of apiFiles) {
      if (!fs.existsSync(`api/${file}`)) {
        console.error(`❌ Missing API file: api/${file}`);
        process.exit(1);
      }
    }

    console.log('✅ Build completed successfully!');
    console.log('🚀 Ready for Vercel deployment');
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

buildForVercel().catch(console.error);