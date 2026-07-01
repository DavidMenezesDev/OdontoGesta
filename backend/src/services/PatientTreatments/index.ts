import { prisma } from "../../lib/prisma.js";

export interface CreatePatientTreatmentParams {
  dentistId: string;
  treatmentId: string;
  healthPlanId?: string;
  date: string;
  value: number;
  teeth?: number[];
  faces?: string[];
  notes?: string;
}

export interface PatientTreatmentResult {
  id: string;
  patientId: string;
  dentistId: string;
  treatmentId: string;
  healthPlanId: string | null;
  date: string;
  value: number;
  teeth: number[];
  faces: string[];
  notes: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  dentist: { id: string; name: string };
  treatment: { id: string; description: string; value: number };
  healthPlan: { id: string; name: string } | null;
}

function mapPatientTreatment(pt: any): PatientTreatmentResult {
  return {
    id: pt.id,
    patientId: pt.patientId,
    dentistId: pt.dentistId,
    treatmentId: pt.treatmentId,
    healthPlanId: pt.healthPlanId ?? null,
    date: pt.date.toISOString(),
    value: Number(pt.value),
    teeth: Array.isArray(pt.teeth) ? pt.teeth.map(Number) : [],
    faces: Array.isArray(pt.faces) ? pt.faces : [],
    notes: pt.notes ?? null,
    status: pt.status,
    createdAt: pt.createdAt.toISOString(),
    updatedAt: pt.updatedAt.toISOString(),
    dentist: { id: pt.dentist.id, name: pt.dentist.name },
    treatment: { id: pt.treatment.id, description: pt.treatment.description, value: Number(pt.treatment.value) },
    healthPlan: pt.healthPlan ?? null,
  };
}

export async function listPatientTreatments(
  patientId: string,
  enterpriseId: string,
): Promise<PatientTreatmentResult[]> {
  const treatments = await prisma.patientTreatment.findMany({
    where: {
      patientId,
      patient: { enterpriseId },
    },
    include: {
      dentist: { select: { id: true, name: true } },
      treatment: { select: { id: true, description: true, value: true } },
      healthPlan: { select: { id: true, name: true } },
    },
    orderBy: { date: "desc" },
  });

  return treatments.map(mapPatientTreatment);
}

export async function createPatientTreatment(
  patientId: string,
  enterpriseId: string,
  params: CreatePatientTreatmentParams,
): Promise<PatientTreatmentResult> {
  const patient = await prisma.patient.findFirst({
    where: { id: patientId, enterpriseId },
  });
  if (!patient) throw new Error("Paciente não encontrado.");

  const treatment = await prisma.treatment.findFirst({
    where: { id: params.treatmentId, enterpriseId },
  });
  if (!treatment) throw new Error("Tratamento não encontrado.");

  const dentist = await prisma.user.findFirst({
    where: {
      id: params.dentistId,
      enterpriseId,
      role: { in: ["DENTIST", "ADMIN"] },
    },
  });
  if (!dentist) throw new Error("Dentista não encontrado.");

  const result = await prisma.patientTreatment.create({
    data: {
      enterpriseId,
      patientId,
      dentistId: params.dentistId,
      treatmentId: params.treatmentId,
      healthPlanId: params.healthPlanId ?? null,
      date: new Date(params.date),
      value: params.value,
      teeth: params.teeth ?? [],
      faces: params.faces ?? [],
      notes: params.notes ?? null,
    },
    include: {
      dentist: { select: { id: true, name: true } },
      treatment: { select: { id: true, description: true, value: true } },
      healthPlan: { select: { id: true, name: true } },
    },
  });

  return mapPatientTreatment(result);
}

export async function deletePatientTreatment(
  id: string,
  patientId: string,
  enterpriseId: string,
): Promise<void> {
  const existing = await prisma.patientTreatment.findFirst({
    where: { id, patientId, patient: { enterpriseId } },
  });
  if (!existing) throw new Error("Tratamento do paciente não encontrado.");

  await prisma.patientTreatment.delete({ where: { id } });
}
