import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import {
  getPolicies,
  createPolicy,
  getTasks,
  getProcessInstances,
  getDashboardStats,
  getRecentActivities,
  claimTask,
  completeTask,
  getUsers
} from '../services/api';

// Hook for managing policies
export const usePolicies = (params = {}) => {
  return useQuery(
    ['policies', params],
    () => getPolicies(params),
    {
      refetchInterval: 30000,
      staleTime: 10000,
      onError: (error) => {
        toast.error('Failed to fetch policies');
      }
    }
  );
};

// Hook for creating policies
export const useCreatePolicy = () => {
  const queryClient = useQueryClient();
  
  return useMutation(createPolicy, {
    onSuccess: (data) => {
      queryClient.invalidateQueries(['policies']);
      queryClient.invalidateQueries(['dashboard']);
      toast.success('Policy created successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create policy');
    }
  });
};

// Hook for managing tasks
export const useTasks = (userId) => {
  return useQuery(
    ['tasks', userId],
    () => getTasks(userId),
    {
      refetchInterval: 15000,
      enabled: !!userId,
      onError: (error) => {
        toast.error('Failed to fetch tasks');
      }
    }
  );
};

// Hook for claiming tasks
export const useClaimTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ taskId, userId }) => claimTask(taskId, userId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['tasks']);
        toast.success('Task claimed successfully');
      },
      onError: (error) => {
        toast.error('Failed to claim task');
      }
    }
  );
};

// Hook for completing tasks
export const useCompleteTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ taskId, data }) => completeTask(taskId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['tasks']);
        queryClient.invalidateQueries(['policies']);
        queryClient.invalidateQueries(['processes']);
        queryClient.invalidateQueries(['dashboard']);
        toast.success('Task completed successfully');
      },
      onError: (error) => {
        toast.error('Failed to complete task');
      }
    }
  );
};

// Hook for process instances
export const useProcessInstances = () => {
  return useQuery(
    ['processes'],
    getProcessInstances,
    {
      refetchInterval: 20000,
      onError: (error) => {
        toast.error('Failed to fetch process instances');
      }
    }
  );
};

// Hook for dashboard statistics
export const useDashboardStats = () => {
  return useQuery(
    ['dashboard', 'stats'],
    getDashboardStats,
    {
      refetchInterval: 30000,
      onError: (error) => {
        console.error('Failed to fetch dashboard stats:', error);
      }
    }
  );
};

// Hook for recent activities
export const useRecentActivities = (limit = 10) => {
  return useQuery(
    ['dashboard', 'activities', limit],
    () => getRecentActivities(limit),
    {
      refetchInterval: 30000,
      onError: (error) => {
        console.error('Failed to fetch recent activities:', error);
      }
    }
  );
};

// Hook for users
export const useUsers = (params = {}) => {
  return useQuery(
    ['users', params],
    () => getUsers(params),
    {
      staleTime: 60000,
      onError: (error) => {
        toast.error('Failed to fetch users');
      }
    }
  );
};

// Hook for real-time updates
export const useRealTimeUpdates = () => {
  const queryClient = useQueryClient();
  
  const refreshAll = () => {
    queryClient.invalidateQueries(['policies']);
    queryClient.invalidateQueries(['tasks']);
    queryClient.invalidateQueries(['processes']);
    queryClient.invalidateQueries(['dashboard']);
  };
  
  return { refreshAll };
};
