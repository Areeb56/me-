import { db } from "../db";
import { crmDeals, analyticsEvents, leads, contacts } from "../db/schema";
import { eq } from "drizzle-orm";

export class CrmService {
  async updateDealStage(dealId: string, newStage: string): Promise<void> {
    const [deal] = await db
      .select()
      .from(crmDeals)
      .where(eq(crmDeals.id, dealId))
      .limit(1);

    if (!deal) throw new Error(`Deal ${dealId} not found`);

    const updates: Record<string, unknown> = {
      stage: newStage,
      updatedAt: new Date(),
    };

    if (newStage === "won") {
      updates.wonAt = new Date();
    }

    if (newStage === "lost") {
      updates.lostReason = "No response after follow-ups";
    }

    await db.update(crmDeals).set(updates).where(eq(crmDeals.id, dealId));

    await db.insert(analyticsEvents).values({
      eventType: "deal_stage_changed",
      entityType: "deal",
      entityId: dealId,
      properties: {
        oldStage: deal.stage,
        newStage,
      },
    });
  }

  async getPipeline() {
    const deals = await db.select().from(crmDeals);

    const stages = ["prospect", "contacted", "replied", "meeting_booked", "won", "lost"] as const;
    const pipeline: Record<string, typeof deals> = {};

    for (const stage of stages) {
      pipeline[stage] = deals.filter((d) => d.stage === stage);
    }

    return pipeline;
  }

  async getDealMetrics() {
    const deals = await db.select().from(crmDeals);

    const totalRevenue = deals
      .filter((d) => d.stage === "won" && d.value)
      .reduce((sum, d) => sum + Number(d.value), 0);

    const pipelineValue = deals
      .filter((d) => !["won", "lost"].includes(d.stage) && d.value)
      .reduce((sum, d) => sum + Number(d.value), 0);

    const activeDeals = deals.filter((d) => !["won", "lost"].includes(d.stage)).length;
    const wonDeals = deals.filter((d) => d.stage === "won").length;
    const totalDeals = deals.length;
    const winRate = totalDeals > 0 ? wonDeals / totalDeals : 0;

    return {
      totalRevenue,
      pipelineValue,
      activeDeals,
      winRate,
    };
  }

  async createDeal(data: {
    leadId: string;
    contactId?: string;
    stage?: string;
    value?: string;
    notes?: string;
    nextFollowUpAt?: Date;
  }) {
    const [deal] = await db
      .insert(crmDeals)
      .values({
        leadId: data.leadId,
        contactId: data.contactId,
        stage: (data.stage as typeof crmDeals.$inferInsert.stage) ?? "prospect",
        value: data.value,
        notes: data.notes,
        nextFollowUpAt: data.nextFollowUpAt,
      })
      .returning();

    await db.insert(analyticsEvents).values({
      eventType: "deal_created",
      entityType: "deal",
      entityId: deal.id,
      properties: { stage: deal.stage, value: deal.value },
    });

    return deal;
  }
}
