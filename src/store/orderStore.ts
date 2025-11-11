import { create } from 'zustand';
import { supabase, supabaseAdmin, handleSupabaseError } from '../lib/supabase';
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
      // Fetch transactions first
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select(`
          *,
          products (title)
        `)
        .eq('type', 'sale')
        .order('created_at', { ascending: false });

      if (transactionsError) {
        handleSupabaseError(transactionsError);
        return;
      }

      if (!transactions || transactions.length === 0) {
        set({ orders: [] });
        return;
      }

      // Fetch user emails from auth.users (profiles table doesn't have email)
      const userIds = [...new Set(transactions.map(t => t.user_id).filter(Boolean))];
      const userEmails: Record<string, string> = {};
      
      try {
        const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
        if (authUsers?.users) {
          authUsers.users.forEach(user => {
            if (userIds.includes(user.id)) {
              userEmails[user.id] = user.email || 'Unknown';
            }
          });
        }
      } catch (authErr) {
        console.warn('Could not fetch user emails:', authErr);
      }

      const orders: Order[] = transactions.map(transaction => ({
        id: transaction.id,
        productId: transaction.product_id,
        productTitle: transaction.products?.title || 'Unknown Product',
        customerId: transaction.user_id,
        customerEmail: transaction.user_id ? (userEmails[transaction.user_id] || 'Unknown Customer') : 'Unknown Customer',
        amount: transaction.amount,
        status: transaction.status,
        paymentMethod: transaction.payment_method || 'Unknown',
        paymentIntentId: transaction.stripe_payment_id,
        downloadLinks: [], // Would be generated dynamically
        downloadCount: 0, // Would track actual downloads
        maxDownloads: 5, // Configurable per product
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        createdAt: transaction.created_at,
        updatedAt: transaction.created_at
      }));

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
      // In a real implementation, this would:
      // 1. Get product files from database
      // 2. Generate secure, time-limited download URLs
      // 3. Store download links with expiration
      // 4. Return the links

      const downloadLinks = [
        `https://secure-downloads.digiproplat.com/${orderId}/file1.zip?token=abc123`,
        `https://secure-downloads.digiproplat.com/${orderId}/file2.pdf?token=def456`
      ];

      return downloadLinks;
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate download links');
      throw error;
    }
  },

  trackDownload: async (orderId, fileId) => {
    try {
      // In a real implementation, this would:
      // 1. Increment download count
      // 2. Log download activity
      // 3. Check download limits
      // 4. Update analytics

      console.log(`Download tracked for order ${orderId}, file ${fileId}`);
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