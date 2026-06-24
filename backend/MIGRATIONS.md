# Migrations - Prisma

## Criar uma nova migration (desenvolvimento)

Após alterar o `prisma/schema.prisma` (novos models, campos, etc.):

```bash
cd backend
npm run prisma:migrate
```

Isso cria um novo arquivo SQL em `prisma/migrations/` e já aplica no banco.

## Aplicar migrations existentes no banco (deploy)

Quando as migrations já foram criadas (por você ou outro dev) e você precisa aplicá-las ao banco:

```bash
cd backend
npx prisma migrate deploy
```

## Fluxo completo - primeira vez

```bash
# 1. Sobe o PostgreSQL
docker compose up -d db

# 2. Aplica as migrations existentes
cd backend
npx prisma migrate deploy

# 3. (Opcional) Abre o Prisma Studio pra ver os dados
npm run prisma:studio
```

## Diferença entre os comandos

| Comando | Quando usar | Efeito |
|---|---|---|
| `prisma migrate dev` | Desenvolvimento | Cria nova migration + aplica no banco |
| `prisma migrate deploy` | Produção/Deploy | Só aplica migrations existentes (seguro) |
| `prisma db push` | Prototipagem rápida | Sincroniza schema direto no banco sem criar migration |

## Produção (Docker)

No Docker, as migrations são aplicadas automaticamente no startup via `docker-entrypoint.sh`.

```bash
docker compose up -d --build
```
