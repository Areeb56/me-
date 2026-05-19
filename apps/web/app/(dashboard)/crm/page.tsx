"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { KanbanSquare, DollarSign, Clock } from "lucide-react";
import type { CrmDeal, DealStage } from "@aios/shared-types";

const stages: { key: DealStage; label: string; color: string }[] = [
  { key: "prospect", label: "Prospect", color: "bg-primary/20 text-primary" },
  { key: "contacted", label: "Contacted", color: "bg-blue-500/20 text-blue-400" },
  { key: "replied", label: "Replied", color: "bg-warning/20 text-warning" },
  { key: "meeting_booked", label: "Meeting", color: "bg-purple-500/20 text-purple-400" },
  { key: "won", label: "Won", color: "bg-success/20 text-success" },
  { key: "lost", label: "Lost", color: "bg-error/20 text-error" },
];

export default function CrmPage() {
  const { data: pipeline, isLoading } = useQuery<Record<DealStage, CrmDeal[]>>({
    queryKey: ["crm", "pipeline"],
    queryFn: () => api.get("/api/crm/pipeline"),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-text-primary">CRM Pipeline</h1>
        <div className="grid grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">CRM Pipeline</h1>
        <p className="text-text-muted mt-1">Drag and drop deals through stages</p>
      </div>

      <div className="grid grid-cols-6 gap-4 overflow-x-auto">
        {stages.map((stage) => {
          const deals = pipeline?.[stage.key] ?? [];
          const totalValue = deals.reduce((sum, d) => sum + Number(d.value ?? 0), 0);

          return (
            <div key={stage.key} className="min-w-[200px]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-text-primary">{stage.label}</h3>
                <Badge variant="default">{deals.length}</Badge>
              </div>
              {totalValue > 0 && (
                <p className="text-xs text-text-muted mb-3">${totalValue.toLocaleString()}</p>
              )}
              <div className="space-y-2">
                {deals.map((deal) => (
                  <motion.div
                    key={deal.id}
                    layout
                    className="p-3 rounded-lg bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors cursor-grab active:cursor-grabbing"
                  >
                    <p className="text-sm font-medium text-text-primary truncate">
                      {deal.lead_id?.slice(0, 8)}
                    </p>
                    {deal.value && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-text-muted">
                        <DollarSign size={12} />
                        <span>${Number(deal.value).toLocaleString()}</span>
                      </div>
                    )}
                    {deal.next_follow_up_at && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-text-muted">
                        <Clock size={12} />
                        <span>{new Date(deal.next_follow_up_at).toLocaleDateString()}</span>
                      </div>
                    )}
                  </motion.div>
                ))}
                {deals.length === 0 && (
                  <div className="p-4 rounded-lg border border-dashed border-white/10 text-center">
                    <p className="text-xs text-text-muted">No deals</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
