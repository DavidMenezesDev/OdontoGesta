import type { Request, Response } from "express";
import {
  listPatientAnamneses as listService,
  createPatientAnamnesis as createService,
  updatePatientAnamnesis as updateService,
} from "../../services/PatientAnamnesis/index.js";

export async function list(req: Request, res: Response) {
  const patientId = req.params["patientId"] as string;

  try {
    const enterpriseId = req.user!.enterpriseId;
    const result = await listService(patientId, enterpriseId);
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno do servidor.";
    res.status(500).json({ error: message });
  }
}

export async function create(req: Request, res: Response) {
  const patientId = req.params["patientId"] as string;
  const { anamnesisId, answers } = req.body;

  if (!anamnesisId || typeof anamnesisId !== "string") {
    res.status(400).json({ error: "O campo anamnesisId é obrigatório." });
    return;
  }

  if (!Array.isArray(answers)) {
    res.status(400).json({ error: "O campo answers deve ser um array." });
    return;
  }

  try {
    const enterpriseId = req.user!.enterpriseId;
    const result = await createService(patientId, enterpriseId, { anamnesisId, answers });
    res.status(201).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno do servidor.";
    if (
      message === "Paciente não encontrado." ||
      message === "Anamnese não encontrada."
    ) {
      res.status(404).json({ error: message });
      return;
    }
    if (message === "Esta anamnese já foi preenchida para este paciente.") {
      res.status(409).json({ error: message });
      return;
    }
    res.status(500).json({ error: message });
  }
}

export async function update(req: Request, res: Response) {
  const patientId = req.params["patientId"] as string;
  const id = req.params["id"] as string;
  const { answers } = req.body;

  if (!Array.isArray(answers)) {
    res.status(400).json({ error: "O campo answers deve ser um array." });
    return;
  }

  try {
    const enterpriseId = req.user!.enterpriseId;
    const result = await updateService(id, patientId, enterpriseId, { answers });
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno do servidor.";
    if (message === "Anamnese do paciente não encontrada.") {
      res.status(404).json({ error: message });
      return;
    }
    res.status(500).json({ error: message });
  }
}
