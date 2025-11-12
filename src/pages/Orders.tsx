import React, { useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  CircularProgress,
} from '@mui/material';
import toast from 'react-hot-toast';
import { OrderManagement } from '../components/Orders/OrderManagement';
import { useOrderStore } from '../store/orderStore';
import { DashboardContent } from '../layouts/dashboard/main';
import { Order } from '../store/orderStore';

export const Orders: React.FC = () => {
  const { orders, isLoading, fetchOrders, processRefund, resendDownloadLink, generateDownloadLinks } = useOrderStore();

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleRefund = async (orderId: string) => {
    try {
      await processRefund(orderId);
    } catch (error) {
      // Error already handled in store
    }
  };

  const handleResendDownloadLink = async (orderId: string) => {
    try {
      await resendDownloadLink(orderId);
    } catch (error) {
      // Error already handled in store
    }
  };

  const handleDownload = async (orderId: string) => {
    try {
      const downloadLinks = await generateDownloadLinks(orderId);
      if (downloadLinks && downloadLinks.length > 0) {
        // Open first download link in new tab
        window.open(downloadLinks[0], '_blank');
      } else {
        toast.error('No download links available for this order');
      }
    } catch (error) {
      // Error already handled in store
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
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <CircularProgress />
              </Box>
            ) : (
              <OrderManagement
                orders={orders}
                onRefund={handleRefund}
                onResendDownloadLink={handleResendDownloadLink}
                onDownload={handleDownload}
                showBlankTable={true}
              />
            )}
          </CardContent>
        </Card>
      </Stack>
    </DashboardContent>
  );
};
