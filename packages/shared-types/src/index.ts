export type LeadStatus = "new" | "researching" | "qualified" | "disqualified";
export type LeadSource = "apollo" | "linkedin" | "manual" | "browser";

export interface Lead {
  id: string;
  company_name: string;
  domain: string | null;
  industry: string | null;
  employee_count: number | null;
  linkedin_url: string | null;
  website_url: string | null;
  pain_points: string[] | null;
  ai_opportunities: string[] | null;
  score: number | null;
  status: LeadStatus;
  source: LeadSource;
  raw_research: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  lead_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  title: string | null;
  linkedin_url: string | null;
  email_verified: boolean;
  created_at: string;
}

export type DealStage = "prospect" | "contacted" | "replied" | "meeting_booked" | "won" | "lost";

export interface CrmDeal {
  id: string;
  lead_id: string;
  contact_id: string | null;
  stage: DealStage;
  value: number | null;
  notes: string | null;
  won_at: string | null;
  lost_reason: string | null;
  next_follow_up_at: string | null;
  created_at: string;
  updated_at: string;
}

export type CampaignStatus = "draft" | "active" | "paused" | "completed";

export interface Campaign {
  id: string;
  name: string;
  target_industry: string | null;
  target_company_size: string | null;
  value_proposition: string | null;
  sequence_config: {
    steps: Array<{
      step_number: number;
      type: "email" | "linkedin" | "call";
      template: string;
      delay_days: number;
    }>;
  };
  status: CampaignStatus;
  stats: {
    opens: number;
    clicks: number;
    replies: number;
    meetings: number;
  };
  created_at: string;
}

export type EmailStatus = "draft" | "scheduled" | "sent" | "opened" | "replied" | "bounced";

export interface OutreachEmail {
  id: string;
  contact_id: string;
  campaign_id: string | null;
  deal_id: string | null;
  subject: string | null;
  body: string | null;
  sequence_step: number;
  status: EmailStatus;
  sent_at: string | null;
  opened_at: string | null;
  replied_at: string | null;
  thread_id: string | null;
  message_id: string | null;
  created_at: string;
}

export type AgentRunStatus = "pending" | "running" | "completed" | "failed";

export interface AgentRun {
  id: string;
  agent_type: string;
  status: AgentRunStatus;
  input: Record<string, unknown> | null;
  output: Record<string, unknown> | null;
  steps: Array<Record<string, unknown>>;
  model_used: string | null;
  tokens_used: number | null;
  duration_ms: number | null;
  error: string | null;
  parent_run_id: string | null;
  created_at: string;
}

export interface Memory {
  id: string;
  agent_type: string | null;
  content: string;
  embedding: number[] | null;
  metadata: Record<string, unknown> | null;
  importance_score: number | null;
  created_at: string;
}

export interface AnalyticsEvent {
  id: string;
  event_type: string;
  entity_type: string | null;
  entity_id: string | null;
  properties: Record<string, unknown> | null;
  created_at: string;
}

export interface EmailConnection {
  id: string;
  provider: "gmail" | "outlook" | "smtp";
  email_address: string;
  is_connected: boolean;
  daily_limit: number;
  daily_sent: number;
  created_at: string;
}

export interface ModelConfig {
  primary_model: string;
  fallback_model: string;
  ollama_host: string;
  openrouter_api_key: string;
  gemini_api_key: string;
}

export interface KpiMetrics {
  total_revenue: number;
  pipeline_value: number;
  active_deals: number;
  win_rate: number;
  emails_sent_today: number;
  replies_today: number;
  meetings_booked_today: number;
}

export interface AgentStatus {
  agent_type: string;
  status: "idle" | "running" | "error";
  current_task: string | null;
  last_run_at: string | null;
  total_runs: number;
  success_rate: number;
}
