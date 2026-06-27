import { Router } from "express";
import { create, list, getById, update, remove, followUp } from "../../controllers/Appointments/index.js";
import { authMiddleware } from "../../middleware/auth.js";
import { requirePermission } from "../../middleware/permission.js";

const router = Router();

router.post("/", authMiddleware, requirePermission("appointment:create"), create);
router.get("/", authMiddleware, requirePermission("appointment:view"), list);
router.get("/:id", authMiddleware, requirePermission("appointment:view"), getById);
router.put("/:id", authMiddleware, requirePermission("appointment:edit"), update);
router.delete("/:id", authMiddleware, requirePermission("appointment:cancel"), remove);
router.post("/:id/follow-up", authMiddleware, requirePermission("appointment:create"), followUp);

export default router;
