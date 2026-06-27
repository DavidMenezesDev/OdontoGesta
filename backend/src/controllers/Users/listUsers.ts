import type { Request, Response } from "express";
import { listUsers as listUsersService } from "../../services/Users/listUsers.js";

export async function listUsers(req: Request, res: Response) {
  try {
    const enterpriseId = req.user!.enterpriseId;
    const result = await listUsersService(enterpriseId);
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno do servidor.";
    res.status(500).json({ error: message });
  }
}
