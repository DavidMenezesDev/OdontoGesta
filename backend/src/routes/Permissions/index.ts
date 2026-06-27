import { Router } from "express";
import {
  listPermissions,
  getRolePermissions,
  updateRolePermissions,
  getMyPermissions,
  getUserPermissions,
  updateUserPermissions,
} from "../../controllers/Permissions/index.js";
import { authMiddleware } from "../../middleware/auth.js";
import { requirePermission } from "../../middleware/permission.js";

const router = Router();

router.get("/me", authMiddleware, getMyPermissions);
router.get("/", authMiddleware, requirePermission("user:view"), listPermissions);
router.get("/roles/:role", authMiddleware, requirePermission("user:view"), getRolePermissions);
router.put("/roles/:role", authMiddleware, requirePermission("user:edit"), updateRolePermissions);
router.get("/users/:userId", authMiddleware, requirePermission("user:edit"), getUserPermissions);
router.put("/users/:userId", authMiddleware, requirePermission("user:edit"), updateUserPermissions);

export default router;
