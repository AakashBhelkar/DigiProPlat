import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Stack,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  alpha,
  useTheme,
  Skeleton,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import { DashboardContent } from '../layouts/dashboard/main';
import {
  DollarSign,
  Package,
  Eye,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Plus,
  FileText,
  Download,
  MoreVertical,
  ArrowUpRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useProductStore } from '../store/productStore';
import { supabase } from '../lib/supabase';

// ----------------------------------------------------------------------

const MotionCard = motion.create(Card);
const MotionBox = motion.create(Box);

// ----------------------------------------------------------------------

export function DashboardNew() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { products, fetchProducts } = useProductStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalProducts: 0,
    totalViews: 0,
    totalSales: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchProducts();

      // Fetch transactions for sales count and revenue
      const { data: salesData } = await supabase
        .from('transactions')
        .select('*')
        .eq('type', 'sale')
        .eq('status', 'completed');

      // Calculate total revenue from transactions
      const totalRevenue = salesData?.reduce((sum, transaction) => sum + (transaction.amount || 0), 0) || 0;

      setStats({
        totalRevenue,
        totalProducts: products.length,
        totalViews: products.reduce((sum, p) => sum + (p.views || 0), 0),
        totalSales: salesData?.length || 0,
      });

      setLoading(false);
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statCards = [
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: theme.palette.success.main,
      lightColor: alpha(theme.palette.success.main, 0.12),
    },
    {
      title: 'Products',
      value: stats.totalProducts.toString(),
      change: '+3 this month',
      trend: 'up',
      icon: Package,
      color: theme.palette.primary.main,
      lightColor: alpha(theme.palette.primary.main, 0.12),
    },
    {
      title: 'Total Views',
      value: stats.totalViews.toLocaleString(),
      change: '+23.1%',
      trend: 'up',
      icon: Eye,
      color: theme.palette.info.main,
      lightColor: alpha(theme.palette.info.main, 0.12),
    },
    {
      title: 'Sales',
      value: stats.totalSales.toString(),
      change: '+8.2%',
      trend: 'up',
      icon: ShoppingCart,
      color: theme.palette.warning.main,
      lightColor: alpha(theme.palette.warning.main, 0.12),
    },
  ];

  // Mock data for charts
  const revenueData = [
    { month: 'Jan', revenue: 4000, sales: 24 },
    { month: 'Feb', revenue: 6000, sales: 36 },
    { month: 'Mar', revenue: 5500, sales: 30 },
    { month: 'Apr', revenue: 8000, sales: 42 },
    { month: 'May', revenue: 7200, sales: 38 },
    { month: 'Jun', revenue: 9500, sales: 48 },
  ];

  const topProducts = products.slice(0, 5).map(p => ({
    name: p.title,
    sales: p.sales_count || 0,
    revenue: p.total_revenue || 0,
  }));

  if (loading) {
    return (
      <DashboardContent>
        <Box sx={{ py: 5 }}>
          <Grid container spacing={4}>
            {[1, 2, 3, 4].map((i) => (
              <Grid item xs={12} sm={6} lg={3} key={i}>
                <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 2 }} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <Box sx={{ py: 5 }}>
        {/* Header */}
        <MotionBox
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          sx={{ mb: 5 }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Box>
              <Typography variant="h3" fontWeight={700} gutterBottom sx={{ fontSize: { xs: '1.75rem', md: '2.5rem' } }}>
                Welcome back, {user?.firstName || user?.email || 'User'}! 👋
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ fontSize: { xs: '1rem', md: '1.125rem' } }}>
                Here's your business overview and performance metrics
              </Typography>
            </Box>
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                size="large"
                startIcon={<Plus size={20} />}
                onClick={() => navigate('/products/upload')}
                sx={{
                  px: 3,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
                }}
              >
                Create Product
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<FileText size={20} />}
                onClick={() => navigate('/pages/builder/new')}
                sx={{
                  px: 3,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  borderWidth: 2,
                  '&:hover': { borderWidth: 2 },
                }}
              >
                New Page
              </Button>
            </Stack>
          </Stack>
        </MotionBox>

        {/* Stats Cards */}
        <Grid container spacing={4} sx={{ mb: 5 }}>
          {statCards.map((stat, index) => (
            <Grid item xs={12} sm={6} lg={3} key={stat.title}>
              <MotionCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                sx={{
                  height: '100%',
                  minHeight: 180,
                  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(stat.color, 0.02)} 100%)`,
                  border: `1px solid ${alpha(stat.color, 0.08)}`,
                  '&:hover': {
                    boxShadow: `0 12px 32px ${alpha(stat.color, 0.16)}`,
                    transform: 'translateY(-6px)',
                    transition: 'all 0.3s ease',
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                    <Avatar
                      sx={{
                        bgcolor: stat.lightColor,
                        color: stat.color,
                        width: 64,
                        height: 64,
                      }}
                    >
                      <stat.icon size={32} />
                    </Avatar>
                    <Chip
                      icon={stat.trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                      label={stat.change}
                      size="medium"
                      color={stat.trend === 'up' ? 'success' : 'error'}
                      sx={{ fontWeight: 700, fontSize: '0.875rem', px: 1 }}
                    />
                  </Stack>

                  <Typography variant="h3" fontWeight={800} gutterBottom sx={{ fontSize: '2rem', mb: 1.5 }}>
                    {stat.value}
                  </Typography>

                  <Typography variant="body1" color="text.secondary" fontWeight={600}>
                    {stat.title}
                  </Typography>
                </CardContent>
              </MotionCard>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={4}>
          {/* Revenue Chart */}
          <Grid item xs={12} lg={8}>
            <MotionCard
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <CardContent sx={{ p: 4 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 4 }}>
                  <Box>
                    <Typography variant="h5" fontWeight={700} gutterBottom>
                      Revenue & Sales Trends
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Last 6 months performance
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={2}>
                    <Chip
                      label="Revenue"
                      size="medium"
                      sx={{
                        bgcolor: alpha(theme.palette.success.main, 0.12),
                        color: theme.palette.success.main,
                        fontWeight: 600,
                        px: 2,
                        py: 2.5,
                      }}
                    />
                    <Chip
                      label="Sales"
                      size="medium"
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.12),
                        color: theme.palette.primary.main,
                        fontWeight: 600,
                        px: 2,
                        py: 2.5,
                      }}
                    />
                  </Stack>
                </Stack>

                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={theme.palette.success.main} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis dataKey="month" stroke={theme.palette.text.secondary} />
                    <YAxis stroke={theme.palette.text.secondary} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 8,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke={theme.palette.success.main}
                      strokeWidth={3}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </MotionCard>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12} lg={4}>
            <MotionCard
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              sx={{ height: '100%' }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 4 }}>
                  Quick Actions
                </Typography>

                <Stack spacing={2.5}>
                  <Paper
                    sx={{
                      p: 3,
                      border: `2px solid ${theme.palette.divider}`,
                      borderRadius: 2,
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                        borderColor: theme.palette.primary.main,
                        transform: 'translateX(4px)',
                        transition: 'all 0.3s ease',
                      },
                    }}
                    onClick={() => navigate('/products/upload')}
                  >
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.12), color: theme.palette.primary.main }}>
                        <Plus size={24} />
                      </Avatar>
                      <Box flex={1}>
                        <Typography variant="subtitle1" fontWeight={700}>
                          Upload New Product
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Add digital products to sell
                        </Typography>
                      </Box>
                      <ArrowUpRight size={20} color={theme.palette.text.secondary} />
                    </Stack>
                  </Paper>

                  <Paper
                    sx={{
                      p: 3,
                      border: `2px solid ${theme.palette.divider}`,
                      borderRadius: 2,
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.success.main, 0.04),
                        borderColor: theme.palette.success.main,
                        transform: 'translateX(4px)',
                        transition: 'all 0.3s ease',
                      },
                    }}
                    onClick={() => navigate('/pages/builder/new')}
                  >
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.12), color: theme.palette.success.main }}>
                        <FileText size={24} />
                      </Avatar>
                      <Box flex={1}>
                        <Typography variant="subtitle1" fontWeight={700}>
                          Create Landing Page
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Build with drag & drop
                        </Typography>
                      </Box>
                      <ArrowUpRight size={20} color={theme.palette.text.secondary} />
                    </Stack>
                  </Paper>

                  <Paper
                    sx={{
                      p: 3,
                      border: `2px solid ${theme.palette.divider}`,
                      borderRadius: 2,
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.info.main, 0.04),
                        borderColor: theme.palette.info.main,
                        transform: 'translateX(4px)',
                        transition: 'all 0.3s ease',
                      },
                    }}
                    onClick={() => navigate('/analytics')}
                  >
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.12), color: theme.palette.info.main }}>
                        <TrendingUp size={24} />
                      </Avatar>
                      <Box flex={1}>
                        <Typography variant="subtitle1" fontWeight={700}>
                          View Analytics
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Track your performance
                        </Typography>
                      </Box>
                      <ArrowUpRight size={20} color={theme.palette.text.secondary} />
                    </Stack>
                  </Paper>

                  <Paper
                    sx={{
                      p: 3,
                      border: `2px solid ${theme.palette.divider}`,
                      borderRadius: 2,
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.warning.main, 0.04),
                        borderColor: theme.palette.warning.main,
                        transform: 'translateX(4px)',
                        transition: 'all 0.3s ease',
                      },
                    }}
                    onClick={() => navigate('/wallet')}
                  >
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.12), color: theme.palette.warning.main }}>
                        <DollarSign size={24} />
                      </Avatar>
                      <Box flex={1}>
                        <Typography variant="subtitle1" fontWeight={700}>
                          Manage Wallet
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Withdraw earnings
                        </Typography>
                      </Box>
                      <ArrowUpRight size={20} color={theme.palette.text.secondary} />
                    </Stack>
                  </Paper>
                </Stack>
              </CardContent>
            </MotionCard>
          </Grid>

          {/* Top Products */}
          <Grid item xs={12}>
            <MotionCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <CardContent sx={{ p: 4 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 4 }}>
                  <Typography variant="h5" fontWeight={700}>
                    Top Performing Products
                  </Typography>
                  <Button variant="text" endIcon={<ArrowUpRight size={18} />} onClick={() => navigate('/products')}>
                    View All
                  </Button>
                </Stack>

                {topProducts.length > 0 ? (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem' }}>Product</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.875rem' }}>Sales</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.875rem' }}>Revenue</TableCell>
                          <TableCell align="right"></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {topProducts.map((product, index) => (
                          <TableRow
                            key={index}
                            sx={{
                              '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) },
                            }}
                          >
                            <TableCell>
                              <Typography variant="body1" fontWeight={600}>
                                {product.name}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body1" fontWeight={600}>
                                {product.sales}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="h6" fontWeight={700} color="success.main">
                                ${product.revenue.toLocaleString()}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <IconButton size="small">
                                <MoreVertical size={20} />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Package size={64} color={theme.palette.text.disabled} />
                    <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
                      No products yet
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<Plus size={20} />}
                      sx={{ mt: 3 }}
                      onClick={() => navigate('/products/upload')}
                    >
                      Create Your First Product
                    </Button>
                  </Box>
                )}
              </CardContent>
            </MotionCard>
          </Grid>
        </Grid>
      </Box>
    </DashboardContent>
  );
}
