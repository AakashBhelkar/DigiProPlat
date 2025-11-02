import React, { useState } from 'react';
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { AdvancedSearch } from '../components/Search/AdvancedSearch';
import { CheckoutModal } from '../components/Payment/CheckoutModal';

interface SearchFilters {
  query: string;
  category: string;
  tags: string[];
  priceRange: [number, number];
  sortBy: string;
}

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
}

export const Marketplace: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<MarketplaceProduct | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Mock marketplace products
  const [products] = useState<MarketplaceProduct[]>([
    {
      id: '1',
      title: 'Premium Social Media Templates',
      description: 'Professional Instagram and Facebook post templates for businesses',
      price: 29.99,
      category: 'templates',
      rating: 4.8,
      reviews: 124,
      downloads: 1250,
      thumbnail: 'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg',
      author: {
        name: 'Sarah Design',
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg'
      },
      tags: ['social media', 'instagram', 'business'],
      isInWishlist: false
    },
    {
      id: '2',
      title: 'Modern Logo Collection',
      description: 'Set of 50 minimalist logos perfect for startups and small businesses',
      price: 49.99,
      category: 'graphics',
      rating: 4.9,
      reviews: 89,
      downloads: 890,
      thumbnail: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg',
      author: {
        name: 'Alex Creative',
        avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg'
      },
      tags: ['logo', 'branding', 'minimalist'],
      isInWishlist: true
    },
    {
      id: '3',
      title: 'Web Development E-book',
      description: 'Complete guide to modern web development with React and Node.js',
      price: 19.99,
      category: 'ebooks',
      rating: 4.7,
      reviews: 203,
      downloads: 2100,
      thumbnail: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg',
      author: {
        name: 'Tech Guru',
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg'
      },
      tags: ['web development', 'react', 'programming'],
      isInWishlist: false
    }
  ]);

  const categories = ['templates', 'ebooks', 'graphics', 'software', 'audio', 'video'];
  const availableTags = ['social media', 'instagram', 'business', 'logo', 'branding', 'minimalist', 'web development', 'react', 'programming'];

  const handleSearch = (filters: SearchFilters) => {
    setIsSearching(true);
    // Simulate search delay
    setTimeout(() => {
      setIsSearching(false);
      console.log('Search filters:', filters);
    }, 1000);
  };

  const handleAddToWishlist = (productId: string) => {
    console.log('Add to wishlist:', productId);
  };

  const handlePurchase = (product: MarketplaceProduct) => {
    setSelectedProduct(product);
    setShowCheckout(true);
  };

  const handleCheckoutSuccess = (orderId: string) => {
    console.log('Purchase successful:', orderId);
    setShowCheckout(false);
    setSelectedProduct(null);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-white space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Marketplace</h1>
          <p className="text-gray-600 dark:text-gray-400">Discover amazing digital products from creators worldwide</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 border border-primary-500 dark:border-primary-500 bg-primary-500 text-white rounded-lg hover:bg-primary-500/90 transition-colors">
            <Heart className="h-4 w-4 text-white" />
            <span>Wishlist</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 border border-primary-500 dark:border-primary-500 bg-primary-500 text-white rounded-lg hover:bg-primary-500/90 transition-colors">
            <ShoppingCart className="h-4 w-4 text-white" />
            <span>Cart (0)</span>
          </button>
        </div>
      </div>

      {/* Advanced Search */}
      <AdvancedSearch
        onSearch={handleSearch}
        categories={categories}
        availableTags={availableTags}
        isLoading={isSearching}
      />

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="bg-white dark:bg-white rounded-lg shadow-sm border border-gray-300 dark:border-gray-700 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-50 mb-2">No products found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Try adjusting your search or filters, or check back later for new products.
          </p>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-white rounded-lg shadow-sm border border-gray-300 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow group"
          >
            {/* Product Image */}
            <div className="aspect-video bg-gray-100 relative overflow-hidden">
              <img
                src={product.thumbnail}
                alt={product.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-2">
                  <button className="p-2 bg-white dark:bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all">
                    <Eye className="h-4 w-4 text-gray-600 dark:text-gray-50" />
                  </button>
                  <button
                    onClick={() => handleAddToWishlist(product.id)}
                    className="p-2 bg-white dark:bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
                  >
                    <Heart className={`h-4 w-4 ${product.isInWishlist ? 'text-red-500 fill-current' : 'text-gray-600 dark:text-gray-50'}`} />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4">
              {/* Category Badge */}
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 mb-2">
                {product.category}
              </span>

              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2 line-clamp-2">
                {product.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                {product.description}
              </p>

              {/* Author */}
              <div className="flex items-center space-x-2 mb-3">
                <img
                  src={product.author.avatar}
                  alt={product.author.name}
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">{product.author.name}</span>
              </div>

              {/* Rating & Stats */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-50">{product.rating}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">({product.reviews})</span>
                </div>
                <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                  <span>{product.downloads} downloads</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {product.tags.slice(0, 2).map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-200 text-xs rounded-md"
                  >
                    {tag}
                  </span>
                ))}
                {product.tags.length > 2 && (
                  <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-200 text-xs rounded-md">
                    +{product.tags.length - 2}
                  </span>
                )}
              </div>

              {/* Price & Action */}
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-gray-900 dark:text-gray-50">${product.price}</span>
                <button
                  onClick={() => handlePurchase(product)}
                  className="px-4 py-2 border border-primary-500 dark:border-primary-500 bg-primary-500 text-white rounded-lg hover:bg-primary-500/90 transition-colors text-sm font-medium"
                >
                  Buy Now
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && selectedProduct && (
        <CheckoutModal
          isOpen={showCheckout}
          onClose={() => setShowCheckout(false)}
          product={{
            id: selectedProduct.id,
            title: selectedProduct.title,
            price: selectedProduct.price,
            thumbnail: selectedProduct.thumbnail
          }}
          onSuccess={handleCheckoutSuccess}
        />
      )}
    </div>
  );
};