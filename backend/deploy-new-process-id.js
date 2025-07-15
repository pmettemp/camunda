const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { Camunda8 } = require('@camunda8/sdk');
const fs = require('fs');

async function deployWithNewProcessId() {
  console.log('🚀 DEPLOYING BPMN WITH NEW PROCESS ID\n');
  
  try {
    const camunda = new Camunda8();
    const zeebe = camunda.getZeebeGrpcApiClient();
    
    console.log('✅ Zeebe gRPC client initialized');
    
    // Read the fixed BPMN file
    const bpmnPath = path.resolve(__dirname, '..', 'bpmn', 'policy-management-fixed.bpmn');
    let bpmnContent = fs.readFileSync(bpmnPath, 'utf8');
    
    console.log(`📁 Original BPMN file loaded (${bpmnContent.length} characters)`);
    
    // Change the process ID to avoid conflicts
    const newProcessId = 'policy-management-process-v3';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Replace the process ID in the BPMN content
    bpmnContent = bpmnContent.replace(
      'id="policy-management-process"',
      `id="${newProcessId}"`
    );
    
    // Also update the process name
    bpmnContent = bpmnContent.replace(
      'name="Simple Policy Process Fixed"',
      `name="Policy Process Fixed ${timestamp}"`
    );
    
    console.log(`🔄 Updated process ID to: ${newProcessId}`);
    console.log(`📝 Updated process name with timestamp`);
    
    console.log('🚀 Attempting deployment with new process ID...');
    
    const deployResult = await zeebe.deployResource({
      resources: [
        {
          name: `policy-management-fixed-${timestamp}.bpmn`,
          content: Buffer.from(bpmnContent, 'utf8')
        }
      ]
    });
    
    console.log('✅ Deployment successful!');
    console.log('📊 Deployment details:');
    console.log(`   - Deployment Key: ${deployResult.key}`);
    
    if (deployResult.deployments && deployResult.deployments.length > 0) {
      deployResult.deployments.forEach((deployment, index) => {
        console.log(`\n   Deployment ${index + 1}:`);
        if (deployment.process) {
          console.log(`   - Process ID: ${deployment.process.bpmnProcessId}`);
          console.log(`   - Version: ${deployment.process.version}`);
          console.log(`   - Process Key: ${deployment.process.processDefinitionKey}`);
          console.log(`   - Resource Name: ${deployment.process.resourceName}`);
        }
        if (deployment.decision) {
          console.log(`   - Decision ID: ${deployment.decision.decisionId}`);
          console.log(`   - Decision Key: ${deployment.decision.decisionDefinitionKey}`);
        }
      });
    }
    
    console.log('\n🎯 NEXT STEPS:');
    console.log(`1. Test the new process by creating an instance with process ID: ${newProcessId}`);
    console.log('2. Update your application code to use the new process ID');
    console.log('3. The old process instances will continue running with the old definition');
    console.log('4. New instances will use the fixed process definition');
    
    console.log('\n🔗 View in Camunda Operate:');
    console.log('https://dsm-1.operate.camunda.io/a80eef2c-b689-41e6-9e83-3e89383def8c');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    console.error('Full error:', error);
    
    console.log('\n🔧 TROUBLESHOOTING:');
    console.log('1. Check if cluster is accessible in Camunda Console');
    console.log('2. Verify environment variables are correct');
    console.log('3. Try manual deployment via Camunda Web Modeler');
    console.log('4. Check cluster resource limits');
  }
}

deployWithNewProcessId();
