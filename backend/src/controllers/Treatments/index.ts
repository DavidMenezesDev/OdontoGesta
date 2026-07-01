import type { Request, Response } from "express";
import { listTreatments, updateTreatment } from "../../services/Treatments/index.js";

export async function list(req: Request, res: Response) {
  try {
    const enterpriseId = req.user!.enterpriseId;
    const result = await listTreatments(enterpriseId);
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno do servidor.";
    res.status(500).json({ error: message });
  }
}

export async function update(req: Request, res: Response) {
  const id = req.params.id as string;
  const { value, cost, class: treatmentClass, notes } = req.body;

  if (value == null || cost == null || !treatmentClass) {
    res.status(400).json({ error: "Campos value, cost e class são obrigatórios." });
    return;
  }

  try {
    const enterpriseId = req.user!.enterpriseId;
    const result = await updateTreatment(id, enterpriseId, {
      value: Number(value),
      cost: Number(cost),
      class: treatmentClass,
      notes: notes ?? null,
    });
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno do servidor.";
    res.status(500).json({ error: message });
  }
}
