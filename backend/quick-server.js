const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  console.log('Health check requested');
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Create policy endpoint
app.post('/api/policies', (req, res) => {
  console.log('Policy creation request:', req.body);
  
  const policy = {
    id: Date.now(),
    ...req.body,
    status: 'draft',
    createdAt: new Date().toISOString()
  };
  
  res.status(201).json({
    success: true,
    message: 'Policy created successfully',
    policy: policy
  });
});

// Get policies endpoint
app.get('/api/policies', (req, res) => {
  console.log('Get policies requested');
  res.json({
    success: true,
    policies: []
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Quick backend server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
});
