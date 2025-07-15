require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Camunda8 } = require('@camunda8/sdk');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Camunda 8 SDK
let camunda8;
let zeebeClient;

try {
  camunda8 = new Camunda8();
  zeebeClient = camunda8.getZeebeGrpcApiClient();
  console.log('✅ Camunda 8 SDK initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize Camunda 8 SDK:', error.message);
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      camunda: camunda8 ? 'connected' : 'disconnected'
    }
  });
});

// Test workflow endpoint
app.post('/test-workflow', async (req, res) => {
  try {
    console.log('🧪 Testing workflow deployment...');
    
    const testData = {
      title: 'Test Policy for Deployment Verification',
      content: 'This is a test to verify the process is deployed correctly.',
      category: 'IT',
      riskLevel: 'Low',
      effectiveDate: new Date('2024-01-01').toISOString(),
      expiryDate: new Date('2024-12-31').toISOString(),
      stakeholders: ['test@company.com']
    };

    // Try to start a process instance
    const processInstance = await zeebeClient.createProcessInstance({
      bpmnProcessId: 'policy-management-process',
      variables: {
        policyData: testData,
        policyAuthor: 'test-user'
      }
    });

    console.log('✅ Process instance started successfully!');
    console.log('Process Instance Key:', processInstance.processInstanceKey);

    res.json({
      success: true,
      message: 'Workflow test successful!',
      processInstanceKey: processInstance.processInstanceKey,
      testData
    });

  } catch (error) {
    console.error('❌ Workflow test failed:', error.message);
    
    let errorMessage = error.message;
    let suggestion = '';
    
    if (error.message.includes('404')) {
      suggestion = 'Process not deployed. Please verify deployment in Camunda Console/Operate.';
    } else if (error.message.includes('UNIMPLEMENTED')) {
      suggestion = 'Cluster connectivity issue. Check cluster status and credentials.';
    }
    
    res.status(500).json({
      success: false,
      error: errorMessage,
      suggestion,
      details: {
        processId: 'policy-management-process',
        clusterId: process.env.CAMUNDA_CLUSTER_ID
      }
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`📋 Test endpoint: http://localhost:${PORT}/test-workflow`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log('');
  console.log('💡 This server tests workflow deployment without starting workers');
  console.log('   to avoid the 404 polling errors.');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down test server...');
  if (zeebeClient) {
    await zeebeClient.close();
  }
  process.exit(0);
});
