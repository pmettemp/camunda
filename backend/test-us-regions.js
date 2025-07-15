const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const dns = require('dns');

async function testUSRegionFormats() {
  console.log('🧪 TESTING US REGION ENDPOINT FORMATS\n');
  
  const clusterId = process.env.CAMUNDA_CLUSTER_ID;
  
  // Common US region formats for Camunda 8 Cloud
  const regionFormats = [
    'us-central1',      // Google Cloud format
    'us-central',       // Simplified
    'us-east1',         // Alternative US region
    'us-east',          // Simplified
    'us-west1',         // Alternative US region  
    'us-west',          // Simplified
    'usa-central1',     // Alternative naming
    'central-us',       // Azure-style format
    'east-us',          // Azure-style format
    'iowa',             // Direct region name
    'us',               // Simple US
    'na-central1',      // North America format
    'na-central',       // North America simplified
  ];

  console.log('Testing DNS resolution for different region formats...\n');

  for (const region of regionFormats) {
    const hostname = `${clusterId}.${region}.zeebe.camunda.io`;
    
    try {
      const addresses = await new Promise((resolve, reject) => {
        dns.lookup(hostname, { all: true }, (err, addresses) => {
          if (err) reject(err);
          else resolve(addresses);
        });
      });
      
      console.log(`✅ ${region}: ${hostname}`);
      addresses.forEach(addr => console.log(`   → ${addr.address} (${addr.family})`));
      
      // If we found a working endpoint, update the recommendation
      console.log(`\n🎯 WORKING ENDPOINT FOUND: ${hostname}`);
      console.log('Update your .env file with:');
      console.log(`ZEEBE_ADDRESS=${hostname}:443`);
      console.log(`ZEEBE_REST_ADDRESS=https://${region}.zeebe.camunda.io/${clusterId}`);
      break;
      
    } catch (error) {
      console.log(`❌ ${region}: DNS resolution failed`);
    }
  }

  console.log('\n📋 Alternative: Check Camunda Console');
  console.log('1. Go to: https://console.cloud.camunda.io/');
  console.log('2. Click on your cluster');
  console.log('3. Look for "Connection Information" or "Endpoints"');
  console.log('4. Copy the exact Zeebe gRPC endpoint');
}

testUSRegionFormats().catch(console.error);
