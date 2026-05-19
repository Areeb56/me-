import { Card } from "./Card";

export default function RecentDeals() {
  // Sample data - in a real app, this would come from an API
  const recentDeals = [
    { id: 1, company: "Acme Corp", value: 15000, stage: "negotiation", date: "2026-05-10" },
    { id: 2, company: "TechStart Inc", value: 25000, stage: "proposal", date: "2026-05-09" },
    { id: 3, company: "Global Solutions", value: 18000, stage: "qualified", date: "2026-05-08" },
    { id: 4, company: "Innovate Ltd", value: 32000, stage: "won", date: "2026-05-07" },
    { id: 5, company: "Future Systems", value: 22000, stage: "meeting_booked", date: "2026-05-06" },
  ];

  return (
    <Card className="glass-card" title="Recent Deals">
      <div className="space-y-3">
        {recentDeals.map((deal) => (
          <div key={deal.id} className="flex justify-between items-start pb-3 border-b border-muted-foreground/20 last:border-0">
            <div className="flex-1">
              <p className="font-medium">{deal.company}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(deal.date).toLocaleDateString()} • {deal.stage.replace("_", " ").toUpperCase()}
              </p>
            </div>
            <p className="text-right font-medium">${deal.value.toLocaleString()}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}