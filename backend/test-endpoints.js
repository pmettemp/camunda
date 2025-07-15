const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { Camunda8 } = require('@camunda8/sdk');

async function testAlternativeEndpoints() {
  console.log('🧪 TESTING ALTERNATIVE ENDPOINTS AND CONFIGURATIONS\n');
  
  const clusterId = process.env.CAMUNDA_CLUSTER_ID;
  const clientId = process.env.CAMUNDA_CLIENT_ID;
  const clientSecret = process.env.CAMUNDA_CLIENT_SECRET;
  const oauthUrl = process.env.CAMUNDA_OAUTH_URL;

  // Test different endpoint configurations
  const endpointConfigs = [
    {
      name: 'Current Configuration',
      config: {
        ZEEBE_ADDRESS: `${clusterId}.bru-2.zeebe.camunda.io:443`,
        CAMUNDA_CLUSTER_ID: clusterId,
        CAMUNDA_CLIENT_ID: clientId,
        CAMUNDA_CLIENT_SECRET: clientSecret,
        CAMUNDA_OAUTH_URL: oauthUrl
      }
    },
    {
      name: 'Alternative Region Format',
      config: {
        ZEEBE_ADDRESS: `${clusterId}.zeebe.camunda.io:443`,
        CAMUNDA_CLUSTER_ID: clusterId,
        CAMUNDA_CLIENT_ID: clientId,
        CAMUNDA_CLIENT_SECRET: clientSecret,
        CAMUNDA_OAUTH_URL: oauthUrl
      }
    },
    {
      name: 'Direct SDK Configuration',
      config: {
        CAMUNDA_CLUSTER_ID: clusterId,
        CAMUNDA_CLIENT_ID: clientId,
        CAMUNDA_CLIENT_SECRET: clientSecret,
        CAMUNDA_OAUTH_URL: oauthUrl,
        ZEEBE_GRPC_ADDRESS: `${clusterId}.bru-2.zeebe.camunda.io:443`
      }
    },
    {
      name: 'Explicit Configuration Object',
      config: {
        clusterId: clusterId,
        clientId: clientId,
        clientSecret: clientSecret,
        oAuthUrl: oauthUrl,
        zeebeGrpcAddress: `${clusterId}.bru-2.zeebe.camunda.io:443`
      }
    }
  ];

  for (const { name, config } of endpointConfigs) {
    console.log(`\n🔧 Testing: ${name}`);
    console.log('Configuration:', JSON.stringify(config, null, 2));
    
    try {
      // Set environment variables for this test
      Object.keys(config).forEach(key => {
        process.env[key] = config[key];
      });

      // Create Camunda instance
      let camunda;
      if (name === 'Explicit Configuration Object') {
        camunda = new Camunda8(config);
      } else {
        camunda = new Camunda8();
      }

      const zeebe = camunda.getZeebeGrpcApiClient();
      
      console.log('Attempting topology call...');
      const topology = await zeebe.topology();
      
      console.log('✅ SUCCESS! Connection established');
      console.log('Topology:', JSON.stringify(topology, null, 2));
      
      // If successful, we found the working configuration
      console.log('\n🎉 WORKING CONFIGURATION FOUND!');
      console.log('Use this configuration for your application.');
      break;
      
    } catch (error) {
      console.log('❌ Failed:', error.message);
      if (error.code) {
        console.log('   Error code:', error.code);
      }
    }
  }

  // Test with different OAuth audiences
  console.log('\n🔐 TESTING OAUTH AUDIENCES:');
  const audiences = [
    'zeebe.camunda.io',
    'operate.camunda.io', 
    'tasklist.camunda.io',
    `${clusterId}.bru-2.zeebe.camunda.io`
  ];

  for (const audience of audiences) {
    console.log(`\nTesting OAuth audience: ${audience}`);
    try {
      const camunda = new Camunda8({
        CAMUNDA_CLUSTER_ID: clusterId,
        CAMUNDA_CLIENT_ID: clientId,
        CAMUNDA_CLIENT_SECRET: clientSecret,
        CAMUNDA_OAUTH_URL: oauthUrl,
        CAMUNDA_OAUTH_AUDIENCE: audience,
        ZEEBE_ADDRESS: `${clusterId}.bru-2.zeebe.camunda.io:443`
      });

      const zeebe = camunda.getZeebeGrpcApiClient();
      const topology = await zeebe.topology();
      
      console.log('✅ SUCCESS with audience:', audience);
      console.log('Topology:', JSON.stringify(topology, null, 2));
      break;
      
    } catch (error) {
      console.log('❌ Failed with audience:', audience, '-', error.message);
    }
  }

  console.log('\n🎯 RECOMMENDATIONS:');
  console.log('1. Check Camunda Console for cluster status');
  console.log('2. Verify cluster is in "bru-2" region');
  console.log('3. Ensure cluster is not paused/suspended');
  console.log('4. Try manual deployment via Web Modeler');
  console.log('5. Contact Camunda support if cluster appears active but gRPC fails');
}

testAlternativeEndpoints().catch(console.error);
