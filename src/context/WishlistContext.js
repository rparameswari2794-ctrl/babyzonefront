// src/context/WishlistContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import wishlistService from '../services/wishlistService';
import { toast } from 'react-toastify';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [syncing, setSyncing] = useState(false);

  // Load wishlist from localStorage
  const loadFromLocalStorage = useCallback(() => {
    try {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setWishlistItems(wishlist);
      setWishlistCount(wishlist.length);
    } catch (error) {
      console.error('Error loading wishlist:', error);
      setWishlistItems([]);
      setWishlistCount(0);
    }
  }, []);

  // Load wishlist from backend and merge with local
  const loadFromBackend = useCallback(async () => {
    setLoading(true);
    try {
      const backendData = await wishlistService.getWishlistFromBackend();
      
      if (backendData && backendData.items) {
        // Extract products from backend response
        const backendProducts = backendData.items.map(item => ({
          id: item.product?.id,
          name: item.product?.name,
          price: item.product?.price,
          image: item.product?.image,
          slug: item.product?.slug,
          selling_price: item.product?.selling_price,
          old_price: item.product?.old_price,
          rating: item.product?.rating,
          review_count: item.product?.review_count,
          stock_quantity: item.product?.stock
        })).filter(p => p.id);
        
        // Get local wishlist
        const localWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        
        // Merge: backend items take precedence, but keep local items not in backend
        const mergedItems = [...backendProducts];
        for (const localItem of localWishlist) {
          if (!backendProducts.some(p => p.id === localItem.id)) {
            mergedItems.push(localItem);
          }
        }
        
        setWishlistItems(mergedItems);
        localStorage.setItem('wishlist', JSON.stringify(mergedItems));
        setWishlistCount(mergedItems.length);
      } else {
        loadFromLocalStorage();
      }
    } catch (error) {
      console.error('Error loading from backend:', error);
      loadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  }, [loadFromLocalStorage]);

  // Initial load - sync with backend if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadFromBackend();
    } else {
      loadFromLocalStorage();
    }
  }, [isAuthenticated, loadFromBackend, loadFromLocalStorage]);

  // Update count and dispatch event whenever items change
  useEffect(() => {
    setWishlistCount(wishlistItems.length);
    window.dispatchEvent(new CustomEvent('wishlistUpdated', { 
      detail: { count: wishlistItems.length } 
    }));
  }, [wishlistItems]);

  // Add to wishlist
  const addToWishlist = useCallback(async (product) => {
    if (!product || !product.id) {
      toast.error('Invalid product');
      return false;
    }

    setLoading(true);
    try {
      // Add to backend if authenticated
      if (isAuthenticated) {
        await wishlistService.addToWishlistBackend(product.id);
      }
      
      // Update local storage
      const currentWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      
      if (currentWishlist.some(item => item.id === product.id)) {
        toast.info(`${product.name} is already in your wishlist`);
        return false;
      }
      
      const wishlistItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        selling_price: product.selling_price || product.price,
        image: product.image || product.image_url || 'https://placehold.co/300x300/ff69b4/white?text=No+Image',
        slug: product.slug || product.id,
        stock_quantity: product.stock_quantity,
        rating: product.rating,
        review_count: product.review_count,
        old_price: product.old_price
      };
      
      currentWishlist.push(wishlistItem);
      localStorage.setItem('wishlist', JSON.stringify(currentWishlist));
      setWishlistItems(currentWishlist);
      
      toast.success(`${product.name} added to wishlist`);
      return true;
    } catch (error) {
      console.error('Add to wishlist error:', error);
      toast.error('Failed to add to wishlist');
      return false;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Remove from wishlist
  const removeFromWishlist = useCallback(async (productId, productName) => {
    if (!productId) return false;

    setLoading(true);
    try {
      // Remove from backend if authenticated
      if (isAuthenticated) {
        await wishlistService.removeFromWishlistBackend(productId);
      }
      
      // Update local storage
      const currentWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      const updatedWishlist = currentWishlist.filter(item => item.id !== productId);
      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
      setWishlistItems(updatedWishlist);
      
      toast.success(`${productName || 'Item'} removed from wishlist`);
      return true;
    } catch (error) {
      console.error('Remove from wishlist error:', error);
      toast.error('Failed to remove from wishlist');
      return false;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Clear wishlist
  const clearWishlist = useCallback(async () => {
    if (!window.confirm('Are you sure you want to clear your entire wishlist?')) return;

    setLoading(true);
    try {
      // Remove all items from backend
      if (isAuthenticated && wishlistItems.length > 0) {
        for (const item of wishlistItems) {
          try {
            await wishlistService.removeFromWishlistBackend(item.id);
          } catch (e) {
            console.error(`Failed to remove ${item.id}:`, e);
          }
        }
      }
      
      // Clear local storage
      localStorage.removeItem('wishlist');
      setWishlistItems([]);
      toast.success('Wishlist cleared');
    } catch (error) {
      console.error('Clear wishlist error:', error);
      toast.error('Failed to clear wishlist');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, wishlistItems]);

  // Sync local wishlist with backend
  const syncWithBackend = useCallback(async () => {
    if (!isAuthenticated) {
      toast.info('Please login to sync with server');
      return;
    }
    
    setSyncing(true);
    try {
      const currentLocal = JSON.parse(localStorage.getItem('wishlist') || '[]');
      const result = await wishlistService.syncLocalWithBackend(currentLocal);
      
      if (result.synced) {
        setWishlistItems(result.items);
        localStorage.setItem('wishlist', JSON.stringify(result.items));
        toast.success('Wishlist synced with server');
      } else {
        toast.warning('Could not sync with server. Using local data.');
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Failed to sync wishlist');
    } finally {
      setSyncing(false);
    }
  }, [isAuthenticated]);

  // Check if product is in wishlist
  const isInWishlist = useCallback((productId) => {
    if (!productId) return false;
    return wishlistItems.some(item => item.id === productId);
  }, [wishlistItems]);

  // Refresh wishlist
  const refreshWishlist = useCallback(() => {
    if (isAuthenticated) {
      loadFromBackend();
    } else {
      loadFromLocalStorage();
    }
  }, [isAuthenticated, loadFromBackend, loadFromLocalStorage]);

  const value = {
    wishlistItems,
    wishlistCount,
    loading: loading || syncing,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
    refreshWishlist,
    syncWithBackend
  };

  return React.createElement(
    WishlistContext.Provider,
    { value },
    children
  );
};