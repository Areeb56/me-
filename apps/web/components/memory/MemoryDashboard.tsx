export function MemoryDashboard() {
  return (
    <div className="glass-card p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Memory</h1>
        <p className="text-[--muted-foreground:rgb(160,160,160)]">View and manage AI agent memories</p>
      </div>
      
      <div className="space-y-6">
        <div className="glass-card p-4">
          <h3 className="font-semibold mb-4">Recent Memories</h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-8 h-8 flex items-center justify-center bg-[--primary:rgb(59,130,246)]/20 text-[--primary-foreground:rgb(59,130,246)]">
                <span>&#128196;</span>
              </div>
              <div className="ml-4">
                <h4 className="font-medium">User preference: dark mode</h4>
                <p className="text-sm text-[--muted-foreground:rgb(160,160,160)]">Updated 2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 flex items-center justify-center bg-[--primary:rgb(59,130,246)]/20 text-[--primary-foreground:rgb(59,130,246)]">
                <span>&#128196;</span>
              </div>
              <div className="ml-4">
                <h4 className="font-medium">Lead research pattern: technology companies</h4>
                <p className="text-sm text-[--muted-foreground:rgb(160,160,160)]">Updated 5 hours ago</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 flex items-center justify-center bg-[--primary:rgb(59,130,246)]/20 text-[--primary-foreground:rgb(59,130,246)]">
                <span>&#128196;</span>
              </div>
              <div className="ml-4">
                <h4 className="font-medium">Email template: follow-up sequence</h4>
                <p className="text-sm text-[--muted-foreground:rgb(160,160,160)]">Updated 1 day ago</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="glass-card p-4">
          <h3 className="font-semibold mb-4">Memory Statistics</h3>
          <div className="grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold">1,245</p>
              <p className="text-sm text-[--muted-foreground:rgb(160,160,160)]">Total Memories</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">89%</p>
              <p className="text-sm text-[--muted-foreground:rgb(160,160,160)]">Memory Utilization</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}