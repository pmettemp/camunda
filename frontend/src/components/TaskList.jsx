import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { toast } from 'react-toastify';
import { 
  ClockIcon, 
  UserIcon, 
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { getTasks, claimTask, unclaimTask } from '../services/api';
import TaskModal from './TaskModal';

const TaskList = ({ userId = 'user123' }) => {
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    data: tasksData,
    isLoading,
    error,
    refetch
  } = useQuery(
    ['tasks', userId],
    () => getTasks(userId),
    {
      refetchInterval: 30000, // Refetch every 30 seconds
      onError: (error) => {
        toast.error('Failed to fetch tasks');
      }
    }
  );

  const tasks = tasksData?.data?.tasks || [];

  const handleClaimTask = async (taskId) => {
    try {
      await claimTask(taskId, userId);
      toast.success('Task claimed successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to claim task');
    }
  };

  const handleUnclaimTask = async (taskId) => {
    try {
      await unclaimTask(taskId);
      toast.success('Task unclaimed successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to unclaim task');
    }
  };

  const handleViewTask = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleTaskCompleted = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
    refetch();
    toast.success('Task completed successfully');
  };

  const getTaskTypeLabel = (taskDefinitionId) => {
    switch (taskDefinitionId) {
      case 'Task_DraftPolicy':
        return 'Draft Policy';
      case 'Task_ReviewPolicy':
        return 'Review Policy';
      default:
        return taskDefinitionId?.replace(/([A-Z])/g, ' $1').trim() || 'Unknown Task';
    }
  };

  const getTaskPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <XCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600">Failed to load tasks</p>
        <button
          onClick={() => refetch()}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <ClockIcon className="h-6 w-6 mr-2" />
          My Tasks ({tasks.length})
        </h2>
        <p className="text-gray-600 mt-2">
          Review and complete your assigned policy management tasks.
        </p>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks assigned</h3>
          <p className="text-gray-600">You're all caught up! No pending tasks at the moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {getTaskTypeLabel(task.taskDefinitionId)}
                      </h3>
                      
                      {task.variables?.approvalDecision?.priority && (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTaskPriorityColor(task.variables.approvalDecision.priority)}`}>
                          {task.variables.approvalDecision.priority} Priority
                        </span>
                      )}
                    </div>

                    {task.policyInfo && (
                      <div className="mb-3">
                        <h4 className="font-medium text-gray-800 flex items-center">
                          <DocumentTextIcon className="h-4 w-4 mr-1" />
                          {task.policyInfo.title}
                        </h4>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                          <span>Category: {task.policyInfo.category}</span>
                          {task.variables?.policyData?.riskLevel && (
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskLevelColor(task.variables.policyData.riskLevel)}`}>
                              {task.variables.policyData.riskLevel} Risk
                            </span>
                          )}
                          <span>Author: {task.policyInfo.author_name}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        Created: {new Date(task.created || task.creationTime).toLocaleDateString()}
                      </span>
                      
                      {task.assignee && (
                        <span className="flex items-center">
                          <UserIcon className="h-4 w-4 mr-1" />
                          Assigned to: {task.assignee}
                        </span>
                      )}

                      {task.dueDate && (
                        <span className="flex items-center text-orange-600">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {task.variables?.approvalDecision?.reason && (
                      <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-800">
                        <strong>Reason:</strong> {task.variables.approvalDecision.reason}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    <button
                      onClick={() => handleViewTask(task)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                    >
                      <EyeIcon className="h-4 w-4 mr-1" />
                      View
                    </button>

                    {task.assignee === userId ? (
                      <button
                        onClick={() => handleUnclaimTask(task.id)}
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                      >
                        Unclaim
                      </button>
                    ) : !task.assignee ? (
                      <button
                        onClick={() => handleClaimTask(task.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                      >
                        Claim
                      </button>
                    ) : (
                      <span className="px-4 py-2 bg-gray-100 text-gray-600 rounded-md text-center">
                        Claimed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task Modal */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onTaskCompleted={handleTaskCompleted}
          userId={userId}
        />
      )}
    </div>
  );
};

export default TaskList;
