"use client";

import { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Plus,
    MoreVertical,
    Search,
    Filter,
    GraduationCap,
    Globe
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { provisionStudent, getStudents } from "@/lib/actions/student-actions";
import { useToast } from "@/hooks/use-toast";
import { ProvisionStudentModal } from "@/components/admin/students/ProvisionStudentModal";

export default function StudentsPage() {
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const refreshStudents = async () => {
        setLoading(true);
        try {
            const data = await getStudents();
            setStudents(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshStudents();
    }, []);

    const handleCreateStudent = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries()) as any;

        try {
            await provisionStudent(data);
            setOpen(false);
            refreshStudents();
        } catch (err) {
            alert("Error creating student. Check console.");
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-bengali">ছাত্র তালিকা</h1>
                    <p className="text-zinc-500 text-lg font-bengali">সমস্ত ভর্তি করা ছাত্র, তাদের মোড এবং আবাসিক অবস্থা পরিচালনা করুন।</p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        onClick={() => setOpen(true)}
                        className="gap-2 bg-teal-600 hover:bg-teal-700 h-11 px-6 shadow-sm ring-1 ring-teal-600/20 font-bengali"
                    >
                        <Plus className="w-5 h-5" />
                        নতুন ছাত্র যোগ করুন
                    </Button>

                    <ProvisionStudentModal
                        open={open}
                        onOpenChange={setOpen}
                        onSuccess={refreshStudents}
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <Input
                        placeholder="নাম, আইডি বা ইমেইল দিয়ে ছাত্র খুঁজুন..."
                        className="pl-10 h-11 font-bengali"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="gap-2 h-11 px-4 font-bengali">
                    <Filter className="w-4 h-4" />
                    ফিল্টার
                </Button>
            </div>

            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
                        <TableRow>
                            <TableHead className="w-[100px] font-bengali">আইডি</TableHead>
                            <TableHead className="font-bengali">ছাত্রের নাম</TableHead>
                            <TableHead className="font-bengali">মোড এবং স্ট্যাটাস</TableHead>
                            <TableHead className="font-bengali">আবাসিক অবস্থা</TableHead>
                            <TableHead className="font-bengali">অ্যাকাউন্ট</TableHead>
                            <TableHead className="text-right font-bengali">অ্যাকশন</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-zinc-500 italic font-bengali">
                                    ছাত্রদের তথ্য লোড হচ্ছে...
                                </TableCell>
                            </TableRow>
                        ) : students.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-zinc-500 italic font-bengali">
                                    কোন ছাত্র পাওয়া যায়নি। শুরু করতে আপনার প্রথম ছাত্র যোগ করুন।
                                </TableCell>
                            </TableRow>
                        ) : (
                            students.map((student) => (
                                <TableRow key={student.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                                    <TableCell className="font-mono text-sm font-medium text-zinc-500">{student.studentID}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-zinc-900 dark:text-zinc-100 font-bengali">{student.fullName}</span>
                                            <span className="text-xs text-zinc-500">{student.user.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={student.mode === "ONLINE" ? "secondary" : "outline"} className="capitalize">
                                                {student.mode}
                                            </Badge>
                                            {student.activeStatus ? (
                                                <span className="w-2 h-2 rounded-full bg-green-500" />
                                            ) : (
                                                <span className="w-2 h-2 rounded-full bg-red-500" />
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {student.residency === "PROBASHI" ? (
                                                <Globe className="w-4 h-4 text-teal-600" />
                                            ) : (
                                                <GraduationCap className="w-4 h-4 text-zinc-400" />
                                            )}
                                            <span className="text-sm font-medium">{student.residency}</span>
                                            {student.country && (
                                                <span className="text-xs text-zinc-400">({student.country})</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={student.user.status === "ACTIVE" ? "success" : "warning"} className="capitalize">
                                            {student.user.status.toLowerCase()}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem className="font-bengali">প্রোফাইল দেখুন</DropdownMenuItem>
                                                <DropdownMenuItem className="font-bengali">তথ্য সম্পাদনা করুন</DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-500 font-bengali">নিষ্ক্রিয় করুন</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
