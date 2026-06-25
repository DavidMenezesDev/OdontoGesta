import { Router } from "express";
import { login, me, logout } from "../../controllers/Auth/login.js";
import { authMiddleware } from "../../middleware/auth.js";

const router = Router();

router.post("/login", login);
router.get("/me", authMiddleware, me);
router.post("/logout", authMiddleware, logout);

export default router;
