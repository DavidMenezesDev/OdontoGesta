# OdontoGestão

Sistema completo de gestão para clínicas odontológicas de pequeno e médio porte.

> **AI-First** — arquitetura moderna com foco em produtividade e boas práticas.

---

## Tech Stack

### Backend
| Tecnologia      | Descrição                            |
|-----------------|--------------------------------------|
| **TypeScript**  | Linguagem principal                  |
| **Express**     | Framework HTTP                       |
| **Prisma**      | ORM e migrations                     |
| **PostgreSQL**  | Banco de dados relacional            |

### Frontend
| Tecnologia      | Descrição                            |
|-----------------|--------------------------------------|
| **React**       | Biblioteca de UI                     |
| **TypeScript**  | Linguagem principal                  |
| **Vite**        | Bundler e dev server                 |

---

## Estrutura do Projeto

```
odontogesta/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Handlers das rotas
│   │   ├── routes/          # Definição de rotas
│   │   ├── services/        # Lógica de negócio
│   │   └── index.ts         # Entry point
│   ├── prisma/
│   │   ├── schema.prisma    # Modelos do banco
│   │   └── migrations/      # Migrations geradas
│   ├── generated/           # Prisma Client (gerado)
│   ├── .env                 # Variáveis de ambiente
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── services/        # Comunicação com API
│   │   ├── types/           # Tipos compartilhados
│   │   ├── App.tsx          # Componente principal
│   │   └── main.tsx         # Entry point
│   ├── index.html
│   └── package.json
└── README.md
```

---

## Como Rodar

### Pré-requisitos
- Node.js 20+
- Docker e Docker Compose
- npm

### 1. Suba o banco + backend (Docker)

```bash
docker compose up -d
```

O backend ficará disponível em `http://localhost:3000`.

### 2. Inicie o frontend (manual)

```bash
cd frontend
npm install
npm run dev
```

Aplicação em `http://localhost:5173` — o Vite faz proxy de `/api` para o backend em `localhost:3000`.

---

## Scripts

### Backend
| Comando                        | Ação                          |
|--------------------------------|-------------------------------|
| `npm run dev`                  | Inicia servidor em dev (hot reload) |
| `npm run build`                | Compila TypeScript            |
| `npm start`                    | Inicia servidor em produção   |
| `npm run prisma:generate`      | Gera Prisma Client            |
| `npm run prisma:migrate`       | Executa migrations            |
| `npm run prisma:studio`        | Abre Prisma Studio (GUI)      |

### Frontend
| Comando       | Ação                               |
|---------------|------------------------------------|
| `npm run dev` | Inicia dev server (porta 5173)     |
| `npm run build` | Compila para produção           |

---

## Modelos do Banco

- **User** — Dentistas, administradores e staff
- **Patient** — Pacientes da clínica
- **Appointment** — Agendamentos
- **Treatment** — Tabela de tratamentos

---

## Licença

ISC
