import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma.js";

export interface CreateUserParams {
  enterpriseId: string;
  name: string;
  email: string;
  password: string;
  role: "DENTIST" | "RECEP" | "FINANCE";
  phone?: string;
}

export interface CreateUserResult {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  active: boolean;
  createdAt: Date;
}

export async function createUser(params: CreateUserParams): Promise<CreateUserResult> {
  const { enterpriseId, name, email, password, role, phone } = params;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error("Este email já está cadastrado.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      enterpriseId,
      name,
      email,
      password: hashedPassword,
      role,
      phone: phone ?? null,
    },
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    active: user.active,
    createdAt: user.createdAt,
  };
}
