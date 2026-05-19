import { FastifyInstance } from "fastify";
import { db } from "../db";
import { agentRuns } from "../db/schema";
import { eq, desc, and, gte } from "drizzle-orm";

export async function agentsRoutes(fastify: FastifyInstance) {
  fastify.get("/status", async () => {
    const orchestratorUrl = process.env.ORCHESTRATOR_URL ?? "http://localhost:8001";

    try {
      const response = await fetch(`${orchestratorUrl}/agents/status`);
      if (response.ok) {
        return response.json();
      }
    } catch {
      console.warn("Orchestrator unavailable, returning local agent status");
    }

    const recentRuns = await db
      .select()
      .from(agentRuns)
      .where(gte(agentRuns.createdAt, new Date(Date.now() - 3600000)))
      .orderBy(desc(agentRuns.createdAt));

    const agentTypes = [...new Set(recentRuns.map((r) => r.agentType))];

    const status = agentTypes.map((type) => {
      const runsForType = recentRuns.filter((r) => r.agentType === type);
      const lastRun = runsForType[0];
      const successCount = runsForType.filter((r) => r.status === "completed").length;

      return {
        agent_type: type,
        status: lastRun?.status === "running" ? "running" : lastRun?.status === "failed" ? "error" : "idle",
        current_task: lastRun?.status === "running" ? lastRun.input : null,
        last_run_at: lastRun?.createdAt.toISOString() ?? null,
        total_runs: runsForType.length,
        success_rate: runsForType.length > 0 ? successCount / runsForType.length : 0,
      };
    });

    return { agents: status };
  });

  fastify.get("/runs", async (request) => {
    const query = request.query as Record<string, string>;
    const page = parseInt(query.page ?? "1");
    const limit = parseInt(query.limit ?? "20");
    const offset = (page - 1) * limit;

    let baseQuery = db.select().from(agentRuns);

    if (query.agent_type) {
      baseQuery = db.select().from(agentRuns).where(eq(agentRuns.agentType, query.agent_type));
    }

    if (query.status) {
      baseQuery = db.select().from(agentRuns).where(eq(agentRuns.status, query.status as typeof agentRuns.$inferSelect.status));
    }

    const runs = await baseQuery.orderBy(desc(agentRuns.createdAt)).limit(limit).offset(offset);

    const [{ count }] = await db.select({ count: db.$count(agentRuns) });

    return {
      runs,
      pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
    };
  });

  fastify.get("/runs/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    const [run] = await db.select().from(agentRuns).where(eq(agentRuns.id, id)).limit(1);

    if (!run) {
      return reply.code(404).send({ error: "Agent run not found" });
    }

    const children = await db.select().from(agentRuns).where(eq(agentRuns.parentRunId, id));

    return reply.send({ ...run, children });
  });

  fastify.get("/metrics", async () => {
    const runs = await db.select().from(agentRuns);

    const totalRuns = runs.length;
    const completedRuns = runs.filter((r) => r.status === "completed").length;
    const failedRuns = runs.filter((r) => r.status === "failed").length;

    const avgDuration = runs
      .filter((r) => r.durationMs)
      .reduce((sum, r) => sum + (r.durationMs ?? 0), 0) / (runs.filter((r) => r.durationMs).length || 1);

    const totalTokens = runs.reduce((sum, r) => sum + (r.tokensUsed ?? 0), 0);

    const byAgent = runs.reduce(
      (acc, run) => {
        if (!acc[run.agentType]) {
          acc[run.agentType] = { total: 0, completed: 0, failed: 0, tokens: 0, durations: [] };
        }
        acc[run.agentType].total++;
        if (run.status === "completed") acc[run.agentType].completed++;
        if (run.status === "failed") acc[run.agentType].failed++;
        acc[run.agentType].tokens += run.tokensUsed ?? 0;
        if (run.durationMs) acc[run.agentType].durations.push(run.durationMs);
        return acc;
      },
      {} as Record<string, { total: number; completed: number; failed: number; tokens: number; durations: number[] }>
    );

    const agentMetrics = Object.entries(byAgent).map(([type, data]) => ({
      agent_type: type,
      total_runs: data.total,
      success_rate: data.total > 0 ? data.completed / data.total : 0,
      avg_duration_ms: data.durations.length > 0 ? data.durations.reduce((a, b) => a + b, 0) / data.durations.length : 0,
      total_tokens: data.tokens,
    }));

    return {
      total_runs: totalRuns,
      success_rate: totalRuns > 0 ? completedRuns / totalRuns : 0,
      error_rate: totalRuns > 0 ? failedRuns / totalRuns : 0,
      avg_duration_ms: Math.round(avgDuration),
      total_tokens: totalTokens,
      by_agent: agentMetrics,
    };
  });
}
