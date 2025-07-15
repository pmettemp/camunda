const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const { Camunda8 } = require('@camunda8/sdk');

const app = express();
const PORT = 3005; // Use a different port to avoid conflicts

// CORS Middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-user-id, x-user-name, x-user-role');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Middleware
app.use(express.json());

// Initialize Camunda
const camunda = new Camunda8();
const zeebe = camunda.getZeebeGrpcApiClient();

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Create policy endpoint
app.post('/api/policies', async (req, res) => {
  try {
    const policyData = req.body;
    
    // Start a process instance
    const processInstance = await zeebe.createProcessInstance({
      bpmnProcessId: 'policy-management-process',
      variables: {
        policyData,
        policyAuthor: policyData.authorId || 'system'
      }
    });
    
    res.json({
      id: `POL-${Date.now()}`,
      title: policyData.title,
      status: 'Created',
      processInstanceId: processInstance.processInstanceKey,
      message: 'Policy created successfully'
    });
  } catch (error) {
    console.error('Error creating policy:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Simple test server running on port ${PORT}`);
  console.log(`Try: http://localhost:${PORT}/api/health`);
});
