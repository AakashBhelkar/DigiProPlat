import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Chip,
  IconButton,
  Menu,
  Avatar,
  Divider,
  alpha,
  useTheme,
  Alert,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import { Iconify } from '../components/iconify';
import { useProductStore } from '../store/productStore';
import { formatDistanceToNow } from 'date-fns';
import { DashboardContent } from '../layouts/dashboard/main';
import { RouterLink } from '../routes/components';
import { ProductEditModal } from '../components/Products/ProductEditModal';
import { DeleteProductDialog } from '../components/Products/DeleteProductDialog';
import { Product } from '../types';
import { supabase, getFileUrl } from '../lib/supabase';
import toast from 'react-hot-toast';

// ----------------------------------------------------------------------

export const Products: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { products, deleteProduct, setSelectedProduct } = useProductStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const categories = ['all', 'templates', 'ebooks', 'graphics', 'software', 'audio', 'video'];

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, productId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedProductId(productId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProductId(null);
  };

  const handleEditProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      setEditModalOpen(true);
      handleMenuClose();
    }
  };

  const handleDeleteClick = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setProductToDelete(product);
      setDeleteDialogOpen(true);
      handleMenuClose();
    }
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteProduct(productToDelete.id);
      setDeleteDialogOpen(false);
      setProductToDelete(null);
      toast.success('Product deleted successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewDetails = (productId: string) => {
    handleMenuClose();
    navigate(`/marketplace/product/${productId}`);
  };

  const handleDownloadFiles = async (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product || !product.files || product.files.length === 0) {
      toast.error('No files available for this product');
      handleMenuClose();
      return;
    }

    setIsDownloading(true);
    try {
      // Download each file
      for (const file of product.files) {
        try {
          // Get signed URL from Supabase Storage
          const { data, error } = await supabase.storage
            .from('product-files')
            .createSignedUrl(file.url, 3600); // 1 hour expiry

          if (error) {
            console.error('Error creating signed URL:', error);
            // Try public URL as fallback
            const publicUrl = getFileUrl('product-files', file.url);
            const link = document.createElement('a');
            link.href = publicUrl;
            link.download = file.name;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } else if (data?.signedUrl) {
            // Download using signed URL
            const link = document.createElement('a');
            link.href = data.signedUrl;
            link.download = file.name;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        } catch (fileError: any) {
          console.error(`Error downloading file ${file.name}:`, fileError);
          toast.error(`Failed to download ${file.name}`);
        }
      }
      
      toast.success('Files downloaded successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to download files');
    } finally {
      setIsDownloading(false);
      handleMenuClose();
    }
  };

  return (
    <DashboardContent>
      <Stack spacing={4}>
        {/* Header */}
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Products
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your digital products and track performance
            </Typography>
          </Box>
          <Button
            component={RouterLink}
            href="/products/upload"
            variant="contained"
            size="large"
            startIcon={<Iconify icon="solar:add-circle-bold-duotone" />}
          >
            Upload Product
          </Button>
        </Stack>

        {/* Filters */}
        <Card>
          <CardContent>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="solar:magnifer-bold-duotone" />
                    </InputAdornment>
                  ),
                }}
              />
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  label="Category"
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button variant="outlined" startIcon={<Iconify icon="solar:filter-bold-duotone" />}>
                More Filters
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <Card>
            <CardContent>
              <Stack spacing={3} alignItems="center" sx={{ py: 8 }}>
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    bgcolor: alpha(theme.palette.grey[500], 0.12),
                    color: 'text.disabled',
                  }}
                >
                  <Iconify icon="solar:box-bold-duotone" width={32} />
                </Avatar>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    No products found
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {searchTerm || selectedCategory !== 'all'
                      ? 'Try adjusting your search or filters'
                      : 'Get started by uploading your first digital product'}
                  </Typography>
                  <Button
                    component={RouterLink}
                    href="/products/upload"
                    variant="contained"
                    startIcon={<Iconify icon="solar:add-circle-bold-duotone" />}
                  >
                    Upload Product
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {filteredProducts.map((product) => (
              <Grid item xs={12} sm={6} lg={4} key={product.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      boxShadow: theme.customShadows.z16,
                      transform: 'translateY(-4px)',
                      transition: 'all 0.3s ease',
                    },
                  }}
                >
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      aspectRatio: '16/9',
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="h3" fontWeight={800} color="primary.main">
                      {product.title.charAt(0).toUpperCase()}
                    </Typography>
                    <IconButton
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: alpha(theme.palette.grey[900], 0.6),
                        color: 'white',
                        '&:hover': {
                          bgcolor: alpha(theme.palette.grey[900], 0.8),
                        },
                      }}
                      onClick={(e) => handleMenuOpen(e, product.id)}
                    >
                      <Iconify icon="solar:menu-dots-vertical-bold-duotone" width={20} />
                    </IconButton>
                  </Box>
                  <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                      <Chip
                        label={product.category}
                        size="small"
                        sx={{ bgcolor: alpha(theme.palette.grey[800], 0.12), color: 'text.primary' }}
                      />
                      <Typography variant="h6" fontWeight={700} color="primary.main">
                        ${product.price}
                      </Typography>
                    </Stack>
                    <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 1 }}>
                      {product.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        flex: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {product.description}
                    </Typography>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        {product.sales} sales
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        ${product.revenue.toFixed(2)} revenue
                      </Typography>
                    </Stack>
                    <Divider sx={{ my: 2 }} />
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary">
                        Updated {formatDistanceToNow(new Date(product.updatedAt))} ago
                      </Typography>
                      <Chip
                        label={product.isPublic ? 'Published' : 'Draft'}
                        size="small"
                        color={product.isPublic ? 'success' : 'warning'}
                      />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Actions Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem onClick={() => selectedProductId && handleViewDetails(selectedProductId)}>
            <Iconify icon="solar:eye-bold-duotone" sx={{ mr: 1 }} />
            View Details
          </MenuItem>
          <MenuItem onClick={() => selectedProductId && handleEditProduct(selectedProductId)}>
            <Iconify icon="solar:pen-bold-duotone" sx={{ mr: 1 }} />
            Edit Product
          </MenuItem>
          <MenuItem 
            onClick={() => selectedProductId && handleDownloadFiles(selectedProductId)}
            disabled={isDownloading}
          >
            <Iconify icon="solar:download-bold-duotone" sx={{ mr: 1 }} />
            {isDownloading ? 'Downloading...' : 'Download Files'}
          </MenuItem>
          <Divider />
          {selectedProductId && (
            <MenuItem
              onClick={() => handleDeleteClick(selectedProductId)}
              sx={{ color: 'error.main' }}
            >
              <Iconify icon="solar:trash-bin-trash-bold-duotone" sx={{ mr: 1 }} />
              Delete
            </MenuItem>
          )}
        </Menu>

        {/* Edit Modal */}
        {editModalOpen && (
          <ProductEditModal
            open={editModalOpen}
            onClose={() => {
              setEditModalOpen(false);
              setSelectedProduct(null);
            }}
            product={products.find(p => p.id === selectedProductId) || null}
          />
        )}

        {/* Delete Dialog */}
        <DeleteProductDialog
          open={deleteDialogOpen}
          onClose={() => {
            setDeleteDialogOpen(false);
            setProductToDelete(null);
          }}
          onConfirm={handleDeleteConfirm}
          productTitle={productToDelete?.title}
          isDeleting={isDeleting}
        />
      </Stack>
    </DashboardContent>
  );
};
