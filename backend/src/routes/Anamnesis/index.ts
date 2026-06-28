import { Router } from "express";
import {
  list,
  getById,
  create,
  update,
  remove,
  listQuestions,
  createQuestion,
  updateQuestion,
} from "../../controllers/Anamnesis/index.js";
import { authMiddleware } from "../../middleware/auth.js";
import { requirePermission } from "../../middleware/permission.js";

const router = Router();

router.get("/questions", authMiddleware, requirePermission("question:view"), listQuestions);
router.post("/questions", authMiddleware, requirePermission("question:manage"), createQuestion);
router.put("/questions/:id", authMiddleware, requirePermission("question:manage"), updateQuestion);

router.get("/", authMiddleware, requirePermission("anamnesis:view"), list);
router.post("/", authMiddleware, requirePermission("anamnesis:create"), create);
router.get("/:id", authMiddleware, requirePermission("anamnesis:view"), getById);
router.put("/:id", authMiddleware, requirePermission("anamnesis:edit"), update);
router.delete("/:id", authMiddleware, requirePermission("anamnesis:delete"), remove);

export default router;
