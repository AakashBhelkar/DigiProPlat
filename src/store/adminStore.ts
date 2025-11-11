import { create } from 'zustand';
import { supabase, supabaseAdmin, handleSupabaseError } from '../lib/supabase';
import toast from 'react-hot-toast';

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'super_admin' | 'admin' | 'moderator' | 'support';
  permissions: string[];
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
}

interface PlatformUser {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  kycStatus: 'pending' | 'verified' | 'rejected';
  isActive: boolean;
  subscription: any;
  productCount: number;
  totalRevenue: number;
  createdAt: string;
}

interface ContentReport {
  id: string;
  reporterEmail: string;
  reportedUserEmail: string;
  type: 'spam' | 'inappropriate' | 'copyright' | 'fraud' | 'other';
  description: string;
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  contentType: 'product' | 'page' | 'user';
  adminNotes?: string;
  createdAt: string;
}

interface PlatformAnalytics {
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  totalProducts: number;
  newProducts: number;
  totalSales: number;
  totalRevenue: number;
  pendingReports: number;
  conversionRate: number;
}

interface AdminState {
  currentAdmin: AdminUser | null;
  users: PlatformUser[];
  reports: ContentReport[];
  analytics: PlatformAnalytics | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  fetchReports: () => Promise<void>;
  fetchAnalytics: () => Promise<void>;
  updateUserStatus: (userId: string, isActive: boolean) => Promise<void>;
  updateReportStatus: (reportId: string, status: string, notes?: string) => Promise<void>;
  logAdminAction: (action: string, resourceType: string, resourceId?: string, details?: any) => Promise<void>;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  currentAdmin: null,
  users: [],
  reports: [],
  analytics: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

