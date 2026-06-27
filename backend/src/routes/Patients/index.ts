import { Router } from "express";
import { create, list, getById, update, remove } from "../../controllers/Patients/index.js";
import { authMiddleware } from "../../middleware/auth.js";
import { requirePermission } from "../../middleware/permission.js";

const router = Router();

router.post("/", authMiddleware, requirePermission("patient:create"), create);
router.get("/", authMiddleware, requirePermission("patient:view"), list);
router.get("/:id", authMiddleware, requirePermission("patient:view"), getById);
router.put("/:id", authMiddleware, requirePermission("patient:edit"), update);
router.delete("/:id", authMiddleware, requirePermission("patient:delete"), remove);

export default router;
