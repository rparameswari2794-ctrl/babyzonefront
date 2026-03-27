// src/pages/PaymentHistoryPage.jsx
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from '../api/axios';

const PaymentHistoryPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPayments();
    }
  }, [isAuthenticated]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/payments/my-payments/');
      setPayments(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch payments:', err);
      setError('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  const getPaymentStatusBadge = (status) => {
    const colors = {
      'pending': 'bg-warning',
      'success': 'bg-success',
      'failed': 'bg-danger',
      'refunded': 'bg-info',
      'cancelled': 'bg-secondary'
    };
    return colors[status] || 'bg-secondary';
  };

  const getPaymentMethodDisplay = (method) => {
    const methods = {
      'cod': 'Cash on Delivery',
      'razorpay': 'Razorpay',
      'card': 'Credit/Debit Card',
      'upi': 'UPI',
      'netbanking': 'NetBanking',
      'wallet': 'Wallet'
    };
    return methods[method] || method.toUpperCase();
  };

  if (!isAuthenticated) {
    return (
      <div className="container py-5 text-center">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow-sm border-0 rounded-4 p-5">
              <h3 className="mb-3">Please Login</h3>
              <p className="text-muted mb-4">You need to be logged in to view payment history.</p>
              <Link to="/login" className="btn btn-pink px-4 py-2 rounded-pill">
                Login to Continue
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
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
        <button className="btn btn-primary" onClick={fetchPayments}>Try Again</button>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="container py-5 text-center">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow-sm border-0 rounded-4 p-5">
              <i className="fas fa-credit-card fa-4x text-muted mb-4"></i>
              <h3 className="mb-3">No Payment History</h3>
              <p className="text-muted mb-4">You haven't made any payments yet.</p>
              <Link to="/products" className="btn btn-pink px-4 py-2 rounded-pill">
                Start Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h1 className="h2 mb-4 fw-bold">Payment History</h1>
      
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="ps-4 py-3">Payment ID</th>
                      <th className="py-3">Order Number</th>
                      <th className="py-3">Amount</th>
                      <th className="py-3">Payment Method</th>
                      <th className="py-3">Status</th>
                      <th className="py-3">Date</th>
                      <th className="pe-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id}>
                        <td className="ps-4 py-3">
                          <code className="small">{payment.id}</code>
                        </td>
                        <td className="py-3">
                          {payment.order_number ? (
                            <Link to={`/orders/${payment.order}`} className="text-decoration-none">
                              {payment.order_number}
                            </Link>
                          ) : (
                            <span className="text-muted">Pending Order</span>
                          )}
                        </td>
                        <td className="py-3 fw-bold">₹{payment.amount}</td>
                        <td className="py-3">
                          <span className="badge bg-light text-dark px-3 py-2">
                            {getPaymentMethodDisplay(payment.payment_method)}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`badge ${getPaymentStatusBadge(payment.payment_status)} px-3 py-2`}>
                            {payment.payment_status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3">
                          {new Date(payment.payment_initiated_at).toLocaleDateString()}
                        </td>
                        <td className="pe-4 py-3">
                          <Link to={`/payments/${payment.id}`} className="btn btn-sm btn-outline-primary">
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentHistoryPage;