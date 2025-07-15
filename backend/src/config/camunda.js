const { Camunda8 } = require('@camunda8/sdk');
const logger = require('./logger');

class CamundaService {
  constructor() {
    this.camunda = null;
    this.zeebe = null;
  }

  async initialize() {
    try {
      // Initialize Camunda 8 SDK - it will read from environment variables automatically
      this.camunda = new Camunda8();

      // Get Zeebe client
      this.zeebe = this.camunda.getZeebeGrpcApiClient();

      logger.info('Camunda 8 SDK initialized successfully');
      return true;
    } catch (error) {
      logger.error('Failed to initialize Camunda 8 SDK:', error);
      throw error;
    }
  }

  async deployProcess(bpmnPath, dmnPath) {
    try {
      const deployment = await this.zeebe.deployResource({
        processFilename: bpmnPath,
        decisionFilename: dmnPath
      });

      logger.info('Process deployed successfully:', deployment);
      return deployment;
    } catch (error) {
      logger.error('Failed to deploy process:', error);
      throw error;
    }
  }

  async startProcessInstance(processId, variables = {}) {
    try {
      const instance = await this.zeebe.createProcessInstance({
        bpmnProcessId: processId,
        variables
      });

      logger.info('Process instance started:', instance);
      return instance;
    } catch (error) {
      logger.error('Failed to start process instance:', error);
      throw error;
    }
  }

  async completeTask(jobKey, variables = {}) {
    try {
      await this.zeebe.completeJob({
        jobKey,
        variables
      });
      
      logger.info('Task completed:', jobKey);
      return true;
    } catch (error) {
      logger.error('Failed to complete task:', error);
      throw error;
    }
  }

  async getActiveTasks(assignee = null) {
    try {
      // For now, return empty array as we'll implement task management differently
      // In a real implementation, you'd use Tasklist API or Operate API
      logger.info('Getting active tasks - using simplified implementation');
      return [];
    } catch (error) {
      logger.error('Failed to get active tasks:', error);
      throw error;
    }
  }

  async getProcessInstances(processDefinitionKey = null) {
    try {
      // For now, return empty array as we'll implement this differently
      // In a real implementation, you'd use Operate API
      logger.info('Getting process instances - using simplified implementation');
      return [];
    } catch (error) {
      logger.error('Failed to get process instances:', error);
      throw error;
    }
  }

  async claimTask(taskId, assignee) {
    try {
      logger.info(`Task ${taskId} claimed by ${assignee} - simplified implementation`);
      return true;
    } catch (error) {
      logger.error('Failed to claim task:', error);
      throw error;
    }
  }

  async unclaimTask(taskId) {
    try {
      logger.info(`Task ${taskId} unclaimed - simplified implementation`);
      return true;
    } catch (error) {
      logger.error('Failed to unclaim task:', error);
      throw error;
    }
  }

  // Service task handlers
  setupServiceTaskHandlers() {
    if (!this.zeebe) {
      logger.warn('Zeebe client not available, skipping service task handlers');
      return;
    }

    // Publish Policy Handler
    this.zeebe.createWorker({
      taskType: 'publish-policy',
      taskHandler: async (job) => {
        try {
          const { policyData } = job.variables;

          // Simulate policy publishing logic
          logger.info('Publishing policy:', policyData.title);

          // Here you would:
          // 1. Generate PDF
          // 2. Update database status
          // 3. Upload to intranet
          // 4. Create audit log entry

          const publishResult = {
            publishedAt: new Date().toISOString(),
            policyId: policyData.id,
            status: 'published',
            pdfUrl: `/policies/${policyData.id}/document.pdf`,
            intranetUrl: `/intranet/policies/${policyData.id}`
          };

          return job.complete(publishResult);
        } catch (error) {
          logger.error('Failed to publish policy:', error);
          return job.fail('Failed to publish policy');
        }
      }
    });

    // Notify Stakeholders Handler
    this.zeebe.createWorker({
      taskType: 'notify-stakeholders',
      taskHandler: async (job) => {
        try {
          const { policyData } = job.variables;
          
          logger.info('Notifying stakeholders for policy:', policyData.title);
          
          // Here you would:
          // 1. Send emails to stakeholders
          // 2. Create notifications in system
          // 3. Update audit trail
          
          const notificationResult = {
            notifiedAt: new Date().toISOString(),
            stakeholdersNotified: policyData.stakeholders || [],
            notificationMethod: 'email'
          };
          
          return job.complete(notificationResult);
        } catch (error) {
          logger.error('Failed to notify stakeholders:', error);
          return job.fail('Failed to notify stakeholders');
        }
      }
    });

    // Notify Rejection Handler
    this.zeebe.createWorker({
      taskType: 'notify-rejection',
      taskHandler: async (job) => {
        try {
          const { policyData, reviewComments } = job.variables;
          
          logger.info('Notifying policy rejection:', policyData.title);
          
          // Here you would:
          // 1. Send rejection email to author
          // 2. Update policy status in database
          // 3. Create audit log entry
          
          const rejectionResult = {
            rejectedAt: new Date().toISOString(),
            authorNotified: true,
            rejectionReason: reviewComments
          };
          
          return job.complete(rejectionResult);
        } catch (error) {
          logger.error('Failed to notify rejection:', error);
          return job.fail('Failed to notify rejection');
        }
      }
    });

    logger.info('Service task handlers registered');
  }
}

module.exports = new CamundaService();
