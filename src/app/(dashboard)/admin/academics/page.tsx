"use client";

import { AcademicStructureViewer } from "@/components/admin/academics/AcademicStructureViewer";

export default function AcademicsPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-bengali">একাডেমিক কাঠামো</h1>
                <p className="text-zinc-500 text-lg font-bengali">আপনার প্রতিষ্ঠানের ক্লাস এবং বিভাগের গঠন পরিচালনা করুন।</p>
            </div>

            <AcademicStructureViewer />
        </div>
    );
}
