# Deploy Manual no Vercel

## 🚀 Como Fazer Deploy Manual

Se o deploy automático não iniciar após o push, você pode fazer o deploy manualmente:

### **Opção 1: Deploy via Dashboard do Vercel**

1. **Acesse o Dashboard do Vercel**
   - Vá para [vercel.com/dashboard](https://vercel.com/dashboard)
   - Faça login na sua conta

2. **Importe o Projeto**
   - Clique em "New Project"
   - Selecione "Import Git Repository"
   - Escolha o repositório: `lastortillas.cursor.2`
   - Clique em "Import"

3. **Configure o Projeto**
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (padrão)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Configure as Variáveis de Ambiente**
   - Clique em "Environment Variables"
   - Adicione:
     ```
     SUPABASE_URL=https://nuoblhgwtxyrafbyxjkw.supabase.co
     SUPABASE_ANON_KEY=sua_chave_anonima_aqui
     ```

5. **Deploy**
   - Clique em "Deploy"

### **Opção 2: Deploy via CLI do Vercel**

1. **Instale o Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Faça Login**
   ```bash
   vercel login
   ```

3. **Configure o Projeto**
   ```bash
   vercel
   ```

4. **Configure as Variáveis**
   ```bash
   vercel env add SUPABASE_URL
   vercel env add SUPABASE_ANON_KEY
   ```

5. **Deploy**
   ```bash
   vercel --prod
   ```

## 🔧 Configuração Necessária

### **Variáveis de Ambiente Obrigatórias**

```bash
SUPABASE_URL=https://nuoblhgwtxyrafbyxjkw.supabase.co
SUPABASE_ANON_KEY=sua_chave_anonima_aqui
```

### **Configurações do Projeto**

- **Framework**: Vite
- **Node.js Version**: 18.x ou superior
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## 🧪 Teste Local Antes do Deploy

```bash
# Instalar dependências
npm install

# Build local
npm run build

# Preview local
npm run preview

# Teste de conexão
node test-connection.js
```

## 📋 Checklist de Deploy

### **Antes do Deploy**
- [ ] Build local funcionando (`npm run build`)
- [ ] Preview local funcionando (`npm run preview`)
- [ ] Conexão com Supabase testada
- [ ] Login local funcionando

### **Durante o Deploy**
- [ ] Variáveis de ambiente configuradas
- [ ] Framework detectado corretamente (Vite)
- [ ] Build sem erros
- [ ] Deploy concluído com sucesso

### **Após o Deploy**
- [ ] URL de produção acessível
- [ ] Login funcionando
- [ ] Todas as funcionalidades testadas
- [ ] Conexão com Supabase funcionando

## 🛠️ Troubleshooting

### **Problemas Comuns**

1. **Build Fails**
   - Verifique se todas as dependências estão instaladas
   - Confirme que o Node.js está na versão correta
   - Verifique os logs de build no Vercel

2. **Variáveis de Ambiente**
   - Confirme que as variáveis estão configuradas
   - Verifique se os valores estão corretos
   - Certifique-se de que estão em todos os ambientes

3. **Conexão com Supabase**
   - Teste localmente primeiro
   - Verifique se o projeto Supabase está ativo
   - Confirme as credenciais

### **Logs Úteis**

```bash
# Build local
npm run build

# Teste de conexão
node test-connection.js

# Preview local
npm run preview
```

## 🎯 URLs Importantes

- **Dashboard do Vercel**: [vercel.com/dashboard](https://vercel.com/dashboard)
- **Supabase Dashboard**: [supabase.com/dashboard](https://supabase.com/dashboard)
- **GitHub Repository**: [github.com/kenylson23/lastortillas.cursor.2](https://github.com/kenylson23/lastortillas.cursor.2)

## 🚀 Próximos Passos

1. **Configure as variáveis** no Vercel
2. **Faça o deploy** (manual ou automático)
3. **Teste a aplicação** em produção
4. **Verifique todas as funcionalidades**
5. **Monitore** via Supabase Dashboard

O projeto está **pronto para deploy** com todas as funcionalidades integradas! 🎉 