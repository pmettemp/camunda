const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { Camunda8 } = require('@camunda8/sdk');

async function testGatewayConditions() {
  console.log('🧪 TESTING GATEWAY CONDITIONS ISSUE\n');
  
  try {
    const camunda = new Camunda8();
    const zeebe = camunda.getZeebeGrpcApiClient();
    
    console.log('🎯 HYPOTHESIS: The issue is with gateway condition syntax');
    console.log('Current conditions use: =decision.autoApprove = true');
    console.log('Should be: =decision.autoApprove == true');
    
    console.log('\n📊 ANALYZING THE PROBLEM:');
    console.log('1. All 15 processes are stuck at Manual Review');
    console.log('2. This means the gateway ALWAYS takes the "false" path');
    console.log('3. Either DMN is not setting decision.autoApprove correctly');
    console.log('4. Or the gateway condition syntax is wrong');
    
    console.log('\n🔍 TESTING DMN DECISION DIRECTLY:');
    
    // Let's test by creating a process with explicit variables
    const testVariables = {
      policyData: {
        title: "Direct Test - Low Risk",
        category: "HR", 
        content: "Testing DMN decision directly",
        riskLevel: "Low",
        authorId: "test-user"
      },
      // Let's also set the decision variable manually to test gateway
      decision: {
        autoApprove: true
      }
    };
    
    console.log('📝 Creating process with manual decision variable...');
    console.log('Setting decision.autoApprove = true manually');
    
    const processInstance = await zeebe.createProcessInstance({
      bpmnProcessId: 'policy-management-process',
      variables: testVariables
    });
    
    console.log(`✅ Process created: ${processInstance.processInstanceKey}`);
    
    console.log('\n⏱️ Waiting 3 seconds...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('\n🎯 WHAT TO CHECK IN CAMUNDA OPERATE:');
    console.log('1. If this process STILL goes to Manual Review:');
    console.log('   → The gateway condition syntax is wrong');
    console.log('2. If this process auto-approves:');
    console.log('   → The DMN is not setting the variable correctly');
    
    console.log('\n🔧 LIKELY FIXES:');
    console.log('Option 1: Change gateway conditions to use == instead of =');
    console.log('Option 2: Fix DMN output variable name');
    console.log('Option 3: Add default gateway path');
    
    console.log('\n🔗 Check this specific process:');
    console.log(`Process Instance: ${processInstance.processInstanceKey}`);
    console.log('https://dsm-1.operate.camunda.io/a80eef2c-b689-41e6-9e83-3e89383def8c');
    
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Check if this test process auto-approves');
    console.log('2. If not, we know the gateway syntax is the issue');
    console.log('3. We need to redeploy with == instead of =');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testGatewayConditions();
