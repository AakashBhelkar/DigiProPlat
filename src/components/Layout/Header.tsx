import React, { useState } from 'react';
import { Search, User, LogOut, Menu, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { NotificationCenter } from '../Notifications/NotificationCenter';
import { Link } from 'react-router-dom';

export const Header: React.FC = () => {
  const { user, logout } = useAuthStore();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Mock notifications data - in real app this would come from a store
  const mockNotifications = [
    {
      id: '1',
      type: 'sale' as const,
      title: 'New Sale!',
      message: 'Someone purchased your "Social Media Templates" for $29.99',
      isRead: false,
      isImportant: true,
      actionUrl: '/orders',
      actionText: 'View Order',
      createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      metadata: { orderId: 'ord_123', amount: 29.99 }
    },
    {
      id: '2',
      type: 'payment' as const,
      title: 'Payment Received',
      message: 'Your earnings of $125.50 have been processed',
      isRead: false,
      isImportant: false,
      actionUrl: '/wallet',
      actionText: 'View Wallet',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      metadata: { amount: 125.50 }
    },
    {
      id: '3',
      type: 'system' as const,
      title: 'Profile Update',
      message: 'Your KYC verification has been approved',
      isRead: true,
      isImportant: false,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: {}
    }
  ];

  const unreadCount = mockNotifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = (id: string) => {
    console.log('Mark as read:', id);
  };

  const handleMarkAllAsRead = () => {
    console.log('Mark all as read');
  };

  const handleDeleteNotification = (id: string) => {
    console.log('Delete notification:', id);
  };

  const handleClearAll = () => {
    console.log('Clear all notifications');
  };

  const handleNotificationAction = (notification: Notification) => {
    console.log('Notification action:', notification);
    // Navigate to action URL
  };

  // Navigation links for the drawer
  const navLinks = [
    { to: '/', label: 'Dashboard' },
    { to: '/products', label: 'Products' },
    { to: '/orders', label: 'Orders' },
    { to: '/analytics', label: 'Analytics' },
    { to: '/wallet', label: 'Wallet' },
    { to: '/settings', label: 'Settings' },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 relative z-50">
      {/* Mobile Drawer Overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 lg:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}
      {/* Mobile Drawer */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 lg:hidden
          ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
          <span className="text-lg font-bold text-indigo-600">DigiProPlat</span>
          <button onClick={() => setDrawerOpen(false)} className="p-2 rounded-md hover:bg-gray-100">
            <X className="h-6 w-6 text-gray-700" />
          </button>
        </div>
        <nav className="flex flex-col space-y-2 p-4">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className="text-gray-700 px-3 py-2 rounded-md hover:bg-indigo-50 text-base font-medium"
              onClick={() => setDrawerOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-gray-200 mt-4 p-4">
          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <LogOut className="mr-3 h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Hamburger for mobile */}
          <div className="flex items-center lg:hidden">
            <button
              className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6 text-gray-700" />
            </button>
          </div>
          {/* Search bar (hidden on mobile) */}
          <div className="hidden lg:flex items-center">
            <div className="max-w-xs w-full lg:max-w-xs">
              <label htmlFor="search" className="sr-only">Search</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="search"
                  name="search"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Search products, pages..."
                  type="search"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <NotificationCenter
              notifications={mockNotifications}
              unreadCount={unreadCount}
              onMarkAsRead={handleMarkAsRead}
              onMarkAllAsRead={handleMarkAllAsRead}
              onDeleteNotification={handleDeleteNotification}
              onClearAll={handleClearAll}
              onNotificationAction={handleNotificationAction}
            />

            <div className="relative group">
              <button className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50">
                <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {/* Robust initials fallback */}
                    {(user?.firstName?.[0] || user?.email?.[0] || '').toUpperCase()}{(user?.lastName?.[0] || '')}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700">{user?.firstName || user?.email || 'Loading...'}</span>
              </button>

              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <Link to="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <User className="mr-3 h-4 w-4" />
                  Profile
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};