import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateStudentProfile } from "@/lib/actions/student-actions";
import { getAcademicStructure } from "@/lib/actions/academic-actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function EditStudentModal({
    open,
    onOpenChange,
    student,
    isAdmin = false,
    onSuccess
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    student: any;
    isAdmin?: boolean;
    onSuccess?: () => void;
}) {
    const [loading, setLoading] = useState(false);
    const [academicData, setAcademicData] = useState<any[]>([]);
    const [fetchingAcademic, setFetchingAcademic] = useState(false);

    // Academic States
    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState("");
    const [selectedBatch, setSelectedBatch] = useState("");

    useEffect(() => {
        if (open && isAdmin) {
            loadAcademicData();
        }
    }, [open, isAdmin]);

    useEffect(() => {
        if (open && student) {
            const dept = student.department;
            const batchId = student.enrollments?.[0]?.batchId;
            if (dept) {
                setSelectedCourse(dept.courseId);
                setSelectedDepartment(dept.id);
            }
            if (batchId) {
                setSelectedBatch(batchId);
            }
        }
    }, [open, student]);

    const loadAcademicData = async () => {
        setFetchingAcademic(true);
        try {
            const data = await getAcademicStructure();
            setAcademicData(data);
        } catch (error) {
            console.error("Failed to load academic data:", error);
            toast.error("একাডেমিক তথ্য লোড করা সম্ভব হয়নি");
        } finally {
            setFetchingAcademic(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);

        const data = {
            fullName: formData.get("fullName") as string,
            email: student.user.email,
            phoneNumber: formData.get("phoneNumber") as string,
            whatsappNumber: formData.get("whatsappNumber") as string,
            gender: formData.get("gender") as any,
            mode: formData.get("mode") as any,
            residency: formData.get("residency") as any,
            country: formData.get("country") as string,
            activeStatus: student.activeStatus,
            departmentId: selectedDepartment || student.departmentId,
            batchId: selectedBatch || student.enrollments?.[0]?.batchId,
        };

        try {
            await updateStudentProfile(student.id, data);
            toast.success("প্রোফাইল সফলভাবে আপডেট করা হয়েছে");
            onOpenChange(false);
            if (onSuccess) onSuccess();
        } catch (error: any) {
            toast.error(error.message || "আপডেট করতে সমস্যা হয়েছে");
        } finally {
            setLoading(false);
        }
    };

    const availableDepartments = academicData.find(c => c.id === selectedCourse)?.departments || [];
    const availableBatches = availableDepartments.find((d: any) => d.id === selectedDepartment)?.batches || [];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px] font-bengali overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>প্রোফাইল আপডেট করুন</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    <div className="space-y-2">
                        <Label htmlFor="fullName">পূর্ণ নাম</Label>
                        <Input
                            id="fullName"
                            name="fullName"
                            defaultValue={student.fullName}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="phoneNumber">ফোন নম্বর</Label>
                            <Input
                                id="phoneNumber"
                                name="phoneNumber"
                                defaultValue={student.phoneNumber || ""}
                                placeholder="017XXXXXXXX"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="whatsappNumber">হোয়াটসঅ্যাপ নম্বর</Label>
                            <Input
                                id="whatsappNumber"
                                name="whatsappNumber"
                                defaultValue={student.whatsappNumber || ""}
                                placeholder="+880..."
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="country">দেশ</Label>
                            <Input
                                id="country"
                                name="country"
                                defaultValue={student.country || "Bangladesh"}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="gender">লিঙ্গ</Label>
                            <Select name="gender" defaultValue={student.gender}>
                                <SelectTrigger>
                                    <SelectValue placeholder="লিঙ্গ নির্বাচন করুন" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MALE">পুরুষ</SelectItem>
                                    <SelectItem value="FEMALE">মহিলা</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="residency">আবাসন</Label>
                            <Select name="residency" defaultValue={student.residency}>
                                <SelectTrigger>
                                    <SelectValue placeholder="আবাসন ধরণ" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="LOCAL">দেশি</SelectItem>
                                    <SelectItem value="PROBASHI">প্রবাসী</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="mode">শিক্ষাদান পদ্ধতি (Mode)</Label>
                            <Select name="mode" defaultValue={student.mode} disabled={!isAdmin}>
                                <SelectTrigger>
                                    <SelectValue placeholder="পদ্ধতি নির্বাচন করুন" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ONLINE">অনলাইন</SelectItem>
                                    <SelectItem value="OFFLINE">অফলাইন</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {isAdmin && (
                        <div className="pt-4 border-t space-y-4">
                            <h4 className="font-semibold text-teal-700 dark:text-teal-400">একাডেমিক প্রমোশন ও ট্রান্সফার</h4>

                            <div className="space-y-2">
                                <Label>মারহালা / কোর্স</Label>
                                <Select
                                    value={selectedCourse}
                                    onValueChange={(val) => {
                                        setSelectedCourse(val);
                                        setSelectedDepartment("");
                                        setSelectedBatch("");
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="মারহালা নির্বাচন করুন" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {academicData.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>বিভাগ</Label>
                                    <Select
                                        value={selectedDepartment}
                                        disabled={!selectedCourse}
                                        onValueChange={(val) => {
                                            setSelectedDepartment(val);
                                            setSelectedBatch("");
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="বিভাগ নির্বাচন করুন" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableDepartments.map((d: any) => (
                                                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>সেমিস্টার / ব্যাচ</Label>
                                    <Select
                                        value={selectedBatch}
                                        disabled={!selectedDepartment}
                                        onValueChange={setSelectedBatch}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="ব্যাচ নির্বাচন করুন" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableBatches.map((b: any) => (
                                                <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {fetchingAcademic && (
                                <div className="flex items-center gap-2 text-xs text-zinc-500 italic">
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    একাডেমিক তথ্য লোড হচ্ছে...
                                </div>
                            )}
                        </div>
                    )}

                    {!isAdmin && (
                        <p className="text-[10px] text-muted-foreground">
                            পদ্ধতি বা একাডেমিক তথ্য পরিবর্তনের জন্য অ্যাডমিনের সাথে যোগাযোগ করুন।
                        </p>
                    )}

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            বাতিল
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-teal-600 hover:bg-teal-700 min-w-[120px]">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "তথ্য সংরক্ষণ করুন"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
