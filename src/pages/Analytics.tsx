import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Avatar,
  alpha,
  useTheme,
  CircularProgress,
  Alert,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Iconify } from '../components/iconify';
import { supabase } from '../lib/supabase';
import { DashboardContent } from '../layouts/dashboard/main';

// ----------------------------------------------------------------------

type RevenueDatum = { date: string; revenue: number; orders: number };
type TrafficDatum = { date: string; views: number; visitors: number };
type CategoryDatum = { name: string; value: number; color: string };
type TopProduct = { name: string; revenue: number; sales: number };

export const Analytics: React.FC = () => {
  const theme = useTheme();
  const [timeRange, setTimeRange] = useState('7d');
  const [revenueData, setRevenueData] = useState<RevenueDatum[]>([]);
  const [trafficData, setTrafficData] = useState<TrafficDatum[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryDatum[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [stats, setStats] = useState([
    { title: 'Total Revenue', value: '-', icon: 'solar:dollar-bold-duotone', color: 'success.main' },
    { title: 'Total Orders', value: '-', icon: 'solar:cart-large-2-bold-duotone', color: 'primary.main' },
    { title: 'Total Views', value: '-', icon: 'solar:eye-bold-duotone', color: 'info.main' },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        // Fetch revenue
        const { data: revenue } = await supabase.from('revenue').select('*');
        setRevenueData((revenue as RevenueDatum[]) || []);

        // Fetch traffic
        const { data: traffic } = await supabase.from('traffic').select('*');
        setTrafficData((traffic as TrafficDatum[]) || []);

        // Fetch categories
        const { data: categories } = await supabase.from('categories').select('*');
        setCategoryData((categories as CategoryDatum[]) || []);

        // Fetch top products
        const { data: top } = await supabase.from('products').select('name, total_revenue:revenue, sales_count:sales');
        setTopProducts((top as TopProduct[]) || []);

        // Update stats
        if (revenue && Array.isArray(revenue)) {
          const totalRevenue = revenue.reduce((acc, cur) => acc + (cur.revenue || 0), 0);
          const totalOrders = revenue.reduce((acc, cur) => acc + (cur.orders || 0), 0);
          setStats([
            {
              title: 'Total Revenue',
              value: `$${totalRevenue.toLocaleString()}`,
              icon: 'solar:dollar-bold-duotone',
              color: 'success.main',
            },
            {
              title: 'Total Orders',
              value: `${totalOrders}`,
              icon: 'solar:cart-large-2-bold-duotone',
              color: 'primary.main',
            },
            {
              title: 'Total Views',
              value: traffic && Array.isArray(traffic) ? `${traffic.reduce((acc, cur) => acc + (cur.views || 0), 0)}` : '-',
              icon: 'solar:eye-bold-duotone',
              color: 'info.main',
            },
          ]);
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [timeRange]);

  if (loading) {
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
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Analytics
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Track your performance and optimize your sales
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Time Range</InputLabel>
              <Select value={timeRange} label="Time Range" onChange={(e) => setTimeRange(e.target.value)}>
                <MenuItem value="7d">Last 7 days</MenuItem>
                <MenuItem value="30d">Last 30 days</MenuItem>
                <MenuItem value="90d">Last 90 days</MenuItem>
                <MenuItem value="1y">Last year</MenuItem>
              </Select>
            </FormControl>
            <Button variant="outlined" startIcon={<Iconify icon="solar:download-bold-duotone" />}>
              Export
            </Button>
          </Stack>
        </Stack>

        {/* Stats Grid */}
        <Grid container spacing={3}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} lg={4} key={index}>
              <Card
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  color: 'white',
                }}
              >
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                    <Iconify icon={stat.icon} width={32} sx={{ color: 'white' }} />
                    <Typography variant="subtitle2" fontWeight={600} sx={{ color: 'rgba(255,255,255,0.9)' }}>
                      {stat.title}
                    </Typography>
                  </Stack>
                  <Typography variant="h4" fontWeight={800} sx={{ color: 'white' }}>
                    {stat.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          {/* Revenue Chart */}
          <Grid item xs={12} lg={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Revenue Overview
                </Typography>
                {revenueData.length === 0 ? (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    No revenue data available.
                  </Alert>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={revenueData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                      <XAxis dataKey="date" stroke={theme.palette.text.secondary} />
                      <YAxis stroke={theme.palette.text.secondary} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: theme.palette.background.paper,
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 8,
                        }}
                        formatter={(value) => [`$${value}`, 'Revenue']}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke={theme.palette.primary.main}
                        strokeWidth={2}
                        fill="url(#colorRevenue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Traffic Chart */}
          <Grid item xs={12} lg={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Traffic Overview
                </Typography>
                {trafficData.length === 0 ? (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    No traffic data available.
                  </Alert>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trafficData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                      <XAxis dataKey="date" stroke={theme.palette.text.secondary} />
                      <YAxis stroke={theme.palette.text.secondary} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: theme.palette.background.paper,
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 8,
                        }}
                      />
                      <Line type="monotone" dataKey="views" stroke={theme.palette.info.main} strokeWidth={2} />
                      <Line type="monotone" dataKey="visitors" stroke={theme.palette.success.main} strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Category Distribution */}
          <Grid item xs={12} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Sales by Category
                </Typography>
                {categoryData.length === 0 ? (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    No category data available.
                  </Alert>
                ) : (
                  <>
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
                    <Stack spacing={1} sx={{ mt: 2 }}>
                      {categoryData.map((item, index) => (
                        <Stack key={index} direction="row" alignItems="center" justifyContent="space-between">
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                bgcolor: item.color,
                              }}
                            />
                            <Typography variant="body2">{item.name}</Typography>
                          </Stack>
                          <Typography variant="body2" fontWeight={700}>
                            {item.value}%
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Top Products */}
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Top Performing Products
                </Typography>
                {topProducts.length === 0 ? (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    No top products data available.
                  </Alert>
                ) : (
                  <Stack spacing={2} sx={{ mt: 2 }}>
                    {topProducts.map((product, index) => (
                      <Card key={index} variant="outlined">
                        <CardContent>
                          <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle2" fontWeight={600}>
                                {product.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {product.sales} sales
                              </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                              <Typography variant="h6" fontWeight={700} color="primary.main">
                                ${product.revenue.toLocaleString()}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Revenue
                              </Typography>
                            </Box>
                          </Stack>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </DashboardContent>
  );
};
