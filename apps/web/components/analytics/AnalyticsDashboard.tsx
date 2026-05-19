import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";

export function AnalyticsDashboard() {
  const trafficData = [
    { month: "Jan", direct: 400, referral: 300, social: 200, search: 500 },
    { month: "Feb", direct: 300, referral: 200, social: 100, search: 400 },
    { month: "Mar", direct: 500, referral: 400, social: 300, search: 600 },
    { month: "Apr", direct: 400, referral: 300, social: 200, search: 500 },
    { month: "May", direct: 600, referral: 500, social: 400, search: 700 },
    { month: "Jun", direct: 500, referral: 400, social: 300, search: 600 },
  ];

  const conversionData = [
    { month: "Jan", visits: 1000, conversions: 50 },
    { month: "Feb", visits: 800, conversions: 40 },
    { month: "Mar", visits: 1200, conversions: 60 },
    { month: "Apr", visits: 900, conversions: 45 },
    { month: "May", visits: 1500, conversions: 75 },
    { month: "Jun", visits: 1300, conversions: 65 },
  ];

  return (
    <div className="glass-card p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Track your performance metrics and insights</p>
      </div>

      <div className="gap-6">
        <div className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-4">
            <h3 className="font-semibold mb-4">Total Visitors</h3>
            <p className="text-3xl font-bold">12,450</p>
            <p className="text-sm text-muted-foreground">+12.5% from last month</p>
          </div>

          <div className="glass-card p-4">
            <h3 className="font-semibold mb-4">Conversion Rate</h3>
            <p className="text-3xl font-bold">3.2%</p>
            <p className="text-sm text-muted-foreground">+0.8% from last month</p>
          </div>

          <div className="glass-card p-4">
            <h3 className="font-semibold mb-4">Bounce Rate</h3>
            <p className="text-3xl font-bold">42.1%</p>
            <p className="text-sm text-muted-foreground">-2.3% from last month</p>
          </div>

          <div className="glass-card p-4">
            <h3 className="font-semibold mb-4">Avg. Session Duration</h3>
            <p className="text-3xl font-bold">4m 22s</p>
            <p className="text-sm text-muted-foreground">+0.5m from last month</p>
          </div>
        </div>

        <div className="grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="glass-card p-4">
            <h3 className="font-semibold mb-4">Traffic Sources</h3>
            <div className="h-96">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={trafficData}>
                  <XAxis dataKey="month" tickLine={false} />
                  <YAxis tickLine={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="direct" label="Direct" fill="#3b82f6" />
                  <Bar dataKey="referral" label="Referral" fill="#10b981" />
                  <Bar dataKey="social" label="Social" fill="#f59e0b" />
                  <Bar dataKey="search" label="Search" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card p-4">
            <h3 className="font-semibold mb-4">Conversion Rate Over Time</h3>
            <div className="h-96">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={conversionData}>
                  <XAxis dataKey="month" tickLine={false} />
                  <YAxis tickLine={false} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="visits" label="Visits" fill="#3b82f6" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="conversions" label="Conversions" fill="#10b981" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}