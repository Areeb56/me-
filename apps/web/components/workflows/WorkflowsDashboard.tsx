import React from "react";

export function WorkflowsDashboard() {
  return (
    <div className="glass-card p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Workflows</h1>
        <p className="text-muted-foreground">Create and manage automated workflows</p>
      </div>

      <div className="space-y-6">
        <div className="glass-card p-4">
          <h3 className="font-semibold mb-4">Recent Workflows</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Lead Research Workflow</h4>
                <p className="text-sm text-muted-foreground">Automatically researches new leads</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-xs">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Email Follow-up Sequence</h4>
                <p className="text-sm text-muted-foreground">Sends follow-up emails based on engagement</p>
              </div>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">Paused</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">CRM Deal Updates</h4>
                <p className="text-sm text-muted-foreground">Updates deal stages based on activity</p>
              </div>
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded text-xs">Error</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-4">
          <h3 className="font-semibold mb-4">Workflow Statistics</h3>
          <div className="grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold">24</p>
              <p className="text-sm text-muted-foreground">Total Workflows</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">67%</p>
              <p className="text-sm text-muted-foreground">Active Workflows</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-4">
          <h3 className="font-semibold mb-4">Create New Workflow</h3>
          <div className="space-y-4">
            <input type="text" placeholder="Workflow name" className="w-full p-3 border rounded" />
            <select className="w-full p-3 border rounded">
              <option>Trigger: New Lead</option>
              <option>Trigger: Email Received</option>
              <option>Trigger: Deal Stage Changed</option>
              <option>Trigger: Schedule</option>
            </select>
            <div className="flex space-x-3">
              <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded">Add Action</button>
              <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded">Save Workflow</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}