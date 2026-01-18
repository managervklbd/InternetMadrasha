"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { getPlans, createPlan, deletePlan } from "@/lib/actions/billing-actions";
import { toast } from "sonner";

export function FeePlansManager() {
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [open, setOpen] = useState(false);

    // Form State
    const [newName, setNewName] = useState("");
    const [newFee, setNewFee] = useState("");

    useEffect(() => {
        loadPlans();
    }, []);

    const loadPlans = async () => {
        setLoading(true);
        try {
            const data = await getPlans();
            setPlans(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!newName || !newFee) return;
        setIsCreating(true);
        try {
            const res = await createPlan({
                name: newName,
                monthlyFee: parseFloat(newFee)
            }) as any;

            if (res.success) {
                toast.success("ফি প্ল্যান তৈরি হয়েছে");
                setOpen(false);
                setNewName("");
                setNewFee("");
                loadPlans();
            } else {
                toast.error("ব্যর্থ হয়েছে");
            }
        } catch (error) {
            toast.error("ত্রুটি হয়েছে");
        } finally {
            setIsCreating(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("আপনি কি নিশ্চিত?")) return;

        try {
            const res = await deletePlan(id) as any;
            if (res.success) {
                toast.success("মুছে ফেলা হয়েছে");
                loadPlans();
            }
        } catch (error) {
            toast.error("মুছে ফেলতে ব্যর্থ");
        }
    };

    return (
        <Card className="border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>মাসিক ফি প্ল্যান</CardTitle>
                    <CardDescription>ছাত্রদের জন্য মাসিক ফি নির্ধারণ করুন</CardDescription>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="bg-teal-600 hover:bg-teal-700 font-bengali">
                            <Plus className="w-4 h-4 mr-1" />
                            নতুন প্ল্যান
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="font-bengali">নতুন ফি প্ল্যান যোগ করুন</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label className="font-bengali">প্ল্যান এর নাম</Label>
                                <Input
                                    placeholder="উদাহরণ: আবাসিক - মক্তব"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="font-bengali"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bengali">টাকার পরিমাণ (মাসিক)</Label>
                                <Input
                                    type="number"
                                    placeholder="2500"
                                    value={newFee}
                                    onChange={(e) => setNewFee(e.target.value)}
                                    className="font-bengali"
                                />
                            </div>
                            <Button
                                onClick={handleCreate}
                                disabled={isCreating}
                                className="w-full bg-teal-600 hover:bg-teal-700 font-bengali"
                            >
                                {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : "সেভ করুন"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="font-bengali">নাম</TableHead>
                            <TableHead className="font-bengali">পরিমাণ</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center py-4">লোড হচ্ছে...</TableCell>
                            </TableRow>
                        ) : plans.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center py-4 text-zinc-500 font-bengali">কোনো প্ল্যান নেই</TableCell>
                            </TableRow>
                        ) : (
                            plans.map((plan) => (
                                <TableRow key={plan.id}>
                                    <TableCell className="font-medium font-bengali">{plan.name}</TableCell>
                                    <TableCell className="font-bengali">৳{plan.monthlyFee}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => handleDelete(plan.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
