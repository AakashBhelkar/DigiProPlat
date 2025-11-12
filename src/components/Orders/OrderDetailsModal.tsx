import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  Box,
  Divider,
  Chip,
  IconButton,
  Card,
  CardContent,
  Link,
  Alert,
  CircularProgress,
} from '@mui/material';
import { X, Download, ExternalLink, CheckCircle, Clock, XCircle, RefreshCw } from 'lucide-react';
import { Order } from '../../store/orderStore';
import { formatDistanceToNow, format } from 'date-fns';
import toast from 'react-hot-toast';

interface OrderDetailsModalProps {
  open: boolean;
  onClose: () => void;
  order: Order | null;
  onDownload?: (orderId: string) => Promise<void>;
  onResendDownloadLink?: (orderId: string) => Promise<void>;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  open,
  onClose,
  order,
  onDownload,
  onResendDownloadLink,
}) => {
  const [isGeneratingLinks, setIsGeneratingLinks] = useState(false);
  const [downloadLinks, setDownloadLinks] = useState<string[]>(order?.downloadLinks || []);

  useEffect(() => {
    if (order) {
      setDownloadLinks(order.downloadLinks || []);
    }
  }, [order]);

  const handleDownload = async () => {
    if (!order || !onDownload) return;
    
    setIsGeneratingLinks(true);
    try {
      await onDownload(order.id);
      // Refresh download links if needed
      if (order.downloadLinks && order.downloadLinks.length > 0) {
        setDownloadLinks(order.downloadLinks);
      }
    } catch (error) {
      // Error handled in parent
    } finally {
      setIsGeneratingLinks(false);
    }
  };

  const handleResendLink = async () => {
    if (!order || !onResendDownloadLink) return;
    
    try {
      await onResendDownloadLink(order.id);
      toast.success('Download link sent to your email!');
    } catch (error) {
      // Error handled in parent
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      case 'refunded':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} />;
      case 'pending':
        return <Clock size={16} />;
      case 'failed':
        return <XCircle size={16} />;
      case 'refunded':
        return <RefreshCw size={16} />;
      default:
        return null;
    }
  };

  const getOrderTimeline = () => {
    if (!order) return [];

    const timeline = [
      {
        label: 'Order Created',
        date: order.createdAt,
        icon: <Clock size={16} />,
        color: 'primary' as const,
      },
    ];

    if (order.status === 'completed') {
      timeline.push({
        label: 'Payment Completed',
        date: order.updatedAt,
        icon: <CheckCircle size={16} />,
        color: 'success' as const,
      });
    } else if (order.status === 'failed') {
      timeline.push({
        label: 'Payment Failed',
        date: order.updatedAt,
        icon: <XCircle size={16} />,
        color: 'error' as const,
      });
    } else if (order.status === 'refunded') {
      timeline.push({
        label: 'Order Refunded',
        date: order.updatedAt,
        icon: <RefreshCw size={16} />,
        color: 'default' as const,
      });
    }

    return timeline;
  };

  if (!order) return null;

  const isExpired = order.expiresAt && new Date(order.expiresAt) < new Date();
  const canDownload = order.status === 'completed' && !isExpired && order.downloadCount < order.maxDownloads;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Order Details
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Order #{order.id.slice(0, 8).toUpperCase()}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <X size={20} />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* Order Status */}
          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Order Status
                  </Typography>
                  <Chip
                    label={order.status.toUpperCase()}
                    color={getStatusColor(order.status)}
                    icon={getStatusIcon(order.status)}
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h5" fontWeight={700} color="primary.main">
                    ${order.amount.toFixed(2)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {order.paymentMethod}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Product Information */}
          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Product Information
            </Typography>
            <Card variant="outlined">
              <CardContent>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      {order.productTitle}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Product ID: {order.productId.slice(0, 8)}...
                    </Typography>
                  </Box>
                  <Divider />
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Price
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      ${order.amount.toFixed(2)}
                    </Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Box>

          {/* Payment Details */}
          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Payment Details
            </Typography>
            <Card variant="outlined">
              <CardContent>
                <Stack spacing={1.5}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Payment Method
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {order.paymentMethod}
                    </Typography>
                  </Stack>
                  {order.paymentIntentId && (
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Payment Intent ID
                      </Typography>
                      <Typography variant="body2" fontFamily="monospace" fontSize="0.75rem">
                        {order.paymentIntentId.slice(0, 20)}...
                      </Typography>
                    </Stack>
                  )}
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Customer Email
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {order.customerEmail}
                    </Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Box>

          {/* Download Links */}
          <Box>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                Download Links
              </Typography>
              {canDownload && (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Download size={16} />}
                  onClick={handleDownload}
                  disabled={isGeneratingLinks}
                >
                  {isGeneratingLinks ? 'Generating...' : 'Generate Links'}
                </Button>
              )}
            </Stack>
            
            {isExpired && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Download links have expired. Please contact support for assistance.
              </Alert>
            )}

            {!canDownload && order.status === 'completed' && !isExpired && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Download limit reached ({order.downloadCount}/{order.maxDownloads})
              </Alert>
            )}

            {downloadLinks.length > 0 ? (
              <Card variant="outlined">
                <CardContent>
                  <Stack spacing={1}>
                    {downloadLinks.map((link, index) => (
                      <Stack
                        key={index}
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{
                          p: 1.5,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                        }}
                      >
                        <Typography variant="body2" fontFamily="monospace" sx={{ flex: 1, mr: 2, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {link}
                        </Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<ExternalLink size={14} />}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Open
                        </Button>
                      </Stack>
                    ))}
                  </Stack>
                  <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Downloads: {order.downloadCount}/{order.maxDownloads}
                    </Typography>
                    {order.expiresAt && (
                      <>
                        <Typography variant="caption" color="text.secondary">•</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Expires: {format(new Date(order.expiresAt), 'MMM dd, yyyy')}
                        </Typography>
                      </>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            ) : (
              <Card variant="outlined">
                <CardContent>
                  <Stack spacing={2} alignItems="center" sx={{ py: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      No download links available
                    </Typography>
                    {order.status === 'completed' && (
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<Download size={16} />}
                        onClick={handleDownload}
                        disabled={isGeneratingLinks}
                      >
                        {isGeneratingLinks ? 'Generating...' : 'Generate Download Links'}
                      </Button>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            )}

            {order.status === 'completed' && (
              <Button
                size="small"
                variant="text"
                onClick={handleResendLink}
                sx={{ mt: 1 }}
              >
                Resend download link to email
              </Button>
            )}
          </Box>

          {/* Order Timeline */}
          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Order Timeline
            </Typography>
            <Card variant="outlined">
              <CardContent>
                <Stack spacing={2}>
                  {getOrderTimeline().map((item, index) => (
                    <Stack key={index} direction="row" spacing={2} alignItems="flex-start">
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: `${item.color}.main`,
                          color: 'white',
                          flexShrink: 0,
                        }}
                      >
                        {item.icon}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight={600}>
                          {item.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {format(new Date(item.date), 'MMM dd, yyyy HH:mm')} ({formatDistanceToNow(new Date(item.date))} ago)
                        </Typography>
                        {index < getOrderTimeline().length - 1 && (
                          <Box
                            sx={{
                              width: 2,
                              height: 24,
                              bgcolor: 'divider',
                              ml: 1.5,
                              mt: 1,
                            }}
                          />
                        )}
                      </Box>
                    </Stack>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Box>

          {/* Order Dates */}
          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Order Information
            </Typography>
            <Card variant="outlined">
              <CardContent>
                <Stack spacing={1.5}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Order Date
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {format(new Date(order.createdAt), 'MMM dd, yyyy HH:mm')}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Last Updated
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {format(new Date(order.updatedAt), 'MMM dd, yyyy HH:mm')}
                    </Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

