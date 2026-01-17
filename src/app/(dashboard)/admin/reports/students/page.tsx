import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getStudentDemographics } from "@/lib/actions/report-actions";
import { Users, UserCheck, Globe, MonitorSmartphone, MapPin } from "lucide-react"; // globe is lowercase in some icon sets, checking... MapPin is safe.
import { DemographicPieChart } from "@/components/admin/reports/StudentCharts";

export const dynamic = "force-dynamic";

export default async function StudentReportsPage() {
    const { stats, gender, residency, mode } = await getStudentDemographics();

    // Translate labels for Charts
    const genderTranslated = gender.map(g => ({ ...g, name: g.name === 'MALE' ? 'ছাত্র (Male)' : 'ছাত্রী (Female)' }));
    const residencyTranslated = residency.map(r => ({ ...r, name: r.name === 'LOCAL' ? 'স্থানীয় (Local)' : 'প্রবাসী (Probashi)' }));
    const modeTranslated = mode.map(m => ({ ...m, name: m.name === 'ONLINE' ? 'অনলাইন (Online)' : 'অফলাইন (Offline)' }));

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 font-bengali">
                    ছাত্র পরিসংখ্যান (Student Analytics)
                </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">মোট ছাত্রছাত্রী</CardTitle>
                        <Users className="h-4 w-4 text-zinc-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-xs text-muted-foreground">
                            রেজিস্ট্রারকৃত সকল শিক্ষার্থী
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">সক্রিয় শিক্ষার্থী</CardTitle>
                        <UserCheck className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.active}</div>
                        <p className="text-xs text-muted-foreground">
                            বর্তমানে একটিভ আছে
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">নিষ্ক্রিয় / ঝরে পড়া</CardTitle>
                        <Users className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.inactive}</div>
                        <p className="text-xs text-muted-foreground">
                            একাউন্ট ডিজেবল বা বন্ধ
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>আবাসিক স্থিতি</CardTitle>
                        <CardDescription>
                            লোকাল বনাম প্রবাসী
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DemographicPieChart data={residencyTranslated} />
                    </CardContent>
                </Card>

                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>শিক্ষার মাধ্যম</CardTitle>
                        <CardDescription>
                            অনলাইন বনাম অফলাইন
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DemographicPieChart data={modeTranslated} />
                    </CardContent>
                </Card>

                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>লিঙ্গ অনুপাত</CardTitle>
                        <CardDescription>
                            ছাত্র ও ছাত্রী সংখ্যা
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DemographicPieChart data={genderTranslated} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
