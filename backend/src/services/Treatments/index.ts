import { prisma } from "../../lib/prisma.js";

export interface TreatmentResult {
  id: string;
  class: string;
  description: string;
  value: number;
  cost: number;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateTreatmentParams {
  value: number;
  cost: number;
  class: string;
  notes?: string | null;
}

export async function listTreatments(enterpriseId: string): Promise<TreatmentResult[]> {
  const treatments = await prisma.treatment.findMany({
    where: { enterpriseId },
    orderBy: [{ class: "asc" }, { description: "asc" }],
  });

  return treatments.map((t) => ({
    id: t.id,
    class: t.class,
    description: t.description,
    value: Number(t.value),
    cost: Number(t.cost),
    notes: t.notes,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  }));
}

export async function updateTreatment(
  id: string,
  enterpriseId: string,
  params: UpdateTreatmentParams,
): Promise<TreatmentResult> {
  const treatment = await prisma.treatment.update({
    where: { id, enterpriseId },
    data: {
      value: params.value,
      cost: params.cost,
      class: params.class as any,
      notes: params.notes ?? null,
    },
  });

  return {
    id: treatment.id,
    class: treatment.class,
    description: treatment.description,
    value: Number(treatment.value),
    cost: Number(treatment.cost),
    notes: treatment.notes,
    createdAt: treatment.createdAt,
    updatedAt: treatment.updatedAt,
  };
}
