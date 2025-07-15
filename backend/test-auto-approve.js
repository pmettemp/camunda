const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { Camunda8 } = require('@camunda8/sdk');

async function testAutoApprove() {
  console.log('🧪 TESTING AUTO-APPROVE PATH\n');
  
  try {
    const camunda = new Camunda8();
    const zeebe = camunda.getZeebeGrpcApiClient();
    
    console.log('🎯 TESTING APPROACH: Force Auto-Approve Path');
    console.log('We will create a process instance with decision.autoApprove = true');
    console.log('This should force it to take the auto-approve path');
    
    // Create a process instance with decision.autoApprove = true
    const variables = {
      policyData: {
        title: "Force Auto-Approve Test",
        category: "HR",
        content: "Testing auto-approve path",
        riskLevel: "Low",
        authorId: "test-user",
        authorName: "Test User"
      },
      // Manually set the decision variable
      decision: {
        autoApprove: true
      }
    };
    
    console.log('📝 Creating process with decision.autoApprove = true...');
    
    const processInstance = await zeebe.createProcessInstance({
      bpmnProcessId: 'policy-management-process',
      variables: variables
    });
    
    console.log(`✅ Process created: ${processInstance.processInstanceKey}`);
    
    console.log('\n⏱️ Waiting 3 seconds...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('\n🎯 WHAT TO CHECK IN CAMUNDA OPERATE:');
    console.log(`1. Process Instance: ${processInstance.processInstanceKey}`);
    console.log('2. This process should auto-approve and complete');
    console.log('3. It should NOT appear in Manual Review tasks');
    
    console.log('\n🔗 Check Results:');
    console.log('https://dsm-1.operate.camunda.io/a80eef2c-b689-41e6-9e83-3e89383def8c');
    
    // Now create a process instance with decision.autoApprove = false
    const variables2 = {
      policyData: {
        title: "Force Manual Review Test",
        category: "Security",
        content: "Testing manual review path",
        riskLevel: "High",
        authorId: "test-user",
        authorName: "Test User"
      },
      // Manually set the decision variable
      decision: {
        autoApprove: false
      }
    };
    
    console.log('\n📝 Creating process with decision.autoApprove = false...');
    
    const processInstance2 = await zeebe.createProcessInstance({
      bpmnProcessId: 'policy-management-process',
      variables: variables2
    });
    
    console.log(`✅ Process created: ${processInstance2.processInstanceKey}`);
    
    console.log('\n⏱️ Waiting 3 seconds...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('\n🎯 WHAT TO CHECK IN CAMUNDA OPERATE:');
    console.log(`1. Process Instance: ${processInstance2.processInstanceKey}`);
    console.log('2. This process should go to Manual Review');
    
    console.log('\n📊 COMPARISON:');
    console.log(`Auto-Approve Process: ${processInstance.processInstanceKey}`);
    console.log(`Manual Review Process: ${processInstance2.processInstanceKey}`);
    
    console.log('\n🔗 Check Results:');
    console.log('https://dsm-1.operate.camunda.io/a80eef2c-b689-41e6-9e83-3e89383def8c');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAutoApprove();
