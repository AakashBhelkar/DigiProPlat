import { create } from 'zustand';
import { supabase, handleSupabaseError } from '../lib/supabase';
import { User } from '../types';
import toast from 'react-hot-toast';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    username: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  checkAuth: async () => {
    try {
      set({ isLoading: true });
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Fetch user profile first
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          handleSupabaseError(profileError);
          set({ user: null, isAuthenticated: false, isLoading: false });
          return;
        }

        // If profile is missing, bail out and log. The project expects a DB trigger to
        // create a `profiles` row when a new auth user is created (see migrations).
        // If that trigger/migration isn't applied to your Supabase project, the
        // profiles row won't exist and the app can't build a user object.
        if (!profile) {
          console.warn('No profile found for user', session.user.id, '- ensure migrations/triggers are applied on your Supabase project.');
          set({ user: null, isAuthenticated: false, isLoading: false });
          return;
        }

        // Use email from session.user
        const email = session.user.email;
        if (!email) {
          toast.error('User email not found.');
          set({ user: null, isAuthenticated: false, isLoading: false });
          return;
        }

        // Fetch subscription separately to avoid relationship issues
        let subscription = {
          id: '1',
          name: 'free',
          price: 0,
          features: ['5 Products', 'Basic Analytics'],
          limits: {
            products: 5,
            storage: 1,
            customDomain: false,
            aiGenerations: 5
          }
        };

        try {
          const { data: userSubscriptions, error: subError } = await supabase
            .from('user_subscriptions')
            .select(`
              *,
              subscription_plans (*)
            `)
            .eq('user_id', session.user.id)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(1);

          if (!subError && userSubscriptions && userSubscriptions.length > 0) {
            const userSub = userSubscriptions[0];
            if (userSub.subscription_plans) {
              subscription = Array.isArray(userSub.subscription_plans) 
                ? userSub.subscription_plans[0] 
                : userSub.subscription_plans as any;
            }
          }
        } catch (subErr) {
          console.warn('Could not fetch subscription, using default:', subErr);
        }

        const user: User = {
          id: profile.id,
          email,
          username: profile.username ?? '',
          firstName: (profile.first_name as string) ?? '',
          lastName: (profile.last_name as string) ?? '',
          avatar: (profile.avatar_url as string) ?? undefined,
          kycStatus: (profile.kyc_status as 'pending' | 'verified' | 'rejected') ?? 'pending',
          createdAt: (profile.created_at as string) ?? new Date().toISOString(),
          subscription: {
            id: subscription.id,
            name: subscription.name as 'free' | 'pro' | 'business',
            price: subscription.price,
            features: (subscription.features as string[]) ?? [],
            limits: (subscription.limits as unknown as { products: number; storage: number; customDomain: boolean; aiGenerations: number; }) ?? {
              products: 5,
              storage: 1,
              customDomain: false,
              aiGenerations: 5
            }
          },
          walletBalance: (profile.wallet_balance as number) ?? 0
        };

        set({ user, isAuthenticated: true, isLoading: false });
      } else {
        // No session - explicitly set to false
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        // Don't show toast for login errors - let the component handle it
        throw new Error(error.message);
      }

      await get().checkAuth();
      toast.success('Successfully logged in!');
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (userData) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            username: userData.username
          }
        }
      });

      if (error) {
        handleSupabaseError(error);
        return;
      }

      // Supabase may require email confirmation. If `data.user` exists but there's no session,
      // the user must confirm their email before being signed in. If `data.user` is falsy,
      // the account may still be pending confirmation depending on your Supabase settings.
      if (!data.user) {
        toast('Please check your email and confirm your account before signing in.');
        return;
      }

      if (data.user) {
        // Create default subscription
        const { data: freePlan } = await supabase
          .from('subscription_plans')
          .select('id')
          .eq('name', 'free')
          .single();

        if (freePlan) {
          await supabase
            .from('user_subscriptions')
            .insert({
              user_id: data.user.id,
              plan_id: freePlan.id
            });
        }

        await get().checkAuth();
        toast.success('Account created successfully!');
      }
    } catch (error) {
      toast.error((error as Error).message || 'Registration failed');
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        handleSupabaseError(error);
        return;
      }

      set({ user: null, isAuthenticated: false });
      toast.success('Successfully logged out!');
    } catch (error) {
      toast.error((error as Error).message || 'Logout failed');
    }
  },

  updateUser: async (userData) => {
    const currentUser = get().user;
    if (!currentUser) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: userData.firstName,
          last_name: userData.lastName,
          username: userData.username,
          avatar_url: userData.avatar
        })
        .eq('id', currentUser.id);

      if (error) {
        handleSupabaseError(error);
        return;
      }

      set({ 
        user: { 
          ...currentUser, 
          ...userData 
        } 
      });

      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error((error as Error).message || 'Update failed');
      throw error;
    }
  }
}));

// Listen for auth changes - only set up once
let authListenerSetup = false;
if (!authListenerSetup && typeof window !== 'undefined') {
  supabase.auth.onAuthStateChange((event) => {
    // Only update state on actual auth changes, not on initial session check
    if (event === 'SIGNED_IN') {
      const currentState = useAuthStore.getState();
      // Only call checkAuth if not already authenticated to prevent loops
      if (!currentState.isAuthenticated) {
        useAuthStore.getState().checkAuth();
      }
    } else if (event === 'SIGNED_OUT') {
      useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: false });
    }
  });
  authListenerSetup = true;
}