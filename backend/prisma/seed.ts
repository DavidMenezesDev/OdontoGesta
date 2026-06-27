import "dotenv/config";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

const pool = new pg.Pool({ connectionString: process.env["DATABASE_URL"] });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const PERMISSIONS = [
  { key: "patient:view", name: "Visualizar Pacientes", module: "patients" },
  { key: "patient:create", name: "Criar Pacientes", module: "patients" },
  { key: "patient:edit", name: "Editar Pacientes", module: "patients" },
  { key: "patient:delete", name: "Excluir Pacientes", module: "patients" },
  { key: "appointment:view", name: "Visualizar Agendamentos", module: "appointments" },
  { key: "appointment:create", name: "Criar Agendamentos", module: "appointments" },
  { key: "appointment:edit", name: "Editar Agendamentos", module: "appointments" },
  { key: "appointment:cancel", name: "Cancelar Agendamentos", module: "appointments" },
  { key: "user:view", name: "Visualizar Usuários", module: "users" },
  { key: "user:create", name: "Criar Usuários", module: "users" },
  { key: "user:edit", name: "Editar Usuários", module: "users" },
  { key: "healthplan:view", name: "Visualizar Planos", module: "healthplans" },
  { key: "healthplan:manage", name: "Gerenciar Planos", module: "healthplans" },
  { key: "enterprise:view", name: "Visualizar Empresa", module: "enterprise" },
  { key: "enterprise:edit", name: "Editar Empresa", module: "enterprise" },
  { key: "treatment:view", name: "Visualizar Tratamentos", module: "treatments" },
  { key: "treatment:manage", name: "Gerenciar Tratamentos", module: "treatments" },
  { key: "financial:view", name: "Visualizar Financeiro", module: "financial" },
];

const ROLE_PERMISSIONS: Record<string, string[]> = {
  ADMIN: PERMISSIONS.map((p) => p.key),
  DENTIST: [
    "patient:view",
    "patient:edit",
    "appointment:view",
    "appointment:create",
    "appointment:edit",
    "healthplan:view",
    "treatment:view",
  ],
  RECEP: [
    "patient:view",
    "patient:create",
    "patient:edit",
    "appointment:view",
    "appointment:create",
    "appointment:edit",
    "appointment:cancel",
  ],
  FINANCE: [
    "enterprise:view",
    "treatment:view",
    "financial:view",
  ],
};

async function seed() {
  const permissionMap = new Map<string, string>();

  for (const p of PERMISSIONS) {
    const created = await prisma.permission.upsert({
      where: { key: p.key },
      update: { name: p.name, module: p.module },
      create: { key: p.key, name: p.name, module: p.module },
    });
    permissionMap.set(created.key, created.id);
  }

  for (const [role, keys] of Object.entries(ROLE_PERMISSIONS)) {
    for (const key of keys) {
      const permissionId = permissionMap.get(key);
      if (!permissionId) continue;

      await prisma.rolePermission.upsert({
        where: { role_permissionId: { role, permissionId } },
        update: {},
        create: { role, permissionId },
      });
    }
  }

  console.log("Permissões e role_permissions populadas com sucesso.");
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
