const express = require('express');
const router = express.Router();
const Joi = require('joi');
const camundaService = require('../config/camunda');
const databaseService = process.env.DB_TYPE === 'sqlite'
  ? require('../config/database-sqlite')
  : require('../config/database');
const logger = require('../config/logger');

// Get tasks for current user
router.get('/', async (req, res) => {
  try {
    const { assignee, state = 'CREATED', page = 1, limit = 10 } = req.query;
    const userId = assignee || req.user?.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID required'
      });
    }

    const tasks = await camundaService.getActiveTasks(userId);

    // Enrich tasks with policy data
    const enrichedTasks = await Promise.all(
      tasks.map(async (task) => {
        try {
          // Get policy data from variables
          const variables = task.variables || {};
          const policyId = variables.policyData?.id;

          let policyInfo = null;
          if (policyId) {
            const policy = await databaseService.query(
              'SELECT id, title, category, status, author_name FROM policies WHERE id = ?',
              [policyId]
            );
            policyInfo = policy[0] || null;
          }

          return {
            ...task,
            policyInfo,
            formKey: task.formKey,
            assignee: task.assignee,
            created: task.creationTime,
            dueDate: task.dueDate
          };
        } catch (error) {
          logger.error('Error enriching task:', error);
          return task;
        }
      })
    );

    res.json({
      success: true,
      data: {
        tasks: enrichedTasks,
        total: enrichedTasks.length
      }
    });

  } catch (error) {
    logger.error('Error fetching tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get specific task details
router.get('/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;

    // Get task from Camunda
    const tasks = await camundaService.getActiveTasks();
    const task = tasks.find(t => t.id === taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Get policy data
    const variables = task.variables || {};
    const policyId = variables.policyData?.id;

    let policyData = null;
    if (policyId) {
      const policy = await databaseService.query(
        'SELECT * FROM policies WHERE id = ?',
        [policyId]
      );
      
      if (policy[0]) {
        policyData = {
          ...policy[0],
          stakeholders: JSON.parse(policy[0].stakeholders || '[]'),
          tags: JSON.parse(policy[0].tags || '[]')
        };
      }
    }

    res.json({
      success: true,
      data: {
        task,
        policyData,
        variables
      }
    });

  } catch (error) {
    logger.error('Error fetching task details:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Claim task
router.post('/:taskId/claim', async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user?.id || req.body.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID required'
      });
    }

    await camundaService.claimTask(taskId, userId);

    res.json({
      success: true,
      message: 'Task claimed successfully'
    });

  } catch (error) {
    logger.error('Error claiming task:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Unclaim task
router.post('/:taskId/unclaim', async (req, res) => {
  try {
    const { taskId } = req.params;

    await camundaService.unclaimTask(taskId);

    res.json({
      success: true,
      message: 'Task unclaimed successfully'
    });

  } catch (error) {
    logger.error('Error unclaiming task:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Complete task
router.post('/:taskId/complete', async (req, res) => {
  try {
    const { taskId } = req.params;
    const { variables = {}, action } = req.body;

    // Validate required fields based on task type
    if (action === 'review') {
      const reviewSchema = Joi.object({
        reviewDecision: Joi.string().required().valid('approved', 'rejected'),
        reviewComments: Joi.string().when('reviewDecision', {
          is: 'rejected',
          then: Joi.required(),
          otherwise: Joi.optional()
        }),
        reviewerName: Joi.string().required()
      });

      const { error } = reviewSchema.validate(variables);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          details: error.details
        });
      }
    }

    // Get task details first
    const tasks = await camundaService.getActiveTasks();
    const task = tasks.find(t => t.id === taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Complete the task
    await camundaService.completeTask(task.jobKey, variables);

    // Create audit log entry
    const taskVariables = task.variables || {};
    const policyId = taskVariables.policyData?.id;

    if (policyId) {
      await databaseService.query(
        `INSERT INTO audit_logs (policy_id, action, user_id, user_name, details, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          policyId,
          `task_completed_${task.taskDefinitionId}`,
          req.user?.id || 'system',
          req.user?.name || variables.reviewerName || 'System User',
          JSON.stringify({ taskId, variables, action }),
          new Date().toISOString()
        ]
      );

      // Update policy status if needed
      if (action === 'review' && variables.reviewDecision === 'approved') {
        await databaseService.query(
          'UPDATE policies SET status = ? WHERE id = ?',
          ['approved', policyId]
        );
      } else if (action === 'review' && variables.reviewDecision === 'rejected') {
        await databaseService.query(
          'UPDATE policies SET status = ? WHERE id = ?',
          ['rejected', policyId]
        );
      }
    }

    res.json({
      success: true,
      message: 'Task completed successfully'
    });

  } catch (error) {
    logger.error('Error completing task:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
