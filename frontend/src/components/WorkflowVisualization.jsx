import React, { useState, useEffect } from 'react';
import {
  PlayIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  UserIcon,
  CogIcon,
  DocumentTextIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { useProcessInstances } from '../hooks/useWorkflow';
import { formatDateTime, timeAgo } from '../utils/workflowUtils';
import LoadingSpinner from './shared/LoadingSpinner';

const WorkflowVisualization = ({ processInstanceKey }) => {
  const [selectedStep, setSelectedStep] = useState(null);
  
  const { 
    data: processData, 
    isLoading, 
    error 
  } = useProcessInstances();

  const processes = processData?.data || [];
  const currentProcess = processInstanceKey 
    ? processes.find(p => p.processInstanceKey === processInstanceKey)
    : processes[0]; // Show first process if none specified

  // Define the workflow steps based on the BPMN
  const workflowSteps = [
    {
      id: 'StartEvent_1',
      name: 'Policy Submitted',
      type: 'start',
      description: 'A new policy has been submitted for review',
      icon: DocumentTextIcon,
      position: { x: 50, y: 120 }
    },
    {
      id: 'Task_Evaluate',
      name: 'Auto-Approval Check',
      type: 'decision',
      description: 'DMN decision table evaluates if policy can be auto-approved',
      icon: CogIcon,
      position: { x: 200, y: 120 }
    },
    {
      id: 'Gateway_1',
      name: 'Auto-Approve?',
      type: 'gateway',
      description: 'Decision point based on risk level and policy criteria',
      icon: ArrowRightIcon,
      position: { x: 350, y: 120 }
    },
    {
      id: 'Task_Review',
      name: 'Manual Review',
      type: 'user-task',
      description: 'Human reviewer evaluates the policy manually',
      icon: UserIcon,
      position: { x: 350, y: 250 }
    },
    {
      id: 'EndEvent_AutoApproved',
      name: 'Auto-Approved',
      type: 'end',
      description: 'Policy was automatically approved',
      icon: CheckCircleIcon,
      position: { x: 500, y: 120 }
    },
    {
      id: 'EndEvent_Reviewed',
      name: 'Manually Reviewed',
      type: 'end',
      description: 'Policy was manually reviewed and processed',
      icon: CheckCircleIcon,
      position: { x: 500, y: 250 }
    }
  ];

  // Define connections between steps
  const connections = [
    { from: 'StartEvent_1', to: 'Task_Evaluate' },
    { from: 'Task_Evaluate', to: 'Gateway_1' },
    { from: 'Gateway_1', to: 'EndEvent_AutoApproved', label: 'Auto-Approve' },
    { from: 'Gateway_1', to: 'Task_Review', label: 'Manual Review' },
    { from: 'Task_Review', to: 'EndEvent_Reviewed' }
  ];

  const getStepStatus = (stepId) => {
    if (!currentProcess) return 'pending';
    
    // This is a simplified status determination
    // In a real implementation, you'd get this from Camunda's activity instance data
    switch (currentProcess.state) {
      case 'ACTIVE':
        if (stepId === 'StartEvent_1') return 'completed';
        if (stepId === 'Task_Evaluate') return 'completed';
        if (stepId === 'Gateway_1') return 'completed';
        if (stepId === 'Task_Review') return 'active';
        return 'pending';
      case 'COMPLETED':
        if (stepId.includes('End')) return 'completed';
        return 'completed';
      default:
        return 'pending';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 border-green-600';
      case 'active':
        return 'bg-blue-500 border-blue-600 animate-pulse';
      case 'error':
        return 'bg-red-500 border-red-600';
      case 'pending':
      default:
        return 'bg-gray-300 border-gray-400';
    }
  };

  const getStatusIcon = (status, IconComponent) => {
    const iconClass = "h-6 w-6 text-white";
    
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className={iconClass} />;
      case 'active':
        return <ClockIcon className={iconClass} />;
      case 'error':
        return <ExclamationTriangleIcon className={iconClass} />;
      default:
        return <IconComponent className={iconClass} />;
    }
  };

  const WorkflowStep = ({ step }) => {
    const status = getStepStatus(step.id);
    const isSelected = selectedStep?.id === step.id;
    
    return (
      <div
        className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
        style={{ left: step.position.x, top: step.position.y }}
        onClick={() => setSelectedStep(step)}
      >
        <div className={`
          relative w-16 h-16 rounded-full border-4 flex items-center justify-center
          ${getStatusColor(status)}
          ${isSelected ? 'ring-4 ring-blue-300' : ''}
          transition-all duration-200 hover:scale-110
        `}>
          {getStatusIcon(status, step.icon)}
        </div>
        
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 text-center">
          <div className="text-sm font-medium text-gray-900 whitespace-nowrap">
            {step.name}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </div>
        </div>
      </div>
    );
  };

  const ConnectionLine = ({ connection }) => {
    const fromStep = workflowSteps.find(s => s.id === connection.from);
    const toStep = workflowSteps.find(s => s.id === connection.to);
    
    if (!fromStep || !toStep) return null;

    const fromX = fromStep.position.x + 32; // Half of step width
    const fromY = fromStep.position.y;
    const toX = toStep.position.x - 32;
    const toY = toStep.position.y;

    const midX = (fromX + toX) / 2;
    const midY = (fromY + toY) / 2;

    return (
      <g>
        <line
          x1={fromX}
          y1={fromY}
          x2={toX}
          y2={toY}
          stroke="#9CA3AF"
          strokeWidth="2"
          markerEnd="url(#arrowhead)"
        />
        {connection.label && (
          <text
            x={midX}
            y={midY - 10}
            textAnchor="middle"
            className="text-xs fill-gray-600"
          >
            {connection.label}
          </text>
        )}
      </g>
    );
  };

  const StepDetails = ({ step }) => {
    if (!step) return null;

    const status = getStepStatus(step.id);
    
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
        <div className="flex items-center mb-4">
          <div className={`
            w-12 h-12 rounded-full border-2 flex items-center justify-center mr-4
            ${getStatusColor(status)}
          `}>
            {getStatusIcon(status, step.icon)}
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">{step.name}</h3>
            <p className="text-sm text-gray-500">{step.type.replace('-', ' ').toUpperCase()}</p>
          </div>
        </div>
        
        <p className="text-gray-700 mb-4">{step.description}</p>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-500">Status:</span>
            <span className={`text-sm font-medium ${
              status === 'completed' ? 'text-green-600' :
              status === 'active' ? 'text-blue-600' :
              status === 'error' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
          
          {currentProcess && (
            <>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Process Instance:</span>
                <span className="text-sm text-gray-900 font-mono">
                  {currentProcess.processInstanceKey}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Started:</span>
                <span className="text-sm text-gray-900">
                  {formatDateTime(currentProcess.startTime)}
                </span>
              </div>
              
              {currentProcess.endTime && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Completed:</span>
                  <span className="text-sm text-gray-900">
                    {formatDateTime(currentProcess.endTime)}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" text="Loading workflow..." />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">Error loading workflow: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <CogIcon className="h-6 w-6 mr-2" />
          Policy Management Workflow
        </h2>
        {currentProcess && (
          <p className="text-gray-600 mt-1">
            Process Instance: {currentProcess.processInstanceKey} 
            ({currentProcess.state})
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workflow Diagram */}
        <div className="lg:col-span-2">
          <div className="relative bg-gray-50 rounded-lg p-8" style={{ height: '400px' }}>
            {/* SVG for connection lines */}
            <svg className="absolute inset-0 w-full h-full">
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3.5, 0 7"
                    fill="#9CA3AF"
                  />
                </marker>
              </defs>
              
              {connections.map((connection, index) => (
                <ConnectionLine key={index} connection={connection} />
              ))}
            </svg>

            {/* Workflow Steps */}
            {workflowSteps.map((step) => (
              <WorkflowStep key={step.id} step={step} />
            ))}
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
              <span>Completed</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
              <span>Active</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-gray-300 mr-2"></div>
              <span>Pending</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
              <span>Error</span>
            </div>
          </div>
        </div>

        {/* Step Details */}
        <div>
          {selectedStep ? (
            <StepDetails step={selectedStep} />
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <CogIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select a Step
              </h3>
              <p className="text-gray-600">
                Click on any step in the workflow to view its details and status.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Process Variables */}
      {currentProcess?.variables && Object.keys(currentProcess.variables).length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Process Variables</h3>
          <div className="bg-gray-50 rounded-md p-4">
            <pre className="text-sm text-gray-900 whitespace-pre-wrap">
              {JSON.stringify(currentProcess.variables, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowVisualization;
