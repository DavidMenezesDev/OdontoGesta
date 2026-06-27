import { Router } from "express";
import { createUser } from "../../controllers/Users/createUser.js";
import { listUsers } from "../../controllers/Users/listUsers.js";
import { authMiddleware } from "../../middleware/auth.js";
import { requirePermission } from "../../middleware/permission.js";

const router = Router();

router.get("/", authMiddleware, requirePermission("user:view"), listUsers);
router.post("/", authMiddleware, requirePermission("user:create"), createUser);

export default router;