import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { prisma } from "./lib/prisma.js";
import createAdminRouter from "./routes/Users/createAdmin.js";
import authRouter from "./routes/Auth/login.js";
import patientsRouter from "./routes/Patients/index.js";
import healthPlansRouter from "./routes/HealthPlans/index.js";
import appointmentsRouter from "./routes/Appointments/index.js";
import enterpriseRouter from "./routes/Enterprise/index.js";
import createUsersRouter from "./routes/Users/createUsers.js";
import permissionsRouter from "./routes/Permissions/index.js";
import anamnesisRouter from "./routes/Anamnesis/index.js";

const app = express();
const PORT = process.env["PORT"] ?? 3000;

const CORS_ORIGIN = process.env.FRONTEND_URL;
console.log(CORS_ORIGIN);
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/", (_req, res) => {
  res.json({ message: "OdontoGesta API" });
});

app.use("/api/users", createAdminRouter);
app.use("/api/auth", authRouter);
app.use("/api/patients", patientsRouter);
app.use("/api/health-plans", healthPlansRouter);
app.use("/api/appointments", appointmentsRouter);
app.use("/api/enterprise", enterpriseRouter);
app.use("/api/users", createUsersRouter);
app.use("/api/permissions", permissionsRouter);
app.use("/api/anamnesis", anamnesisRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { prisma };
export default app;
