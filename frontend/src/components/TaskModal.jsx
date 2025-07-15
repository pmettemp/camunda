import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { 
  XMarkIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  DocumentTextIcon,
  UserIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { getTaskDetails, completeTask } from '../services/api';

const TaskModal = ({ task, isOpen, onClose, onTaskCompleted, userId }) => {
  const [taskDetails, setTaskDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset
  } = useForm({
    defaultValues: {
      reviewDecision: '',
      reviewComments: '',
      reviewerName: 'Current User'
    }
  });

  const watchReviewDecision = watch('reviewDecision');

  useEffect(() => {
    if (isOpen && task) {
      fetchTaskDetails();
    }
  }, [isOpen, task]);

  const fetchTaskDetails = async () => {
    try {
      setIsLoading(true);
      const response = await getTaskDetails(task.id);
      setTaskDetails(response.data);
    } catch (error) {
      toast.error('Failed to fetch task details');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      const variables = {
        ...data,
        reviewerName: userId || 'Current User',
        reviewedAt: new Date().toISOString()
      };

      await completeTask(task.id, {
        variables,
        action: 'review'
      });

      onTaskCompleted();
      reset();
    } catch (error) {
      toast.error('Failed to complete task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDraftUpdate = async (data) => {
    setIsSubmitting(true);
    
    try {
      const variables = {
        policyData: {
          ...taskDetails?.policyData,
          ...data,
          updatedAt: new Date().toISOString()
        }
      };

      await completeTask(task.id, {
        variables,
        action: 'draft'
      });

      onTaskCompleted();
      reset();
    } catch (error) {
      toast.error('Failed to update policy draft');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const isReviewTask = task.taskDefinitionId === 'Task_ReviewPolicy';
  const isDraftTask = task.taskDefinitionId === 'Task_DraftPolicy';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {isReviewTask ? 'Review Policy' : isDraftTask ? 'Update Policy Draft' : 'Task Details'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Policy Information */}
              {taskDetails?.policyData && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                    <DocumentTextIcon className="h-5 w-5 mr-2" />
                    Policy Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Title</label>
                      <p className="text-gray-900">{taskDetails.policyData.title}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Category</label>
                      <p className="text-gray-900">{taskDetails.policyData.category}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Risk Level</label>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        taskDetails.policyData.riskLevel === 'Critical' ? 'bg-red-100 text-red-800' :
                        taskDetails.policyData.riskLevel === 'High' ? 'bg-orange-100 text-orange-800' :
                        taskDetails.policyData.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {taskDetails.policyData.riskLevel}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Author</label>
                      <p className="text-gray-900 flex items-center">
                        <UserIcon className="h-4 w-4 mr-1" />
                        {taskDetails.policyData.authorName}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Effective Date</label>
                      <p className="text-gray-900 flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {new Date(taskDetails.policyData.effectiveDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                      <p className="text-gray-900 flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {new Date(taskDetails.policyData.expiryDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                    <div className="bg-white border border-gray-200 rounded p-3 max-h-40 overflow-y-auto">
                      <p className="text-gray-900 whitespace-pre-wrap">{taskDetails.policyData.content}</p>
                    </div>
                  </div>

                  {/* Compliance Flags */}
                  <div className="flex space-x-4">
                    {taskDetails.policyData.requiresLegalReview && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                        Legal Review Required
                      </span>
                    )}
                    {taskDetails.policyData.requiresComplianceReview && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                        Compliance Review Required
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Approval Decision Info */}
              {taskDetails?.variables?.approvalDecision && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Approval Decision</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Reviewer Type</label>
                      <p className="text-gray-900">{taskDetails.variables.approvalDecision.reviewerType}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Priority</label>
                      <p className="text-gray-900">{taskDetails.variables.approvalDecision.priority}</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Reason</label>
                      <p className="text-gray-900">{taskDetails.variables.approvalDecision.reason}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Review Form */}
              {isReviewTask && (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Review Decision *
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="approved"
                          {...register('reviewDecision', { required: 'Please select a decision' })}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700 flex items-center">
                          <CheckCircleIcon className="h-4 w-4 mr-1 text-green-600" />
                          Approve Policy
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="rejected"
                          {...register('reviewDecision', { required: 'Please select a decision' })}
                          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700 flex items-center">
                          <XCircleIcon className="h-4 w-4 mr-1 text-red-600" />
                          Reject Policy
                        </span>
                      </label>
                    </div>
                    {errors.reviewDecision && (
                      <p className="text-red-500 text-sm mt-1">{errors.reviewDecision.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Comments {watchReviewDecision === 'rejected' && '*'}
                    </label>
                    <textarea
                      {...register('reviewComments', {
                        required: watchReviewDecision === 'rejected' ? 'Comments are required for rejection' : false
                      })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={watchReviewDecision === 'rejected' ? 
                        'Please provide reasons for rejection...' : 
                        'Optional comments about the policy...'
                      }
                    />
                    {errors.reviewComments && (
                      <p className="text-red-500 text-sm mt-1">{errors.reviewComments.message}</p>
                    )}
                  </div>

                  <div className="flex justify-end space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`px-6 py-2 rounded-md text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                        watchReviewDecision === 'approved' 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : watchReviewDecision === 'rejected'
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {isSubmitting ? 'Submitting...' : 
                       watchReviewDecision === 'approved' ? 'Approve Policy' :
                       watchReviewDecision === 'rejected' ? 'Reject Policy' : 'Submit Review'}
                    </button>
                  </div>
                </form>
              )}

              {/* Draft Task - Simple completion */}
              {isDraftTask && (
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    onClick={onClose}
                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDraftUpdate({})}
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit for Review'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
