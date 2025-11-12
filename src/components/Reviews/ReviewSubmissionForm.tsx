import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Rating,
  Typography,
  Stack,
  Alert,
} from '@mui/material';
import { useReviewStore } from '../../store/reviewStore';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

interface ReviewSubmissionFormProps {
  productId: string;
  onSuccess?: () => void;
}

export const ReviewSubmissionForm: React.FC<ReviewSubmissionFormProps> = ({
  productId,
  onSuccess,
}) => {
  const { user } = useAuthStore();
  const { submitReview } = useReviewStore();
  const [rating, setRating] = useState<number>(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please login to submit a review');
      return;
    }

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!title.trim()) {
      toast.error('Please enter a review title');
      return;
    }

    if (!content.trim()) {
      toast.error('Please enter a review content');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitReview(productId, {
        rating,
        title: title.trim(),
        content: content.trim(),
      });
      setRating(0);
      setTitle('');
      setContent('');
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      // Error already handled in store
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent>
          <Alert severity="info">
            Please login to submit a review for this product.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Write a Review
        </Typography>
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Rating *
              </Typography>
              <Rating
                value={rating}
                onChange={(_, newValue) => setRating(newValue || 0)}
                size="large"
              />
            </Box>

            <TextField
              fullWidth
              label="Review Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience"
              required
              disabled={isSubmitting}
            />

            <TextField
              fullWidth
              label="Review Content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts about this product..."
              multiline
              rows={4}
              required
              disabled={isSubmitting}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isSubmitting || rating === 0 || !title.trim() || !content.trim()}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </Stack>
        </form>
      </CardContent>
    </Card>
  );
};

