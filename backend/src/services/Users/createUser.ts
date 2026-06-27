import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma.js";

export interface  CreateUserParams {
    enterpriseID: string;
    name: string;
    email: string;
    password: string;
    role: "DENTIST" | "RECEP" | "FINANCE";
    phone?: string;
}

export interface CreateUserResult {
    id: string;
    name: string;
    email: string;
    role: string;
    phone: string | null;
    active: boolean;
    createdAt: Date;
}
