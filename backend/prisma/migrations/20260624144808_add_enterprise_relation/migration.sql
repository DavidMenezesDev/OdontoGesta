/*
  Warnings:

  - You are about to drop the `Enterprise` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `enterprise_id` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `enterprise_id` to the `patients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `enterprise_id` to the `treatments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `enterprise_id` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "enterprise_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "patients" ADD COLUMN     "enterprise_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "treatments" ADD COLUMN     "enterprise_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "enterprise_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "Enterprise";

-- CreateTable
CREATE TABLE "enterprises" (
    "id" TEXT NOT NULL,
    "cnpj" TEXT,
    "nome" TEXT,
    "phone" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "enterprises_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_enterprise_id_fkey" FOREIGN KEY ("enterprise_id") REFERENCES "enterprises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_enterprise_id_fkey" FOREIGN KEY ("enterprise_id") REFERENCES "enterprises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_enterprise_id_fkey" FOREIGN KEY ("enterprise_id") REFERENCES "enterprises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatments" ADD CONSTRAINT "treatments_enterprise_id_fkey" FOREIGN KEY ("enterprise_id") REFERENCES "enterprises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
