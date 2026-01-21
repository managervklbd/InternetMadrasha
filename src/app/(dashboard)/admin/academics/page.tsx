import { getAdminViewMode } from "@/lib/actions/settings-actions";
import { AcademicStructureViewer } from "@/components/admin/academics/AcademicStructureViewer";
import { SubjectManager } from "@/components/admin/academics/SubjectManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function AcademicsPage() {
    const viewMode = await getAdminViewMode();
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-bengali">একাডেমিক কাঠামো</h1>
                    <p className="text-zinc-500 text-lg font-bengali">আপনার প্রতিষ্ঠানের ক্লাস এবং বিভাগের গঠন পরিচালনা করুন।</p>
                </div>
            </div>

            <Tabs defaultValue="structure" className="w-full">
                <TabsList className="bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl mb-6">
                    <TabsTrigger value="structure" className="font-bengali px-8 rounded-lg data-[state=active]:bg-teal-600 data-[state=active]:text-white">
                        একাডেমিক কাঠামো
                    </TabsTrigger>
                    <TabsTrigger value="subjects" className="font-bengali px-8 rounded-lg data-[state=active]:bg-teal-600 data-[state=active]:text-white">
                        শ্রেণির বিষয়সমূহ
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="structure" className="mt-0">
                    <AcademicStructureViewer initialMode={viewMode} />
                </TabsContent>

                <TabsContent value="subjects" className="mt-0">
                    <SubjectManager initialMode={viewMode} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
