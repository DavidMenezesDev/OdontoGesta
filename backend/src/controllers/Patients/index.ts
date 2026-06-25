import type { Request, Response } from "express";
import {
  createPatient as createPatientService,
  listPatients as listPatientsService,
  getPatientById as getPatientByIdService,
  updatePatient as updatePatientService,
  deletePatient as deletePatientService,
} from "../../services/Patients/index.js";

export async function create(req: Request, res: Response) {
  const { name, gender, document, nationality, email, phone, recordNumber, occupation, birthDate, address, tags, guardianName, guardianBirthDate, guardianDocument, guardianPhone, healthPlanId, notes } = req.body;

  if (!name || !phone) {
    res.status(400).json({ error: "Os campos nome e telefone são obrigatórios." });
    return;
  }

  if (typeof name !== "string" || typeof phone !== "string") {
    res.status(400).json({ error: "Nome e telefone devem ser textos." });
    return;
  }

  try {
    const enterpriseId = req.user!.enterpriseId;
    const result = await createPatientService(
      { name, gender, document, nationality, email, phone, recordNumber, occupation, birthDate, address, tags, guardianName, guardianBirthDate, guardianDocument, guardianPhone, healthPlanId, notes },
      enterpriseId,
    );

    res.status(201).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno do servidor.";

    if (message.includes("Unique constraint") && message.includes("document")) {
      res.status(409).json({ error: "Já existe um paciente com este CPF." });
      return;
    }
    if (message.includes("Unique constraint") && message.includes("email")) {
      res.status(409).json({ error: "Já existe um paciente com este email." });
      return;
    }

    res.status(500).json({ error: message });
  }
}

export async function list(req: Request, res: Response) {
  try {
    const enterpriseId = req.user!.enterpriseId;
    const search = typeof req.query["search"] === "string" ? req.query["search"] : undefined;
    const result = await listPatientsService(enterpriseId, search);
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno do servidor.";
    res.status(500).json({ error: message });
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const enterpriseId = req.user!.enterpriseId;
    const id = req.params["id"] as string;
    if (!id) {
      res.status(400).json({ error: "ID do paciente não informado." });
      return;
    }
    const result = await getPatientByIdService(id, enterpriseId);

    if (!result) {
      res.status(404).json({ error: "Paciente não encontrado." });
      return;
    }

    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno do servidor.";
    res.status(500).json({ error: message });
  }
}

export async function update(req: Request, res: Response) {
  try {
    const enterpriseId = req.user!.enterpriseId;
    const id = req.params["id"] as string;
    if (!id) {
      res.status(400).json({ error: "ID do paciente não informado." });
      return;
    }

    const existing = await getPatientByIdService(id, enterpriseId);
    if (!existing) {
      res.status(404).json({ error: "Paciente não encontrado." });
      return;
    }

    const result = await updatePatientService(id, req.body, enterpriseId);
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno do servidor.";

    if (message.includes("Unique constraint") && message.includes("document")) {
      res.status(409).json({ error: "Já existe um paciente com este CPF." });
      return;
    }
    if (message.includes("Unique constraint") && message.includes("email")) {
      res.status(409).json({ error: "Já existe um paciente com este email." });
      return;
    }

    res.status(500).json({ error: message });
  }
}

export async function remove(req: Request, res: Response) {
  try {
    const enterpriseId = req.user!.enterpriseId;
    const id = req.params["id"] as string;
    if (!id) {
      res.status(400).json({ error: "ID do paciente não informado." });
      return;
    }

    const existing = await getPatientByIdService(id, enterpriseId);
    if (!existing) {
      res.status(404).json({ error: "Paciente não encontrado." });
      return;
    }

    await deletePatientService(id, enterpriseId);
    res.json({ message: "Paciente removido com sucesso." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno do servidor.";
    res.status(500).json({ error: message });
  }
}
