"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Workflow, Play, Pause, RotateCcw, Plus } from "lucide-react";

const workflows = [
  { id: "1", name: "Lead Research Pipeline", status: "active", runs: 142, lastRun: "2 min ago" },
  { id: "2", name: "Outreach Sequence", status: "active", runs: 89, lastRun: "5 min ago" },
  { id: "3", name: "Follow-up Automation", status: "paused", runs: 67, lastRun: "1 hour ago" },
  { id: "4", name: "CRM Sync", status: "active", runs: 234, lastRun: "Just now" },
  { id: "5", name: "Nightly Reflection", status: "scheduled", runs: 30, lastRun: "Yesterday" },
];

export default function WorkflowsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Workflows</h1>
          <p className="text-text-muted mt-1">Automated pipelines and agent orchestration</p>
        </div>
        <Button>
          <Plus size={16} />
          New Workflow
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {workflows.map((wf) => (
          <Card key={wf.id} className="glass-card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <Workflow size={18} className="text-primary" />
                <CardTitle className="text-sm font-medium text-text-primary">{wf.name}</CardTitle>
              </div>
              <Badge variant={wf.status === "active" ? "success" : wf.status === "paused" ? "warning" : "default"}>
                {wf.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-text-muted">
                <span>{wf.runs} runs</span>
                <span>Last: {wf.lastRun}</span>
              </div>
              <div className="flex gap-2 mt-3">
                {wf.status === "active" ? (
                  <Button size="sm" variant="secondary">
                    <Pause size={14} />
                    Pause
                  </Button>
                ) : (
                  <Button size="sm">
                    <Play size={14} />
                    Start
                  </Button>
                )}
                <Button size="sm" variant="ghost">
                  <RotateCcw size={14} />
                  Re-run
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
