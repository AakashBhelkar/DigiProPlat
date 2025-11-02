import React, { useState } from 'react';
import { Plus, Edit, Trash2, Copy, Calendar, Percent, DollarSign, Tag, Users, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  description: string;
  productId?: string;
  productTitle?: string;
  usageLimit?: number;
  usageCount: number;
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
}

interface CouponSystemProps {
  coupons: Coupon[];
  onCreateCoupon: (coupon: Omit<Coupon, 'id' | 'usageCount' | 'createdAt'>) => void;
  onDeleteCoupon: (id: string) => void;
  onToggleCoupon: (id: string) => void;
}

export const CouponSystem: React.FC<CouponSystemProps> = ({
  coupons,
  onCreateCoupon,
  onDeleteCoupon,
  onToggleCoupon
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: 10,
    description: '',
    productId: '',
    usageLimit: undefined as number | undefined,
    expiresAt: '',
    isActive: true
  });

  const generateCouponCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewCoupon(prev => ({ ...prev, code: result }));
  };

  const handleCreateCoupon = () => {
    if (!newCoupon.code.trim() || !newCoupon.description.trim()) return;

    onCreateCoupon({
      ...newCoupon,
      usageLimit: newCoupon.usageLimit || undefined,
      expiresAt: newCoupon.expiresAt || undefined
    });

    setNewCoupon({
      code: '',
      type: 'percentage',
      value: 10,
      description: '',
      productId: '',
      usageLimit: undefined,
      expiresAt: '',
      isActive: true
    });
    setShowCreateForm(false);
  };

  const copyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code);
    // You could add a toast notification here
  };

  const getDiscountDisplay = (coupon: Coupon) => {
    return coupon.type === 'percentage' 
      ? `${coupon.value}% OFF`
      : `$${coupon.value} OFF`;
  };

  const getUsageDisplay = (coupon: Coupon) => {
    if (!coupon.usageLimit) return `${coupon.usageCount} uses`;
    return `${coupon.usageCount} / ${coupon.usageLimit} uses`;
  };

  const isExpired = (coupon: Coupon) => {
    return coupon.expiresAt && new Date(coupon.expiresAt) < new Date();
  };

  const activeCoupons = coupons.filter(c => c.isActive && !isExpired(c));
  const totalSavings = coupons.reduce((sum, coupon) => {
    return sum + (coupon.type === 'fixed' ? coupon.value * coupon.usageCount : 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Coupon Management</h2>
          <p className="text-gray-600">Create and manage discount coupons for your products</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Create Coupon</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Coupons</p>
              <p className="text-2xl font-bold text-gray-900">{coupons.length}</p>
            </div>
            <Tag className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Coupons</p>
              <p className="text-2xl font-bold text-gray-900">{activeCoupons.length}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Uses</p>
              <p className="text-2xl font-bold text-gray-900">
                {coupons.reduce((sum, c) => sum + c.usageCount, 0)}
              </p>
            </div>
            <Users className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Savings</p>
              <p className="text-2xl font-bold text-gray-900">${totalSavings.toFixed(2)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Create Coupon Form */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Coupon</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Coupon Code
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="SAVE20"
                />
                <button
                  onClick={generateCouponCode}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Generate
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount Type
              </label>
              <select
                value={newCoupon.type}
                onChange={(e) => setNewCoupon(prev => ({ ...prev, type: e.target.value as 'percentage' | 'fixed' }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount Value
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={newCoupon.value}
                  onChange={(e) => setNewCoupon(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  min="0"
                  step={newCoupon.type === 'percentage' ? '1' : '0.01'}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  {newCoupon.type === 'percentage' ? (
                    <Percent className="h-4 w-4 text-gray-400" />
                  ) : (
                    <DollarSign className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usage Limit (Optional)
              </label>
              <input
                type="number"
                value={newCoupon.usageLimit || ''}
                onChange={(e) => setNewCoupon(prev => ({ 
                  ...prev, 
                  usageLimit: e.target.value ? parseInt(e.target.value) : undefined 
                }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Unlimited"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date (Optional)
              </label>
              <input
                type="datetime-local"
                value={newCoupon.expiresAt}
                onChange={(e) => setNewCoupon(prev => ({ ...prev, expiresAt: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <input
                type="text"
                value={newCoupon.description}
                onChange={(e) => setNewCoupon(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Save 20% on all templates"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 mt-6">
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateCoupon}
              disabled={!newCoupon.code.trim() || !newCoupon.description.trim()}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Coupon
            </button>
          </div>
        </motion.div>
      )}

      {/* Coupons List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">All Coupons</h3>
        </div>

        <div className="divide-y divide-gray-200">
          {coupons.map((coupon, index) => (
            <motion.div
              key={coupon.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isExpired(coupon) 
                      ? 'bg-red-100 text-red-800'
                      : coupon.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {isExpired(coupon) ? 'Expired' : coupon.isActive ? 'Active' : 'Inactive'}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-lg font-semibold text-gray-900">{coupon.code}</h4>
                      <button
                        onClick={() => copyCouponCode(coupon.code)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-gray-600">{coupon.description}</p>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                      <span>{getDiscountDisplay(coupon)}</span>
                      <span>{getUsageDisplay(coupon)}</span>
                      {coupon.expiresAt && (
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>Expires {formatDistanceToNow(new Date(coupon.expiresAt))} from now</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onToggleCoupon(coupon.id)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      coupon.isActive
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {coupon.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => setEditingCoupon(coupon.id)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDeleteCoupon(coupon.id)}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {coupons.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Tag className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No coupons yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first coupon to start offering discounts to your customers.
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Create Your First Coupon
            </button>
          </div>
        )}
      </div>
    </div>
  );
};