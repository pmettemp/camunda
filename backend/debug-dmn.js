const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { Camunda8 } = require('@camunda8/sdk');

async function debugDMNDecision() {
  console.log('🔍 DEBUGGING DMN DECISION EVALUATION\n');
  
  try {
    const camunda = new Camunda8();
    const zeebe = camunda.getZeebeGrpcApiClient();
    
    // Test different policy data scenarios
    const testScenarios = [
      {
        name: "Low Risk Test",
        variables: {
          policyData: {
            title: "Test Low Risk Policy",
            category: "HR",
            content: "Test content",
            riskLevel: "Low",
            authorId: "test-user"
          }
        }
      },
      {
        name: "High Risk Test", 
        variables: {
          policyData: {
            title: "Test High Risk Policy",
            category: "Security",
            content: "Test content",
            riskLevel: "High",
            authorId: "test-user"
          }
        }
      }
    ];
    
    for (const scenario of testScenarios) {
      console.log(`📋 Testing: ${scenario.name}`);
      console.log(`Risk Level: ${scenario.variables.policyData.riskLevel}`);
      
      try {
        // Create process instance and monitor its progress
        const processInstance = await zeebe.createProcessInstance({
          bpmnProcessId: 'policy-management-process',
          variables: scenario.variables
        });
        
        console.log(`✅ Process Instance Created: ${processInstance.processInstanceKey}`);
        
        // Wait a moment for the process to execute
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Try to get process instance details (this might not work with gRPC client)
        console.log(`📊 Process should have executed DMN decision`);
        console.log(`Expected outcome for ${scenario.variables.policyData.riskLevel} risk:`);
        
        if (scenario.variables.policyData.riskLevel === "Low") {
          console.log(`   → Should auto-approve (decision.autoApprove = true)`);
          console.log(`   → Should go to EndEvent_AutoApproved`);
        } else {
          console.log(`   → Should require manual review (decision.autoApprove = false)`);
          console.log(`   → Should go to Task_Review`);
        }
        
      } catch (error) {
        console.log(`❌ Failed: ${error.message}`);
      }
      
      console.log('');
    }
    
    console.log('🎯 DEBUGGING RECOMMENDATIONS:');
    console.log('1. Check Camunda Operate to see where processes are stopping');
    console.log('2. Look at process variables to see DMN decision output');
    console.log('3. Verify DMN decision table is being called correctly');
    console.log('4. Check if there are any expression evaluation errors');
    
    console.log('\n🔍 POSSIBLE ISSUES:');
    console.log('1. DMN decision variable name mismatch');
    console.log('2. Gateway condition expression syntax error');
    console.log('3. Process variable structure not matching DMN input');
    console.log('4. DMN decision not being called at all');
    
    console.log('\n📝 NEXT STEPS:');
    console.log('1. Check Camunda Operate for process details');
    console.log('2. Look at process variables in the UI');
    console.log('3. Check for any incidents or errors');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugDMNDecision();
