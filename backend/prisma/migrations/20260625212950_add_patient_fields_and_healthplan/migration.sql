-- AlterTable
ALTER TABLE "patients" ADD COLUMN     "gender" TEXT,
ADD COLUMN     "guardian_birth_date" TIMESTAMP(3),
ADD COLUMN     "guardian_document" TEXT,
ADD COLUMN     "guardian_name" TEXT,
ADD COLUMN     "guardian_phone" TEXT,
ADD COLUMN     "health_plan_id" TEXT,
ADD COLUMN     "nationality" TEXT,
ADD COLUMN     "occupation" TEXT,
ADD COLUMN     "record_number" TEXT,
ADD COLUMN     "tags" JSONB;

-- CreateTable
CREATE TABLE "health_plans" (
    "id" TEXT NOT NULL,
    "enterprise_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "health_plans_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_health_plan_id_fkey" FOREIGN KEY ("health_plan_id") REFERENCES "health_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_plans" ADD CONSTRAINT "health_plans_enterprise_id_fkey" FOREIGN KEY ("enterprise_id") REFERENCES "enterprises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
