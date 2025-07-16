# Guia Completo de Migração e Implantação - Replit para Vercel

## Visão Geral

Este guia detalha o processo completo de migração de uma aplicação full-stack do Replit para deployment em produção, baseado na experiência real do projeto CUCA Cerveja. Inclui soluções para todos os problemas comuns encontrados durante o processo.

## 1. Preparação da Aplicação

### 1.1 Estrutura de Arquivos Recomendada
```
projeto/
├── client/                 # Frontend React
│   ├── src/
│   └── public/
├── server/                 # Backend Express
├── shared/                 # Schemas e tipos compartilhados
├── api/                    # Rotas serverless para Vercel
├── public/                 # Assets estáticos
├── build-vercel.js         # Script de build customizado
├── vercel.json            # Configuração Vercel
├── tsconfig.vercel.json   # Config TypeScript para serverless
└── package.json
```

### 1.2 Dependências Essenciais
```json
{
  "dependencies": {
    "express": "^4.18.0",
    "react": "^18.0.0",
    "typescript": "^5.0.0",
    "drizzle-orm": "^0.28.0",
    "postgres": "^3.3.0",
    "@tanstack/react-query": "^4.0.0",
    "framer-motion": "^10.0.0",
    "tailwindcss": "^3.3.0"
  },
  "devDependencies": {
    "vite": "^4.4.0",
    "esbuild": "^0.19.0",
    "@types/express": "^4.17.0"
  }
}
```

## 2. Configuração do Banco de Dados

### 2.1 Migração para PostgreSQL (Supabase)

#### Problema Comum: Schemas Incompatíveis
**Solução Implementada:**
```typescript
// shared/schema.ts
import { pgTable, serial, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  email: text("email").notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

// Sempre usar createInsertSchema para validação
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  passwordHash: true
});
```

#### Configuração de Conexão
```typescript
// server/db.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const client = postgres(process.env.DATABASE_URL!, {
  ssl: process.env.NODE_ENV === "production" ? "require" : false
});

export const db = drizzle(client, { schema });
```

### 2.2 Variáveis de Ambiente Críticas
```env
DATABASE_URL=postgresql://user:pass@host:5432/db
SUPABASE_URL=https://projeto.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
JWT_SECRET=sua_chave_secreta_aqui
```

## 3. Sistema de Autenticação Dual

### 3.1 Problema: Incompatibilidade Serverless
**Contexto:** Sessions tradicionais não funcionam em ambiente serverless.

**Solução:** Sistema de autenticação dual implementado.

#### Autenticação JWT (Para Vercel)
```typescript
// server/jwtAuth.ts
import jwt from "jsonwebtoken";

export interface JWTPayload {
  id: number | string;
  username: string;
  email: string;
  role: string;
}

export const jwtLoginHandler: RequestHandler = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validar credenciais
    const user = await storage.getCustomerByUsername(username);
    if (!user || !await bcrypt.compare(password, user.passwordHash)) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const payload: JWTPayload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role || "user"
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '7d' });
    
    res.json({ 
      token, 
      user: payload,
      redirectTo: payload.role === 'admin' ? '/admin' : '/dashboard'
    });
  } catch (error) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const requireJWTAuth: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({ error: "Token inválido" });
  }
};
```

#### Autenticação de Sessão (Para Replit)
```typescript
// server/simpleAuth.ts
export const loginHandler: RequestHandler = async (req, res) => {
  // Implementação com express-session para desenvolvimento
};
```

### 3.2 Middleware Adaptativo
```typescript
// server/routes.ts
export async function registerRoutes(app: Express): Promise<Server> {
  // Escolha do middleware baseado no ambiente
  var authMiddleware: RequestHandler = process.env.VERCEL 
    ? requireJWTAuth 
    : requireAuth;

  app.use("/api/protected", authMiddleware);
}
```

## 4. Configuração para Vercel

### 4.1 Arquivo vercel.json
```json
{
  "functions": {
    "api/index.js": {
      "maxDuration": 30
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/index.js"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "buildCommand": "node build-vercel.js"
}
```

### 4.2 Script de Build Customizado
```javascript
// build-vercel.js
import { build } from 'vite';
import { build as esbuild } from 'esbuild';
import fs from 'fs';

async function buildForVercel() {
  console.log('🏗️ Building for Vercel...');
  
  // 1. Build do frontend com Vite
  await build({
    root: 'client',
    build: {
      outDir: '../dist',
      emptyOutDir: true
    }
  });

  // 2. Build do backend com esbuild
  await esbuild({
    entryPoints: ['api/index.ts'],
    bundle: true,
    platform: 'node',
    target: 'node18',
    format: 'esm',
    outfile: 'api/index.js',
    external: ['postgres', 'bcrypt'],
    banner: {
      js: 'import { createRequire } from "module"; const require = createRequire(import.meta.url);'
    }
  });

  // 3. Copiar arquivos estáticos
  if (fs.existsSync('client/public')) {
    fs.cpSync('client/public', 'dist', { recursive: true });
  }
  if (fs.existsSync('public')) {
    fs.cpSync('public', 'dist', { recursive: true });
  }

  console.log('✅ Build completed successfully!');
}

buildForVercel().catch(console.error);
```

