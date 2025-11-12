import { create } from 'zustand';
import { supabase, handleSupabaseError } from '../lib/supabase';
import { useAuthStore } from './authStore';
import toast from 'react-hot-toast';

interface WishlistItem {
  id: string;
  productId: string;
  userId: string;
  createdAt: string;
  product?: {
    id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    thumbnail?: string;
  };
}

interface WishlistState {
  wishlist: WishlistItem[];
  isLoading: boolean;
  fetchWishlist: () => Promise<void>;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  wishlist: [],
  isLoading: false,

  fetchWishlist: async () => {
    const { user } = useAuthStore.getState();
    if (!user) {
      set({ wishlist: [] });
      return;
    }

    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select(`
          *,
          products (
            id,
            title,
            description,
            price,
            category,
            files:product_files (
              storage_path
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        handleSupabaseError(error);
        set({ wishlist: [] });
        return;
      }

      const wishlistItems: WishlistItem[] = (data || []).map((item: any) => ({
        id: item.id,
        productId: item.product_id,
        userId: item.user_id,
        createdAt: item.created_at,
        product: item.products ? {
          id: item.products.id,
          title: item.products.title,
          description: item.products.description,
          price: Number(item.products.price || 0),
          category: item.products.category,
          thumbnail: item.products.files?.[0]?.storage_path,
        } : undefined,
      }));

      set({ wishlist: wishlistItems });
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch wishlist');
      set({ wishlist: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  addToWishlist: async (productId: string) => {
    const { user } = useAuthStore.getState();
    if (!user) {
      toast.error('Please login to add items to wishlist');
      return;
    }

    // Check if already in wishlist
    if (get().isInWishlist(productId)) {
      toast.info('Product is already in your wishlist');
      return;
    }

    try {
      const { error } = await supabase
        .from('wishlists')
        .insert({
          user_id: user.id,
          product_id: productId,
        });

      if (error) {
        handleSupabaseError(error);
        return;
      }

      // Refresh wishlist
      await get().fetchWishlist();
      toast.success('Added to wishlist');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add to wishlist');
    }
  },

  removeFromWishlist: async (productId: string) => {
    const { user } = useAuthStore.getState();
    if (!user) {
      return;
    }

    try {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) {
        handleSupabaseError(error);
        return;
      }

      // Refresh wishlist
      await get().fetchWishlist();
      toast.success('Removed from wishlist');
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove from wishlist');
    }
  },

  isInWishlist: (productId: string) => {
    return get().wishlist.some(item => item.productId === productId);
  },
}));

