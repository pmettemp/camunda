const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { Camunda8 } = require('@camunda8/sdk');

async function testProcessInstance() {
  try {
    console.log('🧪 Testing Process Instance Creation...\n');

    const camunda = new Camunda8();
    const zeebe = camunda.getZeebeGrpcApiClient();

    // Test data for policy
    const testPolicy = {
      policyData: {
        title: "Test Policy",
        category: "HR", 
        content: "This is a test policy for validation",
        riskLevel: "Low",
        authorId: "test-user",
        authorName: "Test User"
      },
      policyAuthor: "test-user"
    };

    console.log('📋 Test Policy Data:');
    console.log(JSON.stringify(testPolicy, null, 2));

    console.log('\n🚀 Attempting to create process instance...');
    
    const processInstance = await zeebe.createProcessInstance({
      bpmnProcessId: 'policy-management-process',
      variables: testPolicy
    });

    console.log('✅ SUCCESS! Process instance created:');
    console.log('- Process Instance Key:', processInstance.processInstanceKey);
    console.log('- Process Definition Key:', processInstance.processDefinitionKey);
    console.log('- BPMN Process ID:', processInstance.bpmnProcessId);
    console.log('- Version:', processInstance.version);

    console.log('\n🎯 This means:');
    console.log('✅ gRPC connection works for runtime operations');
    console.log('✅ Process is deployed and executable');
    console.log('✅ DMN decision table should be called');
    console.log('✅ Your Camunda 8 setup is working!');

    console.log('\n📝 Next: Check tasks and complete the workflow');

  } catch (error) {
    console.error('❌ Process instance creation failed:', error.message);
    
    if (error.message.includes('NOT_FOUND')) {
      console.log('\n💡 This means:');
      console.log('❌ Process is not deployed to the cluster');
      console.log('🎯 Solution: Deploy manually via Camunda Console');
    } else if (error.message.includes('404')) {
      console.log('\n💡 This means:');
      console.log('❌ gRPC connection issue (same as deployment)');
      console.log('🎯 Check cluster status in Camunda Console');
    } else {
      console.log('\n💡 Unexpected error - check cluster and credentials');
    }
  }
}

testProcessInstance();