### 4.3 Configuração TypeScript para Serverless
```json
// tsconfig.vercel.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "strict": true,
    "resolveJsonModule": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./client/src/*"],
      "@server/*": ["./server/*"],
      "@shared/*": ["./shared/*"]
    }
  },
  "include": ["api/**/*", "server/**/*", "shared/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## 5. Otimização de Performance

### 5.1 Lazy Loading de Componentes
```typescript
// client/src/components/LazySection.tsx
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

export default function LazySection() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <HeavyComponent />
    </Suspense>
  );
}
```

### 5.2 Otimização de Vídeos
```bash
# Conversão para múltiplos formatos
ffmpeg -i video.mov -c:v libx264 -profile:v baseline -level 3.0 -pix_fmt yuv420p -c:a aac -movflags +faststart video-optimized.mp4
```

```typescript
// Implementação robusta de vídeo em loop
const videoRef = useRef<HTMLVideoElement>(null);

useEffect(() => {
  const video = videoRef.current;
  if (video) {
    const playVideo = () => {
      video.currentTime = 0;
      video.play().catch(console.error);
    };

    video.addEventListener('loadeddata', playVideo);
    video.addEventListener('ended', playVideo);
    
    return () => {
      video.removeEventListener('loadeddata', playVideo);
      video.removeEventListener('ended', playVideo);
    };
  }
}, []);
```

## 6. Tratamento de Erros Comuns

### 6.1 Erro: "Module not found" no Vercel
**Problema:** Imports relativos não funcionam em serverless.
**Solução:**
```typescript
// ❌ Errado
import { db } from '../server/db';

// ✅ Correto
import { db } from './db';
```

### 6.2 Erro: "Cannot read properties of undefined"
**Problema:** Variáveis de ambiente não configuradas.
**Solução:**
```typescript
// Sempre validar variáveis críticas
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL não configurada");
}
```

### 6.3 Erro: "Session store not available"
**Problema:** Sessions não funcionam em serverless.
**Solução:** Usar sistema JWT implementado acima.

### 6.4 Erro: Database connection timeout
**Problema:** Conexões não otimizadas para serverless.
**Solução:**
```typescript
const client = postgres(process.env.DATABASE_URL!, {
  idle_timeout: 20,
  max_lifetime: 60 * 30,
  ssl: "require"
});
```

## 7. Checklist de Migração

### 7.1 Antes de Migrar
- [ ] Banco de dados PostgreSQL configurado (Supabase recomendado)
- [ ] Todas as variáveis de ambiente documentadas
- [ ] Sistema de autenticação dual implementado
- [ ] Scripts de build personalizados criados
- [ ] Assets otimizados (imagens, vídeos)

### 7.2 Durante a Migração
- [ ] Configurar variáveis de ambiente no Vercel
- [ ] Testar build local com `node build-vercel.js`
- [ ] Verificar rotas de API funcionando
- [ ] Testar autenticação em produção
- [ ] Validar operações de banco de dados

### 7.3 Após a Migração
- [ ] Configurar domínio customizado
- [ ] Implementar monitoramento de erros
- [ ] Configurar backups do banco de dados
- [ ] Documentar processo para equipe

## 8. Monitoramento e Manutenção

### 8.1 Logs Essenciais
```typescript
// server/vite.ts
export function log(message: string, source = "express") {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${source}] ${message}`);
}
```

### 8.2 Health Check
```typescript
// api/health.ts
export default function handler(req: any, res: any) {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
}
```

## 9. Problemas Específicos e Soluções

### 9.1 Vídeos não reproduzem automaticamente
**Problema:** Políticas de autoplay dos navegadores.
**Solução:**
```typescript
<video autoPlay muted loop playsInline preload="auto">
  <source src="/video-optimized.mp4" type="video/mp4" />
  <source src="/video.mp4" type="video/mp4" />
</video>
```

### 9.2 Formulários não enviam dados
**Problema:** Validação frontend/backend desalinhada.
**Solução:**
```typescript
// Usar schemas compartilhados
const formSchema = insertContactMessageSchema.extend({
  // validações adicionais
});

// Frontend e backend usam o mesmo schema
```

### 9.3 Performance lenta em produção
**Problema:** Bundle muito grande.
**Solução:**
- Code splitting com lazy loading
- Otimização de imagens (WebP)
- Compressão de assets
- CDN para assets estáticos

## 10. Recursos Adicionais

### 10.1 Ferramentas Recomendadas
- **Banco de Dados:** Supabase (PostgreSQL managed)
- **Deployment:** Vercel (serverless)
- **Monitoramento:** Vercel Analytics
- **ORM:** Drizzle (type-safe)
- **Autenticação:** JWT + Supabase Auth

### 10.2 Templates Úteis
- Configuração Vite para full-stack
- Scripts de migração de dados
- Middleware de autenticação dual
- Sistema de validação compartilhada

---

**Este guia foi criado baseado na experiência real de migração do projeto CUCA Cerveja. Todas as soluções foram testadas e implementadas com sucesso.**