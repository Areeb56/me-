import { Processor, Process, OnQueueActive, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { LeadsService } from '../leads/leads.service';
import { EmailService } from '../services/email.service';

@Processor('follow-up')
export class FollowUpJob {
  private logger = new Logger(FollowUpJob.name);

  constructor(
    private leadsService: LeadsService,
    private emailService: EmailService,
  ) {}

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.log(`Processing follow-up job ${job.id}`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job) {
    this.logger.log(`Completed follow-up job ${job.id}`);
  }

  @OnQueueFailed()
  onFailed(job: Job, error: any) {
    this.logger.error(`Failed follow-up job ${job.id}:`, error);
  }

  @Process()
  async process(job: Job) {
    const { leadId, followUpType } = job.data;
    this.logger.log(`Processing follow-up for lead ${leadId}, type: ${followUpType}`);

    // Fetch lead details
    const lead = await this.leadsService.findOne(leadId);
    if (!lead) {
      throw new Error(`Lead not found: ${leadId}`);
    }

    // Determine follow-up action based on type
    let result;
    switch (followUpType) {
      case 'email':
        // Send a follow-up email
        result = await this.emailService.sendFollowUpEmail(lead);
        break;
      case 'call':
        // Log a call task (in a real system, this might create a task in a CRM)
        result = { action: 'call_scheduled', leadId };
        break;
      case 'meeting':
        // Schedule a meeting
        result = { action: 'meeting_scheduled', leadId };
        break;
      default:
        throw new Error(`Unknown follow-up type: ${followUpType}`);
    }

    // Update lead with follow-up information
    await this.leadsService.update(leadId, {
      ...lead,
      lastFollowUp: new Date(),
      followUpType,
      followUpResult: result,
    });

    return { leadId, followUpType, result };
  }
}
