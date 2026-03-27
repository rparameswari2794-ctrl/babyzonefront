// pages/RentalServicesPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';
import { toast } from 'react-toastify';

const RentalServicesPage = () => {
  const [rentalProducts, setRentalProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRental, setSelectedRental] = useState(null);
  const [rentalDays, setRentalDays] = useState(1);
  const [showRentalModal, setShowRentalModal] = useState(false);

  useEffect(() => {
    fetchRentalProducts();
  }, []);

  const fetchRentalProducts = async () => {
    try {
      const response = await axios.get('/rental-services/');
      setRentalProducts(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to fetch rental products:', error);
      toast.error('Failed to load rental products');
    } finally {
      setLoading(false);
    }
  };

  const handleRentNow = async (rental) => {
    if (!isAuthenticated) {
      toast.info('Please login first to rent products');
      navigate('/login');
      return;
    }
    
    setSelectedRental(rental);
    setShowRentalModal(true);
  };

  const calculateTotalPrice = (rental, days) => {
    return rental.rental_price_per_day * days;
  };

  const submitRentalOrder = async () => {
    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + rentalDays);
      
      const rentalData = {
        rental_product: selectedRental.id,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        rental_days: rentalDays,
        rental_price: selectedRental.rental_price_per_day,
        security_deposit: selectedRental.security_deposit,
        notes: ''
      };
      
      const response = await axios.post('/rental-orders/', rentalData);
      
      if (response.status === 201 || response.status === 200) {
        toast.success('Rental order placed successfully!');
        setShowRentalModal(false);
        navigate(`/my-rentals`);
      }
    } catch (error) {
      console.error('Rental order error:', error);
      toast.error(error.response?.data?.error || 'Failed to place rental order');
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h1 className="display-5 fw-bold mb-3">Rental Services</h1>
        <p className="lead text-muted">Rent quality baby products at affordable prices</p>
      </div>
      
      {rentalProducts.length === 0 ? (
        <div className="text-center py-5">
          <i className="fas fa-box-open fa-4x text-muted mb-3"></i>
          <h3>No Rental Products Available</h3>
          <p className="text-muted">Check back later for rental products</p>
          <Link to="/products" className="btn btn-pink mt-3">Browse Products</Link>
        </div>
      ) : (
        <div className="row">
          {rentalProducts.map((rental) => (
            <div key={rental.id} className="col-md-4 mb-4">
              <div className="card h-100 shadow-sm border-0 rounded-4 overflow-hidden">
                <img 
                  src={rental.product_image || '/images/placeholder.jpg'} 
                  className="card-img-top" 
                  alt={rental.product_name}
                  style={{ height: '200px', objectFit: 'cover' }}
                />
                <div className="card-body p-4">
                  <h5 className="card-title fw-bold">{rental.product_name}</h5>
                  <p className="text-muted small mb-2">Available: {rental.available_quantity} units</p>
                  
                  <div className="mb-3">
                    <p className="mb-1 fw-semibold">Rental Prices:</p>
                    <ul className="list-unstyled small">
                      <li><i className="fas fa-calendar-day me-2"></i>Daily: ₹{rental.rental_price_per_day}/day</li>
                      <li><i className="fas fa-calendar-week me-2"></i>Weekly: ₹{rental.rental_price_per_week}/week</li>
                      <li><i className="fas fa-calendar-alt me-2"></i>Monthly: ₹{rental.rental_price_per_month}/month</li>
                    </ul>
                  </div>
                  
                  <p className="mb-2"><strong>Security Deposit:</strong> ₹{rental.security_deposit}</p>
                  <p className="text-muted small">Min: {rental.min_rental_days} days | Max: {rental.max_rental_days} days</p>
                  
                  <button 
                    onClick={() => handleRentNow(rental)}
                    className="btn btn-warning w-100 mt-3 rounded-pill fw-bold"
                    style={{ backgroundColor: '#ffc107', border: 'none' }}
                  >
                    Rent Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Rental Modal */}
      {showRentalModal && selectedRental && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4">
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold">Rent {selectedRental.product_name}</h5>
                <button type="button" className="btn-close" onClick={() => setShowRentalModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="mb-3">
                  <label className="form-label fw-semibold">Number of Days</label>
                  <input
                    type="number"
                    className="form-control rounded-3"
                    value={rentalDays}
                    onChange={(e) => setRentalDays(Math.max(1, parseInt(e.target.value)))}
                    min={selectedRental.min_rental_days}
                    max={selectedRental.max_rental_days}
                  />
                  <small className="text-muted">
                    Min: {selectedRental.min_rental_days} days | Max: {selectedRental.max_rental_days} days
                  </small>
                </div>
                
                <div className="bg-light rounded-3 p-3">
                  <p className="fw-bold mb-2">Price Summary</p>
                  <div className="d-flex justify-content-between mb-1">
                    <span>Rental Price ({rentalDays} days):</span>
                    <span>₹{calculateTotalPrice(selectedRental, rentalDays)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span>Security Deposit:</span>
                    <span>₹{selectedRental.security_deposit}</span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between fw-bold">
                    <span>Total Payable:</span>
                    <span className="text-pink">₹{calculateTotalPrice(selectedRental, rentalDays) + selectedRental.security_deposit}</span>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button className="btn btn-secondary rounded-pill px-4" onClick={() => setShowRentalModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-pink rounded-pill px-4" onClick={submitRentalOrder}>
                  Confirm Rent
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RentalServicesPage;