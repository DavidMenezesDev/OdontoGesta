import { Router } from "express";
import { list, create } from "../../controllers/HealthPlans/index.js";
import { authMiddleware } from "../../middleware/auth.js";

const router = Router();

router.get("/", authMiddleware, list);
router.post("/", authMiddleware, create);

export default router;
