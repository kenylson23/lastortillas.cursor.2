# Conectar Projeto Correto no Vercel

## 🔍 Situação Atual

- **Repositório Local**: `https://github.com/kenylson23/lastortillas.cursor.2`
- **Último Commit**: `8a4a54c` - Integração completa com Supabase
- **Problema**: Vercel não está conectado ao projeto correto

## 🚀 Soluções

### **Opção 1: Conectar Projeto Existente no Vercel**

1. **Acesse o [Dashboard do Vercel](https://vercel.com/dashboard)**
2. **Encontre o projeto existente** Las Tortillas
3. **Vá para Settings > Git**
4. **Clique em "Connect Git Repository"**
5. **Selecione**: `kenylson23/lastortillas.cursor.2`
6. **Configure as variáveis de ambiente**:
   ```bash
   SUPABASE_URL=https://nuoblhgwtxyrafbyxjkw.supabase.co
   SUPABASE_ANON_KEY=sua_chave_anonima_aqui
   ```

### **Opção 2: Criar Novo Projeto no Vercel**

1. **Acesse o [Dashboard do Vercel](https://vercel.com/dashboard)**
2. **Clique em "New Project"**
3. **Selecione "Import Git Repository"**
4. **Escolha**: `kenylson23/lastortillas.cursor.2`
5. **Configure o projeto**:
   - **Framework Preset**: Vite
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. **Configure as variáveis de ambiente**
7. **Clique em "Deploy"**

### **Opção 3: Deploy via CLI do Vercel**

1. **Instale o Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Faça login**:
   ```bash
   vercel login
   ```

3. **Configure o projeto**:
   ```bash
   vercel
   ```

4. **Configure as variáveis**:
   ```bash
   vercel env add SUPABASE_URL
   vercel env add SUPABASE_ANON_KEY
   ```

5. **Deploy para produção**:
   ```bash
   vercel --prod
   ```

## 🔧 Configuração das Variáveis de Ambiente

### **No Dashboard do Vercel:**

1. **Vá para Settings > Environment Variables**
2. **Adicione as variáveis**:

   **SUPABASE_URL**
   - Value: `https://nuoblhgwtxyrafbyxjkw.supabase.co`
   - Environment: Production, Preview, Development

   **SUPABASE_ANON_KEY**
   - Value: Sua chave anônima do Supabase
   - Environment: Production, Preview, Development

### **Via CLI:**

```bash
vercel env add SUPABASE_URL
# Digite: https://nuoblhgwtxyrafbyxjkw.supabase.co

vercel env add SUPABASE_ANON_KEY
# Digite: sua_chave_anonima_aqui
```

## 📋 Checklist de Configuração

### **Antes do Deploy**
- [ ] Projeto conectado ao repositório correto
- [ ] Variáveis de ambiente configuradas
- [ ] Framework detectado (Vite)
- [ ] Build local funcionando

### **Durante o Deploy**
- [ ] Build sem erros
- [ ] Variáveis de ambiente aplicadas
- [ ] Deploy concluído com sucesso

### **Após o Deploy**
- [ ] URL de produção acessível
- [ ] Login funcionando
- [ ] Conexão com Supabase testada

## 🛠️ Troubleshooting

### **Problemas Comuns**

1. **Repositório não encontrado**
   - Verifique se o repositório está público
   - Confirme se você tem acesso ao repositório
   - Verifique se o nome está correto: `lastortillas.cursor.2`

2. **Build Fails**
   - Verifique se o `package.json` está na raiz
   - Confirme se o Node.js está na versão correta
   - Verifique os logs de build

3. **Variáveis de Ambiente**
   - Confirme que as variáveis estão configuradas
   - Verifique se estão em todos os ambientes
   - Teste a conexão com Supabase

## 🎯 URLs Importantes

- **Dashboard do Vercel**: [vercel.com/dashboard](https://vercel.com/dashboard)
- **GitHub Repository**: [github.com/kenylson23/lastortillas.cursor.2](https://github.com/kenylson23/lastortillas.cursor.2)
- **Supabase Dashboard**: [supabase.com/dashboard](https://supabase.com/dashboard)

## 🚀 Próximos Passos

1. **Acesse o dashboard do Vercel**
2. **Conecte o projeto** ao repositório correto
3. **Configure as variáveis** de ambiente
4. **Faça o deploy**
5. **Teste a aplicação** em produção

O projeto está **pronto para deploy** com todas as integrações do Supabase! 🎉 