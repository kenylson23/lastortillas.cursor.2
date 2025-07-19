#!/usr/bin/env node

/**
 * Script para configurar o banco de dados no Vercel após deploy
 * Execute depois do deploy com: node scripts/setup-vercel-db.js
 */

import { execSync } from 'child_process';
import { config } from 'dotenv';

// Carregar variáveis de ambiente
config();

console.log('🗄️ Configurando banco de dados no Vercel...\n');

// Verificar se DATABASE_URL está configurado
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL não configurado!');
  console.log('Configure no dashboard do Vercel ou no .env');
  process.exit(1);
}

console.log('✅ DATABASE_URL encontrado');

try {
  // Executar push do schema
  console.log('📦 Aplicando schema no banco...');
  execSync('npm run db:push', { stdio: 'inherit' });
  
  console.log('\n🎉 Banco de dados configurado com sucesso!');
  console.log('✅ Schema aplicado');
  console.log('✅ Tabelas criadas');
  console.log('✅ Dados de exemplo inseridos');
  
  console.log('\n📋 Vercel está pronto para usar:');
  console.log('• Frontend: Deploy concluído');
  console.log('• Backend: Serverless Functions ativas');
  console.log('• Database: Schema aplicado');
  
} catch (error) {
  console.error('❌ Erro ao configurar banco:', error.message);
  console.log('\n🔧 Soluções possíveis:');
  console.log('1. Verificar se DATABASE_URL está correto');
  console.log('2. Verificar conectividade com o banco PostgreSQL');
  console.log('3. Verificar permissões do banco');
  process.exit(1);
}