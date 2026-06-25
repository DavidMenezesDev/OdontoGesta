import { Router } from "express";
import { create, list, getById, update, remove } from "../../controllers/Patients/index.js";
import { authMiddleware } from "../../middleware/auth.js";

const router = Router();

router.post("/", authMiddleware, create);
router.get("/", authMiddleware, list);
router.get("/:id", authMiddleware, getById);
router.put("/:id", authMiddleware, update);
router.delete("/:id", authMiddleware, remove);

export default router;
