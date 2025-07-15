const axios = require('axios');

console.log('🧪 Testing real Camunda Cloud workflow integration...');

// Test policy creation with real workflow
axios.post('http://localhost:3000/api/policies', {
  title: 'Real Workflow Test Policy',
  content: 'This policy tests the integration with real Camunda 8 Cloud workflows and DMN decision tables.',
  category: 'IT',
  riskLevel: 'Medium',
  effectiveDate: '2024-01-01',
  expiryDate: '2024-12-31',
  stakeholders: ['it@company.com', 'compliance@company.com']
})
.then(response => {
  console.log('🎉 SUCCESS! Real Camunda workflow started!');
  console.log('📋 Policy Details:');
  console.log('  - Policy ID:', response.data.id);
  console.log('  - Process Instance Key:', response.data.processInstanceKey);
  console.log('  - Status:', response.data.status);
  console.log('');
  console.log('✅ Your system is now using real Camunda 8 Cloud!');
  console.log('');
  console.log('🔍 Next steps:');
  console.log('  1. Check Camunda Operate for the running process instance');
  console.log('  2. Check Camunda Tasklist for any user tasks');
  console.log('  3. Monitor the service task workers in the server logs');
})
.catch(error => {
  console.error('❌ Error:', error.response?.data || error.message);
  
  if (error.response?.data?.error?.includes('404')) {
    console.log('');
    console.log('💡 This error suggests the process is not deployed or not found.');
    console.log('   Please verify the deployment was successful.');
  }
});
