import {
  pgTable,
  uuid,
  text,
  integer,
  jsonb,
  timestamp,
  numeric,
  varchar,
  boolean,
  pgEnum,
  vector,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const leadStatusEnum = pgEnum("lead_status", ["new", "researching", "qualified", "disqualified"]);
export const leadSourceEnum = pgEnum("lead_source", ["apollo", "linkedin", "manual", "browser"]);
export const dealStageEnum = pgEnum("deal_stage", ["prospect", "contacted", "replied", "meeting_booked", "won", "lost"]);
export const campaignStatusEnum = pgEnum("campaign_status", ["draft", "active", "paused", "completed"]);
export const emailStatusEnum = pgEnum("email_status", ["draft", "scheduled", "sent", "opened", "replied", "bounced"]);
export const agentRunStatusEnum = pgEnum("agent_run_status", ["pending", "running", "completed", "failed"]);
export const replyTypeEnum = pgEnum("reply_type", ["interested", "not_interested", "question", "ooo", "unsubscribe"]);

export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyName: text("company_name").notNull(),
  domain: text("domain").unique(),
  industry: text("industry"),
  employeeCount: integer("employee_count"),
  linkedinUrl: text("linkedin_url"),
  websiteUrl: text("website_url"),
  painPoints: jsonb("pain_points").$type<string[]>(),
  aiOpportunities: jsonb("ai_opportunities").$type<string[]>(),
  score: integer("score"),
  status: leadStatusEnum("status").notNull().default("new"),
  source: leadSourceEnum("source").notNull().default("manual"),
  rawResearch: jsonb("raw_research").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const contacts = pgTable("contacts", {
  id: uuid("id").primaryKey().defaultRandom(),
  leadId: uuid("lead_id").references(() => leads.id, { onDelete: "cascade" }),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email").unique(),
  title: text("title"),
  linkedinUrl: text("linkedin_url"),
  emailVerified: boolean("email_verified").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const crmDeals = pgTable("crm_deals", {
  id: uuid("id").primaryKey().defaultRandom(),
  leadId: uuid("lead_id").references(() => leads.id, { onDelete: "cascade" }).notNull(),
  contactId: uuid("contact_id").references(() => contacts.id, { onDelete: "set null" }),
  stage: dealStageEnum("stage").notNull().default("prospect"),
  value: numeric("value", { precision: 12, scale: 2 }),
  notes: text("notes"),
  wonAt: timestamp("won_at"),
  lostReason: text("lost_reason"),
  nextFollowUpAt: timestamp("next_follow_up_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const campaigns = pgTable("campaigns", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  targetIndustry: text("target_industry"),
  targetCompanySize: text("target_company_size"),
  valueProposition: text("value_proposition"),
  sequenceConfig: jsonb("sequence_config").$type<{
    steps: Array<{
      step_number: number;
      type: "email" | "linkedin" | "call";
      template: string;
      delay_days: number;
    }>;
  }>(),
  status: campaignStatusEnum("status").notNull().default("draft"),
  stats: jsonb("stats").$type<{
    opens: number;
    clicks: number;
    replies: number;
    meetings: number;
  }>().default({ opens: 0, clicks: 0, replies: 0, meetings: 0 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const outreachEmails = pgTable("outreach_emails", {
  id: uuid("id").primaryKey().defaultRandom(),
  contactId: uuid("contact_id").references(() => contacts.id, { onDelete: "cascade" }).notNull(),
  campaignId: uuid("campaign_id").references(() => campaigns.id, { onDelete: "set null" }),
  dealId: uuid("deal_id").references(() => crmDeals.id, { onDelete: "set null" }),
  subject: text("subject"),
  body: text("body"),
  sequenceStep: integer("sequence_step"),
  status: emailStatusEnum("status").notNull().default("draft"),
  sentAt: timestamp("sent_at"),
  openedAt: timestamp("opened_at"),
  repliedAt: timestamp("replied_at"),
  threadId: text("thread_id"),
  messageId: text("message_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const agentRuns = pgTable("agent_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  agentType: text("agent_type").notNull(),
  status: agentRunStatusEnum("status").notNull().default("pending"),
  input: jsonb("input").$type<Record<string, unknown>>(),
  output: jsonb("output").$type<Record<string, unknown>>(),
  steps: jsonb("steps").$type<Array<Record<string, unknown>>>().default([]),
  modelUsed: text("model_used"),
  tokensUsed: integer("tokens_used"),
  durationMs: integer("duration_ms"),
  error: text("error"),
  parentRunId: uuid("parent_run_id").references(() => agentRuns.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const memories = pgTable("memories", {
  id: uuid("id").primaryKey().defaultRandom(),
  agentType: text("agent_type"),
  content: text("content").notNull(),
  embedding: vector("embedding", { dimensions: 1536 }),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  importanceScore: numeric("importance_score", { precision: 5, scale: 4 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const analyticsEvents = pgTable("analytics_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventType: text("event_type").notNull(),
  entityType: text("entity_type"),
  entityId: uuid("entity_id"),
  properties: jsonb("properties").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const emailConnections = pgTable("email_connections", {
  id: uuid("id").primaryKey().defaultRandom(),
  provider: varchar("provider", { length: 20 }).notNull(),
  emailAddress: text("email_address").notNull(),
  credentials: text("credentials").notNull(),
  isConnected: boolean("is_connected").default(false),
  dailyLimit: integer("daily_limit").default(50),
  dailySent: integer("daily_sent").default(0),
  lastResetAt: timestamp("last_reset_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const modelConfigs = pgTable("model_configs", {
  id: uuid("id").primaryKey().defaultRandom(),
  primaryModel: text("primary_model").notNull().default("llama3:70b"),
  fallbackModel: text("fallback_model").notNull().default("openrouter/anthropic/claude-3.5-sonnet"),
  ollamaHost: text("ollama_host").notNull().default("http://localhost:11434"),
  openrouterApiKey: text("openrouter_api_key"),
  geminiApiKey: text("gemini_api_key"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const leadsRelations = relations(leads, ({ many }) => ({
  contacts: many(contacts),
  deals: many(crmDeals),
}));

export const contactsRelations = relations(contacts, ({ one, many }) => ({
  lead: one(leads, {
    fields: [contacts.leadId],
    references: [leads.id],
  }),
  emails: many(outreachEmails),
}));

export const crmDealsRelations = relations(crmDeals, ({ one, many }) => ({
  lead: one(leads, {
    fields: [crmDeals.leadId],
    references: [leads.id],
  }),
  contact: one(contacts, {
    fields: [crmDeals.contactId],
    references: [contacts.id],
  }),
  emails: many(outreachEmails),
}));

export const campaignsRelations = relations(campaigns, ({ many }) => ({
  emails: many(outreachEmails),
}));

export const outreachEmailsRelations = relations(outreachEmails, ({ one }) => ({
  contact: one(contacts, {
    fields: [outreachEmails.contactId],
    references: [contacts.id],
  }),
  campaign: one(campaigns, {
    fields: [outreachEmails.campaignId],
    references: [campaigns.id],
  }),
  deal: one(crmDeals, {
    fields: [outreachEmails.dealId],
    references: [crmDeals.id],
  }),
}));

export const agentRunsRelations = relations(agentRuns, ({ one, many }) => ({
  parent: one(agentRuns, {
    fields: [agentRuns.parentRunId],
    references: [agentRuns.id],
  }),
  children: many(agentRuns),
}));
