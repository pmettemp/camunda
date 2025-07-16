const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Joi = require('joi');
const databaseService = process.env.DB_TYPE === 'sqlite'
  ? require('../config/database-sqlite')
  : require('../config/database');
const logger = require('../config/logger');

// Validation schemas
const userSchema = Joi.object({
  username: Joi.string().required().min(3).max(50),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(100),
  firstName: Joi.string().required().min(1).max(100),
  lastName: Joi.string().required().min(1).max(100),
  role: Joi.string().required().valid('author', 'reviewer', 'admin', 'legal-team', 'compliance-team', 'department-manager', 'senior-manager'),
  department: Joi.string().allow('').max(100),
  isActive: Joi.boolean().default(true)
});

const updateUserSchema = userSchema.fork(['password'], (schema) => schema.optional());

// Get all users
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, role, department, isActive } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (role) {
      whereClause += ' AND role = ?';
      params.push(role);
    }

    if (department) {
      whereClause += ' AND department = ?';
      params.push(department);
    }

    if (isActive !== undefined) {
      whereClause += ' AND is_active = ?';
      params.push(isActive === 'true' ? 1 : 0);
    }

    const countQuery = `SELECT COUNT(*) as total FROM users ${whereClause}`;
    const dataQuery = `
      SELECT id, username, email, first_name as firstName, last_name as lastName, 
             role, department, is_active as isActive, created_at as createdAt, 
             updated_at as updatedAt
      FROM users ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;

    const [countResult] = await databaseService.query(countQuery, params);
    const users = await databaseService.query(dataQuery, [...params, parseInt(limit), offset]);

    res.json({
      success: true,
      data: {
        users,
        total: countResult.total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countResult.total / limit)
      }
    });

  } catch (error) {
    logger.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const users = await databaseService.query(`
      SELECT id, username, email, first_name as firstName, last_name as lastName, 
             role, department, is_active as isActive, created_at as createdAt, 
             updated_at as updatedAt
      FROM users 
      WHERE id = ?
    `, [id]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: users[0]
    });

  } catch (error) {
    logger.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create new user
router.post('/', async (req, res) => {
  try {
    // Validate input
    const { error, value } = userSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: error.details
      });
    }

    const { username, email, password, firstName, lastName, role, department, isActive } = value;

    // Check if username or email already exists
    const existingUsers = await databaseService.query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Username or email already exists'
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate user ID
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Insert user
    await databaseService.query(`
      INSERT INTO users (id, username, email, password_hash, first_name, last_name, role, department, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [userId, username, email, passwordHash, firstName, lastName, role, department || null, isActive ? 1 : 0]);

    // Create audit log
    await databaseService.query(`
      INSERT INTO audit_logs (action, user_name, details)
      VALUES (?, ?, ?)
    `, [
      'user_created',
      req.user?.name || 'System',
      JSON.stringify({ userId, username, email, role })
    ]);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { id: userId }
    });

  } catch (error) {
    logger.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate input
    const { error, value } = updateUserSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: error.details
      });
    }

    // Check if user exists
    const existingUsers = await databaseService.query('SELECT id FROM users WHERE id = ?', [id]);
    if (existingUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { username, email, password, firstName, lastName, role, department, isActive } = value;

    // Check if username or email already exists (excluding current user)
    if (username || email) {
      const duplicateUsers = await databaseService.query(
        'SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?',
        [username || '', email || '', id]
      );

      if (duplicateUsers.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Username or email already exists'
        });
      }
    }

    // Build update query
    const updateFields = [];
    const updateValues = [];

    if (username) {
      updateFields.push('username = ?');
      updateValues.push(username);
    }
    if (email) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    if (password) {
      updateFields.push('password_hash = ?');
      updateValues.push(await bcrypt.hash(password, 10));
    }
    if (firstName) {
      updateFields.push('first_name = ?');
      updateValues.push(firstName);
    }
    if (lastName) {
      updateFields.push('last_name = ?');
      updateValues.push(lastName);
    }
    if (role) {
      updateFields.push('role = ?');
      updateValues.push(role);
    }
    if (department !== undefined) {
      updateFields.push('department = ?');
      updateValues.push(department || null);
    }
    if (isActive !== undefined) {
      updateFields.push('is_active = ?');
      updateValues.push(isActive ? 1 : 0);
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(id);

    await databaseService.query(`
      UPDATE users 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `, updateValues);

    // Create audit log
    await databaseService.query(`
      INSERT INTO audit_logs (action, user_name, details)
      VALUES (?, ?, ?)
    `, [
      'user_updated',
      req.user?.name || 'System',
      JSON.stringify({ userId: id, updatedFields: Object.keys(value) })
    ]);

    res.json({
      success: true,
      message: 'User updated successfully'
    });

  } catch (error) {
    logger.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const existingUsers = await databaseService.query('SELECT username FROM users WHERE id = ?', [id]);
    if (existingUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const username = existingUsers[0].username;

    // Check if user has associated policies
    const userPolicies = await databaseService.query('SELECT COUNT(*) as count FROM policies WHERE author_id = ?', [id]);
    if (userPolicies[0].count > 0) {
      return res.status(409).json({
        success: false,
        message: 'Cannot delete user with associated policies'
      });
    }

    // Delete user
    await databaseService.query('DELETE FROM users WHERE id = ?', [id]);

    // Create audit log
    await databaseService.query(`
      INSERT INTO audit_logs (action, user_name, details)
      VALUES (?, ?, ?)
    `, [
      'user_deleted',
      req.user?.name || 'System',
      JSON.stringify({ userId: id, username })
    ]);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    logger.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await databaseService.query(`
      SELECT 
        COUNT(*) as totalUsers,
        COUNT(CASE WHEN is_active = 1 THEN 1 END) as activeUsers,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as adminUsers,
        COUNT(CASE WHEN role IN ('legal-team', 'compliance-team') THEN 1 END) as reviewers
      FROM users
    `);

    const roleDistribution = await databaseService.query(`
      SELECT role, COUNT(*) as count
      FROM users
      GROUP BY role
      ORDER BY count DESC
    `);

    const departmentDistribution = await databaseService.query(`
      SELECT department, COUNT(*) as count
      FROM users
      WHERE department IS NOT NULL
      GROUP BY department
      ORDER BY count DESC
    `);

    res.json({
      success: true,
      data: {
        overview: stats[0],
        roleDistribution,
        departmentDistribution
      }
    });

  } catch (error) {
    logger.error('Error fetching user statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
