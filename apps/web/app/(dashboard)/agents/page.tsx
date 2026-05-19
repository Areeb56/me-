"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { LiveAgentStream } from "@/components/agents/live-agent-stream";
import { Bot, Activity, Clock, CheckCircle, XCircle } from "lucide-react";
import type { AgentStatus } from "@aios/shared-types";

export default function AgentsPage() {
  const { data, isLoading } = useQuery<{ agents: AgentStatus[] }>({
    queryKey: ["agents", "status"],
    queryFn: () => api.get("/api/agents/status"),
  });

  const statusColors: Record<string, "success" | "warning" | "error" | "default"> = {
    idle: "default",
    running: "success",
    error: "error",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">AI Agents</h1>
        <p className="text-text-muted mt-1">Monitor and manage autonomous agents</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? [...Array(6)].map((_, i) => (
              <Card key={i} className="glass-card">
                <CardHeader className="pb-2"><Skeleton className="h-4 w-24" /></CardHeader>
                <CardContent><Skeleton className="h-6 w-16" /></CardContent>
              </Card>
            ))
          : data?.agents?.map((agent) => (
              <Card key={agent.agent_type} className="glass-card-hover">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center gap-2">
                    <Bot size={18} className="text-primary" />
                    <CardTitle className="text-sm font-medium text-text-primary capitalize">
                      {agent.agent_type.replace(/_/g, " ")}
                    </CardTitle>
                  </div>
                  <Badge variant={statusColors[agent.status] ?? "default"}>
                    {agent.status}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between text-text-muted">
                      <span>Total runs</span>
                      <span className="text-text-primary">{agent.total_runs}</span>
                    </div>
                    <div className="flex items-center justify-between text-text-muted">
                      <span>Success rate</span>
                      <span className="text-text-primary">{(agent.success_rate * 100).toFixed(0)}%</span>
                    </div>
                    {agent.last_run_at && (
                      <div className="flex items-center justify-between text-text-muted">
                        <span>Last run</span>
                        <span className="text-text-primary">{new Date(agent.last_run_at).toLocaleTimeString()}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity size={18} className="text-primary" />
            Live Agent Stream
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LiveAgentStream />
        </CardContent>
      </Card>
    </div>
  );
}
