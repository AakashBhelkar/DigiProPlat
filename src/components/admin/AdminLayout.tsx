import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../layouts/dashboard';
import { useAdminStore } from '../../store/adminStore';
import { navData } from '../../layouts/config-nav-admin';

export const AdminLayout: React.FC = () => {
  const { isAuthenticated } = useAdminStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <DashboardLayout data={{ nav: navData }}>
      <Outlet />
    </DashboardLayout>
  );
};
