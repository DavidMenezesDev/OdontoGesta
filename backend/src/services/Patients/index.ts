import { prisma } from "../../lib/prisma.js";

export interface CreatePatientParams {
  name: string;
  gender?: string;
  document?: string;
  nationality?: string;
  email?: string;
  phone: string;
  recordNumber?: string;
  occupation?: string;
  birthDate?: string;
  address?: string;
  tags?: string[];
  guardianName?: string;
  guardianBirthDate?: string;
  guardianDocument?: string;
  guardianPhone?: string;
  healthPlanId?: string;
  notes?: string;
}

export interface UpdatePatientParams extends Partial<CreatePatientParams> {
  active?: boolean;
}

export interface PatientResult {
  id: string;
  name: string;
  gender: string | null;
  document: string | null;
  nationality: string | null;
  email: string | null;
  phone: string;
  recordNumber: string | null;
  occupation: string | null;
  birthDate: string | null;
  address: string | null;
  tags: string[];
  guardianName: string | null;
  guardianBirthDate: string | null;
  guardianDocument: string | null;
  guardianPhone: string | null;
  healthPlanId: string | null;
  healthPlan: { id: string; name: string } | null;
  notes: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

function mapPatient(patient: any): PatientResult {
  return {
    id: patient.id,
    name: patient.name,
    gender: patient.gender ?? null,
    document: patient.document ?? null,
    nationality: patient.nationality ?? null,
    email: patient.email ?? null,
    phone: patient.phone,
    recordNumber: patient.recordNumber ?? null,
    occupation: patient.occupation ?? null,
    birthDate: patient.birthDate?.toISOString() ?? null,
    address: patient.address ?? null,
    tags: Array.isArray(patient.tags) ? patient.tags : [],
    guardianName: patient.guardianName ?? null,
    guardianBirthDate: patient.guardianBirthDate?.toISOString() ?? null,
    guardianDocument: patient.guardianDocument ?? null,
    guardianPhone: patient.guardianPhone ?? null,
    healthPlanId: patient.healthPlanId ?? null,
    healthPlan: patient.healthPlan ?? null,
    notes: patient.notes ?? null,
    active: patient.active,
    createdAt: patient.createdAt.toISOString(),
    updatedAt: patient.updatedAt.toISOString(),
  };
}

export async function createPatient(params: CreatePatientParams, enterpriseId: string): Promise<PatientResult> {
  const patient = await prisma.patient.create({
    data: {
      enterpriseId,
      name: params.name,
      gender: params.gender ?? null,
      document: params.document ?? null,
      nationality: params.nationality ?? null,
      email: params.email ?? null,
      phone: params.phone,
      recordNumber: params.recordNumber ?? null,
      occupation: params.occupation ?? null,
      birthDate: params.birthDate ? new Date(params.birthDate) : null,
      address: params.address ?? null,
      ...(params.tags ? { tags: params.tags as any } : {}),
      guardianName: params.guardianName ?? null,
      guardianBirthDate: params.guardianBirthDate ? new Date(params.guardianBirthDate) : null,
      guardianDocument: params.guardianDocument ?? null,
      guardianPhone: params.guardianPhone ?? null,
      healthPlanId: params.healthPlanId ?? null,
      notes: params.notes ?? null,
    },
    include: { healthPlan: { select: { id: true, name: true } } },
  });

  return mapPatient(patient);
}

export async function listPatients(enterpriseId: string, search?: string): Promise<PatientResult[]> {
  const where: any = { enterpriseId, active: true };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { document: { contains: search } },
      { phone: { contains: search } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const patients = await prisma.patient.findMany({
    where,
    include: { healthPlan: { select: { id: true, name: true } } },
    orderBy: { name: "asc" },
  });

  return patients.map(mapPatient);
}

export async function getPatientById(id: string, enterpriseId: string): Promise<PatientResult | null> {
  const patient = await prisma.patient.findFirst({
    where: { id, enterpriseId },
    include: { healthPlan: { select: { id: true, name: true } } },
  });

  return patient ? mapPatient(patient) : null;
}

export async function updatePatient(id: string, params: UpdatePatientParams, enterpriseId: string): Promise<PatientResult> {
  const patient = await prisma.patient.update({
    where: { id },
    data: {
      ...(params.name !== undefined && { name: params.name }),
      ...(params.gender !== undefined && { gender: params.gender }),
      ...(params.document !== undefined && { document: params.document }),
      ...(params.nationality !== undefined && { nationality: params.nationality }),
      ...(params.email !== undefined && { email: params.email }),
      ...(params.phone !== undefined && { phone: params.phone }),
      ...(params.recordNumber !== undefined && { recordNumber: params.recordNumber }),
      ...(params.occupation !== undefined && { occupation: params.occupation }),
      ...(params.birthDate !== undefined && { birthDate: params.birthDate ? new Date(params.birthDate) : null }),
      ...(params.address !== undefined && { address: params.address }),
      ...(params.tags !== undefined && { tags: params.tags as any }),
      ...(params.guardianName !== undefined && { guardianName: params.guardianName }),
      ...(params.guardianBirthDate !== undefined && { guardianBirthDate: params.guardianBirthDate ? new Date(params.guardianBirthDate) : null }),
      ...(params.guardianDocument !== undefined && { guardianDocument: params.guardianDocument }),
      ...(params.guardianPhone !== undefined && { guardianPhone: params.guardianPhone }),
      ...(params.healthPlanId !== undefined && { healthPlanId: params.healthPlanId }),
      ...(params.notes !== undefined && { notes: params.notes }),
      ...(params.active !== undefined && { active: params.active }),
    },
    include: { healthPlan: { select: { id: true, name: true } } },
  });

  return mapPatient(patient);
}

export async function deletePatient(id: string, enterpriseId: string): Promise<void> {
  await prisma.patient.update({
    where: { id },
    data: { active: false },
  });
}
