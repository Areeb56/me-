import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
const { Pool } = pkg;
import * as schema from "./src/db/schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ?? "postgresql://aios_user:aios_password_local@localhost:5432/aios",
});

const db = drizzle(pool, { schema });

async function seed() {
  console.log("Seeding database...");

  const [lead1] = await db
    .insert(schema.leads)
    .values({
      companyName: "Acme Corp",
      domain: "acmecorp.com",
      industry: "SaaS",
      employeeCount: 150,
      score: 85,
      status: "qualified",
      source: "manual",
      painPoints: ["Manual data entry", "Slow customer response times"],
      aiOpportunities: ["AI-powered chatbot", "Automated data processing"],
    })
    .returning();

  const [lead2] = await db
    .insert(schema.leads)
    .values({
      companyName: "TechStart Inc",
      domain: "techstart.io",
      industry: "Fintech",
      employeeCount: 50,
      score: 72,
      status: "new",
      source: "linkedin",
    })
    .returning();

  const [lead3] = await db
    .insert(schema.leads)
    .values({
      companyName: "DataFlow Systems",
      domain: "dataflow.com",
      industry: "Analytics",
      employeeCount: 300,
      score: 91,
      status: "qualified",
      source: "apollo",
      painPoints: ["Data silos", "Reporting bottlenecks"],
      aiOpportunities: ["Unified data platform", "Automated reporting"],
    })
    .returning();

  const [contact1] = await db
    .insert(schema.contacts)
    .values({
      leadId: lead1.id,
      firstName: "John",
      lastName: "Smith",
      email: "john@acmecorp.com",
      title: "VP of Sales",
    })
    .returning();

  const [contact2] = await db
    .insert(schema.contacts)
    .values({
      leadId: lead3.id,
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah@dataflow.com",
      title: "CTO",
    })
    .returning();

  await db.insert(schema.crmDeals).values([
    {
      leadId: lead1.id,
      contactId: contact1.id,
      stage: "contacted",
      value: "12000",
      nextFollowUpAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
    {
      leadId: lead3.id,
      contactId: contact2.id,
      stage: "meeting_booked",
      value: "25000",
      nextFollowUpAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  ]);

  await db.insert(schema.campaigns).values({
    name: "SaaS Outreach Q1",
    targetIndustry: "SaaS",
    targetCompanySize: "50-500",
    valueProposition: "AI-powered automation for scaling teams",
    sequenceConfig: {
      steps: [
        { step_number: 1, type: "email", template: "initial_outreach", delay_days: 0 },
        { step_number: 2, type: "email", template: "follow_up_1", delay_days: 3 },
        { step_number: 3, type: "email", template: "follow_up_2", delay_days: 7 },
        { step_number: 4, type: "email", template: "breakup", delay_days: 14 },
      ],
    },
    status: "active",
  });

  console.log("Seed data inserted successfully.");
  await pool.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
