import type { Request, Response } from "express";
import { login as loginService } from "../../services/Auth/login.js";

const isProduction = process.env["NODE_ENV"] === "production";

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Email e senha são obrigatórios." });
    return;
  }

  if (typeof email !== "string" || typeof password !== "string") {
    res.status(400).json({ error: "Email e senha devem ser textos." });
    return;
  }

  try {
    const { token, user } = await loginService({ email, password });

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.json({ user });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno do servidor.";
    const status = message.includes("inválidos") || message.includes("inativo") ? 401 : 500;
    res.status(status).json({ error: message });
  }
}

export async function me(req: Request, res: Response) {
  res.json({ user: req.user });
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie("token", { path: "/" });
  res.json({ message: "Sessão encerrada." });
}
