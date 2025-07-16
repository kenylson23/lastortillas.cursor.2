#!/usr/bin/env node
/**
 * Build Clean Script - Remove Replit dependencies for Vercel deployment
 * This script ensures zero conflicts between Replit and Vercel environments
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

interface PackageJson {
  name?: string;
  version?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  [key: string]: any;
}

console.log('🧹 Cleaning Replit dependencies for Vercel build...');

function removeReplitDeps(): void {
  const packagePath = path.resolve(process.cwd(), 'package.json');
  if (!fs.existsSync(packagePath)) {
    console.log('❌ package.json not found at:', packagePath);
    return;
  }

  const packageJson: PackageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  // Dependencies problemáticas do Replit
  const replitDeps: string[] = [
    '@replit/vite-plugin-cartographer',
    '@replit/vite-plugin-runtime-error-modal'
  ];

  let modified = false;

  // Remove das devDependencies
  if (packageJson.devDependencies) {
    replitDeps.forEach(dep => {
      if (packageJson.devDependencies![dep]) {
        delete packageJson.devDependencies![dep];
        console.log(`🗑️  Removed ${dep} from devDependencies`);
        modified = true;
      }
    });
  }

  // Remove das dependencies principais se existir
  if (packageJson.dependencies) {
    replitDeps.forEach(dep => {
      if (packageJson.dependencies![dep]) {
        delete packageJson.dependencies![dep];
        console.log(`🗑️  Removed ${dep} from dependencies`);
        modified = true;
      }
    });
  }

  if (modified) {
    // Cria backup do package.json original
    const backupPath = path.resolve(process.cwd(), 'package.json.backup');
    fs.writeFileSync(backupPath, fs.readFileSync(packagePath));
    console.log('💾 Created package.json.backup');
    
    // Escreve package.json limpo
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    console.log('✅ package.json cleaned for Vercel');
  } else {
    console.log('✅ No Replit dependencies found - package.json is clean');
  }
}

function restorePackageJson(): void {
  const backupPath = path.resolve(process.cwd(), 'package.json.backup');
  const packagePath = path.resolve(process.cwd(), 'package.json');
  
  if (fs.existsSync(backupPath)) {
    fs.renameSync(backupPath, packagePath);
    console.log('🔄 Restored original package.json');
  }
}

// Função principal
function cleanBuild(): void {
  try {
    // Limpa dependências Replit
    removeReplitDeps();
    
    // Reinstala dependências limpas
    console.log('📦 Reinstalling clean dependencies...');
    execSync('npm install --production=false', { stdio: 'inherit' });
    
    console.log('✅ Clean build environment ready');
    
  } catch (error) {
    console.error('❌ Error during clean build:', (error as Error).message);
    restorePackageJson();
    process.exit(1);
  }
}

// Executa limpeza se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  cleanBuild();
}

export { cleanBuild, restorePackageJson };