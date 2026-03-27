// pages/TrackOrderPage.jsx - Complete working version
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from '../api/axios';
import { toast } from 'react-toastify';

const TrackOrderPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const orderId = searchParams.get('order_id');
    const rentalId = searchParams.get('rental_id');
    const { isAuthenticated } = useSelector((state) => state.auth);

    const [order, setOrder] = useState(null);
    const [rental, setRental] = useState(null);
    const [isRental, setIsRental] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const refreshIntervalRef = useRef(null);

    const BACKEND_URL = 'http://127.0.0.1:8000';

    // Define the complete status order for regular orders
    const STATUS_ORDER = [
        { key: 'pending', label: 'Order Placed', icon: 'fa-clock', order: 0 },
        { key: 'confirmed', label: 'Confirmed', icon: 'fa-check-circle', order: 1 },
        { key: 'processing', label: 'Processing', icon: 'fa-spinner', order: 2 },
        { key: 'shipped', label: 'Shipped', icon: 'fa-truck', order: 3 },
        { key: 'out_for_delivery', label: 'Out for Delivery', icon: 'fa-truck-fast', order: 4 },
        { key: 'delivered', label: 'Delivered', icon: 'fa-check-double', order: 5 }
    ];

    // Define rental status order
    const RENTAL_STATUS_ORDER = [
        { key: 'pending', label: 'Pending Approval', icon: 'fa-clock', order: 0 },
        { key: 'approved', label: 'Approved', icon: 'fa-check-circle', order: 1 },
        { key: 'active', label: 'Active Rental', icon: 'fa-truck', order: 2 },
        { key: 'overdue', label: 'Overdue', icon: 'fa-exclamation-triangle', order: 3 },
        { key: 'returned', label: 'Returned', icon: 'fa-check-double', order: 4 }
    ];

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        if (orderId) {
            setIsRental(false);
            fetchOrderDetails();

            refreshIntervalRef.current = setInterval(() => {
                fetchOrderDetails(true);
            }, 10000);
        } else if (rentalId) {
            setIsRental(true);
            fetchRentalDetails();

            refreshIntervalRef.current = setInterval(() => {
                fetchRentalDetails(true);
            }, 10000);
        } else {
            setError('No order ID or rental ID provided');
            setLoading(false);
        }

        return () => {
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
            }
        };
    }, [orderId, rentalId, isAuthenticated]);

    const fetchOrderDetails = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const response = await axios.get(`/orders/${orderId}/track/`);
            console.log('Order tracking response:', response.data);
            setOrder(response.data);
            setLastUpdated(new Date());
            setError(null);
        } catch (err) {
            console.error('Failed to fetch order:', err);
            if (!silent) {
                setError('Failed to load order details. Please try again.');
                toast.error('Unable to load order');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchRentalDetails = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const response = await axios.get(`/rental-orders/${rentalId}/`);
            console.log('Rental tracking response:', response.data);
            setRental(response.data);
            setLastUpdated(new Date());
            setError(null);
        } catch (err) {
            console.error('Failed to fetch rental:', err);
            if (!silent) {
                setError('Failed to load rental details. Please try again.');
                toast.error('Unable to load rental');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        if (isRental) {
            fetchRentalDetails(false);
        } else {
            fetchOrderDetails(false);
        }
    };

    const getFullImageUrl = (imagePath) => {
        if (!imagePath) return '/images/placeholder.jpg';
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
        if (imagePath.startsWith('/media')) return `${BACKEND_URL}${imagePath}`;
        if (imagePath.startsWith('media/')) return `${BACKEND_URL}/${imagePath}`;
        return imagePath;
    };

    const getStatusPriority = (status, orderType = 'regular') => {
        if (!status) return 0;
        const statusLower = status.toLowerCase().trim();

        if (orderType === 'rental') {
            const statusMap = {
                'pending': 0,
                'approved': 1,
                'active': 2,
                'overdue': 3,
                'returned': 4
            };
            return statusMap[statusLower] !== undefined ? statusMap[statusLower] : 0;
        } else {
            const statusMap = {
                'pending': 0,
                'confirmed': 1,
                'processing': 2,
                'shipped': 3,
                'out_for_delivery': 4,
                'delivered': 5
            };
            return statusMap[statusLower] !== undefined ? statusMap[statusLower] : 0;
        }
    };

    const getStatusBadgeColor = (status, orderType = 'regular') => {
        const statusLower = status?.toLowerCase();
        const colors = {
            'pending': '#ffc107',
            'confirmed': '#0d6efd',
            'processing': '#0dcaf0',
            'shipped': '#0d6efd',
            'out_for_delivery': '#fd7e14',
            'delivered': '#198754',
            'cancelled': '#dc3545',
            'approved': '#0d6efd',
            'active': '#198754',
            'overdue': '#dc3545',
            'returned': '#6c757d'
        };
        return colors[statusLower] || '#6c757d';
    };

    const getPaymentStatusBadge = (status) => {
        const colors = {
            'pending': '#ffc107',
            'paid': '#198754',
            'success': '#198754',
            'failed': '#dc3545',
            'refunded': '#6c757d',
            'refund_pending': '#fd7e14'
        };
        const labels = {
            'pending': 'Pending',
            'paid': 'Paid',
            'success': 'Paid',
            'failed': 'Failed',
            'refunded': 'Refunded',
            'refund_pending': 'Refund Pending'
        };
        const key = status?.toLowerCase();
        return {
            color: colors[key] || '#6c757d',
            label: labels[key] || status?.toUpperCase() || 'Pending'
        };
    };

    const getStatusIcon = (status, orderType = 'regular') => {
        const statusLower = status?.toLowerCase();
        const icons = {
            'pending': 'fa-clock',
            'confirmed': 'fa-check-circle',
            'processing': 'fa-spinner',
            'shipped': 'fa-truck',
            'out_for_delivery': 'fa-truck-fast',
            'delivered': 'fa-check-double',
            'cancelled': 'fa-times-circle',
            'approved': 'fa-check-circle',
            'active': 'fa-truck',
            'overdue': 'fa-exclamation-triangle',
            'returned': 'fa-check-double'
        };
        return icons[statusLower] || 'fa-box';
    };

    const getRentalStatusText = (status) => {
        const texts = {
            'pending': 'Pending Approval',
            'approved': 'Approved - Ready for Pickup',
            'active': 'Currently Rented',
            'overdue': 'Overdue - Please Return',
            'returned': 'Returned',
            'cancelled': 'Cancelled'
        };
        return texts[status] || status?.toUpperCase() || 'Pending';
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div style={{ padding: '3rem 0', textAlign: 'center' }}>
                <div className="spinner-border" style={{ color: '#d63384' }} role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (error || (!order && !rental)) {
        return (
            <div style={{ padding: '3rem 0', textAlign: 'center' }}>
                <div style={{ maxWidth: '500px', margin: '0 auto' }}>
                    <i className="fas fa-exclamation-circle" style={{ fontSize: '3rem', color: '#dc3545' }}></i>
                    <h3>Not Found</h3>
                    <p>{error || "We couldn't find what you're looking for."}</p>
                    <Link to="/orders" style={{
                        padding: '0.75rem 2rem',
                        borderRadius: '50px',
                        background: '#d63384',
                        color: 'white',
                        textDecoration: 'none',
                        display: 'inline-block'
                    }}>Back to Orders</Link>
                </div>
            </div>
        );
    }

    // Render Rental Order Tracking
    if (isRental && rental) {
        const currentPriority = getStatusPriority(rental.status, 'rental');
        const progressPercent = ((currentPriority) / (RENTAL_STATUS_ORDER.length - 1)) * 100;

        return (
            <div style={{ padding: '2rem 0', backgroundColor: '#ffffff', minHeight: 'calc(100vh - 200px)' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
                        <div>
                            <Link to="/orders" style={{ color: '#6c757d', textDecoration: 'none' }}>
                                <i className="fas fa-arrow-left"></i> Back to Orders
                            </Link>
                            <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginTop: '0.5rem' }}>Track Your Rental</h1>
                            <p>Rental #{rental.id}</p>
                        </div>
                        <div>
                            <button onClick={handleRefresh} style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '20px',
                                border: '1px solid #d63384',
                                background: 'transparent',
                                cursor: 'pointer'
                            }}>
                                <i className="fas fa-sync-alt"></i> Refresh
                            </button>
                            {lastUpdated && (
                                <p style={{ fontSize: '0.7rem', color: '#6c757d', marginTop: '0.25rem' }}>
                                    Last updated: {lastUpdated.toLocaleTimeString()}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Status Info */}
                    <div style={{
                        background: '#e3f2fd',
                        padding: '0.75rem 1rem',
                        marginBottom: '1rem',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        borderLeft: `4px solid ${getStatusBadgeColor(rental.status, 'rental')}`
                    }}>
                        <strong>Current Status:</strong> {getRentalStatusText(rental.status)}
                        <span style={{ marginLeft: '1rem' }}>
                            <strong>Progress:</strong> {Math.round(progressPercent)}%
                        </span>
                    </div>

                    {/* Status Badge */}
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                        <span style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '20px',
                            background: getStatusBadgeColor(rental.status, 'rental'),
                            color: 'white',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <i className={`fas ${getStatusIcon(rental.status, 'rental')}`}></i>
                            {getRentalStatusText(rental.status)}
                        </span>
                    </div>

                    {/* Progress Tracker for Rental */}
                    <div style={{ marginBottom: '3rem', position: 'relative', padding: '1rem 0' }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '2rem',
                            position: 'relative',
                            zIndex: 2
                        }}>
                            {RENTAL_STATUS_ORDER.map((step, idx) => {
                                const completed = step.order <= currentPriority;
                                const active = step.order === currentPriority;

                                return (
                                    <div key={idx} style={{ textAlign: 'center', flex: 1, position: 'relative' }}>
                                        <div style={{
                                            width: '60px',
                                            height: '60px',
                                            borderRadius: '50%',
                                            background: completed ? '#d63384' : '#ffffff',
                                            margin: '0 auto',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.3s ease',
                                            border: `2px solid ${completed ? '#d63384' : '#dee2e6'}`,
                                            boxShadow: active ? '0 0 0 3px rgba(214, 51, 132, 0.2)' : 'none',
                                            transform: active ? 'scale(1.05)' : 'scale(1)'
                                        }}>
                                            {completed ? (
                                                <i className="fas fa-check" style={{ color: 'white', fontSize: '1.25rem' }}></i>
                                            ) : (
                                                <i className={`fas ${step.icon}`} style={{
                                                    color: active ? '#d63384' : '#adb5bd',
                                                    fontSize: '1.25rem'
                                                }}></i>
                                            )}
                                        </div>
                                        <p style={{
                                            fontSize: '0.85rem',
                                            marginTop: '0.75rem',
                                            fontWeight: active ? 'bold' : 'normal',
                                            color: active ? '#d63384' : '#6c757d'
                                        }}>
                                            {step.label}
                                        </p>
                                        {active && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '-30px',
                                                left: '50%',
                                                transform: 'translateX(-50%)',
                                                background: '#d63384',
                                                color: 'white',
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '4px',
                                                fontSize: '0.7rem',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                Current
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div style={{
                            position: 'absolute',
                            top: 'calc(30px + 1rem)',
                            left: 'calc(0% + 60px)',
                            right: 'calc(0% + 60px)',
                            height: '3px',
                            background: '#e9ecef',
                            zIndex: 1
                        }}>
                            <div style={{
                                width: `${progressPercent}%`,
                                height: '100%',
                                background: '#d63384',
                                transition: 'width 0.5s ease-in-out'
                            }}></div>
                        </div>
                    </div>

                    {/* Rental Details */}
                    <div style={{
                        background: '#f8f9fa',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        marginBottom: '1.5rem'
                    }}>
                        <h4 style={{ marginBottom: '1rem' }}>
                            <i className="fas fa-calendar-alt"></i> Rental Details
                        </h4>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <p className="text-muted small mb-0">Product</p>
                                <p className="fw-bold">{rental.product_name}</p>
                            </div>
                            <div className="col-md-6 mb-3">
                                <p className="text-muted small mb-0">Rental Period</p>
                                <p className="fw-bold">
                                    {new Date(rental.start_date).toLocaleDateString()} - {new Date(rental.end_date).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="col-md-6 mb-3">
                                <p className="text-muted small mb-0">Rental Days</p>
                                <p className="fw-bold">
                                    {Math.ceil((new Date(rental.end_date) - new Date(rental.start_date)) / (1000 * 60 * 60 * 24))} days
                                </p>
                            </div>
                            <div className="col-md-6 mb-3">
                                <p className="text-muted small mb-0">Total Price</p>
                                <p className="fw-bold">₹{rental.total_price}</p>
                            </div>
                            <div className="col-md-6 mb-3">
                                <p className="text-muted small mb-0">Security Deposit</p>
                                <p className="fw-bold">₹{rental.security_deposit_paid}</p>
                            </div>
                            {rental.return_date && (
                                <div className="col-md-6 mb-3">
                                    <p className="text-muted small mb-0">Returned On</p>
                                    <p className="fw-bold">{new Date(rental.return_date).toLocaleDateString()}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem', flexWrap: 'wrap' }}>
                        <Link to="/" style={{
                            padding: '0.75rem 2rem',
                            borderRadius: '50px',
                            background: '#d63384',
                            color: 'white',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <i className="fas fa-shopping-cart"></i> Continue Shopping
                        </Link>
                        <Link to="/orders" style={{
                            padding: '0.75rem 2rem',
                            borderRadius: '50px',
                            border: '2px solid #6c757d',
                            background: 'transparent',
                            color: '#6c757d',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <i className="fas fa-list"></i> Back to Orders
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Render Regular Order Tracking
    if (!order) return null;

    const currentPriority = getStatusPriority(order.status);
    const isCancelled = order.status?.toLowerCase() === 'cancelled';
    const paymentBadge = getPaymentStatusBadge(order.payment_status);
    const progressPercent = ((currentPriority) / (STATUS_ORDER.length - 1)) * 100;

    return (
        <div style={{ padding: '2rem 0', backgroundColor: '#ffffff', minHeight: 'calc(100vh - 200px)' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
                    <div>
                        <Link to="/orders" style={{ color: '#6c757d', textDecoration: 'none' }}>
                            <i className="fas fa-arrow-left"></i> Back to Orders
                        </Link>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginTop: '0.5rem' }}>Track Your Order</h1>
                        <p>Order #{order.order_number}</p>
                    </div>
                    <div>
                        <button onClick={handleRefresh} style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '20px',
                            border: '1px solid #d63384',
                            background: 'transparent',
                            cursor: 'pointer'
                        }}>
                            <i className="fas fa-sync-alt"></i> Refresh
                        </button>
                        {lastUpdated && (
                            <p style={{ fontSize: '0.7rem', color: '#6c757d', marginTop: '0.25rem' }}>
                                Last updated: {lastUpdated.toLocaleTimeString()}
                            </p>
                        )}
                    </div>
                </div>

                {/* Status Info */}
                <div style={{
                    background: '#e3f2fd',
                    padding: '0.75rem 1rem',
                    marginBottom: '1rem',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    borderLeft: `4px solid ${getStatusBadgeColor(order.status)}`
                }}>
                    <strong>Current Status:</strong> {order.status_display || order.status?.toUpperCase()}
                    <span style={{ marginLeft: '1rem' }}>
                        <strong>Progress:</strong> {Math.round(progressPercent)}%
                    </span>
                </div>

                {/* Status Badges */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                    <span style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '20px',
                        background: getStatusBadgeColor(order.status),
                        color: 'white',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <i className={`fas ${getStatusIcon(order.status)}`}></i> 
                        {order.status_display || order.status?.toUpperCase()}
                    </span>
                    <span style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '20px',
                        background: paymentBadge.color,
                        color: 'white',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <i className="fas fa-credit-card"></i> Payment: {paymentBadge.label}
                    </span>
                </div>

                {/* Progress Tracker */}
                {!isCancelled && (
                    <div style={{ marginBottom: '3rem', position: 'relative', padding: '1rem 0' }}>
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            marginBottom: '2rem',
                            position: 'relative',
                            zIndex: 2
                        }}>
                            {STATUS_ORDER.map((step, idx) => {
                                const completed = step.order <= currentPriority;
                                const active = step.order === currentPriority;
                                
                                return (
                                    <div key={idx} style={{ 
                                        textAlign: 'center', 
                                        flex: 1,
                                        position: 'relative'
                                    }}>
                                        <div style={{
                                            width: '60px',
                                            height: '60px',
                                            borderRadius: '50%',
                                            background: completed ? '#d63384' : '#ffffff',
                                            margin: '0 auto',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.3s ease',
                                            border: `2px solid ${completed ? '#d63384' : '#dee2e6'}`,
                                            boxShadow: active ? '0 0 0 3px rgba(214, 51, 132, 0.2)' : 'none',
                                            transform: active ? 'scale(1.05)' : 'scale(1)'
                                        }}>
                                            {completed ? (
                                                <i className="fas fa-check" style={{ color: 'white', fontSize: '1.25rem' }}></i>
                                            ) : (
                                                <i className={`fas ${step.icon}`} style={{ 
                                                    color: active ? '#d63384' : '#adb5bd',
                                                    fontSize: '1.25rem'
                                                }}></i>
                                            )}
                                        </div>
                                        <p style={{ 
                                            fontSize: '0.85rem', 
                                            marginTop: '0.75rem',
                                            fontWeight: active ? 'bold' : 'normal',
                                            color: active ? '#d63384' : '#6c757d'
                                        }}>
                                            {step.label}
                                        </p>
                                        {active && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '-30px',
                                                left: '50%',
                                                transform: 'translateX(-50%)',
                                                background: '#d63384',
                                                color: 'white',
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '4px',
                                                fontSize: '0.7rem',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                Current
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        
                        <div style={{
                            position: 'absolute',
                            top: 'calc(30px + 1rem)',
                            left: 'calc(0% + 60px)',
                            right: 'calc(0% + 60px)',
                            height: '3px',
                            background: '#e9ecef',
                            zIndex: 1
                        }}>
                            <div style={{
                                width: `${progressPercent}%`,
                                height: '100%',
                                background: '#d63384',
                                transition: 'width 0.5s ease-in-out'
                            }}></div>
                        </div>
                    </div>
                )}

                {/* Status Timeline */}
                {order.status_history && order.status_history.length > 0 && (
                    <div style={{
                        background: '#f8f9fa',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        marginBottom: '1.5rem'
                    }}>
                        <h4 style={{ marginBottom: '1rem' }}>
                            <i className="fas fa-history"></i> Order Status Timeline
                        </h4>
                        <div style={{ position: 'relative' }}>
                            {order.status_history.map((history, idx) => (
                                <div key={idx} style={{ 
                                    padding: '1rem',
                                    borderLeft: idx !== order.status_history.length - 1 ? '2px dashed #dee2e6' : 'none',
                                    position: 'relative',
                                    marginLeft: '20px',
                                    background: getStatusPriority(history.status) === currentPriority ? 'rgba(214, 51, 132, 0.05)' : 'transparent',
                                    borderRadius: '8px'
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        left: '-8px',
                                        top: '1rem',
                                        width: '12px',
                                        height: '12px',
                                        borderRadius: '50%',
                                        background: getStatusBadgeColor(history.status),
                                        border: '2px solid white',
                                        boxShadow: getStatusPriority(history.status) === currentPriority ? '0 0 0 3px rgba(214, 51, 132, 0.3)' : 'none'
                                    }}></div>
                                    <div style={{ 
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        flexWrap: 'wrap',
                                        gap: '0.5rem'
                                    }}>
                                        <div>
                                            <strong style={{ 
                                                color: getStatusBadgeColor(history.status),
                                                fontSize: getStatusPriority(history.status) === currentPriority ? '1.1rem' : '1rem'
                                            }}>
                                                {history.status?.toUpperCase()}
                                                {getStatusPriority(history.status) === currentPriority && (
                                                    <span style={{ 
                                                        marginLeft: '0.5rem', 
                                                        fontSize: '0.75rem',
                                                        background: '#d63384',
                                                        color: 'white',
                                                        padding: '0.2rem 0.5rem',
                                                        borderRadius: '12px'
                                                    }}>
                                                        Current
                                                    </span>
                                                )}
                                            </strong>
                                            {history.notes && (
                                                <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: '#6c757d' }}>
                                                    {history.notes}
                                                </p>
                                            )}
                                        </div>
                                        <span style={{ fontSize: '0.75rem', color: '#6c757d' }}>
                                            {formatDateTime(history.created_at)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Order Items */}
                <div style={{
                    background: '#f8f9fa',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    marginBottom: '1.5rem'
                }}>
                    <h4 style={{ marginBottom: '1rem' }}>
                        <i className="fas fa-box-open"></i> Order Items
                    </h4>
                    {order.items && order.items.map((item, idx) => (
                        <div key={idx} style={{ 
                            display: 'flex', 
                            gap: '1rem', 
                            padding: '1rem 0',
                            borderBottom: idx !== order.items.length - 1 ? '1px solid #e0e0e0' : 'none'
                        }}>
                            <img 
                                src={getFullImageUrl(item.product_image)} 
                                alt={item.product_name} 
                                style={{ 
                                    width: '80px', 
                                    height: '80px', 
                                    objectFit: 'cover', 
                                    borderRadius: '8px',
                                    background: '#fff'
                                }} 
                            />
                            <div style={{ flex: 1 }}>
                                <strong style={{ fontSize: '1rem' }}>{item.product_name}</strong>
                                <p style={{ margin: '0.5rem 0', color: '#6c757d' }}>
                                    Qty: {item.quantity} × ₹{item.product_price}
                                </p>
                                <strong style={{ color: '#d63384', fontSize: '1.1rem' }}>
                                    ₹{item.product_price * item.quantity}
                                </strong>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Payment Details */}
                <div style={{
                    background: '#f8f9fa',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    marginBottom: '1.5rem'
                }}>
                    <h4 style={{ marginBottom: '1rem' }}>
                        <i className="fas fa-credit-card"></i> Payment Details
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <div>
                            <p style={{ color: '#6c757d', margin: 0, fontSize: '0.875rem' }}>Status</p>
                            <strong style={{ 
                                color: order.payment_status?.toLowerCase() === 'paid' ? '#198754' : '#ffc107'
                            }}>
                                {order.payment_status?.toUpperCase() || 'PENDING'}
                            </strong>
                        </div>
                        <div>
                            <p style={{ color: '#6c757d', margin: 0, fontSize: '0.875rem' }}>Method</p>
                            <strong>{order.payment_method?.toUpperCase() || 'N/A'}</strong>
                        </div>
                        {order.transaction_id && (
                            <div>
                                <p style={{ color: '#6c757d', margin: 0, fontSize: '0.875rem' }}>Transaction ID</p>
                                <strong style={{ fontSize: '0.875rem' }}>{order.transaction_id}</strong>
                            </div>
                        )}
                    </div>
                </div>

                {/* Shipping Details */}
                <div style={{
                    background: '#f8f9fa',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    marginBottom: '1.5rem'
                }}>
                    <h4 style={{ marginBottom: '1rem' }}>
                        <i className="fas fa-truck"></i> Shipping Details
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                        <div>
                            <p style={{ color: '#6c757d', margin: 0, fontSize: '0.875rem' }}>Name</p>
                            <strong>{order.shipping_name}</strong>
                        </div>
                        <div>
                            <p style={{ color: '#6c757d', margin: 0, fontSize: '0.875rem' }}>Email</p>
                            <strong>{order.shipping_email}</strong>
                        </div>
                        <div>
                            <p style={{ color: '#6c757d', margin: 0, fontSize: '0.875rem' }}>Phone</p>
                            <strong>{order.shipping_phone || 'Not provided'}</strong>
                        </div>
                        <div>
                            <p style={{ color: '#6c757d', margin: 0, fontSize: '0.875rem' }}>Address</p>
                            <strong>{order.shipping_address}</strong>
                        </div>
                        <div>
                            <p style={{ color: '#6c757d', margin: 0, fontSize: '0.875rem' }}>Total Amount</p>
                            <strong style={{ fontSize: '1.25rem', color: '#d63384' }}>₹{order.grand_total}</strong>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem', flexWrap: 'wrap' }}>
                    <Link to="/" style={{
                        padding: '0.75rem 2rem',
                        borderRadius: '50px',
                        background: '#d63384',
                        color: 'white',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <i className="fas fa-shopping-cart"></i> Continue Shopping
                    </Link>
                    <Link to="/orders" style={{
                        padding: '0.75rem 2rem',
                        borderRadius: '50px',
                        border: '2px solid #6c757d',
                        background: 'transparent',
                        color: '#6c757d',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <i className="fas fa-list"></i> Back to Orders
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default TrackOrderPage;