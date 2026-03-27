import axios from '../api/axios';

const cartService = {
    // Get user's cart
    // Get user's cart
    getCart: async () => {
        try {
            const response = await axios.get('/cart/');
            console.log('Cart response:', response.data); // Add this
            return response.data;
        } catch (error) {
            console.error('Error fetching cart:', error);
            throw error;
        }
    },

    // Add item to cart
    addToCart: async (productId, quantity) => {
        try {
            const response = await axios.post('/cart/add/', {
                product_id: productId,
                quantity: quantity
            });
            return response.data;
        } catch (error) {
            console.error('Error adding to cart:', error);
            throw error;
        }
    },

    // Update cart item quantity
    updateCartItem: async (itemId, quantity) => {
        try {
            const response = await axios.post('/cart/update/', {
                item_id: itemId,
                quantity: quantity
            });
            return response.data;
        } catch (error) {
            console.error('Error updating cart:', error);
            throw error;
        }
    },

    // Remove item from cart
    removeFromCart: async (itemId) => {
        try {
            const response = await axios.delete(`/cart/remove/${itemId}/`);
            return response.data;
        } catch (error) {
            console.error('Error removing from cart:', error);
            throw error;
        }
    },

    // Clear cart
    clearCart: async () => {
        try {
            const response = await axios.delete('/cart/clear/');
            return response.data;
        } catch (error) {
            console.error('Error clearing cart:', error);
            throw error;
        }
    }
};

export default cartService;