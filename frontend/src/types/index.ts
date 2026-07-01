export type UserRole = "ADMIN" | "DENTIST" | "RECEP" | "FINANCE";

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
  gender?: string;
  document?: string;
  nationality?: string;
  email?: string;
  phone: string;
  recordNumber?: string;
  occupation?: string;
  birthDate?: string;
  address?: string;
  tags: string[];
  guardianName?: string;
  guardianBirthDate?: string;
  guardianDocument?: string;
  guardianPhone?: string;
  healthPlanId?: string;
  healthPlan?: { id: string; name: string };
  notes?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HealthPlan {
  id: string;
  name: string;
  active: boolean;
}

export interface Appointment {
  id: string;
  date: string;
  endTime?: string;
  status: AppointmentStatus;
  notes?: string;
  tag?: string;
  patientId: string;
  dentistId: string;
  patient: { id: string; name: string; phone: string };
  dentist: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface Enterprise {
  id: string;
  cnpj: string | null;
  nome: string | null;
  phone: string | null;
  email: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  logo: string | null;
  active: boolean;
}

export type TreatmentClass =
  | "NONE"
  | "DIAGNOST"
  | "ODONTO_CIRUR"
  | "ODONTO_PREVENTIVA"
  | "ODONTO_REST"
  | "ODONTO_PEDIAT"
  | "ORTOD_ORTOP"
  | "PAC_ESPEC";

export interface Treatment {
  id: string;
  class: TreatmentClass;
  description: string;
  value: number;
  cost: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PatientTreatment {
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

export interface AnamnesisAnswerResult {
  id: string;
  questionId: string;
  pergunta: string;
  tipo: number;
  alerta: number;
  labelPergunta: string | null;
  labelAlerta: string | null;
  opcoes: unknown;
  resposta: string | null;
}

export interface PatientAnamnesisResult {
  id: string;
  patientId: string;
  anamnesisId: string;
  anamnesisNome: string;
  createdAt: string;
  updatedAt: string;
  answers: AnamnesisAnswerResult[];
}

export interface Question {
  id: string;
  pergunta: string;
  tipo: number;
  alerta: number;
  labelPergunta: string | null;
  labelAlerta: string | null;
  opcoes: unknown;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AnamnesisQuestion {
  id: string;
  ordem: number;
  obrigatorio: boolean;
  question: Question;
}

export interface Anamnesis {
  id: string;
  nome: string;
  active: boolean;
  createdAt: string;
  questions: AnamnesisQuestion[];
}
