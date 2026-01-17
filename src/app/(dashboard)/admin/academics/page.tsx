"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
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
import {
    Library,
    GraduationCap,
    Users
} from "lucide-react";
import {
    createCourse,
    createDepartment,
    createBatch,
    getAcademicStructure
} from "@/lib/actions/academic-actions";

interface AcademicCourse {
    id: string;
    name: string;
    departments: {
        id: string;
        name: string;
        batches: { id: string }[];
    }[];
}

export default function AcademicsPage() {
    const [structure, setStructure] = useState<AcademicCourse[]>([]);
    const [loading, setLoading] = useState(true);

    const refreshStructure = async () => {
        setLoading(true);
        try {
            const data = await getAcademicStructure();
            setStructure(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshStructure();
    }, []);

    const handleCreateCourse = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get("name") as string;
        try {
            await createCourse(name);
            refreshStructure();
            (e.target as HTMLFormElement).reset();
        } catch (err) {
            alert("Error creating course.");
        }
    };

    const handleCreateDepartment = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get("name") as string;
        const courseId = formData.get("courseId") as string;
        try {
            await createDepartment(name, courseId);
            refreshStructure();
            (e.target as HTMLFormElement).reset();
        } catch (err) {
            alert("Error creating department.");
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Academic Hierarchy</h1>
                <p className="text-zinc-500 text-lg">Define the structural foundation of your institution.</p>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 h-12 p-1">
                    <TabsTrigger value="overview" className="px-6 h-full data-[state=active]:bg-zinc-100 dark:data-[state=active]:bg-zinc-800">
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="courses" className="px-6 h-full data-[state=active]:bg-zinc-100 dark:data-[state=active]:bg-zinc-800">
                        Courses & Depts
                    </TabsTrigger>
                    <TabsTrigger value="batches" className="px-6 h-full data-[state=active]:bg-zinc-100 dark:data-[state=active]:bg-zinc-800">
                        Unified Batches
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loading ? (
                            <p>Loading overview...</p>
                        ) : structure.map((course) => (
                            <Card key={course.id} className="border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                    <CardTitle className="text-xl font-bold">{course.name}</CardTitle>
                                    <Library className="w-5 h-5 text-teal-600" />
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        {course.departments.map((dept) => (
                                            <div key={dept.id} className="flex items-center justify-between text-sm py-1 border-b border-zinc-50 dark:border-zinc-900 last:border-0">
                                                <span className="font-medium">{dept.name}</span>
                                                <div className="flex gap-4 text-zinc-500">
                                                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {dept.batches.length || 0} Batches</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="courses" className="mt-0 space-y-8">
                    <div className="grid lg:grid-cols-2 gap-8">
                        <Card className="border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
                            <CardHeader>
                                <CardTitle>Add New Course</CardTitle>
                                <CardDescription>Courses are the top-level academic containers (e.g., General, Hifz).</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleCreateCourse} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="courseName">Course Name</Label>
                                        <Input id="courseName" name="name" placeholder="General Department" required />
                                    </div>
                                    <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700">Create Course</Button>
                                </form>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
                            <CardHeader>
                                <CardTitle>Add New Department</CardTitle>
                                <CardDescription>Departments live within courses (e.g., Primary within General).</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleCreateDepartment} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="parentCourse">Parent Course</Label>
                                        <Select name="courseId" required>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Course" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {structure.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="deptName">Department Name</Label>
                                        <Input id="deptName" name="name" placeholder="Primary" required />
                                    </div>
                                    <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700">Create Department</Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="batches" className="mt-0">
                    <Card className="border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Register New Batch</CardTitle>
                                <CardDescription>Batches are where teaching and attendance happen.</CardDescription>
                            </div>
                            <GraduationCap className="w-8 h-8 text-teal-600 opacity-20" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-zinc-500 italic py-12 text-center">
                                Batch creation logic will be implemented as a separate multi-step form.
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
