import type { Request, Response } from "express";
import {
  listPatientTreatments as listService,
  createPatientTreatment as createService,
  deletePatientTreatment as deleteService,
} from "../../services/PatientTreatments/index.js";

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
  const { dentistId, treatmentId, healthPlanId, date, value, teeth, faces, notes } = req.body;

  if (!dentistId || !treatmentId || !date || value == null) {
    res.status(400).json({
      error: "Campos obrigatórios: dentistId, treatmentId, date, value.",
    });
    return;
  }

  try {
    const enterpriseId = req.user!.enterpriseId;
    const result = await createService(patientId, enterpriseId, {
      dentistId,
      treatmentId,
      healthPlanId,
      date,
      value: Number(value),
      teeth,
      faces,
      notes,
    });
    res.status(201).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno do servidor.";
    if (
      message === "Paciente não encontrado." ||
      message === "Tratamento não encontrado." ||
      message === "Dentista não encontrado."
    ) {
      res.status(404).json({ error: message });
      return;
    }
    res.status(500).json({ error: message });
  }
}

export async function remove(req: Request, res: Response) {
  const patientId = req.params["patientId"] as string;
  const id = req.params["id"] as string;
  try {
    const enterpriseId = req.user!.enterpriseId;
    await deleteService(id, patientId, enterpriseId);
    res.json({ message: "Tratamento removido com sucesso." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno do servidor.";
    if (message === "Tratamento do paciente não encontrado.") {
      res.status(404).json({ error: message });
      return;
    }
    res.status(500).json({ error: message });
  }
}
