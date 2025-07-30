# Configuração das Variáveis de Ambiente no Vercel

## 🔧 Configuração Necessária

Para que a aplicação funcione corretamente no Vercel com o Supabase, você precisa configurar as seguintes variáveis de ambiente no dashboard do Vercel:

### 📋 Variáveis Obrigatórias

1. **SUPABASE_URL**
   - Valor: `https://nuoblhgwtxyrafbyxjkw.supabase.co`
   - Descrição: URL do seu projeto Supabase

2. **SUPABASE_ANON_KEY**
   - Valor: Sua chave anônima do Supabase
   - Descrição: Chave pública para autenticação

### 🚀 Como Configurar

1. **Acesse o Dashboard do Vercel**
   - Vá para [vercel.com/dashboard](https://vercel.com/dashboard)
   - Selecione seu projeto

2. **Vá para Settings > Environment Variables**
   - Clique em "Settings" no menu lateral
   - Selecione "Environment Variables"

3. **Adicione as Variáveis**
   - Clique em "Add New"
   - Adicione cada variável:
     - **Name**: `SUPABASE_URL`
     - **Value**: `https://nuoblhgwtxyrafbyxjkw.supabase.co`
     - **Environment**: Production, Preview, Development

   - **Name**: `SUPABASE_ANON_KEY`
   - **Value**: Sua chave anônima do Supabase
   - **Environment**: Production, Preview, Development

4. **Redeploy**
   - Após adicionar as variáveis, faça um novo deploy

### 🔍 Verificação

Para verificar se as variáveis estão configuradas corretamente:

1. **No Dashboard do Vercel**
   - Vá para "Deployments"
   - Clique no último deployment
   - Verifique os logs para erros de variáveis de ambiente

2. **Teste Local**
   ```bash
   npm run build
   npm run preview
   ```

### ⚠️ Importante

- As variáveis de ambiente são **case-sensitive**
- Certifique-se de que as variáveis estão disponíveis em **todos os ambientes** (Production, Preview, Development)
- Após adicionar as variáveis, faça um **novo deploy** para que elas sejam aplicadas

### 🛠️ Troubleshooting

Se a aplicação não funcionar no Vercel:

1. **Verifique os logs** no dashboard do Vercel
2. **Confirme** que as variáveis estão configuradas corretamente
3. **Teste localmente** com `npm run build && npm run preview`
4. **Verifique** se o Supabase está acessível

### 📞 Suporte

Se precisar de ajuda:
- Verifique os logs do Vercel
- Teste a conexão com o Supabase localmente
- Verifique se as credenciais estão corretas 