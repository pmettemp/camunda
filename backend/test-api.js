const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const axios = require('axios');

const API_URL = 'http://localhost:3001';

async function testAPI() {
  console.log('🧪 TESTING POLICY MANAGEMENT API\n');
  
  try {
    // 1. Test API health
    console.log('1️⃣ Testing API health...');
    try {
      const healthResponse = await axios.get(`${API_URL}/api/health`);
      console.log('✅ Health check successful:', healthResponse.data);
    } catch (error) {
      console.log('❌ Health check failed:', error.message);
      console.log('Is the server running on port 3001?');
      return;
    }
    
    // 2. Create a test policy
    console.log('\n2️⃣ Creating a test policy (Low Risk)...');
    const lowRiskPolicy = {
      title: "Test Low Risk Policy",
      category: "HR",
      content: "This is a test policy with low risk for auto-approval",
      riskLevel: "Low",
      authorId: "test-user",
      authorName: "Test User"
    };
    
    try {
      const createResponse = await axios.post(`${API_URL}/api/policies`, lowRiskPolicy);
      console.log('✅ Policy created successfully:');
      console.log('- Policy ID:', createResponse.data.id);
      console.log('- Status:', createResponse.data.status);
      console.log('- Process Instance:', createResponse.data.processInstanceId);
      
      // Store policy ID for later tests
      const policyId = createResponse.data.id;
      
      // 3. Get policy details
      console.log('\n3️⃣ Getting policy details...');
      const getResponse = await axios.get(`${API_URL}/api/policies/${policyId}`);
      console.log('✅ Policy details retrieved:');
      console.log('- Title:', getResponse.data.title);
      console.log('- Risk Level:', getResponse.data.riskLevel);
      console.log('- Status:', getResponse.data.status);
      
      // 4. Create a high risk policy
      console.log('\n4️⃣ Creating a high risk policy (should require review)...');
      const highRiskPolicy = {
        title: "Test High Risk Policy",
        category: "Legal",
        content: "This is a test policy with high risk that should require manual review",
        riskLevel: "High",
        authorId: "test-user",
        authorName: "Test User"
      };
      
      const highRiskResponse = await axios.post(`${API_URL}/api/policies`, highRiskPolicy);
      console.log('✅ High risk policy created:');
      console.log('- Policy ID:', highRiskResponse.data.id);
      console.log('- Status:', highRiskResponse.data.status);
      
      // 5. Get user tasks
      console.log('\n5️⃣ Checking for user tasks...');
      const tasksResponse = await axios.get(`${API_URL}/api/tasks`);
      console.log('✅ Tasks retrieved:', tasksResponse.data.length, 'tasks found');
      
      if (tasksResponse.data.length > 0) {
        console.log('Task details:');
        tasksResponse.data.forEach((task, index) => {
          console.log(`Task ${index + 1}:`);
          console.log('- ID:', task.id);
          console.log('- Name:', task.name);
          console.log('- Process Instance:', task.processInstanceId);
        });
        
        // 6. Complete a task
        if (tasksResponse.data.length > 0) {
          const taskToComplete = tasksResponse.data[0];
          console.log('\n6️⃣ Completing task:', taskToComplete.id);
          
          const completeResponse = await axios.post(`${API_URL}/api/tasks/${taskToComplete.id}/complete`, {
            approved: true,
            comments: "Approved via API test"
          });
          
          console.log('✅ Task completed successfully:', completeResponse.data);
        }
      }
      
    } catch (error) {
      console.log('❌ API test failed:', error.message);
      if (error.response) {
        console.log('Response status:', error.response.status);
        console.log('Response data:', error.response.data);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAPI();
