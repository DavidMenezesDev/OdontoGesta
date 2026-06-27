import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma.js";

export interface CreateAdminParams {
  name: string;
  email: string;
  password: string;
  phone?: string;
  companyName?: string;
  cnpj?: string;
}

export interface CreateAdminResult {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    phone: string | null;
    active: boolean;
    createdAt: Date;
  };
  enterprise: {
    id: string;
    nome: string | null;
    cnpj: string | null;
    phone: string | null;
    active: boolean;
  };
}

const ALL_PERMISSIONS = [
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

export async function createAdmin(params: CreateAdminParams): Promise<CreateAdminResult> {
  const { name, email, password, phone, companyName, cnpj } = params;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error("Este email já está cadastrado.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await prisma.$transaction(async (tx) => {
    const enterprise = await tx.enterprise.create({
      data: {
        nome: companyName ?? null,
        cnpj: cnpj ?? null,
        phone: phone ?? null,
      },
    });

    const user = await tx.user.create({
      data: {
        enterpriseId: enterprise.id,
        name,
        email,
        password: hashedPassword,
        role: "ADMIN",
        phone: phone ?? null,
      },
    });

    for (const p of ALL_PERMISSIONS) {
      const permission = await tx.permission.upsert({
        where: { key: p.key },
        update: { name: p.name, module: p.module },
        create: { key: p.key, name: p.name, module: p.module },
      });

      await tx.rolePermission.upsert({
        where: { role_permissionId: { role: "ADMIN", permissionId: permission.id } },
        update: {},
        create: { role: "ADMIN", permissionId: permission.id },
      });
    }

    return { enterprise, user };
  });

  return {
    user: {
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      role: result.user.role,
      phone: result.user.phone,
      active: result.user.active,
      createdAt: result.user.createdAt,
    },
    enterprise: {
      id: result.enterprise.id,
      nome: result.enterprise.nome,
      cnpj: result.enterprise.cnpj,
      phone: result.enterprise.phone,
      active: result.enterprise.active,
    },
  };
}
