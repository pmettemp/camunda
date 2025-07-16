const express = require('express');
const router = express.Router();
const databaseService = process.env.DB_TYPE === 'sqlite'
  ? require('../config/database-sqlite')
  : require('../config/database');
const camundaService = require('../config/camunda');
const logger = require('../config/logger');

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    // Get policy statistics
    const policyStats = await databaseService.query(`
      SELECT 
        COUNT(*) as totalPolicies,
        COUNT(CASE WHEN status = 'under_review' THEN 1 END) as pendingReviews,
        COUNT(CASE WHEN status = 'published' AND DATE(created_at) >= DATE('now', '-30 days') THEN 1 END) as publishedThisMonth,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approvedPolicies,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejectedPolicies
      FROM policies
    `);

    // Get task statistics
    let taskStats = { activeTasks: 0, completedTasks: 0 };
    try {
      const tasks = await camundaService.getActiveTasks();
      taskStats.activeTasks = tasks.length;
    } catch (error) {
      logger.warn('Failed to fetch task statistics from Camunda:', error.message);
    }

    // Get process statistics
    let processStats = { activeProcesses: 0, completedProcesses: 0 };
    try {
      const processes = await camundaService.getProcessInstances();
      processStats.activeProcesses = processes.filter(p => p.state === 'ACTIVE').length;
      processStats.completedProcesses = processes.filter(p => p.state === 'COMPLETED').length;
    } catch (error) {
      logger.warn('Failed to fetch process statistics from Camunda:', error.message);
    }

    // Calculate trends (simplified - in production, you'd compare with previous periods)
    const stats = policyStats[0];
    const policiesTrend = Math.floor(Math.random() * 20) - 10; // Mock trend
    const publishedTrend = Math.floor(Math.random() * 30) - 15; // Mock trend

    res.json({
      success: true,
      data: {
        ...stats,
        ...taskStats,
        ...processStats,
        policiesTrend,
        publishedTrend
      }
    });

  } catch (error) {
    logger.error('Error fetching dashboard statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get recent activities
router.get('/activities', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const activities = await databaseService.query(`
      SELECT 
        id,
        action,
        user_name as userName,
        policy_id as policyId,
        details,
        created_at as createdAt
      FROM audit_logs
      ORDER BY created_at DESC
      LIMIT ?
    `, [parseInt(limit)]);

    // Parse details JSON
    const formattedActivities = activities.map(activity => ({
      ...activity,
      details: activity.details ? JSON.parse(activity.details) : {},
      description: generateActivityDescription(activity)
    }));

    res.json({
      success: true,
      data: formattedActivities
    });

  } catch (error) {
    logger.error('Error fetching recent activities:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Helper function to generate activity descriptions
function generateActivityDescription(activity) {
  const { action, userName, details } = activity;
  
  switch (action) {
    case 'created':
      return `${userName} created a new policy`;
    case 'updated':
      return `${userName} updated policy details`;
    case 'approved':
      return `${userName} approved a policy`;
    case 'rejected':
      return `${userName} rejected a policy`;
    case 'published':
      return `${userName} published a policy`;
    case 'archived':
      return `${userName} archived a policy`;
    case 'task_completed':
      return `${userName} completed a review task`;
    case 'task_claimed':
      return `${userName} claimed a review task`;
    default:
      return `${userName} performed ${action}`;
  }
}

// Get policy metrics by category
router.get('/metrics/categories', async (req, res) => {
  try {
    const categoryMetrics = await databaseService.query(`
      SELECT 
        category,
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'published' THEN 1 END) as published,
        COUNT(CASE WHEN status = 'under_review' THEN 1 END) as underReview,
        COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft
      FROM policies
      GROUP BY category
      ORDER BY total DESC
    `);

    res.json({
      success: true,
      data: categoryMetrics
    });

  } catch (error) {
    logger.error('Error fetching category metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get policy metrics by risk level
router.get('/metrics/risk-levels', async (req, res) => {
  try {
    const riskMetrics = await databaseService.query(`
      SELECT 
        risk_level as riskLevel,
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'published' THEN 1 END) as published,
        COUNT(CASE WHEN status = 'under_review' THEN 1 END) as underReview
      FROM policies
      GROUP BY risk_level
      ORDER BY 
        CASE risk_level 
          WHEN 'Critical' THEN 1 
          WHEN 'High' THEN 2 
          WHEN 'Medium' THEN 3 
          WHEN 'Low' THEN 4 
        END
    `);

    res.json({
      success: true,
      data: riskMetrics
    });

  } catch (error) {
    logger.error('Error fetching risk level metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get workflow performance metrics
router.get('/metrics/workflow', async (req, res) => {
  try {
    // Get average processing times
    const processingTimes = await databaseService.query(`
      SELECT 
        AVG(JULIANDAY(updated_at) - JULIANDAY(created_at)) * 24 as avgHoursToProcess,
        COUNT(CASE WHEN status = 'published' AND (JULIANDAY(updated_at) - JULIANDAY(created_at)) * 24 <= 24 THEN 1 END) as processedWithin24h,
        COUNT(CASE WHEN status = 'published' THEN 1 END) as totalProcessed
      FROM policies
      WHERE status IN ('published', 'approved', 'rejected')
    `);

    // Get auto-approval rate (simplified calculation)
    const autoApprovalRate = await databaseService.query(`
      SELECT 
        COUNT(CASE WHEN risk_level = 'Low' AND status = 'published' THEN 1 END) as autoApproved,
        COUNT(*) as total
      FROM policies
      WHERE status IN ('published', 'approved')
    `);

    const metrics = {
      avgProcessingHours: Math.round(processingTimes[0]?.avgHoursToProcess || 0),
      processedWithin24h: processingTimes[0]?.processedWithin24h || 0,
      totalProcessed: processingTimes[0]?.totalProcessed || 0,
      autoApprovalRate: autoApprovalRate[0]?.total > 0 
        ? Math.round((autoApprovalRate[0].autoApproved / autoApprovalRate[0].total) * 100)
        : 0
    };

    res.json({
      success: true,
      data: metrics
    });

  } catch (error) {
    logger.error('Error fetching workflow metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
