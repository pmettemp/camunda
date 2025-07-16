import React from 'react';
import { getStatusColor, getRiskLevelColor, getTaskStateColor } from '../../utils/workflowUtils';

const StatusBadge = ({ 
  status, 
  type = 'status', // 'status', 'risk', 'task'
  size = 'sm',
  className = '' 
}) => {
  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1.5 text-sm',
    lg: 'px-3 py-2 text-base'
  };

  const getColorClass = () => {
    switch (type) {
      case 'risk':
        return getRiskLevelColor(status);
      case 'task':
        return getTaskStateColor(status);
      default:
        return getStatusColor(status);
    }
  };

  return (
    <span 
      className={`
        inline-flex items-center font-medium rounded-full
        ${sizeClasses[size]}
        ${getColorClass()}
        ${className}
      `}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
