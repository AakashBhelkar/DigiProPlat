import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Chip,
  Avatar,
  Stack,
  Paper,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Collapse,
  Divider,
  Rating,
  Tooltip,
  Badge,
  useTheme,
  alpha,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  ShoppingCart,
  FavoriteBorder,
  Favorite,
  Visibility,
  Download,
  TrendingUp,
  ExpandMore,
  ExpandLess,
  Clear,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useProductStore } from '../store/productStore';
import { useWishlistStore } from '../store/wishlistStore';
import { CheckoutModal } from '../components/Payment/CheckoutModal';
import { SearchAutocomplete } from '../components/Search/SearchAutocomplete';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

// Motion components
const MotionCard = motion.create(Card);
const MotionGrid = motion.create(Grid);

interface MarketplaceProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  rating: number;
  reviews: number;
  downloads: number;
  thumbnail: string;
  author: {
    name: string;
    avatar: string;
  };
  tags: string[];
  isInWishlist: boolean;
  sellerId?: string; // Add sellerId for checkout
}

export const MarketplaceNew: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { products, isLoading, fetchProducts } = useProductStore();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<number[]>([0, 1000]);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const { wishlist, addToWishlist, removeFromWishlist, isInWishlist, fetchWishlist } = useWishlistStore();
  const [selectedProduct, setSelectedProduct] = useState<MarketplaceProduct | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);

  // Categories
  const categories = [
    { value: 'all', label: 'All Products', icon: '🎯' },
    { value: 'templates', label: 'Templates', icon: '📄' },
    { value: 'graphics', label: 'Graphics', icon: '🎨' },
    { value: 'ebooks', label: 'E-books', icon: '📚' },
    { value: 'software', label: 'Software', icon: '💻' },
    { value: 'audio', label: 'Audio', icon: '🎵' },
    { value: 'video', label: 'Video', icon: '🎬' },
  ];

  // Sort options
  const sortOptions = [
    { value: 'relevance', label: 'Most Relevant' },
    { value: 'newest', label: 'Newest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'popular', label: 'Most Popular' },
  ];

  // Mock data (fallback if no real products)
  const mockProducts: MarketplaceProduct[] = [
    {
      id: '1',
      title: 'Premium Social Media Templates',
      description: 'Professional Instagram and Facebook post templates for businesses. Includes 50+ customizable designs.',
      price: 29.99,
      category: 'templates',
      rating: 4.8,
      reviews: 124,
      downloads: 1250,
      thumbnail: 'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=600',
      author: {
        name: 'Sarah Design',
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100'
      },
      tags: ['social media', 'instagram', 'business', 'marketing'],
      isInWishlist: false
    },
    {
      id: '2',
      title: 'Modern Logo Collection',
      description: 'Set of 50 minimalist logos perfect for startups and small businesses. Fully editable vector files.',
      price: 49.99,
      category: 'graphics',
      rating: 4.9,
      reviews: 89,
      downloads: 890,
      thumbnail: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=600',
      author: {
        name: 'Alex Creative',
        avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100'
      },
      tags: ['logo', 'branding', 'minimalist', 'vector'],
      isInWishlist: false
    },
    {
      id: '3',
      title: 'Web Development E-book',
      description: 'Complete guide to modern web development with React and Node.js. Over 400 pages of expert knowledge.',
      price: 19.99,
      category: 'ebooks',
      rating: 4.7,
      reviews: 203,
      downloads: 2100,
      thumbnail: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=600',
      author: {
        name: 'Tech Guru',
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100'
      },
      tags: ['web development', 'react', 'programming', 'nodejs'],
      isInWishlist: false
    },
    {
      id: '4',
      title: 'UI/UX Design System',
      description: 'Complete design system with 200+ components for Figma. Perfect for product designers.',
      price: 79.99,
      category: 'templates',
      rating: 5.0,
      reviews: 156,
      downloads: 980,
      thumbnail: 'https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg?auto=compress&cs=tinysrgb&w=600',
      author: {
        name: 'Design Masters',
        avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100'
      },
      tags: ['ui', 'ux', 'design system', 'figma'],
      isInWishlist: false
    },
    {
      id: '5',
      title: 'Photography Lightroom Presets',
      description: '100 professional Lightroom presets for portrait and landscape photography. One-click magic.',
      price: 24.99,
      category: 'graphics',
      rating: 4.6,
      reviews: 312,
      downloads: 3450,
      thumbnail: 'https://images.pexels.com/photos/1424239/pexels-photo-1424239.jpeg?auto=compress&cs=tinysrgb&w=600',
      author: {
        name: 'Photo Pro',
        avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=100'
      },
      tags: ['photography', 'lightroom', 'presets', 'editing'],
      isInWishlist: false
    },
    {
      id: '6',
      title: 'Marketing Strategy Blueprint',
      description: 'Comprehensive marketing strategy template with proven frameworks and real-world examples.',
      price: 39.99,
      category: 'ebooks',
      rating: 4.8,
      reviews: 178,
      downloads: 1680,
      thumbnail: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=600',
      author: {
        name: 'Marketing Wizard',
        avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100'
      },
      tags: ['marketing', 'strategy', 'business', 'growth'],
      isInWishlist: false
    },
  ];

  // Use mock products for now (replace with real products when ready)
  // Fetch products with ratings from database
  const [productsWithRatings, setProductsWithRatings] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  
  useEffect(() => {
    const fetchProductsWithRatings = async () => {
      try {
        setIsSearching(true);
        let query = supabase
          .from('products')
          .select('id, title, description, price, category, tags, user_id, sales_count, average_rating, review_count, product_files(storage_path)')
          .eq('is_public', true);

        // If search query exists, use full-text search
        if (searchQuery.trim()) {
          // Use textSearch for full-text search (if search_vector column exists)
          // Otherwise fall back to ilike pattern matching
          query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
        }

        query = query.order('created_at', { ascending: false });

        const { data, error } = await query;

        if (!error && data) {
          setProductsWithRatings(data);
        } else if (error) {
          console.error('Error fetching products:', error);
        }
      } catch (err) {
        console.error('Error fetching products with ratings:', err);
      } finally {
        setIsSearching(false);
      }
    };
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      fetchProductsWithRatings();
    }, searchQuery ? 300 : 0);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const displayProducts = productsWithRatings.length > 0 ? productsWithRatings.map((p: any) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    price: p.price,
    category: p.category,
    rating: Number(p.average_rating || 0),
    reviews: p.review_count || 0,
    downloads: p.sales_count || 0,
    thumbnail: p.product_files?.[0]?.storage_path || 'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg',
    author: {
      name: 'Product Owner',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg'
    },
    tags: p.tags || [],
    isInWishlist: isInWishlist(p.id),
    sellerId: p.user_id // Include seller ID for checkout
  })) : mockProducts.map(p => ({
    ...p,
    isInWishlist: isInWishlist(p.id),
  }));

  // Filter products (search is now done in database query, but we still filter by category, price, rating)
  const filteredProducts = displayProducts.filter(product => {
    // Search is now handled by database query, so we don't filter by searchQuery here
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    const matchesRating = product.rating >= minRating;

    return matchesCategory && matchesPrice && matchesRating;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'popular':
        return b.downloads - a.downloads;
      case 'newest':
        return 0; // Would need createdAt field
      default:
        return 0;
    }
  });

  const activeFiltersCount = [
    selectedCategory !== 'all',
    minRating > 0,
    priceRange[0] > 0 || priceRange[1] < 1000,
  ].filter(Boolean).length;

  // Handlers
  const toggleWishlist = async (productId: string) => {
    if (isInWishlist(productId)) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId);
    }
  };

  const handlePurchase = (product: MarketplaceProduct) => {
    setSelectedProduct(product);
    setShowCheckout(true);
  };

  const handleCheckoutSuccess = (orderId: string) => {
    toast.success('Purchase successful!');
    setShowCheckout(false);
    setSelectedProduct(null);
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setPriceRange([0, 1000]);
    setMinRating(0);
    setSearchQuery('');
  };

  useEffect(() => {
    fetchProducts();
    fetchWishlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 6 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ py: 4 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Box>
              <Typography variant="h3" fontWeight={800} gutterBottom>
                Marketplace
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Discover amazing digital products from creators worldwide
              </Typography>
            </Box>
            <Stack direction="row" spacing={2}>
              <Tooltip title="Wishlist">
                <Badge badgeContent={wishlist.length} color="error">
                  <Button
                    variant="outlined"
                    startIcon={<Favorite />}
                    onClick={() => navigate('/wishlist')}
                  >
                    Wishlist
                  </Button>
                </Badge>
              </Tooltip>
              <Tooltip title="Shopping Cart">
                <Badge badgeContent={0} color="primary">
                  <Button
                    variant="contained"
                    startIcon={<ShoppingCart />}
                    onClick={() => {/* Navigate to cart */}}
                  >
                    Cart
                  </Button>
                </Badge>
              </Tooltip>
            </Stack>
          </Stack>

          {/* Search Bar */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
            }}
          >
            <Stack spacing={3}>
              <Box sx={{ position: 'relative' }}>
                <TextField
                  fullWidth
                  placeholder="Search for digital products, templates, graphics..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowAutocomplete(true);
                  }}
                  onFocus={() => {
                    setShowAutocomplete(true);
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    endAdornment: searchQuery && (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => {
                          setSearchQuery('');
                          setShowAutocomplete(false);
                        }}>
                          <Clear />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'background.paper',
                    }
                  }}
                />
                {showAutocomplete && (
                  <SearchAutocomplete
                    searchQuery={searchQuery}
                    onSelect={(query) => {
                      setSearchQuery(query);
                      setShowAutocomplete(false);
                    }}
                    onClear={() => {
                      setSearchQuery('');
                      setShowAutocomplete(false);
                    }}
                    onClose={() => setShowAutocomplete(false)}
                  />
                )}
              </Box>

              {/* Quick Filters */}
              <Stack direction="row" spacing={2} flexWrap="wrap" alignItems="center">
                <FormControl size="small" sx={{ minWidth: 180 }}>
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={sortBy}
                    label="Sort By"
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    {sortOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {categories.slice(0, 6).map(category => (
                  <Chip
                    key={category.value}
                    label={`${category.icon} ${category.label}`}
                    onClick={() => setSelectedCategory(category.value)}
                    color={selectedCategory === category.value ? 'primary' : 'default'}
                    variant={selectedCategory === category.value ? 'filled' : 'outlined'}
                    sx={{ fontSize: '0.9rem' }}
                  />
                ))}

                <Button
                  variant={showFilters ? 'contained' : 'outlined'}
                  startIcon={showFilters ? <ExpandLess /> : <ExpandMore />}
                  endIcon={activeFiltersCount > 0 && (
                    <Chip label={activeFiltersCount} size="small" color="primary" />
                  )}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  Advanced Filters
                </Button>
              </Stack>

              {/* Advanced Filters */}
              <Collapse in={showFilters}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    bgcolor: alpha(theme.palette.primary.main, 0.03),
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6" fontWeight={700}>
                      Advanced Filters
                    </Typography>
                    <Button size="small" onClick={clearFilters} startIcon={<Clear />}>
                      Clear All
                    </Button>
                  </Stack>

                  <Grid container spacing={4}>
                    {/* Category */}
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel>Category</InputLabel>
                        <Select
                          value={selectedCategory}
                          label="Category"
                          onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                          {categories.map(category => (
                            <MenuItem key={category.value} value={category.value}>
                              {category.icon} {category.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Price Range */}
                    <Grid item xs={12} md={4}>
                      <Typography gutterBottom fontWeight={600}>
                        Price Range: ${priceRange[0]} - ${priceRange[1]}
                      </Typography>
                      <Slider
                        value={priceRange}
                        onChange={(_, newValue) => setPriceRange(newValue as number[])}
                        valueLabelDisplay="auto"
                        min={0}
                        max={1000}
                        step={10}
                      />
                    </Grid>

                    {/* Minimum Rating */}
                    <Grid item xs={12} md={4}>
                      <Typography gutterBottom fontWeight={600}>
                        Minimum Rating
                      </Typography>
                      <Rating
                        value={minRating}
                        onChange={(_, newValue) => setMinRating(newValue || 0)}
                        size="large"
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Collapse>
            </Stack>
          </Paper>

          {/* Results Info */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="body1" color="text.secondary">
              {sortedProducts.length} product{sortedProducts.length !== 1 ? 's' : ''} found
            </Typography>
            {activeFiltersCount > 0 && (
              <Chip
                label={`${activeFiltersCount} filter${activeFiltersCount > 1 ? 's' : ''} active`}
                onDelete={clearFilters}
                color="primary"
                variant="outlined"
              />
            )}
          </Stack>
        </Box>

        {/* Products Grid */}
        {sortedProducts.length === 0 ? (
          <Paper
            sx={{
              p: 8,
              textAlign: 'center',
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <ShoppingCart sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h5" fontWeight={700} gutterBottom>
              No products found
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={3}>
              Try adjusting your search or filters to find what you're looking for
            </Typography>
            <Button variant="contained" onClick={clearFilters}>
              Clear Filters
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={4}>
            {sortedProducts.map((product, index) => (
              <MotionGrid
                item
                xs={12}
                sm={6}
                md={4}
                lg={3}
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <MotionCard
                  whileHover={{ y: -8 }}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    border: `1px solid ${theme.palette.divider}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: theme.shadows[8],
                      '& .product-actions': {
                        opacity: 1,
                      },
                    },
                  }}
                >
                  {/* Image */}
                  <Box sx={{ position: 'relative', paddingTop: '66%' }}>
                    <CardMedia
                      component="img"
                      image={product.thumbnail}
                      alt={product.title}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                    {/* Overlay Actions */}
                    <Box
                      className="product-actions"
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        bgcolor: alpha(theme.palette.common.black, 0.4),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
                      }}
                    >
                      <IconButton
                        sx={{
                          bgcolor: 'background.paper',
                          '&:hover': { bgcolor: 'background.paper', transform: 'scale(1.1)' }
                        }}
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton
                        onClick={() => toggleWishlist(product.id)}
                        sx={{
                          bgcolor: 'background.paper',
                          '&:hover': { bgcolor: 'background.paper', transform: 'scale(1.1)' }
                        }}
                      >
                        {product.isInWishlist ? (
                          <Favorite color="error" />
                        ) : (
                          <FavoriteBorder />
                        )}
                      </IconButton>
                    </Box>
                    {/* Category Badge */}
                    <Chip
                      label={product.category}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        textTransform: 'capitalize',
                        fontWeight: 600,
                      }}
                      color="primary"
                    />
                  </Box>

                  {/* Content */}
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      gutterBottom
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        minHeight: '3.6em',
                        cursor: 'pointer',
                        '&:hover': { color: 'primary.main' }
                      }}
                      onClick={() => navigate(`/marketplace/product/${product.id}`)}
                    >
                      {product.title}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        minHeight: '2.8em',
                      }}
                    >
                      {product.description}
                    </Typography>

                    {/* Author */}
                    <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                      <Avatar
                        src={product.author.avatar}
                        alt={product.author.name}
                        sx={{ width: 24, height: 24 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {product.author.name}
                      </Typography>
                    </Stack>

                    {/* Rating & Stats */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Rating value={product.rating} precision={0.1} size="small" readOnly />
                        <Typography variant="caption" color="text.secondary">
                          ({product.reviews})
                        </Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Download sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {product.downloads}
                        </Typography>
                      </Stack>
                    </Stack>

                    {/* Tags */}
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" mb={2}>
                      {product.tags.slice(0, 2).map((tag, idx) => (
                        <Chip
                          key={idx}
                          label={tag}
                          size="small"
                          sx={{ fontSize: '0.7rem', height: 20 }}
                        />
                      ))}
                      {product.tags.length > 2 && (
                        <Chip
                          label={`+${product.tags.length - 2}`}
                          size="small"
                          sx={{ fontSize: '0.7rem', height: 20 }}
                        />
                      )}
                    </Stack>
                  </CardContent>

                  {/* Actions */}
                  <CardActions sx={{ p: 3, pt: 0 }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      width="100%"
                    >
                      <Typography variant="h5" fontWeight={800} color="primary.main">
                        ${product.price.toFixed(2)}
                      </Typography>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handlePurchase(product)}
                        startIcon={<ShoppingCart />}
                      >
                        Buy Now
                      </Button>
                    </Stack>
                  </CardActions>
                </MotionCard>
              </MotionGrid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Checkout Modal */}
      {showCheckout && selectedProduct && (
        <CheckoutModal
          isOpen={showCheckout}
          onClose={() => setShowCheckout(false)}
          product={{
            id: selectedProduct.id,
            title: selectedProduct.title,
            price: selectedProduct.price,
            thumbnail: selectedProduct.thumbnail,
            sellerId: selectedProduct.sellerId
          }}
          onSuccess={handleCheckoutSuccess}
        />
      )}
    </Box>
  );
};
