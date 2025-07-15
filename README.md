# Policy Management System

A comprehensive Policy Management System built with **Camunda 8**, **Node.js**, **React**, and **MySQL**. This system automates policy creation, review, approval, and publication workflows with intelligent decision-making capabilities.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │  Node.js Backend │    │   Camunda 8     │
│                 │◄──►│                 │◄──►│   (BPMN/DMN)    │
│  - Policy Forms │    │  - REST API     │    │  - Workflows    │
│  - Task Lists   │    │  - Task Workers │    │  - Decisions    │
│  - Dashboards   │    │  - Auth & DB    │    │  - Monitoring   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   MySQL Database │
                       │                 │
                       │  - Policies     │
                       │  - Users        │
                       │  - Audit Logs   │
                       └─────────────────┘
```

## 🚀 Features

### Core Functionality
- **Policy Creation**: Rich forms with validation and auto-approval preview
- **Intelligent Routing**: DMN-based decision tables for approval workflows
- **Multi-level Review**: Legal, compliance, and management review processes
- **Automated Publishing**: PDF generation and stakeholder notifications
- **Audit Trail**: Comprehensive logging of all policy lifecycle events
- **Expiration Management**: Automated renewal reminders and archiving

### User Roles
- **Authors**: Create and submit policy drafts
- **Reviewers**: Evaluate policies (Legal, Compliance, Management)
- **Admins**: Manage workflows, users, and system configuration

### Technical Features
- **BPMN 2.0 Workflows**: Visual process modeling with Camunda 8
- **DMN Decision Tables**: Rule-based auto-approval logic
- **Real-time Task Management**: Live task lists with claim/unclaim functionality
- **RESTful API**: Complete backend API with OpenAPI documentation
- **Responsive UI**: Modern React interface with Tailwind CSS

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **MySQL** 8.0+ or MariaDB 10.6+
- **Camunda 8** (Cloud or Self-Managed)
- **Git** for version control

## 🛠️ Quick Start

### 1. Clone Repository
```bash
git clone <repository-url>
cd policy-management-system
```

### 2. Setup Database
```bash
# Create database and tables
mysql -u root -p < database/schema.sql
```

### 3. Configure Camunda 8

#### Option A: Camunda 8 Cloud (Recommended)
1. Sign up at [Camunda Cloud](https://camunda.io)
2. Create a new cluster
3. Create API credentials
4. Note down your connection details

#### Option B: Self-Managed Camunda 8
1. Download and start Camunda 8 Platform
2. Ensure Zeebe, Operate, and Tasklist are running
3. Use default local connection settings

### 4. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database and Camunda credentials

# Deploy BPMN and DMN models
npm run deploy

# Start the server
npm run dev
```

### 5. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

### 6. Access the Application
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **Camunda Operate**: http://localhost:8081 (self-managed)
- **Camunda Tasklist**: http://localhost:8082 (self-managed)

## 📁 Project Structure

```
policy-management-system/
├── bpmn/                          # BPMN process models
│   └── policy-management.bpmn
├── dmn/                           # DMN decision tables
│   └── policy-approval-decision.dmn
├── backend/                       # Node.js backend
│   ├── src/
│   │   ├── config/               # Configuration files
│   │   ├── routes/               # API routes
│   │   ├── services/             # Business logic
│   │   └── server.js             # Main server file
│   ├── package.json
│   └── .env.example
├── frontend/                      # React frontend
│   ├── src/
│   │   ├── components/           # React components
│   │   ├── services/             # API client
│   │   └── App.js                # Main app component
│   └── package.json
├── database/                      # Database schema
│   └── schema.sql
└── README.md
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```bash
# Camunda 8 Configuration
ZEEBE_ADDRESS=localhost:26500
ZEEBE_CLIENT_ID=your-client-id
ZEEBE_CLIENT_SECRET=your-client-secret
ZEEBE_AUTHORIZATION_SERVER_URL=https://login.cloud.camunda.io/oauth/token
ZEEBE_TOKEN_AUDIENCE=zeebe.camunda.io

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=policy_management
DB_USER=root
DB_PASSWORD=password

# Server Configuration
PORT=3000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

#### Frontend (.env)
```bash
REACT_APP_API_URL=http://localhost:3000/api
```

## 🔄 Workflow Process

### 1. Policy Creation Flow
```
Start → Draft Policy → Evaluate (DMN) → Auto-Approve OR Manual Review → Publish → End
                                      ↓
                                   Rejection → Notify Author → Back to Draft
```

### 2. DMN Decision Logic
The system uses intelligent decision tables to determine approval routing:

| Category | Risk Level | Legal Review | Compliance Review | Word Count | Decision |
|----------|------------|--------------|-------------------|------------|----------|
| HR       | Low        | No           | No                | < 500      | Auto-Approve |
| IT       | Low        | No           | No                | < 300      | Auto-Approve |
| Any      | Critical   | -            | -                 | -          | Legal Review |
| Any      | High       | No           | No                | -          | Senior Manager |
| Any      | -          | Yes          | -                 | -          | Legal Team |
| Any      | -          | -            | Yes               | -          | Compliance Team |
| Default  | -          | -            | -                 | -          | Department Manager |

## 📡 API Documentation

### Policy Endpoints

