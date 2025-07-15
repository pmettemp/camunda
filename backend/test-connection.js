const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { Camunda8 } = require('@camunda8/sdk');

async function testConnection() {
  try {
    console.log('Testing Camunda 8 connection...');
    console.log('Environment variables:');
    console.log('- CAMUNDA_CLUSTER_ID:', process.env.CAMUNDA_CLUSTER_ID);
    console.log('- CAMUNDA_CLIENT_ID:', process.env.CAMUNDA_CLIENT_ID);
    console.log('- CAMUNDA_ZEEBE_REST_ADDRESS:', process.env.CAMUNDA_ZEEBE_REST_ADDRESS);

    // Initialize Camunda 8 SDK
    const camunda = new Camunda8();
    
    // Test Zeebe gRPC connection
    console.log('\nTesting Zeebe gRPC connection...');
    const zeebe = camunda.getZeebeGrpcApiClient();
    const topology = await zeebe.topology();
    console.log('✅ Zeebe gRPC connection successful!');
    console.log('Topology:', topology);

  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Full error:', error);
  }
}

testConnection();
