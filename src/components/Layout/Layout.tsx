import React from 'react';
import { Outlet } from 'react-router-dom';
import { DashboardLayout } from '../../layouts/dashboard';

export const Layout: React.FC = () => {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
};
