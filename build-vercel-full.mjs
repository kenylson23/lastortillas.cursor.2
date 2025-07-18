#!/usr/bin/env node
// Build script específico para deployment no Vercel com Serverless Functions

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🚀 Building Las Tortillas for Vercel with Serverless Functions...');

try {
  // 1. Create Vercel build structure
  console.log('📁 Creating Vercel deployment structure...');
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }
  
  fs.mkdirSync('dist', { recursive: true });
  fs.mkdirSync('dist/api', { recursive: true });

  // 2. Copy API functions
  console.log('📦 Copying API functions...');
  fs.cpSync('api', 'dist/api', { recursive: true });

  // 3. Copy lib and shared directories
  console.log('📦 Copying utilities...');
  fs.cpSync('lib', 'dist/lib', { recursive: true });
  fs.cpSync('shared', 'dist/shared', { recursive: true });

  // 4. Copy essential files
  console.log('📄 Copying configuration files...');
  fs.copyFileSync('vercel.json', 'dist/vercel.json');
  
  // Create package.json for Vercel
  const packageJson = {
    "name": "las-tortillas-vercel",
    "version": "1.0.0",
    "type": "module",
    "dependencies": {
      "@neondatabase/serverless": "^0.9.0",
      "@vercel/node": "^3.0.21",
      "drizzle-orm": "^0.30.0",
      "drizzle-zod": "^0.5.1",
      "zod": "^3.22.4",
      "clsx": "^2.0.0",
      "tailwind-merge": "^2.0.0"
    }
  };
  fs.writeFileSync('dist/package.json', JSON.stringify(packageJson, null, 2));

  // 5. Create a simple index.html for now
  console.log('📄 Creating frontend entry point...');
  const indexHtml = `<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Las Tortillas Mexican Grill - API Ready</title>
</head>
<body>
    <h1>Las Tortillas Mexican Grill</h1>
    <p>API endpoints ready for Vercel deployment!</p>
    <ul>
        <li><a href="/api/menu-items">/api/menu-items</a></li>
        <li><a href="/api/reservations">/api/reservations</a></li>
        <li><a href="/api/orders">/api/orders</a></li>
        <li><a href="/api/tables">/api/tables</a></li>
    </ul>
</body>
</html>`;
  fs.writeFileSync('dist/index.html', indexHtml);

  console.log('✅ Vercel backend build completed!');
  console.log('📦 Output: dist/');
  console.log('🎯 Files ready:');
  console.log('  - API functions: /api/*.ts');
  console.log('  - Database utilities: /lib/db.ts');
  console.log('  - Schemas: /shared/schema.ts');
  console.log('  - Configuration: vercel.json');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}