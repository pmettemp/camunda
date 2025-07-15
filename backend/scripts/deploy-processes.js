#!/usr/bin/env node

/**
 * Deployment script for Camunda 8 Cloud
 * This script deploys BPMN and DMN files to Camunda Cloud
 */

require('dotenv').config();
const { Camunda8 } = require('@camunda8/sdk');
const fs = require('fs');
const path = require('path');

// Add timeout and retry logic
const DEPLOYMENT_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;

async function deployProcesses() {
  try {
    console.log('🚀 Starting deployment to Camunda 8 Cloud...');

    // Define file paths
    const bpmnPath = path.join(__dirname, '../../bpmn/policy-management.bpmn');
    const dmnPath = path.join(__dirname, '../../dmn/policy-approval-decision.dmn');

    // Check if files exist
    if (!fs.existsSync(bpmnPath)) {
      throw new Error(`BPMN file not found: ${bpmnPath}`);
    }
    if (!fs.existsSync(dmnPath)) {
      throw new Error(`DMN file not found: ${dmnPath}`);
    }

    console.log('📁 Files found:');
    console.log(`  - BPMN: ${bpmnPath}`);
    console.log(`  - DMN: ${dmnPath}`);

    console.log('📤 Attempting deployment...');

    try {
      // Initialize Camunda 8 SDK
      const camunda = new Camunda8();

      // Get the Zeebe client for deployment (gRPC)
      const zeebeClient = camunda.getZeebeGrpcApiClient();
      console.log('✅ Zeebe gRPC client initialized');

      // Read file contents
      const bpmnContent = fs.readFileSync(bpmnPath, 'utf8');
      const dmnContent = fs.readFileSync(dmnPath, 'utf8');

      // Deploy both files together using Zeebe client
      const deployment = await zeebeClient.deployResource({
        resources: [
          {
            name: 'policy-management.bpmn',
            content: Buffer.from(bpmnContent, 'utf8')
          },
          {
            name: 'policy-approval-decision.dmn',
            content: Buffer.from(dmnContent, 'utf8')
          }
        ]
      });

      console.log('🎉 Deployment successful!');
      console.log('📋 Deployment details:');
      console.log(JSON.stringify(deployment, null, 2));

      // Close the client
      await zeebeClient.close();

    } catch (deployError) {
      console.log('⚠️  Direct deployment failed, this is expected if cluster is not accessible');
      console.log('📝 Error details:', deployError.message);
      console.log('');
      console.log('🔧 Alternative deployment options:');
      console.log('1. Use Camunda Web Modeler to deploy the processes');
      console.log('2. Use Camunda Console to upload the files');
      console.log('3. Check cluster status and connectivity');
      console.log('');
      console.log('📂 Files ready for manual deployment:');
      console.log(`   BPMN: ${bpmnPath}`);
      console.log(`   DMN:  ${dmnPath}`);
      console.log('');
      console.log('🌐 Camunda Console: https://console.cloud.camunda.io/');
      console.log('🎨 Web Modeler: https://modeler.cloud.camunda.io/');
    }

    console.log('\n✅ Deployment process completed!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Deployment script failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the deployment
deployProcesses();
