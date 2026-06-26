import { Router } from "express";
import { createAdmin } from "../../controllers/Users/createAdmin.js";
import { listDentists } from "../../controllers/Users/listDentists.js";
import { authMiddleware } from "../../middleware/auth.js";

const router = Router();

router.post("/admin", createAdmin);
router.get("/dentists", authMiddleware, listDentists);

export default router;
