# DevTrilha — Plataforma de Treinamento Web

Plataforma interna de treinamento para desenvolvedores web: trilha de **12
módulos** (HTML → Vitest), aulas em MDX, quizzes com correção automática,
progresso persistido por usuário e autenticação completa.

## Stack

| Camada            | Tecnologia                          |
| ----------------- | ----------------------------------- |
| Framework         | Next.js 16 (App Router)             |
| Linguagem         | TypeScript                          |
| UI                | React 19                            |
| Estilo            | Tailwind CSS 4 (`@theme`, CSS-first)|
| Componentes       | Radix UI (RadioGroup, Dialog, DropdownMenu) |
| ORM / Banco       | **Prisma 7 + PostgreSQL**           |
| Autenticação      | Better-Auth (e-mail/senha)          |
| Estado de cliente | Jotai                               |
| Lint & Format     | Biome                               |
| Testes            | Vitest + Testing Library            |

> Este projeto usa **PostgreSQL** (com driver adapter `@prisma/adapter-pg`), não MySQL.

## Como rodar localmente

### 1. Subir um PostgreSQL

Qualquer instância 14+ serve. Exemplos:

```bash
# Docker (recomendado)
docker run --name plataforma-pg -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=plataforma_treinamento -p 5432:5432 -d postgres:17
```

Ou use um serviço gerenciado (Neon, Supabase, RDS…). Crie o banco
`plataforma_treinamento` se a instância for sua.

### 2. Variáveis de ambiente

```bash
cp .env.example .env
```

Edite `.env`:

```ini
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/plataforma_treinamento?schema=public"
BETTER_AUTH_SECRET="gere-um-segredo-forte"
BETTER_AUTH_URL="http://localhost:3000"
```

Gere o segredo com:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

### 3. Instalar, migrar e semear

```bash
npm install
npm run db:migrate   # aplica as migrations (ou: npm run db:deploy)
npm run db:seed      # cria os 12 módulos, 49 lições e quizzes de HTML5
npm run dev
```

Acesse <http://localhost:3000>, crie uma conta em `/cadastro` e siga a trilha.

### Scripts úteis

| Script              | Ação                                          |
| ------------------- | --------------------------------------------- |
| `npm run dev`       | Servidor de desenvolvimento                   |
| `npm run build`     | Build de produção (gera Prisma Client antes)  |
| `npm run lint`      | `biome check .`                               |
| `npm run format`    | `biome check --write .`                       |
| `npm run typecheck` | `tsc --noEmit`                                |
| `npm test`          | Suíte Vitest                                  |
| `npm run db:migrate`| `prisma migrate dev`                          |
| `npm run db:seed`   | Seed idempotente                              |

## Arquitetura

```
prisma/schema.prisma     Modelos (Better-Auth + domínio) — PostgreSQL
prisma/seed.ts           Seed dos módulos/lições/quizzes (+ stubs de conteúdo)
content/<modulo>/*.mdx   Conteúdo das aulas (versionado no repo!)
src/proxy.ts             Proteção otimista de rotas (Next 16; ex-middleware.ts)
src/lib/auth.ts          Better-Auth + prismaAdapter(provider "postgresql")
src/lib/corrigir-quiz.ts Correção pura do quiz (testada)
src/app/page.tsx         Dashboard com progresso geral e por módulo
src/app/modulos/[slug]   Índice do módulo / lição (MDX via next-mdx-remote/rsc)
src/app/api/auth/[...all]/route.ts        Handler do Better-Auth
src/app/api/progresso/route.ts            Marcar concluída / reiniciar progresso
src/app/api/quiz/[id]/responder/route.ts  Correção no servidor + persistência
src/components/QuizCard.tsx               Radix RadioGroup + Jotai
```

Princípios:

- **Conteúdo em MDX versionado** (`content/`); o banco guarda só metadados
  estruturais e dados por usuário (progresso, tentativas).
- O gabarito do quiz **nunca** vai ao cliente antes da correção — tudo é
  corrigido no servidor.
- Jotai apenas para estado de UI do quiz (seleções antes de corrigir).
- `proxy.ts` faz checagem otimista de cookie; validação real da sessão ocorre
  nos Server Components/Route Handlers via `auth.api.getSession()`.

## Conteúdo

O módulo **HTML5 está completo** (5 lições com conteúdo real e quiz). Os demais
módulos têm estrutura + stubs de conteúdo criados pelo seed — publique novas
aulas editando os arquivos em `content/`.

## Testes

```bash
npm test
```

Cobrem: lógica pura de correção do quiz, componente `QuizCard` (Radix + Jotai +
fetch mockado) e Route Handler `/api/progresso`.
