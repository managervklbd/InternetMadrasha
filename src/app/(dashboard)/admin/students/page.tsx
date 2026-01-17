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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
    Plus,
    MoreVertical,
    Search,
    Filter,
    GraduationCap,
    Globe,
    Phone
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { provisionStudent, getStudents } from "@/lib/actions/student-actions";
import { useToast } from "@/hooks/use-toast"; // assuming use-toast is installed or will be

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
                    <h1 className="text-3xl font-bold tracking-tight">Student Directory</h1>
                    <p className="text-zinc-500 text-lg">Manage all enrolled students, their modes, and residency status.</p>
                </div>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 bg-teal-600 hover:bg-teal-700 h-11 px-6">
                            <Plus className="w-5 h-5" />
                            Provision New Student
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[550px]">
                        <DialogHeader>
                            <DialogTitle className="text-2xl">Provision New Student</DialogTitle>
                            <DialogDescription>
                                This will create a user account and trigger an invitation link.
                                Fields for Probashi students are mandatory if residency is set to Probashi.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateStudent} className="space-y-6 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">Full Name</Label>
                                    <Input id="fullName" name="fullName" placeholder="Abdullah Al-Mamun" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email address</Label>
                                    <Input id="email" name="email" type="email" placeholder="abdullah@example.com" required />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="studentID">Madrasa Student ID</Label>
                                    <Input id="studentID" name="studentID" placeholder="IM-2024-001" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="gender">Gender</Label>
                                    <Select name="gender" defaultValue="MALE">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Gender" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="MALE">Male</SelectItem>
                                            <SelectItem value="FEMALE">Female</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="mode">Student Mode</Label>
                                    <Select name="mode" defaultValue="OFFLINE">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Mode" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ONLINE">Online</SelectItem>
                                            <SelectItem value="OFFLINE">Offline</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="residency">Residency</Label>
                                    <Select name="residency" defaultValue="LOCAL">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Residency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="LOCAL">Local (Bangladesh)</SelectItem>
                                            <SelectItem value="PROBASHI">Probashi (International)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="rounded-lg bg-zinc-50 p-4 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 space-y-4">
                                <p className="text-sm font-medium text-zinc-500">Probashi Specific (Optional if Local)</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="country">Country</Label>
                                        <Input id="country" name="country" placeholder="United Arab Emirates" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                                        <Input id="whatsappNumber" name="whatsappNumber" placeholder="+971..." />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                                <Button type="submit" className="bg-teal-600 hover:bg-teal-700 px-8">Create Profile</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <Input
                        placeholder="Search students by name, ID or email..."
                        className="pl-10 h-11"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="gap-2 h-11 px-4">
                    <Filter className="w-4 h-4" />
                    Filters
                </Button>
            </div>

            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
                        <TableRow>
                            <TableHead className="w-[100px]">ID</TableHead>
                            <TableHead>Student Name</TableHead>
                            <TableHead>Mode & Status</TableHead>
                            <TableHead>Residency</TableHead>
                            <TableHead>Account</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-zinc-500 italic">
                                    Loading students...
                                </TableCell>
                            </TableRow>
                        ) : students.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-zinc-500 italic">
                                    No students found. Provision your first student to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            students.map((student) => (
                                <TableRow key={student.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                                    <TableCell className="font-mono text-sm font-medium text-zinc-500">{student.studentID}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-zinc-900 dark:text-zinc-100">{student.fullName}</span>
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
                                                <DropdownMenuItem>View Profile</DropdownMenuItem>
                                                <DropdownMenuItem>Edit Details</DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-500">Deactivate</DropdownMenuItem>
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
