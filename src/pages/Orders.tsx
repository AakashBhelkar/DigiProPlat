import React, { useEffect, useState } from 'react';
import { OrderManagement } from '../components/Orders/OrderManagement';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

interface Order {
  id: string;
  productTitle: string;
  customerEmail: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  paymentMethod: string;
  createdAt: string;
  downloadCount: number;
  maxDownloads: number;
}

export const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      // Replace with your actual Supabase query and mapping
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        toast.error('Failed to fetch orders');
        setOrders([]);
      } else {
        setOrders((data as Order[]) || []);
      }
      setLoading(false);
    };
    fetchOrders();
  }, []);

  const handleRefund = async () => {
    try {
      // Implement refund logic here
      toast.success('Refund processed successfully');
    } catch {
      toast.error('Failed to process refund');
    }
  };

  const handleResendDownloadLink = async () => {
    try {
      // Implement resend download link logic here
      toast.success('Download link sent to customer');
    } catch {
      toast.error('Failed to send download link');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-white space-y-6">
      {/* Responsive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-50">Order Management</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Track and manage customer orders and downloads</p>
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg bg-white dark:bg-white shadow-sm border border-gray-300 dark:border-gray-700 p-4 sm:p-6">
        {loading ? (
          <div className="p-6 text-center text-gray-600 dark:text-gray-400">Loading orders...</div>
        ) : (
          <OrderManagement
            orders={orders}
            onRefund={handleRefund}
            onResendDownloadLink={handleResendDownloadLink}
            showBlankTable={true}
          />
        )}
      </div>
    </div>
  );
};