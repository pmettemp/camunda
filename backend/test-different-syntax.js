const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { Camunda8 } = require('@camunda8/sdk');

async function testDifferentSyntax() {
  console.log('🧪 TESTING DIFFERENT GATEWAY CONDITION SYNTAX\n');
  
  try {
    console.log('🎯 RESEARCH: Camunda 8 Gateway Condition Syntax');
    console.log('In Camunda 8, gateway conditions should use FEEL expressions');
    console.log('Possible correct syntaxes:');
    console.log('1. =decision.autoApprove (boolean evaluation)');
    console.log('2. =decision.autoApprove = true (assignment - WRONG)');
    console.log('3. =decision.autoApprove == true (comparison)');
    console.log('4. decision.autoApprove (without =)');
    console.log('5. =not(decision.autoApprove) (for false condition)');
    
    console.log('\n🔍 CURRENT ISSUE ANALYSIS:');
    console.log('❌ Current: =decision.autoApprove = true');
    console.log('❌ This is ASSIGNMENT, not comparison!');
    console.log('✅ Should be: =decision.autoApprove');
    console.log('✅ Or: =not(decision.autoApprove) for false path');
    
    console.log('\n📊 RECOMMENDED FIX:');
    console.log('Auto-Approve path: =decision.autoApprove');
    console.log('Manual Review path: =not(decision.autoApprove)');
    console.log('Or use: =decision.autoApprove = false (but this is assignment)');
    
    console.log('\n🎯 THE REAL PROBLEM:');
    console.log('We are using ASSIGNMENT (=) instead of EVALUATION');
    console.log('=decision.autoApprove = true assigns true to decision.autoApprove');
    console.log('=decision.autoApprove evaluates the boolean value');
    
    console.log('\n🔧 SOLUTION:');
    console.log('Change gateway conditions to:');
    console.log('1. Auto-Approve: =decision.autoApprove');
    console.log('2. Manual Review: =not(decision.autoApprove)');
    
    console.log('\n📝 NEXT STEPS:');
    console.log('1. First check the test process instance 4503599627429447');
    console.log('2. If it also went to Manual Review, confirm syntax issue');
    console.log('3. Update BPMN with correct FEEL syntax');
    console.log('4. Redeploy and test');
    
    console.log('\n🔗 Check Results:');
    console.log('https://dsm-1.operate.camunda.io/a80eef2c-b689-41e6-9e83-3e89383def8c');
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
  }
}

testDifferentSyntax();
