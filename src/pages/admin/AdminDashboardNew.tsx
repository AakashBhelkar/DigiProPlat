import { useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Stack,
  Chip,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Skeleton,
  alpha,
  useTheme,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import { DashboardContent } from '../../layouts/dashboard/main';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  DollarSign,
  AlertTriangle,
  Activity,
  MoreVertical,
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useAdminStore } from '../../store/adminStore';

// ----------------------------------------------------------------------

const MotionCard = motion.create(Card);
const MotionBox = motion.create(Box);

// ----------------------------------------------------------------------

export const AdminDashboardNew = () => {
  const theme = useTheme();
  const { analytics, fetchAnalytics, isLoading } = useAdminStore();

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = [
    {
      title: 'Total Users',
      value: analytics?.totalUsers || 0,
      change: `+${analytics?.newUsers || 0} this month`,
      trend: 'up',
      percentage: '+12.5%',
      icon: Users,
      color: theme.palette.primary.main,
      lightColor: alpha(theme.palette.primary.main, 0.12),
    },
    {
      title: 'Active Products',
      value: analytics?.totalProducts || 0,
      change: `+${analytics?.newProducts || 0} new`,
      trend: 'up',
      percentage: '+8.2%',
      icon: Package,
      color: theme.palette.success.main,
      lightColor: alpha(theme.palette.success.main, 0.12),
    },
    {
      title: 'Total Revenue',
      value: `$${(analytics?.totalRevenue || 0).toLocaleString()}`,
      change: `${analytics?.totalSales || 0} sales`,
      trend: 'up',
      percentage: '+23.1%',
      icon: DollarSign,
      color: theme.palette.info.main,
      lightColor: alpha(theme.palette.info.main, 0.12),
    },
    {
      title: 'Pending Reports',
      value: analytics?.pendingReports || 0,
      change: 'Requires attention',
      trend: 'down',
      percentage: '-4.3%',
      icon: AlertTriangle,
      color: theme.palette.error.main,
      lightColor: alpha(theme.palette.error.main, 0.12),
    },
  ];

  // Mock data for charts
  const revenueData = [
    { date: 'Jan', revenue: 12000, users: 450, orders: 120 },
    { date: 'Feb', revenue: 19000, users: 680, orders: 180 },
    { date: 'Mar', revenue: 15000, users: 590, orders: 150 },
    { date: 'Apr', revenue: 25000, users: 820, orders: 240 },
    { date: 'May', revenue: 22000, users: 750, orders: 210 },
    { date: 'Jun', revenue: 31000, users: 1020, orders: 320 },
  ];

  const categoryData = [
    { name: 'Templates', value: 35, color: theme.palette.primary.main },
    { name: 'Graphics', value: 25, color: theme.palette.success.main },
    { name: 'Software', value: 20, color: theme.palette.warning.main },
    { name: 'E-books', value: 15, color: theme.palette.info.main },
    { name: 'Other', value: 5, color: theme.palette.grey[400] },
  ];

  const topProducts = [
    { name: 'Professional UI Kit', sales: 1234, revenue: 45678, trend: 12 },
    { name: 'Dashboard Template', sales: 987, revenue: 38765, trend: 8 },
    { name: 'Icon Pack Bundle', sales: 756, revenue: 22345, trend: -3 },
    { name: 'Landing Page Kit', sales: 645, revenue: 19876, trend: 15 },
  ];

  const recentActivities = [
    { type: 'user_registered', user: 'Sarah Johnson', time: '2 min ago', icon: Users, color: theme.palette.primary.main },
    { type: 'payment_processed', user: 'Transaction #4521', time: '5 min ago', icon: DollarSign, color: theme.palette.success.main },
    { type: 'product_uploaded', user: 'New Dashboard Kit', time: '12 min ago', icon: Package, color: theme.palette.info.main },
    { type: 'report_submitted', user: 'Content Report #234', time: '23 min ago', icon: AlertTriangle, color: theme.palette.error.main },
    { type: 'user_registered', user: 'Michael Chen', time: '34 min ago', icon: Users, color: theme.palette.primary.main },
  ];

  if (isLoading) {
    return (
      <DashboardContent>
        <Box sx={{ py: 4 }}>
          <Grid container spacing={3}>
            {[1, 2, 3, 4].map((i) => (
              <Grid item xs={12} sm={6} lg={3} key={i}>
                <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
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
                Welcome back, Admin! 👋
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ fontSize: { xs: '1rem', md: '1.125rem' } }}>
                Here's what's happening with your platform today
              </Typography>
            </Box>
            <Stack direction="row" spacing={2}>
              <Chip
                icon={<Activity size={18} />}
                label="All Systems Operational"
                color="success"
                variant="outlined"
                sx={{ py: 2.5, px: 1, fontSize: '0.875rem', fontWeight: 600 }}
              />
            </Stack>
          </Stack>
        </MotionBox>

        {/* Stats Cards */}
        <Grid container spacing={4} sx={{ mb: 5 }}>
          {stats.map((stat, index) => (
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
                      label={stat.percentage}
                      size="medium"
                      color={stat.trend === 'up' ? 'success' : 'error'}
                      sx={{ fontWeight: 700, fontSize: '0.875rem', px: 1, color: 'primary.main' }}
                    />
                  </Stack>

                  <Typography variant="h3" fontWeight={800} gutterBottom sx={{ fontSize: '2rem', mb: 1.5 }}>
                    {stat.value}
                  </Typography>

                  <Typography variant="body1" color="text.secondary" fontWeight={600} gutterBottom sx={{ mb: 2 }}>
                    {stat.title}
                  </Typography>

                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      {stat.change}
                    </Typography>
                  </Stack>
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
                      Revenue Overview
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Last 6 months performance
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={2}>
                    <Chip label="Revenue" size="medium" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.12), color: theme.palette.primary.main, fontWeight: 600, px: 2, py: 2.5 }} />
                    <Chip label="Users" size="medium" sx={{ bgcolor: alpha(theme.palette.success.main, 0.12), color: theme.palette.success.main, fontWeight: 600, px: 2, py: 2.5 }} />
                  </Stack>
                </Stack>

                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={theme.palette.success.main} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis dataKey="date" stroke={theme.palette.text.secondary} />
                    <YAxis yAxisId="left" stroke={theme.palette.text.secondary} />
                    <YAxis yAxisId="right" orientation="right" stroke={theme.palette.text.secondary} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 8,
                      }}
                    />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="revenue"
                      stroke={theme.palette.primary.main}
                      strokeWidth={3}
                      fill="url(#colorRevenue)"
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="users"
                      stroke={theme.palette.success.main}
                      strokeWidth={3}
                      fill="url(#colorUsers)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </MotionCard>
          </Grid>

          {/* Category Distribution */}
          <Grid item xs={12} lg={4}>
            <MotionCard
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              sx={{ height: '100%' }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  Product Categories
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  Distribution by type
                </Typography>

                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                <Stack spacing={2} sx={{ mt: 3 }}>
                  {categoryData.map((item) => (
                    <Stack key={item.name} direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 0.5 }}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Box
                          sx={{
                            width: 14,
                            height: 14,
                            borderRadius: '50%',
                            bgcolor: item.color,
                          }}
                        />
                        <Typography variant="body1" fontWeight={500}>{item.name}</Typography>
                      </Stack>
                      <Typography variant="body1" fontWeight={700}>
                        {item.value}%
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </CardContent>
            </MotionCard>
          </Grid>

          {/* Top Products */}
          <Grid item xs={12} md={6}>
            <MotionCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <CardContent sx={{ p: 4 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 4 }}>
                  <Typography variant="h5" fontWeight={700}>
                    Top Products
                  </Typography>
                  <IconButton size="medium">
                    <MoreVertical size={24} />
                  </IconButton>
                </Stack>

                <Stack spacing={2.5}>
                  {topProducts.map((product) => (
                    <Paper
                      key={product.name}
                      sx={{
                        p: 3,
                        border: `2px solid ${theme.palette.divider}`,
                        borderRadius: 2,
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.04),
                          borderColor: theme.palette.primary.main,
                          transform: 'translateX(4px)',
                          transition: 'all 0.3s ease',
                        },
                      }}
                    >
                      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                        <Typography variant="subtitle1" fontWeight={700}>
                          {product.name}
                        </Typography>
                        <Chip
                          icon={product.trend > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                          label={`${Math.abs(product.trend)}%`}
                          size="medium"
                          color={product.trend > 0 ? 'success' : 'error'}
                          sx={{ height: 28, '& .MuiChip-label': { px: 1.5, fontSize: '0.8rem', fontWeight: 700 } }}
                        />
                      </Stack>
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                          {product.sales} sales
                        </Typography>
                        <Typography variant="h6" fontWeight={700} color="primary.main">
                          ${product.revenue.toLocaleString()}
                        </Typography>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </CardContent>
            </MotionCard>
          </Grid>

          {/* Recent Activities */}
          <Grid item xs={12} md={6}>
            <MotionCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <CardContent sx={{ p: 4 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 4 }}>
                  <Typography variant="h5" fontWeight={700}>
                    Recent Activity
                  </Typography>
                  <Chip label="Live" color="success" size="medium" sx={{ fontWeight: 700, px: 2, py: 2.5 }} />
                </Stack>

                <List sx={{ py: 0 }}>
                  {recentActivities.map((activity, index) => (
                    <ListItem
                      key={index}
                      sx={{
                        px: 2,
                        py: 2,
                        mb: 1,
                        borderRadius: 2,
                        '&:hover': {
                          bgcolor: alpha(activity.color, 0.06),
                        },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: alpha(activity.color, 0.12), color: activity.color, width: 48, height: 48 }}>
                          <activity.icon size={24} />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body1" fontWeight={700}>
                            {activity.user}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {activity.time}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </MotionCard>
          </Grid>
        </Grid>
      </Box>
    </DashboardContent>
  );
};
