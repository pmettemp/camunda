# API Examples and Testing Guide

This document provides comprehensive examples for testing the Policy Management System API endpoints.

## 🚀 Getting Started

### Base URL
```
Local Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

### Authentication Headers
```bash
# Required headers for all requests
-H "x-user-id: user123"
-H "x-user-name: Test User"
-H "x-user-role: author"
-H "Content-Type: application/json"
```

## 📋 Policy Management Examples

### 1. Create a New Policy

#### Basic HR Policy
```bash
curl -X POST http://localhost:3000/api/policies \
  -H "Content-Type: application/json" \
  -H "x-user-id: user123" \
  -H "x-user-name: Jane Doe" \
  -H "x-user-role: author" \
  -d '{
    "title": "Remote Work Policy 2024",
    "category": "HR",
    "content": "This policy establishes guidelines for remote work arrangements to ensure productivity, security, and work-life balance. Employees may work remotely up to 3 days per week with manager approval. All remote work must comply with company security protocols and maintain regular communication with team members.",
    "effectiveDate": "2024-02-01",
    "expiryDate": "2024-12-31",
    "riskLevel": "Low",
    "requiresLegalReview": false,
    "requiresComplianceReview": false,
    "stakeholders": [
      "hr@company.com",
      "manager@company.com"
    ],
    "tags": [
      "remote-work",
      "flexibility",
      "work-from-home"
    ]
  }'
```

#### High-Risk Security Policy
```bash
curl -X POST http://localhost:3000/api/policies \
  -H "Content-Type: application/json" \
  -H "x-user-id: security-admin" \
  -H "x-user-name: Security Admin" \
  -H "x-user-role: author" \
  -d '{
    "title": "Data Encryption Standards",
    "category": "Security",
    "content": "All sensitive data must be encrypted using AES-256 encryption standards. This includes data at rest, in transit, and in processing. Encryption keys must be managed through the approved key management system and rotated quarterly. Non-compliance may result in immediate security review and potential disciplinary action.",
    "effectiveDate": "2024-01-15",
    "expiryDate": "2025-01-15",
    "riskLevel": "High",
    "requiresLegalReview": true,
    "requiresComplianceReview": true,
    "stakeholders": [
      "security@company.com",
      "legal@company.com",
      "compliance@company.com",
      "it@company.com"
    ],
    "tags": [
      "security",
      "encryption",
      "data-protection",
      "compliance"
    ]
  }'
```

### 2. Retrieve Policies

#### Get All Policies
```bash
curl -X GET "http://localhost:3000/api/policies?page=1&limit=10" \
  -H "x-user-id: user123"
```

#### Filter by Category and Status
```bash
curl -X GET "http://localhost:3000/api/policies?category=HR&status=approved&page=1&limit=5" \
  -H "x-user-id: user123"
```

#### Get Specific Policy
```bash
curl -X GET "http://localhost:3000/api/policies/policy_1705312800000" \
  -H "x-user-id: user123"
```

#### Get Policy Audit Trail
```bash
curl -X GET "http://localhost:3000/api/policies/policy_1705312800000/audit" \
  -H "x-user-id: user123"
```

### 3. Expected Responses

#### Successful Policy Creation
```json
{
  "success": true,
  "message": "Policy created successfully",
  "data": {
    "policyId": "policy_1705312800000",
    "processInstanceKey": "2251799813685249",
    "status": "draft"
  }
}
```

#### Policy List Response
```json
{
  "success": true,
  "data": {
    "policies": [
      {
        "id": "policy_1705312800000",
        "title": "Remote Work Policy 2024",
        "category": "HR",
        "status": "approved",
        "risk_level": "Low",
        "author_name": "Jane Doe",
        "created_at": "2024-01-15T10:30:00.000Z",
        "effective_date": "2024-02-01",
        "expiry_date": "2024-12-31",
        "version": 1
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "pages": 1
    }
  }
}
```

## 📝 Task Management Examples

### 1. Get User Tasks

#### Get All Tasks for User
```bash
curl -X GET "http://localhost:3000/api/tasks?assignee=user123" \
  -H "x-user-id: user123"
```

#### Get Unassigned Tasks
```bash
curl -X GET "http://localhost:3000/api/tasks" \
  -H "x-user-id: user123"
```

### 2. Task Operations

#### Claim a Task
```bash
curl -X POST "http://localhost:3000/api/tasks/2251799813685251/claim" \
  -H "Content-Type: application/json" \
  -H "x-user-id: legal-team" \
  -d '{
    "userId": "legal-team"
  }'
