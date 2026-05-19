import { Processor, Process, OnQueueActive, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { EmailService } from '../services/email.service';
import { LeadsService } from '../leads/leads.service';

@Processor('email-send')
export class EmailSendJob {
  private logger = new Logger(EmailSendJob.name);

  constructor(
    private emailService: EmailService,
    private leadsService: LeadsService,
  ) {}

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.log(`Processing email send job ${job.id}`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job) {
    this.logger.log(`Completed email send job ${job.id}`);
  }

  @OnQueueFailed()
  onFailed(job: Job, error: any) {
    this.logger.error(`Failed email send job ${job.id}:`, error);
  }

  @Process()
  async process(job: Job) {
    const { leadId, emailTemplate, recipient } = job.data;
    this.logger.log(`Sending email to lead ${leadId}`);

    // Fetch lead details
    const lead = await this.leadsService.findOne(leadId);
    if (!lead) {
      throw new Error(`Lead not found: ${leadId}`);
    }

    // Send email
    const result = await this.emailService.sendEmail({
      to: recipient || lead.email,
      subject: emailTemplate.subject,
      body: emailTemplate.body,
    });

    // Update lead with email sent timestamp
    await this.leadsService.update(leadId, {
      ...lead,
      lastEmailSent: new Date(),
      emailStatus: 'sent',
    });

    return { leadId, emailSent: result };
  }
}
