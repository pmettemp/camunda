const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const fs = require('fs');
const { Camunda8 } = require('@camunda8/sdk');

async function deployProcesses() {
  try {
    console.log('Starting process deployment...');
    console.log('Environment check:');
    console.log('- CAMUNDA_CLUSTER_ID:', process.env.CAMUNDA_CLUSTER_ID);
    console.log('- CAMUNDA_CLIENT_ID:', process.env.CAMUNDA_CLIENT_ID);
    console.log('- ZEEBE_REST_ADDRESS:', process.env.ZEEBE_REST_ADDRESS);

    // Initialize Camunda 8 SDK
    const camunda = new Camunda8();

    // Using Zeebe gRPC API for deployment
    console.log('\nUsing Zeebe gRPC API for deployment...');

    // Define file paths
    const bpmnPath = path.join(__dirname, '../../bpmn/policy-management.bpmn');
    const dmnPath = path.join(__dirname, '../../dmn/policy-approval-decision.dmn');

    console.log('Deploying files:', { bpmnPath, dmnPath });

    // Check if files exist
    if (!fs.existsSync(bpmnPath)) {
      throw new Error(`BPMN file not found: ${bpmnPath}`);
    }
    if (!fs.existsSync(dmnPath)) {
      throw new Error(`DMN file not found: ${dmnPath}`);
    }

    // Read file contents
    const bpmnContent = fs.readFileSync(bpmnPath, 'utf8');
    const dmnContent = fs.readFileSync(dmnPath, 'utf8');

    console.log('Files read successfully');
    console.log('BPMN size:', bpmnContent.length, 'characters');
    console.log('DMN size:', dmnContent.length, 'characters');

    // Deploy using Zeebe gRPC API (more reliable)
    const zeebe = camunda.getZeebeGrpcApiClient();
    const deployment = await zeebe.deployResource({
      processFilename: bpmnPath,
      decisionFilename: dmnPath
    });

    console.log('✅ Deployment successful!');
    console.log('Deployment details:', JSON.stringify(deployment, null, 2));

  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    console.error('Full error:', error);

    console.error('❌ Deployment failed completely');
    process.exit(1);
  }
}

// Run deployment if this file is executed directly
if (require.main === module) {
  deployProcesses()
    .then(() => {
      console.log('✅ Deployment script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Deployment script failed:', error);
      process.exit(1);
    });
}

module.exports = { deployProcesses };
