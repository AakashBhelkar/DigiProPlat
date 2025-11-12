import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  IconButton,
  Menu,
  alpha,
  useTheme,
  Skeleton,
  CircularProgress,
} from '@mui/material';
import {
  Search,
  Filter,
  MoreVertical,
  Ban,
  CheckCircle,
  Eye,
  Edit,
  Download,
} from 'lucide-react';
import { Iconify } from '../../components/iconify';
import { useAdminStore } from '../../store/adminStore';
import { formatDistanceToNow } from 'date-fns';
import { PlatformUser } from '../../store/adminStore';
import { DashboardContent } from '../../layouts/dashboard/main';

type User = PlatformUser;

export const UserManagement: React.FC = () => {
  const theme = useTheme();
  const { users, fetchUsers, updateUserStatus, isLoading } = useAdminStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'pending'>('all');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && user.isActive) ||
      (statusFilter === 'suspended' && !user.isActive) ||
      (statusFilter === 'pending' && user.kycStatus === 'pending');

    return matchesSearch && matchesStatus;
  });

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, userId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedUserId(userId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUserId(null);
  };

  const handleStatusChange = async (userId: string, status: 'active' | 'suspended') => {
    await updateUserStatus(userId, status === 'active');
    handleMenuClose();
  };

  const getStatusChip = (user: User) => {
    if (!user.isActive) {
      return <Chip label="Suspended" color="error" size="small" />;
    }
    if (user.kycStatus === 'pending') {
      return <Chip label="Pending KYC" color="warning" size="small" />;
    }
    if (user.kycStatus === 'verified') {
      return <Chip label="Verified" color="success" size="small" />;
    }
    return <Chip label="Active" color="success" size="small" />;
  };

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
              User Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage user accounts and monitor activity
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<Iconify icon="solar:download-bold-duotone" />}
            sx={{ px: 3 }}
          >
            Export Users
          </Button>
        </Stack>

        {/* Filters */}
        <Card>
          <CardContent>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                placeholder="Search users..."
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
                  <MenuItem value="suspended">Suspended</MenuItem>
                  <MenuItem value="pending">Pending KYC</MenuItem>
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

        {/* Users Table */}
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Subscription</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Products</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Revenue</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Joined</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow
                    key={user.id}
                    sx={{
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                      },
                    }}
                  >
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar
                          sx={{
                            bgcolor: theme.palette.primary.main,
                            width: 40,
                            height: 40,
                          }}
                        >
                          {user.firstName[0]}
                          {user.lastName[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {user.firstName} {user.lastName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {user.email}
                          </Typography>
                          <Typography variant="caption" color="text.disabled">
                            @{user.username}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>{getStatusChip(user)}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.subscription?.name || 'Free'}
                        color="info"
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {user.productCount || 0}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        ${(user.totalRevenue || 0).toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDistanceToNow(new Date(user.createdAt))} ago
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, user.id)}
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

        {filteredUsers.length === 0 && (
          <Card>
            <CardContent>
              <Stack spacing={2} alignItems="center" sx={{ py: 8 }}>
                <Iconify
                  icon="solar:magnifer-bold-duotone"
                  width={64}
                  sx={{ color: 'text.disabled' }}
                />
                <Typography variant="h6" color="text.secondary">
                  No users found
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
          <MenuItem onClick={handleMenuClose}>
            <Iconify icon="solar:eye-bold-duotone" sx={{ mr: 1 }} />
            View Details
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <Iconify icon="solar:pen-bold-duotone" sx={{ mr: 1 }} />
            Edit User
          </MenuItem>
          {selectedUserId && (
            <>
              {users.find((u) => u.id === selectedUserId)?.isActive ? (
                <MenuItem
                  onClick={() => handleStatusChange(selectedUserId, 'suspended')}
                  sx={{ color: 'error.main' }}
                >
                  <Iconify icon="solar:forbidden-circle-bold-duotone" sx={{ mr: 1 }} />
                  Suspend User
                </MenuItem>
              ) : (
                <MenuItem
                  onClick={() => handleStatusChange(selectedUserId, 'active')}
                  sx={{ color: 'success.main' }}
                >
                  <Iconify icon="solar:check-circle-bold-duotone" sx={{ mr: 1 }} />
                  Activate User
                </MenuItem>
              )}
            </>
          )}
        </Menu>
      </Stack>
    </DashboardContent>
  );
};
