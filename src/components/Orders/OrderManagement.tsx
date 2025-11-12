import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  TextField,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  LinearProgress,
  alpha,
  useTheme,
} from '@mui/material';
import { Iconify } from '../iconify';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { OrderDetailsModal } from './OrderDetailsModal';

const MotionCard = motion.create(Card);

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

interface OrderManagementProps {
  orders: Order[];
  onRefund: (orderId: string) => void;
  onResendDownloadLink: (orderId: string) => void;
  onDownload?: (orderId: string) => void;
  showBlankTable?: boolean;
}

export const OrderManagement: React.FC<OrderManagementProps> = ({
  orders,
  onRefund,
  onResendDownloadLink,
  onDownload,
  showBlankTable = false,
}) => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'failed' | 'refunded'>('all');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.productTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, orderId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedOrderId(orderId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedOrderId(null);
  };

  const handleViewDetails = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setSelectedOrder(order);
      setDetailsModalOpen(true);
      handleMenuClose();
    }
  };

  const getTotalRevenue = () => {
    return filteredOrders
      .filter((order) => order.status === 'completed')
      .reduce((sum, order) => sum + order.amount, 0);
  };

  const stats = [
    {
      title: 'Total Orders',
      value: filteredOrders.length.toString(),
      icon: 'solar:eye-bold-duotone',
      color: theme.palette.primary.main,
      lightColor: alpha(theme.palette.primary.main, 0.12),
    },
    {
      title: 'Completed',
      value: filteredOrders.filter((o) => o.status === 'completed').length.toString(),
      icon: 'solar:download-bold-duotone',
      color: theme.palette.success.main,
      lightColor: alpha(theme.palette.success.main, 0.12),
    },
    {
      title: 'Revenue',
      value: `$${getTotalRevenue().toFixed(2)}`,
      icon: 'solar:calendar-bold-duotone',
      color: theme.palette.info.main,
      lightColor: alpha(theme.palette.info.main, 0.12),
    },
    {
      title: 'Refunds',
      value: filteredOrders.filter((o) => o.status === 'refunded').length.toString(),
      icon: 'solar:refresh-bold-duotone',
      color: theme.palette.warning.main,
      lightColor: alpha(theme.palette.warning.main, 0.12),
    },
  ];

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'completed':
        return <Chip label="Completed" color="success" size="small" />;
      case 'pending':
        return <Chip label="Pending" color="warning" size="small" />;
      case 'failed':
        return <Chip label="Failed" color="error" size="small" />;
      case 'refunded':
        return <Chip label="Refunded" color="default" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  return (
    <Stack spacing={4}>
      {/* Header Stats */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
        {stats.map((stat, index) => (
          <MotionCard
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            sx={{
              flex: 1,
              minHeight: 120,
              background: `linear-gradient(135deg, ${stat.color} 0%, ${alpha(stat.color, 0.8)} 100%)`,
              color: 'white',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                    {stat.title}
                  </Typography>
                  <Typography variant="h3" fontWeight={800} sx={{ color: 'white' }}>
                    {stat.value}
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    width: 48,
                    height: 48,
                  }}
                >
                  <Iconify icon={stat.icon} width={24} />
                </Avatar>
              </Stack>
            </CardContent>
          </MotionCard>
        ))}
      </Stack>

      {/* Filters */}
      <Card>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="solar:magnifer-bold-duotone" />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
                <MenuItem value="refunded">Refunded</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              startIcon={<Iconify icon="solar:filter-bold-duotone" />}
              sx={{ px: 3 }}
            >
              More Filters
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Order</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Downloads</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Date</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Stack spacing={2} alignItems="center">
                      <Iconify
                        icon="solar:cart-large-2-bold-duotone"
                        width={64}
                        sx={{ color: 'text.disabled' }}
                      />
                      <Typography variant="h6" color="text.secondary">
                        No orders found
                      </Typography>
                      <Typography variant="body2" color="text.disabled">
                        Try adjusting your search terms or filters.
                      </Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow
                    key={order.id}
                    sx={{
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                      },
                    }}
                  >
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {order.productTitle}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          #{order.id}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {order.customerEmail}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {order.paymentMethod}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        ${order.amount}
                      </Typography>
                    </TableCell>
                    <TableCell>{getStatusChip(order.status)}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {order.downloadCount} / {order.maxDownloads}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={(order.downloadCount / order.maxDownloads) * 100}
                          sx={{ mt: 1, height: 6, borderRadius: 1 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDistanceToNow(new Date(order.createdAt))} ago
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        {order.status === 'completed' && onDownload && (
                          <IconButton
                            size="small"
                            onClick={() => onDownload(order.id)}
                            color="primary"
                            title="Download Files"
                          >
                            <Iconify icon="solar:download-bold-duotone" />
                          </IconButton>
                        )}
                        <IconButton
                          size="small"
                          onClick={() => onResendDownloadLink(order.id)}
                          color="secondary"
                          title="Resend Download Link"
                        >
                          <Iconify icon="solar:letter-bold-duotone" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, order.id)}
                        >
                          <Iconify icon="solar:menu-dots-vertical-bold-duotone" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => selectedOrderId && handleViewDetails(selectedOrderId)}>
          <Iconify icon="solar:eye-bold-duotone" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        {selectedOrderId && (
          <>
            {orders.find((o) => o.id === selectedOrderId)?.status === 'completed' && (
              <MenuItem
                onClick={() => {
                  onRefund(selectedOrderId);
                  handleMenuClose();
                }}
                sx={{ color: 'error.main' }}
              >
                <Iconify icon="solar:refresh-bold-duotone" sx={{ mr: 1 }} />
                Process Refund
              </MenuItem>
            )}
          </>
        )}
      </Menu>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          open={detailsModalOpen}
          onClose={() => {
            setDetailsModalOpen(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
          onDownload={onDownload}
          onResendDownloadLink={onResendDownloadLink}
        />
      )}
    </Stack>
  );
};
