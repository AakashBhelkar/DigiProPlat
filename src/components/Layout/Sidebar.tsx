import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Globe, 
  BarChart3, 
  Wallet, 
  Settings,
  Store,
  Zap,
  ShoppingCart,
  Shield
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Orders', href: '/orders', icon: ShoppingCart },
  { name: 'Landing Pages', href: '/pages', icon: Globe },
  { name: 'Marketplace', href: '/marketplace', icon: Store },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Wallet', href: '/wallet', icon: Wallet },
  { name: 'AI Assistant', href: '/ai', icon: Zap },
  { name: 'KYC Verification', href: '/kyc', icon: Shield },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <div className="hidden lg:flex flex-col w-52 bg-gray-900 text-white min-w-[13rem]">
      <div className="flex items-center justify-center h-14 bg-gray-800">
        <h1 className="text-lg font-bold tracking-tight">DigiProPlat</h1>
      </div>
      <div className="flex-1 flex flex-col pt-3 pb-2 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-3 mb-4">
          <div className="flex-shrink-0">
            <div className="w-9 h-9 bg-indigo-500 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium">
                {(user?.firstName?.[0] || user?.email?.[0] || '').toUpperCase()}{(user?.lastName?.[0] || '')}
              </span>
            </div>
          </div>
          <div className="ml-2">
            <p className="text-xs font-medium truncate">{user?.firstName || user?.email || 'Loading...'} {user?.lastName || ''}</p>
            <p className="text-[11px] text-gray-400 capitalize">{user?.subscription.name} Plan</p>
          </div>
        </div>
        <nav className="mt-2 flex-1 px-1 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `group flex items-center px-2 py-2 text-[15px] font-medium rounded-md transition-colors gap-2 ${
                  isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`
              }
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">{item.name}</span>
            </NavLink>
          ))}
        </nav>
        <div className="flex-shrink-0 px-3 py-3 border-t border-gray-700 mt-2">
          <div className="bg-indigo-600 rounded-lg p-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-indigo-200">Wallet</p>
                <p className="text-base font-semibold">${user?.walletBalance?.toFixed(2)}</p>
              </div>
              <Wallet className="h-5 w-5 text-indigo-200" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};