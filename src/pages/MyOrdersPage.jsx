// pages/MyOrdersPage.jsx - Updated to show both regular and rental orders
import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { toast } from 'react-toastify';

const MyOrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [rentalOrders, setRentalOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('regular'); // 'regular' or 'rental'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: '',
    title: ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const refreshIntervalRef = useRef(null);
  const BACKEND_URL = 'http://127.0.0.1:8000';

  const fetchOrders = async (showToast = false, isManual = false) => {
    if (!isManual) {
      setLoading(true);
    }
    try {
      // Fetch regular orders
      const regularResponse = await axios.get('/orders/');
      console.log('📦 Regular Orders Response:', regularResponse.data);

      let ordersData = [];
      if (regularResponse.data.results && Array.isArray(regularResponse.data.results)) {
        ordersData = regularResponse.data.results;
      } else if (Array.isArray(regularResponse.data)) {
        ordersData = regularResponse.data;
      }

      // Fetch rental orders
      const rentalResponse = await axios.get('/rental-orders/');
      console.log('📦 Rental Orders Response:', rentalResponse.data);

      let rentalData = [];
      if (rentalResponse.data.results && Array.isArray(rentalResponse.data.results)) {
        rentalData = rentalResponse.data.results;
      } else if (Array.isArray(rentalResponse.data)) {
        rentalData = rentalResponse.data;
      }

      // Filter orders for current user and sort by latest first
      if (user && ordersData.length > 0) {
        ordersData = ordersData
          .filter(order => order.user === user.id || order.user_id === user.id)
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      }

      // Filter rental orders for current user
      if (user && rentalData.length > 0) {
        rentalData = rentalData
          .filter(rental => rental.user === user.id || rental.user_id === user.id)
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      }

      setOrders(ordersData);
      setRentalOrders(rentalData);
      setError(null);

      if (isManual && showToast) {
        toast.success('Orders refreshed!');
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError('Failed to load orders. Please try again.');
      if (showToast) {
        toast.error('Failed to refresh orders');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchOrders(true, true);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders(false, false);

      refreshIntervalRef.current = setInterval(() => {
        console.log('🔄 Auto-refreshing orders...');
        fetchOrders(false, false);
      }, 30000);

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [isAuthenticated]);

  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return '/images/placeholder.jpg';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    if (imagePath.startsWith('/media/')) {
      return `${BACKEND_URL}${imagePath}`;
    }
    if (imagePath.startsWith('media/')) {
      return `${BACKEND_URL}/${imagePath}`;
    }
    if (imagePath.startsWith('/')) {
      return `${BACKEND_URL}${imagePath}`;
    }
    return `${BACKEND_URL}/media/${imagePath}`;
  };

  const trackOrder = (orderId) => {
    navigate(`/track-order?order_id=${orderId}`);
  };

  const trackRentalOrder = (rentalId) => {
    navigate(`/track-order?rental_id=${rentalId}`);
  };

  const cancelOrder = async (orderId) => {
    const orderToCancel = orders.find(order => order.id === orderId);
    const wasPaid = orderToCancel?.payment_status === 'paid' || orderToCancel?.payment_status === 'success';

    let confirmMessage = 'Are you sure you want to cancel this order? This action cannot be undone.';
    if (wasPaid) {
      confirmMessage = '⚠️ IMPORTANT: This order was already paid.\n\nYour payment will be refunded within 5-7 working days.\n\nAre you sure you want to cancel this order? This action cannot be undone.';
    }

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setCancellingOrder(orderId);
    try {
      const response = await axios.post(`/orders/${orderId}/cancel/`);
      console.log('Cancel response:', response.data);

      if (response.data.refund_message) {
        toast.success('Order cancelled successfully!', {
          autoClose: 3000
        });
        toast.info(response.data.refund_message, {
          autoClose: 7000,
          position: "top-center"
        });
      } else {
        toast.success('Order cancelled successfully!');
      }

      await fetchOrders(true, true);

    } catch (err) {
      console.error('Cancel order error:', err);
      let errorMessage = 'Failed to cancel order. ';
      if (err.response?.data?.error) {
        errorMessage += err.response.data.error;
      } else {
        errorMessage += 'Please try again or contact support.';
      }
      toast.error(errorMessage);
    } finally {
      setCancellingOrder(null);
    }
  };

  const openReviewModal = (order, product) => {
    setSelectedOrder(order);
    setSelectedProduct(product);
    setReviewData({
      rating: 5,
      comment: '',
      title: ''
    });
    setShowReviewModal(true);
  };

  const submitReview = async () => {
    if (!reviewData.comment.trim()) {
      toast.error('Please write a review comment');
      return;
    }

    setSubmittingReview(true);
    try {
      const response = await axios.post('/reviews/', {
        product: selectedProduct.id,
        rating: reviewData.rating,
        comment: reviewData.comment,
        title: reviewData.title,
        order: selectedOrder.id
      });

      if (response.status === 201 || response.status === 200) {
        toast.success('Thank you for your review!');
        setShowReviewModal(false);
        fetchOrders(true, true);
      }
    } catch (error) {
      console.error('Failed to submit review:', error);
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      'pending': 'bg-warning',
      'processing': 'bg-info',
      'confirmed': 'bg-primary',
      'shipped': 'bg-primary',
      'out_for_delivery': 'bg-info',
      'delivered': 'bg-success',
      'cancelled': 'bg-danger',
      'returned': 'bg-secondary'
    };
    return colors[status] || 'bg-secondary';
  };

  const getRentalStatusBadgeColor = (status) => {
    const colors = {
      'pending': 'bg-warning',
      'approved': 'bg-info',
      'active': 'bg-success',
      'overdue': 'bg-danger',
      'returned': 'bg-secondary',
      'cancelled': 'bg-dark'
    };
    return colors[status] || 'bg-secondary';
  };

  const getRentalStatusText = (status) => {
    const texts = {
      'pending': 'Pending Approval',
      'approved': 'Approved',
      'active': 'Active Rental',
      'overdue': 'Overdue',
      'returned': 'Returned',
      'cancelled': 'Cancelled'
    };
    return texts[status] || status.toUpperCase();
  };

  const getPaymentStatusBadge = (status) => {
    const colors = {
      'pending': 'bg-warning',
      'paid': 'bg-success',
      'success': 'bg-success',
      'failed': 'bg-danger',
      'refunded': 'bg-info',
      'refund_pending': 'bg-info'
    };
    return colors[status] || 'bg-secondary';
  };

  const getPaymentStatusLabel = (status) => {
    const labels = {
      'pending': 'PENDING',
      'paid': 'PAID',
      'success': 'PAID',
      'failed': 'FAILED',
      'refunded': 'REFUNDED',
      'refund_pending': 'REFUND PENDING'
    };
    return labels[status] || status?.toUpperCase() || 'PENDING';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'pending': 'fa-clock',
      'processing': 'fa-spinner',
      'confirmed': 'fa-check-circle',
      'shipped': 'fa-truck',
      'out_for_delivery': 'fa-truck-fast',
      'delivered': 'fa-check-double',
      'cancelled': 'fa-times-circle',
      'returned': 'fa-undo-alt'
    };
    return icons[status] || 'fa-box';
  };

  const getRentalStatusIcon = (status) => {
    const icons = {
      'pending': 'fa-clock',
      'approved': 'fa-check-circle',
      'active': 'fa-truck',
      'overdue': 'fa-exclamation-triangle',
      'returned': 'fa-check-double',
      'cancelled': 'fa-times-circle'
    };
    return icons[status] || 'fa-box';
  };

  const canCancelOrder = (status) => {
    const statusLower = status?.toLowerCase();
    const cancellableStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery'];
    return cancellableStatuses.includes(statusLower);
  };

  const canReviewOrder = (status) => {
    const statusLower = status?.toLowerCase();
    return statusLower === 'delivered';
  };

  const isRefundPending = (paymentStatus) => {
    return paymentStatus?.toLowerCase() === 'refund_pending';
  };

  const getStatusSteps = (currentStatus) => {
    const steps = [
      { key: 'pending', label: 'Order Placed', icon: 'fa-clock' },
      { key: 'confirmed', label: 'Confirmed', icon: 'fa-check-circle' },
      { key: 'processing', label: 'Processing', icon: 'fa-spinner' },
      { key: 'shipped', label: 'Shipped', icon: 'fa-truck' },
      { key: 'out_for_delivery', label: 'Out for Delivery', icon: 'fa-truck-fast' },
      { key: 'delivered', label: 'Delivered', icon: 'fa-check-double' }
    ];

    const currentIndex = steps.findIndex(step => step.key === currentStatus);
    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      active: index === currentIndex
    }));
  };

  const TrackingModal = ({ order, onClose }) => {
    const steps = getStatusSteps(order.status);
    const completedCount = steps.filter(s => s.completed).length;
    const progressWidth = completedCount > 1 ? ((completedCount - 1) / (steps.length - 1)) * 100 : 0;

    return (
      <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content rounded-4">
            <div className="modal-header border-0 pb-0">
              <h5 className="modal-title fw-bold">Track Order #{order.order_number}</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body p-4">
              <div className="position-relative mb-5">
                <div className="d-flex justify-content-between">
                  {steps.map((step, idx) => (
                    <div key={idx} className="text-center" style={{ flex: 1 }}>
                      <div className={`rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2 ${step.completed ? 'bg-success' : 'bg-secondary'}`}
                        style={{ width: '40px', height: '40px' }}>
                        <i className={`fas ${step.icon} text-white`}></i>
                      </div>
                      <p className={`small mb-0 ${step.active ? 'fw-bold text-success' : ''}`}>
                        {step.label}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="position-absolute top-50 start-0 end-0" style={{ height: '2px', backgroundColor: '#e0e0e0', zIndex: -1, transform: 'translateY(-50%)' }}>
                  <div className="bg-success" style={{ width: `${progressWidth}%`, height: '100%' }}></div>
                </div>
              </div>

              <div className="bg-light rounded-3 p-3 mb-3">
                <div className="row g-2">
                  <div className="col-md-6">
                    <p className="text-muted small mb-0">Order Number</p>
                    <p className="fw-bold mb-2">{order.order_number}</p>
                  </div>
                  <div className="col-md-6">
                    <p className="text-muted small mb-0">Order Date</p>
                    <p className="fw-bold mb-2">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="col-md-6">
                    <p className="text-muted small mb-0">Total Amount</p>
                    <p className="fw-bold mb-2">₹{order.grand_total}</p>
                  </div>
                  <div className="col-md-6">
                    <p className="text-muted small mb-0">Payment Method</p>
                    <p className="fw-bold mb-2">{order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method?.toUpperCase() || 'N/A'}</p>
                  </div>
                  <div className="col-md-6">
                    <p className="text-muted small mb-0">Payment Status</p>
                    <span className={`badge ${getPaymentStatusBadge(order.payment_status)} px-3 py-2`}>
                      {getPaymentStatusLabel(order.payment_status)}
                    </span>
                  </div>
                </div>
              </div>

              {isRefundPending(order.payment_status) && (
                <div className="alert alert-warning mb-3">
                  <i className="fas fa-clock me-2"></i>
                  <strong>Refund Processing:</strong> Your refund is being processed. It will reflect in your account within 5-7 working days.
                </div>
              )}

              {order.tracking_number && (
                <div className="alert alert-info mb-3">
                  <i className="fas fa-truck me-2"></i>
                  <strong>Tracking Number:</strong> {order.tracking_number}
                </div>
              )}

              {order.estimated_delivery && (
                <div className="alert alert-warning mb-3">
                  <i className="fas fa-calendar-alt me-2"></i>
                  <strong>Estimated Delivery:</strong> {new Date(order.estimated_delivery).toLocaleDateString()}
                </div>
              )}

              {order.items && order.items.length > 0 && (
                <div className="mt-3">
                  <h6 className="fw-bold mb-2">Order Items</h6>
                  {order.items.map((item, idx) => {
                    const productImage = item.product_image || item.image || item.product?.image;
                    const productName = item.product_name || item.name || item.product?.name || 'Product';
                    const productPrice = parseFloat(item.product_price || item.price || item.product?.price || 0);
                    const quantity = parseInt(item.quantity || 1);

                    return (
                      <div key={idx} className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                        <div className="d-flex align-items-center gap-2">
                          <div className="bg-light rounded" style={{ width: '50px', height: '50px', overflow: 'hidden', flexShrink: 0 }}>
                            <img
                              src={getFullImageUrl(productImage)}
                              alt={productName}
                              className="img-fluid"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => { e.target.src = '/images/placeholder.jpg'; }}
                            />
                          </div>
                          <div>
                            <p className="fw-semibold mb-0">{productName}</p>
                            <p className="text-muted small mb-0">Qty: {quantity}</p>
                          </div>
                        </div>
                        <p className="fw-bold mb-0">₹{(productPrice * quantity).toFixed(2)}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="modal-footer border-0 pt-0">
              <button className="btn btn-secondary" onClick={onClose}>Close</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const RentalTrackingModal = ({ rental, onClose }) => {
    const getRentalProgress = (status) => {
      const progressMap = {
        'pending': 0,
        'approved': 25,
        'active': 50,
        'overdue': 75,
        'returned': 100
      };
      return progressMap[status] || 0;
    };

    const progressPercent = getRentalProgress(rental.status);

    return (
      <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content rounded-4">
            <div className="modal-header border-0">
              <h5 className="modal-title fw-bold">Track Rental - {rental.product_name}</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body p-4">
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span className="fw-bold">Rental Status</span>
                  <span className={`badge ${getRentalStatusBadgeColor(rental.status)} px-3 py-2`}>
                    <i className={`fas ${getRentalStatusIcon(rental.status)} me-1`}></i>
                    {getRentalStatusText(rental.status)}
                  </span>
                </div>
                <div className="progress" style={{ height: '8px' }}>
                  <div
                    className="progress-bar bg-success"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-light rounded-3 p-3 mb-3">
                <div className="row g-2">
                  <div className="col-md-6">
                    <p className="text-muted small mb-0">Rental ID</p>
                    <p className="fw-bold">#{rental.id}</p>
                  </div>
                  <div className="col-md-6">
                    <p className="text-muted small mb-0">Product</p>
                    <p className="fw-bold">{rental.product_name}</p>
                  </div>
                  <div className="col-md-6">
                    <p className="text-muted small mb-0">Rental Period</p>
                    <p className="fw-bold">
                      {new Date(rental.start_date).toLocaleDateString()} - {new Date(rental.end_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <p className="text-muted small mb-0">Rental Days</p>
                    <p className="fw-bold">
                      {Math.ceil((new Date(rental.end_date) - new Date(rental.start_date)) / (1000 * 60 * 60 * 24))} days
                    </p>
                  </div>
                  <div className="col-md-6">
                    <p className="text-muted small mb-0">Total Price</p>
                    <p className="fw-bold">₹{rental.total_price}</p>
                  </div>
                  <div className="col-md-6">
                    <p className="text-muted small mb-0">Security Deposit</p>
                    <p className="fw-bold">₹{rental.security_deposit_paid}</p>
                  </div>
                  {rental.return_date && (
                    <div className="col-md-6">
                      <p className="text-muted small mb-0">Returned On</p>
                      <p className="fw-bold">{new Date(rental.return_date).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>

              {rental.status === 'active' && (
                <div className="alert alert-info">
                  <i className="fas fa-info-circle me-2"></i>
                  Your rental is currently active. Please return by {new Date(rental.end_date).toLocaleDateString()}
                </div>
              )}

              {rental.status === 'overdue' && (
                <div className="alert alert-danger">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  This rental is overdue! Please return immediately.
                </div>
              )}
            </div>
            <div className="modal-footer border-0 pt-0">
              <button className="btn btn-secondary" onClick={onClose}>Close</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ReviewModal = () => {
    if (!selectedProduct) return null;

    return (
      <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-4">
            <div className="modal-header border-0">
              <h5 className="modal-title fw-bold">Write a Review</h5>
              <button type="button" className="btn-close" onClick={() => setShowReviewModal(false)}></button>
            </div>
            <div className="modal-body p-4">
              <div className="d-flex align-items-center gap-3 mb-4 pb-2 border-bottom">
                <div className="bg-light rounded" style={{ width: '60px', height: '60px', overflow: 'hidden' }}>
                  <img
                    src={getFullImageUrl(selectedProduct.product_image)}
                    alt={selectedProduct.product_name}
                    className="img-fluid"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.src = '/images/placeholder.jpg'; }}
                  />
                </div>
                <div>
                  <h6 className="fw-bold mb-1">{selectedProduct.product_name}</h6>
                  <p className="text-muted small mb-0">Order #{selectedOrder?.order_number}</p>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Rating</label>
                <div className="d-flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="btn p-0"
                      onClick={() => setReviewData({ ...reviewData, rating: star })}
                      style={{ fontSize: '2rem' }}
                    >
                      <i className={`fas fa-star ${star <= reviewData.rating ? 'text-warning' : 'text-secondary'}`}></i>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Review Title (Optional)</label>
                <input
                  type="text"
                  className="form-control rounded-3"
                  value={reviewData.title}
                  onChange={(e) => setReviewData({ ...reviewData, title: e.target.value })}
                  placeholder="Summarize your experience"
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Your Review <span className="text-danger">*</span></label>
                <textarea
                  className="form-control rounded-3"
                  rows="4"
                  value={reviewData.comment}
                  onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                  placeholder="Share your experience with this product..."
                  required
                ></textarea>
              </div>
            </div>
            <div className="modal-footer border-0 pt-0">
              <button className="btn btn-secondary rounded-pill px-4" onClick={() => setShowReviewModal(false)}>
                Cancel
              </button>
              <button
                className="btn btn-pink rounded-pill px-4"
                onClick={submitReview}
                disabled={submittingReview}
              >
                {submittingReview ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Submitting...
                  </>
                ) : (
                  'Submit Review'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="container py-5 text-center">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow-sm border-0 rounded-4 p-5">
              <h3 className="mb-3">Please Login</h3>
              <p className="text-muted mb-4">You need to be logged in to view your orders.</p>
              <Link to="/login" className="btn btn-pink px-4 py-2 rounded-pill">
                Login to Continue
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading && !refreshing) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger">{error}</div>
        <button className="btn btn-primary" onClick={() => fetchOrders()}>Try Again</button>
      </div>
    );
  }

  const currentOrders = activeTab === 'regular' ? orders : rentalOrders;

  if (currentOrders.length === 0) {
    return (
      <div className="container py-5 text-center">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow-sm border-0 rounded-4 p-5">
              <i className="fas fa-box-open fa-4x text-muted mb-4"></i>
              <h3 className="mb-3">No {activeTab === 'regular' ? 'Orders' : 'Rentals'} Yet</h3>
              <p className="text-muted mb-4">
                {activeTab === 'regular'
                  ? "You haven't placed any orders yet."
                  : "You haven't rented any products yet."}
              </p>
              <Link to={activeTab === 'regular' ? "/products" : "/subcategory/rental-services"} className="btn btn-pink px-4 py-2 rounded-pill">
                {activeTab === 'regular' ? 'Start Shopping' : 'Browse Rentals'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2 fw-bold mb-0">My Orders & Rentals</h1>
        <div>
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="btn btn-outline-primary btn-sm me-2"
            style={{ borderRadius: '50px' }}
          >
            <i className={`fas fa-sync-alt ${refreshing ? 'fa-spin' : ''}`}></i>
            {refreshing ? ' Refreshing...' : ' Refresh'}
          </button>
          <Link to="/products" className="btn btn-outline-pink btn-sm">
            <i className="fas fa-shopping-cart me-1"></i> Continue Shopping
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'regular' ? 'active' : ''}`}
            onClick={() => setActiveTab('regular')}
            style={{ color: activeTab === 'regular' ? '#d63384' : '#6c757d', fontWeight: '500' }}
          >
            <i className="fas fa-shopping-bag me-2"></i>
            Regular Orders ({orders.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'rental' ? 'active' : ''}`}
            onClick={() => setActiveTab('rental')}
            style={{ color: activeTab === 'rental' ? '#d63384' : '#6c757d', fontWeight: '500' }}
          >
            <i className="fas fa-calendar-alt me-2"></i>
            Rental Orders ({rentalOrders.length})
          </button>
        </li>
      </ul>

      <div className="row">
        <div className="col-12">
          {activeTab === 'regular' ? (
            // Regular Orders
            orders.map((order) => (
              <div key={order.id} className="card mb-4 shadow-sm border-0 rounded-4">
                <div className="card-body p-4">
                  <div className="d-flex flex-wrap justify-content-between align-items-start mb-3 pb-2 border-bottom">
                    <div className="mb-2 mb-md-0">
                      <h5 className="fw-bold mb-1">Order #{order.order_number}</h5>
                      <p className="text-muted small mb-0">
                        <i className="far fa-calendar-alt me-1"></i>
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-end">
                      <span className={`badge ${getStatusBadgeColor(order.status)} px-3 py-2 me-2`}>
                        <i className={`fas ${getStatusIcon(order.status)} me-1`}></i>
                        {order.status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                      </span>
                      <span className={`badge ${getPaymentStatusBadge(order.payment_status)} px-3 py-2`}>
                        {getPaymentStatusLabel(order.payment_status)}
                      </span>
                    </div>
                  </div>

                  {isRefundPending(order.payment_status) && (
                    <div className="alert alert-warning mb-3 py-2">
                      <i className="fas fa-clock me-2"></i>
                      <small>Refund pending - Your refund will be processed within 5-7 working days</small>
                    </div>
                  )}

                  <div className="mb-3">
                    <h6 className="fw-semibold mb-2">Items</h6>
                    <div className="row g-2">
                      {order.items && order.items.length > 0 ? (
                        order.items.slice(0, 2).map((item, idx) => {
                          const productImage = item.product_image || item.image || item.product?.image;
                          const productName = item.product_name || item.name || item.product?.name || 'Product';
                          const productPrice = parseFloat(item.product_price || item.price || item.product?.price || 0);
                          const quantity = parseInt(item.quantity || 1);
                          const totalPrice = productPrice * quantity;

                          return (
                            <div key={idx} className="col-md-6">
                              <div className="d-flex align-items-center gap-2 p-2 bg-light rounded">
                                <div className="bg-white rounded d-flex align-items-center justify-content-center"
                                  style={{ width: '60px', height: '60px', overflow: 'hidden', flexShrink: 0 }}>
                                  <img
                                    src={getFullImageUrl(productImage)}
                                    alt={productName}
                                    className="img-fluid"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => { e.target.src = '/images/placeholder.jpg'; }}
                                  />
                                </div>
                                <div className="flex-grow-1">
                                  <p className="fw-semibold mb-0 small">{productName}</p>
                                  <p className="text-muted small mb-0">Qty: {quantity}</p>
                                  <p className="fw-bold mb-0 small">₹{totalPrice.toFixed(2)}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="col-12">
                          <div className="text-center py-3 bg-light rounded">
                            <p className="text-muted mb-0">No items found</p>
                          </div>
                        </div>
                      )}
                      {order.items && order.items.length > 2 && (
                        <div className="col-12 text-center mt-2">
                          <small className="text-muted">+ {order.items.length - 2} more items</small>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-12">
                      <div className="bg-light rounded-3 p-3">
                        <p className="fw-semibold mb-2 small">Shipping Address</p>
                        <p className="mb-0 small">{order.shipping_name}</p>
                        <p className="mb-0 small">{order.shipping_address}</p>
                      </div>
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-12">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <p className="text-muted small mb-0">Total Amount:</p>
                          <p className="fw-bold mb-0">₹{order.grand_total}</p>
                        </div>
                        <div>
                          <p className="text-muted small mb-0">Payment Method:</p>
                          <p className="mb-0">{order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method?.toUpperCase() || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex gap-2 pt-2 border-top">
                    <button
                      onClick={() => trackOrder(order.id)}
                      className="btn btn-outline-primary btn-sm"
                    >
                      <i className="fas fa-map-marker-alt me-1"></i> Track Order
                    </button>

                    {canCancelOrder(order.status) && (
                      <button
                        onClick={() => cancelOrder(order.id)}
                        className="btn btn-outline-danger btn-sm"
                        disabled={cancellingOrder === order.id}
                      >
                        {cancellingOrder === order.id ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                            Cancelling...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-times me-1"></i> Cancel Order
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            // Rental Orders
            rentalOrders.map((rental) => (
              <div key={rental.id} className="card mb-4 shadow-sm border-0 rounded-4">
                <div className="card-body p-4">
                  <div className="d-flex flex-wrap justify-content-between align-items-start mb-3 pb-2 border-bottom">
                    <div className="mb-2 mb-md-0">
                      <h5 className="fw-bold mb-1">Rental #{rental.id}</h5>
                      <p className="text-muted small mb-0">
                        <i className="far fa-calendar-alt me-1"></i>
                        {new Date(rental.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-end">
                      <span className={`badge ${getRentalStatusBadgeColor(rental.status)} px-3 py-2`}>
                        <i className={`fas ${getRentalStatusIcon(rental.status)} me-1`}></i>
                        {getRentalStatusText(rental.status)}
                      </span>
                    </div>
                  </div>

                  <div className="row mb-3">
                    
                    
                    <div className="col-md-9">
                      <h6 className="fw-bold">{rental.product_name}</h6>
                      <div className="row mt-2">
                        <div className="col-md-6">
                          <p className="small mb-1"><strong>Rental Period:</strong></p>
                          <p className="small text-muted">
                            {new Date(rental.start_date).toLocaleDateString()} - {new Date(rental.end_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="col-md-6">
                          <p className="small mb-1"><strong>Rental Days:</strong></p>
                          <p className="small text-muted">
                            {Math.ceil((new Date(rental.end_date) - new Date(rental.start_date)) / (1000 * 60 * 60 * 24))} days
                          </p>
                        </div>
                        <div className="col-md-6">
                          <p className="small mb-1"><strong>Total Price:</strong></p>
                          <p className="small fw-bold">₹{rental.total_price}</p>
                        </div>
                        <div className="col-md-6">
                          <p className="small mb-1"><strong>Security Deposit:</strong></p>
                          <p className="small">₹{rental.security_deposit_paid}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex gap-2 pt-2 border-top">
                    <button
                      onClick={() => trackRentalOrder(rental.id)}
                      className="btn btn-outline-primary btn-sm"
                    >
                      <i className="fas fa-map-marker-alt me-1"></i> Track Rental
                    </button>

                    {rental.status === 'active' && (
                      <button
                        onClick={async () => {
                          if (window.confirm('Are you sure you want to return this item?')) {
                            try {
                              await axios.post(`/rental-orders/${rental.id}/return_rental/`);
                              toast.success('Return request submitted!');
                              fetchOrders(true, true);
                            } catch (error) {
                              toast.error('Failed to return rental');
                            }
                          }
                        }}
                        className="btn btn-outline-warning btn-sm"
                      >
                        <i className="fas fa-undo-alt me-1"></i> Return Item
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showTrackingModal && trackingOrder && (
        <TrackingModal order={trackingOrder} onClose={() => setShowTrackingModal(false)} />
      )}

      {showReviewModal && (
        <ReviewModal />
      )}
    </div>
  );
};

export default MyOrdersPage;