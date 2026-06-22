# OdontoGestão

Sistema de gestão para clínicas odontológicas de pequeno e médio porte.

---

## Tech Stack

| Camada    | Tecnologia                              |
|-----------|-----------------------------------------|
| Backend   | TypeScript, Express, Prisma, PostgreSQL |
| Frontend  | TypeScript, React, Vite                 |
| Infra     | Docker, Docker Compose                  |

---

## Estrutura

```
odontogesta/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   └── index.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── generated/prisma/       # Prisma Client (gerado)
│   ├── Dockerfile
│   ├── docker-entrypoint.sh
│   ├── prisma.config.ts
│   ├── tsconfig.json
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── services/api.ts
│   │   ├── types/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── Dockerfile              # (opcional — build standalone)
│   ├── nginx.conf
│   ├── vite.config.ts
│   └── package.json
├── docker-compose.yml
└── README.md
```

---

## Como Rodar

### Pré-requisitos

- Node.js 20+
- Docker + Docker Compose
- npm

### 1. Banco + Backend (Docker)

```bash
docker compose up -d --build
```

Isso sobe:
- **PostgreSQL 16** na porta `5432`
- **Backend** na porta `3000`

Migrations rodam automaticamente no startup do backend.

### 2. Frontend (manual)

```bash
cd frontend
npm install
npm run dev
```

Acessar `http://localhost:5173`.  
O Vite faz proxy de `/api` para `http://localhost:3000`.

---

## Scripts

### Backend

| Comando                   | Ação                       |
|---------------------------|----------------------------|
| `npm run dev`             | Dev server (hot reload)    |
| `npm run build`           | Compilar TypeScript        |
| `npm run prisma:generate` | Gerar Prisma Client        |
| `npm run prisma:migrate`  | Executar migrations        |
| `npm run prisma:studio`   | Prisma Studio (GUI)        |

### Frontend

| Comando       | Ação                    |
|---------------|-------------------------|
| `npm run dev` | Dev server (porta 5173) |
| `npm run build` | Build para produção   |

---

## Modelos do Banco

- **User** — Dentistas, admins e staff
- **Patient** — Pacientes
- **Appointment** — Agendamentos
- **Treatment** — Tabela de tratamentos

---

## Licença

ISC
