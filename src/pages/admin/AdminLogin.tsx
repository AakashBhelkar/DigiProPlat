import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { z as zod } from 'zod';
import LinkMui from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import { useAdminStore } from '../../store/adminStore';
import { Iconify } from '../../components/iconify';
import { Form, Field } from '../../components/hook-form';
import { AuthSplitLayout } from '../../layouts/auth-split';

// ----------------------------------------------------------------------

const SignInSchema = zod.object({
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
  password: zod
    .string()
    .min(1, { message: 'Password is required!' })
    .min(6, { message: 'Password must be at least 6 characters!' }),
});

// ----------------------------------------------------------------------

export const AdminLogin: React.FC = () => {
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAdminStore();
  const navigate = useNavigate();

  const defaultValues = {
    email: '',
    password: '',
  };

  const methods = useForm({
    resolver: zodResolver(SignInSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      setErrorMsg('');
      await login(data.email, data.password);
      navigate('/admin/dashboard');
    } catch (error: unknown) {
      console.error('Admin login failed:', error);
      if (error instanceof Error) {
        setErrorMsg(error.message || 'Login failed. Please try again.');
      } else {
        setErrorMsg('Login failed. Please try again.');
      }
    }
  });

  const renderHead = (
    <Stack spacing={1.5} sx={{ mb: 5 }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Avatar
          sx={{
            bgcolor: 'primary.main',
            width: 64,
            height: 64,
          }}
        >
          <Iconify icon="solar:shield-check-bold-duotone" width={32} />
        </Avatar>
        <Box>
          <Typography variant="h5">Admin Portal</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Sign in to access the admin dashboard
          </Typography>
        </Box>
      </Stack>

      <Card variant="outlined" sx={{ bgcolor: 'info.lighter', borderColor: 'info.light', p: 2 }}>
        <Typography variant="subtitle2" fontWeight={700} gutterBottom>
          Demo Credentials
        </Typography>
        <Stack spacing={0.5}>
          <Typography variant="body2">
            <strong>Email:</strong> admin@digiproplat.com
          </Typography>
          <Typography variant="body2">
            <strong>Password:</strong> password
          </Typography>
        </Stack>
      </Card>
    </Stack>
  );

  const renderForm = (
    <Stack spacing={3}>
      <Field.Text name="email" label="Email address" InputLabelProps={{ shrink: true }} />

      <Field.Text
        name="password"
        label="Password"
        placeholder="6+ characters"
        type={showPassword ? 'text' : 'password'}
        InputLabelProps={{ shrink: true }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Button
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        disabled={isSubmitting || isLoading}
        startIcon={isSubmitting || isLoading ? <CircularProgress size={20} /> : null}
      >
        {isSubmitting || isLoading ? 'Signing in...' : 'Sign in'}
      </Button>
    </Stack>
  );

  return (
    <AuthSplitLayout
      section={{
        title: 'Admin Portal',
        subtitle: 'Secure access to platform administration',
      }}
    >
      {renderHead}

      {!!errorMsg && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMsg}
        </Alert>
      )}

      <Form methods={methods} onSubmit={onSubmit}>
        {renderForm}
      </Form>

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Authorized personnel only. All activities are logged.
        </Typography>
      </Box>
    </AuthSplitLayout>
  );
};
