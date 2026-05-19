import { FastifyInstance } from "fastify";
import { z } from "zod";
import { db } from "../db";
import { crmDeals, leads, contacts } from "../db/schema";
import { eq, desc } from "drizzle-orm";
import { CrmService } from "../services/crm.service";
import { crmSyncQueue } from "../lib/queue";
import { getStreamGateway } from "../websocket/stream.gateway";

const createDealSchema = z.object({
  lead_id: z.string().uuid(),
  contact_id: z.string().uuid().optional(),
  stage: z.enum(["prospect", "contacted", "replied", "meeting_booked", "won", "lost"]).optional(),
  value: z.string().optional(),
  notes: z.string().optional(),
  next_follow_up_at: z.string().datetime().optional(),
});

const updateDealSchema = z.object({
  stage: z.enum(["prospect", "contacted", "replied", "meeting_booked", "won", "lost"]).optional(),
  value: z.string().optional(),
  notes: z.string().optional(),
  lost_reason: z.string().optional(),
  next_follow_up_at: z.string().datetime().optional(),
});

export async function crmRoutes(fastify: FastifyInstance) {
  const crmService = new CrmService();

  fastify.get("/pipeline", async () => {
    return crmService.getPipeline();
  });

  fastify.get("/metrics", async () => {
    return crmService.getDealMetrics();
  });

  fastify.get("/", async () => {
    const deals = await db
      .select()
      .from(crmDeals)
      .orderBy(desc(crmDeals.updatedAt));

    const leadIds = deals.map((d) => d.leadId).filter(Boolean) as string[];
    const contactIds = deals.map((d) => d.contactId).filter(Boolean) as string[];

    const leadMap = new Map();
    if (leadIds.length > 0) {
      const leadList = await db.select().from(leads).where(eq(leads.id, leadIds[0]));
      for (const l of leadList) leadMap.set(l.id, l);
    }

    const contactMap = new Map();
    if (contactIds.length > 0) {
      const contactList = await db.select().from(contacts).where(eq(contacts.id, contactIds[0]));
      for (const c of contactList) contactMap.set(c.id, c);
    }

    return deals.map((deal) => ({
      ...deal,
      lead: leadMap.get(deal.leadId),
      contact: contactMap.get(deal.contactId),
    }));
  });

  fastify.get("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    const [deal] = await db.select().from(crmDeals).where(eq(crmDeals.id, id)).limit(1);

    if (!deal) {
      return reply.code(404).send({ error: "Deal not found" });
    }

    const [lead] = await db.select().from(leads).where(eq(leads.id, deal.leadId)).limit(1);
    const contact = deal.contactId
      ? (await db.select().from(contacts).where(eq(contacts.id, deal.contactId)).limit(1))[0]
      : null;

    return reply.send({ ...deal, lead, contact });
  });

  fastify.post("/", async (request, reply) => {
    const body = createDealSchema.parse(request.body);

    const deal = await crmService.createDeal({
      leadId: body.lead_id,
      contactId: body.contact_id,
      stage: body.stage,
      value: body.value,
      notes: body.notes,
      nextFollowUpAt: body.next_follow_up_at ? new Date(body.next_follow_up_at) : undefined,
    });

    return reply.code(201).send(deal);
  });

  fastify.patch("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = updateDealSchema.parse(request.body);

    const [existing] = await db.select().from(crmDeals).where(eq(crmDeals.id, id)).limit(1);

    if (!existing) {
      return reply.code(404).send({ error: "Deal not found" });
    }

    if (body.stage && body.stage !== existing.stage) {
      await crmSyncQueue.add("sync-deal", {
        dealId: id,
        newStage: body.stage,
      });

      const gateway = getStreamGateway();
      gateway.emitDealUpdated({
        dealId: id,
        oldStage: existing.stage,
        newStage: body.stage,
      });
    }

    const updates: Record<string, unknown> = {
      ...body,
      updatedAt: new Date(),
    };

    if (body.stage === "won") {
      updates.wonAt = new Date();
    }

    const [deal] = await db
      .update(crmDeals)
      .set(updates)
      .where(eq(crmDeals.id, id))
      .returning();

    return reply.send(deal);
  });

  fastify.delete("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    const [deleted] = await db.delete(crmDeals).where(eq(crmDeals.id, id)).returning();

    if (!deleted) {
      return reply.code(404).send({ error: "Deal not found" });
    }

    return reply.code(204).send();
  });
}
