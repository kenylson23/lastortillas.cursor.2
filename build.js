#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Building Las Tortillas for Vercel...');

try {
  // Limpar dist anterior
  if (fs.existsSync('dist')) {
    console.log('🧹 Limpando build anterior...');
    fs.rmSync('dist', { recursive: true, force: true });
  }

  // Configurar variáveis de ambiente para Vercel
  const buildEnv = {
    ...process.env,
    NODE_ENV: 'production',
    VERCEL: '1',
    REPL_ID: undefined // Desabilitar plugins Replit
  };

  // Build do frontend com Vite
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

  // Verificação final
  const distFiles = fs.readdirSync('dist');
  console.log('📁 Arquivos criados no build:');
  distFiles.forEach(file => console.log(`   - ${file}`));

  console.log('✅ Build concluído com sucesso!');

  // Calcular tamanho do build
  try {
    const buildSize = execSync('du -sh dist', { encoding: 'utf8' }).trim();
    console.log('📊 Tamanho do build:', buildSize);
  } catch (error) {
    console.log('📊 Não foi possível calcular o tamanho do build');
  }

} catch (error) {
  console.error('❌ Erro no build:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}