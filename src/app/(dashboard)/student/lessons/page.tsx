
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight } from "lucide-react";

export default async function StudentLessonsPage() {
    const session = await auth();
    if (!session?.user || session.user.role !== "STUDENT") {
        return redirect("/");
    }

    const studentProfile = await prisma.studentProfile.findUnique({
        where: { userId: session.user.id },
        include: {
            enrollments: {
                include: {
                    batch: {
                        include: {
                            department: true
                        }
                    }
                }
            }
        }
    });

    if (!studentProfile) return <div>প্রোফাইল পাওয়া যায়নি</div>;

    const enrollments = studentProfile.enrollments || [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold font-bengali">আমার লেসন ও রিসোর্স</h1>
                    <p className="text-muted-foreground">আপনার এনরোল করা ব্যাচগুলোর লেসন দেখুন</p>
                </div>
            </div>

            {enrollments.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">কোনো ক্লাসে এনরোল করা নেই</h3>
                        <p className="text-muted-foreground mt-2">আপনি বর্তমানে কোনো সক্রিয় ব্যাচে এনরোল করা নেই।</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {enrollments.map((enrollment) => (
                        <Card key={enrollment.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-4">
                                <CardTitle className="font-bengali text-xl">{enrollment.batch.name}</CardTitle>
                                <CardDescription>{enrollment.batch.department.name}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href={`/student/lessons/${enrollment.batch.id}`} passHref>
                                    <Button className="w-full group">
                                        লেসন দেখুন
                                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
