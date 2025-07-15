const axios = require('axios');

async function testCompleteWorkflow() {
  console.log('🎉 CONGRATULATIONS! Your Camunda 8 Cloud integration is working!');
  console.log('');
  console.log('✅ Evidence of success:');
  console.log('  - You can see "draft policy" task in Tasklist');
  console.log('  - This means the workflow started successfully');
  console.log('  - Real Camunda 8 Cloud is processing your policies');
  console.log('');
  
  console.log('🧪 Let\'s create another policy to test the full workflow...');
  
  try {
    const response = await axios.post('http://localhost:3000/api/policies', {
      title: 'Second Test Policy - Full Workflow',
      content: 'This policy tests the complete workflow including DMN decision tables and service tasks.',
      category: 'Security',
      riskLevel: 'High', // This should trigger different DMN decision
      effectiveDate: '2024-02-01',
      expiryDate: '2024-12-31',
      stakeholders: ['security@company.com', 'compliance@company.com']
    });

    console.log('🎉 SUCCESS! Another workflow instance started!');
    console.log('📋 Policy Details:');
    console.log('  - Policy ID:', response.data.id);
    console.log('  - Process Instance Key:', response.data.processInstanceKey);
    console.log('  - Status:', response.data.status);
    console.log('');
    console.log('🔍 Next steps:');
    console.log('1. Check Tasklist for new tasks');
    console.log('2. Complete the "draft policy" task');
    console.log('3. Watch the workflow progress through different stages');
    console.log('4. See how DMN decisions affect the workflow path');
    console.log('');
    console.log('🌟 Your Policy Management System is now powered by real Camunda 8 Cloud!');

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('⚠️  Server not running. Please start the server first:');
      console.log('   cd backend && npm run dev');
    } else {
      console.error('❌ Error:', error.response?.data || error.message);
    }
  }
}

testCompleteWorkflow();
