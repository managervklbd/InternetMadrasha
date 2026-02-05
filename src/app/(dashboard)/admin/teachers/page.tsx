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
    UserCircle,
    BookOpen,
    Mail,
    Phone,
    Briefcase,
    Calendar,
    Trash2
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getTeachers, deleteTeacher, getTeacherDependencies } from "@/lib/actions/teacher-actions";
import { InviteTeacherModal } from "@/components/admin/teachers/InviteTeacherModal";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function TeachersPage() {
    const [teachers, setTeachers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isInviteOpen, setIsInviteOpen] = useState(false);

    // Delete state
    const [teacherToDelete, setTeacherToDelete] = useState<string | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [dependencies, setDependencies] = useState<{
        batches: number;
        liveClasses: number;
        homeworks: number;
        lessons: number;
    } | null>(null);
    const [loadingDependencies, setLoadingDependencies] = useState(false);

    const { toast } = useToast();

    const refreshTeachers = async () => {
        setLoading(true);
        try {
            const data = await getTeachers();
            setTeachers(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = async (id: string) => {
        setTeacherToDelete(id);
        setIsDeleteOpen(true);
        setDependencies(null);
        setLoadingDependencies(true);

        try {
            const deps = await getTeacherDependencies(id);
            setDependencies(deps);
        } catch (error) {
            console.error("Failed to fetch dependencies", error);
        } finally {
            setLoadingDependencies(false);
        }
    };

    const handleDelete = async () => {
        if (!teacherToDelete) return;

        try {
            await deleteTeacher(teacherToDelete);
            toast({
                title: "সফল!",
                description: "শিক্ষক সফলভাবে মুছে ফেলা হয়েছে।",
                className: "bg-teal-600 text-white border-none",
            });
            refreshTeachers();
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "ব্যর্থ!",
                description: "শিক্ষক মুছে ফেলা সম্ভব হয়নি।",
            });
        } finally {
            setIsDeleteOpen(false);
            setTeacherToDelete(null);
            setDependencies(null);
        }
    };

    useEffect(() => {
        refreshTeachers();
    }, []);

    const filteredTeachers = teachers.filter(t =>
        t.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-bengali text-teal-900 dark:text-teal-50">শিক্ষক এবং স্টাফ ব্যবস্থাপনা</h1>
                    <p className="text-zinc-500 text-lg font-bengali mt-1">শিক্ষকদের প্রোফাইল, ব্যাচ এসাইনমেন্ট এবং বেতনের তথ্য ম্যানেজ করুন।</p>
                </div>

                <Button
                    onClick={() => setIsInviteOpen(true)}
                    className="gap-2 bg-teal-600 hover:bg-teal-700 h-11 px-6 font-bengali shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    নতুন শিক্ষক নিয়োগ
                </Button>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <Input
                        placeholder="নাম অথবা ইমেইল দিয়ে খুঁজুন..."
                        className="pl-10 h-11 font-bengali"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
                        <TableRow>
                            <TableHead className="font-bengali text-zinc-900 dark:text-zinc-100">শিক্ষকের নাম ও পদবী</TableHead>
                            <TableHead className="font-bengali text-zinc-900 dark:text-zinc-100">যোগাযোগ</TableHead>
                            <TableHead className="font-bengali text-zinc-900 dark:text-zinc-100">যোগদান</TableHead>
                            <TableHead className="font-bengali text-zinc-900 dark:text-zinc-100">এসাইনড ব্যাচ</TableHead>
                            <TableHead className="font-bengali text-zinc-900 dark:text-zinc-100">স্ট্যাটাস</TableHead>
                            <TableHead className="text-right font-bengali text-zinc-900 dark:text-zinc-100">অ্যাকশন</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-zinc-500 italic font-bengali">
                                    তথ্য লোড হচ্ছে...
                                </TableCell>
                            </TableRow>
                        ) : filteredTeachers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-zinc-500 italic font-bengali">
                                    কোন শিক্ষক পাওয়া যায়নি। নতুন শিক্ষক নিয়োগ দিন।
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredTeachers.map((teacher) => (
                                <TableRow key={teacher.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-teal-50 dark:bg-zinc-800 flex items-center justify-center border border-teal-100">
                                                <UserCircle className="w-6 h-6 text-teal-600" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-zinc-900 dark:text-zinc-100 font-bengali">{teacher.fullName}</span>
                                                <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                                                    <Briefcase className="w-3 h-3" />
                                                    <span className="font-bengali">{teacher.designation || "শিক্ষক"}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                                                <Mail className="w-3.5 h-3.5" />
                                                {teacher.user.email}
                                            </div>
                                            {teacher.phone && (
                                                <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                                                    <Phone className="w-3.5 h-3.5" />
                                                    {teacher.phone}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {teacher.joiningDate ? new Date(teacher.joiningDate).toLocaleDateString() : "N/A"}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            <BookOpen className="w-4 h-4 text-teal-600" />
                                            <span className="font-bengali">{teacher._count.assignedBatches} টি ব্যাচ</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={teacher.user.status === "ACTIVE" ? "success" : "warning"} className="font-bengali">
                                            {teacher.user.status === "ACTIVE" ? "সক্রিয়" : "অপেক্ষমান"}
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
                                                <Link href={`/admin/teachers/${teacher.id}`}>
                                                    <DropdownMenuItem className="font-bengali cursor-pointer">
                                                        প্রোফাইল দেখুন
                                                    </DropdownMenuItem>
                                                </Link>
                                                <DropdownMenuItem
                                                    className="text-red-500 font-bengali cursor-pointer"
                                                    onClick={() => confirmDelete(teacher.id)}
                                                >
                                                    রিমুভ করুন
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <InviteTeacherModal
                open={isInviteOpen}
                onOpenChange={setIsInviteOpen}
                onSuccess={refreshTeachers}
            />

            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>আপনি কি নিশ্চিত?</AlertDialogTitle>
                        <AlertDialogDescription>
                            আপনি এই শিক্ষককে মুছে ফেলতে চাচ্ছেন। এই কাজটি আর ফিরিয়ে আনা যাবে না।
                        </AlertDialogDescription>
                        {loadingDependencies ? (
                            <div className="py-4 text-sm text-zinc-500">তথ্য যাচাই করা হচ্ছে...</div>
                        ) : dependencies ? (
                            <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-md space-y-2 border border-amber-200 dark:border-amber-800">
                                <p className="font-medium text-amber-800 dark:text-amber-200 font-bengali">সতর্কতা: এই শিক্ষকের সাথে যুক্ত তথ্য:</p>
                                <ul className="list-disc list-inside text-sm text-amber-700 dark:text-amber-300 font-bengali space-y-1">
                                    <li>এসাইনড ব্যাচ: {dependencies.batches} টি</li>
                                    <li>লাইভ ক্লাস: {dependencies.liveClasses} টি (মুছে ফেলা হবে)</li>
                                    <li>হোমওয়ার্ক: {dependencies.homeworks} টি (শিক্ষক রিমুভ হবে)</li>
                                    <li>লেসন/রিসোর্স: {dependencies.lessons} টি (শিক্ষক রিমুভ হবে)</li>
                                </ul>
                            </div>
                        ) : null}
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>বাতিল</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                            মুছে ফেলুন
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
