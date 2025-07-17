#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Building Las Tortillas for Vercel...');

try {
  // Limpar builds anteriores
  if (fs.existsSync('dist')) {
    console.log('🧹 Limpando build anterior do frontend...');
    fs.rmSync('dist', { recursive: true, force: true });
  }
  
  if (fs.existsSync('api-build')) {
    console.log('🧹 Limpando build anterior das APIs...');
    fs.rmSync('api-build', { recursive: true, force: true });
  }

  // Configurar variáveis de ambiente para Vercel
  const buildEnv = {
    ...process.env,
    NODE_ENV: 'production',
    VERCEL: '1',
    REPL_ID: undefined // Desabilitar plugins Replit
  };

  // 1. Compilar APIs TypeScript
  console.log('🔧 Compilando APIs TypeScript...');
  execSync('npx tsc --project tsconfig.api.json', {
    stdio: 'inherit',
    env: buildEnv,
    timeout: 60000
  });

  // 2. Verificar se APIs foram compiladas corretamente
  if (!fs.existsSync('api-build/api')) {
    throw new Error('Falha na compilação das APIs - diretório api-build/api não encontrado');
  }

  // 3. Copiar arquivos compilados para estrutura correta do Vercel
  console.log('📂 Organizando estrutura das APIs para Vercel...');
  
  // Verificar se api/ já existe e fazer backup se necessário
  if (fs.existsSync('api-compiled')) {
    fs.rmSync('api-compiled', { recursive: true, force: true });
  }
  
  // Copiar APIs compiladas
  fs.mkdirSync('api-compiled', { recursive: true });
  execSync('cp -r api-build/api/* api-compiled/', { stdio: 'inherit' });
  
  // Copiar shared compilado se existir
  if (fs.existsSync('api-build/shared')) {
    execSync('cp -r api-build/shared api-compiled/', { stdio: 'inherit' });
  }

  // 4. Build do frontend com Vite
  console.log('📦 Construindo frontend...');
  execSync('npx vite build', { 
    stdio: 'inherit',
    env: buildEnv,
    timeout: 120000 // 2 minutos
  });

  // Mover arquivos de dist/public para dist se necessário
  const distPublicPath = path.join('dist', 'public');
  if (fs.existsSync(distPublicPath)) {
    console.log('📂 Movendo arquivos do build...');
    const files = fs.readdirSync(distPublicPath);
    files.forEach(file => {
      const src = path.join(distPublicPath, file);
      const dest = path.join('dist', file);
      fs.renameSync(src, dest);
    });
    fs.rmdirSync(distPublicPath);
  }

  // Verificar se index.html foi criado
  const indexPath = path.join('dist', 'index.html');
  if (!fs.existsSync(indexPath)) {
    throw new Error('Build falhou - index.html não encontrado');
  }

  // Criar 404.html para SPA routing
  console.log('🔄 Criando 404.html para SPA routing...');
  fs.copyFileSync(indexPath, path.join('dist', '404.html'));

  // Criar diretório uploads
  const uploadsDir = path.join('dist', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    console.log('📁 Criando diretório uploads...');
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Copiar assets estáticos do public se existirem
  if (fs.existsSync('public')) {
    console.log('📋 Copiando assets estáticos...');
    try {
      execSync('cp -r public/* dist/ 2>/dev/null || true', { stdio: 'inherit' });
    } catch (error) {
      console.log('⚠️ Nenhum asset estático para copiar');
    }
  }

  // 5. Verificar estrutura final
  console.log('🔍 Verificando estrutura do build...');
  
  // Verificar frontend
  const distFiles = fs.readdirSync('dist');
  console.log('📁 Frontend (dist/):');
  distFiles.forEach(file => console.log(`   - ${file}`));
  
  // Verificar APIs compiladas
  if (fs.existsSync('api-compiled')) {
    const apiFiles = fs.readdirSync('api-compiled');
    console.log('📁 APIs compiladas (api-compiled/):');
    apiFiles.forEach(file => console.log(`   - ${file}`));
  }

  // 6. Criar estrutura final otimizada para Vercel
  console.log('🔄 Criando estrutura final para Vercel...');
  
  // Manter api/ original para TypeScript e api-compiled/ para JavaScript fallback
  console.log('📋 Estrutura mantida:');
  console.log('  - api/ (TypeScript original - Vercel usa esta)');
  console.log('  - api-compiled/ (JavaScript compilado - backup)'); 
  console.log('  - shared/ (Schema TypeScript)');
  console.log('  - dist/ (Frontend estático)');

  // 7. Limpar build temporário
  if (fs.existsSync('api-build')) {
    fs.rmSync('api-build', { recursive: true, force: true });
  }

  console.log('✅ Build concluído com sucesso!');

  // 8. Calcular tamanhos
  try {
    const frontendSize = execSync('du -sh dist', { encoding: 'utf8' }).trim();
    console.log(`📊 Tamanho do frontend: ${frontendSize}`);
    
    if (fs.existsSync('api-compiled')) {
      const apiSize = execSync('du -sh api-compiled', { encoding: 'utf8' }).trim();
      console.log(`📊 Tamanho das APIs: ${apiSize}`);
    }
  } catch (error) {
    console.log('📊 Não foi possível calcular tamanhos do build');
  }

} catch (error) {
  console.error('❌ Erro no build:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}