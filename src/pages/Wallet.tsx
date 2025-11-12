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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputAdornment,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { Iconify } from '../components/iconify';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { formatDistanceToNow, format, parseISO } from 'date-fns';
import { DashboardContent } from '../layouts/dashboard/main';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import toast from 'react-hot-toast';
import { X, Plus, Trash2 } from 'lucide-react';

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

interface WithdrawalRequest {
  id: string;
  amount: number;
  payment_method: string;
  payment_details: any;
  status: 'pending' | 'approved' | 'processing' | 'completed' | 'rejected' | 'cancelled';
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

interface PaymentMethod {
  id: string;
  user_id: string;
  type: 'bank' | 'paypal' | 'stripe';
  account_name?: string;
  account_number?: string;
  routing_number?: string;
  bank_name?: string;
  email?: string;
  account_id?: string;
  is_default: boolean;
  is_active: boolean;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export const Wallet: React.FC = () => {
  const theme = useTheme();
  const { user, checkAuth } = useAuthStore();
  const [activeTab, setActiveTab] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('bank');
  const [walletBalance, setWalletBalance] = useState(0);
  const [pendingBalance, setPendingBalance] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethodDialogOpen, setPaymentMethodDialogOpen] = useState(false);
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<PaymentMethod | null>(null);
  const [isSavingPaymentMethod, setIsSavingPaymentMethod] = useState(false);
  const [paymentMethodForm, setPaymentMethodForm] = useState({
    type: 'bank' as 'bank' | 'paypal' | 'stripe',
    account_name: '',
    account_number: '',
    routing_number: '',
    bank_name: '',
    email: '',
    is_default: false,
  });

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    setLoading(true);
    try {
      const { user } = useAuthStore.getState();
      if (!user) return;

      // Fetch wallet balance from profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', user.id)
        .single();

      if (profile) {
        setWalletBalance(Number(profile.wallet_balance || 0));
      }

      // Calculate pending balance from pending withdrawal requests
      const { data: pendingWithdrawals } = await supabase
        .from('withdrawal_requests')
        .select('amount')
        .eq('user_id', user.id)
        .in('status', ['pending', 'processing', 'approved']);

      const pending = pendingWithdrawals?.reduce((sum, w) => sum + Number(w.amount || 0), 0) || 0;
      setPendingBalance(pending);

      // Calculate total earnings from completed sale transactions
      const { data: sales } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', user.id)
        .eq('type', 'sale')
        .eq('status', 'completed');

      const earnings = sales?.reduce((sum, t) => sum + Number(t.amount || 0), 0) || 0;
      setTotalEarnings(earnings);

      // Fetch transactions
      const { data: txs } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (Array.isArray(txs)) {
        setTransactions(
          txs.map((t: any) => ({
            id: t.id,
            type: t.type,
            amount: Number(t.amount),
            status: t.status,
            description: t.description,
            date: t.created_at,
            productTitle: t.product_id ? 'Product' : undefined,
          }))
        );
      }

      // Fetch withdrawal requests
      const { data: withdrawals } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (Array.isArray(withdrawals)) {
        setWithdrawalRequests(withdrawals);
      }

      // Fetch payment methods
      const { data: methods } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (Array.isArray(methods)) {
        const mappedMethods = methods.map((m: any) => ({
          id: m.id,
          user_id: m.user_id,
          type: m.type,
          account_name: m.account_name,
          account_number: m.account_number,
          routing_number: m.routing_number,
          bank_name: m.bank_name,
          email: m.email,
          account_id: m.account_id,
          is_default: m.is_default,
          is_active: m.is_active,
          metadata: m.metadata,
          created_at: m.created_at,
          updated_at: m.updated_at,
        }));
        setPaymentMethods(mappedMethods);
        
        // Reset withdrawMethod to match an available payment method or default
        if (mappedMethods.length > 0) {
          const defaultMethod = mappedMethods.find(m => m.is_default) || mappedMethods[0];
          setWithdrawMethod(defaultMethod.type);
        } else {
          // No payment methods, reset to default
          setWithdrawMethod('bank');
        }
      } else {
        // No payment methods, reset to default
        setWithdrawMethod('bank');
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      toast.error('Failed to fetch wallet data');
    } finally {
      setLoading(false);
    }
  };

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

