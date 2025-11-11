import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Avatar,
  alpha,
  useTheme,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Iconify } from '../components/iconify';
import { supabase } from '../lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { DashboardContent } from '../layouts/dashboard/main';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

// ----------------------------------------------------------------------

interface Transaction {
  id: string;
  type: 'sale' | 'withdrawal' | 'refund' | 'deposit';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  description: string;
  date: string;
  productTitle?: string;
}

export const Wallet: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('bank');
  const [walletBalance, setWalletBalance] = useState(0);
  const [pendingBalance, setPendingBalance] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWalletData = async () => {
      setLoading(true);
      try {
        const { data: walletData } = await supabase.from('wallets').select('*').single();
        if (walletData && typeof walletData === 'object') {
          setWalletBalance((walletData as { balance?: number }).balance || 0);
          setPendingBalance((walletData as { pending?: number }).pending || 0);
          setTotalEarnings((walletData as { total_earnings?: number }).total_earnings || 0);
        }
        const { data: txs } = await supabase
          .from('transactions')
          .select('*')
          .order('date', { ascending: false });
        if (Array.isArray(txs)) {
          setTransactions(txs as Transaction[]);
        }
      } catch (error) {
        console.error('Error fetching wallet data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchWalletData();
  }, []);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'sale':
        return 'solar:chart-2-bold-duotone';
      case 'withdrawal':
        return 'solar:download-bold-duotone';
      case 'refund':
        return 'solar:upload-bold-duotone';
      case 'deposit':
        return 'solar:dollar-bold-duotone';
      default:
        return 'solar:dollar-bold-duotone';
    }
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'completed':
        return <Chip label="Completed" color="success" size="small" />;
      case 'pending':
        return <Chip label="Pending" color="warning" size="small" />;
      case 'failed':
        return <Chip label="Failed" color="error" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  const handleWithdraw = () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) return;
    alert(`Withdrawal request of $${withdrawAmount} submitted successfully!`);
    setWithdrawAmount('');
  };

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
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Wallet
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your earnings and withdrawals
          </Typography>
        </Box>

        {/* Balance Cards */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
          <Card
            sx={{
              flex: 1,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              color: 'white',
            }}
          >
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                    Available Balance
                  </Typography>
                  <Typography variant="h3" fontWeight={800} sx={{ color: 'white' }}>
                    ${walletBalance.toFixed(2)}
                  </Typography>
                </Box>
                <Iconify icon="solar:dollar-bold-duotone" width={48} sx={{ color: 'white' }} />
              </Stack>
            </CardContent>
          </Card>

          <Card
            sx={{
              flex: 1,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              color: 'white',
            }}
          >
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                    Pending Balance
                  </Typography>
                  <Typography variant="h4" fontWeight={800} sx={{ color: 'white' }}>
                    ${pendingBalance.toFixed(2)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', mt: 1 }}>
                    Available in 3-5 days
                  </Typography>
                </Box>
                <Iconify icon="solar:calendar-bold-duotone" width={40} sx={{ color: 'white' }} />
              </Stack>
            </CardContent>
          </Card>

          <Card
            sx={{
              flex: 1,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              color: 'white',
            }}
          >
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                    Total Earnings
                  </Typography>
                  <Typography variant="h4" fontWeight={800} sx={{ color: 'white' }}>
                    ${totalEarnings.toFixed(2)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', mt: 1 }}>
                    +12.5% this month
                  </Typography>
                </Box>
                <Iconify icon="solar:chart-2-bold-duotone" width={40} sx={{ color: 'white' }} />
              </Stack>
            </CardContent>
          </Card>
        </Stack>

        {/* Tabs */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
              <Tab label="Overview" />
              <Tab label="Transactions" />
              <Tab label="Withdraw" />
            </Tabs>
          </Box>

          <CardContent sx={{ p: 4 }}>
            {/* Overview Tab */}
            {activeTab === 0 && (
              <Stack spacing={4}>
                <Stack direction={{ xs: 'column', lg: 'row' }} spacing={4}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      Recent Transactions
                    </Typography>
                    <Stack spacing={2} sx={{ mt: 2 }}>
                      {transactions.length === 0 ? (
                        <Alert severity="info">No transactions found.</Alert>
                      ) : (
                        transactions.slice(0, 5).map((transaction) => (
                          <Card key={transaction.id} variant="outlined">
                            <CardContent>
                              <Stack direction="row" alignItems="center" justifyContent="space-between">
                                <Stack direction="row" alignItems="center" spacing={2}>
                                  <Avatar
                                    sx={{
                                      bgcolor: alpha(theme.palette.primary.main, 0.12),
                                      color: 'primary.main',
                                    }}
                                  >
                                    <Iconify icon={getTransactionIcon(transaction.type)} width={24} />
                                  </Avatar>
                                  <Box>
                                    <Typography variant="body2" fontWeight={600}>
                                      {transaction.description}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {formatDistanceToNow(new Date(transaction.date))} ago
                                    </Typography>
                                  </Box>
                                </Stack>
                                <Stack alignItems="flex-end" spacing={1}>
                                  <Typography
                                    variant="body2"
                                    fontWeight={700}
                                    color={transaction.amount > 0 ? 'success.main' : 'error.main'}
                                  >
                                    {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                                  </Typography>
                                  {getStatusChip(transaction.status)}
                                </Stack>
                              </Stack>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </Stack>
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      Quick Actions
                    </Typography>
                    <Stack spacing={2} sx={{ mt: 2 }}>
                      <Card
                        variant="outlined"
                        sx={{
                          cursor: 'pointer',
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.04),
                            borderColor: 'primary.main',
                          },
                        }}
                        onClick={() => setActiveTab(2)}
                      >
                        <CardContent>
                          <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Iconify icon="solar:download-bold-duotone" width={24} color="primary.main" />
                              <Typography variant="body2" fontWeight={600}>
                                Withdraw Funds
                              </Typography>
                            </Stack>
                            <Iconify icon="solar:arrow-right-bold-duotone" width={20} />
                          </Stack>
                        </CardContent>
                      </Card>

                      <Card variant="outlined">
                        <CardContent>
                          <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Iconify icon="solar:card-bold-duotone" width={24} color="success.main" />
                              <Typography variant="body2" fontWeight={600}>
                                Payment Methods
                              </Typography>
                            </Stack>
                            <Iconify icon="solar:arrow-right-bold-duotone" width={20} />
                          </Stack>
                        </CardContent>
                      </Card>

                      <Card variant="outlined">
                        <CardContent>
                          <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Iconify icon="solar:download-bold-duotone" width={24} color="secondary.main" />
                              <Typography variant="body2" fontWeight={600}>
                                Download Statement
                              </Typography>
                            </Stack>
                            <Iconify icon="solar:arrow-right-bold-duotone" width={20} />
                          </Stack>
                        </CardContent>
                      </Card>
                    </Stack>
                  </Box>
                </Stack>
              </Stack>
            )}

            {/* Transactions Tab */}
            {activeTab === 1 && (
              <Stack spacing={3}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="h6" fontWeight={700}>
                    All Transactions
                  </Typography>
                  <Button variant="outlined" startIcon={<Iconify icon="solar:filter-bold-duotone" />}>
                    Filter
                  </Button>
                </Stack>

                <Stack spacing={2}>
                  {transactions.length === 0 ? (
                    <Alert severity="info">No transactions found.</Alert>
                  ) : (
                    transactions.map((transaction) => (
                      <Card key={transaction.id} variant="outlined">
                        <CardContent>
                          <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            alignItems={{ xs: 'flex-start', sm: 'center' }}
                            justifyContent="space-between"
                            spacing={2}
                          >
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Avatar
                                sx={{
                                  bgcolor: alpha(theme.palette.grey[500], 0.12),
                                  color: 'text.primary',
                                }}
                              >
                                <Iconify icon={getTransactionIcon(transaction.type)} width={24} />
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight={600}>
                                  {transaction.description}
                                </Typography>
                                {transaction.productTitle && (
                                  <Typography variant="caption" color="text.secondary">
                                    Product: {transaction.productTitle}
                                  </Typography>
                                )}
                                <Typography variant="caption" color="text.secondary" display="block">
                                  {new Date(transaction.date).toLocaleDateString()} at{' '}
                                  {new Date(transaction.date).toLocaleTimeString()}
                                </Typography>
                              </Box>
                            </Stack>
                            <Stack alignItems={{ xs: 'flex-start', sm: 'flex-end' }} spacing={1}>
                              <Typography
                                variant="body2"
                                fontWeight={700}
                                color={transaction.amount > 0 ? 'success.main' : 'error.main'}
                              >
                                {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                              </Typography>
                              {getStatusChip(transaction.status)}
                            </Stack>
                          </Stack>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </Stack>
              </Stack>
            )}

            {/* Withdraw Tab */}
            {activeTab === 2 && (
              <Stack spacing={4} sx={{ maxWidth: 500 }}>
                <Box>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    Withdraw Funds
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Transfer your earnings to your preferred payment method
                  </Typography>
                </Box>

                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Withdrawal Amount"
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="0.00"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    helperText={`Available: $${walletBalance.toFixed(2)}`}
                    inputProps={{ max: walletBalance }}
                  />

                  <FormControl fullWidth>
                    <InputLabel>Withdrawal Method</InputLabel>
                    <Select
                      value={withdrawMethod}
                      label="Withdrawal Method"
                      onChange={(e) => setWithdrawMethod(e.target.value)}
                    >
                      <MenuItem value="bank">Bank Transfer</MenuItem>
                      <MenuItem value="paypal">PayPal</MenuItem>
                      <MenuItem value="stripe">Stripe</MenuItem>
                    </Select>
                  </FormControl>

                  <Alert severity="info" icon={<Iconify icon="solar:info-circle-bold-duotone" />}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Withdrawal Information
                    </Typography>
                    <Typography variant="body2">
                      Withdrawals typically take 3-5 business days to process. A small processing fee may apply.
                    </Typography>
                  </Alert>

                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={handleWithdraw}
                    disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > walletBalance}
                  >
                    Request Withdrawal
                  </Button>
                </Stack>
              </Stack>
            )}
          </CardContent>
        </Card>
      </Stack>
    </DashboardContent>
  );
};
