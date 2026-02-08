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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, RefreshCw } from "lucide-react";
import { getPlans, createPlan, deletePlan } from "@/lib/actions/billing-actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Plan {
    id: string;
    name: string;
    monthlyFee: number;
    description?: string | null;
}

export function FeePlansManager() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    // Form State
    const [newPlan, setNewPlan] = useState({
        name: "",
        monthlyFee: "",
        description: ""
    });

    const loadPlans = async () => {
        setLoading(true);
        try {
            const data = await getPlans();
            setPlans(data);
        } catch (error) {
            console.error(error);
            toast.error("ফী প্ল্যান লোড করতে ব্যর্থ হয়েছে");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPlans();
    }, []);

    const handleCreate = async () => {
        if (!newPlan.name || !newPlan.monthlyFee) {
            toast.error("নাম এবং মাসিক ফি আবশ্যক");
            return;
        }

        setIsCreating(true);
        try {
            const res = await createPlan({
                name: newPlan.name,
                monthlyFee: parseFloat(newPlan.monthlyFee),
                description: newPlan.description
            });

            if (res.success) {
                toast.success("নতুন প্ল্যান তৈরি হয়েছে");
                setNewPlan({ name: "", monthlyFee: "", description: "" });
                setIsCreateOpen(false);
                loadPlans();
            } else {
                toast.error(res.error || "ব্যর্থ হয়েছে");
            }
        } catch (error) {
            toast.error("ত্রুটি হয়েছে");
        } finally {
            setIsCreating(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("আপনি কি নিশ্চিত?")) return;
        try {
            const res = await deletePlan(id);
            if (res.success) {
                toast.success("প্ল্যান মুছে ফেলা হয়েছে");
                loadPlans();
            } else {
                toast.error(res.error || "ব্যর্থ হয়েছে");
            }
        } catch (error) {
            toast.error("ত্রুটি হয়েছে");
        }
    };

    return (
        <Card className="border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="font-bengali">কাস্টম ফি প্ল্যান</CardTitle>
                    <CardDescription className="font-bengali">
                        বিশেষ শিক্ষার্থীদের জন্য কাস্টমাইজড ফি প্ল্যান তৈরি করুন।
                    </CardDescription>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={loadPlans}>
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="gap-2 font-bengali bg-teal-600 hover:bg-teal-700">
                                <Plus className="w-4 h-4" />
                                নতুন প্ল্যান
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle className="font-bengali">নতুন ফি প্ল্যান তৈরি করুন</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label className="font-bengali">প্ল্যান এর নাম</Label>
                                    <Input
                                        placeholder="উদাহরণ: এতিম/গরীব কোটা"
                                        value={newPlan.name}
                                        onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                                        className="font-bengali"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bengali">মাসিক ফি (টাকা)</Label>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={newPlan.monthlyFee}
                                        onChange={(e) => setNewPlan({ ...newPlan, monthlyFee: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bengali">বিবরণ (অপশনাল)</Label>
                                    <Input
                                        placeholder="সংক্ষিপ্ত বিবরণ..."
                                        value={newPlan.description}
                                        onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                                        className="font-bengali"
                                    />
                                </div>
                                <Button
                                    onClick={handleCreate}
                                    disabled={isCreating}
                                    className="w-full font-bengali bg-teal-600 hover:bg-teal-700"
                                >
                                    {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                    সংরক্ষণ করুন
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader className="bg-zinc-50 dark:bg-zinc-900">
                            <TableRow>
                                <TableHead className="font-bengali">নাম</TableHead>
                                <TableHead className="font-bengali">মাসিক ফি</TableHead>
                                <TableHead className="font-bengali">বিবরণ</TableHead>
                                <TableHead className="text-right font-bengali">অ্যাকশন</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {plans.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-zinc-500 font-bengali">
                                        কোনো প্ল্যান পাওয়া যায়নি
                                    </TableCell>
                                </TableRow>
                            ) : (
                                plans.map((plan) => (
                                    <TableRow key={plan.id}>
                                        <TableCell className="font-medium font-bengali">{plan.name}</TableCell>
                                        <TableCell className="font-bold text-teal-600">৳{plan.monthlyFee}</TableCell>
                                        <TableCell className="text-zinc-500 font-bengali">{plan.description || "—"}</TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
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
                </div>
            </CardContent>
        </Card>
    );
}
