"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus, Play, Filter } from "lucide-react";
import type { Lead } from "@aios/shared-types";

export default function LeadsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{ leads: Lead[]; pagination: { total: number } }>({
    queryKey: ["leads", search, statusFilter],
    queryFn: () =>
      api.get("/api/leads", {
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
      }),
  });

  const researchMutation = useMutation({
    mutationFn: (leadId: string) => api.post(`/api/leads/${leadId}/research`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });

  const statusColors: Record<string, "success" | "warning" | "error" | "info" | "default"> = {
    new: "info",
    researching: "warning",
    qualified: "success",
    disqualified: "error",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Lead Generation</h1>
          <p className="text-text-muted mt-1">Manage and research potential leads</p>
        </div>
        <Button>
          <Plus size={16} />
          Add Lead
        </Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <Input
            placeholder="Search companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">All Status</option>
          <option value="new">New</option>
          <option value="researching">Researching</option>
          <option value="qualified">Qualified</option>
          <option value="disqualified">Disqualified</option>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.leads?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-text-muted">
                      No leads found. Add your first lead to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.leads?.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-text-primary">{lead.company_name}</p>
                          {lead.domain && (
                            <p className="text-xs text-text-muted">{lead.domain}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-text-muted">{lead.industry ?? "—"}</TableCell>
                      <TableCell>
                        <ScoreBadge score={lead.score} />
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusColors[lead.status] ?? "default"}>
                          {lead.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-text-muted capitalize">{lead.source}</TableCell>
                      <TableCell className="text-right">
                        {lead.status === "new" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => researchMutation.mutate(lead.id)}
                            disabled={researchMutation.isPending}
                          >
                            <Play size={14} />
                            Research
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-text-muted">—</span>;

  const color = score >= 70 ? "text-success" : score >= 40 ? "text-warning" : "text-error";

  return (
    <span className={cn("font-semibold", color)}>
      {score}
    </span>
  );
}

function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(" ");
}
