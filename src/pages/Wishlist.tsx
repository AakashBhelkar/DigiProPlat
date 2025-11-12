import React, { useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Stack,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  IconButton,
  Avatar,
  Chip,
  CircularProgress,
  Grid,
} from '@mui/material';
import GridLegacy from '@mui/material/GridLegacy';
import { Favorite, ShoppingCart, Delete } from '@mui/icons-material';
import { useWishlistStore } from '../store/wishlistStore';
import { useNavigate } from 'react-router-dom';
import { DashboardContent } from '../layouts/dashboard/main';
import { CheckoutModal } from '../components/Payment/CheckoutModal';
import { useState } from 'react';
import toast from 'react-hot-toast';

export const Wishlist: React.FC = () => {
  const navigate = useNavigate();
  const { wishlist, isLoading, fetchWishlist, removeFromWishlist } = useWishlistStore();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handlePurchase = (item: any) => {
    if (!item.product) {
      toast.error('Product information not available');
      return;
    }
    setSelectedProduct({
      id: item.product.id,
      title: item.product.title,
      price: item.product.price,
      thumbnail: item.product.thumbnail,
      sellerId: item.product.userId || item.userId,
    });
    setShowCheckout(true);
  };

  const handleCheckoutSuccess = (orderId: string) => {
    toast.success('Purchase successful!');
    setShowCheckout(false);
    setSelectedProduct(null);
    // Remove from wishlist after purchase
    if (selectedProduct) {
      removeFromWishlist(selectedProduct.id);
    }
  };

  if (isLoading) {
    return (
      <DashboardContent>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <Container maxWidth="xl">
        <Stack spacing={4}>
          {/* Header */}
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              My Wishlist
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
            </Typography>
          </Box>

          {/* Wishlist Items */}
          {wishlist.length === 0 ? (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 8 }}>
                <Favorite sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Your wishlist is empty
                </Typography>
                <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
                  Start adding products you love to your wishlist
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate('/marketplace')}
                  startIcon={<ShoppingCart />}
                >
                  Browse Marketplace
                </Button>
              </CardContent>
            </Card>
          ) : (
            <GridLegacy container spacing={3}>
              {wishlist.map((item) => (
                <GridLegacy item xs={12} sm={6} md={4} lg={3} key={item.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {item.product?.thumbnail && (
                      <CardMedia
                        component="img"
                        height="200"
                        image={item.product.thumbnail}
                        alt={item.product.title}
                        sx={{ objectFit: 'cover' }}
                      />
                    )}
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
                        <Typography variant="h6" fontWeight={600} sx={{ flex: 1 }}>
                          {item.product?.title || 'Product'}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => removeFromWishlist(item.productId)}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </Stack>
                      {item.product?.category && (
                        <Chip
                          label={item.product.category}
                          size="small"
                          sx={{ mb: 1, textTransform: 'capitalize' }}
                        />
                      )}
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {item.product?.description || 'No description available'}
                      </Typography>
                      <Typography variant="h6" fontWeight={700} color="primary.main">
                        ${item.product?.price?.toFixed(2) || '0.00'}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<ShoppingCart />}
                        onClick={() => handlePurchase(item)}
                      >
                        Buy Now
                      </Button>
                    </CardActions>
                  </Card>
                </GridLegacy>
              ))}
            </GridLegacy>
          )}
        </Stack>

        {/* Checkout Modal */}
        {showCheckout && selectedProduct && (
          <CheckoutModal
            isOpen={showCheckout}
            onClose={() => setShowCheckout(false)}
            product={selectedProduct}
            onSuccess={handleCheckoutSuccess}
          />
        )}
      </Container>
    </DashboardContent>
  );
};

