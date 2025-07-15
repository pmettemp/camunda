const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { Camunda8 } = require('@camunda8/sdk');
const fs = require('fs');

async function redeployFixedBPMN() {
  console.log('🔧 REDEPLOYING FIXED BPMN WITH CORRECT GATEWAY CONDITIONS\n');
  
  try {
    const camunda = new Camunda8();
    const zeebe = camunda.getZeebeGrpcApiClient();
    
    // Read the fixed BPMN file
    const bpmnPath = path.join(__dirname, '..', 'bpmn', 'policy-management.bpmn');
    const bpmnContent = fs.readFileSync(bpmnPath, 'utf8');
    
    console.log('📁 Reading fixed BPMN file...');
    console.log('✅ BPMN file loaded');
    
    // Deploy the fixed BPMN
    console.log('🚀 Deploying fixed BPMN process...');
    
    const deployResult = await zeebe.deployResource({
      name: 'policy-management.bpmn',
      content: Buffer.from(bpmnContent)
    });
    
    console.log('✅ BPMN deployment successful!');
    console.log('Deployment details:', {
      key: deployResult.key,
      deployments: deployResult.deployments.map(d => ({
        process: d.process?.bpmnProcessId,
        version: d.process?.version,
        resourceName: d.process?.resourceName
      }))
    });
    
    console.log('\n🎯 WHAT WAS FIXED:');
    console.log('❌ OLD: =decision.autoApprove = true');
    console.log('✅ NEW: =decision.autoApprove == true');
    console.log('❌ OLD: =decision.autoApprove = false');
    console.log('✅ NEW: =decision.autoApprove == false');
    
    console.log('\n🧪 TESTING THE FIX:');
    
    // Test with a low-risk policy
    const testPolicy = {
      policyData: {
        title: "Fixed Gateway Test - Low Risk",
        category: "HR",
        content: "Testing the fixed gateway conditions",
        riskLevel: "Low",
        authorId: "test-user",
        authorName: "Test User"
      }
    };
    
    console.log('📝 Creating test process instance...');
    console.log('Risk Level: Low (should auto-approve now)');
    
    const processInstance = await zeebe.createProcessInstance({
      bpmnProcessId: 'policy-management-process',
      variables: testPolicy
    });
    
    console.log(`✅ Test process created: ${processInstance.processInstanceKey}`);
    
    console.log('\n⏱️ Waiting 3 seconds for process to complete...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('\n🎯 VERIFICATION STEPS:');
    console.log('1. Check Camunda Operate in 30 seconds');
    console.log('2. The new process instance should auto-approve (complete)');
    console.log('3. It should NOT appear in Manual Review tasks');
    console.log('4. Process should end at "Auto Approved" end event');
    
    console.log('\n📊 EXPECTED BEHAVIOR NOW:');
    console.log('✅ Low Risk → Auto-Approve → Process Completes');
    console.log('✅ Medium/High/Critical → Manual Review → User Task');
    
    console.log('\n🔗 Check Results:');
    console.log('https://dsm-1.operate.camunda.io/a80eef2c-b689-41e6-9e83-3e89383def8c');
    
  } catch (error) {
    console.error('❌ Redeployment failed:', error.message);
    if (error.details) {
      console.error('Error details:', error.details);
    }
  }
}

redeployFixedBPMN();
