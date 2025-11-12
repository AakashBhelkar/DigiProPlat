import React, { useState, useEffect, useRef } from 'react';
import {
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Box,
  Chip,
  Stack,
  ClickAwayListener,
} from '@mui/material';
import {
  Search as SearchIcon,
  TrendingUp,
  History,
  Clear,
} from '@mui/icons-material';
import { supabase } from '../../lib/supabase';

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'popular' | 'recent' | 'suggestion';
  category?: string;
}

interface SearchAutocompleteProps {
  searchQuery: string;
  onSelect: (query: string) => void;
  onClear?: () => void;
  maxSuggestions?: number;
  onClose?: () => void;
}

const RECENT_SEARCHES_KEY = 'marketplace_recent_searches';
const MAX_RECENT_SEARCHES = 5;

export const SearchAutocomplete: React.FC<SearchAutocompleteProps> = ({
  searchQuery,
  onSelect,
  onClear,
  maxSuggestions = 8,
  onClose,
}) => {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (stored) {
      try {
        const recent = JSON.parse(stored);
        setRecentSearches(Array.isArray(recent) ? recent : []);
      } catch {
        setRecentSearches([]);
      }
    }
  }, []);

  // Fetch popular searches from database (product titles/categories)
  useEffect(() => {
    const fetchPopularSearches = async () => {
      try {
        // Get popular product titles (most viewed/sold)
        const { data: products } = await supabase
          .from('products')
          .select('title, category, sales_count')
          .eq('is_public', true)
          .order('sales_count', { ascending: false })
          .limit(10);

        if (products) {
          // Extract unique titles and categories
          const titles = new Set<string>();
          const categories = new Set<string>();
          
          products.forEach((product: any) => {
            if (product.title) {
              titles.add(product.title);
            }
            if (product.category) {
              categories.add(product.category);
            }
          });

          setPopularSearches([
            ...Array.from(titles).slice(0, 5),
            ...Array.from(categories).slice(0, 3),
          ]);
        }
      } catch (error) {
        console.error('Error fetching popular searches:', error);
      }
    };

    fetchPopularSearches();
  }, []);

  // Fetch search suggestions as user types
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchQuery.trim() || searchQuery.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        // Search product titles and categories
        const { data: products } = await supabase
          .from('products')
          .select('title, category')
          .eq('is_public', true)
          .or(`title.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`)
          .limit(10);

        const productSuggestions: SearchSuggestion[] = [];
        if (products) {
          products.forEach((product: any) => {
            if (product.title?.toLowerCase().includes(searchQuery.toLowerCase())) {
              productSuggestions.push({
                id: `product-${product.title}`,
                text: product.title,
                type: 'suggestion',
                category: product.category,
              });
            }
            if (product.category?.toLowerCase().includes(searchQuery.toLowerCase())) {
              productSuggestions.push({
                id: `category-${product.category}`,
                text: product.category,
                type: 'suggestion',
                category: product.category,
              });
            }
          });
        }

        // Remove duplicates
        const uniqueSuggestions = productSuggestions.filter(
          (suggestion, index, self) =>
            index === self.findIndex((s) => s.text === suggestion.text)
        );

        setSuggestions(uniqueSuggestions.slice(0, maxSuggestions));
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchSuggestions();
    }, 300); // Debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery, maxSuggestions]);

  const handleSelect = (query: string) => {
    // Save to recent searches
    const updated = [
      query,
      ...recentSearches.filter((s) => s !== query),
    ].slice(0, MAX_RECENT_SEARCHES);
    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));

    setIsOpen(false);
    onSelect(query);
  };

  const handleClickAway = () => {
    setIsOpen(false);
    if (onClose) {
      onClose();
    }
  };

  const handleClearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  // Show suggestions if there's a query, or show popular/recent if no query
  const showSuggestions = searchQuery.trim().length >= 2;
  const showPopularRecent = !searchQuery.trim() && (recentSearches.length > 0 || popularSearches.length > 0);

  // Auto-open when user starts typing or focuses on empty field
  useEffect(() => {
    if (showSuggestions || showPopularRecent) {
      setIsOpen(true);
    }
  }, [showSuggestions, showPopularRecent]);

  if (!isOpen || (!showSuggestions && !showPopularRecent)) {
    return null;
  }

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Paper
        ref={containerRef}
        elevation={8}
        sx={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          mt: 1,
          zIndex: 1300,
          maxHeight: 400,
          overflow: 'auto',
        }}
      >
      {showSuggestions && (
        <List dense>
          {isLoading ? (
            <ListItem>
              <ListItemText primary="Searching..." />
            </ListItem>
          ) : suggestions.length > 0 ? (
            <>
              <ListItem>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Suggestions
                </Typography>
              </ListItem>
              {suggestions.map((suggestion) => (
                <ListItemButton
                  key={suggestion.id}
                  onClick={() => handleSelect(suggestion.text)}
                >
                  <ListItemIcon>
                    <SearchIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={suggestion.text}
                    secondary={suggestion.category && `Category: ${suggestion.category}`}
                  />
                </ListItemButton>
              ))}
            </>
          ) : (
            <ListItem>
              <ListItemText primary="No suggestions found" />
            </ListItem>
          )}
        </List>
      )}

      {showPopularRecent && (
        <List dense>
          {recentSearches.length > 0 && (
            <>
              <ListItem>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: '100%' }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <History fontSize="small" color="action" />
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Recent Searches
                    </Typography>
                  </Stack>
                  <Chip
                    label="Clear"
                    size="small"
                    onClick={handleClearRecent}
                    icon={<Clear fontSize="small" />}
                    sx={{ cursor: 'pointer' }}
                  />
                </Stack>
              </ListItem>
              {recentSearches.map((search, index) => (
                <ListItemButton
                  key={`recent-${index}`}
                  onClick={() => handleSelect(search)}
                >
                  <ListItemIcon>
                    <History fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={search} />
                </ListItemButton>
              ))}
              {popularSearches.length > 0 && <Divider sx={{ my: 1 }} />}
            </>
          )}

          {popularSearches.length > 0 && (
            <>
              <ListItem>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <TrendingUp fontSize="small" color="action" />
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Popular Searches
                  </Typography>
                </Stack>
              </ListItem>
              {popularSearches.slice(0, 5).map((search, index) => (
                <ListItemButton
                  key={`popular-${index}`}
                  onClick={() => handleSelect(search)}
                >
                  <ListItemIcon>
                    <TrendingUp fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={search} />
                </ListItemButton>
              ))}
            </>
          )}
        </List>
      )}
      </Paper>
    </ClickAwayListener>
  );
};

