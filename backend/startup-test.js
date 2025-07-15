const axios = require('axios');

async function startupTest() {
  console.log('🚀 Policy Management System - Startup Test');
  console.log('==========================================');
  console.log('');

  // Wait a moment for server to be ready
  console.log('⏳ Waiting for server to start...');
  await new Promise(resolve => setTimeout(resolve, 3000));

  try {
    // Test 1: Health Check
    console.log('🏥 Testing server health...');
    const healthResponse = await axios.get('http://localhost:3000/health');
    console.log('✅ Server is healthy!');
    console.log('   - Database:', healthResponse.data.services.database);
    console.log('   - Camunda:', healthResponse.data.services.camunda);
    console.log('');

    // Test 2: Create a Test Policy
    console.log('📝 Creating a test policy...');
    const policyResponse = await axios.post('http://localhost:3000/api/policies', {
      title: 'Startup Test Policy',
      content: 'This policy verifies that the Camunda 8 Cloud integration is working correctly after system restart.',
      category: 'IT',
      riskLevel: 'Medium',
      effectiveDate: '2024-01-01',
      expiryDate: '2024-12-31',
      stakeholders: ['it@company.com', 'compliance@company.com']
    });

    console.log('✅ Policy created successfully!');
    console.log('   - Policy ID:', policyResponse.data.id);
    console.log('   - Process Instance Key:', policyResponse.data.processInstanceKey);
    console.log('   - Status:', policyResponse.data.status);
    console.log('');

    // Test 3: Verify Policy in Database
    console.log('🗄️  Fetching policies from database...');
    const policiesResponse = await axios.get('http://localhost:3000/api/policies');
    console.log(`✅ Found ${policiesResponse.data.length} policies in database`);
    console.log('');

    // Success Summary
    console.log('🎉 STARTUP TEST SUCCESSFUL!');
    console.log('============================');
    console.log('');
    console.log('✅ Your Policy Management System is running with:');
    console.log('   - Real Camunda 8 Cloud integration');
    console.log('   - SQLite database');
    console.log('   - REST API endpoints');
    console.log('   - Workflow automation');
    console.log('');
    console.log('🔍 Next steps:');
    console.log('   1. Check Camunda Tasklist for new tasks');
    console.log('   2. Visit http://localhost:3000/health for server status');
    console.log('   3. Use the API endpoints to manage policies');
    console.log('');
    console.log('📚 Available endpoints:');
    console.log('   - GET  /health - Server health check');
    console.log('   - GET  /api/policies - List all policies');
    console.log('   - POST /api/policies - Create new policy');
    console.log('   - GET  /api/tasks - List workflow tasks');
    console.log('');
    console.log('🌐 Camunda Links:');
    console.log('   - Tasklist: https://tasklist.camunda.io/');
    console.log('   - Operate: https://operate.camunda.io/');
    console.log('   - Console: https://console.cloud.camunda.io/');

  } catch (error) {
    console.error('❌ Startup test failed!');
    console.error('');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('🔧 Server is not running. Please:');
      console.error('   1. Open terminal in backend folder');
      console.error('   2. Run: npm run dev');
      console.error('   3. Wait for "Server running on port 3000" message');
      console.error('   4. Run this test again');
    } else if (error.response?.status === 500) {
      console.error('🔧 Server error. Check:');
      console.error('   1. Environment variables in .env file');
      console.error('   2. Camunda Cloud cluster status');
      console.error('   3. Process deployment status');
      console.error('');
      console.error('Error details:', error.response.data);
    } else {
      console.error('🔧 Unexpected error:', error.message);
    }
  }
}

startupTest();
