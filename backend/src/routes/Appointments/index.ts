import { Router } from "express";
import { create, list, getById, update, remove, followUp } from "../../controllers/Appointments/index.js";
import { authMiddleware } from "../../middleware/auth.js";

const router = Router();

router.post("/", authMiddleware, create);
router.get("/", authMiddleware, list);
router.get("/:id", authMiddleware, getById);
router.put("/:id", authMiddleware, update);
router.delete("/:id", authMiddleware, remove);
router.post("/:id/follow-up", authMiddleware, followUp);

export default router;
