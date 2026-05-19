import { FastifyInstance } from "fastify";
import { z } from "zod";
import { db } from "../db";
import { emailConnections, modelConfigs } from "../db/schema";
import { eq } from "drizzle-orm";
import { EmailService } from "../services/email.service";

const connectEmailSchema = z.object({
  provider: z.enum(["gmail", "outlook", "smtp"]),
  email_address: z.string().email(),
  credentials: z.record(z.unknown()),
  daily_limit: z.number().min(1).max(500).optional(),
});

const updateModelConfigSchema = z.object({
  primary_model: z.string().optional(),
  fallback_model: z.string().optional(),
  ollama_host: z.string().url().optional(),
  openrouter_api_key: z.string().optional(),
  gemini_api_key: z.string().optional(),
});

export async function settingsRoutes(fastify: FastifyInstance) {
  const emailService = new EmailService();

  fastify.get("/email-connections", async () => {
    const connections = await db
      .select({
        id: emailConnections.id,
        provider: emailConnections.provider,
        email_address: emailConnections.emailAddress,
        is_connected: emailConnections.isConnected,
        daily_limit: emailConnections.dailyLimit,
        daily_sent: emailConnections.dailySent,
        created_at: emailConnections.createdAt,
      })
      .from(emailConnections);

    return { connections };
  });

  fastify.post("/email-connections", async (request, reply) => {
    const body = connectEmailSchema.parse(request.body);

    const connection = await emailService.saveConnection({
      provider: body.provider,
      emailAddress: body.email_address,
      credentials: body.credentials,
      dailyLimit: body.daily_limit,
    });

    return reply.code(201).send({
      id: connection.id,
      provider: connection.provider,
      email_address: connection.emailAddress,
      is_connected: connection.isConnected,
      daily_limit: connection.dailyLimit,
    });
  });

  fastify.delete("/email-connections/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    const [deleted] = await db.delete(emailConnections).where(eq(emailConnections.id, id)).returning();

    if (!deleted) {
      return reply.code(404).send({ error: "Connection not found" });
    }

    return reply.code(204).send();
  });

  fastify.get("/model-config", async () => {
    const [config] = await db.select().from(modelConfigs).limit(1);

    if (!config) {
      const [newConfig] = await db
        .insert(modelConfigs)
        .values({
          primaryModel: "llama3:70b",
          fallbackModel: "openrouter/anthropic/claude-3.5-sonnet",
          ollamaHost: "http://localhost:11434",
        })
        .returning();

      return newConfig;
    }

    return config;
  });

  fastify.patch("/model-config", async (request, reply) => {
    const body = updateModelConfigSchema.parse(request.body);

    const [existing] = await db.select().from(modelConfigs).limit(1);

    if (!existing) {
      const [newConfig] = await db
        .insert(modelConfigs)
        .values({
          primaryModel: body.primary_model ?? "llama3:70b",
          fallbackModel: body.fallback_model ?? "openrouter/anthropic/claude-3.5-sonnet",
          ollamaHost: body.ollama_host ?? "http://localhost:11434",
          openrouterApiKey: body.openrouter_api_key,
          geminiApiKey: body.gemini_api_key,
        })
        .returning();

      return reply.send(newConfig);
    }

    const [updated] = await db
      .update(modelConfigs)
      .set({
        primaryModel: body.primary_model ?? existing.primaryModel,
        fallbackModel: body.fallback_model ?? existing.fallbackModel,
        ollamaHost: body.ollama_host ?? existing.ollamaHost,
        openrouterApiKey: body.openrouter_api_key ?? existing.openrouterApiKey,
        geminiApiKey: body.gemini_api_key ?? existing.geminiApiKey,
        updatedAt: new Date(),
      })
      .returning();

    return reply.send(updated);
  });

  fastify.get("/defaults", async () => {
    return {
      sender_name: "AIOS Assistant",
      signature: "Sent via AIOS — Autonomous AI Business Operating System",
      daily_limit: 50,
      follow_up_schedule: [3, 7, 14],
    };
  });
}
