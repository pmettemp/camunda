import React, { useState } from 'react';
import {
  CogIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ArrowPathIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { useProcessInstances } from '../hooks/useWorkflow';
import { formatDateTime, timeAgo } from '../utils/workflowUtils';
import LoadingSpinner from './shared/LoadingSpinner';
import StatusBadge from './shared/StatusBadge';

const ProcessMonitor = () => {
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [filterState, setFilterState] = useState('all');
  
  const { 
    data: processData, 
    isLoading, 
    error, 
    refetch 
  } = useProcessInstances();

  const processes = processData?.data || [];

  // Filter processes by state
  const filteredProcesses = processes.filter(process => {
    if (filterState === 'all') return true;
    return process.state?.toLowerCase() === filterState.toLowerCase();
  });

  const getProcessStateColor = (state) => {
    const stateColors = {
      ACTIVE: 'bg-green-100 text-green-800',
      COMPLETED: 'bg-blue-100 text-blue-800',
      TERMINATED: 'bg-red-100 text-red-800',
      SUSPENDED: 'bg-yellow-100 text-yellow-800',
      INCIDENT: 'bg-red-100 text-red-800'
    };
    return stateColors[state] || 'bg-gray-100 text-gray-800';
  };

  const getProcessStateIcon = (state) => {
    switch (state) {
      case 'ACTIVE':
        return <PlayIcon className="h-4 w-4" />;
      case 'COMPLETED':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'TERMINATED':
        return <StopIcon className="h-4 w-4" />;
      case 'SUSPENDED':
        return <PauseIcon className="h-4 w-4" />;
      case 'INCIDENT':
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  const ProcessCard = ({ process }) => (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-3">
            <div className="mr-3">
              {getProcessStateIcon(process.state)}
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {process.bpmnProcessId || 'Unknown Process'}
              </h3>
              <p className="text-sm text-gray-500">
                Instance: {process.processInstanceKey}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getProcessStateColor(process.state)}`}>
              {process.state}
            </span>
            {process.version && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                v{process.version}
              </span>
            )}
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Started:</span>
              <span>{formatDateTime(process.startTime)}</span>
            </div>
            {process.endTime && (
              <div className="flex justify-between">
                <span>Ended:</span>
                <span>{formatDateTime(process.endTime)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Duration:</span>
              <span>
                {process.endTime 
                  ? `${Math.round((new Date(process.endTime) - new Date(process.startTime)) / 1000)}s`
                  : timeAgo(process.startTime)
                }
              </span>
            </div>
            {process.parentProcessInstanceKey && (
              <div className="flex justify-between">
                <span>Parent:</span>
                <span className="font-mono text-xs">{process.parentProcessInstanceKey}</span>
              </div>
            )}
          </div>

          {/* Variables Preview */}
          {process.variables && Object.keys(process.variables).length > 0 && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Variables</h4>
              <div className="space-y-1">
                {Object.entries(process.variables).slice(0, 3).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-xs">
                    <span className="text-gray-600">{key}:</span>
                    <span className="text-gray-900 font-mono truncate ml-2 max-w-32">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </span>
                  </div>
                ))}
                {Object.keys(process.variables).length > 3 && (
                  <div className="text-xs text-gray-500">
                    +{Object.keys(process.variables).length - 3} more...
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col space-y-2 ml-4">
          <button
            onClick={() => setSelectedProcess(process)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
            title="View Details"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
          {process.state === 'ACTIVE' && (
            <button
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
              title="Terminate Process"
            >
              <StopIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const ProcessDetailModal = ({ process, onClose }) => {
    if (!process) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              Process Instance Details
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <StopIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Process ID</label>
                  <p className="mt-1 text-sm text-gray-900 font-mono">{process.bpmnProcessId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Instance Key</label>
                  <p className="mt-1 text-sm text-gray-900 font-mono">{process.processInstanceKey}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">State</label>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getProcessStateColor(process.state)}`}>
                      {getProcessStateIcon(process.state)}
                      <span className="ml-1">{process.state}</span>
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Version</label>
                  <p className="mt-1 text-sm text-gray-900">{process.version}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Time</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDateTime(process.startTime)}</p>
                </div>
                {process.endTime && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">End Time</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDateTime(process.endTime)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Variables */}
            {process.variables && Object.keys(process.variables).length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Process Variables</h3>
                <div className="bg-gray-50 rounded-md p-4">
                  <pre className="text-sm text-gray-900 whitespace-pre-wrap">
                    {JSON.stringify(process.variables, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Incidents */}
            {process.incidents && process.incidents.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Incidents</h3>
                <div className="space-y-3">
                  {process.incidents.map((incident, index) => (
                    <div key={index} className="bg-red-50 border border-red-200 rounded-md p-4">
                      <div className="flex items-center">
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
                        <h4 className="text-sm font-medium text-red-800">
                          {incident.errorType || 'Unknown Error'}
                        </h4>
                      </div>
                      <p className="mt-2 text-sm text-red-700">{incident.errorMessage}</p>
                      <p className="mt-1 text-xs text-red-600">
                        Created: {formatDateTime(incident.creationTime)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" text="Loading process instances..." />;
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">Error loading process instances: {error.message}</p>
          <button 
            onClick={() => refetch()}
            className="mt-2 text-red-600 hover:text-red-800 underline"
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
            <CogIcon className="h-6 w-6 mr-2" />
            Process Monitor ({processes.length})
          </h1>
          <p className="text-gray-600 mt-1">
            Monitor and manage Camunda process instances
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
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {['all', 'active', 'completed', 'terminated', 'incident'].map((state) => (
            <button
              key={state}
              onClick={() => setFilterState(state)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                filterState === state
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {state.charAt(0).toUpperCase() + state.slice(1)}
              <span className="ml-2 py-0.5 px-2 rounded-full text-xs bg-gray-100 text-gray-600">
                {state === 'all' 
                  ? processes.length 
                  : processes.filter(p => p.state?.toLowerCase() === state.toLowerCase()).length
                }
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Process List */}
      {filteredProcesses.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProcesses.map((process) => (
            <ProcessCard key={process.processInstanceKey} process={process} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <CogIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No process instances found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filterState === 'all' 
              ? 'No process instances are currently running'
              : `No ${filterState} process instances found`
            }
          </p>
        </div>
      )}

      {/* Process Detail Modal */}
      {selectedProcess && (
        <ProcessDetailModal
          process={selectedProcess}
          onClose={() => setSelectedProcess(null)}
        />
      )}
    </div>
  );
};

export default ProcessMonitor;
