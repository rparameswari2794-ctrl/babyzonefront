// store/index.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import wishlistReducer from './slices/wishlistSlice'; 

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
  },
});

// Optional: For debugging in development
if (import.meta.env.DEV) {
  console.log('Store configured with reducers:', {
    auth: 'authReducer',
    cart: 'cartReducer',
    wishlist: 'wishlistReducer',
  });
}