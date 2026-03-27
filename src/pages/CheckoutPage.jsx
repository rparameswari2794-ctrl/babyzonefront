// pages/CheckoutPage.jsx - Clean version with unified cart only
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { clearCartAsync, fetchCart } from '@/store/slices/cartSlice';
import axios from '../api/axios';
import RazorpayPayment from '@/components/Payment/RazorpayPayment';

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cartState = useSelector((state) => state.cart);
  const items = cartState?.items || [];
  const totalAmount = cartState?.totalAmount || 0;
  const loading = cartState?.loading || false;

  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [formData, setFormData] = useState({
    shipping_name: user?.name || user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : '',
    shipping_email: user?.email || '',
    shipping_phone: user?.phone || '',
    shipping_address: '',
    city: '',
    pincode: '',
    payment_method: 'cod',
  });

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated]);

  const numericTotalAmount = typeof totalAmount === 'number' ? totalAmount : parseFloat(totalAmount) || 0;

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (e.target.name === 'payment_method') {
      setPaymentMethod(e.target.value);
    }
  };

  const getProductName = (item) => {
    return item.product_name || item.name || item.product?.name || 'Product';
  };

  const getProductPrice = (item) => {
    const price = item.product_price || item.price || item.product?.price || item.product?.final_price || 0;
    return typeof price === 'number' ? price : parseFloat(price) || 0;
  };

  // Calculate totals for summary display
  const getRegularTotal = () => {
    return items.reduce((total, item) => {
      if (!item.is_rental) {
        const price = getProductPrice(item);
        const quantity = typeof item.quantity === 'number' ? item.quantity : parseInt(item.quantity) || 1;
        return total + (price * quantity);
      }
      return total;
    }, 0);
  };

  const getRentalTotal = () => {
    return items.reduce((total, item) => {
      if (item.is_rental) {
        const rentalDays = typeof item.rental_days === 'number' ? item.rental_days : parseInt(item.rental_days) || 1;
        const rentalPricePerDay = item.rental_price_per_day ?
          (typeof item.rental_price_per_day === 'number' ? item.rental_price_per_day : parseFloat(item.rental_price_per_day) || 0) :
          getProductPrice(item);
        const quantity = typeof item.quantity === 'number' ? item.quantity : parseInt(item.quantity) || 1;
        return total + (quantity * rentalPricePerDay * rentalDays);
      }
      return total;
    }, 0);
  };

  const getTotalSecurityDeposit = () => {
    return items.reduce((total, item) => {
      if (item.is_rental) {
        const deposit = item.security_deposit ?
          (typeof item.security_deposit === 'number' ? item.security_deposit : parseFloat(item.security_deposit) || 0) : 0;
        const quantity = typeof item.quantity === 'number' ? item.quantity : parseInt(item.quantity) || 1;
        return total + (deposit * quantity);
      }
      return total;
    }, 0);
  };

  const validateForm = () => {
    if (!formData.shipping_name.trim()) {
      toast.error('Please enter your full name');
      return false;
    }
    if (!formData.shipping_email.trim()) {
      toast.error('Please enter your email');
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(formData.shipping_email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    if (!formData.shipping_address.trim()) {
      toast.error('Please enter your address');
      return false;
    }
    if (!formData.city.trim()) {
      toast.error('Please enter your city');
      return false;
    }
    if (!formData.pincode.trim()) {
      toast.error('Please enter your pincode');
      return false;
    }
    if (!/^\d{6}$/.test(formData.pincode)) {
      toast.error('Please enter a valid 6-digit pincode');
      return false;
    }
    if (formData.shipping_phone && !/^\d{10}$/.test(formData.shipping_phone.replace(/\D/g, ''))) {
      toast.error('Please enter a valid 10-digit phone number');
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      return;
    }

    setLoadingOrder(true);

    try {
      const fullAddress = `${formData.shipping_address}, ${formData.city}, ${formData.pincode}`;

      // In CheckoutPage.jsx, update the orderData structure:

      const orderData = {
        shipping_address: fullAddress,
        shipping_name: formData.shipping_name,
        shipping_phone: formData.shipping_phone,
        shipping_email: formData.shipping_email,
        payment_method: formData.payment_method,
        cart_items: items.map(item => ({  // Change from 'items' to 'cart_items'
          id: item.id,
          product_id: item.product?.id || item.product_id,
          product_name: getProductName(item),
          product_price: getProductPrice(item),
          quantity: item.quantity,
          is_rental: item.is_rental || false,
          rental_days: item.rental_days || 0,
          start_date: item.start_date,
          end_date: item.end_date,
          rental_price_per_day: item.rental_price_per_day,
          security_deposit: item.security_deposit
        }))
      };

      console.log('📦 Sending order data:', orderData);

      const response = await axios.post('/orders/', orderData);
      console.log('✅ Order created:', response.data);

      if (response.status === 201 || response.status === 200) {
        // Clear cart
        try {
          await axios.delete('/cart/clear/');
          await dispatch(clearCartAsync()).unwrap();
          localStorage.removeItem('cart');
          sessionStorage.removeItem('cart');
        } catch (clearError) {
          console.error('Error clearing cart:', clearError);
        }

        toast.success('Order placed successfully!');
        navigate(`/order-success?order_id=${response.data.id}&order_number=${response.data.order_number}`);
      } else {
        toast.error('Failed to place order. Please try again.');
      }
    } catch (error) {
      console.error('Order error:', error);

      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.error) {
          toast.error(errorData.error);
        } else if (errorData.non_field_errors) {
          toast.error(errorData.non_field_errors.join(', '));
        } else {
          toast.error('Failed to place order. Please try again.');
        }
      } else {
        toast.error('Failed to place order. Please try again.');
      }
    } finally {
      setLoadingOrder(false);
    }
  };

  const handleRazorpaySuccess = async (order) => {
    console.log('Payment success, order received:', order);

    try {
      await axios.post('/cart/clear/');
      await dispatch(clearCartAsync()).unwrap();
      localStorage.removeItem('cart');
      sessionStorage.removeItem('cart');
    } catch (clearError) {
      console.error('Error clearing cart:', clearError);
    }

    toast.success('Payment successful! Order placed successfully.');
    navigate(`/order-success?order_id=${order.id}&order_number=${order.order_number}`);
  };

  const handleRazorpayFailure = (error) => {
    console.error('Payment failed:', error);
    toast.error(error?.message || 'Payment failed. Please try again.');
  };

  if (loading) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow-sm border-0 rounded-4 p-5">
              <h3 className="mb-3">Please Login</h3>
              <p className="text-muted mb-4">You need to be logged in to checkout.</p>
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
      <div className="container py-5 text-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow-sm border-0 rounded-4 p-5">
              <i className="fas fa-shopping-cart fa-4x text-muted mb-4"></i>
              <h3 className="mb-3">Your Cart is Empty</h3>
              <p className="text-muted mb-4">Add items to your cart before checking out.</p>
              <Link to="/products" className="btn btn-pink px-4 py-2 rounded-pill">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const hasRentalItems = items.some(item => item.is_rental);
  const regularTotal = getRegularTotal();
  const rentalTotal = getRentalTotal();
  const totalSecurityDeposit = getTotalSecurityDeposit();
  const grandTotal = regularTotal + rentalTotal + totalSecurityDeposit;

  const fullAddress = `${formData.shipping_address}, ${formData.city}, ${formData.pincode}`;

  const getProductImage = (item) => {
    const imageUrl = item.product_image || item.image || item.product?.image || item.product?.product_image;
    return imageUrl || '';
  };

  const razorpayOrderData = {
    shipping_address: fullAddress,
    shipping_name: formData.shipping_name,
    shipping_phone: formData.shipping_phone,
    shipping_email: formData.shipping_email,
    payment_method: paymentMethod,
    total_amount: grandTotal,
    cart_items: items.map(item => ({
      id: item.id,
      product_id: item.product?.id || item.product_id,
      product_name: getProductName(item),
      product_price: getProductPrice(item),
      quantity: item.quantity,
      product_image: getProductImage(item),
      is_rental: item.is_rental || false,
      rental_days: item.rental_days || 0,
      start_date: item.start_date,
      end_date: item.end_date,
      rental_price_per_day: item.rental_price_per_day,
      security_deposit: item.security_deposit
    }))
  };

  return (
    <div style={{ backgroundColor: '#ffffff' }}>
      <div className="container py-5">
        <div className="row">
          <div className="col-12">
            <h1 className="h2 mb-4 fw-bold">Checkout</h1>
            {hasRentalItems && (
              <div className="alert alert-info mb-4">
                <i className="fas fa-info-circle me-2"></i>
                Your cart contains rental items. Security deposit is refundable upon return.
              </div>
            )}
          </div>
        </div>

        <div className="row g-4">
          <div className="col-lg-7">
            <div className="card shadow-sm border-0 rounded-4" style={{ height: 'auto' }}>
              <div className="card-body p-4">
                <h5 className="fw-bold mb-4">Shipping Information</h5>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Full Name <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      name="shipping_name"
                      className="form-control rounded-3"
                      value={formData.shipping_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Email <span className="text-danger">*</span></label>
                    <input
                      type="email"
                      name="shipping_email"
                      className="form-control rounded-3"
                      value={formData.shipping_email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Phone Number</label>
                    <input
                      type="tel"
                      name="shipping_phone"
                      className="form-control rounded-3"
                      value={formData.shipping_phone}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold">Address <span className="text-danger">*</span></label>
                    <textarea
                      name="shipping_address"
                      className="form-control rounded-3"
                      rows="2"
                      value={formData.shipping_address}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">City <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      name="city"
                      className="form-control rounded-3"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Pincode <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      name="pincode"
                      className="form-control rounded-3"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      maxLength="6"
                      required
                    />
                  </div>
                </div>
                <hr className="my-4" />
                <h5 className="fw-bold mb-3">Payment Method</h5>
                <div className="mb-3">
                  <div className="form-check mb-2">
                    <input
                      type="radio"
                      name="payment_method"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={handleInputChange}
                      className="form-check-input"
                      id="cod"
                    />
                    <label className="form-check-label fw-semibold" htmlFor="cod">Cash on Delivery (COD)</label>
                    <p className="small text-muted ms-4 mt-1">Pay when you receive the order</p>
                  </div>
                  <div className="form-check mb-2">
                    <input
                      type="radio"
                      name="payment_method"
                      value="razorpay"
                      checked={paymentMethod === 'razorpay'}
                      onChange={handleInputChange}
                      className="form-check-input"
                      id="razorpay"
                    />
                    <label className="form-check-label fw-semibold" htmlFor="razorpay">Online Payment (UPI, Card, NetBanking)</label>
                    <p className="small text-muted ms-4 mt-1">Pay securely via Razorpay</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="card border-0 rounded-4 shadow-sm position-sticky" style={{ backgroundColor: '#fce4ec', top: '20px', height: 'auto' }}>
              <div className="card-body p-4">
                <h5 className="fw-bold mb-4">Order Summary</h5>
                <div className="order-items mb-3" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                  {items.map((item, index) => {
                    const isRental = item.is_rental;
                    const quantity = typeof item.quantity === 'number' ? item.quantity : parseInt(item.quantity) || 1;

                    let itemTotal;
                    if (isRental) {
                      const rentalDays = typeof item.rental_days === 'number' ? item.rental_days : parseInt(item.rental_days) || 1;
                      const rentalPricePerDay = item.rental_price_per_day ?
                        (typeof item.rental_price_per_day === 'number' ? item.rental_price_per_day : parseFloat(item.rental_price_per_day) || 0) :
                        getProductPrice(item);
                      itemTotal = quantity * rentalPricePerDay * rentalDays;
                    } else {
                      itemTotal = getProductPrice(item) * quantity;
                    }

                    return (
                      <div key={item.id || index} className="d-flex justify-content-between mb-3 pb-2 border-bottom">
                        <div className="flex-grow-1">
                          <span className="fw-semibold d-block">{getProductName(item)}</span>
                          <span className="text-muted small">
                            {isRental ? (
                              <>Rental: {item.rental_days || 1} days</>
                            ) : (
                              <>Quantity: {quantity}</>
                            )}
                          </span>
                          {isRental && (
                            <div className="mt-1">
                              <small className="text-muted d-block">
                                <i className="fas fa-calendar-alt me-1"></i>
                                {item.start_date ? new Date(item.start_date).toLocaleDateString() : 'Start'} -
                                {item.end_date ? new Date(item.end_date).toLocaleDateString() : 'End'}
                              </small>
                              <small className="text-muted">
                                Deposit: ₹{item.security_deposit ? (typeof item.security_deposit === 'number' ? item.security_deposit : parseFloat(item.security_deposit) || 0).toFixed(2) : '0.00'}
                              </small>
                            </div>
                          )}
                        </div>
                        <span className="fw-semibold ms-3">₹{itemTotal.toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
                <hr className="my-3" />
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Regular Items:</span>
                  <span className="fw-semibold">₹{regularTotal.toFixed(2)}</span>
                </div>
                {rentalTotal > 0 && (
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Rental Total:</span>
                    <span className="fw-semibold">₹{rentalTotal.toFixed(2)}</span>
                  </div>
                )}
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
                <hr className="my-3" />
                <div className="d-flex justify-content-between mb-4">
                  <span className="fw-bold fs-5">Total Amount:</span>
                  <span className="fw-bold fs-5" style={{ color: '#d63384' }}>₹{grandTotal.toFixed(2)}</span>
                </div>
                {paymentMethod === 'cod' ? (
                  <button
                    onClick={handlePlaceOrder}
                    className="btn w-100 py-3 rounded-pill fw-semibold"
                    style={{ backgroundColor: '#d63384', color: 'white', border: 'none' }}
                    disabled={loadingOrder}
                  >
                    {loadingOrder ? 'Placing Order...' : 'Place Order (COD)'}
                  </button>
                ) : (
                  <RazorpayPayment
                    amount={grandTotal}
                    paymentMethod={paymentMethod}
                    orderData={razorpayOrderData}
                    onSuccess={handleRazorpaySuccess}
                    onFailure={handleRazorpayFailure}
                  />
                )}
                <div className="text-center mt-4">
                  <Link to="/cart" className="text-decoration-none small">← Back to Cart</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;