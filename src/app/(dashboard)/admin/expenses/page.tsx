"use client";

import { useState, useEffect } from "react";
import {
    getExpenses,
    createExpense,
    updateExpense,
    deleteExpense
} from "@/lib/actions/expense-actions";
import { FundType, PaymentMethod } from "@prisma/client";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
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
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import {
    Plus,
    Search,
    Filter,
    Download,
    Trash2,
    Edit,
    CheckCircle2,
    AlertCircle,
    TrendingDown,
    Banknote,
    Calendar
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const EXPENSE_CATEGORIES = [
    { value: FundType.UTILITY_EXPENSE, label: "ইউটিলিটি খরচ (বিদ্যুৎ, পানি, ইন্টারনেট)" },
    { value: FundType.RENT_EXPENSE, label: "ভাড়া খরচ (বিল্ডিং ভাড়া)" },
    { value: FundType.MAINTENANCE_EXPENSE, label: "রক্ষণাবেক্ষণ খরচ" },
    { value: FundType.OFFICE_EXPENSE, label: "অফিস খরচ (স্টেশনারি, সরবরাহ)" },
    { value: FundType.TRANSPORT_EXPENSE, label: "পরিবহন খরচ" },
    { value: FundType.MARKETING_EXPENSE, label: "মার্কেটিং খরচ" },
    { value: FundType.OTHER_EXPENSE, label: "অন্যান্য খরচ" },
    { value: FundType.TEACHER_SALARY, label: "শিক্ষক বেতন (ম্যানুয়াল এন্ট্রি)" },
];

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState<any>(null);

    const [formData, setFormData] = useState({
        category: FundType.OTHER_EXPENSE as FundType,
        amount: "",
        description: "",
        date: new Date().toISOString().split('T')[0],
        paymentMethod: PaymentMethod.CASH as PaymentMethod,
        vendor: "",
        receiptNumber: "",
        notes: ""
    });

    const [filters, setFilters] = useState({
        category: "" as string,
        startDate: "",
        endDate: ""
    });

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const data = await getExpenses({
                category: filters.category ? (filters.category as FundType) : undefined,
                startDate: filters.startDate ? new Date(filters.startDate) : undefined,
                endDate: filters.endDate ? new Date(filters.endDate) : undefined,
            });
            setExpenses(data.expenses);
            setTotal(data.total);
        } catch (error) {
            toast.error("খরচ লোড করতে সমস্যা হয়েছে।");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, [filters]);

    const handleOpenDialog = (expense: any = null) => {
        if (expense) {
            setIsEditing(true);
            setSelectedExpense(expense);
            setFormData({
                category: expense.category,
                amount: expense.amount.toString(),
                description: expense.description,
                date: new Date(expense.date).toISOString().split('T')[0],
                paymentMethod: expense.paymentMethod || PaymentMethod.CASH,
                vendor: expense.vendor || "",
                receiptNumber: expense.receiptNumber || "",
                notes: expense.notes || ""
            });
        } else {
            setIsEditing(false);
            setSelectedExpense(null);
            setFormData({
                category: FundType.OTHER_EXPENSE,
                amount: "",
                description: "",
                date: new Date().toISOString().split('T')[0],
                paymentMethod: PaymentMethod.CASH,
                vendor: "",
                receiptNumber: "",
                notes: ""
            });
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = {
            ...formData,
            amount: parseFloat(formData.amount),
            date: new Date(formData.date)
        };

        try {
            if (isEditing) {
                await updateExpense(selectedExpense.id, data);
                toast.success("খরচ সফলভাবে আপডেট করা হয়েছে।");
            } else {
                await createExpense(data);
                toast.success("নতুন খরচ সফলভাবে যোগ করা হয়েছে।");
            }
            setIsDialogOpen(false);
            fetchExpenses();
        } catch (error) {
            toast.error("সংরক্ষণ করতে সমস্যা হয়েছে।");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("আপনি কি নিশ্চিত যে এই খরচটি মুছে ফেলতে চান? এটি লেজার ট্রানজ্যাকশনও মুছে ফেলবে।")) return;
        try {
            await deleteExpense(id);
            toast.success("খরচ সফলভাবে মুছে ফেলা হয়েছে।");
            fetchExpenses();
        } catch (error) {
            toast.error("মুছে ফেলতে সমস্যা হয়েছে।");
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-bengali">খরচ ব্যবস্থাপনা</h1>
                    <p className="text-zinc-500 text-lg font-bengali">মাদ্রাসার সমস্ত খরচ এখানে রেকর্ড এবং পরিচালনা করুন।</p>
                </div>
                <div className="flex gap-4">
                    <Button onClick={() => handleOpenDialog()} className="bg-teal-600 hover:bg-teal-700 h-11 font-bengali">
                        <Plus className="w-4 h-4 mr-2" />
                        নতুন খরচ যোগ করুন
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-sm ring-1 ring-zinc-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 text-zinc-600">
                        <CardTitle className="text-sm font-medium font-bengali">মোট খরচ (নির্বাচিত সময়)</CardTitle>
                        <TrendingDown className="w-4 h-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">৳ {total.toLocaleString("bn-BD")}</div>
                        <p className="text-xs text-zinc-400 font-bengali">লেজার ট্রানজ্যাকশন থেকে আসছে</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm ring-1 ring-zinc-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 text-zinc-600">
                        <CardTitle className="text-sm font-medium font-bengali">রেকর্ড সংখ্যা</CardTitle>
                        <CheckCircle2 className="w-4 h-4 text-teal-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{expenses.length} টি</div>
                        <p className="text-xs text-zinc-400 font-bengali">মোট খরচের এন্ট্রি</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm ring-1 ring-zinc-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 text-zinc-600">
                        <CardTitle className="text-sm font-medium font-bengali">সর্বশেষ এন্ট্রি</CardTitle>
                        <Calendar className="w-4 h-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold font-bengali">
                            {expenses.length > 0 ? new Date(expenses[0].date).toLocaleDateString("bn-BD") : "নেই"}
                        </div>
                        <p className="text-xs text-zinc-400 font-bengali">সাম্প্রতিক খরচের তারিখ</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none shadow-sm ring-1 ring-zinc-200">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="font-bengali">খরচের ট্র্যাকার</CardTitle>
                            <CardDescription className="font-bengali">ফিল্টার ব্যবহার করে নির্দিষ্ট খরচ খুঁজুন।</CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                                className="w-40 h-10 font-bengali"
                            />
                            <Input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                                className="w-40 h-10 font-bengali"
                            />
                            <Select value={filters.category} onValueChange={(val) => setFilters({ ...filters, category: val })}>
                                <SelectTrigger className="w-48 h-10 font-bengali">
                                    <SelectValue placeholder="ক্যাটাগরি" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All">সব ক্যাটাগরি</SelectItem>
                                    {EXPENSE_CATEGORIES.map(cat => (
                                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-lg border border-zinc-200 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-zinc-50 font-bengali">
                                <TableRow>
                                    <TableHead className="w-[120px]">তারিখ</TableHead>
                                    <TableHead>ক্যাটাগরি</TableHead>
                                    <TableHead>বিবরণ</TableHead>
                                    <TableHead>ভেন্ডর / প্রাপক</TableHead>
                                    <TableHead className="text-right">পরিমাণ</TableHead>
                                    <TableHead className="text-right">অ্যাকশন</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center text-zinc-500 italic font-bengali">লোড হচ্ছে...</TableCell>
                                    </TableRow>
                                ) : expenses.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center text-zinc-500 italic font-bengali">কোনো খরচের রেকর্ড পাওয়া যায়নি।</TableCell>
                                    </TableRow>
                                ) : (
                                    expenses.map((expense) => (
                                        <TableRow key={expense.id}>
                                            <TableCell className="font-mono text-sm">{new Date(expense.date).toLocaleDateString("en-GB")}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="font-bengali">
                                                    {EXPENSE_CATEGORIES.find(c => c.value === expense.category)?.label || expense.category}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-medium font-bengali">{expense.description}</TableCell>
                                            <TableCell className="font-bengali">{expense.vendor || "-"}</TableCell>
                                            <TableCell className="text-right font-bold text-red-600">৳ {expense.amount.toLocaleString("bn-BD")}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(expense)}>
                                                        <Edit className="w-4 h-4 text-zinc-500" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(expense.id)}>
                                                        <Trash2 className="w-4 h-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[600px] font-bengali">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? "খরচ সম্পাদনা করুন" : "নতুন খরচ যোগ করুন"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>ক্যাটাগরি</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(val) => setFormData({ ...formData, category: val as FundType })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="ক্যাটাগরি নির্বাচন করুন" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {EXPENSE_CATEGORIES.map(cat => (
                                            <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>খরচের পরিমাণ (৳)</Label>
                                <Input
                                    type="number"
                                    required
                                    placeholder="১০০০"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>সংক্ষিপ্ত বিবরণ</Label>
                            <Input
                                required
                                placeholder="উদা: বিদ্যুৎ বিল - জানুয়ারি"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>তারিখ</Label>
                                <Input
                                    type="date"
                                    required
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>পেমেন্ট মেথড</Label>
                                <Select
                                    value={formData.paymentMethod}
                                    onValueChange={(val) => setFormData({ ...formData, paymentMethod: val as PaymentMethod })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={PaymentMethod.CASH}>ক্যাশ (Cash)</SelectItem>
                                        <SelectItem value={PaymentMethod.BANK}>ব্যাংক চেক (Bank)</SelectItem>
                                        <SelectItem value={PaymentMethod.MOBILE_BANKING}>মোবাইল ব্যাংকিং</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>ভেন্ডর / প্রাপক</Label>
                                <Input
                                    placeholder="উদা: ডেসকো লিমিটেড"
                                    value={formData.vendor}
                                    onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>রশিদ নম্বর (ঐচ্ছিক)</Label>
                                <Input
                                    placeholder="১২৩৪৫৬"
                                    value={formData.receiptNumber}
                                    onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>মন্তব্য (ঐচ্ছিক)</Label>
                            <Input
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>বাতিল</Button>
                            <Button type="submit" className="bg-teal-600 hover:bg-teal-700">সংরক্ষণ করুন</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
