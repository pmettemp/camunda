require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Camunda8 } = require('@camunda8/sdk');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Initialize Camunda 8
let camunda8;
let zeebeClient;

async function initializeCamunda() {
  try {
    console.log('🔄 Initializing Camunda 8 SDK...');
    camunda8 = new Camunda8();
    zeebeClient = camunda8.getZeebeGrpcApiClient();
    console.log('✅ Camunda 8 SDK initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Camunda 8 SDK:', error.message);
    return false;
  }
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    camunda: camunda8 ? 'connected' : 'disconnected'
  });
});

// Create policy endpoint with Camunda integration
app.post('/api/policies', async (req, res) => {
  console.log('📝 Policy creation request:', req.body);
  
  try {
    const policyData = {
      id: Date.now(),
      ...req.body,
      status: 'draft',
      createdAt: new Date().toISOString()
    };

    let processInstanceKey = null;
    
    // Try to start Camunda workflow if available
    if (zeebeClient) {
      try {
        console.log('🚀 Starting Camunda workflow...');
        const processInstance = await zeebeClient.createProcessInstance({
          bpmnProcessId: 'policy-management-process',
          variables: {
            policyData: policyData,
            policyAuthor: req.headers['x-user-name'] || 'Unknown User'
          }
        });
        
        processInstanceKey = processInstance.processInstanceKey;
        console.log('✅ Camunda workflow started:', processInstanceKey);
        
      } catch (camundaError) {
        console.warn('⚠️ Camunda workflow failed, continuing without workflow:', camundaError.message);
      }
    }
    
    res.status(201).json({
      success: true,
      message: 'Policy created successfully',
      policy: policyData,
      processInstanceKey: processInstanceKey,
      workflowStarted: !!processInstanceKey
    });
    
  } catch (error) {
    console.error('❌ Error creating policy:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create policy',
      error: error.message
    });
  }
});

// Get policies endpoint
app.get('/api/policies', (req, res) => {
  console.log('📋 Get policies requested');
  res.json({
    success: true,
    policies: []
  });
});

// Get tasks endpoint
app.get('/api/tasks', async (req, res) => {
  console.log('📋 Get tasks requested');
  
  let tasks = [];
  
  // Try to get tasks from Camunda if available
  if (zeebeClient) {
    try {
      // This is a placeholder - actual task retrieval would need Operate API
      console.log('🔍 Would fetch tasks from Camunda Operate...');
    } catch (error) {
      console.warn('⚠️ Failed to fetch tasks from Camunda:', error.message);
    }
  }
  
  res.json({
    success: true,
    tasks: tasks
  });
});

// Start server
async function startServer() {
  console.log('🚀 Starting Policy Management Backend...');
  
  // Initialize Camunda (optional - server will work without it)
  await initializeCamunda();
  
  app.listen(PORT, () => {
    console.log(`🌐 Server running on port ${PORT}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📝 Create policy: POST http://localhost:${PORT}/api/policies`);
    console.log('');
    if (camunda8) {
      console.log('✅ Camunda 8 integration: ENABLED');
    } else {
      console.log('⚠️ Camunda 8 integration: DISABLED (server will work in mock mode)');
    }
  });
}

startServer().catch(error => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});
