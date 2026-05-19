export function OutreachDashboard() {
  return (
    <div className="glass-card p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Outreach</h1>
        <p className="text-[--muted-foreground:rgb(160,160,160)]">Manage your email campaigns and sequences</p>
      </div>
      
      <div className="grid gap-6">
        <div className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-4">
            <h3 className="font-semibold mb-4">Active Campaigns</h3>
            <p className="text-3xl font-bold">12</p>
            <p className="text-sm text-[--muted-foreground:rgb(160,160,160)]">+3 from last month</p>
          </div>
          
          <div className="glass-card p-4">
            <h3 className="font-semibold mb-4">Emails Sent</h3>
            <p className="text-3xl font-bold">5,420</p>
            <p className="text-sm text-[--muted-foreground:rgb(160,160,160)]">+620 from last month</p>
          </div>
          
          <div className="glass-card p-4">
            <h3 className="font-semibold mb-4">Open Rate</h3>
            <p className="text-3xl font-bold">24.5%</p>
            <p className="text-sm text-[--muted-foreground:rgb(160,160,160)]">+2.1% from last month</p>
          </div>
          
          <div className="glass-card p-4">
            <h3 className="font-semibold mb-4">Reply Rate</h3>
            <p className="text-3xl font-bold">8.2%</p>
            <p className="text-sm text-[--muted-foreground:rgb(160,160,160)]">+1.3% from last month</p>
          </div>
        </div>
        
        <div className="grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="glass-card p-4">
            <h3 className="font-semibold mb-4">Campaign Performance</h3>
            <div className="h-96">
              {/* Chart would go here */}
              <div className="flex h-full items-center justify-center">
                <p className="text-[--muted-foreground:rgb(160,160,160)]">Campaign Performance Chart</p>
              </div>
            </div>
          </div>
          
          <div className="glass-card p-4">
            <h3 className="font-semibold mb-4">Email Sequence Steps</h3>
            <div className="h-96">
              {/* Sequence visualization would go here */}
              <div className="flex h-full items-center justify-center">
                <p className="text-[--muted-foreground:rgb(160,160,160)]">Email Sequence Visualization</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}