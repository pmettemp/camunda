const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { Camunda8 } = require('@camunda8/sdk');
const fs = require('fs');

async function testSimpleDeploy() {
  console.log('🧪 TESTING SIMPLE DEPLOYMENT\n');
  
  try {
    const camunda = new Camunda8();
    const zeebe = camunda.getZeebeGrpcApiClient();
    
    console.log('✅ Zeebe gRPC client initialized');
    
    // Try with the original working deployment method
    const bpmnPath = path.resolve(__dirname, '..', 'bpmn', 'policy-management-fixed.bpmn');
    console.log('📂 BPMN file path:', bpmnPath);
    console.log('📂 File exists:', fs.existsSync(bpmnPath));

    const bpmnContent = fs.readFileSync(bpmnPath, 'utf8');

    console.log(`📁 BPMN file loaded (${bpmnContent.length} characters)`);
    console.log('First 100 chars:', bpmnContent.substring(0, 100));

    console.log('🚀 Attempting deployment...');

    // Try the resources array format (as used in working scripts)
    const deployResult = await zeebe.deployResource({
      resources: [
        {
          name: 'policy-management-fixed.bpmn',
          content: Buffer.from(bpmnContent, 'utf8')
        }
      ]
    });
    
    console.log('✅ Deployment successful!');
    console.log(deployResult);
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    
    // Let's try to understand what's happening
    console.log('\n🔍 DEBUGGING INFO:');
    console.log('Error code:', error.code);
    console.log('Error details:', error.details);
    
    // Check if it's a connection issue
    console.log('\n🔧 POSSIBLE SOLUTIONS:');
    console.log('1. The gRPC connection might have timed out');
    console.log('2. The cluster might be temporarily unavailable');
    console.log('3. There might be a deployment quota limit');
    console.log('4. The file format might have an issue');
    
    console.log('\n💡 ALTERNATIVE APPROACH:');
    console.log('Since gRPC deployment worked before, try:');
    console.log('1. Restart the backend server');
    console.log('2. Wait a few minutes and try again');
    console.log('3. Use manual deployment via Camunda Console');
    console.log('4. Check cluster status in Camunda Console');
  }
}

testSimpleDeploy();
