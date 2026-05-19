"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollText, ChevronDown, ChevronRight, Download } from "lucide-react";
import type { AgentRun } from "@aios/shared-types";

export default function LogsPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");

  const { data, isLoading } = useQuery<{ runs: AgentRun[]; pagination: { total: number } }>({
    queryKey: ["agents", "runs", statusFilter],
    queryFn: () => api.get("/api/agents/runs", {
      ...(statusFilter && { status: statusFilter }),
    }),
  });

  const statusColors: Record<string, "success" | "warning" | "error" | "default"> = {
    pending: "default",
    running: "success",
    completed: "success",
    failed: "error",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Logs</h1>
          <p className="text-text-muted mt-1">Agent execution history and audit trail</p>
        </div>
        <Button variant="secondary">
          <Download size={16} />
          Export CSV
        </Button>
      </div>

      <div className="flex gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-text-primary"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="running">Running</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <Card className="glass-card">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {data?.runs?.length === 0 ? (
                <div className="p-8 text-center text-text-muted">
                  No agent runs recorded yet.
                </div>
              ) : (
                data?.runs?.map((run) => (
                  <div key={run.id}>
                    <button
                      onClick={() => setExpandedId(expandedId === run.id ? null : run.id)}
                      className="w-full flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-colors text-left"
                    >
                      {expandedId === run.id ? <ChevronDown size={16} className="text-text-muted" /> : <ChevronRight size={16} className="text-text-muted" />}
                      <Badge variant={statusColors[run.status] ?? "default"}>{run.status}</Badge>
                      <span className="text-sm font-medium text-text-primary capitalize flex-1">
                        {run.agent_type?.replace(/_/g, " ")}
                      </span>
                      <span className="text-xs text-text-muted">
                        {run.duration_ms ? `${run.duration_ms}ms` : "—"}
                      </span>
                      <span className="text-xs text-text-muted">
                        {run.tokens_used ? `${run.tokens_used} tokens` : "—"}
                      </span>
                      <span className="text-xs text-text-muted">
                        {new Date(run.created_at).toLocaleString()}
                      </span>
                    </button>
                    {expandedId === run.id && (
                      <div className="px-4 pb-4 pl-12">
                        <div className="p-3 rounded-lg bg-black/20 font-mono text-xs text-text-muted overflow-x-auto">
                          <pre className="whitespace-pre-wrap">
                            {JSON.stringify({ input: run.input, output: run.output, steps: run.steps, error: run.error }, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
