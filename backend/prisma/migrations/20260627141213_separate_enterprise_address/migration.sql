/*
  Warnings:

  - You are about to drop the column `address` on the `enterprises` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "enterprises" DROP COLUMN "address",
ADD COLUMN     "city" TEXT,
ADD COLUMN     "complement" TEXT,
ADD COLUMN     "neighborhood" TEXT,
ADD COLUMN     "number" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "street" TEXT,
ADD COLUMN     "zipCode" TEXT;
