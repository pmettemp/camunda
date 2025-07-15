const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { Camunda8 } = require('@camunda8/sdk');

async function listDeployedProcesses() {
  console.log('🔍 LISTING ALL DEPLOYED PROCESSES\n');
  
  try {
    const camunda = new Camunda8();
    const operate = camunda.getOperateApiClient();
    
    console.log('✅ Operate client initialized');
    
    // Get all deployed process definitions
    console.log('\n📋 Fetching deployed process definitions...');
    
    const processDefinitions = await operate.searchProcessDefinitions({
      filter: {},
      size: 50
    });
    
    console.log(`\n📊 Found ${processDefinitions.items.length} process definitions:`);
    
    processDefinitions.items.forEach((process, index) => {
      console.log(`\n${index + 1}. Process: ${process.bpmnProcessId}`);
      console.log(`   - Name: ${process.name || 'N/A'}`);
      console.log(`   - Version: ${process.version}`);
      console.log(`   - Key: ${process.key}`);
      console.log(`   - Resource Name: ${process.resourceName || 'N/A'}`);
      console.log(`   - Tenant ID: ${process.tenantId || 'default'}`);
    });
    
    // Also check for any process instances
    console.log('\n🔄 Checking for process instances (last 20)...');
    
    const instances = await operate.searchProcessInstances({
      filter: {},
      size: 20,
      sort: [{ field: 'startDate', order: 'DESC' }]
    });
    
    console.log(`\n📈 Found ${instances.items.length} recent process instances:`);
    
    instances.items.forEach((instance, index) => {
      console.log(`\n${index + 1}. Instance: ${instance.key}`);
      console.log(`   - Process: ${instance.bpmnProcessId}`);
      console.log(`   - Version: ${instance.processVersion}`);
      console.log(`   - State: ${instance.state}`);
      console.log(`   - Start Date: ${instance.startDate}`);
      if (instance.endDate) {
        console.log(`   - End Date: ${instance.endDate}`);
      }
    });
    
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Review the deployed processes above');
    console.log('2. If you see multiple versions of policy-management-process, that might be causing conflicts');
    console.log('3. You can view and manage these in Camunda Operate web interface');
    console.log('4. Note: You cannot delete process definitions, but you can deploy new versions');
    
    console.log('\n🔗 Access Camunda Operate:');
    console.log('https://dsm-1.operate.camunda.io/a80eef2c-b689-41e6-9e83-3e89383def8c');
    
  } catch (error) {
    console.error('❌ Error listing deployed processes:', error.message);
    if (error.message.includes('401') || error.message.includes('403')) {
      console.error('This might be an authentication issue. Check your credentials.');
    }
    console.error('Full error:', error);
  }
}

listDeployedProcesses();
