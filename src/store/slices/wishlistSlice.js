// store/slices/wishlistSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '@/api/axios';
import { toast } from 'react-toastify';

// Fetch wishlist items
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/wishlist/');
      return response.data;
    } catch (error) {
      console.error('Fetch wishlist error:', error);
      return rejectWithValue(error.response?.data || 'Failed to fetch wishlist');
    }
  }
);

// Add item to wishlist
export const addToWishlist = createAsyncThunk(
  'wishlist/addToWishlist',
  async (productId, { rejectWithValue }) => {
    try {
      // Try different possible endpoints
      let response;
      try {
        response = await axios.post('/wishlist/', { product_id: productId });
      } catch (firstError) {
        try {
          response = await axios.post('/wishlist/add/', { product_id: productId });
        } catch (secondError) {
          try {
            response = await axios.post(`/wishlist/${productId}/`, { product_id: productId });
          } catch (thirdError) {
            response = await axios.post('/wishlist/add-to-wishlist/', { product_id: productId });
          }
        }
      }
      
      toast.success('Added to wishlist!');
      return response.data;
    } catch (error) {
      console.error('Add to wishlist error:', error);
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Failed to add to wishlist');
      return rejectWithValue(error.response?.data || 'Failed to add to wishlist');
    }
  }
);

// Remove item from wishlist
export const removeFromWishlist = createAsyncThunk(
  'wishlist/removeFromWishlist',
  async (productId, { rejectWithValue }) => {
    try {
      // Try different possible endpoints
      let response;
      try {
        response = await axios.delete(`/wishlist/${productId}/`);
      } catch (firstError) {
        try {
          response = await axios.delete(`/wishlist/remove/${productId}/`);
        } catch (secondError) {
          response = await axios.delete(`/wishlist/remove-from-wishlist/${productId}/`);
        }
      }
      
      toast.success('Removed from wishlist');
      return productId;
    } catch (error) {
      console.error('Remove from wishlist error:', error);
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Failed to remove from wishlist');
      return rejectWithValue(error.response?.data || 'Failed to remove from wishlist');
    }
  }
);

// Clear wishlist
export const clearWishlist = createAsyncThunk(
  'wishlist/clearWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post('/wishlist/clear/', {});
      toast.success('Wishlist cleared');
      return response.data;
    } catch (error) {
      console.error('Clear wishlist error:', error);
      toast.error(error.response?.data?.error || 'Failed to clear wishlist');
      return rejectWithValue(error.response?.data || 'Failed to clear wishlist');
    }
  }
);

// Toggle wishlist (add if not exists, remove if exists)
export const toggleWishlist = createAsyncThunk(
  'wishlist/toggleWishlist',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await axios.post('/wishlist/toggle/', { product_id: productId });
      if (response.data.added) {
        toast.success('Added to wishlist!');
      } else {
        toast.success('Removed from wishlist');
      }
      return response.data;
    } catch (error) {
      console.error('Toggle wishlist error:', error);
      toast.error(error.response?.data?.error || 'Failed to update wishlist');
      return rejectWithValue(error.response?.data || 'Failed to update wishlist');
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: [],
    loading: false,
    error: null,
    totalItems: 0,
  },
  reducers: {
    resetWishlistError: (state) => {
      state.error = null;
    },
    updateWishlistLocal: (state, action) => {
      const productId = action.payload;
      const existingIndex = state.items.findIndex(item => item.id === productId);
      if (existingIndex >= 0) {
        state.items.splice(existingIndex, 1);
      } else {
        // Add temporary item until refresh
        state.items.push({ id: productId, name: 'Loading...' });
      }
      state.totalItems = state.items.length;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch wishlist
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || action.payload.results || action.payload || [];
        state.totalItems = state.items.length;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch wishlist';
      })
      
      // Add to wishlist
      .addCase(addToWishlist.pending, (state) => {
        state.loading = true;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.loading = false;
        const newItem = action.payload.item || action.payload;
        if (newItem && !state.items.some(item => item.id === newItem.id)) {
          state.items.unshift(newItem);
        }
        state.totalItems = state.items.length;
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to add to wishlist';
      })
      
      // Remove from wishlist
      .addCase(removeFromWishlist.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(item => item.id !== action.payload);
        state.totalItems = state.items.length;
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to remove from wishlist';
      })
      
      // Toggle wishlist
      .addCase(toggleWishlist.pending, (state) => {
        state.loading = true;
      })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.added) {
          const newItem = action.payload.item || { id: action.payload.product_id };
          if (!state.items.some(item => item.id === newItem.id)) {
            state.items.unshift(newItem);
          }
        } else {
          state.items = state.items.filter(item => item.id !== action.payload.product_id);
        }
        state.totalItems = state.items.length;
      })
      .addCase(toggleWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update wishlist';
      })
      
      // Clear wishlist
      .addCase(clearWishlist.pending, (state) => {
        state.loading = true;
      })
      .addCase(clearWishlist.fulfilled, (state) => {
        state.loading = false;
        state.items = [];
        state.totalItems = 0;
      })
      .addCase(clearWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to clear wishlist';
      });
  },
});

export const { resetWishlistError, updateWishlistLocal } = wishlistSlice.actions;
export default wishlistSlice.reducer;   