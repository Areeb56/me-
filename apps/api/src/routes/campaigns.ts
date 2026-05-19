import { FastifyInstance } from "fastify";
import { z } from "zod";
import { db } from "../db";
import { campaigns } from "../db/schema";
import { eq, desc } from "drizzle-orm";

const createCampaignSchema = z.object({
  name: z.string().min(1),
  target_industry: z.string().optional(),
  target_company_size: z.string().optional(),
  value_proposition: z.string().optional(),
  sequence_config: z
    .object({
      steps: z.array(
        z.object({
          step_number: z.number(),
          type: z.enum(["email", "linkedin", "call"]),
          template: z.string(),
          delay_days: z.number(),
        })
      ),
    })
    .optional(),
});

const updateCampaignSchema = z.object({
  name: z.string().min(1).optional(),
  target_industry: z.string().optional(),
  target_company_size: z.string().optional(),
  value_proposition: z.string().optional(),
  sequence_config: z
    .object({
      steps: z.array(
        z.object({
          step_number: z.number(),
          type: z.enum(["email", "linkedin", "call"]),
          template: z.string(),
          delay_days: z.number(),
        })
      ),
    })
    .optional(),
  status: z.enum(["draft", "active", "paused", "completed"]).optional(),
});

export async function campaignsRoutes(fastify: FastifyInstance) {
  fastify.get("/", async () => {
    const allCampaigns = await db.select().from(campaigns).orderBy(desc(campaigns.createdAt));
    return { campaigns: allCampaigns };
  });

  fastify.get("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id)).limit(1);

    if (!campaign) {
      return reply.code(404).send({ error: "Campaign not found" });
    }

    return reply.send(campaign);
  });

  fastify.post("/", async (request, reply) => {
    const body = createCampaignSchema.parse(request.body);

    const [campaign] = await db
      .insert(campaigns)
      .values({
        name: body.name,
        targetIndustry: body.target_industry,
        targetCompanySize: body.target_company_size,
        valueProposition: body.value_proposition,
        sequenceConfig: body.sequence_config,
        status: "draft",
      })
      .returning();

    return reply.code(201).send(campaign);
  });

  fastify.patch("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = updateCampaignSchema.parse(request.body);

    const [campaign] = await db
      .update(campaigns)
      .set({ ...body })
      .where(eq(campaigns.id, id))
      .returning();

    if (!campaign) {
      return reply.code(404).send({ error: "Campaign not found" });
    }

    return reply.send(campaign);
  });

  fastify.post("/:id/activate", async (request, reply) => {
    const { id } = request.params as { id: string };

    const [campaign] = await db
      .update(campaigns)
      .set({ status: "active" })
      .where(eq(campaigns.id, id))
      .returning();

    if (!campaign) {
      return reply.code(404).send({ error: "Campaign not found" });
    }

    return reply.send(campaign);
  });

  fastify.post("/:id/pause", async (request, reply) => {
    const { id } = request.params as { id: string };

    const [campaign] = await db
      .update(campaigns)
      .set({ status: "paused" })
      .where(eq(campaigns.id, id))
      .returning();

    if (!campaign) {
      return reply.code(404).send({ error: "Campaign not found" });
    }

    return reply.send(campaign);
  });

  fastify.delete("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    const [deleted] = await db.delete(campaigns).where(eq(campaigns.id, id)).returning();

    if (!deleted) {
      return reply.code(404).send({ error: "Campaign not found" });
    }

    return reply.code(204).send();
  });
}
