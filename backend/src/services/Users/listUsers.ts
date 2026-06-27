import { prisma } from "../../lib/prisma.js";

export interface ListUserResult {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  active: boolean;
  createdAt: Date;
}

export async function listUsers(enterpriseId: string): Promise<ListUserResult[]> {
  const users = await prisma.user.findMany({
    where: { enterpriseId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      active: true,
      createdAt: true,
    },
    orderBy: { name: "asc" },
  });

  return users;
}
