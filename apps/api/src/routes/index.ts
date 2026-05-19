import { FastifyInstance } from "fastify";
import { authRoutes } from "./auth";
import { leadsRoutes } from "./leads";
import { contactsRoutes } from "./contacts";
import { crmRoutes } from "./crm";
import { campaignsRoutes } from "./campaigns";
import { outreachRoutes } from "./outreach";
import { agentsRoutes } from "./agents";
import { analyticsRoutes } from "./analytics";
import { settingsRoutes } from "./settings";

export const registerRoutes = (app: FastifyInstance) => {
  // Register all route modules
  app.register(authRoutes, { prefix: "/auth" });
  app.register(leadsRoutes, { prefix: "/leads" });
  app.register(contactsRoutes, { prefix: "/contacts" });
  app.register(crmRoutes, { prefix: "/crm" });
  app.register(campaignsRoutes, { prefix: "/campaigns" });
  app.register(outreachRoutes, { prefix: "/outreach" });
  app.register(agentsRoutes, { prefix: "/agents" });
  app.register(analyticsRoutes, { prefix: "/analytics" });
  app.register(settingsRoutes, { prefix: "/settings" });
};
