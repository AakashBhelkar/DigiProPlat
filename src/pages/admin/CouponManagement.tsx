import React, { useState, useEffect } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  alpha,
  useTheme,
} from '@mui/material';
import { Iconify } from '../../components/iconify';
import { DashboardContent } from '../../layouts/dashboard/main';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';
import { Plus, Edit, Trash2, MoreVertical, X } from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  description: string;
  is_active: boolean;
  expires_at: string | null;
  usage_limit: number | null;
  usage_count: number;
  product_id: string | null;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

export const CouponManagement: React.FC = () => {
  const theme = useTheme();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'expired'>('all');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCouponId, setSelectedCouponId] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: 0,
    description: '',
    is_active: true,
    expires_at: '',
    usage_limit: null as number | null,
    product_id: null as string | null,
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCoupons(data || []);
    } catch (error: any) {
      console.error('Error fetching coupons:', error);
      toast.error(error.message || 'Failed to fetch coupons');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCoupons = coupons.filter((coupon) => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchTerm.toLowerCase());
    const isExpired = coupon.expires_at && new Date(coupon.expires_at) < new Date();
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && coupon.is_active && !isExpired) ||
      (statusFilter === 'inactive' && !coupon.is_active) ||
      (statusFilter === 'expired' && isExpired);
    return matchesSearch && matchesStatus;
  });

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, couponId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedCouponId(couponId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCouponId(null);
  };

  const handleEdit = (coupon: Coupon) => {
    setFormData({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      description: coupon.description,
      is_active: coupon.is_active,
      expires_at: coupon.expires_at ? format(parseISO(coupon.expires_at), "yyyy-MM-dd'T'HH:mm") : '',
      usage_limit: coupon.usage_limit,
      product_id: coupon.product_id,
    });
    setEditDialogOpen(true);
    handleMenuClose();
  };

  const handleCreate = () => {
    setFormData({
      code: '',
      type: 'percentage',
      value: 0,
      description: '',
      is_active: true,
      expires_at: '',
      usage_limit: null,
      product_id: null,
    });
    setEditDialogOpen(true);
  };

  const handleSave = async () => {
    // Validate
    if (!formData.code.trim()) {
      toast.error('Coupon code is required');
      return;
    }
    if (formData.value <= 0) {
      toast.error('Discount value must be greater than 0');
      return;
    }
    if (formData.type === 'percentage' && formData.value > 100) {
      toast.error('Percentage discount cannot exceed 100%');
      return;
    }

    setIsSaving(true);
    try {
      const couponData: any = {
        code: formData.code.toUpperCase().trim(),
        type: formData.type,
        value: formData.value,
        description: formData.description.trim() || 'Discount coupon',
        is_active: formData.is_active,
        expires_at: formData.expires_at || null,
        usage_limit: formData.usage_limit || null,
        product_id: formData.product_id || null,
      };

      if (selectedCouponId) {
        // Update existing coupon
        const { error } = await supabase
          .from('coupons')
          .update(couponData)
          .eq('id', selectedCouponId);

        if (error) throw error;
        toast.success('Coupon updated successfully!');
      } else {
        // Create new coupon
        const { error } = await supabase.from('coupons').insert(couponData);

        if (error) throw error;
        toast.success('Coupon created successfully!');
      }

      setEditDialogOpen(false);
      setSelectedCouponId(null);
      await fetchCoupons();
    } catch (error: any) {
      console.error('Error saving coupon:', error);
      toast.error(error.message || 'Failed to save coupon');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCouponId) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase.from('coupons').delete().eq('id', selectedCouponId);

      if (error) throw error;
      toast.success('Coupon deleted successfully!');
      setDeleteDialogOpen(false);
      setSelectedCouponId(null);
      await fetchCoupons();
    } catch (error: any) {
      console.error('Error deleting coupon:', error);
      toast.error(error.message || 'Failed to delete coupon');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusChip = (coupon: Coupon) => {
    const isExpired = coupon.expires_at && new Date(coupon.expires_at) < new Date();
    if (isExpired) {
      return <Chip label="Expired" color="error" size="small" />;
    }
    if (!coupon.is_active) {
      return <Chip label="Inactive" color="default" size="small" />;
    }
    return <Chip label="Active" color="success" size="small" />;
  };

  const selectedCoupon = coupons.find((c) => c.id === selectedCouponId);

  return (
    <DashboardContent>
      <Stack spacing={4}>
        {/* Header */}
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Coupon Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Create and manage discount coupons for your platform
            </Typography>
          </Box>
          <Button variant="contained" size="large" startIcon={<Plus size={20} />} onClick={handleCreate}>
            Create Coupon
          </Button>
        </Stack>

        {/* Filters */}
        <Card>
          <CardContent>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                placeholder="Search coupons..."
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
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="expired">Expired</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </CardContent>
        </Card>

        {/* Coupons Table */}
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Code</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Value</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Uses</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Expires</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : filteredCoupons.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                      <Stack spacing={2} alignItems="center">
                        <Iconify icon="solar:ticket-bold-duotone" width={64} sx={{ color: 'text.disabled' }} />
                        <Typography variant="h6" color="text.secondary">
                          No coupons found
                        </Typography>
                        <Typography variant="body2" color="text.disabled">
                          {searchTerm || statusFilter !== 'all'
                            ? 'Try adjusting your search or filters'
                            : 'Create your first coupon to get started'}
                        </Typography>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCoupons.map((coupon) => (
                    <TableRow
                      key={coupon.id}
                      sx={{
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.04),
                        },
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} fontFamily="monospace">
                          {coupon.code}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={coupon.type === 'percentage' ? 'Percentage' : 'Fixed'}
                          size="small"
                          color={coupon.type === 'percentage' ? 'primary' : 'secondary'}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {coupon.type === 'percentage' ? `${coupon.value}%` : `$${coupon.value}`}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {coupon.usage_count} / {coupon.usage_limit || '∞'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {coupon.expires_at ? format(parseISO(coupon.expires_at), 'MMM dd, yyyy') : 'Never'}
                        </Typography>
                      </TableCell>
                      <TableCell>{getStatusChip(coupon)}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={(e) => handleMenuOpen(e, coupon.id)}>
                          <MoreVertical size={18} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {/* Actions Menu */}
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={() => selectedCouponId && handleEdit(coupons.find((c) => c.id === selectedCouponId)!)}>
            <Iconify icon="solar:pen-bold-duotone" sx={{ mr: 1 }} />
            Edit
          </MenuItem>
          <MenuItem
            onClick={() => {
              setDeleteDialogOpen(true);
              handleMenuClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="solar:trash-bin-trash-bold-duotone" sx={{ mr: 1 }} />
            Delete
          </MenuItem>
        </Menu>

        {/* Edit/Create Dialog */}
        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h6" fontWeight={700}>
                {selectedCouponId ? 'Edit Coupon' : 'Create Coupon'}
              </Typography>
              <IconButton onClick={() => setEditDialogOpen(false)} size="small">
                <X size={20} />
              </IconButton>
            </Stack>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                label="Coupon Code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                required
                helperText="Code will be converted to uppercase"
              />

              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={2}
                helperText="Brief description of the coupon"
              />

              <FormControl fullWidth required>
                <InputLabel>Discount Type</InputLabel>
                <Select
                  value={formData.type}
                  label="Discount Type"
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'percentage' | 'fixed' })}
                >
                  <MenuItem value="percentage">Percentage</MenuItem>
                  <MenuItem value="fixed">Fixed Amount</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label={formData.type === 'percentage' ? 'Discount Percentage' : 'Discount Amount'}
                type="number"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                required
                InputProps={{
                  endAdornment: formData.type === 'percentage' ? <InputAdornment position="end">%</InputAdornment> : <InputAdornment position="start">$</InputAdornment>,
                }}
                helperText={formData.type === 'percentage' ? 'Enter a value between 1-100' : 'Enter the discount amount in dollars'}
              />

              <TextField
                fullWidth
                label="Expiration Date"
                type="datetime-local"
                value={formData.expires_at}
                onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                InputLabelProps={{ shrink: true }}
                helperText="Leave empty for no expiration"
              />

              <TextField
                fullWidth
                label="Usage Limit"
                type="number"
                value={formData.usage_limit || ''}
                onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value ? parseInt(e.target.value) : null })}
                helperText="Leave empty for unlimited uses"
              />

              <FormControlLabel
                control={
                  <Switch checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} />
                }
                label="Active"
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 2 }}>
            <Button onClick={() => setEditDialogOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSave} disabled={isSaving} startIcon={isSaving ? <CircularProgress size={16} /> : null}>
              {isSaving ? 'Saving...' : selectedCouponId ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Alert severity="warning">Delete Coupon</Alert>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mt: 2 }}>
              Are you sure you want to delete coupon <strong>{selectedCoupon?.code}</strong>?
              <br />
              <br />
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 2 }}>
            <Button onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="contained" color="error" onClick={handleDelete} disabled={isDeleting} startIcon={isDeleting ? <CircularProgress size={16} /> : null}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </DashboardContent>
  );
};

