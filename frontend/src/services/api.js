import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth headers
api.interceptors.request.use(
  (config) => {
    // Add user headers for development (replace with proper auth in production)
    const userId = localStorage.getItem('userId') || 'user123';
    const userName = localStorage.getItem('userName') || 'Test User';
    const userRole = localStorage.getItem('userRole') || 'author';
    
    config.headers['x-user-id'] = userId;
    config.headers['x-user-name'] = userName;
    config.headers['x-user-role'] = userRole;
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.error('Unauthorized access');
    } else if (error.response?.status >= 500) {
      // Handle server errors
      console.error('Server error:', error.response.data);
    }
    return Promise.reject(error);
  }
);

// Policy API functions
export const createPolicy = async (policyData) => {
  const response = await api.post('/policies', policyData);
  return response.data;
};

export const getPolicies = async (params = {}) => {
  const response = await api.get('/policies', { params });
  return response.data;
};

export const getPolicyById = async (id) => {
  const response = await api.get(`/policies/${id}`);
  return response.data;
};

export const getPolicyAuditTrail = async (id) => {
  const response = await api.get(`/policies/${id}/audit`);
  return response.data;
};

// Task API functions
export const getTasks = async (assignee = null) => {
  const params = assignee ? { assignee } : {};
  const response = await api.get('/tasks', { params });
  return response.data;
};

export const getTaskDetails = async (taskId) => {
  const response = await api.get(`/tasks/${taskId}`);
  return response.data;
};

export const claimTask = async (taskId, userId) => {
  const response = await api.post(`/tasks/${taskId}/claim`, { userId });
  return response.data;
};

export const unclaimTask = async (taskId) => {
  const response = await api.post(`/tasks/${taskId}/unclaim`);
  return response.data;
};

export const completeTask = async (taskId, data) => {
  const response = await api.post(`/tasks/${taskId}/complete`, data);
  return response.data;
};

// Process API functions
export const getProcessInstances = async () => {
  const response = await api.get('/processes');
  return response.data;
};

// Dashboard API functions
export const getDashboardStats = async () => {
  const response = await api.get('/dashboard/stats');
  return response.data;
};

export const getRecentActivities = async (limit = 10) => {
  const response = await api.get('/dashboard/activities', { params: { limit } });
  return response.data;
};

// User management API functions
export const getUsers = async (params = {}) => {
  const response = await api.get('/users', { params });
  return response.data;
};

export const getUserById = async (id) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const createUser = async (userData) => {
  const response = await api.post('/users', userData);
  return response.data;
};

export const updateUser = async (id, userData) => {
  const response = await api.put(`/users/${id}`, userData);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

// Deployment API functions
export const deployProcess = async () => {
  const response = await api.post('/deploy');
  return response.data;
};

// Health check
export const healthCheck = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;
