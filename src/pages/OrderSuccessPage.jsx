import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from '../api/axios';

const OrderSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get order ID from URL query params or location state
  const queryParams = new URLSearchParams(location.search);
  const orderId = queryParams.get('order_id');
  const orderNumber = queryParams.get('order_number');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (orderId) {
      fetchOrderDetails();
    } else {
      // If no order ID, show error and redirect after 3 seconds
      setError('No order ID found');
      setTimeout(() => {
        navigate('/orders');
      }, 3000);
    }
  }, [orderId, isAuthenticated, navigate]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      // FIXED: Remove /api/ prefix - axios baseURL already has /api
      const response = await axios.get(`/orders/${orderId}/`);
      console.log('Order details:', response.data);
      setOrder(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch order details:', err);
      console.error('Error response:', err.response?.data);
      
      if (err.response?.status === 404) {
        setError('Order not found. Please check your order ID.');
      } else if (err.response?.status === 401) {
        setError('Please login again to view order details.');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError('Failed to load order details. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading your order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow-sm border-0 rounded-4 p-5">
              <div className="text-center">
                <i className="fas fa-exclamation-circle fa-4x text-warning mb-4"></i>
                <h3 className="mb-3">Order Not Found</h3>
                <p className="text-muted mb-4">{error}</p>
                <div className="d-flex gap-3 justify-content-center">
                  <Link to="/orders" className="btn btn-pink px-4 py-2 rounded-pill">
                    <i className="fas fa-list me-2"></i> View My Orders
                  </Link>
                  <Link to="/products" className="btn btn-outline-dark px-4 py-2 rounded-pill">
                    <i className="fas fa-shopping-cart me-2"></i> Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  // Get payment status display
  const getPaymentStatusDisplay = (status) => {
    const statusMap = {
      'pending': 'Pending',
      'paid': 'Paid',
      'success': 'Paid',
      'failed': 'Failed',
      'refunded': 'Refunded',
      'refund_pending': 'Refund Pending'
    };
    return statusMap[status] || status?.toUpperCase() || 'Pending';
  };

  const getPaymentStatusColor = (status) => {
    const colorMap = {
      'pending': 'warning',
      'paid': 'success',
      'success': 'success',
      'failed': 'danger',
      'refunded': 'info',
      'refund_pending': 'info'
    };
    return colorMap[status] || 'secondary';
  };

  return (
    <div className="container py-5" style={{ minHeight: 'calc(100vh - 200px)' }}>
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card border-0 shadow-lg rounded-4" style={{height:'auto'}}>
            <div className="card-body text-center p-5">
              {/* Success Icon */}
              <div className="mb-4">
                <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex p-3">
                  <i className="fas fa-check-circle fa-4x text-success"></i>
                </div>
              </div>

              <h1 className="h2 fw-bold mb-3">Order Placed Successfully!</h1>
              <p className="text-muted mb-4">
                Thank you for your order. Your order has been received and is being processed.
              </p>

              {/* Order Details */}
              <div className="bg-light rounded-4 p-4 mb-4 text-start">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <p className="text-muted small mb-0">Order Number</p>
                    <p className="fw-bold mb-0">{order.order_number}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <p className="text-muted small mb-0">Order Date</p>
                    <p className="fw-bold mb-0">
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <p className="text-muted small mb-0">Total Amount</p>
                    <p className="fw-bold mb-0" style={{ color: '#d63384', fontSize: '1.25rem' }}>
                      ₹{parseFloat(order.grand_total).toFixed(2)}
                    </p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <p className="text-muted small mb-0">Payment Method</p>
                    <p className="fw-bold mb-0">
                      {order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method?.toUpperCase() || 'N/A'}
                    </p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <p className="text-muted small mb-0">Payment Status</p>
                    <span className={`badge bg-${getPaymentStatusColor(order.payment_status)} px-3 py-2`}>
                      {getPaymentStatusDisplay(order.payment_status)}
                    </span>
                  </div>
                  {order.tracking_number && (
                    <div className="col-md-6 mb-3">
                      <p className="text-muted small mb-0">Tracking Number</p>
                      <p className="fw-bold mb-0">{order.tracking_number}</p>
                    </div>
                  )}
                </div>

                <hr className="my-3" />

                <p className="text-muted small mb-2">Shipping Address</p>
                <p className="mb-0 fw-semibold">{order.shipping_name}</p>
                <p className="mb-0">{order.shipping_address}</p>
                {order.shipping_phone && <p className="mb-0">📞 {order.shipping_phone}</p>}
                <p className="mb-0">✉️ {order.shipping_email}</p>
              </div>

              {/* Order Items Summary */}
              {order.items && order.items.length > 0 && (
                <div className="text-start mb-4">
                  <h6 className="fw-bold mb-3">Order Items</h6>
                  <div className="bg-light rounded-4 p-3">
                    {order.items.slice(0, 5).map((item, idx) => (
                      <div key={idx} className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom border-white">
                        <div>
                          <span className="fw-semibold">{item.product_name}</span>
                          <span className="text-muted small ms-2">x {item.quantity}</span>
                        </div>
                        <span className="fw-semibold">₹{parseFloat(item.product_price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    {order.items.length > 5 && (
                      <p className="text-muted small mt-2 mb-0">
                        + {order.items.length - 5} more items
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <Link to="/orders" className="btn btn-pink px-4 py-2 rounded-pill fw-semibold">
                  <i className="fas fa-list me-2"></i> View My Orders
                </Link>
                <Link to="/products" className="btn btn-outline-dark px-4 py-2 rounded-pill fw-semibold">
                  <i className="fas fa-shopping-cart me-2"></i> Continue Shopping
                </Link>
                <Link to={`/track-order?order_id=${order.id}`} className="btn btn-outline-primary px-4 py-2 rounded-pill fw-semibold">
                  <i className="fas fa-map-marker-alt me-2"></i> Track Order
                </Link>
              </div>

              {/* Email Confirmation Message */}
              <div className="mt-4">
                <div className="alert alert-info">
                  <i className="fas fa-envelope me-2"></i>
                  A confirmation email has been sent to <strong>{order.shipping_email}</strong>. 
                  Please check your inbox (and spam folder) for order updates.
                </div>
              </div>

              {/* Estimated Delivery Info */}
              {order.status === 'pending' && (
                <div className="mt-3">
                  <p className="text-muted small">
                    <i className="fas fa-clock me-1"></i>
                    Your order will be processed within 24 hours. You will receive tracking information once shipped.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;