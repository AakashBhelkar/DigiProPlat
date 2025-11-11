import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  CircularProgress,
} from '@mui/material';
import { OrderManagement } from '../components/Orders/OrderManagement';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { DashboardContent } from '../layouts/dashboard/main';

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
    <DashboardContent>
      <Stack spacing={4}>
        {/* Header */}
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Order Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track and manage customer orders and downloads
          </Typography>
        </Box>

        {/* Orders Table */}
        <Card>
          <CardContent>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <CircularProgress />
              </Box>
            ) : (
              <OrderManagement
                orders={orders}
                onRefund={handleRefund}
                onResendDownloadLink={handleResendDownloadLink}
                showBlankTable={true}
              />
            )}
          </CardContent>
        </Card>
      </Stack>
    </DashboardContent>
  );
};
