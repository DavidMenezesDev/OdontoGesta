import { Router } from "express";
import { get, update } from "../../controllers/Enterprise/index.js";
import { authMiddleware } from "../../middleware/auth.js";

const router = Router();

router.get("/", authMiddleware, get);
router.put("/", authMiddleware, update);

export default router;
