// Teste de Conexão com Supabase
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Carregar variáveis de ambiente
dotenv.config()

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

console.log('🔍 Testando conexão com Supabase...')
console.log('URL:', supabaseUrl)
console.log('Anon Key:', supabaseAnonKey ? '✅ Configurada' : '❌ Não configurada')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente não configuradas!')
  console.log('Configure as variáveis SUPABASE_URL e SUPABASE_ANON_KEY no arquivo .env')
  process.exit(1)
}

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  try {
    console.log('\n📡 Testando conexão...')
    
    // Teste 1: Verificar se consegue conectar
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('❌ Erro na conexão:', error.message)
      return false
    }
    
    console.log('✅ Conexão estabelecida com sucesso!')
    console.log('📊 Dados encontrados:', data?.length || 0, 'registros')
    
    // Teste 2: Verificar tabelas disponíveis
    console.log('\n📋 Verificando tabelas...')
    const tables = ['menu_items', 'orders', 'order_items', 'reservations', 'tables', 'users', 'sessions', 'contacts']
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count')
          .limit(1)
        
        if (error) {
          console.log(`❌ ${table}: ${error.message}`)
        } else {
          console.log(`✅ ${table}: Disponível`)
        }
      } catch (err) {
        console.log(`❌ ${table}: ${err.message}`)
      }
    }
    
    return true
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message)
    return false
  }
}

// Executar teste
testConnection().then(success => {
  if (success) {
    console.log('\n🎉 Teste de conexão concluído com sucesso!')
  } else {
    console.log('\n💥 Teste de conexão falhou!')
    process.exit(1)
  }
}) 