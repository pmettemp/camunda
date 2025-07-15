const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { Camunda8 } = require('@camunda8/sdk');
const fs = require('fs');

async function simpleDeployTest() {
  console.log('🧪 SIMPLE DEPLOYMENT TEST\n');
  
  try {
    const camunda = new Camunda8();
    const zeebe = camunda.getZeebeGrpcApiClient();
    
    console.log('✅ Zeebe gRPC client initialized');
    
    // Test 1: Try deploying using the exact same method as working scripts
    console.log('\n📋 Test 1: Using processFilename method...');
    
    const bpmnPath = path.resolve(__dirname, '..', 'bpmn', 'policy-management-fixed.bpmn');
    
    try {
      const deployment1 = await zeebe.deployResource({
        processFilename: bpmnPath
      });
      
      console.log('✅ Method 1 SUCCESS!');
      console.log('Deployment:', deployment1);
      return;
      
    } catch (error1) {
      console.log('❌ Method 1 failed:', error1.message);
    }
    
    // Test 2: Try with single resource (not array)
    console.log('\n📋 Test 2: Using single resource object...');
    
    const bpmnContent = fs.readFileSync(bpmnPath, 'utf8');
    
    try {
      const deployment2 = await zeebe.deployResource({
        name: 'policy-management-fixed.bpmn',
        content: Buffer.from(bpmnContent, 'utf8')
      });
      
      console.log('✅ Method 2 SUCCESS!');
      console.log('Deployment:', deployment2);
      return;
      
    } catch (error2) {
      console.log('❌ Method 2 failed:', error2.message);
    }
    
    // Test 3: Try with different content format
    console.log('\n📋 Test 3: Using string content...');
    
    try {
      const deployment3 = await zeebe.deployResource({
        name: 'policy-management-fixed.bpmn',
        content: bpmnContent
      });
      
      console.log('✅ Method 3 SUCCESS!');
      console.log('Deployment:', deployment3);
      return;
      
    } catch (error3) {
      console.log('❌ Method 3 failed:', error3.message);
    }
    
    console.log('\n❌ All deployment methods failed');
    console.log('\n🎯 RECOMMENDATION:');
    console.log('Use Camunda Web Modeler for deployment:');
    console.log('1. Go to https://modeler.cloud.camunda.io/');
    console.log('2. Create new BPMN diagram');
    console.log('3. Copy content from your BPMN file');
    console.log('4. Deploy directly to cluster');
    
  } catch (error) {
    console.error('❌ General error:', error.message);
  }
}

simpleDeployTest();
