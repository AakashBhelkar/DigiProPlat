import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import '@fontsource/public-sans';
import '@fontsource/barlow';
import { ThemeProvider } from './theme/theme-provider';
import { SettingsProvider, defaultSettings, SettingsDrawer } from './components/settings';
import { useAuthStore } from './store/authStore';
import { useAdminStore } from './store/adminStore';
import { useProductStore } from './store/productStore';
import { usePageBuilderStore } from './store/pageBuilderStore';
import { Layout } from './components/Layout/Layout';
import { AdminLayout } from './components/admin/AdminLayout';
import { LoginForm } from './components/Auth/LoginForm';
import { RegisterForm } from './components/Auth/RegisterForm';
import { AuthSplitLayout } from './layouts/auth-split';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminDashboardNew } from './pages/admin/AdminDashboardNew';
import { UserManagement } from './pages/admin/UserManagement';
import { ProductManagement } from './pages/admin/ProductManagement';
import { ContentModeration } from './pages/admin/ContentModeration';
import { AdminAnalytics } from './pages/admin/AdminAnalytics';
import { SystemSettings } from './pages/admin/SystemSettings';
import { SystemLogs } from './pages/admin/SystemLogs';
import { Dashboard } from './pages/Dashboard';
import { DashboardNew } from './pages/DashboardNew';
import { Products } from './pages/Products';
import { ProductUploadNew } from './pages/ProductUploadNew';
import { HomeNew } from './pages/HomeNew';
import { PageBuilder } from './pages/PageBuilder';
import { MarketplaceNew } from './pages/MarketplaceNew';
import { Analytics } from './pages/Analytics';
import { Wallet } from './pages/Wallet';
import { AIAssistant } from './pages/AIAssistant';
import { Settings } from './pages/Settings';
import { Orders } from './pages/Orders';
import { KYCVerificationPage } from './pages/KYCVerification';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  
  // Wait for auth check to complete before redirecting
  if (isLoading) {
    return null; // or a loading spinner
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const AdminProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAdminStore();
  
  // Wait for auth check to complete before redirecting
  if (isLoading) {
    return null; // or a loading spinner
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/admin/login" replace />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  
  // Wait for auth check to complete before redirecting
  if (isLoading) {
    return null; // or a loading spinner
  }
  
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

function App() {
  const { checkAuth, isAuthenticated } = useAuthStore();
  const { fetchProducts } = useProductStore();
  const { fetchPages } = usePageBuilderStore();
  const { globalDesign } = usePageBuilderStore();

  // Force light mode - clear any dark mode preferences from localStorage
  useEffect(() => {
    // Clear MUI theme mode storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('theme-mode');
      localStorage.setItem('theme-mode', 'light');
      
      // Clear app settings dark mode preference
      const appSettings = localStorage.getItem('app-settings');
      if (appSettings) {
        try {
          const settings = JSON.parse(appSettings);
          if (settings.colorScheme === 'dark') {
            settings.colorScheme = 'light';
            localStorage.setItem('app-settings', JSON.stringify(settings));
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
      
      // Force light mode on document
      document.documentElement.setAttribute('data-mui-color-scheme', 'light');
      document.documentElement.style.colorScheme = 'light';
    }
  }, []);

  // Check auth only once on mount
  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch data when authenticated, but only once per auth state change
  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts();
      fetchPages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Inject global CSS variables for theming
  useEffect(() => {
    if (!globalDesign) return;
    const root = document.documentElement;
    const palette = globalDesign.colorPalette;
    root.style.setProperty('--color-primary', palette.primary);
    root.style.setProperty('--color-secondary', palette.secondary);
    root.style.setProperty('--color-accent', palette.accent);
    root.style.setProperty('--color-background', palette.background);
    root.style.setProperty('--color-text', palette.text);
    root.style.setProperty('--color-success', palette.success);
    root.style.setProperty('--color-warning', palette.warning);
    root.style.setProperty('--color-error', palette.error);
    // Button styles
    const btn = globalDesign.buttonStyles;
    root.style.setProperty('--button-color', btn.color);
    root.style.setProperty('--button-hover-color', btn.hoverColor);
    root.style.setProperty('--button-font', btn.font);
    root.style.setProperty('--button-shadow', btn.shadow ? '0 2px 8px rgba(0,0,0,0.10)' : 'none');
    root.style.setProperty('--button-border-radius', btn.borderRadius + 'px');
    root.style.setProperty('--button-border-color', btn.borderColor);
    root.style.setProperty('--button-border-width', btn.borderWidth + 'px');
    // Background
    root.style.setProperty('--global-background', palette.background);
    root.style.setProperty('--global-text', palette.text);
  }, [globalDesign]);

  return (
    <SettingsProvider settings={defaultSettings}>
      <ThemeProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            <Route path="/" element={<HomeNew />} />

            {/* Public Routes */}
            <Route path="/login" element={
              <PublicRoute>
                <AuthSplitLayout
                  section={{
                    title: 'Welcome back',
                    subtitle: 'Sign in to your account to continue',
                  }}
                >
                  <LoginForm />
                </AuthSplitLayout>
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <AuthSplitLayout
                  section={{
                    title: 'Get started',
                    subtitle: 'Create your account to get started',
                  }}
                >
                  <RegisterForm />
                </AuthSplitLayout>
              </PublicRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            }>
              <Route index element={<AdminDashboardNew />} />
              <Route path="dashboard" element={<AdminDashboardNew />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="products" element={<ProductManagement />} />
              <Route path="moderation" element={<ContentModeration />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="logs" element={<SystemLogs />} />
              <Route path="reports" element={<div>Reports Management</div>} />
              <Route path="settings" element={<SystemSettings />} />
            </Route>

            {/* Protected User Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<DashboardNew />} />
              <Route path="products" element={<Products />} />
              <Route path="products/upload" element={<ProductUploadNew />} />
              <Route path="orders" element={<Orders />} />
              <Route path="pages" element={<PageBuilder />} />
              <Route path="pages/builder/:id?" element={<PageBuilder />} />
              <Route path="marketplace" element={<MarketplaceNew />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="wallet" element={<Wallet />} />
              <Route path="ai" element={<AIAssistant />} />
              <Route path="kyc" element={<KYCVerificationPage />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
          <Toaster position="top-right" />
          <SettingsDrawer hideColorScheme hideNavLayout />
        </Router>
      </ThemeProvider>
    </SettingsProvider>
  );
}

export default App;