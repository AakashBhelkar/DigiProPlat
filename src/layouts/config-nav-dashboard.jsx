import { Iconify } from '../components/iconify';

// ----------------------------------------------------------------------

const icon = (name) => <Iconify icon={name} width={24} />;

const ICONS = {
  dashboard: icon('solar:chart-2-bold-duotone'),
  products: icon('solar:box-bold-duotone'),
  orders: icon('solar:cart-large-2-bold-duotone'),
  pages: icon('solar:global-bold-duotone'),
  marketplace: icon('solar:shop-2-bold-duotone'),
  analytics: icon('solar:chart-bold-duotone'),
  wallet: icon('solar:wallet-money-bold-duotone'),
  ai: icon('solar:magic-stick-3-bold-duotone'),
  kyc: icon('solar:shield-check-bold-duotone'),
  settings: icon('solar:settings-bold-duotone'),
};

// ----------------------------------------------------------------------

export const navData = [
  {
    subheader: 'Main',
    items: [
      { title: 'Dashboard', path: '/dashboard', icon: ICONS.dashboard },
      { title: 'Products', path: '/products', icon: ICONS.products },
      { title: 'Orders', path: '/orders', icon: ICONS.orders },
      { title: 'Landing Pages', path: '/pages', icon: ICONS.pages },
      { title: 'Marketplace', path: '/marketplace', icon: ICONS.marketplace },
    ],
  },
  {
    subheader: 'Analytics & Tools',
    items: [
      { title: 'Analytics', path: '/analytics', icon: ICONS.analytics },
      { title: 'Wallet', path: '/wallet', icon: ICONS.wallet },
      { title: 'AI Assistant', path: '/ai', icon: ICONS.ai },
      { title: 'KYC Verification', path: '/kyc', icon: ICONS.kyc },
    ],
  },
  {
    subheader: 'Settings',
    items: [
      { title: 'Settings', path: '/settings', icon: ICONS.settings },
    ],
  },
];
