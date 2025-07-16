#!/usr/bin/env node

/**
 * Build script otimizado para Vercel
 * Remove compilação de servidor desnecessária
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, copyFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

console.log('🚀 Las Tortillas - Build para Vercel');

try {
  // Executar apenas o build do frontend
  console.log('📦 Construindo frontend...');
  
  // Timeout de 2 minutos para o build
  const buildProcess = execSync('vite build', { 
    stdio: 'inherit',
    timeout: 120000, // 2 minutos
    cwd: __dirname
  });
  
  console.log('✅ Frontend construído com sucesso!');
  
  // Mover arquivos de dist/public para dist (Vercel espera em dist/)
  if (existsSync('dist/public')) {
    console.log('📁 Movendo arquivos para estrutura do Vercel...');
    execSync('mv dist/public/* dist/', { stdio: 'inherit' });
    execSync('rmdir dist/public', { stdio: 'inherit' });
    console.log('✅ Estrutura corrigida para Vercel');
  }
  
  // Verificar se o build foi criado
  if (existsSync('dist')) {
    console.log('✅ Diretório dist/ criado');
    
    // Verificar arquivos essenciais
    const essentialFiles = ['index.html', 'assets'];
    for (const file of essentialFiles) {
      if (existsSync(`dist/${file}`)) {
        console.log(`✅ ${file} encontrado`);
      } else {
        console.log(`⚠️  ${file} não encontrado`);
      }
    }
  } else {
    throw new Error('Diretório dist não foi criado');
  }
  
  // Copiar arquivos necessários para produção
  if (existsSync('public/uploads')) {
    console.log('📁 Copiando uploads...');
    if (!existsSync('dist/uploads')) {
      mkdirSync('dist/uploads', { recursive: true });
    }
    execSync('cp -r public/uploads/* dist/uploads/', { stdio: 'inherit' });
    console.log('✅ Uploads copiados');
  }
  
  // Criar 404.html para SPA
  if (existsSync('dist/index.html')) {
    copyFileSync('dist/index.html', 'dist/404.html');
    console.log('✅ 404.html criado para SPA');
  }
  
  console.log('\n🎉 Build concluído com sucesso!');
  console.log('📊 Estatísticas:');
  
  // Mostrar estatísticas do build
  try {
    const stats = execSync('du -sh dist/', { encoding: 'utf8' });
    console.log(`   Tamanho total: ${stats.trim().split('\t')[0]}`);
  } catch (e) {
    console.log('   Tamanho: Calculando...');
  }
  
  console.log('\n✅ Pronto para deploy no Vercel!');
  
} catch (error) {
  console.error('❌ Erro no build:', error.message);
  
  // Informações de diagnóstico
  console.log('\n🔍 Diagnóstico:');
  console.log('   - Verifique se node_modules está instalado');
  console.log('   - Execute: npm install');
  console.log('   - Tente: npm run dev primeiro');
  
  process.exit(1);
}