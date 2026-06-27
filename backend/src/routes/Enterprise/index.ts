import { Router } from "express";
import { get, update } from "../../controllers/Enterprise/index.js";
import { authMiddleware } from "../../middleware/auth.js";
import { requirePermission } from "../../middleware/permission.js";

const router = Router();

router.get("/", authMiddleware, requirePermission("enterprise:view"), get);
router.put("/", authMiddleware, requirePermission("enterprise:edit"), update);

export default router;
