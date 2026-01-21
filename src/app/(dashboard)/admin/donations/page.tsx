import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DonationStats } from "@/components/admin/donations/DonationStats";
import { DonationList } from "@/components/admin/donations/DonationList";
import { DonorList } from "@/components/admin/donations/DonorList";
import { CommitteeList } from "@/components/admin/donations/CommitteeList";
import { AddDonationModal } from "@/components/admin/donations/AddDonationModal";
import { AddDonorModal } from "@/components/admin/donations/AddDonorModal";
import { AddCommitteeMemberModal } from "@/components/admin/donations/AddCommitteeMemberModal";
import { getDonationStats, getRecentDonations, getDonors, getCommitteeMembers, getSiteSettings } from "@/lib/actions/donation-actions";

export default async function DonationPage() {
    const stats = await getDonationStats();
    const donations = await getRecentDonations();
    const donors = await getDonors();
    const committeeMembers = await getCommitteeMembers();
    const settings = await getSiteSettings();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold font-bengali text-blue-600">কমিটি / দান ব্যবস্থাপনা</h1>
                <p className="text-zinc-500 font-bengali">দাতা ও দান পরিচালনা করুন</p>
            </div>

            <DonationStats stats={stats} />

            <Tabs defaultValue="payment" className="w-full">
                <div className="flex items-center justify-between mb-4">
                    <TabsList>
                        <TabsTrigger value="donor" className="font-bengali">দাতা তালিকা</TabsTrigger>
                        <TabsTrigger value="payment" className="font-bengali">পেমেন্ট</TabsTrigger>
                        <TabsTrigger value="committee" className="font-bengali">কমিটি</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="payment" className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white rounded-lg border shadow-sm">
                        <h2 className="text-lg font-bold font-bengali">দান পেমেন্ট</h2>
                        <AddDonationModal committeeMembers={committeeMembers} />
                    </div>
                    <DonationList donations={donations} settings={settings} />
                </TabsContent>

                <TabsContent value="donor">
                    <div className="bg-white rounded-lg border shadow-sm p-4 space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-bold font-bengali">দাতা তালিকা</h2>
                            <AddDonorModal />
                        </div>
                        <DonorList donors={donors} />
                    </div>
                </TabsContent>

                <TabsContent value="committee">
                    <div className="bg-white rounded-lg border shadow-sm p-4 space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-bold font-bengali">কমিটি সদস্যবৃন্দ</h2>
                            <AddCommitteeMemberModal />
                        </div>
                        <CommitteeList members={committeeMembers} />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
