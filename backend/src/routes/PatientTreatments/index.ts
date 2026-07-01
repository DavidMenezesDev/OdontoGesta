import { Router } from "express";
import {
  list,
  create,
  remove,
} from "../../controllers/PatientTreatments/index.js";
import { authMiddleware } from "../../middleware/auth.js";
import { requirePermission } from "../../middleware/permission.js";

const router = Router();

router.get(
  "/:patientId/treatments",
  authMiddleware,
  requirePermission("patient:view"),
  list,
);
router.post(
  "/:patientId/treatments",
  authMiddleware,
  requirePermission("patient:edit"),
  create,
);
router.delete(
  "/:patientId/treatments/:id",
  authMiddleware,
  requirePermission("patient:edit"),
  remove,
);

export default router;