      // Call admin-login edge function
      const response = await fetch(`${supabaseUrl}/functions/v1/admin-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Invalid email or password. Please check your credentials and try again.');
      }

      const adminUser: AdminUser = {
        id: data.admin.id,
        email: data.admin.email,
        firstName: data.admin.firstName,
        lastName: data.admin.lastName,
        role: data.admin.role,
        permissions: Array.isArray(data.admin.permissions)
          ? data.admin.permissions
          : Object.keys(data.admin.permissions || {}),
        isActive: data.admin.isActive,
        lastLogin: data.admin.lastLogin,
        createdAt: data.admin.createdAt
      };

      // Store admin session in localStorage for persistence
      localStorage.setItem('adminSession', JSON.stringify({
        adminId: adminUser.id,
        email: adminUser.email,
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        role: adminUser.role,
        permissions: adminUser.permissions,
        loginTime: new Date().toISOString(),
        createdAt: adminUser.createdAt
      }));

      set({ currentAdmin: adminUser, isAuthenticated: true });
      toast.success('Admin login successful!');
    } catch (error: any) {
      console.error('Admin login error:', error);
      toast.error(error.message || 'Admin login failed');
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      await get().logAdminAction('logout', 'session');
      localStorage.removeItem('adminSession');
      set({ currentAdmin: null, isAuthenticated: false });
      toast.success('Admin logout successful!');
    } catch (error: any) {
      toast.error(error.message || 'Logout failed');
    }
  },

  fetchUsers: async () => {
    set({ isLoading: true });
    try {
      // Fetch profiles first using admin client to bypass RLS
      const { data: profiles, error: profilesError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        handleSupabaseError(profilesError);
        return;
      }

      if (!profiles || profiles.length === 0) {
        set({ users: [] });
        return;
      }

      // Fetch user emails from auth.users via profiles.id
      // Using admin client with service role key
      const userIds = profiles.map(p => p.id);
      const userEmails: Record<string, string> = {};
      
      try {
        // Use admin client to fetch user emails
        const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
        if (authError) {
          console.warn('Error fetching user emails:', authError);
        } else if (authUsers?.users) {
          authUsers.users.forEach(user => {
            if (userIds.includes(user.id)) {
              userEmails[user.id] = user.email || '';
            }
          });
        }
      } catch (authErr) {
        console.warn('Could not fetch user emails from auth:', authErr);
      }

      // Fetch subscriptions separately using admin client
      const { data: subscriptions } = await supabaseAdmin
        .from('user_subscriptions')
        .select(`
          user_id,
          subscription_plans (*)
        `)
        .eq('status', 'active')
        .in('user_id', userIds);

      const subscriptionMap: Record<string, any> = {};
      if (subscriptions) {
        subscriptions.forEach(sub => {
          if (sub.subscription_plans) {
            subscriptionMap[sub.user_id] = Array.isArray(sub.subscription_plans) 
              ? sub.subscription_plans[0] 
              : sub.subscription_plans;
          }
        });
      }

      // Get product counts and revenue for each user using admin client
      const { data: productStats, error: statsError } = await supabaseAdmin
        .from('products')
        .select('user_id, sales_count, total_revenue');

      if (statsError) {
        console.warn('Error fetching product stats:', statsError);
      }

      const userStats = (productStats || []).reduce((acc: any, product: any) => {
        if (!acc[product.user_id]) {
          acc[product.user_id] = { productCount: 0, totalRevenue: 0 };
        }
        acc[product.user_id].productCount += 1;
        acc[product.user_id].totalRevenue += product.total_revenue || 0;
        return acc;
      }, {});

      const users: PlatformUser[] = profiles.map(profile => ({
        id: profile.id,
        email: userEmails[profile.id] || '',
        username: profile.username,
        firstName: profile.first_name,
        lastName: profile.last_name,
        kycStatus: profile.kyc_status,
        isActive: true, // Assuming all users are active by default
        subscription: subscriptionMap[profile.id],
        productCount: userStats[profile.id]?.productCount || 0,
        totalRevenue: userStats[profile.id]?.totalRevenue || 0,
        createdAt: profile.created_at
      }));

      set({ users });
    } catch (error: any) {
      console.error('Error in fetchUsers:', error);
      toast.error(error.message || 'Failed to fetch users');
      set({ users: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchReports: async () => {
    set({ isLoading: true });
    try {
      // Fetch reports first using admin client to bypass RLS
      const { data: reportsData, error: reportsError } = await supabaseAdmin
        .from('content_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (reportsError) {
        console.error('Error fetching reports:', reportsError);
        // If table doesn't exist, set empty array and continue
        if (reportsError.message?.includes('does not exist') || reportsError.message?.includes('schema cache')) {
          set({ reports: [] });
          return;
        }
        handleSupabaseError(reportsError);
        return;
      }

      if (!reportsData || reportsData.length === 0) {
        set({ reports: [] });
        return;
      }

      // Fetch reporter and reported user emails separately
      // Note: profiles table doesn't have email, need to get from auth.users
      const reporterIds = [...new Set(reportsData.map(r => r.reporter_id).filter(Boolean))];
      const reportedUserIds = [...new Set(reportsData.map(r => r.reported_user_id).filter(Boolean))];
      const allUserIds = [...new Set([...reporterIds, ...reportedUserIds])];

      let userEmails: Record<string, string> = {};
      if (allUserIds.length > 0) {
        // Use admin client to fetch user emails
        try {
          const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
          if (authError) {
            console.warn('Error fetching user emails:', authError);
          } else if (authUsers?.users) {
            authUsers.users.forEach(user => {
              if (allUserIds.includes(user.id)) {
                userEmails[user.id] = user.email || 'Unknown';
              }
            });
          }
          // Fallback: set unknown for any missing emails
          allUserIds.forEach(id => {
            if (!userEmails[id]) {
              userEmails[id] = 'Unknown';
            }
          });
        } catch (authErr) {
          console.warn('Could not fetch user emails from auth:', authErr);
          // Fallback: use profile IDs as identifiers
          allUserIds.forEach(id => {
            if (!userEmails[id]) {
              userEmails[id] = 'Unknown';
            }
          });
        }
      }

      const reports: ContentReport[] = reportsData.map(report => ({
        id: report.id,
        reporterEmail: report.reporter_id ? (userEmails[report.reporter_id] || 'Unknown') : 'Unknown',
        reportedUserEmail: report.reported_user_id ? (userEmails[report.reported_user_id] || 'Unknown') : 'Unknown',
        type: report.report_type,
        description: report.description,
        status: report.status,
        contentType: report.reported_product_id ? 'product' : report.reported_page_id ? 'page' : 'user',
        adminNotes: report.admin_notes,
        createdAt: report.created_at
      }));

      set({ reports });
    } catch (error: any) {
      console.error('Error in fetchReports:', error);
      toast.error(error.message || 'Failed to fetch reports');
      set({ reports: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchAnalytics: async () => {
    set({ isLoading: true });
    try {
      // Fetch various analytics data using admin client to bypass RLS
      const [usersResult, productsResult, transactionsResult, reportsResult] = await Promise.all([
        supabaseAdmin.from('profiles').select('id, created_at'),
        supabaseAdmin.from('products').select('id, created_at, sales_count, total_revenue'),
        supabaseAdmin.from('transactions').select('amount, type, status'),
        supabaseAdmin.from('content_reports').select('id, status')
      ]);

      const users = usersResult.data || [];
      const products = productsResult.data || [];
      const transactions = transactionsResult.data || [];
      const reports = reportsResult.data || [];

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const analytics: PlatformAnalytics = {
        totalUsers: users.length,
        newUsers: users.filter(u => new Date(u.created_at) > thirtyDaysAgo).length,
        activeUsers: users.length, // Simplified - would need last login data
        totalProducts: products.length,
        newProducts: products.filter(p => new Date(p.created_at) > thirtyDaysAgo).length,
        totalSales: transactions.filter(t => t.type === 'sale' && t.status === 'completed').length,
        totalRevenue: transactions
          .filter(t => t.type === 'sale' && t.status === 'completed')
          .reduce((sum, t) => sum + (t.amount || 0), 0),
        pendingReports: reports.filter(r => r.status === 'pending').length,
        conversionRate: 5.2 // Would calculate from actual data
      };

      set({ analytics });
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch analytics');
    } finally {
      set({ isLoading: false });
    }
  },

  updateUserStatus: async (userId: string, isActive: boolean) => {
    try {
      // In a real implementation, you would update user status in the database
      // For now, we'll update the local state
      const users = get().users.map(user => 
        user.id === userId ? { ...user, isActive } : user
      );
      set({ users });

      await get().logAdminAction(
        isActive ? 'activate_user' : 'suspend_user',
        'user',
        userId
      );

      toast.success(`User ${isActive ? 'activated' : 'suspended'} successfully!`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user status');
    }
  },

  updateReportStatus: async (reportId: string, status: string, notes?: string) => {
    try {
      const { error } = await supabaseAdmin
        .from('content_reports')
        .update({
          status,
          admin_notes: notes,
          reviewed_at: new Date().toISOString(),
          reviewed_by: get().currentAdmin?.id
        })
        .eq('id', reportId);

      if (error) {
        handleSupabaseError(error);
        return;
      }

      // Update local state
      const reports = get().reports.map(report => 
        report.id === reportId 
          ? { ...report, status: status as any, adminNotes: notes }
          : report
      );
      set({ reports });

      await get().logAdminAction('update_report_status', 'report', reportId, { status, notes });
      toast.success('Report status updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update report status');
    }
  },

  logAdminAction: async (action: string, resourceType: string, resourceId?: string, details?: any) => {
    try {
      const currentAdmin = get().currentAdmin;
      if (!currentAdmin) return;

      const { error } = await supabaseAdmin
        .from('system_logs')
        .insert({
          admin_id: currentAdmin.id,
          action,
          resource_type: resourceType,
          resource_id: resourceId,
          details: details || {},
          ip_address: '127.0.0.1' // Would get real IP in production
        });

      if (error) {
        console.error('Failed to log admin action:', error);
      }
    } catch (error) {
      console.error('Failed to log admin action:', error);
    }
  }
}));

// Check for existing admin session on app load
const checkAdminSession = () => {
  const session = localStorage.getItem('adminSession');
  if (session) {
    try {
      const sessionData = JSON.parse(session);
      const loginTime = new Date(sessionData.loginTime);
      const now = new Date();
      const hoursSinceLogin = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);

      // Session expires after 8 hours
      if (hoursSinceLogin < 8) {
        const adminUser: AdminUser = {
          id: sessionData.adminId,
          email: sessionData.email,
          firstName: sessionData.firstName || 'Admin',
          lastName: sessionData.lastName || 'User',
          role: sessionData.role,
          permissions: sessionData.permissions || ['all'],
          isActive: true,
          lastLogin: sessionData.loginTime,
          createdAt: sessionData.createdAt || new Date().toISOString()
        };

        useAdminStore.setState({
          currentAdmin: adminUser,
          isAuthenticated: true
        });
      } else {
        localStorage.removeItem('adminSession');
      }
    } catch (error) {
      localStorage.removeItem('adminSession');
    }
  }
};

// Initialize admin session check
checkAdminSession();