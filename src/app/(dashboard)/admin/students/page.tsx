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
import { Checkbox } from "@/components/ui/checkbox";
import {
    Plus, MoreHorizontal, Search, FileText, CheckCircle2, XCircle, ArrowUpDown, Filter, Loader2, Download, Trash2, CreditCard, Key,
    Globe, GraduationCap, MoreVertical, Phone
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { provisionStudent, getStudents, toggleStudentStatus, migrateStudentFeeTier, bulkMigrateFeeTier, resendStudentInvitation } from "@/lib/actions/student-actions";
import { useToast } from "@/hooks/use-toast";
import { ProvisionStudentModal } from "@/components/admin/students/ProvisionStudentModal";
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

export default function StudentsPage() {
    const [students, setStudents] = useState<any[]>([]);
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Bulk Selection State
    const [selected, setSelected] = useState<string[]>([]);

    // Confirmation Dialog State
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState<{
        title: string;
        description: string;
        action: () => Promise<void>;
        actionText?: string;
        variant?: "default" | "destructive";
    } | null>(null);

    const refreshStudents = async () => {
        setLoading(true);
        try {
            const data = await getStudents();
            setStudents(data);
            setSelected([]); // Reset selection on refresh
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshStudents();
    }, []);

    // Selection Handlers
    const toggleSelectAll = () => {
        if (selected.length === students.length) {
            setSelected([]);
        } else {
            setSelected(students.map(s => s.id));
        }
    };

    const toggleSelect = (id: string) => {
        if (selected.includes(id)) {
            setSelected(selected.filter(s => s !== id));
        } else {
            setSelected([...selected, id]);
        }
    };

    // Confirmation Handlers
    const openConfirm = (config: typeof confirmConfig) => {
        setConfirmConfig(config);
        setConfirmOpen(true);
    };

    const handleConfirm = async () => {
        if (!confirmConfig) return;
        setConfirmOpen(false); // Close first
        await confirmConfig.action();
    };

    const handleResendCredentials = (id: string, email: string) => {
        openConfirm({
            title: "ক্রেডেনশিয়াল রিসেট নিশ্চিতকরণ",
            description: `আপনি কি নিশ্চিত যে আপনি ${email}-এর জন্য নতুন পাসওয়ার্ড রিসেট এবং ইমেল পাঠাতে চান?`,
            action: async () => {
                toast({ title: "অপেক্ষা করুন", description: "ইমেল পাঠানো হচ্ছে..." });
                try {
                    const res = await resendStudentInvitation(id);
                    if (res.success) {
                        toast({ title: "সফল", description: "নতুন ক্রেডেনশিয়াল ইমেল করা হয়েছে" });
                    } else {
                        toast({ variant: "destructive", title: "ব্যর্থ", description: res.error || "ইমেল পাঠাতে ব্যর্থ" });
                    }
                } catch (error) {
                    toast({ variant: "destructive", title: "ত্রুটি", description: "সার্ভার এরর" });
                }
            },
            actionText: "হাঁ, রিসেট করুন"
        });
    };

    const handleBulkMigrate = (tier: "GENERAL" | "SADKA") => {
        openConfirm({
            title: "ফি টিয়ার পরিবর্তন",
            description: `আপনি কি নির্বাচিত ${selected.length} জন ছাত্রকে ${tier} ফি টিয়ারে স্থানান্তর করতে চান?`,
            action: async () => {
                try {
                    await bulkMigrateFeeTier(selected, tier);
                    toast({ title: "সফল", description: "ছাত্রদের ফি টিয়ার আপডেট করা হয়েছে" });
                    refreshStudents();
                } catch (error) {
                    toast({ variant: "destructive", title: "ব্যর্থ", description: "আপডেট ব্যর্থ হয়েছে" });
                }
            },
            actionText: "হাঁ, পরিবর্তন করুন"
        });
    };

    const handleSingleMigrate = (id: string, currentTier: string) => {
        const newTier = currentTier === "GENERAL" ? "SADKA" : "GENERAL";
        openConfirm({
            title: "ফি টিয়ার পরিবর্তন",
            description: `আপনি কি এই ছাত্রকে ${newTier} ফি টিয়ারে পরিবর্তন করতে চান?`,
            action: async () => {
                try {
                    await migrateStudentFeeTier(id, newTier);
                    toast({ title: "সফল", description: "ফি টিয়ার আপডেট করা হয়েছে" });
                    refreshStudents();
                } catch (error) {
                    toast({ variant: "destructive", title: "ব্যর্থ", description: "আপডেট ব্যর্থ হয়েছে" });
                }
            },
            actionText: "পরিবর্তন করুন"
        });
    };

    const handleToggleStatus = (id: string, currentStatus: boolean) => {
        const action = currentStatus ? "নিষ্ক্রিয়" : "সক্রিয়";
        openConfirm({
            title: "স্ট্যাটাস পরিবর্তন",
            description: `আপনি কি এই ছাত্রকে ${action} করতে চান?`,
            action: async () => {
                try {
                    await toggleStudentStatus(id, currentStatus, "/admin/students");
                    toast({ title: "সফল", description: `ছাত্র ${action} করা হয়েছে` });
                    refreshStudents(); // Refresh to show new status
                } catch (error) {
                    toast({ variant: "destructive", title: "ব্যর্থ", description: "স্ট্যাটাস আপডেট ব্যর্থ হয়েছে" });
                }
            },
            variant: currentStatus ? "destructive" : "default",
            actionText: `হাঁ, ${action} করুন`
        });
    }

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

            {/* Bulk Actions Bar */}
            {selected.length > 0 && (
                <div className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                    <span className="font-bengali px-3 text-sm font-medium">{selected.length} জন নির্বাচিত</span>
                    <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleBulkMigrate("GENERAL")} className="font-bengali">
                            সেট জেনারেল
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleBulkMigrate("SADKA")} className="font-bengali bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100">
                            সেট সাদকা (ফ্রী/ছাড়)
                        </Button>
                    </div>
                </div>
            )}

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
                            <TableHead className="w-[50px]">
                                <Checkbox
                                    checked={students.length > 0 && selected.length === students.length}
                                    onCheckedChange={toggleSelectAll}
                                />
                            </TableHead>
                            <TableHead className="w-[100px] font-bengali">আইডি</TableHead>
                            <TableHead className="font-bengali">ছাত্রের নাম</TableHead>
                            <TableHead className="font-bengali">যোগাযোগ</TableHead>
                            <TableHead className="font-bengali">একাডেমিক</TableHead>
                            <TableHead className="font-bengali">ফি টিয়ার</TableHead>
                            <TableHead className="font-bengali">মোড এবং স্ট্যাটাস</TableHead>
                            <TableHead className="font-bengali">আবাসিক অবস্থা</TableHead>
                            <TableHead className="font-bengali">অ্যাকাউন্ট</TableHead>
                            <TableHead className="text-right font-bengali">অ্যাকশন</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={10} className="h-24 text-center text-zinc-500 italic font-bengali">
                                    ছাত্রদের তথ্য লোড হচ্ছে...
                                </TableCell>
                            </TableRow>
                        ) : students.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={10} className="h-24 text-center text-zinc-500 italic font-bengali">
                                    কোন ছাত্র পাওয়া যায়নি।
                                </TableCell>
                            </TableRow>
                        ) : (
                            students.map((student) => (
                                <TableRow key={student.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                                    <TableCell>
                                        <Checkbox
                                            checked={selected.includes(student.id)}
                                            onCheckedChange={() => toggleSelect(student.id)}
                                        />
                                    </TableCell>
                                    <TableCell className="font-mono text-sm font-medium text-zinc-500">{student.studentID}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1 h-8 rounded-full ${student.gender === 'FEMALE' ? 'bg-pink-400' : 'bg-teal-500'}`} title={student.gender}></div>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-zinc-900 dark:text-zinc-100 font-bengali">{student.fullName}</span>
                                                <span className="text-xs text-zinc-500">{student.user.email}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1 text-sm text-zinc-600">
                                            {student.phoneNumber && (
                                                <div className="flex items-center gap-1.5">
                                                    <Phone className="w-3 h-3 text-zinc-400" />
                                                    <span className="font-mono">{student.phoneNumber}</span>
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            {student.department && (
                                                <div className="flex flex-col">
                                                    {student.department.course && (
                                                        <span className="font-bold font-bengali text-xs text-teal-600 dark:text-teal-400">
                                                            {student.department.course.name}
                                                        </span>
                                                    )}
                                                    <span className="font-medium font-bengali text-xs text-zinc-700 dark:text-zinc-300">
                                                        {student.department.name}
                                                    </span>
                                                </div>
                                            )}
                                            {student.enrollments && student.enrollments.length > 0 && student.enrollments[0].batch && (
                                                <Badge variant="outline" className="w-fit font-bengali text-[10px] h-5 px-1.5">
                                                    {student.enrollments[0].batch.name}
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={student.feeTier === "SADKA" ? "default" : "secondary"} className="font-bengali">
                                            {student.feeTier === "SADKA" ? "সাদকা / স্কলারশিপ" : "জেনারেল"}
                                        </Badge>
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
                                                <DropdownMenuLabel className="font-bengali">অ্যাকশন</DropdownMenuLabel>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/admin/students/${student.id}`} className="font-bengali cursor-pointer w-full">
                                                        প্রোফাইল দেখুন
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="font-bengali cursor-pointer"
                                                    onClick={() => handleSingleMigrate(student.id, student.feeTier)}
                                                >
                                                    {student.feeTier === "GENERAL" ? "সাদকা টিয়ারে নিন" : "জেনারেল টিয়ারে নিন"}
                                                </DropdownMenuItem>

                                                <DropdownMenuItem
                                                    className={`${student.activeStatus ? "text-red-500 hover:text-red-600" : "text-green-600 hover:text-green-700"} font-bengali cursor-pointer`}
                                                    onClick={() => handleToggleStatus(student.id, student.activeStatus)}
                                                >
                                                    {student.activeStatus ? "নিষ্ক্রিয় করুন" : "সক্রিয় করুন"}
                                                </DropdownMenuItem>

                                                <DropdownMenuItem
                                                    onClick={() => handleResendCredentials(student.id, student.user.email)}
                                                    className="text-amber-600 focus:text-amber-700"
                                                >
                                                    <Key className="w-4 h-4 mr-2" />
                                                    রিসেট ক্রেডেনশিয়াল (Resend)
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

            {/* Confirmation Dialog */}
            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="font-bengali">{confirmConfig?.title}</AlertDialogTitle>
                        <AlertDialogDescription className="font-bengali text-base">
                            {confirmConfig?.description}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="font-bengali">বাতিল</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleConfirm();
                            }}
                            className={`font-bengali ${confirmConfig?.variant === "destructive" ? "bg-red-600 hover:bg-red-700" : ""}`}
                        >
                            {confirmConfig?.actionText || "নিশ্চিত করুন"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
