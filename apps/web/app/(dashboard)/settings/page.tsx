"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Settings, Mail, Bot, Save, Trash2, Plus } from "lucide-react";

interface EmailConnection {
  id: string;
  provider: string;
  email_address: string;
  is_connected: boolean;
  daily_limit: number;
  daily_sent: number;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"email" | "model" | "defaults">("email");
  const queryClient = useQueryClient();

  const { data: connections, isLoading: loadingConnections } = useQuery<{ connections: EmailConnection[] }>({
    queryKey: ["settings", "email-connections"],
    queryFn: () => api.get("/api/settings/email-connections"),
  });

  const { data: modelConfig, isLoading: loadingModel } = useQuery({
    queryKey: ["settings", "model-config"],
    queryFn: () => api.get("/api/settings/model-config"),
  });

  const deleteConnection = useMutation({
    mutationFn: (id: string) => api.delete(`/api/settings/email-connections/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "email-connections"] });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="text-text-muted mt-1">Configure email, models, and defaults</p>
      </div>

      <div className="flex gap-2">
        {[
          { key: "email" as const, label: "Email Connections", icon: Mail },
          { key: "model" as const, label: "Model Config", icon: Bot },
          { key: "defaults" as const, label: "Defaults", icon: Settings },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-primary text-white"
                : "bg-white/5 text-text-muted hover:text-text-primary"
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "email" && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Email Connections</CardTitle>
            <CardDescription>Connect your email accounts for sending outreach</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingConnections ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <div className="space-y-4">
                {connections?.connections?.length === 0 ? (
                  <div className="text-center py-8 text-text-muted">
                    No email connections. Connect an account to start sending.
                  </div>
                ) : (
                  connections?.connections?.map((conn) => (
                    <div
                      key={conn.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-white/[0.02] border border-white/5"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <Mail size={18} className="text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-primary">{conn.email_address}</p>
                          <p className="text-xs text-text-muted capitalize">{conn.provider} • {conn.daily_sent}/{conn.daily_limit} today</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={conn.is_connected ? "success" : "error"}>
                          {conn.is_connected ? "Connected" : "Disconnected"}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteConnection.mutate(conn.id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
                <Button>
                  <Plus size={16} />
                  Connect Account
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "model" && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Model Configuration</CardTitle>
            <CardDescription>Configure AI models and API keys</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingModel ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-text-muted">Primary Model</label>
                  <Input defaultValue={modelConfig?.primary_model ?? "llama3:70b"} />
                </div>
                <div>
                  <label className="text-sm text-text-muted">Fallback Model</label>
                  <Input defaultValue={modelConfig?.fallback_model ?? "openrouter/anthropic/claude-3.5-sonnet"} />
                </div>
                <div>
                  <label className="text-sm text-text-muted">Ollama Host</label>
                  <Input defaultValue={modelConfig?.ollama_host ?? "http://localhost:11434"} />
                </div>
                <div>
                  <label className="text-sm text-text-muted">OpenRouter API Key</label>
                  <Input type="password" defaultValue={modelConfig?.openrouter_api_key ? "sk-or-••••••••" : ""} placeholder="sk-or-..." />
                </div>
                <div>
                  <label className="text-sm text-text-muted">Gemini API Key</label>
                  <Input type="password" defaultValue={modelConfig?.gemini_api_key ? "••••••••" : ""} placeholder="AIza..." />
                </div>
                <Button>
                  <Save size={16} />
                  Save Changes
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "defaults" && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Campaign Defaults</CardTitle>
            <CardDescription>Default settings for new campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-text-muted">Sender Name</label>
                <Input defaultValue="AIOS Assistant" />
              </div>
              <div>
                <label className="text-sm text-text-muted">Email Signature</label>
                <Input defaultValue="Sent via AIOS — Autonomous AI Business Operating System" />
              </div>
              <div>
                <label className="text-sm text-text-muted">Daily Send Limit</label>
                <Input type="number" defaultValue={50} />
              </div>
              <div>
                <label className="text-sm text-text-muted">Follow-up Schedule (days)</label>
                <Input defaultValue="3, 7, 14" />
              </div>
              <Button>
                <Save size={16} />
                Save Defaults
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
