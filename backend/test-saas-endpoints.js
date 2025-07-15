const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const dns = require('dns');

async function testSaaSEndpoints() {
  console.log('🧪 TESTING CAMUNDA 8 SAAS ENDPOINT FORMATS\n');
  
  const clusterId = process.env.CAMUNDA_CLUSTER_ID;
  
  // Test different SaaS endpoint patterns
  const saasFormats = [
    // Standard SaaS format
    `${clusterId}.zeebe.camunda.io`,
    
    // Regional SaaS formats
    `${clusterId}.us.zeebe.camunda.io`,
    `${clusterId}.na.zeebe.camunda.io`,
    `${clusterId}.america.zeebe.camunda.io`,
    
    // Alternative patterns
    `zeebe-${clusterId}.camunda.io`,
    `${clusterId}-zeebe.camunda.io`,
    
    // Direct cluster endpoints
    `cluster-${clusterId}.zeebe.camunda.io`,
    `${clusterId}.cluster.zeebe.camunda.io`,
    
    // Legacy patterns
    `${clusterId}.zeebe.ultrawombat.com`,
    
    // New SaaS patterns (if they exist)
    `${clusterId}.saas.zeebe.camunda.io`,
    `${clusterId}.cloud.zeebe.camunda.io`,
  ];

  console.log('Testing DNS resolution for SaaS endpoint formats...\n');

  for (const hostname of saasFormats) {
    try {
      const addresses = await new Promise((resolve, reject) => {
        dns.lookup(hostname, { all: true }, (err, addresses) => {
          if (err) reject(err);
          else resolve(addresses);
        });
      });
      
      console.log(`✅ FOUND: ${hostname}`);
      addresses.forEach(addr => console.log(`   → ${addr.address} (${addr.family})`));
      
      console.log(`\n🎯 WORKING ENDPOINT FOUND: ${hostname}`);
      console.log('Update your .env file with:');
      console.log(`ZEEBE_ADDRESS=${hostname}:443`);
      console.log(`ZEEBE_REST_ADDRESS=https://${hostname.replace('.zeebe.camunda.io', '')}.zeebe.camunda.io`);
      
      // Test the connection immediately
      console.log('\n🧪 Testing connection with found endpoint...');
      process.env.ZEEBE_ADDRESS = `${hostname}:443`;
      
      try {
        const { Camunda8 } = require('@camunda8/sdk');
        const camunda = new Camunda8();
        const zeebe = camunda.getZeebeGrpcApiClient();
        
        // Quick topology test with timeout
        const topology = await Promise.race([
          zeebe.topology(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
        ]);
        
        console.log('✅ CONNECTION SUCCESSFUL!');
        console.log('Topology:', JSON.stringify(topology, null, 2));
        return;
        
      } catch (connError) {
        console.log('❌ Connection test failed:', connError.message);
      }
      
    } catch (error) {
      console.log(`❌ ${hostname}: DNS resolution failed`);
    }
  }

  console.log('\n🎯 MANUAL ENDPOINT LOOKUP REQUIRED');
  console.log('None of the common endpoint formats worked.');
  console.log('Please check Camunda Console for the exact endpoint.');
  
  console.log('\n📋 Steps:');
  console.log('1. Go to: https://console.cloud.camunda.io/');
  console.log('2. Click on your cluster');
  console.log('3. Look for "API" or "Connection" tab');
  console.log('4. Find the Zeebe gRPC endpoint');
  console.log('5. It should end with ":443"');
}

testSaaSEndpoints().catch(console.error);
