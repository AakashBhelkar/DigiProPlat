import React, { useState } from 'react';
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

const SignUpSchema = zod.object({
  firstName: zod.string().min(1, { message: 'First name is required!' }),
  lastName: zod.string().min(1, { message: 'Last name is required!' }),
  username: zod.string().min(3, { message: 'Username must be at least 3 characters!' }),
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
  password: zod
    .string()
    .min(1, { message: 'Password is required!' })
    .min(8, { message: 'Password must be at least 8 characters!' }),
  confirmPassword: zod
    .string()
    .min(1, { message: 'Please confirm your password!' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// ----------------------------------------------------------------------

const fieldStyles = {
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
    color: '#1C252E',
    fontSize: '0.9375rem',
    fontWeight: 500,
    '&.Mui-focused': {
      color: '#1a1f3a',
      fontWeight: 600,
    },
  },
  '& .MuiInputBase-input': {
    color: '#1C252E',
    fontSize: '0.9375rem',
    fontWeight: 400,
    '&::placeholder': {
      color: '#9CA3AF',
      opacity: 1,
    },
  },
};

// ----------------------------------------------------------------------

export const RegisterForm: React.FC = () => {
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: registerUser, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const defaultValues = {
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  };

  const methods = useForm({
    resolver: zodResolver(SignUpSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      setErrorMsg('');
      await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
        email: data.email,
        password: data.password,
      });
      // Navigate to login after successful registration
      navigate('/login', { replace: true });
    } catch (error: unknown) {
      console.error('Registration failed:', error);
      if (error instanceof Error) {
        setErrorMsg(error.message || 'Registration failed. Please try again.');
      } else {
        setErrorMsg('Registration failed. Please try again.');
      }
    }
  });

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 480,
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
          Get started absolutely free
        </Typography>

        <Stack direction="row" spacing={0.5} alignItems="center">
          <Typography variant="body2" sx={{ color: '#637381' }}>
            Already have an account?
          </Typography>
          <LinkMui
            component={Link}
            to="/login"
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
            Sign in
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
          {/* First Name and Last Name - Side by Side */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{
              '& > *': {
                flex: { sm: 1 },
              },
            }}
          >
            <Field.Text
              name="firstName"
              label="First name"
              InputLabelProps={{ shrink: true }}
              sx={fieldStyles}
            />
            <Field.Text
              name="lastName"
              label="Last name"
              InputLabelProps={{ shrink: true }}
              sx={fieldStyles}
            />
          </Stack>

          {/* Username */}
          <Field.Text
            name="username"
            label="Username"
            InputLabelProps={{ shrink: true }}
            sx={fieldStyles}
          />

          {/* Email */}
          <Field.Text
            name="email"
            label="Email address"
            InputLabelProps={{ shrink: true }}
            sx={fieldStyles}
          />

          {/* Password */}
          <Field.Text
            name="password"
            label="Password"
            placeholder="8+ characters"
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
            sx={fieldStyles}
          />

          {/* Confirm Password */}
          <Field.Text
            name="confirmPassword"
            label="Confirm Password"
            placeholder="Confirm your password"
            type={showConfirmPassword ? 'text' : 'password'}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                      icon={showConfirmPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                      width={20}
                    />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={fieldStyles}
          />

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
            {isSubmitting || isLoading ? 'Creating account...' : 'Create account'}
          </Button>
        </Stack>
      </Form>

      {/* Terms and Conditions */}
      <Typography
        component="div"
        sx={{
          mt: 4,
          textAlign: 'center',
          fontSize: '0.875rem',
          color: '#637381',
          lineHeight: 1.6,
        }}
      >
        {'By signing up, I agree to '}
        <LinkMui
          underline="always"
          component={Link}
          to="#"
          sx={{
            color: '#1a1f3a',
            fontWeight: 500,
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
        >
          Terms of service
        </LinkMui>
        {' and '}
        <LinkMui
          underline="always"
          component={Link}
          to="#"
          sx={{
            color: '#1a1f3a',
            fontWeight: 500,
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
        >
          Privacy policy
        </LinkMui>
        .
      </Typography>
    </Box>
  );
};
