// pages/CartPage.jsx - Unified cart with proper number handling
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaPlus, FaMinus, FaCalendarAlt, FaShieldAlt } from 'react-icons/fa';
import { fetchCart, removeFromCartAsync, updateCartItemAsync } from '@/store/slices/cartSlice';
import axios from '../api/axios';
import { toast } from 'react-toastify';

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, totalAmount, loading } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [updating, setUpdating] = useState(false);

  // Fetch cart on page load
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated]);

  // Update rental days for rental items
  const updateRentalDays = async (itemId, rentalDays) => {
    if (rentalDays < 1) return;

    setUpdating(true);
    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + rentalDays);

      await axios.put(`/cart/update-rental/${itemId}/`, {
        rental_days: rentalDays,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0]
      });

      // Refresh cart after update
      await dispatch(fetchCart());
      toast.success('Rental days updated');
    } catch (error) {
      console.error('Update rental days error:', error);
      toast.error(error.response?.data?.error || 'Failed to update rental days');
    } finally {
      setUpdating(false);
    }
  };

  // Regular cart handlers
  const handleUpdateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return;
    try {
      await dispatch(updateCartItemAsync({ itemId, quantity })).unwrap();
      toast.success('Quantity updated');
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await dispatch(removeFromCartAsync(itemId)).unwrap();
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  // Helper to get full image URL
  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return '/images/placeholder.jpg';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    if (imagePath.startsWith('/media')) {
      return `http://127.0.0.1:8000${imagePath}`;
    }
    if (imagePath.startsWith('/images')) {
      return imagePath;
    }
    return `/images/${imagePath}`;
  };

  // Helper to get product image from cart item
  const getProductImage = (item) => {
    const imageUrl = item.product_image || item.image || item.product?.image || item.product?.product_image;
    return getFullImageUrl(imageUrl);
  };

  // Helper to get product name
  const getProductName = (item) => {
    return item.product_name || item.name || item.product?.name || 'Product';
  };

  // Helper to get product price
  const getProductPrice = (item) => {
    const price = item.product_price || item.price || item.product?.price || item.product?.final_price || 0;
    return typeof price === 'number' ? price : parseFloat(price) || 0;
  };

  // Helper to get product slug
  const getProductSlug = (item) => {
    return item.product_slug || item.slug || item.product?.slug || '#';
  };

  // FIXED: Calculate totals with proper number parsing
  const regularTotal = items.reduce((total, item) => {
    if (!item.is_rental) {
      const price = getProductPrice(item);
      const quantity = typeof item.quantity === 'number' ? item.quantity : parseInt(item.quantity) || 1;
      return total + (price * quantity);
    }
    return total;
  }, 0);

  const rentalTotal = items.reduce((total, item) => {
    if (item.is_rental) {
      const itemTotal = item.total_price || 0;
      return total + (typeof itemTotal === 'number' ? itemTotal : parseFloat(itemTotal) || 0);
    }
    return total;
  }, 0);

  const totalSecurityDeposit = items.reduce((total, item) => {
    if (item.is_rental) {
      const deposit = item.security_deposit || 0;
      return total + (typeof deposit === 'number' ? deposit : parseFloat(deposit) || 0);
    }
    return total;
  }, 0);

  // FIXED: Ensure all values are numbers before adding
  const grandTotal = (parseFloat(regularTotal) || 0) + (parseFloat(rentalTotal) || 0) + (parseFloat(totalSecurityDeposit) || 0);

  // FIXED: Calculate total items properly
  const numericTotalItems = items.reduce((total, item) => {
    const quantity = typeof item.quantity === 'number' ? item.quantity : parseInt(item.quantity) || 1;
    return total + quantity;
  }, 0);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container py-5 text-center">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow-sm border-0 rounded-4 p-5">
              <h3 className="mb-3">Please Login</h3>
              <p className="text-muted mb-4">You need to be logged in to view your cart.</p>
              <Link to="/login" className="btn btn-pink px-4 py-2 rounded-pill">
                Login to Continue
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="container py-5 text-center">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow-sm border-0 rounded-4 p-5">
              <i className="fas fa-shopping-cart fa-4x text-muted mb-4"></i>
              <h3 className="mb-3">Your Cart is Empty</h3>
              <p className="text-muted mb-4">Looks like you haven't added any items to your cart yet.</p>
              <Link to="/products" className="btn btn-pink px-4 py-2 rounded-pill">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-12">
          <h1 className="h2 mb-4 fw-bold">Shopping Cart</h1>
          {items.some(item => item.is_rental) && (
            <div className="alert alert-info mb-4">
              <i className="fas fa-info-circle me-2"></i>
              Rental items include security deposit which is refundable upon return. You can adjust rental days below.
            </div>
          )}
        </div>
      </div>

      <div className="row g-4">
        {/* Cart Items Section */}
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 rounded-4" style={{height:'auto'}}>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-borderless mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th scope="col" className="ps-4 py-3">Product</th>
                      <th scope="col" className="text-center py-3">Quantity / Rental Days</th>
                      <th scope="col" className="text-end py-3">Price</th>
                      <th scope="col" className="text-end pe-4 py-3">Total</th>
                      <th scope="col" className="text-end pe-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => {
                      const isRental = item.is_rental;
                      const quantity = typeof item.quantity === 'number' ? item.quantity : parseInt(item.quantity) || 1;
                      const itemId = item.id;
                      const productImage = getProductImage(item);
                      const productName = getProductName(item);
                      const productPrice = getProductPrice(item);
                      const productSlug = getProductSlug(item);

                      console.log('Cart item:', {
                        name: item.product_name,
                        is_rental: item.is_rental,
                        rental_days: item.rental_days,
                        start_date: item.start_date,
                        end_date: item.end_date,
                        rental_price_per_day: item.rental_price_per_day,
                        security_deposit: item.security_deposit
                      });

                      // Calculate total price based on item type
                      let totalPrice;
                      if (isRental) {
                        const rentalDays = typeof item.rental_days === 'number' ? item.rental_days : parseInt(item.rental_days) || 1;
                        const rentalPricePerDay = item.rental_price_per_day ? (typeof item.rental_price_per_day === 'number' ? item.rental_price_per_day : parseFloat(item.rental_price_per_day) || 0) : productPrice;
                        totalPrice = quantity * rentalPricePerDay * rentalDays;
                      } else {
                        totalPrice = productPrice * quantity;
                      }

                      const startDate = item.start_date ? new Date(item.start_date) : null;
                      const endDate = item.end_date ? new Date(item.end_date) : null;
                      const securityDeposit = item.security_deposit ? (typeof item.security_deposit === 'number' ? item.security_deposit : parseFloat(item.security_deposit) || 0) : 0;
                      const rentalPricePerDay = item.rental_price_per_day ? (typeof item.rental_price_per_day === 'number' ? item.rental_price_per_day : parseFloat(item.rental_price_per_day) || 0) : productPrice;
                      const rentalDaysNum = typeof item.rental_days === 'number' ? item.rental_days : parseInt(item.rental_days) || 1;

                      return (
                        <tr key={itemId} className="border-bottom">
                          <td className="ps-4 py-3">
                            <div className="d-flex align-items-center gap-3">
                              <img
                                src={productImage}
                                alt={productName}
                                className="rounded-3"
                                style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = '/images/placeholder.jpg';
                                }}
                              />
                              <div>
                                <Link
                                  to={`/products/${productSlug}`}
                                  className="text-dark text-decoration-none fw-semibold hover-pink"
                                >
                                  {productName}
                                </Link>
                                {isRental && (
                                  <div className="mt-2">
                                    <span className="badge bg-success me-2" style={{ fontSize: '10px' }}>
                                      <FaCalendarAlt className="me-1" size={10} />
                                      RENTAL
                                    </span>
                                    <div className="mt-1">
                                      {startDate && endDate && (
                                        <small className="text-muted d-block">
                                          <i className="fas fa-calendar-alt me-1"></i>
                                          <strong>Rental Period:</strong> {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                                        </small>
                                      )}
                                      <small className="text-muted d-block">
                                        <FaShieldAlt className="me-1" size={10} />
                                        <strong>Security Deposit:</strong> ₹{securityDeposit.toFixed(2)}
                                      </small>
                                      <small className="text-muted d-block">
                                        <i className="fas fa-tag me-1"></i>
                                        <strong>Rate:</strong> ₹{rentalPricePerDay.toFixed(2)}/day
                                      </small>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="text-center py-3 align-middle">
                            {isRental ? (
                              <div className="d-flex flex-column align-items-center gap-1">
                                <div className="d-flex align-items-center justify-content-center gap-2">
                                  <button
                                    onClick={() => updateRentalDays(itemId, rentalDaysNum - 1)}
                                    className="btn btn-outline-secondary btn-sm rounded-circle"
                                    style={{ width: '32px', height: '32px' }}
                                    disabled={rentalDaysNum <= 1 || updating}
                                  >
                                    <FaMinus size={12} />
                                  </button>
                                  <span className="fw-semibold" style={{ width: '50px', textAlign: 'center' }}>
                                    {rentalDaysNum} days
                                  </span>
                                  <button
                                    onClick={() => updateRentalDays(itemId, rentalDaysNum + 1)}
                                    className="btn btn-outline-secondary btn-sm rounded-circle"
                                    style={{ width: '32px', height: '32px' }}
                                    disabled={updating}
                                  >
                                    <FaPlus size={12} />
                                  </button>
                                </div>
                                <small className="text-muted">Rental period</small>
                              </div>
                            ) : (
                              <div className="d-flex align-items-center justify-content-center gap-2">
                                <button
                                  onClick={() => handleUpdateQuantity(itemId, quantity - 1)}
                                  className="btn btn-outline-secondary btn-sm rounded-circle"
                                  style={{ width: '32px', height: '32px' }}
                                >
                                  <FaMinus size={12} />
                                </button>
                                <span className="fw-semibold" style={{ width: '40px', textAlign: 'center' }}>
                                  {quantity}
                                </span>
                                <button
                                  onClick={() => handleUpdateQuantity(itemId, quantity + 1)}
                                  className="btn btn-outline-secondary btn-sm rounded-circle"
                                  style={{ width: '32px', height: '32px' }}
                                >
                                  <FaPlus size={12} />
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="text-end py-3 align-middle">
                            {isRental ? (
                              <div>
                                <span className="text-muted">₹{rentalPricePerDay.toFixed(2)}/day</span>
                                <br />
                                <small className="text-muted">Deposit: ₹{securityDeposit.toFixed(2)}</small>
                              </div>
                            ) : (
                              <span className="text-muted">₹{productPrice.toFixed(2)}</span>
                            )}
                          </td>
                          <td className="text-end pe-4 py-3 align-middle">
                            <span className="fw-bold text-dark">₹{totalPrice.toFixed(2)}</span>
                          </td>
                          <td className="text-end pe-4 py-3 align-middle">
                            <button
                              onClick={() => handleRemoveItem(itemId)}
                              className="btn btn-link text-danger p-0 text-decoration-none"
                            >
                              <FaTrash size={18} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary Section */}
        <div className="col-lg-4">
          <div className="card border-0 rounded-4 shadow-sm" style={{ backgroundColor: '#fce4ec' }}>
            <div className="card-body p-4">
              <h5 className="fw-bold mb-4">Order Summary</h5>

              <div className="mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Items ({numericTotalItems}):</span>
                  <span className="fw-semibold">₹{(regularTotal + rentalTotal).toFixed(2)}</span>
                </div>
                {totalSecurityDeposit > 0 && (
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Security Deposit:</span>
                    <span className="fw-semibold">₹{totalSecurityDeposit.toFixed(2)}</span>
                  </div>
                )}
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Shipping:</span>
                  <span className="text-success fw-semibold">Free</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Tax (GST):</span>
                  <span className="fw-semibold">Included</span>
                </div>
              </div>

              <hr className="my-3" />

              <div className="d-flex justify-content-between mb-4">
                <span className="fw-bold fs-5">Total Amount:</span>
                <span className="fw-bold fs-5 text-pink">₹{grandTotal.toFixed(2)}</span>
              </div>

              <Link
                to="/checkout"
                className="btn w-100 py-3 rounded-pill fw-semibold"
                style={{ backgroundColor: '#d63384', color: 'white', border: 'none' }}
              >
                Proceed to Checkout
              </Link>

              <div className="text-center mt-3">
                <Link to="/products" className="text-decoration-none small text-muted">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;