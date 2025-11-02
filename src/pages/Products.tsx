import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, MoreVertical, Edit, Trash2, Eye, Download } from 'lucide-react';
import { useProductStore } from '../store/productStore';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const Products: React.FC = () => {
  const { products, deleteProduct } = useProductStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showDropdown, setShowDropdown] = useState<string | null>(null);

  const categories = ['all', 'templates', 'ebooks', 'graphics', 'software', 'audio', 'video'];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProduct(productId);
      setShowDropdown(null);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-white">
      <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-1">Products</h1>
            <p className="text-gray-600 dark:text-gray-400 text-base">Manage your digital products and track performance</p>
          </div>
          <Button asChild className="w-full sm:w-auto bg-primary-500 hover:bg-primary-500/90 text-white border border-primary-500 dark:border-primary-500">
            <Link to="/products/upload">
              <Plus className="h-5 w-5 mr-2 text-white" /> Upload Product
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <Card className="p-4 sm:p-6 bg-white dark:bg-white border border-gray-300 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-50 placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-slate focus:border-slate text-sm sm:text-base"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:space-x-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-50 rounded-lg focus:ring-2 focus:ring-slate focus:border-slate text-sm sm:text-base"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
              <Button variant="outline" className="flex items-center space-x-2 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-50 bg-primary-500 hover:bg-primary-500/90 text-white border border-primary-500 dark:border-primary-500">
                <Filter className="h-4 w-4 text-white" />
                <span>More Filters</span>
              </Button>
            </div>
          </div>
        </Card>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <Card className="p-8 sm:p-12 text-center flex flex-col items-center justify-center bg-white dark:bg-white border border-gray-300 dark:border-gray-700">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-50 mb-2">No products found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm sm:text-base">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Get started by uploading your first digital product'
              }
            </p>
            <Button asChild className="inline-flex items-center space-x-2 justify-center bg-primary-500 hover:bg-primary-500/90 text-white border border-primary-500 dark:border-primary-500">
              <Link to="/products/upload">
                <Plus className="h-5 w-5 mr-2 text-white" /> Upload Product
              </Link>
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col h-full"
              >
                <Card className="flex flex-col h-full overflow-hidden p-0 bg-white dark:bg-white border border-gray-300 dark:border-gray-700">
                  <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 dark:from-gray-900 dark:to-gray-800 relative">
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                      <span className="text-gray-50 text-lg font-semibold">
                        {product.title.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowDropdown(showDropdown === product.id ? null : product.id)}
                          className="p-2 bg-gray-900 dark:bg-gray-100 bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all border border-gray-700 dark:border-gray-300"
                        >
                          <MoreVertical className="h-4 w-4 text-gray-400" />
                        </Button>
                        {showDropdown === product.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-gray-900 dark:bg-gray-100 rounded-lg shadow-lg border border-gray-700 dark:border-gray-300 py-1 z-10">
                            <Button variant="ghost" className="w-full px-4 py-2 text-left flex items-center space-x-2 text-gray-900 dark:text-gray-50 hover:bg-slate hover:dark:bg-slate" asChild>
                              <span><Eye className="h-4 w-4" /> View Details</span>
                            </Button>
                            <Button variant="ghost" className="w-full px-4 py-2 text-left flex items-center space-x-2 text-gray-900 dark:text-gray-50 hover:bg-slate hover:dark:bg-slate" asChild>
                              <span><Edit className="h-4 w-4" /> Edit Product</span>
                            </Button>
                            <Button variant="ghost" className="w-full px-4 py-2 text-left flex items-center space-x-2 text-gray-900 dark:text-gray-50 hover:bg-slate hover:dark:bg-slate" asChild>
                              <span><Download className="h-4 w-4" /> Download Files</span>
                            </Button>
                            <hr className="my-1 border-gray-300 dark:border-gray-700" />
                            <Button
                              variant="destructive"
                              className="w-full px-4 py-2 text-left flex items-center space-x-2 text-red-600 hover:bg-slate hover:dark:bg-slate"
                              onClick={() => handleDeleteProduct(product.id)}
                            >
                              <Trash2 className="h-4 w-4" /> Delete
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-800 text-gray-200">
                        {product.category}
                      </span>
                      <span className="text-lg font-bold text-gray-900 dark:text-gray-50">${product.price}</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2 line-clamp-2">
                      {product.title}
                    </h3>
                    <p className="text-gray-400 text-xs sm:text-sm mb-4 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
                      <span>{product.sales} sales</span>
                      <span>${product.revenue.toFixed(2)} revenue</span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-700">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Updated {formatDistanceToNow(new Date(product.updatedAt))} ago</span>
                        <span className={`px-2 py-1 rounded-full ${
                          product.isPublic 
                            ? 'bg-green-900 text-green-300' 
                            : 'bg-yellow-900 text-yellow-300'
                        }`}>
                          {product.isPublic ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};