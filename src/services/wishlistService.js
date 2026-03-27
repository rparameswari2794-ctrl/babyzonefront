// src/services/wishlistService.js
import axios from '@/api/axios';

const wishlistService = {
  // Get wishlist from backend
  getWishlistFromBackend: async () => {
    try {
      const response = await axios.get('/wishlist/');
      console.log('✅ Fetched wishlist from backend:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Fetch wishlist error:', error);
      return null;
    }
  },

  // Add to wishlist on backend
  addToWishlistBackend: async (productId) => {
    try {
      const response = await axios.post(`/wishlist/add/${productId}/`);
      console.log('✅ Added to backend wishlist:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Add to wishlist error:', error);
      return null;
    }
  },

  // Remove from wishlist on backend
  removeFromWishlistBackend: async (productId) => {
    try {
      const response = await axios.delete(`/wishlist/remove/${productId}/`);
      console.log('✅ Removed from backend wishlist:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Remove from wishlist error:', error);
      return null;
    }
  },

  // Sync local wishlist with backend
  syncLocalWithBackend: async (localWishlist) => {
    try {
      // First get backend wishlist
      const backendWishlist = await wishlistService.getWishlistFromBackend();
      
      if (!backendWishlist) {
        console.log('Backend not available, keeping local only');
        return { synced: false, items: localWishlist };
      }
      
      // Extract product IDs from backend
      let backendIds = [];
      if (backendWishlist && backendWishlist.items) {
        backendIds = backendWishlist.items.map(item => item.product?.id || item.id);
      } else if (Array.isArray(backendWishlist)) {
        backendIds = backendWishlist.map(item => item.product?.id || item.id);
      }
      
      // Extract product IDs from local
      const localIds = localWishlist.map(item => item.id);
      
      // Find items to add to backend (in local but not in backend)
      const toAdd = localIds.filter(id => !backendIds.includes(id));
      
      // Find items to remove from backend (in backend but not in local)
      const toRemove = backendIds.filter(id => !localIds.includes(id));
      
      console.log('To add to backend:', toAdd);
      console.log('To remove from backend:', toRemove);
      
      // Add missing items to backend
      for (const productId of toAdd) {
        await wishlistService.addToWishlistBackend(productId);
      }
      
      // Remove extra items from backend
      for (const productId of toRemove) {
        await wishlistService.removeFromWishlistBackend(productId);
      }
      
      return { synced: true, items: localWishlist };
    } catch (error) {
      console.error('Sync error:', error);
      return { synced: false, items: localWishlist };
    }
  }
};

export default wishlistService;