import type { Request, Response } from "express";
import {
  listQuestions as listQuestionsService,
  createQuestion as createQuestionService,
  updateQuestion as updateQuestionService,
  listAnamneses as listAnamnesesService,
  getAnamnesis as getAnamnesisService,
  createAnamnesis as createAnamnesisService,
  updateAnamnesis as updateAnamnesisService,
  deleteAnamnesis as deleteAnamnesisService,
} from "../../services/Anamnesis/index.js";

export async function listQuestions(req: Request, res: Response) {
  try {
    const enterpriseId = req.user!.enterpriseId;
    const result = await listQuestionsService(enterpriseId);
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno do servidor.";
    res.status(500).json({ error: message });
  }
}

export async function createQuestion(req: Request, res: Response) {
  const { pergunta, tipo, alerta, labelPergunta, labelAlerta, opcoes } = req.body;

  if (!pergunta || typeof pergunta !== "string") {
    res.status(400).json({ error: "O campo pergunta é obrigatório." });
    return;
  }

  try {
    const enterpriseId = req.user!.enterpriseId;
    const result = await createQuestionService(
      { pergunta, tipo: tipo ?? 1, alerta: alerta ?? 1, labelPergunta, labelAlerta, opcoes },
      enterpriseId,
    );
    res.status(201).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno do servidor.";
    res.status(500).json({ error: message });
  }
}

export async function updateQuestion(req: Request, res: Response) {
  const id = req.params["id"] as string;
  const { pergunta, tipo, alerta, labelPergunta, labelAlerta, opcoes } = req.body;

  try {
    const enterpriseId = req.user!.enterpriseId;
    const result = await updateQuestionService(id, enterpriseId, {
      pergunta,
      tipo,
      alerta,
      labelPergunta,
      labelAlerta,
      opcoes,
    });
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno do servidor.";
    if (message === "Pergunta não encontrada.") {
      res.status(404).json({ error: message });
      return;
    }
    res.status(500).json({ error: message });
  }
}

export async function list(req: Request, res: Response) {
  try {
    const enterpriseId = req.user!.enterpriseId;
    const result = await listAnamnesesService(enterpriseId);
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno do servidor.";
    res.status(500).json({ error: message });
  }
}

export async function getById(req: Request, res: Response) {
  const id = req.params["id"] as string;

  try {
    const enterpriseId = req.user!.enterpriseId;
    const result = await getAnamnesisService(id, enterpriseId);
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno do servidor.";
    if (message === "Anamnese não encontrada.") {
      res.status(404).json({ error: message });
      return;
    }
    res.status(500).json({ error: message });
  }
}

export async function create(req: Request, res: Response) {
  const { nome, questions } = req.body;

  if (!nome || typeof nome !== "string") {
    res.status(400).json({ error: "O campo nome é obrigatório." });
    return;
  }

  if (!Array.isArray(questions)) {
    res.status(400).json({ error: "O campo questions deve ser um array." });
    return;
  }

  try {
    const enterpriseId = req.user!.enterpriseId;
    const result = await createAnamnesisService({ nome, questions }, enterpriseId);
    res.status(201).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno do servidor.";
    res.status(500).json({ error: message });
  }
}

export async function update(req: Request, res: Response) {
  const id = req.params["id"] as string;
  const { nome, questions } = req.body;

  try {
    const enterpriseId = req.user!.enterpriseId;
    const result = await updateAnamnesisService(id, enterpriseId, { nome, questions });
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno do servidor.";
    if (message === "Anamnese não encontrada.") {
      res.status(404).json({ error: message });
      return;
    }
    res.status(500).json({ error: message });
  }
}

export async function remove(req: Request, res: Response) {
  const id = req.params["id"] as string;

  try {
    const enterpriseId = req.user!.enterpriseId;
    await deleteAnamnesisService(id, enterpriseId);
    res.json({ message: "Anamnese excluída com sucesso." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno do servidor.";
    if (message === "Anamnese não encontrada.") {
      res.status(404).json({ error: message });
      return;
    }
    res.status(500).json({ error: message });
  }
}
