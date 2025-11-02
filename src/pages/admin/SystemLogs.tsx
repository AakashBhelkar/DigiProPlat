import React, { useState } from 'react';
import { Search, Download, Eye, User, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { Json } from '../../types/database';

interface SystemLog {
  id: string;
  adminName: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details: Json;
  ipAddress: string;
  createdAt: string;
}

export const SystemLogs: React.FC = () => {
  const [logs] = useState<SystemLog[]>([
    {
      id: '1',
      adminName: 'Super Admin',
      action: 'login',
      resourceType: 'session',
      ipAddress: '192.168.1.1',
      details: { userAgent: 'Chrome/91.0' },
      createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      adminName: 'Super Admin',
      action: 'suspend_user',
      resourceType: 'user',
      resourceId: 'user-123',
      ipAddress: '192.168.1.1',
      details: { reason: 'Policy violation', userId: 'user-123' },
      createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
    },
    {
      id: '3',
      adminName: 'Super Admin',
      action: 'update_report_status',
      resourceType: 'report',
      resourceId: 'report-456',
      ipAddress: '192.168.1.1',
      details: { status: 'resolved', notes: 'Content removed' },
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [dateRange, setDateRange] = useState('today');

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.adminName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.resourceType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'login':
      case 'logout':
        return User;
      case 'suspend_user':
      case 'activate_user':
        return User;
      case 'update_report_status':
        return Eye;
      default:
        return Activity;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'login':
        return 'text-green-600 bg-green-100';
      case 'logout':
        return 'text-gray-600 bg-gray-100';
      case 'suspend_user':
        return 'text-red-600 bg-red-100';
      case 'activate_user':
        return 'text-green-600 bg-green-100';
      case 'update_report_status':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Logs</h1>
          <p className="text-gray-600">Monitor admin activities and system events</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="h-4 w-4" />
            <span>Export Logs</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Actions</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
              <option value="suspend_user">Suspend User</option>
              <option value="activate_user">Activate User</option>
              <option value="update_report_status">Update Report</option>
            </select>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Activity Log</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredLogs.map((log, index) => {
            const Icon = getActionIcon(log.action);
            const colorClass = getActionColor(log.action);
            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-2 rounded-full ${colorClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {log.adminName} performed {log.action.replace('_', ' ')}
                        </p>
                        <p className="text-sm text-gray-600">
                          Resource: {log.resourceType}
                          {log.resourceId && ` (ID: ${log.resourceId})`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(log.createdAt))} ago
                        </p>
                        <p className="text-xs text-gray-400">IP: {log.ipAddress}</p>
                      </div>
                    </div>
                    {Object.keys(log.details).length > 0 && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs font-medium text-gray-700 mb-1">Details:</p>
                        <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {filteredLogs.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No logs found</h3>
          <p className="text-gray-600">
            Try adjusting your search terms or filters.
          </p>
        </div>
      )}
    </div>
  );
};