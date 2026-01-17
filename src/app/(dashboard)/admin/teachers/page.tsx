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
    Mail
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { getTeachers } from "@/lib/actions/teacher-actions";
import { inviteUser } from "@/lib/actions/auth-actions";

export default function TeachersPage() {
    const [teachers, setTeachers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

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

    useEffect(() => {
        refreshTeachers();
    }, []);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Faculty Management</h1>
                    <p className="text-zinc-500 text-lg">Manage teacher profiles, access levels, and batch assignments.</p>
                </div>

                <Button className="gap-2 bg-teal-600 hover:bg-teal-700 h-11 px-6">
                    <Plus className="w-5 h-5" />
                    Invite New Teacher
                </Button>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <Input
                        placeholder="Search teachers by name or email..."
                        className="pl-10 h-11"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
                        <TableRow>
                            <TableHead>Teacher Name</TableHead>
                            <TableHead>Contact Info</TableHead>
                            <TableHead>Assigned Batches</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-zinc-500 italic">
                                    Loading faculty...
                                </TableCell>
                            </TableRow>
                        ) : teachers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-zinc-500 italic">
                                    No teachers registered. Start by inviting your faculty members.
                                </TableCell>
                            </TableRow>
                        ) : (
                            teachers.map((teacher) => (
                                <TableRow key={teacher.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                                <UserCircle className="w-6 h-6 text-zinc-500" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{teacher.fullName}</span>
                                                <span className="text-xs text-zinc-500">{teacher.specialization || "General Faculty"}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                                                <Mail className="w-3 h-3" />
                                                {teacher.user.email}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            <BookOpen className="w-4 h-4 text-teal-600" />
                                            {teacher._count.assignedBatches} Batches
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={teacher.user.status === "ACTIVE" ? "success" : "warning"} className="capitalize">
                                            {teacher.user.status.toLowerCase()}
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
                                                <DropdownMenuItem>View Profile</DropdownMenuItem>
                                                <DropdownMenuItem>Assign Batches</DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-500">Remove Faculty</DropdownMenuItem>
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
