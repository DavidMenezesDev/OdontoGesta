/*
  Warnings:

  - Added the required column `cost` to the `treatments` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TreatmentClass" AS ENUM ('NONE', 'DIAGNOST', 'ODONTO_CIRUR', 'ODONTO_PREVENTIVA', 'ODONTO_REST', 'ODONTO_PEDIAT', 'ORTOD_ORTOP', 'PAC_ESPEC');

-- AlterTable
ALTER TABLE "treatments" ADD COLUMN     "class" "TreatmentClass" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "cost" DECIMAL(65,30) NOT NULL;

-- CreateTable
CREATE TABLE "_HealthPlanToTreatment" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_HealthPlanToTreatment_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_HealthPlanToTreatment_B_index" ON "_HealthPlanToTreatment"("B");

-- AddForeignKey
ALTER TABLE "_HealthPlanToTreatment" ADD CONSTRAINT "_HealthPlanToTreatment_A_fkey" FOREIGN KEY ("A") REFERENCES "health_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_HealthPlanToTreatment" ADD CONSTRAINT "_HealthPlanToTreatment_B_fkey" FOREIGN KEY ("B") REFERENCES "treatments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
