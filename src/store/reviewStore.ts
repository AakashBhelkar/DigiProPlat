import { create } from 'zustand';
import { supabase, handleSupabaseError } from '../lib/supabase';
import { useAuthStore } from './authStore';
import toast from 'react-hot-toast';

interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  productId: string;
  rating: number;
  title: string;
  content: string;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  unhelpfulCount: number;
  createdAt: string;
  updatedAt: string;
}

interface ReviewState {
  reviews: Review[];
  productReviews: { [productId: string]: Review[] };
  isLoading: boolean;
  fetchProductReviews: (productId: string) => Promise<void>;
  submitReview: (productId: string, review: { rating: number; title: string; content: string }) => Promise<void>;
  voteOnReview: (reviewId: string, helpful: boolean) => Promise<void>;
  reportReview: (reviewId: string) => Promise<void>;
  deleteReview: (reviewId: string) => Promise<void>;
}

export const useReviewStore = create<ReviewState>((set, get) => ({
  reviews: [],
  productReviews: {},
  isLoading: false,

  fetchProductReviews: async (productId: string) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select(`
          *,
          profiles (
            username,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) {
        handleSupabaseError(error);
        return;
      }

      const reviews: Review[] = data.map(review => ({
        id: review.id,
        userId: review.user_id,
        userName: `${review.profiles.first_name} ${review.profiles.last_name}`,
        userAvatar: review.profiles.avatar_url,
        productId: review.product_id,
        rating: review.rating,
        title: review.title,
        content: review.content,
        isVerifiedPurchase: review.is_verified_purchase,
        helpfulCount: review.helpful_count,
        unhelpfulCount: review.unhelpful_count,
        createdAt: review.created_at,
        updatedAt: review.updated_at
      }));

      set(state => ({
        productReviews: {
          ...state.productReviews,
          [productId]: reviews
        }
      }));
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch reviews');
    } finally {
      set({ isLoading: false });
    }
  },

  submitReview: async (productId: string, reviewData) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    try {
      // Check if user has already reviewed this product
      const { data: existingReview } = await supabase
        .from('product_reviews')
        .select('id')
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .single();

      if (existingReview) {
        toast.error('You have already reviewed this product');
        return;
      }

      // Check if user has purchased this product
      const { data: purchase } = await supabase
        .from('transactions')
        .select('id')
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .single();

      const { error } = await supabase
        .from('product_reviews')
        .insert({
          product_id: productId,
          user_id: user.id,
          rating: reviewData.rating,
          title: reviewData.title,
          content: reviewData.content,
          is_verified_purchase: !!purchase
        });

      if (error) {
        handleSupabaseError(error);
        return;
      }

      // Refresh reviews for this product
      await get().fetchProductReviews(productId);
      toast.success('Review submitted successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit review');
    }
  },

  voteOnReview: async (reviewId: string, helpful: boolean) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    try {
      // Check if user has already voted on this review
      const { data: existingVote } = await supabase
        .from('review_votes')
        .select('id, is_helpful')
        .eq('review_id', reviewId)
        .eq('user_id', user.id)
        .single();

      if (existingVote) {
        if (existingVote.is_helpful === helpful) {
          // Remove vote if clicking the same option
          await supabase
            .from('review_votes')
            .delete()
            .eq('id', existingVote.id);
        } else {
          // Update vote if clicking different option
          await supabase
            .from('review_votes')
            .update({ is_helpful: helpful })
            .eq('id', existingVote.id);
        }
      } else {
        // Create new vote
        await supabase
          .from('review_votes')
          .insert({
            review_id: reviewId,
            user_id: user.id,
            is_helpful: helpful
          });
      }

      // Update review counts
      const { data: votes } = await supabase
        .from('review_votes')
        .select('is_helpful')
        .eq('review_id', reviewId);

      const helpfulCount = votes?.filter(v => v.is_helpful).length || 0;
      const unhelpfulCount = votes?.filter(v => !v.is_helpful).length || 0;

      await supabase
        .from('product_reviews')
        .update({
          helpful_count: helpfulCount,
          unhelpful_count: unhelpfulCount
        })
        .eq('id', reviewId);

      // Update local state
      set(state => {
        const updatedProductReviews = { ...state.productReviews };
        Object.keys(updatedProductReviews).forEach(productId => {
          updatedProductReviews[productId] = updatedProductReviews[productId].map(review =>
            review.id === reviewId
              ? { ...review, helpfulCount, unhelpfulCount }
              : review
          );
        });
        return { productReviews: updatedProductReviews };
      });

    } catch (error: any) {
      toast.error(error.message || 'Failed to vote on review');
    }
  },

  reportReview: async (reviewId: string) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    try {
      await supabase
        .from('content_reports')
        .insert({
          reporter_id: user.id,
          reported_review_id: reviewId,
          report_type: 'inappropriate',
          description: 'Inappropriate review content'
        });

      toast.success('Review reported successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to report review');
    }
  },

  deleteReview: async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from('product_reviews')
        .delete()
        .eq('id', reviewId);

      if (error) {
        handleSupabaseError(error);
        return;
      }

      // Update local state
      set(state => {
        const updatedProductReviews = { ...state.productReviews };
        Object.keys(updatedProductReviews).forEach(productId => {
          updatedProductReviews[productId] = updatedProductReviews[productId].filter(
            review => review.id !== reviewId
          );
        });
        return { productReviews: updatedProductReviews };
      });

      toast.success('Review deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete review');
    }
  }
}));