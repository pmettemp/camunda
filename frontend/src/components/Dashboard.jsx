import React, { useState } from 'react';
import { useQuery } from 'react-query';
import {
  HomeIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  UsersIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { useDashboardStats, useRecentActivities, usePolicies, useTasks, useProcessInstances } from '../hooks/useWorkflow';
import { formatDateTime, timeAgo, getStatusColor, getRiskLevelColor } from '../utils/workflowUtils';
import LoadingSpinner from './shared/LoadingSpinner';
import StatusBadge from './shared/StatusBadge';

const Dashboard = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  
  // Fetch dashboard data
  const { data: statsData, isLoading: statsLoading } = useDashboardStats();
  const { data: activitiesData, isLoading: activitiesLoading } = useRecentActivities(10);
  const { data: policiesData } = usePolicies({ limit: 5, status: 'under_review' });
  const { data: tasksData } = useTasks('user123');
  const { data: processesData } = useProcessInstances();

  const stats = statsData?.data || {};
  const activities = activitiesData?.data || [];
  const recentPolicies = policiesData?.data?.policies || [];
  const myTasks = tasksData?.data?.tasks || [];
  const processes = processesData?.data || [];

  // Calculate derived statistics
  const totalPolicies = stats.totalPolicies || 0;
  const pendingReviews = stats.pendingReviews || myTasks.length;
  const publishedThisMonth = stats.publishedThisMonth || 0;
  const activeProcesses = processes.filter(p => p.state === 'ACTIVE').length;

  const StatCard = ({ title, value, icon: Icon, color = 'blue', trend, subtitle }) => (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className={`h-6 w-6 text-${color}-600`} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="flex items-baseline">
                <div className={`text-2xl font-semibold text-${color}-600`}>
                  {value}
                </div>
                {trend && (
                  <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                    trend > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                    {Math.abs(trend)}%
                  </div>
                )}
              </dd>
              {subtitle && (
                <dd className="text-sm text-gray-600 mt-1">{subtitle}</dd>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );

  const QuickActionCard = ({ title, description, icon: Icon, onClick, color = 'blue' }) => (
    <button
      onClick={onClick}
      className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow duration-200 text-left w-full"
    >
      <div className="flex items-center">
        <div className={`flex-shrink-0 p-3 rounded-lg bg-${color}-100`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
    </button>
  );

  if (statsLoading) {
    return <LoadingSpinner size="lg" text="Loading dashboard..." />;
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <HomeIcon className="h-6 w-6 mr-2" />
            Policy Management Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Overview of your policy workflow and recent activities
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Policies"
          value={totalPolicies}
          icon={DocumentTextIcon}
          color="blue"
          trend={stats.policiesTrend}
          subtitle="All time"
        />
        <StatCard
          title="Pending Reviews"
          value={pendingReviews}
          icon={ClockIcon}
          color="orange"
          subtitle="Awaiting action"
        />
        <StatCard
          title="Published This Month"
          value={publishedThisMonth}
          icon={CheckCircleIcon}
          color="green"
          trend={stats.publishedTrend}
        />
        <StatCard
          title="Active Processes"
          value={activeProcesses}
          icon={ArrowTrendingUpIcon}
          color="purple"
          subtitle="Running workflows"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickActionCard
            title="Create New Policy"
            description="Start a new policy workflow"
            icon={DocumentTextIcon}
            onClick={() => window.location.href = '/policies/new'}
            color="blue"
          />
          <QuickActionCard
            title="Review Tasks"
            description={`${myTasks.length} tasks awaiting review`}
            icon={ClockIcon}
            onClick={() => window.location.href = '/tasks'}
            color="orange"
          />
          <QuickActionCard
            title="View All Policies"
            description="Browse and manage policies"
            icon={EyeIcon}
            onClick={() => window.location.href = '/policies'}
            color="green"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Policies */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Policies Under Review</h2>
          </div>
          <div className="p-6">
            {recentPolicies.length > 0 ? (
              <div className="space-y-4">
                {recentPolicies.slice(0, 5).map((policy) => (
                  <div key={policy.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {policy.title}
                      </h3>
                      <div className="flex items-center mt-1 space-x-2">
                        <StatusBadge status={policy.status} size="xs" />
                        <StatusBadge status={policy.riskLevel} type="risk" size="xs" />
                        <span className="text-xs text-gray-500">
                          by {policy.authorName}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {timeAgo(policy.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No policies under review</p>
            )}
          </div>
        </div>

        {/* My Tasks */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">My Tasks</h2>
          </div>
          <div className="p-6">
            {myTasks.length > 0 ? (
              <div className="space-y-4">
                {myTasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">
                        {task.name || 'Review Task'}
                      </h3>
                      <div className="flex items-center mt-1 space-x-2">
                        <StatusBadge status={task.state} type="task" size="xs" />
                        <span className="text-xs text-gray-500">
                          Process: {task.processInstanceKey}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {timeAgo(task.creationTime)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No pending tasks</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Activities</h2>
        </div>
        <div className="p-6">
          {activitiesLoading ? (
            <LoadingSpinner size="sm" text="Loading activities..." />
          ) : activities.length > 0 ? (
            <div className="flow-root">
              <ul className="-mb-8">
                {activities.map((activity, index) => (
                  <li key={activity.id || index}>
                    <div className="relative pb-8">
                      {index !== activities.length - 1 && (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" />
                      )}
                      <div className="relative flex space-x-3">
                        <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                          <DocumentTextIcon className="h-4 w-4 text-white" />
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-500">
                              {activity.description || `${activity.action} by ${activity.userName}`}
                            </p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            {timeAgo(activity.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No recent activities</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
