import type { Request, Response } from "express";
import { listHealthPlans, createHealthPlan } from "../../services/HealthPlans/index.js";

export async function list(req: Request, res: Response) {
  try {
    const enterpriseId = req.user!.enterpriseId;
    const result = await listHealthPlans(enterpriseId);
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno do servidor.";
    res.status(500).json({ error: message });
  }
}

export async function create(req: Request, res: Response) {
  const { name } = req.body;

  if (!name || typeof name !== "string") {
    res.status(400).json({ error: "O campo nome é obrigatório." });
    return;
  }

  try {
    const enterpriseId = req.user!.enterpriseId;
    const result = await createHealthPlan({ name }, enterpriseId);
    res.status(201).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno do servidor.";
    res.status(500).json({ error: message });
  }
}
