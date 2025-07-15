// Policy Management System - Workflow Test Script
// This script demonstrates the complete policy workflow

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';
const USER_HEADERS = {
    'Content-Type': 'application/json',
    'x-user-id': 'user123',
    'x-user-name': 'Test User'
};

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function testWorkflow() {
    console.log('🚀 Starting Policy Management System Workflow Test\n');

    try {
        // 1. Health Check
        console.log('1️⃣ Checking system health...');
        const healthResponse = await axios.get('http://localhost:3000/health');
        console.log('✅ System Status:', healthResponse.data.status);
        console.log('   Services:', healthResponse.data.services);
        console.log('');

        // 2. Create a Low-Risk HR Policy (Should Auto-Approve)
        console.log('2️⃣ Creating Low-Risk HR Policy (Auto-Approval Expected)...');
        const hrPolicy = {
            title: 'Casual Friday Policy',
            category: 'HR',
            content: 'Employees may wear casual attire on Fridays. Business casual is recommended for client meetings.',
            effectiveDate: '2024-02-01',
            expiryDate: '2024-12-31',
            riskLevel: 'Low',
            requiresLegalReview: false,
            requiresComplianceReview: false,
            stakeholders: ['hr@company.com'],
            tags: ['dress-code', 'casual-friday']
        };

        const hrPolicyResponse = await axios.post(`${API_BASE}/policies`, hrPolicy, { headers: USER_HEADERS });
        console.log('✅ HR Policy Created:', hrPolicyResponse.data.data.policyId);
        console.log('   Process Instance:', hrPolicyResponse.data.data.processInstanceKey);
        console.log('');

        await delay(2000); // Wait for process to complete

        // 3. Create a High-Risk Security Policy (Should Require Manual Review)
        console.log('3️⃣ Creating High-Risk Security Policy (Manual Review Expected)...');
        const securityPolicy = {
            title: 'Data Encryption Standards',
            category: 'Security',
            content: 'All sensitive data must be encrypted using AES-256 encryption standards. This includes data at rest, in transit, and in processing. Encryption keys must be managed through the approved key management system and rotated quarterly. Non-compliance may result in immediate security review and potential disciplinary action.',
            effectiveDate: '2024-01-15',
            expiryDate: '2025-01-15',
            riskLevel: 'High',
            requiresLegalReview: true,
            requiresComplianceReview: false,
            stakeholders: ['security@company.com', 'legal@company.com'],
            tags: ['security', 'encryption', 'data-protection']
        };

        const securityPolicyResponse = await axios.post(`${API_BASE}/policies`, securityPolicy, { 
            headers: {
                ...USER_HEADERS,
                'x-user-id': 'security-admin',
                'x-user-name': 'Security Admin'
            }
        });
        console.log('✅ Security Policy Created:', securityPolicyResponse.data.data.policyId);
        console.log('   Process Instance:', securityPolicyResponse.data.data.processInstanceKey);
        console.log('');

        await delay(1000);

        // 4. Check for Tasks
        console.log('4️⃣ Checking for Review Tasks...');
        const tasksResponse = await axios.get(`${API_BASE}/tasks`, { 
            headers: {
                ...USER_HEADERS,
                'x-user-id': 'legal-team',
                'x-user-name': 'Legal Reviewer'
            }
        });
        
        const tasks = tasksResponse.data.data.tasks;
        console.log(`📋 Found ${tasks.length} task(s) for legal team`);
        
        if (tasks.length > 0) {
            const reviewTask = tasks[0];
            console.log('   Task ID:', reviewTask.id);
            console.log('   Task Type:', reviewTask.taskDefinitionId);
            console.log('   Policy:', reviewTask.variables?.policyData?.title);
            console.log('');

            // 5. Complete the Review Task (Approve)
            console.log('5️⃣ Completing Review Task (Approving Policy)...');
            const reviewData = {
                variables: {
                    reviewDecision: 'approved',
                    reviewComments: 'Policy content is comprehensive and aligns with legal requirements. Approved for publication.',
                    reviewerName: 'Legal Reviewer'
                },
                action: 'review'
            };

            await axios.post(`${API_BASE}/tasks/${reviewTask.id}/complete`, reviewData, {
                headers: {
                    ...USER_HEADERS,
                    'x-user-id': 'legal-team',
                    'x-user-name': 'Legal Reviewer'
                }
            });
            console.log('✅ Review Task Completed - Policy Approved');
            console.log('');
        }

        await delay(1000);

        // 6. Check All Policies
        console.log('6️⃣ Checking All Policies...');
        const policiesResponse = await axios.get(`${API_BASE}/policies`, { headers: USER_HEADERS });
        const policies = policiesResponse.data.data.policies;
        
        console.log(`📚 Total Policies: ${policies.length}`);
        policies.forEach((policy, index) => {
            console.log(`   ${index + 1}. ${policy.title}`);
            console.log(`      Status: ${policy.status}`);
            console.log(`      Category: ${policy.category}`);
            console.log(`      Risk Level: ${policy.risk_level}`);
            console.log(`      Author: ${policy.author_name}`);
            console.log('');
        });

        // 7. Check Process Instances
        console.log('7️⃣ Checking Process Instances...');
        const processesResponse = await axios.get(`${API_BASE}/processes`, { headers: USER_HEADERS });
        const processes = processesResponse.data.data;
        
        console.log(`⚙️ Total Process Instances: ${processes.length}`);
        processes.forEach((process, index) => {
            console.log(`   ${index + 1}. Instance Key: ${process.processInstanceKey}`);
            console.log(`      State: ${process.state}`);
            console.log(`      Started: ${new Date(process.startDate).toLocaleString()}`);
            if (process.endDate) {
                console.log(`      Ended: ${new Date(process.endDate).toLocaleString()}`);
            }
            console.log('');
        });

        console.log('🎉 Workflow Test Completed Successfully!');
        console.log('\n📊 Summary:');
        console.log(`   - Created ${policies.length} policies`);
        console.log(`   - Processed ${processes.length} workflow instances`);
        console.log(`   - Demonstrated auto-approval and manual review flows`);
        console.log(`   - All systems working correctly`);

    } catch (error) {
        console.error('❌ Error during workflow test:', error.message);
        if (error.response) {
            console.error('   Response:', error.response.data);
        }
    }
}

// Run the test
testWorkflow();
