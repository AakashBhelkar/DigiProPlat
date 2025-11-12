import React, { useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Avatar,
  Rating,
  Chip,
  IconButton,
  Divider,
  CircularProgress,
} from '@mui/material';
import { ThumbUp, ThumbDown, Verified } from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { useReviewStore } from '../../store/reviewStore';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

interface ReviewListProps {
  productId: string;
}

export const ReviewList: React.FC<ReviewListProps> = ({ productId }) => {
  const { user } = useAuthStore();
  const { productReviews, isLoading, fetchProductReviews, voteOnReview } = useReviewStore();
  const reviews = productReviews[productId] || [];

  useEffect(() => {
    if (productId) {
      fetchProductReviews(productId);
    }
  }, [productId, fetchProductReviews]);

  const handleVote = async (reviewId: string, helpful: boolean) => {
    if (!user) {
      toast.error('Please login to vote on reviews');
      return;
    }
    await voteOnReview(reviewId, helpful);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No reviews yet. Be the first to review this product!
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Calculate average rating
  const averageRating =
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <Typography variant="h6" fontWeight={600}>
          Reviews ({reviews.length})
        </Typography>
        <Rating value={averageRating} readOnly precision={0.1} />
        <Typography variant="body2" color="text.secondary">
          {averageRating.toFixed(1)} out of 5
        </Typography>
      </Stack>

      <Stack spacing={2}>
        {reviews.map((review, index) => (
          <React.Fragment key={review.id}>
            <Card variant="outlined">
              <CardContent>
                <Stack spacing={2}>
                  {/* Review Header */}
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Avatar
                      src={review.userAvatar}
                      alt={review.userName}
                      sx={{ width: 40, height: 40 }}
                    >
                      {review.userName.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {review.userName}
                        </Typography>
                        {review.isVerifiedPurchase && (
                          <Chip
                            icon={<Verified sx={{ fontSize: 14 }} />}
                            label="Verified Purchase"
                            size="small"
                            color="success"
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                        )}
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                        <Rating value={review.rating} readOnly size="small" />
                        <Typography variant="caption" color="text.secondary">
                          {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                        </Typography>
                      </Stack>
                    </Box>
                  </Stack>

                  {/* Review Content */}
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      {review.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {review.content}
                    </Typography>
                  </Box>

                  {/* Review Actions */}
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <IconButton
                      size="small"
                      onClick={() => handleVote(review.id, true)}
                      color={review.helpfulCount > 0 ? 'primary' : 'default'}
                    >
                      <ThumbUp fontSize="small" />
                    </IconButton>
                    <Typography variant="caption" color="text.secondary">
                      {review.helpfulCount}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleVote(review.id, false)}
                      color={review.unhelpfulCount > 0 ? 'error' : 'default'}
                    >
                      <ThumbDown fontSize="small" />
                    </IconButton>
                    <Typography variant="caption" color="text.secondary">
                      {review.unhelpfulCount}
                    </Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
            {index < reviews.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </Stack>
    </Box>
  );
};

