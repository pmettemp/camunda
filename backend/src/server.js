require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const logger = require('./config/logger');

// Use real Camunda service
const camundaService = require('./config/camunda');

const databaseService = process.env.DB_TYPE === 'sqlite'
  ? require('./config/database-sqlite')
  : require('./config/database');

// Import routes
const policiesRouter = require('./routes/policies');
const tasksRouter = require('./routes/tasks');
const dashboardRouter = require('./routes/dashboard');
const usersRouter = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

// Simple auth middleware (replace with proper JWT auth in production)
app.use((req, res, next) => {
  // Mock user for development
  req.user = {
    id: req.headers['x-user-id'] || 'user123',
    name: req.headers['x-user-name'] || 'Test User',
    role: req.headers['x-user-role'] || 'author'
  };
  next();
});

// Routes
app.use('/api/policies', policiesRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/users', usersRouter);

// Deployment endpoint
app.post('/api/deploy', async (req, res) => {
  try {
    const path = require('path');
    const { Camunda8 } = require('@camunda8/sdk');

    // Initialize Camunda 8 SDK
    const camunda = new Camunda8();
    const restClient = camunda.getCamundaRestClient();

    // Define file paths
    const bpmnPath = path.join(__dirname, '../../bpmn/policy-management.bpmn');
    const dmnPath = path.join(__dirname, '../../dmn/policy-approval-decision.dmn');

    // Deploy both BPMN and DMN files together
    const deployment = await restClient.deployResourcesFromFiles([bpmnPath, dmnPath]);

    res.json({
      success: true,
      message: 'Deployment successful',
      deployment
    });
  } catch (error) {
    logger.error('Deployment failed:', error);
    res.status(500).json({
      success: false,
      message: 'Deployment failed',
      error: error.message
    });
  }
});

// Health check
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await databaseService.query('SELECT 1');
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        camunda: 'connected'
      }
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Process instances endpoint
app.get('/api/processes', async (req, res) => {
  try {
    const instances = await camundaService.getProcessInstances();
    res.json({
      success: true,
      data: instances
    });
  } catch (error) {
    logger.error('Error fetching process instances:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  logger.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Initialize services and start server
async function startServer() {
  try {
    // Initialize database
    await databaseService.initialize();
    
    // Initialize Camunda
    await camundaService.initialize();
    
    // Setup service task handlers
    camundaService.setupServiceTaskHandlers();
    
    // Start server
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
    });
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await databaseService.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await databaseService.close();
  process.exit(0);
});

// Start the server
startServer();
