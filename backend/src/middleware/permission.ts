import type { Request, Response, NextFunction } from "express";
import { checkPermission } from "../services/Permissions/index.js";

export function requirePermission(...permissionKeys: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: "Não autenticado." });
      return;
    }

    for (const key of permissionKeys) {
      if (await checkPermission(req.user.role, req.user.id, key)) {
        next();
        return;
      }
    }

    res.status(403).json({ error: "Permissão negada." });
  };
}
