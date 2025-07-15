const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

async function getAccessToken() {
  try {
    const response = await axios.post(process.env.CAMUNDA_OAUTH_URL, {
      grant_type: 'client_credentials',
      audience: 'zeebe.camunda.io',
      client_id: process.env.CAMUNDA_CLIENT_ID,
      client_secret: process.env.CAMUNDA_CLIENT_SECRET
    });
    return response.data.access_token;
  } catch (error) {
    throw new Error(`Failed to get access token: ${error.message}`);
  }
}

async function deployViaRest() {
  try {
    console.log('🚀 Attempting REST API deployment...');

    // Get access token
    console.log('Getting OAuth token...');
    const token = await getAccessToken();
    console.log('✅ Token obtained');

    // Prepare files
    const bpmnPath = path.join(__dirname, '../bpmn/policy-management.bpmn');
    const dmnPath = path.join(__dirname, '../dmn/policy-approval-decision.dmn');

    if (!fs.existsSync(bpmnPath) || !fs.existsSync(dmnPath)) {
      throw new Error('BPMN or DMN files not found');
    }

    // Create form data
    const form = new FormData();
    form.append('deployment-name', 'policy-management-deployment');
    form.append('deployment-source', 'nodejs-script');
    form.append('policy-management.bpmn', fs.createReadStream(bpmnPath));
    form.append('policy-approval-decision.dmn', fs.createReadStream(dmnPath));

    // REST API endpoint
    const deployUrl = `${process.env.ZEEBE_REST_ADDRESS}/v1/deployments`;
    
    console.log('Deploying to:', deployUrl);

    const response = await axios.post(deployUrl, form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });

    console.log('✅ Deployment successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('❌ REST deployment failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    
    console.log('\n🎯 Alternative: Manual Deployment');
    console.log('1. Go to https://console.cloud.camunda.io/');
    console.log('2. Open Web Modeler');
    console.log('3. Upload these files:');
    console.log('   - bpmn/policy-management.bpmn');
    console.log('   - dmn/policy-approval-decision.dmn');
    console.log('4. Deploy to cluster:', process.env.CAMUNDA_CLUSTER_ID);
  }
}

deployViaRest();
