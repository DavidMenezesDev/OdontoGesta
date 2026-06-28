import { Router } from "express";
import { list, create, update } from "../../controllers/PatientAnamnesis/index.js";
import { authMiddleware } from "../../middleware/auth.js";
import { requirePermission } from "../../middleware/permission.js";

const router = Router();

router.get("/:patientId/anamnesis", authMiddleware, requirePermission("patient:view"), list);
router.post("/:patientId/anamnesis", authMiddleware, requirePermission("patient:edit"), create);
router.put("/:patientId/anamnesis/:id", authMiddleware, requirePermission("patient:edit"), update);

export default router;
