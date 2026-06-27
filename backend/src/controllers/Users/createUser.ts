import type { Request, Response } from "express";
import { createUser as createUserService } from "../../services/Users/createUser.js";

const ALLOWED_ROLES = ["DENTIST", "RECEP", "FINANCE"] as const;

export async function createUser(req: Request, res: Response) {
  const { name, email, password, role, phone } = req.body;

  if (!name || !email || !password || !role) {
    res.status(400).json({ error: "Os campos name, email, password e role são obrigatórios." });
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

  if (!ALLOWED_ROLES.includes(role)) {
    res.status(400).json({ error: "role deve ser DENTIST, RECEP ou FINANCE." });
    return;
  }

  try {
    const result = await createUserService({
      enterpriseId: req.user!.enterpriseId,
      name,
      email,
      password,
      role,
      phone: typeof phone === "string" ? phone : undefined,
    });

    res.status(201).json({ user: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno do servidor.";

    if (message.includes("já está cadastrado")) {
      res.status(409).json({ error: message });
      return;
    }

    res.status(500).json({ error: message });
  }
}