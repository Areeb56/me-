import { Processor, Process, OnQueueActive, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { LeadsService } from '../leads/leads.service';
import { OpenAIService } from '../shared/openai.service';

@Processor('lead-research')
export class LeadResearchJob {
  private logger = new Logger(LeadResearchJob.name);

  constructor(
    private leadsService: LeadsService,
    private openAIService: OpenAIService,
  ) {}

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.log(`Processing lead research job ${job.id}`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job) {
    this.logger.log(`Completed lead research job ${job.id}`);
  }

  @OnQueueFailed()
  onFailed(job: Job, error: any) {
    this.logger.error(`Failed lead research job ${job.id}:`, error);
  }

  @Process()
  async process(job: Job) {
    const { leadId } = job.data;
    this.logger.log(`Starting research for lead ${leadId}`);

    // Fetch lead details
    const lead = await this.leadsService.findOne(leadId);
    if (!lead) {
      throw new Error(`Lead not found: ${leadId}`);
    }

    // Use OpenAI to research the lead
    const research = await this.openAIService.researchLead(lead);

    // Update lead with research data
    await this.leadsService.update(leadId, {
      ...lead,
      researchData: research,
      status: 'researched',
    });

    return { leadId, research };
  }
}
