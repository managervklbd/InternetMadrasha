-- DropForeignKey
ALTER TABLE "BatchSubject" DROP CONSTRAINT "BatchSubject_batchId_fkey";

-- DropForeignKey
ALTER TABLE "ClassSession" DROP CONSTRAINT "ClassSession_batchId_fkey";

-- DropForeignKey
ALTER TABLE "Enrollment" DROP CONSTRAINT "Enrollment_batchId_fkey";

-- DropForeignKey
ALTER TABLE "Homework" DROP CONSTRAINT "Homework_batchId_fkey";

-- DropForeignKey
ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_batchId_fkey";

-- DropForeignKey
ALTER TABLE "MonthlyLiveClass" DROP CONSTRAINT "MonthlyLiveClass_batchId_fkey";

-- AlterTable
ALTER TABLE "Department" ADD COLUMN     "sadkaFeeOffline" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "whatsappApiKey" TEXT,
ADD COLUMN     "whatsappApiSecret" TEXT,
ADD COLUMN     "whatsappEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "whatsappPhoneNumber" TEXT,
ADD COLUMN     "whatsappProvider" TEXT;

-- AlterTable
ALTER TABLE "TeacherProfile" ADD COLUMN     "whatsappNumber" TEXT;

-- AddForeignKey
ALTER TABLE "BatchSubject" ADD CONSTRAINT "BatchSubject_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSession" ADD CONSTRAINT "ClassSession_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Homework" ADD CONSTRAINT "Homework_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyLiveClass" ADD CONSTRAINT "MonthlyLiveClass_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
