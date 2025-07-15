require('dotenv').config();
const { Camunda8 } = require('@camunda8/sdk');

async function checkDeployedProcesses() {
  try {
    console.log('🔍 Checking what processes are expected vs deployed...');

    // First, let's check what process ID we're trying to use
    console.log('\n📋 Expected Process Configuration:');
    console.log('   - Process ID we\'re trying to start: "policy-management-process"');
    console.log('   - Service task types we\'re polling for:');
    console.log('     * publish-policy');
    console.log('     * notify-stakeholders');
    console.log('     * notify-rejection');

    // Check the actual BPMN file
    const fs = require('fs');
    const path = require('path');

    const bpmnPath = path.join(__dirname, '../bpmn/policy-management.bpmn');
    const dmnPath = path.join(__dirname, '../dmn/policy-approval-decision.dmn');

    console.log('\n📁 Checking local files:');

    if (fs.existsSync(bpmnPath)) {
      console.log('✅ BPMN file exists:', bpmnPath);
      const bpmnContent = fs.readFileSync(bpmnPath, 'utf8');

      // Extract process ID from BPMN
      const processIdMatch = bpmnContent.match(/bpmn:process[^>]*id="([^"]+)"/);
      if (processIdMatch) {
        console.log('   - Process ID in BPMN file:', processIdMatch[1]);
      }

      // Extract service task types
      const serviceTaskMatches = bpmnContent.match(/zeebe:taskDefinition[^>]*type="([^"]+)"/g);
      if (serviceTaskMatches) {
        console.log('   - Service task types in BPMN:');
        serviceTaskMatches.forEach(match => {
          const typeMatch = match.match(/type="([^"]+)"/);
          if (typeMatch) {
            console.log(`     * ${typeMatch[1]}`);
          }
        });
      }
    } else {
      console.log('❌ BPMN file not found:', bpmnPath);
    }

    if (fs.existsSync(dmnPath)) {
      console.log('✅ DMN file exists:', dmnPath);
      const dmnContent = fs.readFileSync(dmnPath, 'utf8');

      // Extract decision ID from DMN
      const decisionIdMatch = dmnContent.match(/dmn:decision[^>]*id="([^"]+)"/);
      if (decisionIdMatch) {
        console.log('   - Decision ID in DMN file:', decisionIdMatch[1]);
      }
    } else {
      console.log('❌ DMN file not found:', dmnPath);
    }

    console.log('\n🔧 Troubleshooting the 404 errors:');
    console.log('The 404 errors suggest that:');
    console.log('1. Either the processes were not deployed successfully');
    console.log('2. Or they were deployed with different IDs than expected');
    console.log('3. Or the service task types don\'t match');

    console.log('\n💡 Solutions:');
    console.log('1. Check Camunda Operate to see if processes are deployed');
    console.log('2. Verify the process was deployed with the correct ID');
    console.log('3. Try starting a process instance manually in Operate');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkDeployedProcesses();
