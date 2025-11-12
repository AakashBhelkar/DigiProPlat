import React, { useState, useEffect } from 'react';
import { AlertTriangle, Eye, CheckCircle, XCircle, Flag, MessageSquare } from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

export const ContentModeration: React.FC = () => {
  const { reports, fetchReports, updateReportStatus, isLoading } = useAdminStore();
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'reviewing' | 'resolved' | 'dismissed'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'spam' | 'inappropriate' | 'copyright' | 'fraud' | 'other'>('all');
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const filteredReports = reports.filter(report => {
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesType = typeFilter === 'all' || report.type === typeFilter;
    return matchesStatus && matchesType;
  });

  const handleStatusUpdate = async (reportId: string, status: string, notes?: string) => {
    await updateReportStatus(reportId, status, notes);
    setSelectedReport(null);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      reviewing: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      dismissed: 'bg-gray-100 text-gray-800'
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'spam': return MessageSquare;
      case 'inappropriate': return AlertTriangle;
      case 'copyright': return Flag;
      case 'fraud': return XCircle;
      default: return AlertTriangle;
    }
  };

  const getPriorityColor = (type: string) => {
    switch (type) {
      case 'fraud': return 'text-red-600';
      case 'copyright': return 'text-orange-600';
      case 'inappropriate': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Moderation</h1>
          <p className="text-gray-600">Review and manage user reports and content violations</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            {reports.filter(r => r.status === 'pending').length} Pending
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'reviewing' | 'resolved' | 'dismissed')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="reviewing">Reviewing</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as 'all' | 'spam' | 'inappropriate' | 'copyright' | 'fraud' | 'other')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="all">All Types</option>
              <option value="spam">Spam</option>
              <option value="inappropriate">Inappropriate</option>
              <option value="copyright">Copyright</option>
              <option value="fraud">Fraud</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.map((report, index) => {
          const TypeIcon = getTypeIcon(report.type);
          return (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className={`p-2 rounded-full bg-gray-100 ${getPriorityColor(report.type)}`}>
                    <TypeIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-primary capitalize">
                        {report.type} Report
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(report.status)}`}>
                        {report.status}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3">{report.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Reporter:</span>
                        <p>{report.reporterEmail}</p>
                      </div>
                      <div>
                        <span className="font-medium">Reported User:</span>
                        <p>{report.reportedUserEmail}</p>
                      </div>
                      <div>
                        <span className="font-medium">Content Type:</span>
                        <p className="capitalize">{report.contentType}</p>
                      </div>
                      <div>
                        <span className="font-medium">Submitted:</span>
                        <p>{formatDistanceToNow(new Date(report.createdAt))} ago</p>
                      </div>
                    </div>
                    {report.adminNotes && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <span className="font-medium">Admin Notes:</span> {report.adminNotes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                    <Eye className="h-5 w-5" />
                  </button>
                  {report.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(report.id, 'reviewing')}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Review
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(report.id, 'resolved', 'Content removed and user warned')}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Resolve
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(report.id, 'dismissed', 'No violation found')}
                        className="px-3 py-1 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                      >
                        Dismiss
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredReports.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-primary mb-2">No reports found</h3>
          <p className="text-gray-600">
            {statusFilter === 'pending' 
              ? 'All reports have been reviewed!' 
              : 'Try adjusting your filters to see more reports.'
            }
          </p>
        </div>
      )}
    </div>
  );
};