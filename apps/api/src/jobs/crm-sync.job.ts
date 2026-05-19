import { Processor, Process, OnQueueActive, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { LeadsService } from '../leads/leads.service';
import { CrmService } from '../crm/crm.service';

@Processor('crm-sync')
export class CrmSyncJob {
  private logger = new Logger(CrmSyncJob.name);

  constructor(
    private leadsService: LeadsService,
    private crmService: CrmService,
  ) {}

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.log(`Processing CRM sync job ${job.id}`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job) {
    this.logger.log(`Completed CRM sync job ${job.id}`);
  }

  @OnQueueFailed()
  onFailed(job: Job, error: any) {
    this.logger.error(`Failed CRM sync job ${job.id}:`, error);
  }

  @Process()
  async process(job: Job) {
    const { leadId, syncDirection } = job.data;
    this.logger.log(`Syncing lead ${leadId} with CRM, direction: ${syncDirection}`);

    // Fetch lead details
    const lead = await this.leadsService.findOne(leadId);
    if (!lead) {
      throw new Error(`Lead not found: ${leadId}`);
    }

    let result;
    if (syncDirection === 'to_crm' || syncDirection === 'bidirectional') {
      // Push lead to CRM
      result = await this.crmService.createOrUpdateLead(lead);
    }
    if (syncDirection === 'from_crm' || syncDirection === 'bidirectional') {
      // Pull lead from CRM (if needed)
      // This would typically involve checking for updates in the CRM
      // For simplicity, we assume the lead is the source of truth
      // In a real system, you might compare timestamps
    }

    // Update lead with last sync timestamp
    await this.leadsService.update(leadId, {
      ...lead,
      lastCrmSync: new Date(),
      crmSyncStatus: 'synced',
    });

    return { leadId, syncDirection, result };
  }
}
