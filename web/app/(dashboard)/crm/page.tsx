import { CRMKanban } from "@/components/crm/CRMKanban";

export default function CRMPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">CRM Pipeline</h1>
      <CRMKanban />
    </div>
  );
}
