import React, { useEffect, useState } from 'react';
import { ShoppingCart, DollarSign, Download, Eye } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../lib/supabase';

type Stat = {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ElementType;
  color: string;
};

type RevenueDatum = { date: string; revenue: number; orders: number };
type TrafficDatum = { date: string; views: number; visitors: number };
type CategoryDatum = { name: string; value: number; color: string };
type TopProduct = { name: string; revenue: number; sales: number };

export const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [revenueData, setRevenueData] = useState<RevenueDatum[]>([]);
  const [trafficData, setTrafficData] = useState<TrafficDatum[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryDatum[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      // Replace with your actual Supabase queries and mapping
      // Example: fetch revenue, traffic, category, top products, stats
      // You may need to adjust these queries to match your schema
      // Revenue
      const { data: revenue } = await supabase
        .from('revenue')
        .select('*');
      setRevenueData((revenue as RevenueDatum[]) || []);
      // Traffic
      const { data: traffic } = await supabase
        .from('traffic')
        .select('*');
      setTrafficData((traffic as TrafficDatum[]) || []);
      // Categories
      const { data: categories } = await supabase
        .from('categories')
        .select('*');
      setCategoryData((categories as CategoryDatum[]) || []);
      // Top Products
      const { data: top } = await supabase
        .from('products')
        .select('name, total_revenue:revenue, sales_count:sales');
      setTopProducts((top as TopProduct[]) || []);
      // Stats (example, adjust as needed)
      setStats([
        {
          title: 'Total Revenue',
          value: revenue ? `$${revenue.reduce((acc, cur) => acc + cur.revenue, 0)}` : '-',
          change: '',
          trend: 'up',
          icon: DollarSign,
          color: 'text-green-600'
        },
        {
          title: 'Total Orders',
          value: revenue ? `${revenue.reduce((acc, cur) => acc + cur.orders, 0)}` : '-',
          change: '',
          trend: 'up',
          icon: ShoppingCart,
          color: 'text-blue-600'
        },
        {
          title: 'Total Views',
          value: traffic ? `${traffic.reduce((acc, cur) => acc + cur.views, 0)}` : '-',
          change: '',
          trend: 'up',
          icon: Eye,
          color: 'text-indigo-600'
        },
      ]);
      setLoading(false);
    };
    fetchAnalytics();
  }, [timeRange]);

  return (
    <div className="min-h-screen bg-white dark:bg-white">
      {/* Responsive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 text-sm sm:text-base">Track your performance and optimize your sales</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm sm:text-base justify-center">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {loading ? (
          <div className="col-span-full text-center">Loading stats...</div>
        ) : stats.length === 0 ? (
          <div className="col-span-full text-center">No stats available.</div>
        ) : (
          stats.map((stat, index) => (
            <div key={index} className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 text-left">
              <div className="flex items-center mb-2">
                <stat.icon className="h-6 w-6 mr-2 text-white" />
                <span className="text-lg font-semibold text-white">{stat.title}</span>
              </div>
              <div className="text-2xl font-bold mb-1 text-white">{stat.value}</div>
              <div className="text-sm text-white">{stat.change}</div>
            </div>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Revenue Overview</h3>
          </div>
          {loading ? (
            <div className="p-6 text-center">Loading revenue data...</div>
          ) : revenueData.length === 0 ? (
            <div className="p-6 text-center">No revenue data.</div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`$${value}`, 'Revenue']}
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366F1" fill="#6366F1" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Traffic Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Traffic Overview</h3>
          </div>
          {loading ? (
            <div className="p-6 text-center">Loading traffic data...</div>
          ) : trafficData.length === 0 ? (
            <div className="p-6 text-center">No traffic data.</div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trafficData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <Line type="monotone" dataKey="views" stroke="#3B82F6" strokeWidth={2} />
                <Line type="monotone" dataKey="visitors" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Category Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Sales by Category</h3>
          {loading ? (
            <div className="p-6 text-center">Loading category data...</div>
          ) : categoryData.length === 0 ? (
            <div className="p-6 text-center">No category data.</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
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
          )}
          <div className="mt-4 space-y-2">
            {categoryData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-xs sm:text-sm text-gray-600">{item.name}</span>
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Top Performing Products</h3>
          {loading ? (
            <div className="p-6 text-center">Loading top products...</div>
          ) : topProducts.length === 0 ? (
            <div className="p-6 text-center">No top products data.</div>
          ) : (
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-900">{product.name}</h4>
                    <p className="text-xs sm:text-sm text-gray-600">{product.sales} sales</p>
                  </div>
                  <div className="text-right mt-2 sm:mt-0">
                    <p className="text-xs sm:text-sm font-semibold text-gray-900">${product.revenue}</p>
                    <p className="text-xs text-gray-500">Revenue</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};