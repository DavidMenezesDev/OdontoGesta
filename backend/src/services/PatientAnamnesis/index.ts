import { prisma } from "../../lib/prisma.js";

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
  createdAt: Date;
  updatedAt: Date;
  answers: AnamnesisAnswerResult[];
}

export interface CreatePatientAnamnesisParams {
  anamnesisId: string;
  answers: { questionId: string; resposta: string }[];
}

export async function listPatientAnamneses(
  patientId: string,
  enterpriseId: string,
): Promise<PatientAnamnesisResult[]> {
  const patientAnamneses = await prisma.patientAnamnesis.findMany({
    where: {
      patientId,
      patient: { enterpriseId },
    },
    include: {
      anamnesis: true,
      answers: {
        include: { question: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return patientAnamneses.map(mapPatientAnamnesis);
}

export async function createPatientAnamnesis(
  patientId: string,
  enterpriseId: string,
  params: CreatePatientAnamnesisParams,
): Promise<PatientAnamnesisResult> {
  const patient = await prisma.patient.findFirst({
    where: { id: patientId, enterpriseId },
  });
  if (!patient) throw new Error("Paciente não encontrado.");

  const anamnesis = await prisma.anamnesis.findFirst({
    where: { id: params.anamnesisId, enterpriseId, active: true },
  });
  if (!anamnesis) throw new Error("Anamnese não encontrada.");

  const existing = await prisma.patientAnamnesis.findUnique({
    where: { patientId_anamnesisId: { patientId, anamnesisId: params.anamnesisId } },
  });
  if (existing) throw new Error("Esta anamnese já foi preenchida para este paciente.");

  const result = await prisma.patientAnamnesis.create({
    data: {
      patientId,
      anamnesisId: params.anamnesisId,
      answers: {
        create: params.answers.map((a) => ({
          questionId: a.questionId,
          resposta: a.resposta ?? null,
        })),
      },
    },
    include: {
      anamnesis: true,
      answers: {
        include: { question: true },
      },
    },
  });

  return mapPatientAnamnesis(result);
}

export async function updatePatientAnamnesis(
  id: string,
  patientId: string,
  enterpriseId: string,
  params: { answers: { questionId: string; resposta: string }[] },
): Promise<PatientAnamnesisResult> {
  const existing = await prisma.patientAnamnesis.findFirst({
    where: { id, patientId, patient: { enterpriseId } },
  });
  if (!existing) throw new Error("Anamnese do paciente não encontrada.");

  await prisma.$transaction(async (tx) => {
    for (const answer of params.answers) {
      await tx.anamnesisAnswer.upsert({
        where: {
          patientAnamnesisId_questionId: {
            patientAnamnesisId: id,
            questionId: answer.questionId,
          },
        },
        create: {
          patientAnamnesisId: id,
          questionId: answer.questionId,
          resposta: answer.resposta ?? null,
        },
        update: {
          resposta: answer.resposta ?? null,
        },
      });
    }
  });

  const result = await prisma.patientAnamnesis.findUnique({
    where: { id },
    include: {
      anamnesis: true,
      answers: {
        include: { question: true },
      },
    },
  });

  return mapPatientAnamnesis(result!);
}

function mapPatientAnamnesis(data: {
  id: string;
  patientId: string;
  anamnesisId: string;
  createdAt: Date;
  updatedAt: Date;
  anamnesis: { nome: string };
  answers: {
    id: string;
    questionId: string;
    resposta: string | null;
    question: {
      id: string;
      pergunta: string;
      tipo: number;
      alerta: number;
      labelPergunta: string | null;
      labelAlerta: string | null;
      opcoes: unknown;
    };
  }[];
}): PatientAnamnesisResult {
  return {
    id: data.id,
    patientId: data.patientId,
    anamnesisId: data.anamnesisId,
    anamnesisNome: data.anamnesis.nome,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    answers: data.answers.map((a) => ({
      id: a.id,
      questionId: a.questionId,
      pergunta: a.question.pergunta,
      tipo: a.question.tipo,
      alerta: a.question.alerta,
      labelPergunta: a.question.labelPergunta,
      labelAlerta: a.question.labelAlerta,
      opcoes: a.question.opcoes,
      resposta: a.resposta,
    })),
  };
}
