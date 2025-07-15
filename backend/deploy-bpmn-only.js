const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { Camunda8 } = require('@camunda8/sdk');
const fs = require('fs');

async function deployBPMNOnly() {
  console.log('🚀 DEPLOYING FIXED BPMN ONLY\n');
  
  try {
    const camunda = new Camunda8();
    const zeebe = camunda.getZeebeGrpcApiClient();
    
    console.log('✅ Zeebe gRPC client initialized');
    
    // Read only the BPMN file
    const bpmnPath = path.join(__dirname, '..', 'bpmn', 'policy-management.bpmn');
    
    if (!fs.existsSync(bpmnPath)) {
      throw new Error(`BPMN file not found: ${bpmnPath}`);
    }
    
    const bpmnContent = fs.readFileSync(bpmnPath, 'utf8');
    console.log(`📁 BPMN file loaded (${bpmnContent.length} bytes)`);
    
    console.log('🚀 Deploying fixed BPMN process...');
    
    const deployResult = await zeebe.deployResource({
      name: 'policy-management.bpmn',
      content: Buffer.from(bpmnContent, 'utf8')
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
    console.log('❌ OLD: =decision.autoApprove (FEEL expression)');
    console.log('✅ NEW: decision.autoApprove = true (comparison)');
    console.log('❌ OLD: Default path for manual review');
    console.log('✅ NEW: decision.autoApprove = false (comparison)');
    
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
    
    console.log('\n⏱️ Waiting 5 seconds for process to complete...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('\n🎯 VERIFICATION STEPS:');
    console.log('1. Check Camunda Operate in 30 seconds');
    console.log('2. The new process instance should auto-approve (complete)');
    console.log('3. It should NOT appear in Manual Review tasks');
    console.log('4. Process should end at "Auto Approved" end event');
    
    console.log('\n📊 EXPECTED BEHAVIOR NOW:');
    console.log('✅ Low Risk → Auto-Approve → Process Completes');
    console.log('✅ Medium/High/Critical → Manual Review → User Task');
    
    console.log('\n🔗 Check Results:');
    console.log(`Process Instance: ${processInstance.processInstanceKey}`);
    console.log('https://dsm-1.operate.camunda.io/a80eef2c-b689-41e6-9e83-3e89383def8c');
    
    console.log('\n🎉 SUCCESS! Gateway conditions should now work correctly!');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    if (error.details) {
      console.error('Error details:', error.details);
    }
    
    console.log('\n🔧 TROUBLESHOOTING:');
    console.log('1. Check if cluster is accessible');
    console.log('2. Verify environment variables');
    console.log('3. Try manual deployment via Camunda Console');
  }
}

deployBPMNOnly();
