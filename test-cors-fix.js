const axios = require('axios');

async function testCORSFix() {
  console.log('🧪 TESTING CORS FIX\n');
  
  try {
    // Test with CORS headers that the frontend would send
    console.log('1️⃣ Testing CORS preflight request...');
    
    const preflightResponse = await axios.options('http://localhost:3001/api/policies', {
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    console.log('✅ Preflight request successful');
    console.log('CORS Headers:', {
      'Access-Control-Allow-Origin': preflightResponse.headers['access-control-allow-origin'],
      'Access-Control-Allow-Methods': preflightResponse.headers['access-control-allow-methods'],
      'Access-Control-Allow-Headers': preflightResponse.headers['access-control-allow-headers']
    });
    
    // Test actual POST request with Origin header
    console.log('\n2️⃣ Testing POST request with Origin header...');
    
    const testPolicy = {
      title: "CORS Test Policy",
      category: "IT",
      content: "Testing CORS fix for frontend communication",
      riskLevel: "Low",
      authorId: "cors-test-user",
      authorName: "CORS Test User"
    };
    
    const postResponse = await axios.post('http://localhost:3001/api/policies', testPolicy, {
      headers: {
        'Origin': 'http://localhost:3000',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ POST request successful');
    console.log('Response:', {
      id: postResponse.data.id,
      status: postResponse.data.status,
      processInstance: postResponse.data.processInstanceId
    });
    
    console.log('\n🎯 CORS FIX VERIFICATION:');
    console.log('✅ Preflight requests are handled correctly');
    console.log('✅ POST requests work with Origin header');
    console.log('✅ Frontend should now be able to communicate with backend');
    
    console.log('\n📝 NEXT STEPS:');
    console.log('1. Refresh the frontend page: http://localhost:3000');
    console.log('2. Try creating a policy through the UI');
    console.log('3. The CORS error should be resolved');
    
  } catch (error) {
    console.error('❌ CORS test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
  }
}

testCORSFix();
