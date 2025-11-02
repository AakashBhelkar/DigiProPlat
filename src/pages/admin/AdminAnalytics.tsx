import React, { useState } from 'react';
import { Download, TrendingUp, Users, Package, DollarSign, ShoppingCart } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';

export const AdminAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  // Mock analytics data
  const revenueData = [
    { date: '2024-01-01', revenue: 12000, users: 240, products: 45, sales: 156 },
    { date: '2024-01-02', revenue: 18000, users: 360, products: 52, sales: 234 },
    { date: '2024-01-03', revenue: 15000, users: 300, products: 48, sales: 198 },
    { date: '2024-01-04', revenue: 22000, users: 440, products: 61, sales: 287 },
    { date: '2024-01-05', revenue: 19000, users: 380, products: 55, sales: 245 },
    { date: '2024-01-06', revenue: 25000, users: 500, products: 68, sales: 321 },
    { date: '2024-01-07', revenue: 21000, users: 420, products: 58, sales: 276 }
  ];

  const categoryData = [
    { name: 'Templates', value: 35, revenue: 45000, color: '#8B5CF6' },
    { name: 'E-books', value: 25, revenue: 32000, color: '#06B6D4' },
    { name: 'Graphics', value: 20, revenue: 28000, color: '#10B981' },
    { name: 'Software', value: 15, revenue: 21000, color: '#F59E0B' },
    { name: 'Audio', value: 3, revenue: 8000, color: '#EF4444' },
    { name: 'Video', value: 2, revenue: 5000, color: '#6366F1' }
  ];

  const topCreators = [
    { name: 'Sarah Johnson', revenue: 12450, products: 8, sales: 234 },
    { name: 'Alex Creative', revenue: 9870, products: 12, sales: 189 },
    { name: 'Design Studio', revenue: 8650, products: 6, sales: 156 },
    { name: 'Tech Guru', revenue: 7890, products: 15, sales: 298 },
    { name: 'Art Master', revenue: 6540, products: 9, sales: 134 }
  ];

  const stats = [
    {
      title: 'Total Revenue',
      value: '$142,580',
      change: '+18.2%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Total Users',
      value: '12,847',
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Active Products',
      value: '2,456',
      change: '+8.7%',
      trend: 'up',
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Total Sales',
      value: '8,924',
      change: '+15.3%',
      trend: 'up',
      icon: ShoppingCart,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    }
  ];

  const getChartData = () => {
    switch (selectedMetric) {
      case 'users':
        return revenueData.map(d => ({ ...d, value: d.users }));
      case 'products':
        return revenueData.map(d => ({ ...d, value: d.products }));
      case 'sales':
        return revenueData.map(d => ({ ...d, value: d.sales }));
      default:
        return revenueData.map(d => ({ ...d, value: d.revenue }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Analytics</h1>
          <p className="text-gray-600">Comprehensive insights into platform performance</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </button>
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
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className={`h-4 w-4 mr-1 ${stat.color}`} />
              <span className={`text-sm font-medium ${stat.color}`}>{stat.change}</span>
              <span className="text-sm text-gray-500 ml-1">vs last period</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Performance Overview</h3>
          <div className="flex items-center space-x-2">
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="revenue">Revenue</option>
              <option value="users">Users</option>
              <option value="products">Products</option>
              <option value="sales">Sales</option>
            </select>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={getChartData()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
            <YAxis />
            <Tooltip 
              formatter={(value) => [
                selectedMetric === 'revenue' ? `$${value}` : value,
                selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)
              ]}
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#6366F1" 
              fill="#6366F1" 
              fillOpacity={0.1} 
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Revenue by Category</h3>
          </div>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {categoryData.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">${item.revenue.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Creators */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Top Creators</h3>
            <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {topCreators.map((creator, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {creator.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{creator.name}</p>
                    <p className="text-xs text-gray-500">{creator.products} products • {creator.sales} sales</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">${creator.revenue.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Revenue</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Detailed Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">User Engagement</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Daily Active Users</span>
                <span className="text-sm font-medium text-gray-900">2,847</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Session Duration</span>
                <span className="text-sm font-medium text-gray-900">12m 34s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Bounce Rate</span>
                <span className="text-sm font-medium text-gray-900">24.5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Return Visitors</span>
                <span className="text-sm font-medium text-gray-900">68.2%</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Sales Performance</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Conversion Rate</span>
                <span className="text-sm font-medium text-gray-900">3.2%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Average Order Value</span>
                <span className="text-sm font-medium text-gray-900">$47.80</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Refund Rate</span>
                <span className="text-sm font-medium text-gray-900">2.1%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Customer Lifetime Value</span>
                <span className="text-sm font-medium text-gray-900">$156.40</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Platform Health</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Uptime</span>
                <span className="text-sm font-medium text-green-600">99.9%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Response Time</span>
                <span className="text-sm font-medium text-gray-900">245ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Error Rate</span>
                <span className="text-sm font-medium text-gray-900">0.02%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Storage Used</span>
                <span className="text-sm font-medium text-gray-900">2.4TB</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};