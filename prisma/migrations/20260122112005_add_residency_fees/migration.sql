/*
  Warnings:

  - You are about to drop the column `sadkaFeeOffline` on the `Department` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Batch" ADD COLUMN     "admissionFeeProbashi" DOUBLE PRECISION,
ADD COLUMN     "monthlyFeeProbashi" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "admissionFeeProbashi" DOUBLE PRECISION,
ADD COLUMN     "monthlyFeeProbashi" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Department" DROP COLUMN "sadkaFeeOffline",
ADD COLUMN     "admissionFeeProbashi" DOUBLE PRECISION,
ADD COLUMN     "monthlyFeeProbashi" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Enrollment" ADD COLUMN     "isAdmissionFeePaid" BOOLEAN NOT NULL DEFAULT false;
