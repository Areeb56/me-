import React from "react";

export function CrmDashboard() {
  // Mock data for deals
  const deals = [
    { id: 1, name: "Acme Corp", stage: "prospect", value: 5000 },
    { id: 2, name: "Beta LLC", stage: "prospect", value: 7500 },
    { id: 3, name: "Gamma Inc", stage: "contacted", value: 10000 },
    { id: 4, name: "Delta Solutions", stage: "contacted", value: 8000 },
    { id: 5, name: "Epsilon Enterprises", stage: "replied", value: 12000 },
    { id: 6, name: "Zeta Industries", stage: "replied", value: 9500 },
    { id: 7, name: "Eta Corp", stage: "meeting_booked", value: 15000 },
    { id: 8, name: "Theta LLC", stage: "meeting_booked", value: 11000 },
    { id: 9, name: "Iota Inc", stage: "won", value: 20000 },
    { id: 10, name: "Kappa Corp", stage: "won", value: 18000 },
    { id: 11, name: "Lambda LLC", stage: "lost", value: 0, lostReason: "Chose competitor" },
    { id: 12, name: "Mu Enterprises", stage: "lost", value: 0, lostReason: "Budget constraints" },
  ];

  const stages = [
    { id: "prospect", label: "Prospect", color: "bg-blue-600/20 text-blue-600" },
    { id: "contacted", label: "Contacted", color: "bg-blue-600/20 text-blue-600" },
    { id: "replied", label: "Replied", color: "bg-blue-600/20 text-blue-600" },
    { id: "meeting_booked", label: "Meeting Booked", color: "bg-blue-600/20 text-blue-600" },
    { id: "won", label: "Won", color: "bg-green-600/20 text-green-600" },
    { id: "lost", label: "Lost", color: "bg-red-600/20 text-red-600" },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">CRM Dashboard</h1>
        <p className="text-muted-foreground">Manage your customer relationships and sales pipeline</p>
      </div>

      <div className="grid gap-6">
        <div className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card">
            <h3 className="font-semibold mb-4">Total Deals</h3>
            <p className="text-3xl font-bold">{deals.length}</p>
            <p className="text-sm text-muted-foreground">+12 from last month</p>
          </div>

          <div className="glass-card">
            <h3 className="font-semibold mb-4">Win Rate</h3>
            <p className="text-3xl font-bold">68%</p>
            <p className="text-sm text-muted-foreground">+3.2% from last month</p>
          </div>

          <div className="glass-card">
            <h3 className="font-semibold mb-4">Avg. Deal Size</h3>
            <p className="text-3xl font-bold">$8,250</p>
            <p className="text-sm text-muted-foreground">+$450 from last month</p>
          </div>

          <div className="glass-card">
            <h3 className="font-semibold mb-4">Sales Cycle Length</h3>
            <p className="text-3xl font-bold">32 days</p>
            <p className="text-sm text-muted-foreground">-2 days from last month</p>
          </div>
        </div>

        <div className="glass-card">
          <h3 className="font-semibold mb-4">Sales Pipeline</h3>
          <div className="space-y-4">
            {stages.map(stage => (
              <div key={stage.id} className="space-y-3">
                <div className="flex justify-between mb-2">
                  <h4 className="font-semibold">{stage.label}</h4>
                  <span className={`${stage.color} rounded text-xs px-2 py-1`}>
                    {deals.filter(d => d.stage === stage.id).length}
                  </span>
                </div>
                <div className="min-h-[80px] border-dashed border-2 border-gray-300 rounded-lg p-4">
                  {deals
                    .filter(d => d.stage === stage.id)
                    .map(deal => (
                      <div
                        key={deal.id}
                        className="mb-2 p-3 bg-[#18181b]/60 rounded-lg border border-[#18181b]/40"
                      >
                        <p className="font-medium">{deal.name}</p>
                        <p className="text-sm text-muted-foreground">${deal.value}</p>
                      </div>
                    ))}
                  {deals.filter(d => d.stage === stage.id).length === 0 && (
                    <p className="text-xs text-muted-foreground text-center">No deals</p>
                  )}
                </div>
              </div>
            ))}

          </div>
        </div>
        <div className="glass-card">
          <h3 className="font-semibold mb-4">Deal Stage Distribution</h3>
          <div className="h-96">
            {/* Chart would go here */}
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">Deal Stage Chart</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
