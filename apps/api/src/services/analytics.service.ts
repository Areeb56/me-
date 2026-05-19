import { db } from "../db";
import { analyticsEvents, outreachEmails, crmDeals, campaigns, agentRuns } from "../db/schema";
import { eq, gte, lte, and, sql } from "drizzle-orm";

export class AnalyticsService {
  async trackEvent(data: {
    eventType: string;
    entityType?: string;
    entityId?: string;
    properties?: Record<string, unknown>;
  }) {
    const [event] = await db
      .insert(analyticsEvents)
      .values({
        eventType: data.eventType,
        entityType: data.entityType,
        entityId: data.entityId,
        properties: data.properties,
      })
      .returning();

    return event;
  }

  async getMetrics(startDate: Date, endDate: Date) {
    const emails = await db
      .select()
      .from(outreachEmails)
      .where(
        and(gte(outreachEmails.createdAt, startDate), lte(outreachEmails.createdAt, endDate))
      );

    const deals = await db
      .select()
      .from(crmDeals)
      .where(
        and(gte(crmDeals.createdAt, startDate), lte(crmDeals.createdAt, endDate))
      );

    const agentRunData = await db
      .select()
      .from(agentRuns)
      .where(
        and(gte(agentRuns.createdAt, startDate), lte(agentRuns.createdAt, endDate))
      );

    const totalSent = emails.filter((e) => e.status === "sent" || e.status === "opened" || e.status === "replied").length;
    const totalOpened = emails.filter((e) => e.status === "opened" || e.status === "replied").length;
    const totalReplied = emails.filter((e) => e.status === "replied").length;
    const totalWon = deals.filter((d) => d.stage === "won").length;

    const openRate = totalSent > 0 ? totalOpened / totalSent : 0;
    const replyRate = totalSent > 0 ? totalReplied / totalSent : 0;
    const meetingRate = totalReplied > 0 ? deals.filter((d) => d.stage === "meeting_booked").length / totalReplied : 0;

    const avgAgentDuration = agentRunData
      .filter((r) => r.durationMs)
      .reduce((sum, r) => sum + (r.durationMs ?? 0), 0) / (agentRunData.filter((r) => r.durationMs).length || 1);

    const agentSuccessRate = agentRunData.length > 0
      ? agentRunData.filter((r) => r.status === "completed").length / agentRunData.length
      : 0;

    return {
      emails: {
        sent: totalSent,
        opened: totalOpened,
        replied: totalReplied,
        openRate,
        replyRate,
        meetingRate,
      },
      deals: {
        total: deals.length,
        won: totalWon,
        active: deals.filter((d) => !["won", "lost"].includes(d.stage)).length,
      },
      agents: {
        totalRuns: agentRunData.length,
        successRate: agentSuccessRate,
        avgDurationMs: Math.round(avgAgentDuration),
      },
    };
  }

  async getCampaignPerformance() {
    const campaignData = await db.select().from(campaigns);

    return campaignData.map((c) => ({
      id: c.id,
      name: c.name,
      status: c.status,
      stats: c.stats,
      createdAt: c.createdAt,
    }));
  }

  async getDailyMetrics(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const dailyEmails = await db
      .select({
        date: sql<string>`DATE(${outreachEmails.createdAt})`,
        sent: sql<number>`COUNT(*) FILTER (WHERE ${outreachEmails.status} = 'sent')`,
        opened: sql<number>`COUNT(*) FILTER (WHERE ${outreachEmails.status} = 'opened')`,
        replied: sql<number>`COUNT(*) FILTER (WHERE ${outreachEmails.status} = 'replied')`,
      })
      .from(outreachEmails)
      .where(gte(outreachEmails.createdAt, startDate))
      .groupBy(sql`DATE(${outreachEmails.createdAt})`);

    return dailyEmails;
  }
}
