import { prisma } from "../../lib/prisma.js";

export interface CreateHealthPlanParams {
  name: string;
}

export interface HealthPlanResult {
  id: string;
  name: string;
  active: boolean;
}

export async function listHealthPlans(enterpriseId: string): Promise<HealthPlanResult[]> {
  const plans = await prisma.healthPlan.findMany({
    where: { enterpriseId, active: true },
    orderBy: { name: "asc" },
  });

  return plans.map((p) => ({ id: p.id, name: p.name, active: p.active }));
}

export async function createHealthPlan(params: CreateHealthPlanParams, enterpriseId: string): Promise<HealthPlanResult> {
  const plan = await prisma.healthPlan.create({
    data: {
      enterpriseId,
      name: params.name,
    },
  });

  return { id: plan.id, name: plan.name, active: plan.active };
}
