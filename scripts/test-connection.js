#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import postgres from 'postgres';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

console.log('🔍 Testando conexão com Supabase...\n');

// Testar cliente Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('❌ Variáveis SUPABASE_URL ou SUPABASE_ANON_KEY não encontradas');
  process.exit(1);
}

console.log('📋 Configurações encontradas:');
console.log(`- URL: ${supabaseUrl}`);
console.log(`- Anon Key: ${supabaseAnonKey.substring(0, 20)}...`);
console.log('');

// Testar cliente Supabase
try {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  console.log('✅ Cliente Supabase criado com sucesso');
} catch (error) {
  console.log('❌ Erro ao criar cliente Supabase:', error.message);
}

// Testar conexão direta com banco
const directUrl = process.env.SUPABASE_DB_DIRECT_URL;
const poolerUrl = process.env.SUPABASE_DB_URL;

console.log('\n🔗 Testando conexões de banco:');

if (directUrl) {
  console.log('📊 Testando URL direta...');
  try {
    const sql = postgres(directUrl, {
      max: 1,
      idle_timeout: 20,
      ssl: 'require'
    });
    
    const result = await sql`SELECT version()`;
    console.log('✅ Conexão direta funcionando');
    console.log(`   Versão: ${result[0].version}`);
    
    await sql.end();
  } catch (error) {
    console.log('❌ Erro na conexão direta:', error.message);
  }
}

if (poolerUrl) {
  console.log('📊 Testando pooler...');
  try {
    const sql = postgres(poolerUrl, {
      max: 1,
      idle_timeout: 20,
      ssl: 'require'
    });
    
    const result = await sql`SELECT version()`;
    console.log('✅ Pooler funcionando');
    console.log(`   Versão: ${result[0].version}`);
    
    await sql.end();
  } catch (error) {
    console.log('❌ Erro no pooler:', error.message);
  }
}

console.log('\n🎯 Recomendações:');
console.log('1. Se a conexão direta funcionar, use SUPABASE_DB_DIRECT_URL para migrações');
console.log('2. Se o pooler funcionar, use SUPABASE_DB_URL para a aplicação');
console.log('3. Se ambas funcionarem, use direta para migrações e pooler para app');