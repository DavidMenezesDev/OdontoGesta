import { prisma } from "../../lib/prisma.js";

export interface DentistResult {
  id: string;
  name: string;
  email: string;
  phone: string | null;
}

export async function listDentists(enterpriseId: string): Promise<DentistResult[]> {
  const dentists = await prisma.user.findMany({
    where: { enterpriseId, role: { in: ["DENTIST", "ADMIN"] }, active: true },
    select: { id: true, name: true, email: true, phone: true },
    orderBy: { name: "asc" },
  });

  return dentists;
}
