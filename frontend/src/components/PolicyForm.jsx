import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { CalendarIcon, DocumentTextIcon, TagIcon } from '@heroicons/react/24/outline';
import { createPolicy } from '../services/api';

const PolicyForm = ({ onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stakeholders, setStakeholders] = useState(['']);
  const [tags, setTags] = useState(['']);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm({
    defaultValues: {
      category: 'HR',
      riskLevel: 'Low',
      requiresLegalReview: false,
      requiresComplianceReview: false
    }
  });

  const watchCategory = watch('category');
  const watchRiskLevel = watch('riskLevel');

  const categories = [
    'HR', 'IT', 'Finance', 'Legal', 'Compliance', 'Operations', 'Security'
  ];

  const riskLevels = [
    'Low', 'Medium', 'High', 'Critical'
  ];

  const addStakeholder = () => {
    setStakeholders([...stakeholders, '']);
  };

  const removeStakeholder = (index) => {
    setStakeholders(stakeholders.filter((_, i) => i !== index));
  };

  const updateStakeholder = (index, value) => {
    const updated = [...stakeholders];
    updated[index] = value;
    setStakeholders(updated);
  };

  const addTag = () => {
    setTags([...tags, '']);
  };

  const removeTag = (index) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const updateTag = (index, value) => {
    const updated = [...tags];
    updated[index] = value;
    setTags(updated);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      const policyData = {
        ...data,
        stakeholders: stakeholders.filter(email => email.trim() !== ''),
        tags: tags.filter(tag => tag.trim() !== '')
      };

      const response = await createPolicy(policyData);
      
      toast.success('Policy created successfully!');
      reset();
      setStakeholders(['']);
      setTags(['']);
      
      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (error) {
      console.error('Error creating policy:', error);
      toast.error(error.response?.data?.message || 'Failed to create policy');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <DocumentTextIcon className="h-6 w-6 mr-2" />
          Create New Policy
        </h2>
        <p className="text-gray-600 mt-2">
          Fill out the form below to create a new policy. Required fields are marked with *.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Policy Title *
            </label>
            <input
              type="text"
              {...register('title', {
                required: 'Title is required',
                minLength: { value: 3, message: 'Title must be at least 3 characters' },
                maxLength: { value: 200, message: 'Title must be less than 200 characters' }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter policy title"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              {...register('category', { required: 'Category is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
            )}
          </div>
        </div>

        {/* Risk Level and Compliance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Risk Level *
            </label>
            <select
              {...register('riskLevel', { required: 'Risk level is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {riskLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
            {errors.riskLevel && (
              <p className="text-red-500 text-sm mt-1">{errors.riskLevel.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-4 pt-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                {...register('requiresLegalReview')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Legal Review</span>
            </label>
          </div>

          <div className="flex items-center space-x-4 pt-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                {...register('requiresComplianceReview')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Compliance Review</span>
            </label>
          </div>
        </div>

        {/* Auto-approval Preview */}
        {(watchCategory && watchRiskLevel) && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Approval Preview</h4>
            <p className="text-sm text-blue-700">
              Based on your selections, this policy will likely be:
              {(watchCategory === 'HR' && watchRiskLevel === 'Low') ||
               (watchCategory === 'IT' && watchRiskLevel === 'Low') ? (
                <span className="font-medium text-green-700"> Auto-approved</span>
              ) : (
                <span className="font-medium text-orange-700"> Sent for manual review</span>
              )}
            </p>
          </div>
        )}

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CalendarIcon className="h-4 w-4 inline mr-1" />
              Effective Date *
            </label>
            <input
              type="date"
              {...register('effectiveDate', { required: 'Effective date is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.effectiveDate && (
              <p className="text-red-500 text-sm mt-1">{errors.effectiveDate.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CalendarIcon className="h-4 w-4 inline mr-1" />
              Expiry Date *
            </label>
            <input
              type="date"
              {...register('expiryDate', { required: 'Expiry date is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.expiryDate && (
              <p className="text-red-500 text-sm mt-1">{errors.expiryDate.message}</p>
            )}
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Policy Content *
          </label>
          <textarea
            {...register('content', {
              required: 'Content is required',
              minLength: { value: 10, message: 'Content must be at least 10 characters' }
            })}
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter the policy content..."
          />
          {errors.content && (
            <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
          )}
        </div>

        {/* Stakeholders */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stakeholders (Email addresses)
          </label>
          {stakeholders.map((email, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <input
                type="email"
                value={email}
                onChange={(e) => updateStakeholder(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="stakeholder@company.com"
              />
              {stakeholders.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeStakeholder(index)}
                  className="px-3 py-2 text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addStakeholder}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            + Add Stakeholder
          </button>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <TagIcon className="h-4 w-4 inline mr-1" />
            Tags
          </label>
          {tags.map((tag, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                value={tag}
                onChange={(e) => updateTag(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter tag"
              />
              {tags.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTag(index)}
                  className="px-3 py-2 text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addTag}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            + Add Tag
          </button>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => {
              reset();
              setStakeholders(['']);
              setTags(['']);
            }}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating...' : 'Create Policy'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PolicyForm;
