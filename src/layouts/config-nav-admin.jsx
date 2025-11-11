import { Iconify } from '../components/iconify';

// ----------------------------------------------------------------------

const icon = (name) => <Iconify icon={name} width={24} />;

const ICONS = {
  dashboard: icon('solar:chart-2-bold-duotone'),
  users: icon('solar:users-group-two-rounded-bold-duotone'),
  products: icon('solar:box-bold-duotone'),
  moderation: icon('solar:shield-check-bold-duotone'),
  analytics: icon('solar:chart-bold-duotone'),
  logs: icon('solar:document-text-bold-duotone'),
  reports: icon('solar:file-text-bold-duotone'),
  settings: icon('solar:settings-bold-duotone'),
};

// ----------------------------------------------------------------------

export const navData = [
  {
    subheader: 'Main',
    items: [
      { title: 'Dashboard', path: '/admin/dashboard', icon: ICONS.dashboard },
      { title: 'Users', path: '/admin/users', icon: ICONS.users },
      { title: 'Products', path: '/admin/products', icon: ICONS.products },
      { title: 'Content Moderation', path: '/admin/moderation', icon: ICONS.moderation },
    ],
  },
  {
    subheader: 'Analytics & Reports',
    items: [
      { title: 'Analytics', path: '/admin/analytics', icon: ICONS.analytics },
      { title: 'System Logs', path: '/admin/logs', icon: ICONS.logs },
      { title: 'Reports', path: '/admin/reports', icon: ICONS.reports },
    ],
  },
  {
    subheader: 'Settings',
    items: [
      { title: 'System Settings', path: '/admin/settings', icon: ICONS.settings },
    ],
  },
];