#### Create Policy
```http
POST /api/policies
Content-Type: application/json

{
  "title": "Remote Work Policy",
  "category": "HR",
  "content": "Policy content here...",
  "effectiveDate": "2024-01-01",
  "expiryDate": "2024-12-31",
  "riskLevel": "Low",
  "requiresLegalReview": false,
  "requiresComplianceReview": false,
  "stakeholders": ["hr@company.com"],
  "tags": ["remote-work", "flexibility"]
}
```

#### Get Policies
```http
GET /api/policies?page=1&limit=10&status=draft&category=HR
```

#### Get Policy by ID
```http
GET /api/policies/{id}
```

#### Get Policy Audit Trail
```http
GET /api/policies/{id}/audit
```

### Task Endpoints

#### Get User Tasks
```http
GET /api/tasks?assignee=user123
```

#### Claim Task
```http
POST /api/tasks/{taskId}/claim
Content-Type: application/json

{
  "userId": "user123"
}
```

#### Complete Review Task
```http
POST /api/tasks/{taskId}/complete
Content-Type: application/json

{
  "variables": {
    "reviewDecision": "approved",
    "reviewComments": "Policy looks good",
    "reviewerName": "Legal Reviewer"
  },
  "action": "review"
}
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

### API Testing with curl
```bash
# Health check
curl http://localhost:3000/health

# Create policy
curl -X POST http://localhost:3000/api/policies \
  -H "Content-Type: application/json" \
  -H "x-user-id: user123" \
  -H "x-user-name: Test User" \
  -d '{
    "title": "Test Policy",
    "category": "HR",
    "content": "This is a test policy content.",
    "effectiveDate": "2024-01-01",
    "expiryDate": "2024-12-31",
    "riskLevel": "Low"
  }'

# Get tasks
curl http://localhost:3000/api/tasks?assignee=user123
```

## 📊 Monitoring with Camunda Operate

### Access Camunda Operate
1. **Cloud**: Access via Camunda Cloud Console
2. **Self-Managed**: http://localhost:8081

### Key Monitoring Features
- **Process Instances**: View all running and completed workflows
- **Incident Management**: Handle process failures and errors
- **Variable Inspection**: Examine process variables and data flow
- **Performance Metrics**: Monitor process execution times and bottlenecks

### Common Monitoring Tasks
1. **View Active Processes**: Monitor policy workflows in progress
2. **Check Failed Instances**: Identify and resolve process errors
3. **Analyze Process Performance**: Review completion times and efficiency
4. **Audit Process History**: Track completed policy workflows

## 🔍 Troubleshooting

### Common Issues

#### 1. Camunda Connection Failed
```bash
# Check Camunda 8 status
curl http://localhost:26500/ready

# Verify environment variables
echo $ZEEBE_ADDRESS
```

#### 2. Database Connection Error
```bash
# Test MySQL connection
mysql -h localhost -u root -p policy_management

# Check database exists
SHOW DATABASES;
```

#### 3. Process Deployment Failed
```bash
# Redeploy processes
cd backend
npm run deploy

# Check deployment logs
tail -f logs/combined.log
```

#### 4. Tasks Not Appearing
- Verify process instance is running in Camunda Operate
- Check task assignment and user permissions
- Ensure service task handlers are registered

### Debug Mode
```bash
# Backend debug mode
cd backend
DEBUG=* npm run dev

# Frontend debug mode
cd frontend
REACT_APP_DEBUG=true npm start
```

## 🚀 Production Deployment

### Backend Deployment
```bash
# Build for production
npm run build

# Start with PM2
pm2 start src/server.js --name policy-backend

# Or with Docker
docker build -t policy-backend .
docker run -p 3000:3000 policy-backend
```

### Frontend Deployment
```bash
# Build for production
npm run build

# Serve with nginx or deploy to CDN
```

### Security Considerations
- Replace default JWT secret
- Use environment-specific database credentials
- Enable HTTPS in production
- Implement proper authentication (replace mock auth)
- Set up database connection pooling
- Configure CORS properly
- Enable rate limiting

## 📋 Example JSON Payloads

### Policy Creation Request
```json
{
  "title": "Remote Work Policy 2024",
  "category": "HR",
  "content": "This policy outlines the guidelines and procedures for remote work arrangements...",
  "effectiveDate": "2024-01-01",
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
}
```

### DMN Decision Response
```json
{
  "autoApprove": false,
  "reviewer": "department-manager",
  "reviewerType": "Department Manager",
  "priority": "Medium",
  "reason": "Default manual review required"
}
```

### Task Completion Request
```json
{
  "variables": {
    "reviewDecision": "approved",
    "reviewComments": "Policy content is comprehensive and aligns with company standards.",
    "reviewerName": "John Smith",
    "reviewedAt": "2024-01-15T10:30:00Z"
  },
  "action": "review"
}
```

### Process Instance Variables
```json
{
  "policyData": {
    "id": "policy_1705312800000",
    "title": "Remote Work Policy 2024",
    "category": "HR",
    "riskLevel": "Low",
    "authorId": "user123",
    "authorName": "Jane Doe",
    "contentWordCount": 245
  },
  "policyAuthor": "user123"
}
```

## 📚 Additional Resources

- [Camunda 8 Documentation](https://docs.camunda.io/)
- [BPMN 2.0 Specification](https://www.omg.org/spec/BPMN/2.0/)
- [DMN 1.3 Specification](https://www.omg.org/spec/DMN/1.3/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [React Documentation](https://reactjs.org/docs/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
