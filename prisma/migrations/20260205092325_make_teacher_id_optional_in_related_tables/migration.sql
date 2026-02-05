-- DropForeignKey
ALTER TABLE "Homework" DROP CONSTRAINT "Homework_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "MonthlyLiveClass" DROP CONSTRAINT "MonthlyLiveClass_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "TeacherAttendance" DROP CONSTRAINT "TeacherAttendance_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "TeacherPayment" DROP CONSTRAINT "TeacherPayment_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "TeacherProfile" DROP CONSTRAINT "TeacherProfile_userId_fkey";

-- AlterTable
ALTER TABLE "Homework" ALTER COLUMN "teacherId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "MonthlyLiveClass" ALTER COLUMN "teacherId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "TeacherAttendance" ALTER COLUMN "teacherId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "TeacherPayment" ALTER COLUMN "teacherId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "AiLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "userRole" "Role" NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "model" TEXT NOT NULL DEFAULT 'gpt-4o-mini',
    "source" TEXT NOT NULL,
    "tokensUsed" INTEGER NOT NULL DEFAULT 0,
    "isRestricted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TeacherProfile" ADD CONSTRAINT "TeacherProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherPayment" ADD CONSTRAINT "TeacherPayment_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "TeacherProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherAttendance" ADD CONSTRAINT "TeacherAttendance_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "TeacherProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Homework" ADD CONSTRAINT "Homework_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "TeacherProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyLiveClass" ADD CONSTRAINT "MonthlyLiveClass_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "TeacherProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiLog" ADD CONSTRAINT "AiLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
