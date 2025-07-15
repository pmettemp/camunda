const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { Camunda8 } = require('@camunda8/sdk');

async function testCamundaMethods() {
  try {
    console.log('🧪 Testing different Camunda 8 connection methods...\n');

    // Initialize Camunda 8 SDK
    const camunda = new Camunda8();

    // Test 1: Check configuration
    console.log('1️⃣ Configuration Check:');
    console.log('- CAMUNDA_CLUSTER_ID:', process.env.CAMUNDA_CLUSTER_ID);
    console.log('- CAMUNDA_CLIENT_ID:', process.env.CAMUNDA_CLIENT_ID);
    console.log('- CAMUNDA_OAUTH_URL:', process.env.CAMUNDA_OAUTH_URL);
    console.log('- ZEEBE_ADDRESS:', process.env.ZEEBE_ADDRESS);

    // Test 2: Try to get different clients
    console.log('\n2️⃣ Client Initialization:');
    
    try {
      const zeebeGrpc = camunda.getZeebeGrpcApiClient();
      console.log('✅ Zeebe gRPC client created');
    } catch (error) {
      console.log('❌ Zeebe gRPC client failed:', error.message);
    }

    try {
      const zeebeRest = camunda.getZeebeRestClient();
      console.log('✅ Zeebe REST client created');
    } catch (error) {
      console.log('❌ Zeebe REST client failed:', error.message);
    }

    try {
      const operate = camunda.getOperateApiClient();
      console.log('✅ Operate client created');
    } catch (error) {
      console.log('❌ Operate client failed:', error.message);
    }

    // Test 3: Try simple operations
    console.log('\n3️⃣ Connection Tests:');
    
    // Test gRPC topology
    try {
      console.log('Testing gRPC topology...');
      const zeebe = camunda.getZeebeGrpcApiClient();
      const topology = await zeebe.topology();
      console.log('✅ gRPC topology successful:', topology);
    } catch (error) {
      console.log('❌ gRPC topology failed:', error.message);
    }

    // Test REST status
    try {
      console.log('Testing REST status...');
      const zeebeRest = camunda.getZeebeRestClient();
      // Try a simple status check if available
      console.log('✅ REST client ready (no status endpoint tested)');
    } catch (error) {
      console.log('❌ REST status failed:', error.message);
    }

    console.log('\n🎯 Recommendation:');
    console.log('If gRPC is failing with 404, try:');
    console.log('1. Manual deployment via Camunda 8 Web Modeler');
    console.log('2. Check if cluster is active in Camunda Console');
    console.log('3. Verify cluster region and endpoints');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCamundaMethods();
