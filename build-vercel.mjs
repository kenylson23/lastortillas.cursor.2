#!/usr/bin/env node

/**
 * Script de build optimizado para deploy no Vercel
 * Constrói o projeto Las Tortillas Mexican Grill para produção
 */

import { execSync } from 'child_process';
import { rmSync, existsSync } from 'fs';
import { join } from 'path';

console.log('🚀 Iniciando build para Vercel...\n');

// Função para executar comandos com logs
function runCommand(command, description) {
  console.log(`📦 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} concluído\n`);
  } catch (error) {
    console.error(`❌ Erro em ${description}:`, error.message);
    process.exit(1);
  }
}

// Limpar builds anteriores
const distDir = join(process.cwd(), 'dist');
if (existsSync(distDir)) {
  console.log('🧹 Limpando build anterior...');
  rmSync(distDir, { recursive: true, force: true });
  console.log('✅ Build anterior limpo\n');
}

// Verificar se o banco de dados está configurado
console.log('🔍 Verificando configuração do banco de dados...');
if (!process.env.DATABASE_URL) {
  console.warn('⚠️  DATABASE_URL não configurado - será necessário no Vercel');
} else {
  console.log('✅ DATABASE_URL configurado\n');
}

// Build do frontend
runCommand('vite build', 'Build do frontend');

// Verificar se o build foi bem-sucedido
const buildOutput = join(process.cwd(), 'dist');
if (!existsSync(buildOutput)) {
  console.error('❌ Erro: Diretório de build não encontrado');
  process.exit(1);
}

// Verificar se as serverless functions estão corretas
console.log('🔍 Verificando serverless functions...');
const apiFiles = ['api/menu-items.ts', 'api/orders.ts', 'api/reservations.ts', 'api/tables.ts'];
const missingFiles = apiFiles.filter(file => !existsSync(file));

if (missingFiles.length > 0) {
  console.error('❌ Arquivos API ausentes:', missingFiles.join(', '));
  process.exit(1);
}

console.log('✅ Todas as serverless functions encontradas\n');

// Verificar dependências críticas
console.log('🔍 Verificando dependências críticas...');
const criticalDeps = ['@vercel/node', 'pg', 'drizzle-orm'];
const packageJson = JSON.parse(execSync('cat package.json', { encoding: 'utf8' }));

const missingDeps = criticalDeps.filter(dep => 
  !packageJson.dependencies[dep] && !packageJson.devDependencies[dep]
);

if (missingDeps.length > 0) {
  console.error('❌ Dependências ausentes:', missingDeps.join(', '));
  process.exit(1);
}

console.log('✅ Dependências críticas verificadas\n');

// Verificar configuração do Vercel
console.log('🔍 Verificando configuração do Vercel...');
if (!existsSync('vercel.json')) {
  console.error('❌ Arquivo vercel.json não encontrado');
  process.exit(1);
}

const vercelConfig = JSON.parse(execSync('cat vercel.json', { encoding: 'utf8' }));
console.log('✅ Configuração do Vercel verificada\n');

console.log('🎉 Build para Vercel concluído com sucesso!');
console.log('\n📋 Resumo:');
console.log('• Frontend: Construído com Vite');
console.log('• Backend: Serverless Functions prontas');
console.log('• Database: PostgreSQL com Drizzle ORM');
console.log('• Runtime: Node.js 20.x');
console.log('\n💡 Próximos passos:');
console.log('1. Configurar DATABASE_URL no Vercel');
console.log('2. Fazer deploy: vercel --prod');
console.log('3. Executar db:push após deploy');