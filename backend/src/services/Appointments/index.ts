import { prisma } from "../../lib/prisma.js";

export interface CreateAppointmentParams {
  date: string;
  endTime?: string;
  patientId: string;
  dentistId: string;
  notes?: string;
  tag?: string;
}

export interface UpdateAppointmentParams {
  date?: string;
  endTime?: string;
  patientId?: string;
  dentistId?: string;
  status?: string;
  notes?: string;
  tag?: string;
}

export interface AppointmentResult {
  id: string;
  date: string;
  endTime: string | null;
  status: string;
  notes: string | null;
  tag: string | null;
  patientId: string;
  dentistId: string;
  patient: { id: string; name: string; phone: string };
  dentist: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

function mapAppointment(apt: any): AppointmentResult {
  return {
    id: apt.id,
    date: apt.date.toISOString(),
    endTime: apt.endTime?.toISOString() ?? null,
    status: apt.status,
    notes: apt.notes ?? null,
    tag: apt.tag ?? null,
    patientId: apt.patientId,
    dentistId: apt.dentistId,
    patient: { id: apt.patient.id, name: apt.patient.name, phone: apt.patient.phone },
    dentist: { id: apt.dentist.id, name: apt.dentist.name },
    createdAt: apt.createdAt.toISOString(),
    updatedAt: apt.updatedAt.toISOString(),
  };
}

export async function createAppointment(params: CreateAppointmentParams, enterpriseId: string): Promise<AppointmentResult> {
  const patient = await prisma.patient.findFirst({ where: { id: params.patientId, enterpriseId, active: true } });
  if (!patient) {
    throw new Error("Paciente não encontrado.");
  }

  const dentist = await prisma.user.findFirst({ where: { id: params.dentistId, enterpriseId, role: { in: ["DENTIST", "ADMIN"] } } });
  if (!dentist) {
    throw new Error("Dentista não encontrado.");
  }

  const appointment = await prisma.appointment.create({
    data: {
      enterpriseId,
      date: new Date(params.date),
      endTime: params.endTime ? new Date(params.endTime) : null,
      patientId: params.patientId,
      dentistId: params.dentistId,
      notes: params.notes ?? null,
      tag: params.tag ?? null,
    },
    include: {
      patient: { select: { id: true, name: true, phone: true } },
      dentist: { select: { id: true, name: true } },
    },
  });

  return mapAppointment(appointment);
}

export async function listAppointments(
  enterpriseId: string,
  filters: { date?: string; year?: string; month?: string },
): Promise<AppointmentResult[]> {
  const where: any = { enterpriseId };

  if (filters.date) {
    const day = new Date(filters.date);
    const start = new Date(day.getFullYear(), day.getMonth(), day.getDate());
    const end = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1);
    where.date = { gte: start, lt: end };
  } else if (filters.year && filters.month) {
    const year = parseInt(filters.year, 10);
    const month = parseInt(filters.month, 10) - 1;
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 1);
    where.date = { gte: start, lt: end };
  } else if (filters.year) {
    const year = parseInt(filters.year, 10);
    const start = new Date(year, 0, 1);
    const end = new Date(year + 1, 0, 1);
    where.date = { gte: start, lt: end };
  }

  const appointments = await prisma.appointment.findMany({
    where,
    include: {
      patient: { select: { id: true, name: true, phone: true } },
      dentist: { select: { id: true, name: true } },
    },
    orderBy: { date: "asc" },
  });

  return appointments.map(mapAppointment);
}

export async function getAppointmentById(id: string, enterpriseId: string): Promise<AppointmentResult | null> {
  const appointment = await prisma.appointment.findFirst({
    where: { id, enterpriseId },
    include: {
      patient: { select: { id: true, name: true, phone: true } },
      dentist: { select: { id: true, name: true } },
    },
  });

  return appointment ? mapAppointment(appointment) : null;
}

