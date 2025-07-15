const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { Camunda8 } = require('@camunda8/sdk');

describe('Camunda 8 Connectivity Tests', () => {
  let camunda;
  let zeebe;
  let operate;

  beforeAll(async () => {
    // Initialize Camunda SDK once for all tests
    camunda = new Camunda8();
    zeebe = camunda.getZeebeGrpcApiClient();
    operate = camunda.getOperateApiClient();
  });

  afterAll(async () => {
    // Clean up connections
    if (zeebe) {
      await zeebe.close();
    }
  });

  describe('Environment Configuration', () => {
    test('should have all required environment variables', () => {
      expect(process.env.CAMUNDA_CLUSTER_ID).toBeDefined();
      expect(process.env.CAMUNDA_CLIENT_ID).toBeDefined();
      expect(process.env.CAMUNDA_CLIENT_SECRET).toBeDefined();
      expect(process.env.CAMUNDA_OAUTH_URL).toBeDefined();
      expect(process.env.ZEEBE_ADDRESS).toBeDefined();
      expect(process.env.CAMUNDA_OPERATE_BASE_URL).toBeDefined();
    });

    test('should have valid cluster configuration', () => {
      expect(process.env.CAMUNDA_CLUSTER_ID).toMatch(/^[a-f0-9-]+$/);
      expect(process.env.CAMUNDA_OAUTH_URL).toContain('login.cloud.camunda.io');
      expect(process.env.ZEEBE_ADDRESS).toContain('zeebe.camunda.io');
    });
  });

  describe('Client Initialization', () => {
    test('should initialize Camunda8 SDK successfully', () => {
      expect(camunda).toBeDefined();
      expect(camunda).toBeInstanceOf(Object);
    });

    test('should create Zeebe gRPC client', () => {
      expect(zeebe).toBeDefined();
      expect(typeof zeebe.topology).toBe('function');
      expect(typeof zeebe.createProcessInstance).toBe('function');
    });

    test('should create Operate client', () => {
      expect(operate).toBeDefined();
      expect(typeof operate.searchProcessDefinitions).toBe('function');
      expect(typeof operate.searchProcessInstances).toBe('function');
    });

    test('should create Zeebe REST client', () => {
      const zeebeRest = camunda.getZeebeRestClient();
      expect(zeebeRest).toBeDefined();
    });
  });

  describe('Connectivity Tests', () => {
    test('should connect to Zeebe and get topology', async () => {
      const topology = await zeebe.topology();
      
      expect(topology).toBeDefined();
      expect(topology.brokers).toBeDefined();
      expect(Array.isArray(topology.brokers)).toBe(true);
      expect(topology.brokers.length).toBeGreaterThan(0);
      expect(topology.clusterSize).toBeGreaterThan(0);
      expect(topology.partitionsCount).toBeGreaterThan(0);
      expect(topology.replicationFactor).toBeGreaterThan(0);
      expect(topology.gatewayVersion).toBeDefined();
    }, 10000);

    test('should verify cluster health', async () => {
      const topology = await zeebe.topology();
      
      // Check that all brokers are healthy
      topology.brokers.forEach(broker => {
        expect(broker.nodeId).toBeDefined();
        expect(broker.host).toBeDefined();
        expect(broker.port).toBeDefined();
        expect(broker.version).toBeDefined();
        expect(broker.partitions).toBeDefined();
        expect(Array.isArray(broker.partitions)).toBe(true);
        
        // Check partition health
        broker.partitions.forEach(partition => {
          expect(partition.partitionId).toBeDefined();
          expect(partition.role).toMatch(/^(LEADER|FOLLOWER)$/);
          expect(partition.health).toBe('HEALTHY');
        });
      });
    }, 10000);
  });

  describe('Process Management', () => {
    test('should list deployed process definitions', async () => {
      const processDefinitions = await operate.searchProcessDefinitions({
        filter: {},
        size: 10
      });
      
      expect(processDefinitions).toBeDefined();
      expect(processDefinitions.items).toBeDefined();
      expect(Array.isArray(processDefinitions.items)).toBe(true);
      
      // Should have at least our policy management process
      const policyProcess = processDefinitions.items.find(
        p => p.bpmnProcessId === 'policy-management-process'
      );
      expect(policyProcess).toBeDefined();
    }, 10000);

    test('should create a test process instance', async () => {
      const testVariables = {
        policyData: {
          title: "Jest Test Policy",
          category: "Test",
          content: "This is a test policy created by Jest",
          riskLevel: "Low",
          authorId: "jest-test",
          authorName: "Jest Test User"
        },
        policyAuthor: "jest-test"
      };

      const processInstance = await zeebe.createProcessInstance({
        bpmnProcessId: 'policy-management-process',
        variables: testVariables
      });

      expect(processInstance).toBeDefined();
      expect(processInstance.processInstanceKey).toBeDefined();
      expect(processInstance.processDefinitionKey).toBeDefined();
      expect(processInstance.bpmnProcessId).toBe('policy-management-process');
      expect(processInstance.version).toBeGreaterThan(0);
    }, 10000);
  });

  describe('Error Handling', () => {
    test('should handle invalid process ID gracefully', async () => {
      await expect(
        zeebe.createProcessInstance({
          bpmnProcessId: 'non-existent-process',
          variables: {}
        })
      ).rejects.toThrow();
    });

    test('should handle network timeouts gracefully', async () => {
      // This test verifies that the client handles timeouts properly
      // The actual timeout behavior depends on the SDK configuration
      const startTime = Date.now();
      
      try {
        await zeebe.topology();
        const duration = Date.now() - startTime;
        expect(duration).toBeLessThan(30000); // Should complete within 30 seconds
      } catch (error) {
        // If it fails, it should fail quickly, not hang indefinitely
        const duration = Date.now() - startTime;
        expect(duration).toBeLessThan(30000);
      }
    });
  });
});
