# Camunda Operate & Cockpit Guide

This guide provides detailed instructions for monitoring and managing Policy Management workflows using Camunda Operate and Cockpit.

## 🎯 Overview

**Camunda Operate** is the monitoring and operations tool for Camunda 8 that allows you to:
- Monitor running and completed process instances
- Investigate incidents and resolve issues
- Analyze process performance and bottlenecks
- View process variables and audit trails

## 🚀 Accessing Camunda Operate

### Camunda 8 Cloud
1. Log in to [Camunda Cloud Console](https://console.cloud.camunda.io/)
2. Navigate to your cluster
3. Click on "Operate" to open the monitoring interface
4. Use your cluster credentials to authenticate

### Self-Managed Camunda 8
1. Open your browser and navigate to: `http://localhost:8081`
2. Default credentials:
   - Username: `demo`
   - Password: `demo`
3. For production, configure proper authentication

## 📊 Dashboard Overview

### Main Dashboard Components

#### 1. Process Instances Overview
- **Running Instances**: Currently active policy workflows
- **Completed Instances**: Successfully finished processes
- **Incidents**: Failed or stuck process instances
- **Total Instances**: Overall process execution count

#### 2. Process Definitions
- **policy-management-process**: Main policy workflow
- **Version Information**: Track deployed process versions
- **Instance Statistics**: Success/failure rates per version

#### 3. Decision Definitions
- **policy-approval-decision**: DMN decision table
- **Evaluation Statistics**: Decision execution metrics
- **Version History**: Track DMN table updates

## 🔍 Monitoring Policy Workflows

### 1. Viewing Process Instances

#### Filter by Process Definition
```
1. Click on "Processes" in the left sidebar
2. Select "policy-management-process"
3. View all instances of the policy workflow
```

#### Filter by Status
- **Running**: Currently executing workflows
- **Completed**: Successfully finished processes
- **Canceled**: Manually terminated processes
- **With Incidents**: Failed or problematic instances

#### Filter by Date Range
```
1. Use the date picker to select time range
2. Filter by start date, end date, or both
3. Useful for analyzing specific periods
```

### 2. Process Instance Details

#### Accessing Instance Details
```
1. Click on any process instance ID
2. View the process diagram with current state
3. See execution path and completed activities
```

#### Key Information Available
- **Process Variables**: All data flowing through the process
- **Activity History**: Step-by-step execution log
- **Incidents**: Any errors or failures
- **Duration**: Total execution time
- **User Tasks**: Manual tasks and assignments

### 3. Understanding Process Variables

#### Policy Data Variables
```json
{
  "policyData": {
    "id": "policy_1705312800000",
    "title": "Remote Work Policy 2024",
    "category": "HR",
    "riskLevel": "Low",
    "authorId": "user123",
    "authorName": "Jane Doe",
    "status": "draft",
    "contentWordCount": 245,
    "requiresLegalReview": false,
    "requiresComplianceReview": false
  }
}
```

#### Approval Decision Variables
```json
{
  "approvalDecision": {
    "autoApprove": false,
    "reviewer": "department-manager",
    "reviewerType": "Department Manager",
    "priority": "Medium",
    "reason": "Default manual review required"
  }
}
```

#### Review Result Variables
```json
{
  "reviewDecision": "approved",
  "reviewComments": "Policy looks good",
  "reviewerName": "John Smith",
  "reviewedAt": "2024-01-15T10:30:00Z"
}
```

## 🚨 Incident Management

### Common Incident Types

#### 1. Service Task Failures
**Symptoms**: Process stuck at service task (Publish Policy, Notify Stakeholders)
**Causes**:
- Database connection issues
- Email service unavailable
- File system permissions

**Resolution**:
```
1. Navigate to "Incidents" tab
2. Click on the failed instance
3. Review error message and stack trace
4. Fix underlying issue (restart service, fix permissions)
5. Click "Retry" to resume process
```

#### 2. User Task Assignment Issues
**Symptoms**: Tasks not appearing in task lists
**Causes**:
- Invalid assignee ID
- User not found in system
- Task list service down

**Resolution**:
```
1. Check process variables for correct assignee
2. Verify user exists in database
3. Restart task list service if needed
4. Manually reassign task if necessary
```

#### 3. DMN Evaluation Errors
**Symptoms**: Process fails at decision gateway
**Causes**:
- Invalid input data format
- Missing required variables
- DMN table logic errors

**Resolution**:
```
1. Review input variables for DMN evaluation
2. Check DMN table rules and conditions
3. Verify data types match expected format
4. Update process variables if needed
5. Retry the incident
```

### Incident Resolution Workflow
```
1. Identify Incident
   ↓
2. Analyze Error Message
   ↓
3. Check Process Variables
   ↓
4. Fix Root Cause
   ↓
5. Retry or Update Variables
   ↓
6. Monitor Resolution
```

## 📈 Performance Analysis

### 1. Process Performance Metrics

#### Key Metrics to Monitor
- **Average Duration**: How long policies take to complete
- **Throughput**: Number of policies processed per day/hour
- **Success Rate**: Percentage of successfully completed processes
- **Bottlenecks**: Activities taking longest time

#### Accessing Performance Data
```
1. Go to "Processes" → "policy-management-process"
2. Click on "Analytics" or "Statistics" tab
3. Review duration histograms and flow node statistics
4. Identify slow or problematic activities
```

### 2. Decision Table Analytics

#### DMN Performance Monitoring
```
1. Navigate to "Decisions" → "policy-approval-decision"
2. View evaluation statistics
3. Check rule hit frequency
4. Analyze decision outcomes distribution
```

#### Common Decision Patterns
- **Auto-Approval Rate**: Percentage of policies auto-approved
- **Review Type Distribution**: Legal vs Compliance vs Management
- **Risk Level Impact**: How risk affects routing decisions

## 🔧 Advanced Operations

### 1. Process Instance Migration

#### When to Migrate
- Process definition updates
- Bug fixes in deployed processes
- Schema changes

#### Migration Steps
```
1. Deploy new process version
2. Go to "Processes" → Select old version
3. Click "Migrate" button
4. Map activities between versions
5. Execute migration
6. Verify migrated instances
```

### 2. Bulk Operations

#### Cancel Multiple Instances
```
1. Filter instances by criteria
2. Select multiple instances (checkbox)
3. Click "Cancel Selected"
4. Confirm bulk cancellation
```

#### Update Variables in Bulk
```
1. Use Operate API for bulk updates
2. Script variable modifications
3. Apply to filtered instance sets
```

### 3. Process Instance Modification

#### Modify Running Instance
```
1. Open specific process instance
2. Click "Modify" button
3. Add/remove flow node instances
4. Update variables
5. Apply modifications
```

**Use Cases**:
- Skip problematic activities
- Add missing review steps
- Correct process flow errors

## 📊 Reporting and Analytics

### 1. Built-in Reports

#### Process Instance Report
- Total instances by status
- Duration statistics
- Incident frequency
- Activity completion rates

#### Decision Evaluation Report
- Rule hit frequency
- Decision outcome distribution
- Evaluation performance metrics

### 2. Custom Queries

#### Using Operate API
```javascript
// Get all policy processes in last 30 days
GET /v1/process-instances?processDefinitionKey=policy-management-process&startDate=2024-01-01

// Get incidents for specific process
GET /v1/incidents?processInstanceKey=12345

// Get process variables
GET /v1/process-instances/12345/variables
```

### 3. Export Data

#### Export Process Data
```
1. Filter instances by criteria
2. Click "Export" button
3. Choose format (CSV, JSON)
4. Download for external analysis
```

## 🔐 Security and Access Control

### 1. User Permissions

#### Role-Based Access
- **Operators**: View and manage all processes
- **Developers**: Deploy and modify processes
- **Viewers**: Read-only access to monitoring data

#### Configure Access
```
1. Access Identity service
2. Create user groups
3. Assign permissions per application
4. Map users to appropriate roles
```

### 2. Audit Logging

#### What Gets Logged
- Process instance state changes
- Variable modifications
- User actions (retry, cancel, modify)
- System events and errors

#### Accessing Audit Logs
```
1. Check Operate application logs
2. Use Elasticsearch queries for detailed analysis
3. Export audit data for compliance reporting
```

## 🚀 Best Practices

### 1. Monitoring Strategy

#### Daily Operations
- Check incident dashboard
- Review new process instances
- Monitor performance metrics
- Verify task assignments

#### Weekly Analysis
- Analyze process performance trends
- Review decision table effectiveness
- Check for recurring incidents
- Update monitoring alerts

### 2. Incident Response

#### Response Priorities
1. **Critical**: Process completely blocked
2. **High**: Multiple instances affected
3. **Medium**: Single instance issues
4. **Low**: Performance degradation

#### Response Procedures
```
1. Acknowledge incident within 15 minutes
2. Assess impact and priority
3. Investigate root cause
4. Apply fix and test
5. Document resolution
6. Implement prevention measures
```

### 3. Performance Optimization

#### Identify Bottlenecks
- Long-running user tasks
- Slow service task execution
- Complex DMN evaluations
- Database query performance

#### Optimization Strategies
- Optimize database queries
- Implement task assignment rules
- Simplify decision logic
- Add process timeouts
- Scale service workers

## 📞 Troubleshooting Common Issues

### Issue: Process Instances Not Visible
**Solution**:
```
1. Check process deployment status
2. Verify Operate is connected to correct Zeebe cluster
3. Refresh browser cache
4. Check user permissions
```

### Issue: Variables Not Updating
**Solution**:
```
1. Verify variable names match exactly
2. Check data type compatibility
3. Ensure proper JSON formatting
4. Review process variable scope
```

### Issue: Performance Degradation
**Solution**:
```
1. Check Elasticsearch cluster health
2. Monitor Zeebe broker resources
3. Review database connection pool
4. Analyze query performance
5. Scale infrastructure if needed
```

### Issue: Authentication Problems
**Solution**:
```
1. Verify Identity service configuration
2. Check user credentials and permissions
3. Review OAuth/OIDC settings
4. Clear browser cookies and cache
```

## 📚 Additional Resources

- [Camunda Operate Documentation](https://docs.camunda.io/docs/components/operate/)
- [Operate API Reference](https://docs.camunda.io/docs/apis-clients/operate-api/)
- [Process Instance Migration Guide](https://docs.camunda.io/docs/components/operate/userguide/process-instance-migration/)
- [Incident Management Best Practices](https://docs.camunda.io/docs/components/operate/userguide/resolve-incidents-and-update-variables/)

---

This guide provides comprehensive instructions for monitoring and managing your Policy Management System workflows. For additional support, consult the official Camunda documentation or contact your system administrator.
