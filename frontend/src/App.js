import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  HomeIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  CogIcon,
  UsersIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

import PolicyForm from './components/PolicyForm';
import TaskList from './components/TaskList';
import PolicyList from './components/PolicyList';
import Dashboard from './components/Dashboard';
import ProcessMonitor from './components/ProcessMonitor';
import UserManagement from './components/UserManagement';
import WorkflowVisualization from './components/WorkflowVisualization';



// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const Navigation = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: HomeIcon },
    { path: '/policies/new', label: 'Create Policy', icon: DocumentTextIcon },
    { path: '/policies', label: 'All Policies', icon: ClipboardDocumentListIcon },
    { path: '/tasks', label: 'My Tasks', icon: ClockIcon },
    { path: '/processes', label: 'Process Monitor', icon: CogIcon },
    { path: '/workflow', label: 'Workflow View', icon: ChartBarIcon },
    { path: '/users', label: 'User Management', icon: UsersIcon },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Policy Management System</h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-1" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="text-sm text-gray-600">
              Welcome, Test User
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          
          <main className="py-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/policies/new" element={<PolicyForm />} />
              <Route path="/policies" element={<PolicyList />} />
              <Route path="/tasks" element={<TaskList />} />
              <Route path="/processes" element={<ProcessMonitor />} />
              <Route path="/workflow" element={<WorkflowVisualization />} />
              <Route path="/users" element={<UserManagement />} />
            </Routes>
          </main>
          
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
