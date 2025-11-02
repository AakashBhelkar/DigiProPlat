import React, { useState } from 'react';
import { Heart, X, ShoppingCart, Share2, Filter, Grid, List } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

interface WishlistItem {
  id: string;
  productId: string;
  productTitle: string;
  productDescription: string;
  productPrice: number;
  productCategory: string;
  productThumbnail: string;
  authorName: string;
  rating: number;
  reviewCount: number;
  addedAt: string;
  isAvailable: boolean;
  priceChanged: boolean;
  originalPrice?: number;
}

interface WishlistManagerProps {
  items: WishlistItem[];
  onRemoveItem: (id: string) => void;
  onAddToCart: (productId: string) => void;
  onShareWishlist: () => void;
  onViewProduct: (productId: string) => void;
}

export const WishlistManager: React.FC<WishlistManagerProps> = ({
  items,
  onRemoveItem,
  onAddToCart,
  onShareWishlist,
  onViewProduct
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'price-low' | 'price-high' | 'name'>('newest');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const categories = Array.from(new Set(items.map(item => item.productCategory)));

  const sortedItems = [...items].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
      case 'price-low':
        return a.productPrice - b.productPrice;
      case 'price-high':
        return b.productPrice - a.productPrice;
      case 'name':
        return a.productTitle.localeCompare(b.productTitle);
      default: // newest
        return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
    }
  });

  const filteredItems = sortedItems.filter(item => 
    categoryFilter === 'all' || item.productCategory === categoryFilter
  );

  const totalValue = items.reduce((sum, item) => sum + item.productPrice, 0);
  const unavailableCount = items.filter(item => !item.isAvailable).length;
  const priceChangedCount = items.filter(item => item.priceChanged).length;

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <div
            key={star}
            className={`w-3 h-3 ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            ★
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
          <p className="text-gray-600">
            {items.length} item{items.length !== 1 ? 's' : ''} • Total value: ${totalValue.toFixed(2)}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={onShareWishlist}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </button>
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      {(unavailableCount > 0 || priceChangedCount > 0) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-4 text-sm">
            {unavailableCount > 0 && (
              <span className="text-yellow-800">
                {unavailableCount} item{unavailableCount !== 1 ? 's' : ''} no longer available
              </span>
            )}
            {priceChangedCount > 0 && (
              <span className="text-yellow-800">
                {priceChangedCount} item{priceChangedCount !== 1 ? 's' : ''} with price changes
              </span>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>

        {items.length > 0 && (
          <button
            onClick={() => {
              items.forEach(item => {
                if (item.isAvailable) {
                  onAddToCart(item.productId);
                }
              });
            }}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Add All to Cart
          </button>
        )}
      </div>

      {/* Items */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {items.length === 0 ? 'Your wishlist is empty' : 'No items match your filters'}
          </h3>
          <p className="text-gray-600">
            {items.length === 0 
              ? 'Start adding products you love to keep track of them here.'
              : 'Try adjusting your filters to see more items.'
            }
          </p>
        </div>
      ) : (
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow ${
                !item.isAvailable ? 'opacity-60' : ''
              } ${viewMode === 'list' ? 'flex' : ''}`}
            >
              {/* Product Image */}
              <div className={`${viewMode === 'list' ? 'w-48 flex-shrink-0' : 'aspect-video'} bg-gradient-to-br from-indigo-500 to-purple-600 relative`}>
                <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                  <span className="text-white text-lg font-semibold">
                    {item.productTitle.charAt(0).toUpperCase()}
                  </span>
                </div>
                
                {/* Status Badges */}
                <div className="absolute top-2 left-2 space-y-1">
                  {!item.isAvailable && (
                    <span className="inline-block px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                      Unavailable
                    </span>
                  )}
                  {item.priceChanged && (
                    <span className="inline-block px-2 py-1 bg-orange-500 text-white text-xs rounded-full">
                      Price Changed
                    </span>
                  )}
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => onRemoveItem(item.id)}
                  className="absolute top-2 right-2 p-1 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
                >
                  <X className="h-4 w-4 text-gray-600" />
                </button>
              </div>

              {/* Product Info */}
              <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                <div className={`${viewMode === 'list' ? 'flex items-start justify-between h-full' : ''}`}>
                  <div className={`${viewMode === 'list' ? 'flex-1 pr-4' : ''}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {item.productCategory}
                      </span>
                      <div className="flex items-center space-x-1">
                        {renderStars(item.rating)}
                        <span className="text-xs text-gray-500">({item.reviewCount})</span>
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {item.productTitle}
                    </h3>

                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {item.productDescription}
                    </p>

                    <p className="text-sm text-gray-500 mb-3">
                      by {item.authorName}
                    </p>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xl font-bold text-gray-900">
                          ${item.productPrice}
                        </span>
                        {item.priceChanged && item.originalPrice && (
                          <span className="ml-2 text-sm text-gray-500 line-through">
                            ${item.originalPrice}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        Added {formatDistanceToNow(new Date(item.addedAt))} ago
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className={`${viewMode === 'list' ? 'flex flex-col space-y-2' : 'flex items-center space-x-2 mt-4'}`}>
                    <button
                      onClick={() => onViewProduct(item.productId)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                    >
                      View
                    </button>
                    {item.isAvailable && (
                      <button
                        onClick={() => onAddToCart(item.productId)}
                        className="flex-1 bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm flex items-center justify-center space-x-1"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        <span>Add to Cart</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};