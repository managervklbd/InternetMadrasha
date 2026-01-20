-- CreateEnum
CREATE TYPE "FeeTier" AS ENUM ('GENERAL', 'SADKA');

-- DropForeignKey
ALTER TABLE "MonthlyInvoice" DROP CONSTRAINT "MonthlyInvoice_planId_fkey";

-- AlterTable
ALTER TABLE "Batch" ADD COLUMN     "admissionFee" DOUBLE PRECISION,
ADD COLUMN     "monthlyFee" DOUBLE PRECISION,
ADD COLUMN     "sadkaFee" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "admissionFee" DOUBLE PRECISION,
ADD COLUMN     "durationMonths" INTEGER,
ADD COLUMN     "monthlyFee" DOUBLE PRECISION,
ADD COLUMN     "sadkaFee" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Department" ADD COLUMN     "admissionFee" DOUBLE PRECISION,
ADD COLUMN     "monthlyFee" DOUBLE PRECISION,
ADD COLUMN     "sadkaFee" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "MonthlyInvoice" ALTER COLUMN "planId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "smtpHost" TEXT,
ADD COLUMN     "smtpPass" TEXT,
ADD COLUMN     "smtpPort" INTEGER,
ADD COLUMN     "smtpSecure" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "smtpUser" TEXT,
ADD COLUMN     "sslIsSandbox" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "sslStoreId" TEXT,
ADD COLUMN     "sslStorePass" TEXT;

-- AlterTable
ALTER TABLE "StudentProfile" ADD COLUMN     "feeTier" "FeeTier" NOT NULL DEFAULT 'GENERAL';

-- AddForeignKey
ALTER TABLE "MonthlyInvoice" ADD CONSTRAINT "MonthlyInvoice_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
