// App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { HelmetProvider } from 'react-helmet-async';
import 'react-toastify/dist/ReactToastify.css';
import { WishlistProvider } from '@/context/WishlistContext';

// Layout Components
import Layout from '@/components/Layout/Layout';

// Existing Pages
import HomePage from '@/pages/HomePage';
import ProductsPage from '@/pages/ProductsPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import CartPage from '@/pages/CartPage';
import CheckoutPage from '@/pages/CheckoutPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ProfilePage from '@/pages/ProfilePage';
import MyOrdersPage from '@/pages/MyOrdersPage';
import ForumPage from '@/pages/ForumPage';
import ParentingClassesPage from '@/pages/ParentingClassesPage';
import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';
import SubcategoryPage from '@/pages/SubCategoryPage';
import OrderSuccessPage from '@/pages/OrderSuccessPage';
import TrackOrderPage from './pages/TrackOrderPage';
import WishlistPage from './pages/WishlistPage';

// Components
import PrivateRoute from '@/components/common/PrivateRoute';
import NotFoundPage from '@/pages/NotFoundPage';

function App() {
  return (
    <WishlistProvider>
      <HelmetProvider>
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/subcategory/:slug" element={<SubcategoryPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:slug" element={<ProductDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/forum" element={<ForumPage />} />
            <Route path="/parenting-classes" element={<ParentingClassesPage />} />

            {/* Protected Routes (require login) */}
            <Route path="/cart" element={
              <PrivateRoute>
                <CartPage />
              </PrivateRoute>
            } />
            
            <Route path="/wishlist" element={
              <PrivateRoute>
                <WishlistPage />
              </PrivateRoute>
            } />
            
            <Route path="/checkout" element={
              <PrivateRoute>
                <CheckoutPage />
              </PrivateRoute>
            } />
            
            <Route path="/order-success" element={
              <PrivateRoute>
                <OrderSuccessPage />
              </PrivateRoute>
            } />
            
            <Route path="/profile" element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            } />
            
            <Route path="/orders" element={
              <PrivateRoute>
                <MyOrdersPage />
              </PrivateRoute>
            } />
            
            <Route path="/track-order" element={
              <PrivateRoute>
                <TrackOrderPage />
              </PrivateRoute>
            } />

            {/* 404 Not Found Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
        <ToastContainer 
          position="top-right" 
          autoClose={3000} 
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </HelmetProvider>
    </WishlistProvider>
  );
}

export default App;