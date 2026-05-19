import { FastifyInstance } from "fastify";
import { AnalyticsService } from "../services/analytics.service";
import { CrmService } from "../services/crm.service";

export async function analyticsRoutes(fastify: FastifyInstance) {
  const analyticsService = new AnalyticsService();
  const crmService = new CrmService();

  fastify.get("/overview", async () => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [metrics, dealMetrics] = await Promise.all([
      analyticsService.getMetrics(thirtyDaysAgo, now),
      crmService.getDealMetrics(),
    ]);

    return {
      ...metrics,
      ...dealMetrics,
    };
  });

  fastify.get("/email-performance", async (request) => {
    const query = request.query as Record<string, string>;
    const days = parseInt(query.days ?? "30");

    const dailyMetrics = await analyticsService.getDailyMetrics(days);
    return { daily: dailyMetrics };
  });

  fastify.get("/campaigns", async () => {
    return analyticsService.getCampaignPerformance();
  });

  fastify.get("/agents", async () => {
    const orchestratorUrl = process.env.ORCHESTRATOR_URL ?? "http://localhost:8001";

    try {
      const response = await fetch(`${orchestratorUrl}/agents/metrics`);
      if (response.ok) {
        return response.json();
      }
    } catch {
      console.warn("Orchestrator unavailable");
    }

    return { error: "Agent metrics unavailable" };
  });

  fastify.get("/cost", async () => {
    const orchestratorUrl = process.env.ORCHESTRATOR_URL ?? "http://localhost:8001";

    try {
      const response = await fetch(`${orchestratorUrl}/agents/metrics`);
      if (response.ok) {
        const metrics = await response.json();
        const estimatedCost = (metrics.total_tokens ?? 0) * 0.00001;
        return {
          total_tokens: metrics.total_tokens ?? 0,
          estimated_cost_usd: estimatedCost,
          cost_per_agent: metrics.by_agent?.map((a: Record<string, unknown>) => ({
            agent_type: a.agent_type,
            tokens: a.total_tokens,
            estimated_cost: (a.total_tokens ?? 0) * 0.00001,
          })) ?? [],
        };
      }
    } catch {
      console.warn("Orchestrator unavailable");
    }

    return { total_tokens: 0, estimated_cost_usd: 0, cost_per_agent: [] };
  });

  fastify.post("/events", async (request, reply) => {
    const body = request.body as {
      event_type: string;
      entity_type?: string;
      entity_id?: string;
      properties?: Record<string, unknown>;
    };

    const event = await analyticsService.trackEvent({
      eventType: body.event_type,
      entityType: body.entity_type,
      entityId: body.entity_id,
      properties: body.properties,
    });

    return reply.code(201).send(event);
  });
}
