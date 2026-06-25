import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { prisma } from "./lib/prisma.js";
import createAdminRouter from "./routes/Users/createAdmin.js";
import authRouter from "./routes/Auth/login.js";

const app = express();
const PORT = process.env["PORT"] ?? 3000;

const CORS_ORIGIN = process.env["FRONTEND_URL"] ?? "http://localhost:5173";
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/", (_req, res) => {
  res.json({ message: "OdontoGesta API" });
});

app.use("/api/users", createAdminRouter);
app.use("/api/auth", authRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { prisma };
export default app;
