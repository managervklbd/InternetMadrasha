
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { PayForm } from "./PayForm";

type Props = {
    params: Promise<{ teacherId: string }>;
    searchParams: Promise<{ month?: string; year?: string }>;
};

export default async function PaymentPage({ params, searchParams }: Props) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return redirect("/");

    const { teacherId } = await params;
    const { month, year } = await searchParams;

    if (!month || !year) return redirect("/admin/payroll");

    const teacher = await prisma.teacherProfile.findUnique({
        where: { id: teacherId }
    });

    if (!teacher) return <div>Teacher not found</div>;

    // Verify not already paid
    const existing = await prisma.teacherPayment.findFirst({
        where: {
            teacherId,
            month: parseInt(month),
            year: parseInt(year)
        }
    });

    if (existing) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-bold text-green-600">এই মাসের বেতন ইতিমধ্যে পরিশোধ করা হয়েছে।</h2>
                <div className="mt-4">
                    Transaction ID: {existing.id} <br />
                    Amount: {existing.amount}
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8">
            <PayForm
                teacherId={teacherId}
                teacherName={teacher.fullName}
                baseSalary={teacher.salary || 0}
                month={parseInt(month)}
                year={parseInt(year)}
            />
        </div>
    );
}
