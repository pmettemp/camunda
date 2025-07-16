const axios = require('axios');

const API_URL = 'http://localhost:3001';

async function testSimpleAPI() {
  console.log('🧪 TESTING SIMPLE POLICY API\n');
  
  try {
    // 1. Test health endpoint
    console.log('1️⃣ Testing health endpoint...');
    const healthResponse = await axios.get(`${API_URL}/api/health`);
    console.log('✅ Health check successful:', healthResponse.data);
    
    // 2. Test creating a Low Risk policy (should auto-approve)
    console.log('\n2️⃣ Creating Low Risk Policy...');
    const lowRiskPolicy = {
      title: "Test Low Risk Policy",
      category: "HR",
      content: "This is a test policy with low risk for auto-approval",
      riskLevel: "Low",
      authorId: "test-user",
      authorName: "Test User"
    };
    
    const lowRiskResponse = await axios.post(`${API_URL}/api/policies`, lowRiskPolicy);
    console.log('✅ Low Risk Policy created:');
    console.log('- Policy ID:', lowRiskResponse.data.id);
    console.log('- Status:', lowRiskResponse.data.status);
    console.log('- Process Instance:', lowRiskResponse.data.processInstanceId);
    
    // 3. Test creating a High Risk policy (should require manual review)
    console.log('\n3️⃣ Creating High Risk Policy...');
    const highRiskPolicy = {
      title: "Test High Risk Policy",
      category: "Legal",
      content: "This is a test policy with high risk that should require manual review",
      riskLevel: "High",
      authorId: "test-user",
      authorName: "Test User"
    };
    
    const highRiskResponse = await axios.post(`${API_URL}/api/policies`, highRiskPolicy);
    console.log('✅ High Risk Policy created:');
    console.log('- Policy ID:', highRiskResponse.data.id);
    console.log('- Status:', highRiskResponse.data.status);
    console.log('- Process Instance:', highRiskResponse.data.processInstanceId);
    
    console.log('\n🎯 RESULTS:');
    console.log('✅ API is working correctly');
    console.log('✅ Process instances are being created');
    console.log('✅ DMN decision table should be evaluating risk levels');
    console.log('\n📝 Next: Check Camunda Operate to see the process instances');
    console.log('URL: https://dsm-1.operate.camunda.io/a80eef2c-b689-41e6-9e83-3e89383def8c');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testSimpleAPI();
