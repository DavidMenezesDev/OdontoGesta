import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../lib/prisma.js";

const JWT_SECRET = process.env["JWT_SECRET"] ?? "odontogesta-dev-secret";

export interface LoginParams {
  email: string;
  password: string;
}

export interface LoginResult {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    enterpriseId: string;
  };
}

export async function login(params: LoginParams): Promise<LoginResult> {
  const { email, password } = params;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error("Email ou senha inválidos.");
  }

  if (!user.active) {
    throw new Error("Usuário inativo. Contate o administrador.");
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new Error("Email ou senha inválidos.");
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, enterpriseId: user.enterpriseId },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      enterpriseId: user.enterpriseId,
    },
  };
}
