
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, ArrowRight } from "lucide-react";

export default async function TeacherLessonsPage() {
    const session = await auth();
    if (!session?.user || session.user.role !== "TEACHER") {
        return redirect("/"); // Or unauthorized page
    }

    const teacher = await prisma.teacherProfile.findUnique({
        where: { userId: session.user.id },
        include: {
            assignedBatches: {
                where: { active: true },
                include: {
                    department: true
                }
            }
        }
    });

    if (!teacher) {
        return <div className="p-8">শিক্ষক প্রোফাইল পাওয়া যায়নি।</div>;
    }

    const batches = teacher.assignedBatches || [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold font-bengali">ভিডিও লেসন ও রিসোর্স</h1>
                    <p className="text-muted-foreground">আপনার নির্ধারিত ব্যাচগুলোর জন্য লেসন আপলোড করুন</p>
                </div>
            </div>

            {batches.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">কোনো ব্যাচ অ্যাসাইন করা নেই</h3>
                        <p className="text-muted-foreground mt-2">বর্তমানে আপনার কোনো সক্রিয় ব্যাচ নেই।</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {batches.map((batch) => (
                        <Card key={batch.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-4">
                                <CardTitle className="font-bengali text-xl">{batch.name}</CardTitle>
                                <CardDescription>{batch.department.name}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Users className="h-4 w-4" />
                                        <span>ব্যাচ সদস্য</span>
                                    </div>
                                    <div className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-xs font-medium">
                                        {batch.type}
                                    </div>
                                </div>

                                <Link href={`/teacher/lessons/${batch.id}`} passHref>
                                    <Button className="w-full group">
                                        লেসন ম্যানেজ করুন
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
