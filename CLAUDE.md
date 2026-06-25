# OdontoGestao - Contexto do Projeto

## Visão Geral
Sistema de gestão para clínicas odontológicas de pequeno/médio porte.
Stack: TypeScript full-stack | Express 5 | React 19 | Prisma ORM | PostgreSQL 16 | Docker

## Estrutura do Projeto

```
odontogesta/
├── backend/          # API REST (Express 5 + Prisma)
├── frontend/         # SPA (React 19 + Vite 8)
├── docker-compose.yml
└── README.md
```

## Backend (`backend/`)

### Stack
- **Runtime:** Node.js 22 (ESM: `"type": "module"`)
- **Framework:** Express 5
- **ORM:** Prisma 7 + `@prisma/adapter-pg`
- **Banco:** PostgreSQL 16
- **Auth:** JWT (`jsonwebtoken`) + bcryptjs
- **Dev:** `tsx` (watch mode) + TypeScript 6

### Scripts Principais
| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia em dev mode (`tsx watch src/index.ts`) |
| `npm run build` | Compila TypeScript (`tsc`) |
| `npm run start` | Executa build de produção |
| `npm run prisma:generate` | Gera Prisma Client |
| `npm run prisma:migrate` | Executa migrations |
| `npm run prisma:studio` | Abre Prisma Studio |

### Arquitetura (3 camadas)
```
src/
├── controllers/      # HTTP handling (req/res)
│   ├── Auth/login.ts
│   └── Users/createAdmin.ts
├── services/         # Business logic
│   ├── Auth/login.ts
│   └── Users/createAdmin.ts
├── routes/           # Rotas Express
│   ├── Auth/login.ts
│   └── Users/createAdmin.ts
├── middleware/
│   └── auth.ts       # JWT middleware (authMiddleware + optionalAuth)
├── lib/
│   └── prisma.ts     # Prisma client singleton
└── index.ts          # Entry point
```

### Modelos do Banco (Prisma)
| Modelo | Tabela | Descrição |
|--------|--------|-----------|
| `Enterprise` | `enterprises` | Clínica/empresa |
| `User` | `users` | Usuários do sistema |
| `Patient` | `patients` | Pacientes |
| `Appointment` | `appointments` | Agendamentos |
| `Treatment` | `treatments` | Tratamentos odontológicos |

### Enums
- `UserRole`: `ADMIN | DENTIST | RECEP | FINANCE`
- `AppointmentStatus`: `SCHEDULED | CONFIRMED | IN_PROGRESS | COMPLETED | CANCELLED | NO_SHOW`

### Como Rodar (Backend)
```bash
docker compose up -d --build   # Inicia PostgreSQL + Backend
# ou manual:
cd backend && npm install
cp .env\ .example .env
npx prisma generate && npx prisma migrate dev
npm run dev
```

## Frontend (`frontend/`)

### Stack
- **Framework:** React 19
- **Build:** Vite 8 + rolldown + `@vitejs/plugin-react`
- **Lint:** ESLint 10 + typescript-eslint
- **Estilo:** CSS puro (design tokens em `index.css`)
- **HTTP:** Native `fetch` API (sem axios)
- **Estado:** React Context API (sem Redux/Zustand)
- **Router:** Condicional via estado (sem react-router)

### Scripts
| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia dev server (porta 5173) |
| `npm run build` | Type check + build |
| `npm run lint` | ESLint |

### Estrutura
```
src/
├── contexts/
│   └── AuthContext.tsx    # Contexto de autenticação
├── pages/
│   ├── Login.tsx          # Tela de login
│   ├── Dashboard.tsx      # Dashboard pós-login
│   └── RegisterAdmin.tsx  # Cadastro admin inicial
├── services/
│   └── api.ts             # Cliente HTTP (fetch)
├── types/
│   └── index.ts           # Tipos compartilhados
├── App.tsx                # Componente raiz + roteamento
├── App.css
├── index.css              # Reset + design tokens
└── main.tsx               # Entry point
```

### Proxy (Dev)
`vite.config.ts` faz proxy de `/api` para `http://localhost:3000`.

### Como Rodar (Frontend)
```bash
cd frontend && npm install && npm run dev
```

## Docker

### `docker-compose.yml` (Produção/CI)
```yaml
services:
  db:        postgres:16-alpine (porta 5432, healthcheck)
  backend:   build ./backend (porta 3000)
```

### Dockerfiles
- **backend/Dockerfile:** Multi-stage (`node:22-alpine`), executa `prisma migrate deploy` no entrypoint
- **frontend/Dockerfile:** Multi-stage com `nginx:alpine`, proxy reverso de `/api/` para backend

## Convenções de Código

### Nomenclatura
- **Arquivos:** `camelCase.ts` (ex: `createAdmin.ts`)
- **Diretórios:** `PascalCase` (ex: `Auth/`, `Users/`)
- **Interfaces/Types:** `PascalCase`
- **Funções/Variáveis:** `camelCase`
- **Constantes:** `UPPER_SNAKE_CASE`
- **CSS classes:** `kebab-case`
- **CSS vars:** `--kebab-case`
- **Banco:** `snake_case` (via `@map()` no Prisma)

### Imports
- Usar **extensão `.js`** em imports relativos (`../../lib/prisma.js`)
- `import type` para type-only imports
- `export default router` para rotas
- Named exports para services/controllers/middleware

### Estilo
- Semicolons obrigatórios
- **Double quotes** para strings
- Braces Egyptian style (`same-line`)
- `async/await` (sem `.then()`)
- `try/catch` com `error instanceof Error`
- Early returns após `res.status().json()`
- TypeScript strict mode ativado

### Padrões
- **API Client:** `fetchApi<T>()` para GET, `postApi<T>()` para POST
- **Auth:** JWT em httpOnly cookie + `localStorage` para dados do usuário
- **Auth Context:** `useAuth()` hook fornece `user`, `login`, `logout`, `isAuthenticated`, `checkAuth`
- **Prisma:** Singleton via `lib/prisma.ts`, transações com `$transaction`

### Idioma
- **Português (BR)** para UI, mensagens de erro e comentários
- **Inglês** para identificadores, tipos e nomes internos
- HTML: `<html lang="pt-BR">`

## Variáveis de Ambiente

### `backend/.env`
```
DATABASE_URL=postgresql://postgres:senha@localhost:5432/odontogesta?schema=public
PORT=3000
JWT_SECRET=sua_chave_secreta
FRONTEND_URL=http://localhost:5173
```

## Informações Úteis

- TypeScript 6 com `strict: true`, `verbatimModuleSyntax`, `noUncheckedIndexedAccess`
- Backend usa `nodenext` module resolution
- Prisma Client gerado em `backend/generated/prisma/`
- Migrations em `backend/prisma/migrations/`
- **NÃO** há `.gitignore` na raiz (cada subprojeto tem o seu)
- **NÃO** usar `react-router` (roteamento condicional simples)
- Portas: Backend `:3000`, Frontend `:5173`, DB `:5432`
