"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Play, Pause } from "lucide-react";
import type { Campaign } from "@aios/shared-types";

export default function OutreachPage() {
  const { data, isLoading } = useQuery<{ campaigns: Campaign[] }>({
    queryKey: ["campaigns"],
    queryFn: () => api.get("/api/campaigns"),
  });

  const statusColors: Record<string, "success" | "warning" | "error" | "info" | "default"> = {
    draft: "default",
    active: "success",
    paused: "warning",
    completed: "info",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Outreach</h1>
          <p className="text-text-muted mt-1">Email campaigns and sequences</p>
        </div>
        <Button>
          <Plus size={16} />
          New Campaign
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : (
        <Card className="glass-card">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Opened</TableHead>
                  <TableHead>Replied</TableHead>
                  <TableHead>Meetings</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.campaigns?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-text-muted">
                      No campaigns yet. Create your first campaign to start outreach.
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.campaigns?.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell className="font-medium text-text-primary">{campaign.name}</TableCell>
                      <TableCell className="text-text-muted">{campaign.target_industry ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant={statusColors[campaign.status] ?? "default"}>
                          {campaign.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{campaign.stats?.opens ?? 0}</TableCell>
                      <TableCell>{campaign.stats?.clicks ?? 0}</TableCell>
                      <TableCell>{campaign.stats?.replies ?? 0}</TableCell>
                      <TableCell>{campaign.stats?.meetings ?? 0}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {campaign.status === "draft" && (
                            <Button size="sm" variant="ghost">
                              <Play size={14} />
                            </Button>
                          )}
                          {campaign.status === "active" && (
                            <Button size="sm" variant="ghost">
                              <Pause size={14} />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