export async function updateAppointment(id: string, params: UpdateAppointmentParams, enterpriseId: string): Promise<AppointmentResult> {
  const existing = await prisma.appointment.findFirst({ where: { id, enterpriseId } });
  if (!existing) {
    throw new Error("Agendamento não encontrado.");
  }

  if (params.patientId) {
    const patient = await prisma.patient.findFirst({ where: { id: params.patientId, enterpriseId, active: true } });
    if (!patient) {
      throw new Error("Paciente não encontrado.");
    }
  }

  if (params.dentistId) {
    const dentist = await prisma.user.findFirst({ where: { id: params.dentistId, enterpriseId, role: { in: ["DENTIST", "ADMIN"] } } });
    if (!dentist) {
      throw new Error("Dentista não encontrado.");
    }
  }

  const appointment = await prisma.appointment.update({
    where: { id },
    data: {
      ...(params.date !== undefined && { date: new Date(params.date) }),
      ...(params.endTime !== undefined && { endTime: params.endTime ? new Date(params.endTime) : null }),
      ...(params.patientId !== undefined && { patientId: params.patientId }),
      ...(params.dentistId !== undefined && { dentistId: params.dentistId }),
      ...(params.status !== undefined && { status: params.status as any }),
      ...(params.notes !== undefined && { notes: params.notes }),
      ...(params.tag !== undefined && { tag: params.tag }),
    },
    include: {
      patient: { select: { id: true, name: true, phone: true } },
      dentist: { select: { id: true, name: true } },
    },
  });

  return mapAppointment(appointment);
}

export async function deleteAppointment(id: string, enterpriseId: string): Promise<void> {
  const existing = await prisma.appointment.findFirst({ where: { id, enterpriseId } });
  if (!existing) {
    throw new Error("Agendamento não encontrado.");
  }

  await prisma.appointment.delete({ where: { id } });
}

function nextBusinessDay(date: Date): Date {
  const result = new Date(date);
  while (result.getDay() === 0 || result.getDay() === 6) {
    result.setDate(result.getDate() + 1);
  }
  return result;
}

export interface FollowUpParams {
  appointmentId: string;
  months?: number;
  specificDate?: string;
}

export async function createFollowUp(params: FollowUpParams, enterpriseId: string): Promise<AppointmentResult> {
  const existing = await prisma.appointment.findFirst({
    where: { id: params.appointmentId, enterpriseId },
    include: {
      patient: { select: { id: true, name: true, phone: true } },
      dentist: { select: { id: true, name: true } },
    },
  });

  if (!existing) {
    throw new Error("Agendamento não encontrado.");
  }

  let followUpDate: Date;

  if (params.specificDate) {
    followUpDate = new Date(params.specificDate);
    if (isNaN(followUpDate.getTime())) {
      throw new Error("Data inválida.");
    }
  } else if (params.months !== undefined && params.months > 0) {
    followUpDate = new Date(existing.date);
    followUpDate.setMonth(followUpDate.getMonth() + params.months);
  } else {
    throw new Error("Informe os meses ou uma data específica para o retorno.");
  }

  followUpDate = nextBusinessDay(followUpDate);

  const originalD = new Date(existing.date);
  const newStart = new Date(followUpDate);
  newStart.setHours(originalD.getHours(), originalD.getMinutes(), 0, 0);

  let newEnd: Date | null = null;
  if (existing.endTime) {
    const origEnd = new Date(existing.endTime);
    const origStart = new Date(existing.date);
    const durationMs = origEnd.getTime() - origStart.getTime();
    newEnd = new Date(newStart.getTime() + durationMs);
  }

  const appointment = await prisma.appointment.create({
    data: {
      enterpriseId,
      date: newStart,
      endTime: newEnd,
      patientId: existing.patientId,
      dentistId: existing.dentistId,
      notes: existing.notes,
      tag: "retorno",
    },
    include: {
      patient: { select: { id: true, name: true, phone: true } },
      dentist: { select: { id: true, name: true } },
    },
  });

  return mapAppointment(appointment);
}
