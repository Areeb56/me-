import { FastifyInstance } from "fastify";
import { z } from "zod";
import { db } from "../db";
import { outreachEmails, contacts, campaigns, crmDeals } from "../db/schema";
import { eq, desc, and } from "drizzle-orm";
import { emailSendQueue } from "../lib/queue";
import { getStreamGateway } from "../websocket/stream.gateway";

const createEmailSchema = z.object({
  contact_id: z.string().uuid(),
  campaign_id: z.string().uuid().optional(),
  deal_id: z.string().uuid().optional(),
  subject: z.string(),
  body: z.string(),
  sequence_step: z.number().optional().default(1),
});

const sendEmailSchema = z.object({
  contact_id: z.string().uuid(),
  campaign_id: z.string().uuid().optional(),
  deal_id: z.string().uuid().optional(),
  subject: z.string(),
  body: z.string(),
  sequence_step: z.number().optional().default(1),
  send_at: z.string().datetime().optional(),
});

export async function outreachRoutes(fastify: FastifyInstance) {
  fastify.get("/", async (request) => {
    const query = request.query as Record<string, string>;
    const page = parseInt(query.page ?? "1");
    const limit = parseInt(query.limit ?? "20");
    const offset = (page - 1) * limit;

    const emails = await db
      .select()
      .from(outreachEmails)
      .orderBy(desc(outreachEmails.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ count }] = await db.select({ count: db.$count(outreachEmails) });

    return {
      emails,
      pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
    };
  });

  fastify.get("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    const [email] = await db.select().from(outreachEmails).where(eq(outreachEmails.id, id)).limit(1);

    if (!email) {
      return reply.code(404).send({ error: "Email not found" });
    }

    const [contact] = await db.select().from(contacts).where(eq(contacts.id, email.contactId)).limit(1);

    return reply.send({ ...email, contact });
  });

  fastify.post("/", async (request, reply) => {
    const body = createEmailSchema.parse(request.body);

    const [email] = await db
      .insert(outreachEmails)
      .values({
        contactId: body.contact_id,
        campaignId: body.campaign_id,
        dealId: body.deal_id,
        subject: body.subject,
        body: body.body,
        sequenceStep: body.sequence_step,
        status: "draft",
      })
      .returning();

    return reply.code(201).send(email);
  });

  fastify.post("/send", async (request, reply) => {
    const body = sendEmailSchema.parse(request.body);

    const [email] = await db
      .insert(outreachEmails)
      .values({
        contactId: body.contact_id,
        campaignId: body.campaign_id,
        dealId: body.deal_id,
        subject: body.subject,
        body: body.body,
        sequenceStep: body.sequence_step,
        status: body.send_at ? "scheduled" : "draft",
        sentAt: body.send_at ? new Date(body.send_at) : null,
      })
      .returning();

    if (!body.send_at) {
      const job = await emailSendQueue.add("send-email", {
        emailId: email.id,
        contactId: body.contact_id,
        campaignId: body.campaign_id ?? "",
      });

      const gateway = getStreamGateway();
      const [contact] = await db.select().from(contacts).where(eq(contacts.id, body.contact_id)).limit(1);

      gateway.emitEmailSent({
        emailId: email.id,
        contactName: contact ? `${contact.firstName ?? ""} ${contact.lastName ?? ""}`.trim() : "Unknown",
        companyName: "",
      });
    }

    return reply.code(201).send({ email, scheduled: !!body.send_at });
  });

  fastify.post("/generate", async (request, reply) => {
    const body = request.body as { lead_id: string; contact_id: string; campaign_id: string };

    const orchestratorUrl = process.env.ORCHESTRATOR_URL ?? "http://localhost:8001";
    const response = await fetch(`${orchestratorUrl}/run/outreach`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lead_id: body.lead_id,
        contact_id: body.contact_id,
        campaign_id: body.campaign_id,
      }),
    });

    if (!response.ok) {
      return reply.code(502).send({ error: "Orchestrator unavailable" });
    }

    const generated = await response.json();
    return reply.send(generated);
  });

  fastify.patch("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as Partial<{
      subject: string;
      body: string;
      status: string;
    }>;

    const [email] = await db
      .update(outreachEmails)
      .set({ ...body })
      .where(eq(outreachEmails.id, id))
      .returning();

    if (!email) {
      return reply.code(404).send({ error: "Email not found" });
    }

    return reply.send(email);
  });

  fastify.post("/:id/track-open", async (request, reply) => {
    const { id } = request.params as { id: string };

    await db
      .update(outreachEmails)
      .set({ status: "opened", openedAt: new Date() })
      .where(eq(outreachEmails.id, id));

    return reply.code(204).send();
  });
}
