import type { Request, Response } from "express";
import {
  listPermissions as listPermissionsService,
  getRolePermissions as getRolePermissionsService,
  updateRolePermissions as updateRolePermissionsService,
  getEffectivePermissions,
  getUserPermissions as getUserPermissionsService,
  saveUserPermissions,
} from "../../services/Permissions/index.js";

export async function listPermissions(_req: Request, res: Response) {
  try {
    const result = await listPermissionsService();
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno do servidor.";
    res.status(500).json({ error: message });
  }
}

export async function getRolePermissions(req: Request, res: Response) {
  try {
    const role = req.params["role"] as string;
    if (!role) { res.status(400).json({ error: "Role não informada." }); return; }
    const result = await getRolePermissionsService(role);
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno do servidor.";
    res.status(500).json({ error: message });
  }
}

export async function updateRolePermissions(req: Request, res: Response) {
  try {
    const role = req.params["role"] as string;
    if (!role) { res.status(400).json({ error: "Role não informada." }); return; }
    const { permissions } = req.body as { permissions: string[] };

    if (!Array.isArray(permissions)) {
      res.status(400).json({ error: "permissions deve ser um array de strings." });
      return;
    }

    await updateRolePermissionsService(role, permissions);
    res.json({ message: "Permissões atualizadas com sucesso." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno do servidor.";
    res.status(500).json({ error: message });
  }
}

export async function getMyPermissions(req: Request, res: Response) {
  try {
    if (!req.user) { res.status(401).json({ error: "Não autenticado." }); return; }
    const keys = await getEffectivePermissions(req.user.id, req.user.role);
    res.json({ permissions: keys });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno do servidor.";
    res.status(500).json({ error: message });
  }
}

export async function getUserPermissions(req: Request, res: Response) {
  try {
    const userId = req.params["userId"] as string;
    if (!userId) { res.status(400).json({ error: "userId não informado." }); return; }
    const result = await getUserPermissionsService(userId);
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno do servidor.";
    res.status(500).json({ error: message });
  }
}

export async function updateUserPermissions(req: Request, res: Response) {
  try {
    const userId = req.params["userId"] as string;
    if (!userId) { res.status(400).json({ error: "userId não informado." }); return; }

    const { role, grantedKeys, revokedKeys } = req.body as {
      role: string;
      grantedKeys: string[];
      revokedKeys: string[];
    };

    if (!Array.isArray(grantedKeys) || !Array.isArray(revokedKeys)) {
      res.status(400).json({ error: "grantedKeys e revokedKeys devem ser arrays." });
      return;
    }

    await saveUserPermissions(userId, role, grantedKeys, revokedKeys);
    res.json({ message: "Permissões do usuário atualizadas com sucesso." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno do servidor.";
    res.status(500).json({ error: message });
  }
}
