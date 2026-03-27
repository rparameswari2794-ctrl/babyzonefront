// store/slices/cartSlice.js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from '../../api/axios';

// Initial state
const initialState = {
  items: [],
  totalAmount: 0,
  totalItems: 0,
  loading: false,
  error: null,
};

// Async thunks - MAKE SURE TO EXPORT THESE
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/cart/');
      console.log('Fetch cart response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Fetch cart error:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const addToCartAsync = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity = 1 }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/cart/add/', { product_id: productId, quantity });
      console.log('Add to cart response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Add to cart error:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateCartItemAsync = createAsyncThunk(
  'cart/updateCartItem',
  async ({ itemId, quantity }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/cart/update/', { item_id: itemId, quantity });
      console.log('Update cart response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Update cart error:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const removeFromCartAsync = createAsyncThunk(
  'cart/removeFromCart',
  async (itemId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/cart/remove/${itemId}/`);
      console.log('Remove from cart response:', response.data);
      return { itemId, data: response.data };
    } catch (error) {
      console.error('Remove from cart error:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const clearCartAsync = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post('/cart/clear/');
      console.log('Clear cart response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Clear cart error:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Cart slice
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Sync actions for immediate updates (useful for optimistic updates)
    addItem: (state, action) => {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
      state.totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
      state.totalAmount = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },
    removeItem: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      state.totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
      state.totalAmount = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },
    updateItemQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find(item => item.id === id);
      if (item) {
        item.quantity = quantity;
      }
      state.totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
      state.totalAmount = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },
    clearCart: (state) => {
      state.items = [];
      state.totalAmount = 0;
      state.totalItems = 0;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        // Handle different response structures
        if (action.payload && action.payload.items) {
          state.items = action.payload.items;
          state.totalAmount = action.payload.total_amount || 0;
          state.totalItems = action.payload.total_items || state.items.reduce((sum, item) => sum + item.quantity, 0);
        } else if (Array.isArray(action.payload)) {
          state.items = action.payload;
          state.totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
          state.totalAmount = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        }
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add to cart
      .addCase(addToCartAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(addToCartAsync.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload.items) {
          state.items = action.payload.items;
          state.totalAmount = action.payload.total_amount || 0;
          state.totalItems = action.payload.total_items || state.items.reduce((sum, item) => sum + item.quantity, 0);
        }
      })
      .addCase(addToCartAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update cart item
      .addCase(updateCartItemAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCartItemAsync.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload.items) {
          state.items = action.payload.items;
          state.totalAmount = action.payload.total_amount || 0;
          state.totalItems = action.payload.total_items || state.items.reduce((sum, item) => sum + item.quantity, 0);
        }
      })
      .addCase(updateCartItemAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Remove from cart
      .addCase(removeFromCartAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeFromCartAsync.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload.data && action.payload.data.items) {
          state.items = action.payload.data.items;
          state.totalAmount = action.payload.data.total_amount || 0;
          state.totalItems = action.payload.data.total_items || state.items.reduce((sum, item) => sum + item.quantity, 0);
        } else {
          // If API doesn't return full cart, remove item locally
          state.items = state.items.filter(item => item.id !== action.payload.itemId);
          state.totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
          state.totalAmount = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        }
      })
      .addCase(removeFromCartAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Clear cart
      .addCase(clearCartAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(clearCartAsync.fulfilled, (state) => {
        state.loading = false;
        state.items = [];
        state.totalAmount = 0;
        state.totalItems = 0;
        state.error = null;
      })
      .addCase(clearCartAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export actions
export const { 
  addItem, 
  removeItem, 
  updateItemQuantity, 
  clearCart 
} = cartSlice.actions;

// Export reducer as default
export default cartSlice.reducer;