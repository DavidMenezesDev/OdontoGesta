import type { Request, Response } from "express";
import { getEnterprise, updateEnterprise } from "../../services/Enterprise/index.js";

export async function get(req: Request, res: Response) {
  try {
    const enterpriseId = req.user!.enterpriseId;
    const result = await getEnterprise(enterpriseId);

    if (!result) {
      res.status(404).json({ error: "Empresa não encontrada." });
      return;
    }

    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno do servidor.";
    res.status(500).json({ error: message });
  }
}

export async function update(req: Request, res: Response) {
  const { nome, cnpj, phone, email, street, number, complement, neighborhood, city, state, zipCode, logo } = req.body;

  try {
    const enterpriseId = req.user!.enterpriseId;
    const result = await updateEnterprise(enterpriseId, {
      nome: typeof nome === "string" ? nome : undefined,
      cnpj: typeof cnpj === "string" ? cnpj : undefined,
      phone: typeof phone === "string" ? phone : undefined,
      email: typeof email === "string" ? email : undefined,
      street: typeof street === "string" ? street : undefined,
      number: typeof number === "string" ? number : undefined,
      complement: typeof complement === "string" ? complement : undefined,
      neighborhood: typeof neighborhood === "string" ? neighborhood : undefined,
      city: typeof city === "string" ? city : undefined,
      state: typeof state === "string" ? state : undefined,
      zipCode: typeof zipCode === "string" ? zipCode : undefined,
      logo: typeof logo === "string" ? logo : undefined,
    });

    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno do servidor.";
    res.status(500).json({ error: message });
  }
}
