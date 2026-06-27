import { Router } from "express";
import { createUser } from "../../controllers/Users/createUser.js";
import { authMiddleware } from "../../middleware/auth.js";

const router = Router();

router.post("/", authMiddleware, createUser);

export default router;