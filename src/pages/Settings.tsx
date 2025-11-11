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
  Switch,
  FormControlLabel,
  Divider,
  LinearProgress,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  IconButton,
  alpha,
  useTheme,
} from '@mui/material';
import { Iconify } from '../components/iconify';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { DashboardContent } from '../layouts/dashboard/main';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

// ----------------------------------------------------------------------

export const Settings: React.FC = () => {
  const theme = useTheme();
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState(0);
  const [notifications, setNotifications] = useState({
    emailSales: true,
    emailMarketing: false,
    pushSales: true,
    pushMarketing: true,
  });
  const [openAIApiKey, setOpenAIApiKey] = useState('');
  const [openAIModel, setOpenAIModel] = useState('gpt-4o');
  const [aiKeyStatus, setAiKeyStatus] = useState<'idle' | 'saving' | 'success' | 'error' | 'testing'>('idle');
  const [aiKeyError, setAiKeyError] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);

  const openAIModels = [
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
    { value: 'gpt-4', label: 'GPT-4' },
    { value: 'gpt-4o', label: 'GPT-4o (Recommended)' },
  ];

  const tabs = [
    { label: 'Profile', icon: 'solar:user-bold-duotone' },
    { label: 'Billing', icon: 'solar:card-bold-duotone' },
    { label: 'Notifications', icon: 'solar:bell-bold-duotone' },
    { label: 'Security', icon: 'solar:shield-check-bold-duotone' },
    { label: 'Domain', icon: 'solar:global-bold-duotone' },
    { label: 'AI & OpenAI', icon: 'solar:magic-stick-3-bold-duotone' },
  ];

  const handleProfileUpdate = (field: string, value: string) => {
    updateUser({ [field]: value });
  };

  const handleSaveAIKey = async () => {
    setAiKeyStatus('saving');
    setAiKeyError(null);
                        try {
                          const { data: { session } } = await supabase.auth.getSession();
                          const accessToken = session?.access_token;
                          if (!accessToken) throw new Error('Not authenticated');
                          const res = await fetch('/functions/v1/ai-key-management/save-key', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${accessToken}`,
                            },
        body: JSON.stringify({ apiKey: openAIApiKey, model: openAIModel }),
                          });
                          const data = await res.json();
                          if (!res.ok) throw new Error(data.error || 'Failed to save key');
                          setAiKeyStatus('success');
                          toast.success('API key saved successfully!');
                          setTimeout(() => setAiKeyStatus('idle'), 2000);
                        } catch (e) {
                          setAiKeyStatus('error');
                          setAiKeyError((e as Error).message);
      toast.error((e as Error).message || 'Failed to save API key');
                          setTimeout(() => setAiKeyStatus('idle'), 3000);
                        }
  };

  const handleRemoveAIKey = async () => {
    setAiKeyStatus('saving');
    setAiKeyError(null);
                        try {
                          const { data: { session } } = await supabase.auth.getSession();
                          const accessToken = session?.access_token;
                          if (!accessToken) throw new Error('Not authenticated');
                          const res = await fetch('/functions/v1/ai-key-management/remove-key', {
                            method: 'POST',
                            headers: {
                              'Authorization': `Bearer ${accessToken}`,
                            },
                          });
                          if (!res.ok) throw new Error('Failed to remove key');
                          setOpenAIApiKey('');
                          setAiKeyStatus('success');
                          toast.success('API key removed.');
                          setTimeout(() => setAiKeyStatus('idle'), 2000);
                        } catch (e) {
                          setAiKeyStatus('error');
                          setAiKeyError((e as Error).message);
                          toast.error((e as Error).message || 'Failed to remove API key');
                          setTimeout(() => setAiKeyStatus('idle'), 3000);
                        }
  };

  const handleTestAIKey = async () => {
    setAiKeyStatus('testing');
    setAiKeyError(null);
                        try {
                          const { data: { session } } = await supabase.auth.getSession();
                          const accessToken = session?.access_token;
                          if (!accessToken) throw new Error('Not authenticated');
                          const res = await fetch('/functions/v1/ai-key-management/test-key', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${accessToken}`,
                            },
        body: JSON.stringify({ model: openAIModel }),
                          });
                          const data = await res.json();
                          if (!res.ok) throw new Error(data.error || 'Test failed');
                          setAiKeyStatus('success');
                          toast.success('API key is valid!');
                          setTimeout(() => setAiKeyStatus('idle'), 2000);
                        } catch (e) {
                          setAiKeyStatus('error');
                          setAiKeyError((e as Error).message);
                          toast.error((e as Error).message || 'API key test failed');
                          setTimeout(() => setAiKeyStatus('idle'), 3000);
                        }
  };

  return (
    <DashboardContent>
      <Stack spacing={4}>
        {/* Header */}
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Settings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your account preferences and configuration
          </Typography>
        </Box>

        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
              {tabs.map((tab, index) => (
                <Tab
                  key={index}
                  label={tab.label}
                  icon={<Iconify icon={tab.icon} width={20} />}
                  iconPosition="start"
                />
              ))}
            </Tabs>
          </Box>

          <CardContent sx={{ p: 4 }}>
            {/* Profile Tab */}
            {activeTab === 0 && (
              <Stack spacing={4}>
                <Typography variant="h6" fontWeight={700}>
                  Profile Information
                </Typography>
                <Stack direction="row" spacing={3} alignItems="center">
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: theme.palette.primary.main,
                      fontSize: '2rem',
                    }}
                  >
                    {user?.firstName?.[0]}
                    {user?.lastName?.[0]}
                  </Avatar>
                  <Stack spacing={1}>
                    <Button variant="contained" size="medium">
                      Change Avatar
                    </Button>
                    <Typography variant="caption" color="text.secondary">
                      JPG, GIF or PNG. 1MB max.
                    </Typography>
                  </Stack>
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={user?.firstName || ''}
                    onChange={(e) => handleProfileUpdate('firstName', e.target.value)}
                  />
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={user?.lastName || ''}
                    onChange={(e) => handleProfileUpdate('lastName', e.target.value)}
                  />
                </Stack>
                <TextField
                  fullWidth
                  label="Username"
                  value={user?.username || ''}
                  onChange={(e) => handleProfileUpdate('username', e.target.value)}
                />
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={user?.email || ''}
                  onChange={(e) => handleProfileUpdate('email', e.target.value)}
                />
                <Stack direction="row" justifyContent="flex-end">
                  <Button variant="contained" size="large">
                    Save Changes
                  </Button>
                </Stack>
              </Stack>
            )}

            {/* Billing Tab */}
            {activeTab === 1 && (
              <Stack spacing={4}>
                <Typography variant="h6" fontWeight={700}>
                  Billing & Subscription
                </Typography>
                <Card
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    color: 'white',
                    p: 3,
                  }}
                >
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h6" fontWeight={700} sx={{ color: 'white', mb: 1 }}>
                        {user?.subscription?.name || 'Free'} Plan
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                        ${user?.subscription?.price || 0}/month
                      </Typography>
                    </Box>
                    <Button variant="contained" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}>
                      Upgrade Plan
                    </Button>
                  </Stack>
                </Card>
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Plan Features
                  </Typography>
                  <Stack spacing={1}>
                    {user?.subscription?.features?.map((feature, index) => (
                      <Stack key={index} direction="row" alignItems="center" spacing={1}>
                        <Iconify icon="solar:check-circle-bold-duotone" sx={{ color: 'success.main' }} />
                        <Typography variant="body2">{feature}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Usage
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                        <Typography variant="body2">Products</Typography>
                        <Typography variant="body2" fontWeight={600}>
                          2 / {user?.subscription?.limits?.products === -1 ? '∞' : user?.subscription?.limits?.products}
                        </Typography>
                      </Stack>
                      <LinearProgress variant="determinate" value={40} sx={{ height: 8, borderRadius: 1 }} />
                    </Box>
                    <Box>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                        <Typography variant="body2">Storage</Typography>
                        <Typography variant="body2" fontWeight={600}>
                          2.1 GB / {user?.subscription?.limits?.storage} GB
                        </Typography>
                      </Stack>
                      <LinearProgress variant="determinate" value={21} sx={{ height: 8, borderRadius: 1 }} />
                    </Box>
                  </Stack>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Payment Method
                  </Typography>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Iconify icon="solar:card-bold-duotone" width={24} />
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            •••• •••• •••• 4242
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Expires 12/25
                          </Typography>
                        </Box>
                      </Stack>
                      <Button variant="text" size="small">
                        Update
                      </Button>
                    </Stack>
                  </Card>
                </Box>
              </Stack>
            )}

            {/* Notifications Tab */}
            {activeTab === 2 && (
              <Stack spacing={4}>
                <Typography variant="h6" fontWeight={700}>
                  Notification Preferences
                </Typography>
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Email Notifications
                  </Typography>
                  <Stack spacing={2}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notifications.emailSales}
                          onChange={(e) =>
                            setNotifications((prev) => ({ ...prev, emailSales: e.target.checked }))
                          }
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            Sales notifications
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Get notified when someone purchases your products
                          </Typography>
                        </Box>
                      }
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notifications.emailMarketing}
                          onChange={(e) =>
                            setNotifications((prev) => ({ ...prev, emailMarketing: e.target.checked }))
                          }
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            Marketing emails
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Receive tips, updates, and promotional content
                          </Typography>
                        </Box>
                      }
                    />
                  </Stack>
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Push Notifications
                  </Typography>
                  <Stack spacing={2}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notifications.pushSales}
                          onChange={(e) =>
                            setNotifications((prev) => ({ ...prev, pushSales: e.target.checked }))
                          }
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            Sales notifications
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Real-time notifications for new sales
                          </Typography>
                        </Box>
                      }
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notifications.pushMarketing}
                          onChange={(e) =>
                            setNotifications((prev) => ({ ...prev, pushMarketing: e.target.checked }))
                          }
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            Marketing updates
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Platform updates and feature announcements
                          </Typography>
                        </Box>
                      }
                    />
                  </Stack>
                </Box>
              </Stack>
            )}

            {/* Security Tab */}
            {activeTab === 3 && (
              <Stack spacing={4}>
                <Typography variant="h6" fontWeight={700}>
                  Security Settings
                </Typography>
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Password
                  </Typography>
                  <Button variant="contained" sx={{ mt: 1 }}>
                    Change Password
                  </Button>
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Two-Factor Authentication
                  </Typography>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          SMS Authentication
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Add an extra layer of security to your account
                        </Typography>
                      </Box>
                      <Button variant="contained" color="success">
                        Enable
                      </Button>
                    </Stack>
                  </Card>
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    KYC Status
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Chip
                      label={user?.kycStatus || 'Not Verified'}
                      color={
                        user?.kycStatus === 'verified'
                          ? 'success'
                          : user?.kycStatus === 'pending'
                          ? 'warning'
                          : 'error'
                      }
                    />
                    {user?.kycStatus !== 'verified' && (
                      <Button variant="text" size="small">
                        Complete Verification
                      </Button>
                    )}
                  </Stack>
                </Box>
              </Stack>
            )}

            {/* Domain Tab */}
            {activeTab === 4 && (
              <Stack spacing={4}>
                <Typography variant="h6" fontWeight={700}>
                  Custom Domain
                </Typography>
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Current Domain
                  </Typography>
                  <Card variant="outlined" sx={{ p: 2, bgcolor: alpha(theme.palette.grey[500], 0.08) }}>
                    <Typography variant="body2" fontFamily="monospace">
                      {user?.username}.digiproplat.com
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Your default subdomain
                    </Typography>
                  </Card>
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Custom Domain
                  </Typography>
                  <Stack spacing={2}>
                    <TextField
                      fullWidth
                      placeholder="yourdomain.com"
                      label="Domain"
                    />
                    <Button variant="contained">
                      Connect Domain
                    </Button>
                  </Stack>
                  <Card
                    sx={{
                      mt: 2,
                      p: 2,
                      bgcolor: alpha(theme.palette.info.main, 0.08),
                      border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Setup Instructions
                    </Typography>
                    <Stack component="ol" spacing={1} sx={{ pl: 2 }}>
                      <Typography component="li" variant="body2">
                        Add a CNAME record pointing to digiproplat.com
                      </Typography>
                      <Typography component="li" variant="body2">
                        Wait for DNS propagation (up to 24 hours)
                      </Typography>
                      <Typography component="li" variant="body2">
                        We'll automatically provision SSL certificate
                      </Typography>
                    </Stack>
                  </Card>
                </Box>
              </Stack>
            )}

            {/* AI & OpenAI Tab */}
            {activeTab === 5 && (
              <Stack spacing={4} sx={{ maxWidth: 600 }}>
                <Typography variant="h6" fontWeight={700}>
                  AI & OpenAI Integration
                </Typography>
                <TextField
                  fullWidth
                  label="OpenAI API Key"
                  type={showApiKey ? 'text' : 'password'}
                  value={openAIApiKey}
                  onChange={(e) => setOpenAIApiKey(e.target.value)}
                  placeholder="sk-..."
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowApiKey(!showApiKey)} edge="end">
                          <Iconify icon={showApiKey ? 'solar:eye-closed-bold-duotone' : 'solar:eye-bold-duotone'} />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  helperText="Your key is encrypted and never shared. Required for AI features."
                />
                {!openAIApiKey && (
                  <Typography variant="caption" color="error">
                    No API key set. Please add your OpenAI key to use AI features.
                  </Typography>
                )}
                <FormControl fullWidth>
                  <InputLabel>OpenAI Model</InputLabel>
                  <Select
                    value={openAIModel}
                    label="OpenAI Model"
                    onChange={(e) => setOpenAIModel(e.target.value)}
                  >
                    {openAIModels.map((model) => (
                      <MenuItem key={model.value} value={model.value}>
                        {model.label}
                      </MenuItem>
                    ))}
                  </Select>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                    Choose your preferred model for AI features.
                  </Typography>
                </FormControl>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    onClick={handleSaveAIKey}
                    disabled={aiKeyStatus !== 'idle'}
                    startIcon={
                      aiKeyStatus === 'saving' ? (
                        <Iconify icon="solar:loading-bold-duotone" width={20} />
                      ) : null
                    }
                  >
                    Save Key
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleRemoveAIKey}
                    disabled={aiKeyStatus !== 'idle'}
                    startIcon={
                      aiKeyStatus === 'saving' ? (
                        <Iconify icon="solar:loading-bold-duotone" width={20} />
                      ) : null
                    }
                  >
                    Remove Key
                  </Button>
                  <Button
                    variant="outlined"
                    color="info"
                    onClick={handleTestAIKey}
                    disabled={aiKeyStatus !== 'idle'}
                    startIcon={
                      aiKeyStatus === 'testing' ? (
                        <Iconify icon="solar:loading-bold-duotone" width={20} />
                      ) : null
                    }
                  >
                      Test Key
                  </Button>
                </Stack>
                  {aiKeyStatus === 'success' && (
                  <Typography variant="body2" color="success.main">
                    Success!
                  </Typography>
                  )}
                  {aiKeyStatus === 'error' && aiKeyError && (
                  <Typography variant="body2" color="error.main">
                    {aiKeyError}
                  </Typography>
                )}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Stack>
    </DashboardContent>
  );
};
