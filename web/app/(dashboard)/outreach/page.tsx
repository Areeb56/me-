import { CampaignsList } from "@/components/outreach/CampaignsList";
import { CampaignBuilder } from "@/components/outreach/CampaignBuilder";

export default function OutreachPage() {
  return (
    <div className="grid gap-6">
      <div className="md:col-span-2">
        <h1 className="text-2xl font-bold mb-4">Campaigns</h1>
        <CampaignsList />
      </div>
      <div className="md:col-span-1">
        <CampaignBuilder />
      </div>
    </div>
  );
}
