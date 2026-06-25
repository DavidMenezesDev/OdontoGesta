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
