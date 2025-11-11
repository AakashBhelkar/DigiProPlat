import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
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
import { useAuthStore } from '../../store/authStore';
import { Iconify } from '../iconify';
import { Form, Field } from '../hook-form';

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

export const LoginForm: React.FC = () => {
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  // Redirect if already authenticated - only after loading completes
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isLoading]);

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
      // Wait a bit for state to update, then navigate
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 200);
    } catch (error: unknown) {
      console.error('Login failed:', error);
      if (error instanceof Error) {
        // Provide user-friendly error messages
        if (error.message?.includes('Invalid login credentials')) {
          setErrorMsg('Invalid email or password. Please check your credentials and try again.');
        } else if (error.message?.includes('Email not confirmed')) {
          setErrorMsg('Please check your email and click the confirmation link before signing in.');
        } else if (error.message?.includes('Too many requests')) {
          setErrorMsg('Too many login attempts. Please wait a few minutes before trying again.');
        } else {
          setErrorMsg(error.message || 'Login failed. Please try again or contact support if the problem persists.');
        }
      } else {
        setErrorMsg('Login failed. Please try again or contact support if the problem persists.');
      }
    }
  });

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 420,
        mx: 'auto',
      }}
    >
      {/* Header Section */}
      <Stack spacing={2} sx={{ mb: 5 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: '#1C252E',
            letterSpacing: '-0.5px',
          }}
        >
          Sign in to your account
        </Typography>

        <Stack direction="row" spacing={0.5} alignItems="center">
          <Typography variant="body2" sx={{ color: '#637381' }}>
            Don't have an account?
          </Typography>
          <LinkMui
            component={Link}
            to="/register"
            variant="subtitle2"
            sx={{
              color: '#1a1f3a',
              fontWeight: 600,
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            Get started
          </LinkMui>
        </Stack>
      </Stack>

      {/* Error Message */}
      {!!errorMsg && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            borderRadius: 2,
            backgroundColor: '#FEE4E2',
            color: '#D92D20',
            '& .MuiAlert-icon': {
              color: '#D92D20',
            },
          }}
        >
          {errorMsg}
        </Alert>
      )}

      {/* Form */}
      <Form methods={methods} onSubmit={onSubmit}>
        <Stack spacing={3}>
          {/* Email Field */}
          <Field.Text
            name="email"
            label="Email address"
            InputLabelProps={{ shrink: true }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#FFFFFF',
                borderRadius: 2,
                '& fieldset': {
                  borderColor: '#E5E7EB',
                },
                '&:hover fieldset': {
                  borderColor: '#9CA3AF',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#1a1f3a',
                  borderWidth: 2,
                },
              },
              '& .MuiInputLabel-root': {
                color: '#637381',
                '&.Mui-focused': {
                  color: '#1a1f3a',
                },
              },
              '& .MuiInputBase-input': {
                color: '#1C252E',
                '&::placeholder': {
                  color: '#9CA3AF',
                  opacity: 1,
                },
              },
            }}
          />

          {/* Password Field */}
          <Stack spacing={1.5}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box /> {/* Spacer */}
              <LinkMui
                component={Link}
                to="#"
                variant="body2"
                sx={{
                  color: '#1a1f3a',
                  fontWeight: 500,
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Forgot password?
              </LinkMui>
            </Stack>

            <Field.Text
              name="password"
              label="Password"
              placeholder="6+ characters"
              type={showPassword ? 'text' : 'password'}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{
                        color: '#637381',
                        '&:hover': {
                          backgroundColor: 'transparent',
                          color: '#1a1f3a',
                        },
                      }}
                    >
                      <Iconify
                        icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                        width={20}
                      />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#FFFFFF',
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: '#E5E7EB',
                  },
                  '&:hover fieldset': {
                    borderColor: '#9CA3AF',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1a1f3a',
                    borderWidth: 2,
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#637381',
                  '&.Mui-focused': {
                    color: '#1a1f3a',
                  },
                },
                '& .MuiInputBase-input': {
                  color: '#1C252E',
                  '&::placeholder': {
                    color: '#9CA3AF',
                    opacity: 1,
                  },
                },
              }}
            />
          </Stack>

          {/* Submit Button */}
          <Button
            fullWidth
            size="large"
            type="submit"
            variant="contained"
            disabled={isSubmitting || isLoading}
            sx={{
              mt: 2,
              py: 1.5,
              backgroundColor: '#1a1f3a',
              color: '#FFFFFF',
              fontWeight: 600,
              fontSize: '1rem',
              borderRadius: 2,
              textTransform: 'none',
              boxShadow: '0 2px 8px rgba(26, 31, 58, 0.15)',
              '&:hover': {
                backgroundColor: '#2d3550',
                boxShadow: '0 4px 12px rgba(26, 31, 58, 0.25)',
              },
              '&:disabled': {
                backgroundColor: '#9CA3AF',
                color: '#FFFFFF',
              },
            }}
            startIcon={
              isSubmitting || isLoading ? (
                <CircularProgress size={20} sx={{ color: '#FFFFFF' }} />
              ) : null
            }
          >
            {isSubmitting || isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </Stack>
      </Form>
    </Box>
  );
};
