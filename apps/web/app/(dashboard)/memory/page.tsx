"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Brain, Search, Plus } from "lucide-react";

export default function MemoryPage() {
  const [search, setSearch] = useState("");
  const [agentFilter, setAgentFilter] = useState("");

  const { data, isLoading } = useQuery<{ memories: Array<{ id: string; content: string; agent_type: string; importance: number; created_at: string; relevance_score: number }> }>({
    queryKey: ["memories", "search", search, agentFilter],
    queryFn: () =>
      api.get("/memories/search", {
        q: search || "recent",
        ...(agentFilter && { agent_type: agentFilter }),
        limit: "20",
      }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Memory</h1>
          <p className="text-text-muted mt-1">Vector store and agent memories</p>
        </div>
        <Button>
          <Plus size={16} />
          Add Memory
        </Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <Input
            placeholder="Search memories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={agentFilter}
          onChange={(e) => setAgentFilter(e.target.value)}
          className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-text-primary"
        >
          <option value="">All Agents</option>
          <option value="ceo">CEO</option>
          <option value="research_manager">Research</option>
          <option value="outreach_manager">Outreach</option>
          <option value="reflection">Reflection</option>
        </select>
      </div>

      <Card className="glass-card">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {data?.memories?.length === 0 ? (
                <div className="p-8 text-center text-text-muted">
                  No memories found. Agents will store memories as they work.
                </div>
              ) : (
                data?.memories?.map((memory) => (
                  <div key={memory.id} className="p-4 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-text-primary truncate">{memory.content}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
                          <Badge variant="info">{memory.agent_type}</Badge>
                          <span>Importance: {(memory.importance * 100).toFixed(0)}%</span>
                          <span>Relevance: {(memory.relevance_score * 100).toFixed(0)}%</span>
                          <span>{new Date(memory.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
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
