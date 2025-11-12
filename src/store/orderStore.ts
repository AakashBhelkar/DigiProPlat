import { create } from 'zustand';
import { supabase, supabaseAdmin, handleSupabaseError } from '../lib/supabase';
import { useAuthStore } from './authStore';
import toast from 'react-hot-toast';

interface Order {
  id: string;
  productId: string;
  productTitle: string;
  customerId: string;
  customerEmail: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  paymentIntentId?: string;
  downloadLinks: string[];
  downloadCount: number;
  maxDownloads: number;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

interface PaymentData {
  productId: string;
  amount: number;
  customerEmail: string;
  paymentMethodId: string;
  billingAddress: any;
}

interface OrderState {
  orders: Order[];
  isLoading: boolean;
  fetchOrders: () => Promise<void>;
  createOrder: (paymentData: PaymentData) => Promise<string>;
  processPayment: (orderId: string, paymentData: PaymentData) => Promise<void>;
  generateDownloadLinks: (orderId: string) => Promise<string[]>;
  trackDownload: (orderId: string, fileId: string) => Promise<void>;
  processRefund: (orderId: string, reason?: string) => Promise<void>;
  resendDownloadLink: (orderId: string) => Promise<void>;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  isLoading: false,

  fetchOrders: async () => {
    set({ isLoading: true });
    try {
      const { user } = useAuthStore.getState();
      if (!user) {
        set({ orders: [] });
        return;
      }

      // Fetch orders from orders table with product details through order_items
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            product_id,
            quantity,
            unit_price,
            total_price,
            products (
              id,
              title,
              description,
              price
            )
          )
        `)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (ordersError) {
        handleSupabaseError(ordersError);
        set({ orders: [] });
        return;
      }

      if (!ordersData || ordersData.length === 0) {
        set({ orders: [] });
        return;
      }

      // Get download token info for each order
      const orderIds = ordersData.map(o => o.id);
      const { data: downloadTokens } = await supabase
        .from('download_tokens')
        .select('order_id, download_count, max_downloads, expires_at')
        .in('order_id', orderIds);

      // Group download tokens by order_id
      const tokensByOrder = new Map<string, { downloadCount: number; maxDownloads: number; expiresAt: string }>();
      if (downloadTokens) {
        downloadTokens.forEach(token => {
          const existing = tokensByOrder.get(token.order_id) || { downloadCount: 0, maxDownloads: 5, expiresAt: '' };
          tokensByOrder.set(token.order_id, {
            downloadCount: Math.max(existing.downloadCount, token.download_count || 0),
            maxDownloads: token.max_downloads || 5,
            expiresAt: token.expires_at || '',
          });
        });
      }

      // Get user email
      const { data: { user: authUser } } = await supabase.auth.getUser();
      const userEmail = authUser?.email || 'Unknown';

      const orders: Order[] = ordersData.map(order => {
        const tokenInfo = tokensByOrder.get(order.id) || { downloadCount: 0, maxDownloads: 5, expiresAt: '' };
        
        // Get product from first order item (assuming one product per order for now)
        const orderItems = order.order_items as any[] || [];
        const firstOrderItem = orderItems[0];
        const product = firstOrderItem?.products as any;

        return {
          id: order.id,
          productId: firstOrderItem?.product_id || '',
          productTitle: product?.title || 'Unknown Product',
          customerId: order.customer_id,
          customerEmail: order.customer_email || userEmail,
          amount: Number(order.total_amount || 0),
          status: order.status || 'pending',
          paymentMethod: order.payment_method || 'stripe',
          paymentIntentId: order.payment_intent_id || undefined,
          downloadLinks: [], // Will be generated when needed
          downloadCount: tokenInfo.downloadCount,
          maxDownloads: tokenInfo.maxDownloads,
          expiresAt: tokenInfo.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: order.created_at,
          updatedAt: order.updated_at || order.created_at
        };
      });

      set({ orders });
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch orders');
      set({ orders: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  createOrder: async (paymentData) => {
    try {
      // Create order record
      const { data: order, error } = await supabase
        .from('transactions')
        .insert({
          product_id: paymentData.productId,
          user_id: 'customer-id', // Would get from authenticated customer
          type: 'sale',
          amount: paymentData.amount,
          status: 'pending',
          payment_method: 'stripe',
          description: `Purchase of product ${paymentData.productId}`
        })
        .select()
        .single();

      if (error) {
        handleSupabaseError(error);
      }

      return order.id;
    } catch (error: any) {
      toast.error(error.message || 'Failed to create order');
      throw error;
    }
  },

  processPayment: async (orderId, paymentData) => {
    try {
      // In a real implementation, this would:
      // 1. Create Stripe payment intent
      // 2. Process the payment
      // 3. Update order status
      // 4. Generate download links
      // 5. Send confirmation email

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update order status
      const { error } = await supabase
        .from('transactions')
        .update({
          status: 'completed',
          stripe_payment_id: `pi_${Date.now()}`
        })
        .eq('id', orderId);

      if (error) {
        handleSupabaseError(error);
        return;
      }

      // Generate download links
      await get().generateDownloadLinks(orderId);

      // Refresh orders
      await get().fetchOrders();

      toast.success('Payment processed successfully!');
    } catch (error: any) {
      // Update order status to failed
      await supabase
        .from('transactions')
        .update({ status: 'failed' })
        .eq('id', orderId);

      toast.error(error.message || 'Payment processing failed');
      throw error;
    }
  },

  generateDownloadLinks: async (orderId) => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mafryhnhgopxfckrepxv.supabase.co';
      
      // Get auth token for authenticated request
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('User must be authenticated to generate download links');
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/generate-download-links`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          orderId,
          expiresInDays: 7,
          maxDownloads: 5,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to generate download links' }));
        throw new Error(errorData.error || 'Failed to generate download links');
      }

      const data = await response.json();
      return data.downloadLinks.map((link: any) => link.downloadUrl);
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate download links');
      throw error;
    }
  },

  trackDownload: async (orderId, fileId) => {
    try {
      // Get download token for this order and file
      const { data: downloadToken } = await supabase
        .from('download_tokens')
        .select('token')
        .eq('order_id', orderId)
        .eq('file_id', fileId)
        .single();

      if (!downloadToken) {
        console.warn('Download token not found for tracking');
        return;
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mafryhnhgopxfckrepxv.supabase.co';
      
      // Get auth token for authenticated request
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn('User not authenticated, cannot track download');
        return;
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/track-download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          token: downloadToken.token,
          fileId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to track download' }));
        console.error('Failed to track download:', errorData.error);
      }
    } catch (error: any) {
      console.error('Failed to track download:', error);
    }
  },

  processRefund: async (orderId, reason) => {
    try {
      // In a real implementation, this would:
      // 1. Process refund through Stripe
      // 2. Update order status
      // 3. Revoke download access
      // 4. Send refund confirmation email
      // 5. Update seller's balance

      const { error } = await supabase
        .from('transactions')
        .update({ status: 'refunded' })
        .eq('id', orderId);

      if (error) {
        handleSupabaseError(error);
        return;
      }

      await get().fetchOrders();
      toast.success('Refund processed successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to process refund');
      throw error;
    }
  },

  resendDownloadLink: async (orderId) => {
    try {
      // In a real implementation, this would:
      // 1. Generate new download links
      // 2. Send email with download instructions
      // 3. Log the action

      const downloadLinks = await get().generateDownloadLinks(orderId);
      
      // Send email (would use email service)
      console.log(`Resending download links for order ${orderId}:`, downloadLinks);
      
      toast.success('Download link sent to customer');
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend download link');
      throw error;
    }
  }
}));