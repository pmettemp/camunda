// Utility functions for workflow management

// Status color mappings
export const getStatusColor = (status) => {
  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    under_review: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    published: 'bg-blue-100 text-blue-800',
    archived: 'bg-gray-100 text-gray-600',
    expired: 'bg-red-100 text-red-600'
  };
  return statusColors[status] || 'bg-gray-100 text-gray-800';
};

// Risk level color mappings
export const getRiskLevelColor = (riskLevel) => {
  const riskColors = {
    Low: 'bg-green-100 text-green-800',
    Medium: 'bg-yellow-100 text-yellow-800',
    High: 'bg-orange-100 text-orange-800',
    Critical: 'bg-red-100 text-red-800'
  };
  return riskColors[riskLevel] || 'bg-gray-100 text-gray-800';
};

// Task state color mappings
export const getTaskStateColor = (state) => {
  const stateColors = {
    CREATED: 'bg-blue-100 text-blue-800',
    ASSIGNED: 'bg-yellow-100 text-yellow-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELED: 'bg-red-100 text-red-800'
  };
  return stateColors[state] || 'bg-gray-100 text-gray-800';
};

// Format date for display
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Format datetime for display
export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Calculate time ago
export const timeAgo = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return formatDate(dateString);
};

// Get policy status display text
export const getStatusDisplayText = (status) => {
  const statusText = {
    draft: 'Draft',
    under_review: 'Under Review',
    approved: 'Approved',
    rejected: 'Rejected',
    published: 'Published',
    archived: 'Archived',
    expired: 'Expired'
  };
  return statusText[status] || status;
};

// Get task type display text
export const getTaskTypeDisplayText = (taskType) => {
  const taskTypes = {
    'Task_Review': 'Manual Review',
    'Task_LegalReview': 'Legal Review',
    'Task_ComplianceReview': 'Compliance Review',
    'Task_ManagerApproval': 'Manager Approval'
  };
  return taskTypes[taskType] || taskType;
};

// Check if policy is expiring soon
export const isPolicyExpiringSoon = (expiryDate, warningDays = 30) => {
  if (!expiryDate) return false;
  const expiry = new Date(expiryDate);
  const now = new Date();
  const diffInDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
  return diffInDays <= warningDays && diffInDays > 0;
};

// Check if policy is expired
export const isPolicyExpired = (expiryDate) => {
  if (!expiryDate) return false;
  const expiry = new Date(expiryDate);
  const now = new Date();
  return expiry < now;
};

// Generate policy ID
export const generatePolicyId = () => {
  return `policy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Validate email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Get user role display text
export const getUserRoleDisplayText = (role) => {
  const roleText = {
    author: 'Author',
    reviewer: 'Reviewer',
    admin: 'Administrator',
    'legal-team': 'Legal Team',
    'compliance-team': 'Compliance Team',
    'department-manager': 'Department Manager',
    'senior-manager': 'Senior Manager'
  };
  return roleText[role] || role;
};

// Get category icon
export const getCategoryIcon = (category) => {
  const categoryIcons = {
    HR: '👥',
    IT: '💻',
    Finance: '💰',
    Legal: '⚖️',
    Compliance: '📋',
    Operations: '⚙️',
    Security: '🔒'
  };
  return categoryIcons[category] || '📄';
};

// Sort array by multiple fields
export const multiSort = (array, sortFields) => {
  return array.sort((a, b) => {
    for (const field of sortFields) {
      const { key, direction = 'asc' } = typeof field === 'string' ? { key: field } : field;
      const aVal = a[key];
      const bVal = b[key];
      
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Filter policies by search term
export const filterPolicies = (policies, searchTerm) => {
  if (!searchTerm) return policies;
  
  const term = searchTerm.toLowerCase();
  return policies.filter(policy => 
    policy.title?.toLowerCase().includes(term) ||
    policy.content?.toLowerCase().includes(term) ||
    policy.category?.toLowerCase().includes(term) ||
    policy.authorName?.toLowerCase().includes(term) ||
    policy.tags?.some(tag => tag.toLowerCase().includes(term))
  );
};

// Export data to CSV
export const exportToCSV = (data, filename) => {
  if (!data.length) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