```

#### Unclaim a Task
```bash
curl -X POST "http://localhost:3000/api/tasks/2251799813685251/unclaim" \
  -H "x-user-id: legal-team"
```

#### Get Task Details
```bash
curl -X GET "http://localhost:3000/api/tasks/2251799813685251" \
  -H "x-user-id: legal-team"
```

### 3. Complete Tasks

#### Approve Policy (Review Task)
```bash
curl -X POST "http://localhost:3000/api/tasks/2251799813685251/complete" \
  -H "Content-Type: application/json" \
  -H "x-user-id: legal-team" \
  -H "x-user-name: Legal Reviewer" \
  -d '{
    "variables": {
      "reviewDecision": "approved",
      "reviewComments": "Policy content is comprehensive and aligns with legal requirements. Approved for publication.",
      "reviewerName": "Legal Reviewer"
    },
    "action": "review"
  }'
```

#### Reject Policy with Comments
```bash
curl -X POST "http://localhost:3000/api/tasks/2251799813685251/complete" \
  -H "Content-Type: application/json" \
  -H "x-user-id: legal-team" \
  -H "x-user-name: Legal Reviewer" \
  -d '{
    "variables": {
      "reviewDecision": "rejected",
      "reviewComments": "Policy requires additional clarification on data retention periods and compliance with GDPR requirements. Please revise sections 3.2 and 4.1.",
      "reviewerName": "Legal Reviewer"
    },
    "action": "review"
  }'
```

#### Complete Draft Task
```bash
curl -X POST "http://localhost:3000/api/tasks/2251799813685250/complete" \
  -H "Content-Type: application/json" \
  -H "x-user-id: user123" \
  -H "x-user-name: Policy Author" \
  -d '{
    "variables": {},
    "action": "draft"
  }'
```

### 4. Task Response Examples

#### Task List Response
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": "2251799813685251",
        "taskDefinitionId": "Task_ReviewPolicy",
        "assignee": "legal-team",
        "created": "2024-01-15T10:35:00.000Z",
        "formKey": "camunda-forms:bpmn:UserTaskForm_ReviewPolicy",
        "policyInfo": {
          "id": "policy_1705312800000",
          "title": "Data Encryption Standards",
          "category": "Security",
          "status": "under_review",
          "author_name": "Security Admin"
        },
        "variables": {
          "approvalDecision": {
            "autoApprove": false,
            "reviewer": "legal-team",
            "reviewerType": "Legal",
            "priority": "Medium",
            "reason": "Legal review explicitly required"
          }
        }
      }
    ],
    "total": 1
  }
}
```

#### Task Details Response
```json
{
  "success": true,
  "data": {
    "task": {
      "id": "2251799813685251",
      "taskDefinitionId": "Task_ReviewPolicy",
      "assignee": "legal-team",
      "created": "2024-01-15T10:35:00.000Z"
    },
    "policyData": {
      "id": "policy_1705312800000",
      "title": "Data Encryption Standards",
      "category": "Security",
      "content": "All sensitive data must be encrypted...",
      "riskLevel": "High",
      "requiresLegalReview": true,
      "requiresComplianceReview": true,
      "stakeholders": ["security@company.com", "legal@company.com"],
      "tags": ["security", "encryption", "data-protection"]
    },
    "variables": {
      "approvalDecision": {
        "autoApprove": false,
        "reviewer": "legal-team",
        "reviewerType": "Legal",
        "priority": "Medium"
      }
    }
  }
}
```

