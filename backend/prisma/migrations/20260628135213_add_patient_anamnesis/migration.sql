-- CreateTable
CREATE TABLE "patient_anamneses" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "anamnesis_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_anamneses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anamnesis_answers" (
    "id" TEXT NOT NULL,
    "patient_anamnesis_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "resposta" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "anamnesis_answers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "patient_anamneses_patient_id_anamnesis_id_key" ON "patient_anamneses"("patient_id", "anamnesis_id");

-- CreateIndex
CREATE UNIQUE INDEX "anamnesis_answers_patient_anamnesis_id_question_id_key" ON "anamnesis_answers"("patient_anamnesis_id", "question_id");

-- AddForeignKey
ALTER TABLE "patient_anamneses" ADD CONSTRAINT "patient_anamneses_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_anamneses" ADD CONSTRAINT "patient_anamneses_anamnesis_id_fkey" FOREIGN KEY ("anamnesis_id") REFERENCES "anamneses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anamnesis_answers" ADD CONSTRAINT "anamnesis_answers_patient_anamnesis_id_fkey" FOREIGN KEY ("patient_anamnesis_id") REFERENCES "patient_anamneses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anamnesis_answers" ADD CONSTRAINT "anamnesis_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
