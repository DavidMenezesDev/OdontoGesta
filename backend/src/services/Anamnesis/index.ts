import { prisma } from "../../lib/prisma.js";
import { QUESTIONS, TEMPLATES } from "./defaultData.js";

export interface QuestionResult {
  id: string;
  pergunta: string;
  tipo: number;
  alerta: number;
  labelPergunta: string | null;
  labelAlerta: string | null;
  opcoes: unknown;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnamnesisResult {
  id: string;
  nome: string;
  active: boolean;
  createdAt: Date;
  questions: {
    id: string;
    ordem: number;
    obrigatorio: boolean;
    question: QuestionResult;
  }[];
}

export interface CreateQuestionParams {
  pergunta: string;
  tipo: number;
  alerta: number;
  labelPergunta?: string;
  labelAlerta?: string;
  opcoes?: unknown;
}

export interface CreateAnamnesisParams {
  nome: string;
  questions: { questionId: string; ordem?: number; obrigatorio?: boolean }[];
}

export interface UpdateAnamnesisParams {
  nome?: string;
  questions?: { questionId: string; ordem?: number; obrigatorio?: boolean }[];
}

export async function listQuestions(enterpriseId: string): Promise<QuestionResult[]> {
  return prisma.question.findMany({
    where: { enterpriseId, active: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function createQuestion(
  params: CreateQuestionParams,
  enterpriseId: string,
): Promise<QuestionResult> {
  return prisma.question.create({
    data: {
      enterpriseId,
      pergunta: params.pergunta,
      tipo: params.tipo,
      alerta: params.alerta,
      labelPergunta: params.labelPergunta ?? null,
      labelAlerta: params.labelAlerta ?? null,
      ...(params.opcoes !== undefined ? { opcoes: params.opcoes as never } : {}),
    },
  });
}

export async function updateQuestion(
  id: string,
  enterpriseId: string,
  params: Partial<CreateQuestionParams>,
): Promise<QuestionResult> {
  const existing = await prisma.question.findFirst({
    where: { id, enterpriseId },
  });
  if (!existing) throw new Error("Pergunta não encontrada.");

  return prisma.question.update({
    where: { id },
    data: {
      ...(params.pergunta !== undefined && { pergunta: params.pergunta }),
      ...(params.tipo !== undefined && { tipo: params.tipo }),
      ...(params.alerta !== undefined && { alerta: params.alerta }),
      ...(params.labelPergunta !== undefined && { labelPergunta: params.labelPergunta }),
      ...(params.labelAlerta !== undefined && { labelAlerta: params.labelAlerta }),
      ...(params.opcoes !== undefined && { opcoes: params.opcoes as never }),
    },
  });
}

export async function seedDefaultAnamnesis(enterpriseId: string): Promise<void> {
  const existingCount = await prisma.anamnesis.count({ where: { enterpriseId, active: true } });
  if (existingCount > 0) return;

  const questionMap = new Map<string, string>();

  for (const q of QUESTIONS) {
    const created = await prisma.question.create({
      data: {
        enterpriseId,
        pergunta: q.pergunta,
        tipo: q.tipo,
        alerta: q.alerta,
        labelPergunta: q.labelPergunta ?? null,
        labelAlerta: q.labelAlerta ?? null,
      },
    });
    questionMap.set(q.pergunta, created.id);
  }

  for (const template of TEMPLATES) {
    await prisma.anamnesis.create({
      data: {
        enterpriseId,
        nome: template.nome,
        questions: {
          create: template.questions.map((questionIndex, ordem) => ({
            questionId: questionMap.get(QUESTIONS[questionIndex]!.pergunta)!,
            ordem,
          })),
        },
      },
    });
  }
}

export async function listAnamneses(enterpriseId: string): Promise<AnamnesisResult[]> {
  const existingCount = await prisma.anamnesis.count({ where: { enterpriseId, active: true } });
  if (existingCount === 0) {
    await seedDefaultAnamnesis(enterpriseId);
  }

  const anamneses = await prisma.anamnesis.findMany({
    where: { enterpriseId, active: true },
    orderBy: { createdAt: "desc" },
    include: {
      questions: {
        orderBy: { ordem: "asc" },
        include: { question: true },
      },
    },
  });

  return anamneses.map(mapAnamnesis);
}

export async function getAnamnesis(id: string, enterpriseId: string): Promise<AnamnesisResult> {
  const anamnesis = await prisma.anamnesis.findFirst({
    where: { id, enterpriseId },
    include: {
      questions: {
        orderBy: { ordem: "asc" },
        include: { question: true },
      },
    },
  });

  if (!anamnesis) throw new Error("Anamnese não encontrada.");
  return mapAnamnesis(anamnesis);
}

export async function createAnamnesis(
  params: CreateAnamnesisParams,
  enterpriseId: string,
): Promise<AnamnesisResult> {
  const anamnesis = await prisma.anamnesis.create({
    data: {
      enterpriseId,
      nome: params.nome,
      questions: {
        create: params.questions.map((q, i) => ({
          questionId: q.questionId,
          ordem: q.ordem ?? i,
          obrigatorio: q.obrigatorio ?? false,
        })),
      },
    },
    include: {
      questions: {
        orderBy: { ordem: "asc" },
        include: { question: true },
      },
    },
  });

  return mapAnamnesis(anamnesis);
}

export async function updateAnamnesis(
  id: string,
  enterpriseId: string,
  params: UpdateAnamnesisParams,
): Promise<AnamnesisResult> {
  const existing = await prisma.anamnesis.findFirst({
    where: { id, enterpriseId },
  });
  if (!existing) throw new Error("Anamnese não encontrada.");

  const updateData: Record<string, unknown> = {};
  if (params.nome !== undefined) updateData["nome"] = params.nome;

  await prisma.$transaction(async (tx) => {
    if (params.nome !== undefined) {
      await tx.anamnesis.update({ where: { id }, data: { nome: params.nome } });
    }

    if (params.questions !== undefined) {
      await tx.anamnesisQuestion.deleteMany({ where: { anamnesisId: id } });

      if (params.questions.length > 0) {
        await tx.anamnesisQuestion.createMany({
          data: params.questions.map((q, i) => ({
            anamnesisId: id,
            questionId: q.questionId,
            ordem: q.ordem ?? i,
            obrigatorio: q.obrigatorio ?? false,
          })),
        });
      }
    }
  });

  return getAnamnesis(id, enterpriseId);
}

export async function deleteAnamnesis(id: string, enterpriseId: string): Promise<void> {
  const existing = await prisma.anamnesis.findFirst({
    where: { id, enterpriseId },
  });
  if (!existing) throw new Error("Anamnese não encontrada.");

  await prisma.anamnesis.update({
    where: { id },
    data: { active: false },
  });
}

function mapAnamnesis(anamnesis: {
  id: string;
  nome: string;
  active: boolean;
  createdAt: Date;
  questions: {
    id: string;
    ordem: number;
    obrigatorio: boolean;
    question: QuestionResult;
  }[];
}): AnamnesisResult {
  return {
    id: anamnesis.id,
    nome: anamnesis.nome,
    active: anamnesis.active,
    createdAt: anamnesis.createdAt,
    questions: anamnesis.questions.map((q) => ({
      id: q.id,
      ordem: q.ordem,
      obrigatorio: q.obrigatorio,
      question: q.question,
    })),
  };
}
