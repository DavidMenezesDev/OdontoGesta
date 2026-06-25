import type { Request, Response } from "express";
import { createAdmin as createAdminService } from "../../services/Users/createAdmin.js";

export async function createAdmin(req: Request, res: Response) {
  const { name, email, password, phone, companyName, cnpj } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ error: "Os campos name, email e password são obrigatórios." });
    return;
  }

  if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string") {
    res.status(400).json({ error: "name, email e password devem ser textos." });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ error: "A senha deve ter no mínimo 6 caracteres." });
    return;
  }

  try {
    const result = await createAdminService({
      name,
      email,
      password,
      phone: typeof phone === "string" ? phone : undefined,
      companyName: typeof companyName === "string" ? companyName : undefined,
      cnpj: typeof cnpj === "string" ? cnpj : undefined,
    });

    res.status(201).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno do servidor.";

    if (message.includes("já existe") || message.includes("já está cadastrado")) {
      res.status(409).json({ error: message });
      return;
    }

    res.status(500).json({ error: message });
  }
}
