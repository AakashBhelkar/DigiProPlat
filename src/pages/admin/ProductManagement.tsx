import React, { useState } from 'react';
import { Search, MoreVertical, Eye, Edit, Trash2, Ban, CheckCircle, Package, DollarSign } from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

interface AdminProduct {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  authorName: string;
  authorEmail: string;
  isPublic: boolean;
  salesCount: number;
  totalRevenue: number;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'suspended' | 'under_review';
}

export const ProductManagement: React.FC = () => {
  const { isLoading } = useAdminStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'under_review'>('all');
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  // Mock data - in real implementation, this would come from Supabase
  const [products] = useState<AdminProduct[]>([
    {
      id: '1',
      title: 'Premium Social Media Templates',
      description: 'Professional Instagram and Facebook post templates',
      category: 'templates',
      price: 29.99,
      authorName: 'Sarah Johnson',
      authorEmail: 'sarah@example.com',
      isPublic: true,
      salesCount: 156,
      totalRevenue: 4678.44,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active'
    },
    {
      id: '2',
      title: 'Modern Logo Collection',
      description: 'Set of 50 minimalist logos for startups',
      category: 'graphics',
      price: 49.99,
      authorName: 'Alex Creative',
      authorEmail: 'alex@example.com',
      isPublic: true,
      salesCount: 89,
      totalRevenue: 4449.11,
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active'
    },
    {
      id: '3',
      title: 'Suspicious E-book Content',
      description: 'This content has been flagged for review',
      category: 'ebooks',
      price: 19.99,
      authorName: 'John Doe',
      authorEmail: 'john@example.com',
      isPublic: false,
      salesCount: 12,
      totalRevenue: 239.88,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'under_review'
    }
  ]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.authorEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      suspended: 'bg-red-100 text-red-800',
      under_review: 'bg-yellow-100 text-yellow-800'
    };
    return badges[status as keyof typeof badges] || badges.active;
  };

  const handleProductAction = (productId: string, action: string) => {
    console.log(`${action} product ${productId}`);
    setSelectedProduct(null);
  };

  const stats = [
    {
      title: 'Total Products',
      value: products.length.toString(),
      change: '+12 this week',
      icon: Package,
      color: 'text-blue-600'
    },
    {
      title: 'Active Products',
      value: products.filter(p => p.status === 'active').length.toString(),
      change: '+8 this week',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      title: 'Under Review',
      value: products.filter(p => p.status === 'under_review').length.toString(),
      change: '+3 pending',
      icon: Eye,
      color: 'text-yellow-600'
    },
    {
      title: 'Total Revenue',
      value: `$${products.reduce((sum, p) => sum + p.totalRevenue, 0).toFixed(2)}`,
      change: '+15.3% this month',
      icon: DollarSign,
      color: 'text-purple-600'
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
          <p className="text-gray-600">Monitor and manage all products on the platform</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full bg-gray-50`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
            <div className="mt-4">
              <span className={`text-sm font-medium ${stat.color}`}>{stat.change}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search products, authors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Categories</option>
              <option value="templates">Templates</option>
              <option value="ebooks">E-books</option>
              <option value="graphics">Graphics</option>
              <option value="software">Software</option>
              <option value="audio">Audio</option>
              <option value="video">Video</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'suspended' | 'under_review')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="under_review">Under Review</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sales
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product, index) => (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 line-clamp-1">
                        {product.title}
                      </div>
                      <div className="text-sm text-gray-500 line-clamp-1">
                        {product.description}
                      </div>
                      <div className="text-xs text-gray-400">
                        Created {formatDistanceToNow(new Date(product.createdAt))} ago
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{product.authorName}</div>
                      <div className="text-sm text-gray-500">{product.authorEmail}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${product.price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.salesCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${product.totalRevenue.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(product.status)}`}>
                      {product.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="relative">
                      <button
                        onClick={() => setSelectedProduct(selectedProduct === product.id ? null : product.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>
                      {selectedProduct === product.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                          <button
                            onClick={() => handleProductAction(product.id, 'view')}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                          >
                            <Eye className="h-4 w-4" />
                            <span>View Details</span>
                          </button>
                          <button
                            onClick={() => handleProductAction(product.id, 'edit')}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                          >
                            <Edit className="h-4 w-4" />
                            <span>Edit Product</span>
                          </button>
                          {product.status === 'active' ? (
                            <button
                              onClick={() => handleProductAction(product.id, 'suspend')}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                            >
                              <Ban className="h-4 w-4" />
                              <span>Suspend</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleProductAction(product.id, 'activate')}
                              className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 flex items-center space-x-2"
                            >
                              <CheckCircle className="h-4 w-4" />
                              <span>Activate</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleProductAction(product.id, 'delete')}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredProducts.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600">
            Try adjusting your search terms or filters.
          </p>
        </div>
      )}
    </div>
  );
};