  const handleWithdraw = async () => {
    if (!user) {
      toast.error('You must be logged in to request a withdrawal');
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid withdrawal amount');
      return;
    }

    if (amount < 10) {
      toast.error('Minimum withdrawal amount is $10.00');
      return;
    }

    if (amount > walletBalance) {
      toast.error(`Insufficient balance. Available: $${walletBalance.toFixed(2)}`);
      return;
    }

    // Check KYC status
    if (user.kycStatus !== 'verified') {
      toast.error('KYC verification is required before making withdrawals. Please complete your identity verification first.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mafryhnhgopxfckrepxv.supabase.co';

      // Get payment details based on method
      let paymentDetails = null;
      if (withdrawMethod === 'bank') {
        // In production, fetch from payment_methods table
        paymentDetails = { type: 'bank' };
      } else if (withdrawMethod === 'paypal') {
        paymentDetails = { type: 'paypal' };
      } else if (withdrawMethod === 'stripe') {
        paymentDetails = { type: 'stripe' };
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/request-withdrawal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          amount,
          paymentMethod: withdrawMethod,
          paymentDetails,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create withdrawal request');
      }

      toast.success('Withdrawal request submitted successfully!');
      setWithdrawAmount('');
      await fetchWalletData();
      await checkAuth(); // Refresh user data
    } catch (error: any) {
      console.error('Error creating withdrawal request:', error);
      toast.error(error.message || 'Failed to create withdrawal request');
    } finally {
      setIsSubmitting(false);
    }
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
              <Tab label="Payment Methods" />
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

                      <Card
                        variant="outlined"
                        sx={{
                          cursor: 'pointer',
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.04),
                            borderColor: 'primary.main',
                          },
                        }}
                        onClick={() => setActiveTab(3)}
                      >
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
              <Stack spacing={4}>
                <Box>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    Withdraw Funds
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Transfer your earnings to your preferred payment method
                  </Typography>
                </Box>

                <Stack spacing={3} sx={{ maxWidth: 500 }}>
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
                    helperText={`Available: $${walletBalance.toFixed(2)} | Minimum: $10.00`}
                    inputProps={{ min: 10, max: walletBalance, step: 0.01 }}
                    error={withdrawAmount ? (parseFloat(withdrawAmount) < 10 || parseFloat(withdrawAmount) > walletBalance) : false}
                  />

                  <FormControl fullWidth>
                    <InputLabel>Withdrawal Method</InputLabel>
                    <Select
                      value={withdrawMethod || ''}
                      label="Withdrawal Method"
                      onChange={(e) => setWithdrawMethod(e.target.value)}
                    >
                      {paymentMethods.length > 0 ? (
                        paymentMethods
                          .filter(method => method.is_active)
                          .map((method) => (
                            <MenuItem key={method.id} value={method.type}>
                              {method.type === 'bank'
                                ? `${method.bank_name || 'Bank'} - ****${method.account_number?.slice(-4) || ''}${method.is_default ? ' (Default)' : ''}`
                                : method.type === 'paypal'
                                ? `PayPal - ${method.email}${method.is_default ? ' (Default)' : ''}`
                                : `Stripe${method.is_default ? ' (Default)' : ''}`}
                            </MenuItem>
                          ))
                      ) : (
                        <>
                          <MenuItem value="bank">Bank Transfer</MenuItem>
                          <MenuItem value="paypal">PayPal</MenuItem>
                          <MenuItem value="stripe">Stripe</MenuItem>
                        </>
                      )}
                    </Select>
                    {paymentMethods.length === 0 && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                        <Button
                          variant="text"
                          size="small"
                          onClick={() => setActiveTab(3)}
                          sx={{ p: 0, minWidth: 'auto', textTransform: 'none' }}
                        >
                          Add a payment method
                        </Button>{' '}
                        to save your withdrawal details
                      </Typography>
                    )}
                  </FormControl>

