const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { Camunda8 } = require('@camunda8/sdk');
const fs = require('fs');

// Create a new BPMN file with the correct FEEL gateway conditions
const newBpmnContent = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="policy-management-process" name="Simple Policy Process" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1" name="Policy Submitted">
      <bpmn:outgoing>Flow_1</bpmn:outgoing>
    </bpmn:startEvent>

    <!-- DMN Decision Task -->
    <bpmn:businessRuleTask id="Task_Evaluate" name="Check Auto-Approval">
      <bpmn:extensionElements>
        <zeebe:calledDecision decisionId="policy-approval-decision" resultVariable="decision" />
      </bpmn:extensionElements>
      <bpmn:incoming>Flow_1</bpmn:incoming>
      <bpmn:outgoing>Flow_2</bpmn:outgoing>
    </bpmn:businessRuleTask>

    <!-- Gateway -->
    <bpmn:exclusiveGateway id="Gateway_1" name="Auto-Approve?">
      <bpmn:incoming>Flow_2</bpmn:incoming>
      <bpmn:outgoing>Flow_3</bpmn:outgoing>
      <bpmn:outgoing>Flow_4</bpmn:outgoing>
    </bpmn:exclusiveGateway>

    <!-- Manual Review Task -->
    <bpmn:userTask id="Task_Review" name="Manual Review">
      <bpmn:extensionElements>
        <zeebe:assignmentDefinition assignee="reviewer" />
      </bpmn:extensionElements>
      <bpmn:incoming>Flow_3</bpmn:incoming>
      <bpmn:outgoing>Flow_5</bpmn:outgoing>
    </bpmn:userTask>

    <!-- End Events -->
    <bpmn:endEvent id="EndEvent_Reviewed" name="Reviewed">
      <bpmn:incoming>Flow_5</bpmn:incoming>
    </bpmn:endEvent>

    <bpmn:endEvent id="EndEvent_AutoApproved" name="Auto Approved">
      <bpmn:incoming>Flow_4</bpmn:incoming>
    </bpmn:endEvent>

    <!-- Sequence Flows -->
    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Task_Evaluate" />
    <bpmn:sequenceFlow id="Flow_2" sourceRef="Task_Evaluate" targetRef="Gateway_1" />

    <bpmn:sequenceFlow id="Flow_3" name="Manual Review" sourceRef="Gateway_1" targetRef="Task_Review">
      <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">=not(decision.autoApprove)</bpmn:conditionExpression>
    </bpmn:sequenceFlow>

    <bpmn:sequenceFlow id="Flow_4" name="Auto-Approve" sourceRef="Gateway_1" targetRef="EndEvent_AutoApproved">
      <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">=decision.autoApprove</bpmn:conditionExpression>
    </bpmn:sequenceFlow>

    <bpmn:sequenceFlow id="Flow_5" sourceRef="Task_Review" targetRef="EndEvent_Reviewed" />
  </bpmn:process>
</bpmn:definitions>`;

async function deployNewFEELBPMN() {
  console.log('🔧 DEPLOYING NEW BPMN WITH CORRECT FEEL GATEWAY CONDITIONS\n');
  
  try {
    // Save the new BPMN to a file
    const newBpmnPath = path.join(__dirname, 'new-feel-policy-management.bpmn');
    fs.writeFileSync(newBpmnPath, newBpmnContent, 'utf8');
    console.log(`✅ New BPMN saved to ${newBpmnPath}`);
    
    // Initialize Camunda client
    const camunda = new Camunda8();
    const zeebe = camunda.getZeebeGrpcApiClient();
    
    // Deploy the new BPMN
    console.log('🚀 Deploying new BPMN process...');
    
    const deployResult = await zeebe.deployResource({
      name: 'policy-management.bpmn',
      content: Buffer.from(newBpmnContent)
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
    console.log('❌ OLD: =decision.autoApprove = true (ASSIGNMENT)');
    console.log('✅ NEW: =decision.autoApprove (EVALUATION)');
    console.log('❌ OLD: =decision.autoApprove = false (ASSIGNMENT)');
    console.log('✅ NEW: =not(decision.autoApprove) (EVALUATION)');
    
    console.log('\n🧪 TESTING THE FIX:');
    
    // Test with a low-risk policy
    const testPolicy = {
      policyData: {
        title: "Fixed FEEL Test - Low Risk",
        category: "HR",
        content: "Testing the fixed FEEL gateway conditions",
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
    console.error('❌ Deployment failed:', error.message);
    if (error.details) {
      console.error('Error details:', error.details);
    }
  }
}

deployNewFEELBPMN();
