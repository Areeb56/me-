import Fastify from "fastify";
import cors from "@fastify/cors";
import { createServer } from "http";
import { initStreamGateway } from "./websocket/stream.gateway";
import { leadsRoutes } from "./routes/leads";
import { crmRoutes } from "./routes/crm";
import { outreachRoutes } from "./routes/outreach";
import { campaignsRoutes } from "./routes/campaigns";
import { agentsRoutes } from "./routes/agents";
import { analyticsRoutes } from "./routes/analytics";
import { settingsRoutes } from "./routes/settings";
import { createWorkers } from "./lib/queue";
import { redis } from "./lib/redis";
import { pool } from "./db";

const app = Fastify({
  logger: {
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
  },
});

app.register(cors, {
  origin: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000",
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

app.get("/health", async () => {
  return { status: "ok", timestamp: new Date().toISOString() };
});

app.get("/metrics", async () => {
  const redisPing = await redis.ping();
  let dbStatus = "error";

  try {
    await pool.query("SELECT 1");
    dbStatus = "ok";
  } catch {
    dbStatus = "error";
  }

  return {
    status: "ok",
    services: {
      redis: redisPing === "PONG" ? "ok" : "error",
      database: dbStatus,
      orchestrator: process.env.ORCHESTRATOR_URL ?? "not configured",
    },
  };
});

app.register(leadsRoutes, { prefix: "/api/leads" });
app.register(crmRoutes, { prefix: "/api/crm" });
app.register(outreachRoutes, { prefix: "/api/outreach" });
app.register(campaignsRoutes, { prefix: "/api/campaigns" });
app.register(agentsRoutes, { prefix: "/api/agents" });
app.register(analyticsRoutes, { prefix: "/api/analytics" });
app.register(settingsRoutes, { prefix: "/api/settings" });

const httpServer = createServer(app.server);
const gateway = initStreamGateway(httpServer);

app.decorate("gateway", gateway);

async function start() {
  try {
    const port = parseInt(process.env.PORT ?? "3001");

    await app.ready();

    createWorkers();

    await new Promise<void>((resolve) => {
      httpServer.listen({ port, host: "0.0.0.0" }, () => {
        resolve();
      });
    });

    console.log(`AIOS API server running on http://0.0.0.0:${port}`);
    console.log(`WebSocket server ready`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
