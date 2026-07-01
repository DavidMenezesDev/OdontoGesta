-- CreateEnum
CREATE TYPE "PatientTreatmentStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "patient_treatments" (
    "id" TEXT NOT NULL,
    "enterprise_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "dentist_id" TEXT NOT NULL,
    "treatment_id" TEXT NOT NULL,
    "health_plan_id" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "value" DECIMAL(65,30) NOT NULL,
    "teeth" JSONB,
    "faces" JSONB,
    "notes" TEXT,
    "status" "PatientTreatmentStatus" NOT NULL DEFAULT 'PLANNED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_treatments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "patient_treatments" ADD CONSTRAINT "patient_treatments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_treatments" ADD CONSTRAINT "patient_treatments_dentist_id_fkey" FOREIGN KEY ("dentist_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_treatments" ADD CONSTRAINT "patient_treatments_treatment_id_fkey" FOREIGN KEY ("treatment_id") REFERENCES "treatments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_treatments" ADD CONSTRAINT "patient_treatments_health_plan_id_fkey" FOREIGN KEY ("health_plan_id") REFERENCES "health_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_treatments" ADD CONSTRAINT "patient_treatments_enterprise_id_fkey" FOREIGN KEY ("enterprise_id") REFERENCES "enterprises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
