import type { Request, Response } from "express";
import { listDentists as listDentistsService } from "../../services/Users/listDentists.js";

export async function listDentists(req: Request, res: Response) {
  try {
    const enterpriseId = req.user!.enterpriseId;
    const result = await listDentistsService(enterpriseId);
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno do servidor.";
    res.status(500).json({ error: message });
  }
}
