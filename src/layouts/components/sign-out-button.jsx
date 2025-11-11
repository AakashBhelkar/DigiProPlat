import { useCallback } from 'react';

import Button from '@mui/material/Button';

import { useRouter } from 'src/routes/hooks';

import { useAuthStore } from 'src/store/authStore';

// ----------------------------------------------------------------------

export function SignOutButton({ onClose, ...other }) {
  const router = useRouter();

  const { logout } = useAuthStore();

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      onClose?.();
      router.push('/login');
    } catch (error) {
      console.error(error);
    }
  }, [logout, onClose, router]);

  return (
    <Button fullWidth variant="soft" size="large" color="error" onClick={handleLogout} {...other}>
      Logout
    </Button>
  );
}
