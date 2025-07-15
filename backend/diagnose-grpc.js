const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { Camunda8 } = require('@camunda8/sdk');
const https = require('https');
const dns = require('dns');

async function diagnoseGrpcConnectivity() {
  console.log('🔍 COMPREHENSIVE gRPC CONNECTIVITY DIAGNOSIS\n');
  
  // 1. Environment Check
  console.log('1️⃣ ENVIRONMENT CONFIGURATION:');
  console.log('- CAMUNDA_CLUSTER_ID:', process.env.CAMUNDA_CLUSTER_ID);
  console.log('- CAMUNDA_CLIENT_ID:', process.env.CAMUNDA_CLIENT_ID?.substring(0, 10) + '...');
  console.log('- CAMUNDA_OAUTH_URL:', process.env.CAMUNDA_OAUTH_URL);
  console.log('- ZEEBE_ADDRESS:', process.env.ZEEBE_ADDRESS);
  console.log('- ZEEBE_REST_ADDRESS:', process.env.ZEEBE_REST_ADDRESS);
  
  // 2. DNS Resolution Test
  console.log('\n2️⃣ DNS RESOLUTION TEST:');
  const hostname = process.env.ZEEBE_ADDRESS?.split(':')[0];
  if (hostname) {
    try {
      const addresses = await new Promise((resolve, reject) => {
        dns.lookup(hostname, { all: true }, (err, addresses) => {
          if (err) reject(err);
          else resolve(addresses);
        });
      });
      console.log('✅ DNS Resolution successful:');
      addresses.forEach(addr => console.log(`   - ${addr.address} (${addr.family})`));
    } catch (error) {
      console.log('❌ DNS Resolution failed:', error.message);
    }
  }

  // 3. HTTPS Connectivity Test
  console.log('\n3️⃣ HTTPS CONNECTIVITY TEST:');
  if (process.env.ZEEBE_REST_ADDRESS) {
    try {
      const url = new URL(process.env.ZEEBE_REST_ADDRESS);
      await new Promise((resolve, reject) => {
        const req = https.request({
          hostname: url.hostname,
          port: url.port || 443,
          path: '/',
          method: 'GET',
          timeout: 10000
        }, (res) => {
          console.log('✅ HTTPS connection successful:');
          console.log(`   - Status: ${res.statusCode}`);
          console.log(`   - Headers: ${JSON.stringify(res.headers, null, 2)}`);
          resolve();
        });
        
        req.on('error', reject);
        req.on('timeout', () => reject(new Error('Request timeout')));
        req.end();
      });
    } catch (error) {
      console.log('❌ HTTPS connection failed:', error.message);
    }
  }

  // 4. OAuth Token Test
  console.log('\n4️⃣ OAUTH TOKEN TEST:');
  try {
    const camunda = new Camunda8();
    // Try to initialize - this should trigger OAuth
    console.log('✅ Camunda8 SDK initialized (OAuth should work)');
  } catch (error) {
    console.log('❌ OAuth/SDK initialization failed:', error.message);
  }

  // 5. gRPC Endpoint Analysis
  console.log('\n5️⃣ gRPC ENDPOINT ANALYSIS:');
  const grpcEndpoint = process.env.ZEEBE_ADDRESS;
  if (grpcEndpoint) {
    const [host, port] = grpcEndpoint.split(':');
    console.log('- Host:', host);
    console.log('- Port:', port);
    console.log('- Expected format: {cluster-id}.{region}.zeebe.camunda.io:443');
    
    // Validate format
    const expectedPattern = /^[a-f0-9-]+\.[a-z0-9-]+\.zeebe\.camunda\.io:443$/;
    if (expectedPattern.test(grpcEndpoint)) {
      console.log('✅ Endpoint format is correct');
    } else {
      console.log('❌ Endpoint format might be incorrect');
    }
  }

  // 6. Alternative Endpoint Test
  console.log('\n6️⃣ ALTERNATIVE ENDPOINT FORMATS:');
  const clusterId = process.env.CAMUNDA_CLUSTER_ID;
  if (clusterId) {
    const alternatives = [
      `${clusterId}.bru-2.zeebe.camunda.io:443`,
      `${clusterId}.zeebe.camunda.io:443`,
      `bru-2.zeebe.camunda.io:443`,
    ];
    
    console.log('Trying alternative endpoints:');
    for (const alt of alternatives) {
      console.log(`- ${alt}`);
      if (alt === process.env.ZEEBE_ADDRESS) {
        console.log('  (current)');
      }
    }
  }

  // 7. SDK Version Check
  console.log('\n7️⃣ SDK VERSION CHECK:');
  try {
    const packageJson = require('@camunda8/sdk/package.json');
    console.log('- @camunda8/sdk version:', packageJson.version);
    console.log('- Recommended: Latest stable version');
  } catch (error) {
    console.log('❌ Could not determine SDK version');
  }

  // 8. Direct gRPC Test with Error Details
  console.log('\n8️⃣ DETAILED gRPC CONNECTION TEST:');
  try {
    const camunda = new Camunda8();
    const zeebe = camunda.getZeebeGrpcApiClient();
    
    console.log('Attempting topology call with detailed error handling...');
    const topology = await zeebe.topology();
    console.log('✅ gRPC connection successful!');
    console.log('Topology:', JSON.stringify(topology, null, 2));
  } catch (error) {
    console.log('❌ gRPC connection failed with detailed error:');
    console.log('- Error code:', error.code);
    console.log('- Error message:', error.message);
    console.log('- Error details:', error.details);
    console.log('- Error metadata:', error.metadata);
    
    // Specific 404 analysis
    if (error.message.includes('404')) {
      console.log('\n🔍 404 ERROR ANALYSIS:');
      console.log('This typically means:');
      console.log('1. Cluster is not active/running');
      console.log('2. Wrong region endpoint');
      console.log('3. Cluster has been deleted/suspended');
      console.log('4. Network/firewall blocking connection');
      console.log('5. Incorrect cluster ID in endpoint');
    }
  }

  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Check cluster status in Camunda Console');
  console.log('2. Verify cluster region and ID');
  console.log('3. Try alternative endpoint formats if needed');
  console.log('4. Check network/firewall settings');
}

diagnoseGrpcConnectivity().catch(console.error);
