export type UserRole = "ADMIN" | "DENTIST" | "STAFF";

export type AppointmentStatus =
  | "SCHEDULED"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Patient {
  id: string;
  name: string;
  email?: string;
  phone: string;
  document?: string;
  birthDate?: string;
  address?: string;
  notes?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  date: string;
  status: AppointmentStatus;
  notes?: string;
  patientId: string;
  dentistId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Treatment {
  id: string;
  description: string;
  value: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
