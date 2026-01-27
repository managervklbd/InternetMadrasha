-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "FundType" ADD VALUE 'TUITION_FEE';
ALTER TYPE "FundType" ADD VALUE 'ZAKAT';
ALTER TYPE "FundType" ADD VALUE 'SADAQAH';
ALTER TYPE "FundType" ADD VALUE 'TEACHER_SALARY';
ALTER TYPE "FundType" ADD VALUE 'UTILITY_EXPENSE';
ALTER TYPE "FundType" ADD VALUE 'RENT_EXPENSE';
ALTER TYPE "FundType" ADD VALUE 'MAINTENANCE_EXPENSE';
ALTER TYPE "FundType" ADD VALUE 'OFFICE_EXPENSE';
ALTER TYPE "FundType" ADD VALUE 'TRANSPORT_EXPENSE';
ALTER TYPE "FundType" ADD VALUE 'MARKETING_EXPENSE';
ALTER TYPE "FundType" ADD VALUE 'OTHER_INCOME';
ALTER TYPE "FundType" ADD VALUE 'OTHER_EXPENSE';

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "category" "FundType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentMethod" "PaymentMethod",
    "receiptNumber" TEXT,
    "vendor" TEXT,
    "notes" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ledgerEntryId" TEXT NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Expense_ledgerEntryId_key" ON "Expense"("ledgerEntryId");

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_ledgerEntryId_fkey" FOREIGN KEY ("ledgerEntryId") REFERENCES "LedgerTransaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
