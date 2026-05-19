import { Queue, Worker, Job, QueueEvents } from "bullmq";
import { redis } from "./redis";

const connection = {
  connection: redis,
};

export const leadResearchQueue = new Queue("lead-research-queue", connection);
export const emailSendQueue = new Queue("email-send-queue", {
  ...connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    rateLimiter: {
      max: 50,
      duration: 3600000,
    },
  },
});
export const followUpQueue = new Queue("follow-up-queue", connection);
export const crmSyncQueue = new Queue("crm-sync-queue", connection);
export const imapPollingQueue = new Queue("imap-polling-queue", {
  ...connection,
  defaultJobOptions: {
    repeat: {
      every: 300000,
    },
  },
});
export const reflectionQueue = new Queue("reflection-queue", {
  ...connection,
  defaultJobOptions: {
    repeat: {
      cron: "0 2 * * *",
    },
  },
});

export type LeadResearchJob = Job<{ leadId: string; domain: string }>;
export type EmailSendJob = Job<{ emailId: string; contactId: string; campaignId: string }>;
export type FollowUpJob = Job<{ dealId: string; sequenceStep: number }>;
export type CrmSyncJob = Job<{ dealId: string; newStage: string }>;

export function createWorkers() {
  const leadResearchWorker = new Worker(
    "lead-research-queue",
    async (job: LeadResearchJob) => {
      console.log(`Processing lead research for ${job.data.leadId}`);
      const orchestratorUrl = process.env.ORCHESTRATOR_URL ?? "http://localhost:8001";
      const response = await fetch(`${orchestratorUrl}/run/research`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead_id: job.data.leadId, domain: job.data.domain }),
      });
      if (!response.ok) {
        throw new Error(`Orchestrator returned ${response.status}`);
      }
      return response.json();
    },
    { connection: redis, concurrency: 5 }
  );

  const emailSendWorker = new Worker(
    "email-send-queue",
    async (job: EmailSendJob) => {
      console.log(`Sending email ${job.data.emailId}`);
      const { EmailService } = await import("../services/email.service");
      const emailService = new EmailService();
      return emailService.sendOutreachEmail(job.data.emailId);
    },
    { connection: redis, concurrency: 10 }
  );

  const followUpWorker = new Worker(
    "follow-up-queue",
    async (job: FollowUpJob) => {
      console.log(`Processing follow-up for deal ${job.data.dealId}`);
      const orchestratorUrl = process.env.ORCHESTRATOR_URL ?? "http://localhost:8001";
      const response = await fetch(`${orchestratorUrl}/run/follow-up`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deal_id: job.data.dealId, sequence_step: job.data.sequenceStep }),
      });
      if (!response.ok) {
        throw new Error(`Orchestrator returned ${response.status}`);
      }
      return response.json();
    },
    { connection: redis, concurrency: 3 }
  );

  const crmSyncWorker = new Worker(
    "crm-sync-queue",
    async (job: CrmSyncJob) => {
      console.log(`Syncing CRM deal ${job.data.dealId} to ${job.data.newStage}`);
      const { CrmService } = await import("../services/crm.service");
      const crmService = new CrmService();
      return crmService.updateDealStage(job.data.dealId, job.data.newStage);
    },
    { connection: redis, concurrency: 5 }
  );

  const imapPollingWorker = new Worker(
    "imap-polling-queue",
    async () => {
      console.log("Polling IMAP for new emails");
      const { EmailService } = await import("../services/email.service");
      const emailService = new EmailService();
      return emailService.pollInbox();
    },
    { connection: redis, concurrency: 1 }
  );

  const reflectionWorker = new Worker(
    "reflection-queue",
    async () => {
      console.log("Running nightly reflection");
      const orchestratorUrl = process.env.ORCHESTRATOR_URL ?? "http://localhost:8001";
      const response = await fetch(`${orchestratorUrl}/run/reflect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date_range: "7d" }),
      });
      if (!response.ok) {
        throw new Error(`Orchestrator returned ${response.status}`);
      }
      return response.json();
    },
    { connection: redis, concurrency: 1 }
  );

  return {
    leadResearchWorker,
    emailSendWorker,
    followUpWorker,
    crmSyncWorker,
    imapPollingWorker,
    reflectionWorker,
  };
}
