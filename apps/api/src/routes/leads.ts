import { FastifyInstance } from "fastify";
import { z } from "zod";
import { db } from "../db";
import { leads, contacts, crmDeals } from "../db/schema";
import { eq, desc, like, and, gte, lte, inArray, count } from "drizzle-orm";
import { leadResearchQueue } from "../lib/queue";
import { getStreamGateway } from "../websocket/stream.gateway";

const createLeadSchema = z.object({
  company_name: z.string().min(1),
  domain: z.string().url().optional().or(z.literal("")),
  industry: z.string().optional(),
  employee_count: z.number().optional(),
  linkedin_url: z.string().url().optional().or(z.literal("")),
  website_url: z.string().url().optional().or(z.literal("")),
  source: z.enum(["apollo", "linkedin", "manual", "browser"]).optional().default("manual"),
});

const updateLeadSchema = z.object({
  company_name: z.string().min(1).optional(),
  domain: z.string().url().optional().or(z.literal("")),
  industry: z.string().optional(),
  employee_count: z.number().optional(),
  linkedin_url: z.string().url().optional().or(z.literal("")),
  website_url: z.string().url().optional().or(z.literal("")),
  pain_points: z.array(z.string()).optional(),
  ai_opportunities: z.array(z.string()).optional(),
  score: z.number().min(0).max(100).optional(),
  status: z.enum(["new", "researching", "qualified", "disqualified"]).optional(),
  raw_research: z.record(z.unknown()).optional(),
});

export async function leadsRoutes(fastify: FastifyInstance) {
  fastify.get("/", async (request, reply) => {
    const query = request.query as Record<string, string>;
    const page = parseInt(query.page ?? "1");
    const limit = parseInt(query.limit ?? "20");
    const offset = (page - 1) * limit;

    let baseQuery = db.select().from(leads);

    if (query.industry) {
      baseQuery = db.select().from(leads).where(eq(leads.industry, query.industry));
    }

    if (query.status) {
      baseQuery = db.select().from(leads).where(eq(leads.status, query.status as typeof leads.$inferSelect.status));
    }

    if (query.min_score) {
      baseQuery = db.select().from(leads).where(gte(leads.score, parseInt(query.min_score)));
    }

    if (query.search) {
      baseQuery = db.select().from(leads).where(
        like(leads.companyName, `%${query.search}%`)
      );
    }

    const allLeads = await baseQuery.orderBy(desc(leads.createdAt)).limit(limit).offset(offset);

    const [{ count: total }] = await db.select({ count: count() }).from(leads);

    return reply.send({
      leads: allLeads,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  });

  fastify.get("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    const [lead] = await db.select().from(leads).where(eq(leads.id, id)).limit(1);

    if (!lead) {
      return reply.code(404).send({ error: "Lead not found" });
    }

    const leadContacts = await db.select().from(contacts).where(eq(contacts.leadId, id));
    const leadDeals = await db.select().from(crmDeals).where(eq(crmDeals.leadId, id));

    return reply.send({
      ...lead,
      contacts: leadContacts,
      deals: leadDeals,
    });
  });

  fastify.post("/", async (request, reply) => {
    const body = createLeadSchema.parse(request.body);

    const [lead] = await db
      .insert(leads)
      .values({
        companyName: body.company_name,
        domain: body.domain || null,
        industry: body.industry || null,
        employeeCount: body.employee_count || null,
        linkedinUrl: body.linkedin_url || null,
        websiteUrl: body.website_url || null,
        source: body.source,
      })
      .returning();

    return reply.code(201).send(lead);
  });

  fastify.post("/bulk", async (request, reply) => {
    const body = request.body as Array<{
      company_name: string;
      domain?: string;
      industry?: string;
    }>;

    const inserted = await db
      .insert(leads)
      .values(
        body.map((lead) => ({
          companyName: lead.company_name,
          domain: lead.domain || null,
          industry: lead.industry || null,
          source: "manual" as const,
        }))
      )
      .returning();

    return reply.code(201).send(inserted);
  });

  fastify.patch("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = updateLeadSchema.parse(request.body);

    const [lead] = await db
      .update(leads)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(leads.id, id))
      .returning();

    if (!lead) {
      return reply.code(404).send({ error: "Lead not found" });
    }

    return reply.send(lead);
  });

  fastify.delete("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    const [deleted] = await db.delete(leads).where(eq(leads.id, id)).returning();

    if (!deleted) {
      return reply.code(404).send({ error: "Lead not found" });
    }

    return reply.code(204).send();
  });

  fastify.post("/:id/research", async (request, reply) => {
    const { id } = request.params as { id: string };

    const [lead] = await db.select().from(leads).where(eq(leads.id, id)).limit(1);

    if (!lead) {
      return reply.code(404).send({ error: "Lead not found" });
    }

    await db
      .update(leads)
      .set({ status: "researching", updatedAt: new Date() })
      .where(eq(leads.id, id));

    const job = await leadResearchQueue.add("research-lead", {
      leadId: id,
      domain: lead.domain ?? "",
    });

    const gateway = getStreamGateway();
    gateway.emitAgentStep({
      runId: job.id?.toString() ?? "",
      agentType: "research_manager",
      step: "research_started",
      output: { leadId: id, domain: lead.domain },
      timestamp: new Date().toISOString(),
    });

    return reply.send({ jobId: job.id, status: "queued" });
  });
}
