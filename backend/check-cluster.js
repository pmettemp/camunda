const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function checkClusterStatus() {
  console.log('🔍 Checking Camunda 8 Cluster Status...\n');
  
  console.log('📋 Configuration:');
  console.log('- Cluster ID:', process.env.CAMUNDA_CLUSTER_ID);
  console.log('- Region: bru-2 (Brussels)');
  console.log('- gRPC Endpoint:', process.env.ZEEBE_ADDRESS);
  console.log('- REST Endpoint:', process.env.ZEEBE_REST_ADDRESS);
  
  console.log('\n🎯 Next Steps:');
  console.log('1. Go to: https://console.cloud.camunda.io/');
  console.log('2. Check if your cluster is ACTIVE (green status)');
  console.log('3. If cluster is PAUSED/SUSPENDED, resume it');
  console.log('4. Verify the cluster region matches: bru-2');
  
  console.log('\n📝 Manual Deployment Steps:');
  console.log('1. In Camunda Console, go to "Modeler"');
  console.log('2. Create new project or open existing');
  console.log('3. Upload files:');
  console.log('   - bpmn/policy-management.bpmn');
  console.log('   - dmn/policy-approval-decision.dmn');
  console.log('4. Click "Deploy" and select your cluster');
  
  console.log('\n🧪 Test After Manual Deployment:');
  console.log('Run: node backend/test-process-instance.js');
}

checkClusterStatus();
