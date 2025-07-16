import { build } from 'vite';
import { build as esbuild } from 'esbuild';
import fs from 'fs';
import path from 'path';

async function buildForVercel() {
  console.log('🏗️ Building Las Tortillas for Vercel...');
  
  try {
    // 1. Build do frontend com Vite
    console.log('📦 Building frontend with Vite...');
    await build({
      root: 'client',
      build: {
        outDir: '../dist',
        emptyOutDir: true
      }
    });

    // 2. Build individual das funções serverless
    console.log('⚡ Building serverless functions...');
    const apiFunctions = ['auth', 'menu', 'restaurant', 'tables', 'health', 'index'];
    
    for (const func of apiFunctions) {
      await esbuild({
        entryPoints: [`api/${func}.ts`],
        bundle: true,
        platform: 'node',
        target: 'node18',
        format: 'esm',
        outfile: `api/${func}.js`,
        external: ['@prisma/client', 'bcryptjs', 'jsonwebtoken'],
        banner: {
          js: 'import { createRequire } from "module"; const require = createRequire(import.meta.url);'
        }
      });
    }

    // 3. Copiar arquivos estáticos
    console.log('📁 Copying static files...');
    if (fs.existsSync('client/public')) {
      fs.cpSync('client/public', 'dist', { recursive: true });
    }
    if (fs.existsSync('public')) {
      fs.cpSync('public', 'dist', { recursive: true });
    }

    // 4. Gerar Prisma Client
    console.log('🔗 Generating Prisma Client...');
    const { execSync } = await import('child_process');
    execSync('npx prisma generate', { stdio: 'inherit' });

    console.log('✅ Build completed successfully!');
    console.log('🚀 Ready for Vercel deployment');
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

buildForVercel().catch(console.error);