import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  TextField,
  Button,
  Avatar,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
  alpha,
  useTheme,
  Skeleton,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { Iconify } from '../../components/iconify';
import { useAdminStore } from '../../store/adminStore';
import { formatDistanceToNow } from 'date-fns';
import { DashboardContent } from '../../layouts/dashboard/main';
import { motion } from 'framer-motion';

const MotionCard = motion.create(Card);

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
  const theme = useTheme();
  const { isLoading } = useAdminStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'under_review'>('all');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

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
      status: 'active',
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
      status: 'active',
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
      status: 'under_review',
    },
  ]);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.authorEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, productId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedProductId(productId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProductId(null);
  };

  const handleProductAction = (productId: string, action: string) => {
    console.log(`${action} product ${productId}`);
    handleMenuClose();
  };

  const stats = [
    {
      title: 'Total Products',
      value: products.length.toString(),
      change: '+12 this week',
      icon: 'solar:box-bold-duotone',
      color: theme.palette.primary.main,
      lightColor: alpha(theme.palette.primary.main, 0.12),
    },
    {
      title: 'Active Products',
      value: products.filter((p) => p.status === 'active').length.toString(),
      change: '+8 this week',
      icon: 'solar:check-circle-bold-duotone',
      color: theme.palette.success.main,
      lightColor: alpha(theme.palette.success.main, 0.12),
    },
    {
      title: 'Under Review',
      value: products.filter((p) => p.status === 'under_review').length.toString(),
      change: '+3 pending',
      icon: 'solar:eye-bold-duotone',
      color: theme.palette.warning.main,
      lightColor: alpha(theme.palette.warning.main, 0.12),
    },
    {
      title: 'Total Revenue',
      value: `$${products.reduce((sum, p) => sum + p.totalRevenue, 0).toFixed(2)}`,
      change: '+15.3% this month',
      icon: 'solar:dollar-bold-duotone',
      color: theme.palette.info.main,
      lightColor: alpha(theme.palette.info.main, 0.12),
    },
  ];

  if (isLoading) {
    return (
      <DashboardContent>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <Stack spacing={4}>
        {/* Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Product Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Monitor and manage all products on the platform
            </Typography>
          </Box>
        </Stack>

        {/* Stats Grid */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
          {stats.map((stat, index) => (
            <MotionCard
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              sx={{
                flex: 1,
                minHeight: 140,
                background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(stat.color, 0.02)} 100%)`,
                border: `1px solid ${alpha(stat.color, 0.08)}`,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: stat.lightColor,
                      color: stat.color,
                      width: 56,
                      height: 56,
                    }}
                  >
                    <Iconify icon={stat.icon} width={28} />
                  </Avatar>
                </Stack>
                <Typography variant="h3" fontWeight={800} gutterBottom sx={{ fontSize: '1.75rem', mb: 1 }}>
                  {stat.value}
                </Typography>
                <Typography variant="body1" color="text.secondary" fontWeight={600} gutterBottom>
                  {stat.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  {stat.change}
                </Typography>
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
                placeholder="Search products, authors..."
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
                <InputLabel>Category</InputLabel>
                <Select
                  value={categoryFilter}
                  label="Category"
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  <MenuItem value="templates">Templates</MenuItem>
                  <MenuItem value="ebooks">E-books</MenuItem>
                  <MenuItem value="graphics">Graphics</MenuItem>
                  <MenuItem value="software">Software</MenuItem>
                  <MenuItem value="audio">Audio</MenuItem>
                  <MenuItem value="video">Video</MenuItem>
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="suspended">Suspended</MenuItem>
                  <MenuItem value="under_review">Under Review</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Product</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Author</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Price</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Sales</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Revenue</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow
                    key={product.id}
                    sx={{
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                      },
                    }}
                  >
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {product.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {product.description}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                          Created {formatDistanceToNow(new Date(product.createdAt))} ago
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {product.authorName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {product.authorEmail}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={product.category}
                        size="small"
                        color="info"
                        variant="outlined"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        ${product.price}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {product.salesCount}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        ${product.totalRevenue.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={product.status.replace('_', ' ')}
                        size="small"
                        color={
                          product.status === 'active'
                            ? 'success'
                            : product.status === 'under_review'
                            ? 'warning'
                            : 'error'
                        }
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, product.id)}
                        size="small"
                      >
                        <Iconify icon="solar:menu-dots-vertical-bold-duotone" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {filteredProducts.length === 0 && (
          <Card>
            <CardContent>
              <Stack spacing={2} alignItems="center" sx={{ py: 8 }}>
                <Iconify
                  icon="solar:box-bold-duotone"
                  width={64}
                  sx={{ color: 'text.disabled' }}
                />
                <Typography variant="h6" color="text.secondary">
                  No products found
                </Typography>
                <Typography variant="body2" color="text.disabled">
                  Try adjusting your search terms or filters.
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        )}

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
          <MenuItem onClick={() => handleProductAction(selectedProductId || '', 'view')}>
            <Iconify icon="solar:eye-bold-duotone" sx={{ mr: 1 }} />
            View Details
          </MenuItem>
          <MenuItem onClick={() => handleProductAction(selectedProductId || '', 'edit')}>
            <Iconify icon="solar:pen-bold-duotone" sx={{ mr: 1 }} />
            Edit Product
          </MenuItem>
          {selectedProductId && (
            <>
              {products.find((p) => p.id === selectedProductId)?.status === 'active' ? (
                <MenuItem
                  onClick={() => handleProductAction(selectedProductId, 'suspend')}
                  sx={{ color: 'error.main' }}
                >
                  <Iconify icon="solar:forbidden-circle-bold-duotone" sx={{ mr: 1 }} />
                  Suspend
                </MenuItem>
              ) : (
                <MenuItem
                  onClick={() => handleProductAction(selectedProductId, 'activate')}
                  sx={{ color: 'success.main' }}
                >
                  <Iconify icon="solar:check-circle-bold-duotone" sx={{ mr: 1 }} />
                  Activate
                </MenuItem>
              )}
            </>
          )}
          <MenuItem
            onClick={() => handleProductAction(selectedProductId || '', 'delete')}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="solar:trash-bin-trash-bold-duotone" sx={{ mr: 1 }} />
            Delete
          </MenuItem>
        </Menu>
      </Stack>
    </DashboardContent>
  );
};