## 🔄 Process Management Examples

### 1. Get Process Instances

#### All Process Instances
```bash
curl -X GET "http://localhost:3000/api/processes" \
  -H "x-user-id: admin"
```

#### Process Instances Response
```json
{
  "success": true,
  "data": [
    {
      "processInstanceKey": "2251799813685249",
      "processDefinitionKey": "2251799813685248",
      "bpmnProcessId": "policy-management-process",
      "version": 1,
      "state": "ACTIVE",
      "startDate": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

## 🏥 Health Check Examples

### System Health Check
```bash
curl -X GET "http://localhost:3000/health"
```

#### Health Check Response
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "services": {
    "database": "connected",
    "camunda": "connected"
  }
}
```

## 🧪 Testing Scenarios

### Scenario 1: Complete Policy Workflow

#### Step 1: Create Policy
```bash
# Create a low-risk HR policy (should auto-approve)
curl -X POST http://localhost:3000/api/policies \
  -H "Content-Type: application/json" \
  -H "x-user-id: hr-author" \
  -H "x-user-name: HR Author" \
  -d '{
    "title": "Casual Friday Policy",
    "category": "HR",
    "content": "Employees may wear casual attire on Fridays.",
    "effectiveDate": "2024-02-01",
    "expiryDate": "2024-12-31",
    "riskLevel": "Low",
    "requiresLegalReview": false,
    "requiresComplianceReview": false
  }'
```

#### Step 2: Check Process Status
```bash
# Should show auto-approved and published
curl -X GET "http://localhost:3000/api/policies/[POLICY_ID]" \
  -H "x-user-id: hr-author"
```

### Scenario 2: Manual Review Workflow

#### Step 1: Create High-Risk Policy
```bash
curl -X POST http://localhost:3000/api/policies \
  -H "Content-Type: application/json" \
  -H "x-user-id: security-author" \
  -H "x-user-name: Security Author" \
  -d '{
    "title": "Critical Security Protocol",
    "category": "Security",
    "content": "Emergency security procedures for data breaches...",
    "effectiveDate": "2024-01-20",
    "expiryDate": "2024-12-31",
    "riskLevel": "Critical",
    "requiresLegalReview": true
  }'
```

#### Step 2: Check for Review Task
```bash
# Should create task for legal team
curl -X GET "http://localhost:3000/api/tasks?assignee=legal-team" \
  -H "x-user-id: legal-team"
```

#### Step 3: Complete Review
```bash
curl -X POST "http://localhost:3000/api/tasks/[TASK_ID]/complete" \
  -H "Content-Type: application/json" \
  -H "x-user-id: legal-team" \
  -d '{
    "variables": {
      "reviewDecision": "approved",
      "reviewComments": "Approved after security review",
      "reviewerName": "Legal Team"
    },
    "action": "review"
  }'
```

## 🐛 Error Handling Examples

### Common Error Responses

#### Validation Error
```json
{
  "success": false,
  "message": "Validation error",
  "details": [
    {
      "message": "Title is required",
      "path": ["title"],
      "type": "any.required"
    }
  ]
}
```

#### Not Found Error
```json
{
  "success": false,
  "message": "Policy not found"
}
```

#### Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## 📊 Performance Testing

### Load Testing Script
```bash
#!/bin/bash
# Create 10 policies concurrently
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/policies \
    -H "Content-Type: application/json" \
    -H "x-user-id: user$i" \
    -H "x-user-name: User $i" \
    -d "{
      \"title\": \"Test Policy $i\",
      \"category\": \"HR\",
      \"content\": \"Test policy content for load testing\",
      \"effectiveDate\": \"2024-02-01\",
      \"expiryDate\": \"2024-12-31\",
      \"riskLevel\": \"Low\"
    }" &
done
wait
echo "Load test completed"
```

This comprehensive API testing guide provides examples for all major functionality in the Policy Management System. Use these examples to test your implementation and understand the expected request/response patterns.
