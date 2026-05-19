"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { PipelineFunnel } from "@/components/dashboard/pipeline-funnel";
import { LiveFeed } from "@/components/dashboard/live-feed";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, TrendingUp, Users, Target } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string;
  change?: string;
  icon: React.ElementType;
}

function KpiCard({ title, value, change, icon: Icon }: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="glass-card-hover">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-text-muted">{title}</CardTitle>
          <Icon size={18} className="text-text-muted" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-text-primary">{value}</div>
          {change && (
            <p className="text-xs text-success mt-1">{change}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["analytics", "overview"],
    queryFn: () => api.get("/api/analytics/overview"),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="glass-card">
              <CardHeader className="pb-2"><Skeleton className="h-4 w-24" /></CardHeader>
              <CardContent><Skeleton className="h-8 w-32" /></CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-text-muted mt-1">Revenue overview and pipeline metrics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Revenue"
          value={`$${(metrics?.totalRevenue ?? 0).toLocaleString()}`}
          change="+12.5% from last month"
          icon={DollarSign}
        />
        <KpiCard
          title="Pipeline Value"
          value={`$${(metrics?.pipelineValue ?? 0).toLocaleString()}`}
          change="+8.2% from last month"
          icon={TrendingUp}
        />
        <KpiCard
          title="Active Deals"
          value={(metrics?.activeDeals ?? 0).toString()}
          change="+3 this week"
          icon={Users}
        />
        <KpiCard
          title="Win Rate"
          value={`${((metrics?.winRate ?? 0) * 100).toFixed(1)}%`}
          change="+2.1% from last month"
          icon={Target}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart />
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Pipeline Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <PipelineFunnel />
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <LiveFeed />
        </CardContent>
      </Card>
    </div>
  );
}
