"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { BarChart3, Mail, Bot, DollarSign } from "lucide-react";

const emailData = [
  { date: "Mon", sent: 45, opened: 32, replied: 12 },
  { date: "Tue", sent: 52, opened: 38, replied: 15 },
  { date: "Wed", sent: 48, opened: 35, replied: 10 },
  { date: "Thu", sent: 61, opened: 44, replied: 18 },
  { date: "Fri", sent: 55, opened: 40, replied: 14 },
  { date: "Sat", sent: 20, opened: 15, replied: 5 },
  { date: "Sun", sent: 15, opened: 10, replied: 3 },
];

const agentData = [
  { name: "CEO", runs: 45, success: 42 },
  { name: "Research", runs: 142, success: 135 },
  { name: "Outreach", runs: 89, success: 85 },
  { name: "CRM", runs: 67, success: 64 },
  { name: "Follow-up", runs: 56, success: 52 },
];

const costData = [
  { day: "Mon", cost: 2.4 },
  { day: "Tue", cost: 3.1 },
  { day: "Wed", cost: 2.8 },
  { day: "Thu", cost: 4.2 },
  { day: "Fri", cost: 3.5 },
  { day: "Sat", cost: 1.2 },
  { day: "Sun", cost: 0.8 },
];

export default function AnalyticsPage() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["analytics", "overview"],
    queryFn: () => api.get("/api/analytics/overview"),
  });

  const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Analytics</h1>
        <p className="text-text-muted mt-1">Performance metrics and insights</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Emails Sent", value: metrics?.emails?.sent ?? 0, icon: Mail },
          { title: "Reply Rate", value: `${((metrics?.emails?.replyRate ?? 0) * 100).toFixed(1)}%`, icon: BarChart3 },
          { title: "Agent Runs", value: metrics?.agents?.totalRuns ?? 0, icon: Bot },
          { title: "Est. Cost", value: `$${(metrics?.agents?.totalRuns ?? 0) * 0.05}`, icon: DollarSign },
        ].map((stat, i) => (
          <Card key={i} className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-text-muted">{stat.title}</CardTitle>
              <stat.icon size={16} className="text-text-muted" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold text-text-primary">{stat.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Email Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={emailData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "8px",
                    color: "#fafafa",
                  }}
                />
                <Line type="monotone" dataKey="sent" stroke="#6366f1" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="opened" stroke="#22c55e" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="replied" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Agent Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={agentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "8px",
                    color: "#fafafa",
                  }}
                />
                <Bar dataKey="runs" fill="#6366f1" radius={[4, 4, 0, 0]} fillOpacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Cost Tracking (7 days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={costData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "8px",
                  color: "#fafafa",
                }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, "Cost"]}
              />
              <Bar dataKey="cost" fill="#22c55e" radius={[4, 4, 0, 0]} fillOpacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
