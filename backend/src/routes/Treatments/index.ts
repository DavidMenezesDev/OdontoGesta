import { Router } from "express";
import { list, update } from "../../controllers/Treatments/index.js";
import { authMiddleware } from "../../middleware/auth.js";
import { requirePermission } from "../../middleware/permission.js";

const router = Router();

router.get("/", authMiddleware, requirePermission("treatment:view"), list);
router.put("/:id", authMiddleware, requirePermission("treatment:manage"), update);

export default router;
