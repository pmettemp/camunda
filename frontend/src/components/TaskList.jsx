import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { toast } from 'react-toastify';
import {
  ClockIcon,
  UserIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ArrowPathIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon
} from '@heroicons/react/24/outline';
import { useTasks, useClaimTask } from '../hooks/useWorkflow';
import { formatDateTime, timeAgo, getTaskTypeDisplayText } from '../utils/workflowUtils';
import TaskModal from './TaskModal';
import LoadingSpinner from './shared/LoadingSpinner';
import StatusBadge from './shared/StatusBadge';
import SearchFilter from './shared/SearchFilter';

const TaskList = ({ userId = 'user123' }) => {
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

  // Use custom hooks
  const { data: tasksData, isLoading, error, refetch } = useTasks(userId);
  const claimTaskMutation = useClaimTask();

  const tasks = tasksData?.data?.tasks || [];

  // Filter configuration
  const filterConfig = [
    {
      key: 'state',
      label: 'State',
      type: 'select',
      options: [
        { value: 'CREATED', label: 'Created' },
        { value: 'ASSIGNED', label: 'Assigned' },
        { value: 'COMPLETED', label: 'Completed' },
        { value: 'CANCELED', label: 'Canceled' }
      ]
    },
    {
      key: 'taskType',
      label: 'Task Type',
      type: 'select',
      options: [
        { value: 'Task_Review', label: 'Manual Review' },
        { value: 'Task_LegalReview', label: 'Legal Review' },
        { value: 'Task_ComplianceReview', label: 'Compliance Review' }
      ]
    }
  ];

  // Filter tasks based on search and filters
  const filteredTasks = tasks.filter(task => {
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        task.name?.toLowerCase().includes(term) ||
        task.processInstanceKey?.toString().includes(term) ||
        task.variables?.policyData?.title?.toLowerCase().includes(term);
      if (!matchesSearch) return false;
    }

    // Other filters
    for (const [key, value] of Object.entries(filters)) {
      if (value && task[key] !== value) return false;
    }

    return true;
  });

  const handleClaimTask = (taskId) => {
    claimTaskMutation.mutate({ taskId, userId });
  };

  // Note: Unclaim functionality can be added later if needed

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

  const TaskCard = ({ task }) => {
    const policyData = task.variables?.policyData || {};

    return (
      <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-3">
              <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">
                {getTaskTypeDisplayText(task.elementId) || task.name || 'Review Task'}
              </h3>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <StatusBadge status={task.state} type="task" size="sm" />
              {policyData.riskLevel && (
                <StatusBadge status={policyData.riskLevel} type="risk" size="sm" />
              )}
            </div>

            {policyData.title && (
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700">Policy:</p>
                <p className="text-sm text-gray-900">{policyData.title}</p>
              </div>
            )}

            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Process Instance:</span>
                <span className="font-mono text-xs">{task.processInstanceKey}</span>
              </div>
              <div className="flex justify-between">
                <span>Created:</span>
                <span>{timeAgo(task.creationTime)}</span>
              </div>
              {task.assignee && (
                <div className="flex justify-between">
                  <span>Assigned to:</span>
                  <span>{task.assignee}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col space-y-2 ml-4">
            <button
              onClick={() => handleViewTask(task)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
              title="View Task"
            >
              <EyeIcon className="h-4 w-4" />
            </button>

            {!task.assignee && (
              <button
                onClick={() => handleClaimTask(task.id)}
                disabled={claimTaskMutation.isLoading}
                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
                title="Claim Task"
              >
                <UserIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" text="Loading tasks..." />;
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-red-800 font-medium">Error loading tasks</h3>
          <p className="text-red-600 mt-1">{error.message}</p>
          <button
            onClick={() => refetch()}
            className="mt-3 text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <ClockIcon className="h-6 w-6 mr-2" />
            My Tasks ({filteredTasks.length})
          </h1>
          <p className="text-gray-600 mt-1">
            Review and complete your assigned policy management tasks
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => refetch()}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Refresh
          </button>

          <div className="flex rounded-md shadow-sm">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-sm font-medium rounded-l-md border ${
                viewMode === 'list'
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <ListBulletIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 text-sm font-medium rounded-r-md border-t border-r border-b ${
                viewMode === 'grid'
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Squares2X2Icon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <SearchFilter
        onSearch={setSearchTerm}
        onFilter={setFilters}
        filters={filterConfig}
        placeholder="Search tasks by name, policy title, process instance..."
        className="mb-6"
      />

      {/* Content */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      ) : (
        <div className="space-y-4 mb-6">
          {filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}

      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || Object.keys(filters).length > 0
              ? 'Try adjusting your search or filters'
              : 'You\'re all caught up! No pending tasks at the moment.'
            }
          </p>
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
