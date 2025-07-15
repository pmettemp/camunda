const path = require('path');
const fs = require('fs');

function validateFiles() {
  try {
    console.log('Validating BPMN and DMN files...');

    // Define file paths
    const bpmnPath = path.join(__dirname, '../bpmn/policy-management.bpmn');
    const dmnPath = path.join(__dirname, '../dmn/policy-approval-decision.dmn');

    console.log('File paths:');
    console.log('- BPMN:', bpmnPath);
    console.log('- DMN:', dmnPath);

    // Check if files exist
    if (!fs.existsSync(bpmnPath)) {
      throw new Error(`BPMN file not found: ${bpmnPath}`);
    }
    if (!fs.existsSync(dmnPath)) {
      throw new Error(`DMN file not found: ${dmnPath}`);
    }

    // Read and validate file contents
    const bpmnContent = fs.readFileSync(bpmnPath, 'utf8');
    const dmnContent = fs.readFileSync(dmnPath, 'utf8');

    console.log('\n✅ Files exist and are readable');
    console.log('BPMN size:', bpmnContent.length, 'characters');
    console.log('DMN size:', dmnContent.length, 'characters');

    // Basic XML validation
    if (!bpmnContent.includes('<?xml')) {
      throw new Error('BPMN file does not appear to be valid XML');
    }
    if (!dmnContent.includes('<?xml')) {
      throw new Error('DMN file does not appear to be valid XML');
    }

    // Check for required elements
    if (!bpmnContent.includes('policy-management-process')) {
      throw new Error('BPMN file missing process ID: policy-management-process');
    }
    if (!dmnContent.includes('policy-approval-decision')) {
      throw new Error('DMN file missing decision ID: policy-approval-decision');
    }

    console.log('\n✅ Basic validation passed');
    console.log('- BPMN contains process ID: policy-management-process');
    console.log('- DMN contains decision ID: policy-approval-decision');

    // Show key elements
    console.log('\n📋 BPMN Process Elements:');
    const bpmnElements = [
      'StartEvent_1',
      'Task_Evaluate', 
      'Gateway_1',
      'Task_Review',
      'EndEvent_AutoApproved',
      'EndEvent_Reviewed'
    ];
    
    bpmnElements.forEach(element => {
      if (bpmnContent.includes(element)) {
        console.log(`  ✅ ${element}`);
      } else {
        console.log(`  ❌ ${element} - MISSING`);
      }
    });

    console.log('\n📋 DMN Decision Elements:');
    const dmnElements = [
      'Input_RiskLevel',
      'Output_AutoApprove',
      'Rule_1',
      'Rule_2'
    ];
    
    dmnElements.forEach(element => {
      if (dmnContent.includes(element)) {
        console.log(`  ✅ ${element}`);
      } else {
        console.log(`  ❌ ${element} - MISSING`);
      }
    });

    console.log('\n🎯 Files are ready for deployment!');

  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  }
}

validateFiles();
