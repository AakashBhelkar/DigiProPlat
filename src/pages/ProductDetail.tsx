import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Stack,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Avatar,
  Divider,
  CircularProgress,
  Grid,
  Rating,
  IconButton,
  Breadcrumbs,
  Link,
} from '@mui/material';
import GridLegacy from '@mui/material/GridLegacy';
import { ArrowBack, Favorite, FavoriteBorder, ShoppingCart, Download } from '@mui/icons-material';
import { supabase } from '../lib/supabase';
import { useWishlistStore } from '../store/wishlistStore';
import { useReviewStore } from '../store/reviewStore';
import { ReviewList } from '../components/Reviews/ReviewList';
import { ReviewSubmissionForm } from '../components/Reviews/ReviewSubmissionForm';
import { CheckoutModal } from '../components/Payment/CheckoutModal';
import { DashboardContent } from '../layouts/dashboard/main';
import toast from 'react-hot-toast';

interface ProductDetail {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  tags: string[];
  average_rating: number;
  review_count: number;
  sales_count: number;
  user_id: string;
  created_at: string;
  product_files?: Array<{
    id: string;
    name: string;
    storage_path: string;
    file_type: string;
    file_size: number;
  }>;
}

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlistStore();
  const { fetchProductReviews } = useReviewStore();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            product_files (
              id,
              name,
              storage_path,
              file_type,
              file_size
            )
          `)
          .eq('id', id)
          .eq('is_public', true)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          setProduct(data as ProductDetail);
          // Fetch reviews for this product
          await fetchProductReviews(id);
        }
      } catch (error: any) {
        console.error('Error fetching product:', error);
        toast.error('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, fetchProductReviews]);

  const handleWishlistToggle = async () => {
    if (!id) return;
    if (isInWishlist(id)) {
      await removeFromWishlist(id);
    } else {
      await addToWishlist(id);
    }
  };

  const handlePurchase = () => {
    if (!product) return;
    setShowCheckout(true);
  };

  const handleCheckoutSuccess = (orderId: string) => {
    toast.success('Purchase successful!');
    setShowCheckout(false);
  };

  const handleReviewSubmitted = () => {
    setShowReviewForm(false);
    if (id) {
      fetchProductReviews(id);
      // Refresh product to get updated rating
      const fetchProduct = async () => {
        const { data } = await supabase
          .from('products')
          .select('average_rating, review_count')
          .eq('id', id)
          .single();
        if (data && product) {
          setProduct({ ...product, average_rating: data.average_rating, review_count: data.review_count });
        }
      };
      fetchProduct();
    }
  };

  if (loading) {
    return (
      <DashboardContent>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </DashboardContent>
    );
  }

  if (!product) {
    return (
      <DashboardContent>
        <Container maxWidth="lg">
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Product not found
              </Typography>
              <Button
                variant="contained"
                startIcon={<ArrowBack />}
                onClick={() => navigate('/marketplace')}
                sx={{ mt: 2 }}
              >
                Back to Marketplace
              </Button>
            </CardContent>
          </Card>
        </Container>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <Container maxWidth="lg">
        <Stack spacing={4}>
          {/* Breadcrumbs */}
          <Breadcrumbs>
            <Link
              component="button"
              variant="body1"
              onClick={() => navigate('/marketplace')}
              sx={{ cursor: 'pointer' }}
            >
              Marketplace
            </Link>
            <Typography color="text.primary">{product.title}</Typography>
          </Breadcrumbs>

          {/* Product Header */}
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/marketplace')}
            sx={{ alignSelf: 'flex-start' }}
          >
            Back to Marketplace
          </Button>

          <GridLegacy container spacing={4}>
            {/* Product Image */}
            <GridLegacy item xs={12} md={6}>
              <Card>
                <CardMedia
                  component="img"
                  height="500"
                  image={product.product_files?.[0]?.storage_path || 'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg'}
                  alt={product.title}
                  sx={{ objectFit: 'cover' }}
                />
              </Card>
            </GridLegacy>

            {/* Product Info */}
            <GridLegacy item xs={12} md={6}>
              <Stack spacing={3}>
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                    <Chip label={product.category} color="primary" size="small" />
                    {product.tags?.map((tag) => (
                      <Chip key={tag} label={tag} size="small" variant="outlined" />
                    ))}
                  </Stack>
                  <Typography variant="h4" fontWeight={700} gutterBottom>
                    {product.title}
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                    <Rating value={product.average_rating || 0} readOnly precision={0.1} />
                    <Typography variant="body2" color="text.secondary">
                      {product.average_rating?.toFixed(1) || '0.0'} ({product.review_count || 0} reviews)
                    </Typography>
                  </Stack>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="h5" fontWeight={700} color="primary.main" gutterBottom>
                    ${product.price.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {product.sales_count || 0} sales
                  </Typography>
                </Box>

                <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                  {product.description}
                </Typography>

                {/* Action Buttons */}
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<ShoppingCart />}
                    onClick={handlePurchase}
                    sx={{ flex: 1 }}
                  >
                    Buy Now
                  </Button>
                  <IconButton
                    color={isInWishlist(product.id) ? 'error' : 'default'}
                    onClick={handleWishlistToggle}
                    size="large"
                  >
                    {isInWishlist(product.id) ? <Favorite /> : <FavoriteBorder />}
                  </IconButton>
                </Stack>

                {/* Product Files */}
                {product.product_files && product.product_files.length > 0 && (
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        Files Included
                      </Typography>
                      <Stack spacing={1}>
                        {product.product_files.map((file) => (
                          <Stack key={file.id} direction="row" alignItems="center" spacing={2}>
                            <Download />
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2">{file.name}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {(file.file_size / 1024 / 1024).toFixed(2)} MB
                              </Typography>
                            </Box>
                          </Stack>
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>
                )}
              </Stack>
            </GridLegacy>
          </GridLegacy>

          <Divider />

          {/* Reviews Section */}
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5" fontWeight={700}>
                Reviews
              </Typography>
              <Button
                variant="outlined"
                onClick={() => setShowReviewForm(!showReviewForm)}
              >
                {showReviewForm ? 'Cancel' : 'Write a Review'}
              </Button>
            </Stack>

            {showReviewForm && (
              <Box mb={4}>
                <ReviewSubmissionForm
                  productId={product.id}
                  onSuccess={handleReviewSubmitted}
                />
              </Box>
            )}

            <ReviewList productId={product.id} />
          </Box>
        </Stack>

        {/* Checkout Modal */}
        {showCheckout && product && (
          <CheckoutModal
            isOpen={showCheckout}
            onClose={() => setShowCheckout(false)}
            product={{
              id: product.id,
              title: product.title,
              price: product.price,
              thumbnail: product.product_files?.[0]?.storage_path || '',
              sellerId: product.user_id,
            }}
            onSuccess={handleCheckoutSuccess}
          />
        )}
      </Container>
    </DashboardContent>
  );
};

