import { Router } from "express";
import { list, create } from "../../controllers/HealthPlans/index.js";
import { authMiddleware } from "../../middleware/auth.js";
import { requirePermission } from "../../middleware/permission.js";

const router = Router();

router.get("/", authMiddleware, requirePermission("healthplan:view"), list);
router.post("/", authMiddleware, requirePermission("healthplan:manage"), create);

export default router;
