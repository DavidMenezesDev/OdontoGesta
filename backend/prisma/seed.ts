import "dotenv/config";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

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
  { key: "anamnesis:view", name: "Visualizar Anamneses", module: "anamnesis" },
  { key: "anamnesis:create", name: "Criar Anamneses", module: "anamnesis" },
  { key: "anamnesis:edit", name: "Editar Anamneses", module: "anamnesis" },
  { key: "anamnesis:delete", name: "Excluir Anamneses", module: "anamnesis" },
  { key: "question:view", name: "Visualizar Perguntas", module: "anamnesis" },
  { key: "question:manage", name: "Gerenciar Perguntas", module: "anamnesis" },
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
    "anamnesis:view",
    "question:view",
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

const CBHPO_MAP: Record<string, string> = {
  "1": "DIAGNOST",
  "2": "ODONTO_CIRUR",
  "3": "ODONTO_PREVENTIVA",
  "4": "ODONTO_REST",
  "5": "ODONTO_PEDIAT",
  "6": "ORTOD_ORTOP",
  "7": "PAC_ESPEC",
};

function mapTreatmentClass(codigo: string): string {
  const prefix = codigo.charAt(0);
  return CBHPO_MAP[prefix] ?? "NONE";
}

async function seedPermissions() {
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

async function seedTreatments() {
  const cbhpoPath = join(__dirname, "..", "..", "cbhpo.json");
  const raw = JSON.parse(readFileSync(cbhpoPath, "utf-8"));
  const procedimentos: Array<{
    codigo: string;
    procedimento: string;
    valor_total: number;
  }> = raw.procedimentos;

  const enterprises = await prisma.enterprise.findMany();

  if (enterprises.length === 0) {
    console.log("Nenhuma empresa cadastrada. Pulando seed de tratamentos.");
    return;
  }

  let created = 0;
  let skipped = 0;

  for (const enterprise of enterprises) {
    for (const proc of procedimentos) {
      const existing = await prisma.treatment.findFirst({
        where: {
          enterpriseId: enterprise.id,
          description: proc.procedimento,
        },
      });

      if (existing) {
        skipped++;
        continue;
      }

      await prisma.treatment.create({
        data: {
          enterpriseId: enterprise.id,
          class: mapTreatmentClass(proc.codigo) as any,
          description: proc.procedimento,
          value: proc.valor_total,
          cost: 0,
        },
      });
      created++;
    }
  }

  console.log(
    `Tratamentos CBHPO: ${created} criados, ${skipped} já existentes (ignorados).`
  );
}

async function seedHealthPlans() {
  const enterprises = await prisma.enterprise.findMany();

  if (enterprises.length === 0) {
    console.log("Nenhuma empresa cadastrada. Pulando seed de planos.");
    return;
  }

  for (const enterprise of enterprises) {
    const treatments = await prisma.treatment.findMany({
      where: { enterpriseId: enterprise.id },
      select: { id: true },
    });

    if (treatments.length === 0) {
      console.log(`Nenhum tratamento para empresa ${enterprise.id}. Pulando.`);
      continue;
    }

    let plan = await prisma.healthPlan.findFirst({
      where: { enterpriseId: enterprise.id, name: "Particular" },
    });

    if (!plan) {
      plan = await prisma.healthPlan.create({
        data: {
          enterpriseId: enterprise.id,
          name: "Particular",
          treatments: { connect: treatments.map((t) => ({ id: t.id })) },
        },
      });
      console.log(
        `Plano "Particular" criado para empresa ${enterprise.id} com ${treatments.length} tratamentos.`
      );
    } else {
      await prisma.healthPlan.update({
        where: { id: plan.id },
        data: {
          treatments: { connect: treatments.map((t) => ({ id: t.id })) },
        },
      });
      console.log(
        `Plano "Particular" atualizado para empresa ${enterprise.id} (${treatments.length} tratamentos).`
      );
    }
  }
}

async function seed() {
  await seedPermissions();
  await seedTreatments();
  await seedHealthPlans();
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
