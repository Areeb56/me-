import { LeadsTable } from "@/components/leads/LeadsTable";
import { LaunchResearchButton } from "@/components/leads/LaunchResearchButton";

export default function LeadsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Leads</h1>
        <LaunchResearchButton />
      </div>
      <LeadsTable />
    </div>
  );
}
