const express = require('express');
const router = express.Router();
const Joi = require('joi');
const camundaService = require('../config/camunda');
const databaseService = process.env.DB_TYPE === 'sqlite'
  ? require('../config/database-sqlite')
  : require('../config/database');
const logger = require('../config/logger');

// Validation schemas
const policySchema = Joi.object({
  title: Joi.string().required().min(3).max(200),
  category: Joi.string().required().valid('HR', 'IT', 'Finance', 'Legal', 'Compliance', 'Operations', 'Security'),
  content: Joi.string().required().min(10),
  effectiveDate: Joi.string().required().custom((value, helpers) => {
    if (!value || value.trim() === '') {
      return helpers.error('any.invalid', { message: 'Effective date is required and cannot be empty' });
    }
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return helpers.error('any.invalid', { message: 'Effective date must be a valid date' });
    }
    return value;
  }),
  expiryDate: Joi.string().required().custom((value, helpers) => {
    if (!value || value.trim() === '') {
      return helpers.error('any.invalid', { message: 'Expiry date is required and cannot be empty' });
    }
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return helpers.error('any.invalid', { message: 'Expiry date must be a valid date' });
    }
    const effectiveDate = new Date(helpers.state.ancestors[0].effectiveDate);
    if (date <= effectiveDate) {
      return helpers.error('any.invalid', { message: 'Expiry date must be after effective date' });
    }
    return value;
  }),
  riskLevel: Joi.string().required().valid('Low', 'Medium', 'High', 'Critical'),
  requiresLegalReview: Joi.boolean().default(false),
  requiresComplianceReview: Joi.boolean().default(false),
  stakeholders: Joi.array().items(Joi.string().email()).default([]),
  tags: Joi.array().items(Joi.string()).default([])
});

// Create new policy
router.post('/', async (req, res) => {
  try {
    // Log the request body for debugging
    logger.info('Policy creation request body:', req.body);

    // Validate input
    const { error, value } = policySchema.validate(req.body);
    if (error) {
      logger.error('Validation error:', error.details);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: error.details
      });
    }

    const policyData = {
      ...value,
      id: `policy_${Date.now()}`,
      authorId: req.user?.id || 'system',
      authorName: req.user?.name || 'System User',
      createdAt: new Date().toISOString(),
      status: 'draft',
      version: 1,
      contentWordCount: value.content.split(/\s+/).length
    };

    // Save to database
    const insertQuery = `
      INSERT INTO policies (
        id, title, category, content, effective_date, expiry_date, 
        risk_level, requires_legal_review, requires_compliance_review,
        stakeholders, tags, author_id, author_name, status, version,
        content_word_count, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await databaseService.query(insertQuery, [
      policyData.id,
      policyData.title,
      policyData.category,
      policyData.content,
      policyData.effectiveDate,
      policyData.expiryDate,
      policyData.riskLevel,
      policyData.requiresLegalReview,
      policyData.requiresComplianceReview,
      JSON.stringify(policyData.stakeholders),
      JSON.stringify(policyData.tags),
      policyData.authorId,
      policyData.authorName,
      policyData.status,
      policyData.version,
      policyData.contentWordCount,
      policyData.createdAt
    ]);

    // Prepare data for Camunda (serialize dates)
    const camundaPolicyData = {
      ...policyData,
      effectiveDate: policyData.effectiveDate ? new Date(policyData.effectiveDate).toISOString() : null,
      expiryDate: policyData.expiryDate ? new Date(policyData.expiryDate).toISOString() : null,
      createdAt: policyData.createdAt ? new Date(policyData.createdAt).toISOString() : null
    };

    // Start Camunda process
    const processInstance = await camundaService.startProcessInstance(
      'policy-management-process',
      {
        policyData: camundaPolicyData,
        policyAuthor: policyData.authorId
      }
    );

    // Update policy with process instance ID
    await databaseService.query(
      'UPDATE policies SET process_instance_id = ? WHERE id = ?',
      [processInstance.processInstanceKey, policyData.id]
    );

    // Create audit log
    await databaseService.query(
      `INSERT INTO audit_logs (policy_id, action, user_id, user_name, details, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        policyData.id,
        'created',
        policyData.authorId,
        policyData.authorName,
        JSON.stringify({ processInstanceKey: processInstance.processInstanceKey }),
        new Date().toISOString()
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Policy created successfully',
      data: {
        policyId: policyData.id,
        processInstanceKey: processInstance.processInstanceKey,
        status: 'draft'
      }
    });

  } catch (error) {
    logger.error('Error creating policy:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get all policies
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category, author } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }

    if (category) {
      whereClause += ' AND category = ?';
      params.push(category);
    }

    if (author) {
      whereClause += ' AND author_id = ?';
      params.push(author);
    }

    const countQuery = `SELECT COUNT(*) as total FROM policies ${whereClause}`;
    const dataQuery = `
      SELECT id, title, category, status, risk_level, author_name, 
             created_at, effective_date, expiry_date, version
      FROM policies ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;

    const [countResult] = await databaseService.query(countQuery, params);
    const policies = await databaseService.query(dataQuery, [...params, parseInt(limit), offset]);

    res.json({
      success: true,
      data: {
        policies,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult.total,
          pages: Math.ceil(countResult.total / limit)
        }
      }
    });

  } catch (error) {
    logger.error('Error fetching policies:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get policy by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const policy = await databaseService.query(
      'SELECT * FROM policies WHERE id = ?',
      [id]
    );

    if (policy.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found'
      });
    }

    // Parse JSON fields
    const policyData = {
      ...policy[0],
      stakeholders: JSON.parse(policy[0].stakeholders || '[]'),
      tags: JSON.parse(policy[0].tags || '[]')
    };

    res.json({
      success: true,
      data: policyData
    });

  } catch (error) {
    logger.error('Error fetching policy:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get audit trail for policy
router.get('/:id/audit', async (req, res) => {
  try {
    const { id } = req.params;

    const auditLogs = await databaseService.query(
      `SELECT action, user_name, details, created_at
       FROM audit_logs
       WHERE policy_id = ?
       ORDER BY created_at DESC`,
      [id]
    );

    res.json({
      success: true,
      data: auditLogs.map(log => ({
        ...log,
        details: JSON.parse(log.details || '{}')
      }))
    });

  } catch (error) {
    logger.error('Error fetching audit trail:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
