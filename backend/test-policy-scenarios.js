const axios = require('axios');

const API_URL = 'http://localhost:3001';

async function testPolicyScenarios() {
  console.log('🧪 TESTING DIFFERENT POLICY SCENARIOS\n');
  
  const scenarios = [
    {
      name: "Low Risk HR Policy",
      policy: {
        title: "Employee Dress Code",
        category: "HR",
        content: "Guidelines for appropriate workplace attire",
        riskLevel: "Low",
        authorId: "hr-manager",
        authorName: "HR Manager"
      },
      expectedOutcome: "Auto-Approved"
    },
    {
      name: "Medium Risk IT Policy", 
      policy: {
        title: "Password Security Requirements",
        category: "IT",
        content: "New password complexity requirements for all systems",
        riskLevel: "Medium",
        authorId: "it-admin",
        authorName: "IT Administrator"
      },
      expectedOutcome: "Manual Review Required"
    },
    {
      name: "High Risk Legal Policy",
      policy: {
        title: "Data Privacy Compliance",
        category: "Legal",
        content: "Updated data handling procedures for GDPR compliance",
        riskLevel: "High", 
        authorId: "legal-counsel",
        authorName: "Legal Counsel"
      },
      expectedOutcome: "Manual Review Required"
    },
    {
      name: "Critical Risk Security Policy",
      policy: {
        title: "Emergency Security Protocol",
        category: "Security",
        content: "Immediate security measures for threat response",
        riskLevel: "Critical",
        authorId: "security-chief",
        authorName: "Security Chief"
      },
      expectedOutcome: "Manual Review Required"
    },
    {
      name: "Low Risk Operations Policy",
      policy: {
        title: "Office Supplies Ordering",
        category: "Operations", 
        content: "Simple procedure for ordering office supplies",
        riskLevel: "Low",
        authorId: "office-manager",
        authorName: "Office Manager"
      },
      expectedOutcome: "Auto-Approved"
    }
  ];
  
  const results = [];
  
  for (let i = 0; i < scenarios.length; i++) {
    const scenario = scenarios[i];
    console.log(`${i + 1}️⃣ Testing: ${scenario.name}`);
    console.log(`   Risk Level: ${scenario.policy.riskLevel}`);
    console.log(`   Expected: ${scenario.expectedOutcome}`);
    
    try {
      const response = await axios.post(`${API_URL}/api/policies`, scenario.policy);
      
      console.log(`   ✅ Created: Process Instance ${response.data.processInstanceId}`);
      
      results.push({
        scenario: scenario.name,
        riskLevel: scenario.policy.riskLevel,
        expected: scenario.expectedOutcome,
        processInstance: response.data.processInstanceId,
        status: 'Created'
      });
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
      results.push({
        scenario: scenario.name,
        riskLevel: scenario.policy.riskLevel,
        expected: scenario.expectedOutcome,
        status: 'Failed',
        error: error.message
      });
    }
    
    console.log('');
  }
  
  // Summary
  console.log('📊 SCENARIO TEST SUMMARY:');
  console.log('═'.repeat(80));
  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.scenario}`);
    console.log(`   Risk: ${result.riskLevel} | Expected: ${result.expected}`);
    console.log(`   Status: ${result.status}`);
    if (result.processInstance) {
      console.log(`   Process Instance: ${result.processInstance}`);
    }
    console.log('');
  });
  
  console.log('🎯 NEXT STEPS:');
  console.log('1. Check Camunda Operate to see process states:');
  console.log('   https://dsm-1.operate.camunda.io/a80eef2c-b689-41e6-9e83-3e89383def8c');
  console.log('2. Low Risk policies should be auto-approved (completed)');
  console.log('3. Other risk levels should be waiting for manual review');
  console.log('4. DMN decision table should show different outcomes');
}

testPolicyScenarios();
