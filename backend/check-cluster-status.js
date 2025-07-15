const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const https = require('https');

async function getOAuthToken() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      grant_type: 'client_credentials',
      audience: 'api.cloud.camunda.io',
      client_id: process.env.CAMUNDA_CLIENT_ID,
      client_secret: process.env.CAMUNDA_CLIENT_SECRET
    });

    const options = {
      hostname: 'login.cloud.camunda.io',
      port: 443,
      path: '/oauth/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.access_token) {
            resolve(response.access_token);
          } else {
            reject(new Error('No access token in response: ' + data));
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function checkClusterViaAPI() {
  console.log('🔍 CHECKING CLUSTER STATUS VIA CAMUNDA MANAGEMENT API\n');
  
  try {
    console.log('1️⃣ Getting OAuth token for Management API...');
    const token = await getOAuthToken();
    console.log('✅ OAuth token obtained');

    console.log('\n2️⃣ Fetching cluster information...');
    
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.cloud.camunda.io',
        port: 443,
        path: '/clusters',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            console.log('Response status:', res.statusCode);
            
            if (res.statusCode === 200) {
              const clusters = JSON.parse(data);
              console.log('✅ Successfully retrieved cluster list');
              
              const targetCluster = clusters.find(c => c.uuid === process.env.CAMUNDA_CLUSTER_ID);
              
              if (targetCluster) {
                console.log('\n🎯 FOUND YOUR CLUSTER:');
                console.log('- Name:', targetCluster.name);
                console.log('- UUID:', targetCluster.uuid);
                console.log('- Status:', targetCluster.status);
                console.log('- Region:', targetCluster.region);
                console.log('- Plan:', targetCluster.planType);
                console.log('- Created:', targetCluster.created);
                
                if (targetCluster.status !== 'Healthy') {
                  console.log('\n🚨 CLUSTER STATUS ISSUE:');
                  console.log(`Cluster status is "${targetCluster.status}" instead of "Healthy"`);
                  console.log('This explains the gRPC 404 errors!');
                  
                  if (targetCluster.status === 'Paused') {
                    console.log('\n💡 SOLUTION: Resume the cluster in Camunda Console');
                  }
                } else {
                  console.log('\n✅ Cluster appears healthy - investigating further...');
                  
                  // Check if region matches
                  if (targetCluster.region !== 'bru-2') {
                    console.log(`\n🚨 REGION MISMATCH:`);
                    console.log(`Expected: bru-2, Actual: ${targetCluster.region}`);
                    console.log('Update your ZEEBE_ADDRESS to use the correct region!');
                  }
                }
                
              } else {
                console.log('\n❌ CLUSTER NOT FOUND:');
                console.log('Your cluster ID was not found in the account.');
                console.log('Available clusters:');
                clusters.forEach(c => {
                  console.log(`- ${c.name} (${c.uuid}) - ${c.status} - ${c.region}`);
                });
              }
              
            } else {
              console.log('❌ API request failed:', res.statusCode);
              console.log('Response:', data);
            }
            
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      });

      req.on('error', reject);
      req.end();
    });

  } catch (error) {
    console.error('❌ Cluster status check failed:', error.message);
    
    console.log('\n🎯 MANUAL CHECK REQUIRED:');
    console.log('1. Go to: https://console.cloud.camunda.io/');
    console.log('2. Check if your cluster exists and is active');
    console.log('3. Verify cluster ID:', process.env.CAMUNDA_CLUSTER_ID);
    console.log('4. Check cluster region and status');
  }
}

checkClusterViaAPI().catch(console.error);
