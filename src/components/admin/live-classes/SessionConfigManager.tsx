"use strict";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { Plus, Trash2, Clock } from "lucide-react";
import { createSessionConfig, getSessionConfigs, deleteSessionConfig, SessionConfigData } from "@/lib/actions/session-config-actions";

export function SessionConfigManager() {
    const [configs, setConfigs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const refreshConfigs = async () => {
        setLoading(true);
        try {
            const data = await getSessionConfigs();
            setConfigs(data);
        } catch (error) {
            console.error("Failed to fetch session configs", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshConfigs();
    }, []);

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this session configuration?")) {
            try {
                await deleteSessionConfig(id);
                refreshConfigs();
            } catch (error) {
                alert("Failed to delete session config.");
            }
        }
    };

    const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);

        const data: SessionConfigData = {
            label: formData.get("label") as string,
            key: formData.get("key") as string,
            startTime: formData.get("startTime") as string,
            endTime: formData.get("endTime") as string,
            isActive: true
        };

        try {
            await createSessionConfig(data);
            setIsCreateOpen(false);
            refreshConfigs();
        } catch (error) {
            alert("Failed to create session config. Key might be duplicate.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold font-bengali">সেশন শিডিউল কনফিগারেশন</h2>
                    <p className="text-zinc-500 text-sm font-bengali">নতুন সেশন তৈরি করুন এবং সময় নির্ধারণ করুন।</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 font-bengali">
                            <Plus className="w-4 h-4" />
                            নতুন সেশন
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="font-bengali">নতুন সেশন তৈরি করুন</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label className="font-bengali">লেবেল (Label)</Label>
                                <Input name="label" placeholder="উদাহরণ: সকাল (Morning)" required className="font-bengali" />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bengali">কী (Unique Key/ID)</Label>
                                <Input name="key" placeholder="MORNING" required className="uppercase font-mono" />
                                <p className="text-xs text-zinc-500 font-bengali">ইংরেজিতে ইউনিক নাম ব্যবহার করুন (যেমন: MORNING, NIGHT)</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="font-bengali">শুরুর সময়</Label>
                                    <Input name="startTime" type="time" required />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bengali">শেষের সময়</Label>
                                    <Input name="endTime" type="time" required />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isSubmitting} className="font-bengali">
                                    {isSubmitting ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-md border bg-white dark:bg-zinc-950">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="font-bengali">লেবেল</TableHead>
                            <TableHead className="font-bengali">কী (Key)</TableHead>
                            <TableHead className="font-bengali">সময়সীমা</TableHead>
                            <TableHead className="text-right font-bengali">অ্যাকশন</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center font-bengali">লোড হচ্ছে...</TableCell>
                            </TableRow>
                        ) : configs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center font-bengali text-zinc-500">কোন কনফিগারেশন পাওয়া যায়নি।</TableCell>
                            </TableRow>
                        ) : (
                            configs.map((config) => (
                                <TableRow key={config.id}>
                                    <TableCell className="font-medium font-bengali">{config.label}</TableCell>
                                    <TableCell className="font-mono text-xs">{config.key}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Clock className="w-3 h-3 text-zinc-400" />
                                            {config.startTime} - {config.endTime}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(config.id)}
                                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
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