                  <Alert severity="info" icon={<Iconify icon="solar:info-circle-bold-duotone" />}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Withdrawal Information
                    </Typography>
                    <Typography variant="body2">
                      Withdrawals typically take 3-5 business days to process. A small processing fee may apply.
                    </Typography>
                  </Alert>

                  {user?.kycStatus !== 'verified' && (
                    <Alert severity="warning">
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        KYC Verification Required
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        You must complete identity verification before making withdrawals.
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        component="a"
                        href="/kyc"
                        sx={{ mt: 1 }}
                      >
                        Complete Verification
                      </Button>
                    </Alert>
                  )}

                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={handleWithdraw}
                    disabled={
                      isSubmitting ||
                      !withdrawAmount ||
                      parseFloat(withdrawAmount) <= 0 ||
                      parseFloat(withdrawAmount) > walletBalance ||
                      parseFloat(withdrawAmount) < 10 ||
                      user?.kycStatus !== 'verified'
                    }
                    startIcon={isSubmitting ? <CircularProgress size={16} /> : null}
                  >
                    {isSubmitting ? 'Submitting...' : 'Request Withdrawal'}
                  </Button>
                </Stack>

                {/* Withdrawal History */}
                {withdrawalRequests.length > 0 && (
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      Withdrawal History
                    </Typography>
                    <Card variant="outlined">
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Amount</TableCell>
                              <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Method</TableCell>
                              <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Status</TableCell>
                              <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Date</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {withdrawalRequests.map((request) => (
                              <TableRow key={request.id}>
                                <TableCell>
                                  <Typography variant="body2" fontWeight={600}>
                                    ${request.amount.toFixed(2)}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={request.payment_method}
                                    size="small"
                                    variant="outlined"
                                  />
                                </TableCell>
                                <TableCell>{getStatusChip(request.status)}</TableCell>
                                <TableCell>
                                  <Typography variant="body2" color="text.secondary">
                                    {format(parseISO(request.created_at), 'MMM dd, yyyy')}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Card>
                  </Box>
                )}
              </Stack>
            )}

            {/* Payment Methods Tab */}
            {activeTab === 3 && (
              <Stack spacing={4}>
                <Box>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h6" fontWeight={700} gutterBottom>
                        Payment Methods
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Manage your payment methods for withdrawals
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      startIcon={<Plus size={20} />}
                      onClick={() => {
                        setEditingPaymentMethod(null);
                        setPaymentMethodForm({
                          type: 'bank',
                          account_name: '',
                          account_number: '',
                          routing_number: '',
                          bank_name: '',
                          email: '',
                          is_default: false,
                        });
                        setPaymentMethodDialogOpen(true);
                      }}
                    >
                      Add Payment Method
                    </Button>
                  </Stack>
                </Box>

                {paymentMethods.length === 0 ? (
                  <Card variant="outlined">
                    <CardContent>
                      <Stack spacing={2} alignItems="center" sx={{ py: 4 }}>
                        <Iconify icon="solar:card-bold-duotone" width={64} sx={{ color: 'text.disabled' }} />
                        <Typography variant="h6" color="text.secondary">
                          No Payment Methods
                        </Typography>
                        <Typography variant="body2" color="text.disabled" align="center">
                          Add a payment method to receive withdrawals
                        </Typography>
                        <Button
                          variant="outlined"
                          startIcon={<Plus size={18} />}
                          onClick={() => {
                            setEditingPaymentMethod(null);
                            setPaymentMethodForm({
                              type: 'bank',
                              account_name: '',
                              account_number: '',
                              routing_number: '',
                              bank_name: '',
                              email: '',
                              is_default: false,
                            });
                            setPaymentMethodDialogOpen(true);
                          }}
                        >
                          Add Payment Method
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                ) : (
                  <Stack spacing={2}>
                    {paymentMethods.map((method) => (
                      <Card key={method.id} variant="outlined">
                        <CardContent>
                          <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Stack direction="row" alignItems="center" spacing={2} sx={{ flex: 1 }}>
                              <Avatar
                                sx={{
                                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                                  color: 'primary.main',
                                }}
                              >
                                <Iconify
                                  icon={
                                    method.type === 'bank'
                                      ? 'solar:bank-bold-duotone'
                                      : method.type === 'paypal'
                                      ? 'solar:wallet-bold-duotone'
                                      : 'solar:card-bold-duotone'
                                  }
                                  width={24}
                                />
                              </Avatar>
                              <Box sx={{ flex: 1 }}>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <Typography variant="body2" fontWeight={600}>
                                    {method.type === 'bank'
                                      ? `${method.bank_name || 'Bank Account'} - ****${method.account_number?.slice(-4) || ''}`
                                      : method.type === 'paypal'
                                      ? `PayPal - ${method.email || 'N/A'}`
                                      : `Stripe - ${method.account_id || 'N/A'}`}
                                  </Typography>
                                  {method.is_default && (
                                    <Chip label="Default" color="primary" size="small" />
                                  )}
                                </Stack>
                                {method.account_name && (
                                  <Typography variant="caption" color="text.secondary">
                                    {method.account_name}
                                  </Typography>
                                )}
                              </Box>
                            </Stack>
                            <Stack direction="row" spacing={1}>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setEditingPaymentMethod(method);
                                  setPaymentMethodForm({
                                    type: method.type,
                                    account_name: method.account_name || '',
                                    account_number: method.account_number || '',
                                    routing_number: method.routing_number || '',
                                    bank_name: method.bank_name || '',
                                    email: method.email || '',
                                    is_default: method.is_default,
                                  });
                                  setPaymentMethodDialogOpen(true);
                                }}
                              >
                                <Iconify icon="solar:pen-bold-duotone" width={20} />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={async () => {
                                  if (window.confirm('Are you sure you want to delete this payment method?')) {
                                    try {
                                      const { error } = await supabase
                                        .from('payment_methods')
                                        .update({ is_active: false })
                                        .eq('id', method.id);

                                      if (error) throw error;
                                      toast.success('Payment method deleted');
                                      await fetchWalletData();
                                    } catch (error: any) {
                                      toast.error(error.message || 'Failed to delete payment method');
                                    }
                                  }
                                }}
                              >
                                <Trash2 size={18} />
                              </IconButton>
                            </Stack>
                          </Stack>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                )}
              </Stack>
            )}
          </CardContent>
        </Card>

        {/* Payment Method Dialog */}
        <Dialog open={paymentMethodDialogOpen} onClose={() => setPaymentMethodDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h6" fontWeight={700}>
                {editingPaymentMethod ? 'Edit Payment Method' : 'Add Payment Method'}
              </Typography>
              <IconButton onClick={() => setPaymentMethodDialogOpen(false)} size="small">
                <X size={20} />
              </IconButton>
            </Stack>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <FormControl fullWidth>
                <InputLabel>Payment Method Type</InputLabel>
                <Select
                  value={paymentMethodForm.type}
                  label="Payment Method Type"
                  onChange={(e) =>
                    setPaymentMethodForm({ ...paymentMethodForm, type: e.target.value as typeof paymentMethodForm.type })
                  }
                >
                  <MenuItem value="bank">Bank Transfer</MenuItem>
                  <MenuItem value="paypal">PayPal</MenuItem>
                  <MenuItem value="stripe">Stripe</MenuItem>
                </Select>
              </FormControl>

              {paymentMethodForm.type === 'bank' && (
                <>
                  <TextField
                    fullWidth
                    label="Account Holder Name"
                    value={paymentMethodForm.account_name}
                    onChange={(e) => setPaymentMethodForm({ ...paymentMethodForm, account_name: e.target.value })}
                    required
                  />
                  <TextField
                    fullWidth
                    label="Bank Name"
                    value={paymentMethodForm.bank_name}
                    onChange={(e) => setPaymentMethodForm({ ...paymentMethodForm, bank_name: e.target.value })}
                    required
                  />
                  <TextField
                    fullWidth
                    label="Account Number"
                    value={paymentMethodForm.account_number}
                    onChange={(e) => setPaymentMethodForm({ ...paymentMethodForm, account_number: e.target.value })}
                    required
                    inputProps={{ maxLength: 20 }}
                  />
                  <TextField
                    fullWidth
                    label="Routing Number"
                    value={paymentMethodForm.routing_number}
                    onChange={(e) => setPaymentMethodForm({ ...paymentMethodForm, routing_number: e.target.value })}
                    required
                    inputProps={{ maxLength: 9 }}
                  />
                </>
              )}

              {paymentMethodForm.type === 'paypal' && (
                <TextField
                  fullWidth
                  label="PayPal Email"
                  type="email"
                  value={paymentMethodForm.email}
                  onChange={(e) => setPaymentMethodForm({ ...paymentMethodForm, email: e.target.value })}
                  required
                />
              )}

              {paymentMethodForm.type === 'stripe' && (
                <Alert severity="info">
                  Stripe payment methods are connected through Stripe Connect. You'll need to complete the Stripe onboarding process.
                </Alert>
              )}

              <FormControlLabel
                control={
                  <Checkbox
                    checked={paymentMethodForm.is_default}
                    onChange={(e) => setPaymentMethodForm({ ...paymentMethodForm, is_default: e.target.checked })}
                  />
                }
                label="Set as default payment method"
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 2 }}>
            <Button onClick={() => setPaymentMethodDialogOpen(false)} disabled={isSavingPaymentMethod}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={async () => {
                // Validate form
                if (paymentMethodForm.type === 'bank') {
                  if (!paymentMethodForm.account_name || !paymentMethodForm.bank_name || !paymentMethodForm.account_number || !paymentMethodForm.routing_number) {
                    toast.error('Please fill in all required fields');
                    return;
                  }
                } else if (paymentMethodForm.type === 'paypal') {
                  if (!paymentMethodForm.email) {
                    toast.error('Please enter your PayPal email');
                    return;
                  }
                }

                setIsSavingPaymentMethod(true);
                try {
                  const { user } = useAuthStore.getState();
                  if (!user) throw new Error('Not authenticated');

                  const paymentMethodData: any = {
                    user_id: user.id,
                    type: paymentMethodForm.type,
                    is_default: paymentMethodForm.is_default,
                    is_active: true,
                  };

                  if (paymentMethodForm.type === 'bank') {
                    paymentMethodData.account_name = paymentMethodForm.account_name;
                    paymentMethodData.bank_name = paymentMethodForm.bank_name;
                    paymentMethodData.account_number = paymentMethodForm.account_number;
                    paymentMethodData.routing_number = paymentMethodForm.routing_number;
                  } else if (paymentMethodForm.type === 'paypal') {
                    paymentMethodData.email = paymentMethodForm.email;
                  }

                  if (editingPaymentMethod) {
                    // Update existing
                    const { error } = await supabase
                      .from('payment_methods')
                      .update(paymentMethodData)
                      .eq('id', editingPaymentMethod.id);

                    if (error) throw error;
                    toast.success('Payment method updated');
                  } else {
                    // Create new
                    const { error } = await supabase.from('payment_methods').insert(paymentMethodData);

                    if (error) throw error;
                    toast.success('Payment method added');
                  }

                  setPaymentMethodDialogOpen(false);
                  await fetchWalletData();
                } catch (error: any) {
                  console.error('Error saving payment method:', error);
                  toast.error(error.message || 'Failed to save payment method');
                } finally {
                  setIsSavingPaymentMethod(false);
                }
              }}
              disabled={isSavingPaymentMethod}
              startIcon={isSavingPaymentMethod ? <CircularProgress size={16} /> : null}
            >
              {isSavingPaymentMethod ? 'Saving...' : editingPaymentMethod ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </DashboardContent>
  );
};
