import React, { useState, useMemo } from 'react';
import { useQuery } from 'react-query';
import {
  DocumentTextIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  PlusIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon
} from '@heroicons/react/24/outline';
import { usePolicies } from '../hooks/useWorkflow';
import { 
  formatDate, 
  timeAgo, 
  getStatusColor, 
  getRiskLevelColor,
  getCategoryIcon,
  exportToCSV,
  filterPolicies
} from '../utils/workflowUtils';
import LoadingSpinner from './shared/LoadingSpinner';
import StatusBadge from './shared/StatusBadge';
import SearchFilter from './shared/SearchFilter';

const PolicyList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [selectedPolicies, setSelectedPolicies] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

  // Fetch policies with current parameters
  const { 
    data: policiesData, 
    isLoading, 
    error, 
    refetch 
  } = usePolicies({
    page: currentPage,
    limit: pageSize,
    sortBy,
    sortOrder,
    ...filters
  });

  const policies = policiesData?.data?.policies || [];
  const totalCount = policiesData?.data?.total || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Filter policies based on search term
  const filteredPolicies = useMemo(() => {
    return filterPolicies(policies, searchTerm);
  }, [policies, searchTerm]);

  // Filter configuration
  const filterConfig = [
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'draft', label: 'Draft' },
        { value: 'under_review', label: 'Under Review' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' },
        { value: 'published', label: 'Published' },
        { value: 'archived', label: 'Archived' },
        { value: 'expired', label: 'Expired' }
      ]
    },
    {
      key: 'category',
      label: 'Category',
      type: 'select',
      options: [
        { value: 'HR', label: 'HR' },
        { value: 'IT', label: 'IT' },
        { value: 'Finance', label: 'Finance' },
        { value: 'Legal', label: 'Legal' },
        { value: 'Compliance', label: 'Compliance' },
        { value: 'Operations', label: 'Operations' },
        { value: 'Security', label: 'Security' }
      ]
    },
    {
      key: 'riskLevel',
      label: 'Risk Level',
      type: 'select',
      options: [
        { value: 'Low', label: 'Low' },
        { value: 'Medium', label: 'Medium' },
        { value: 'High', label: 'High' },
        { value: 'Critical', label: 'Critical' }
      ]
    },
    {
      key: 'author',
      label: 'Author',
      type: 'text',
      placeholder: 'Author name...'
    },
    {
      key: 'effectiveDate',
      label: 'Effective Date',
      type: 'date'
    }
  ];

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const handleSelectPolicy = (policyId) => {
    setSelectedPolicies(prev => 
      prev.includes(policyId) 
        ? prev.filter(id => id !== policyId)
        : [...prev, policyId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPolicies.length === filteredPolicies.length) {
      setSelectedPolicies([]);
    } else {
      setSelectedPolicies(filteredPolicies.map(p => p.id));
    }
  };

  const handleBulkAction = (action) => {
    console.log(`Bulk ${action} for policies:`, selectedPolicies);
    // Implement bulk actions here
    setSelectedPolicies([]);
  };

  const handleExport = () => {
    const exportData = filteredPolicies.map(policy => ({
      Title: policy.title,
      Category: policy.category,
      Status: policy.status,
      'Risk Level': policy.riskLevel,
      Author: policy.authorName,
      'Created Date': formatDate(policy.createdAt),
      'Effective Date': formatDate(policy.effectiveDate),
      'Expiry Date': formatDate(policy.expiryDate)
    }));
    
    exportToCSV(exportData, `policies-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const PolicyCard = ({ policy }) => (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={selectedPolicies.includes(policy.id)}
            onChange={() => handleSelectPolicy(policy.id)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
          />
          <div className="text-2xl mr-3">{getCategoryIcon(policy.category)}</div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900 mb-2">{policy.title}</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              <StatusBadge status={policy.status} size="sm" />
              <StatusBadge status={policy.riskLevel} type="risk" size="sm" />
              <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                {policy.category}
              </span>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Author: {policy.authorName}</p>
              <p>Created: {formatDate(policy.createdAt)}</p>
              <p>Effective: {formatDate(policy.effectiveDate)} - {formatDate(policy.expiryDate)}</p>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <button className="p-2 text-gray-400 hover:text-blue-600">
            <EyeIcon className="h-4 w-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-green-600">
            <PencilIcon className="h-4 w-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-red-600">
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const PolicyRow = ({ policy }) => (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <input
          type="checkbox"
          checked={selectedPolicies.includes(policy.id)}
          onChange={() => handleSelectPolicy(policy.id)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div className="text-lg mr-3">{getCategoryIcon(policy.category)}</div>
          <div>
            <div className="text-sm font-medium text-gray-900">{policy.title}</div>
            <div className="text-sm text-gray-500">ID: {policy.id}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
          {policy.category}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge status={policy.status} size="sm" />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge status={policy.riskLevel} type="risk" size="sm" />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {policy.authorName}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDate(policy.createdAt)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDate(policy.effectiveDate)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex space-x-2">
          <button className="text-blue-600 hover:text-blue-900">
            <EyeIcon className="h-4 w-4" />
          </button>
          <button className="text-green-600 hover:text-green-900">
            <PencilIcon className="h-4 w-4" />
          </button>
          <button className="text-red-600 hover:text-red-900">
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );

  if (isLoading) {
    return <LoadingSpinner size="lg" text="Loading policies..." />;
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">Error loading policies: {error.message}</p>
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
            <DocumentTextIcon className="h-6 w-6 mr-2" />
            All Policies ({totalCount})
          </h1>
          <p className="text-gray-600 mt-1">
            Manage and review all policies in the system
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleExport}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export
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
          
          <button
            onClick={() => window.location.href = '/policies/new'}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            New Policy
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <SearchFilter
        onSearch={setSearchTerm}
        onFilter={setFilters}
        filters={filterConfig}
        placeholder="Search policies by title, content, author..."
        className="mb-6"
      />

      {/* Bulk Actions */}
      {selectedPolicies.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-800">
              {selectedPolicies.length} policies selected
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkAction('approve')}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
              >
                Bulk Approve
              </button>
              <button
                onClick={() => handleBulkAction('archive')}
                className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Bulk Archive
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                Bulk Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {filteredPolicies.map((policy) => (
            <PolicyCard key={policy.id} policy={policy} />
          ))}
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md mb-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedPolicies.length === filteredPolicies.length && filteredPolicies.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('title')}
                >
                  Policy
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('status')}
                >
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk Level
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('authorName')}
                >
                  Author
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('createdAt')}
                >
                  Created
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('effectiveDate')}
                >
                  Effective Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPolicies.map((policy) => (
                <PolicyRow key={policy.id} policy={policy} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-sm text-gray-700">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} results
            </span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="ml-4 px-3 py-1 border border-gray-300 rounded text-sm"
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 text-sm border rounded ${
                    currentPage === page
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {filteredPolicies.length === 0 && (
        <div className="text-center py-12">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No policies found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || Object.keys(filters).length > 0 
              ? 'Try adjusting your search or filters'
              : 'Get started by creating a new policy'
            }
          </p>
          {!searchTerm && Object.keys(filters).length === 0 && (
            <div className="mt-6">
              <button
                onClick={() => window.location.href = '/policies/new'}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                New Policy
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PolicyList;
