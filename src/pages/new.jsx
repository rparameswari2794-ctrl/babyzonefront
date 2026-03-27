// components/Product/ProductCard.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCartAsync, fetchCart } from '@/store/slices/cartSlice'; // Add fetchCart here
import { toast } from 'react-toastify';
import axios from '@/api/axios';

const ProductCard = ({ product, variant = "default" }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [loading, setLoading] = React.useState(false);
  const [rentalLoading, setRentalLoading] = React.useState(false);
  const isTopSelling = variant === "top-selling";

  // Check if product is a rental product
  const isRentalProduct = React.useMemo(() => {
    return product.is_rental_available === true || 
           product.category_name === 'Rental Services' ||
           product.category_slug === 'rental-services' ||
           (product.rental_info && Object.keys(product.rental_info).length > 0);
  }, [product]);

  // Function to add rental product to cart
  const handleAddToRentalCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Please login first to rent products');
      navigate('/login');
      return;
    }
    
    setRentalLoading(true);
    try {
      // Calculate default start and end dates (1 day rental)
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 1);
      
      const requestData = {
        product_id: product.id,
        quantity: 1,
        is_rental: true,
        rental_days: 1,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0]
      };
      
      // Add rental pricing if available from product
      if (product.rental_info) {
        requestData.rental_price_per_day = product.rental_info.rental_price_per_day;
        requestData.security_deposit = product.rental_info.security_deposit;
      }
      
      console.log('Adding rental to cart:', requestData);
      
      const response = await axios.post('/cart/add/', requestData);
      console.log('Response:', response.data);
      
      if (response.status === 200 || response.status === 201) {
        toast.success(`${product.name} added to cart for rent!`);
        // Refresh cart after adding
        await dispatch(fetchCart());
        // Optional: navigate to cart
        setTimeout(() => navigate('/cart'), 500);
      }
    } catch (error) {
      console.error('Add to rental cart error:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.error || 'Failed to add to cart');
    } finally {
      setRentalLoading(false);
    }
  };

  // Regular add to cart function
  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Please login first to add items to cart');
      navigate('/login');
      return;
    }
    
    setLoading(true);
    try {
      await dispatch(addToCartAsync({ 
        productId: product.id, 
        quantity: 1 
      })).unwrap();
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error(error?.userMessage || error?.message || 'Failed to add to cart');
    } finally {
      setLoading(false);
    }
  };

  const isLoading = isRentalProduct ? rentalLoading : loading;
  const handleAdd = isRentalProduct ? handleAddToRentalCart : handleAddToCart;
  const buttonText = isRentalProduct ? (isLoading ? 'Adding...' : 'Rent Now') : (isLoading ? 'Adding...' : 'Buy');

  // Standard Design
  if (!isTopSelling) {
    return (
      <div className="card h-100 p-2" style={{ borderRadius: '12px', backgroundColor: '#fff', border: '1px solid #050505ff' }}>
        <Link to={`/products/${product.slug}`} className="text-decoration-none">
          <div className="d-flex align-items-center justify-content-center p-2" style={{ height: '180px' }}>
            <img 
              src={product.image || product.image_url || 'https://via.placeholder.com/300'} 
              alt={product.name} 
              className="img-fluid" 
              style={{ maxHeight: '100%', objectFit: 'contain' }} 
            />
          </div>
        </Link>
        <div className="card-body d-flex flex-column pt-0 text-start">
          <h6 className="fw-bold text-dark mb-2" style={{ fontSize: '0.9rem', minHeight: '2.5rem' }}>
            {product.name}
          </h6>
          <div className="mt-auto d-flex align-items-center justify-content-between">
            <span className="fw-600" style={{ fontSize: '0.7rem', color: '#0a0a0aff' }}>
              MRP: ₹ {product.price}
            </span>
            {isRentalProduct ? (
              <div className="d-flex gap-2">
                <button 
                  className="btn btn-sm fw-bold px-3" 
                  style={{ backgroundColor: '#FFDB3A', borderRadius: '8px', border: 'none' }}
                  onClick={handleAddToCart}
                  disabled={loading}
                >
                  {loading ? 'Adding...' : 'Buy'}
                </button>
                <button 
                  className="btn btn-sm fw-bold px-3" 
                  style={{ backgroundColor: '#28a745', borderRadius: '8px', border: 'none', color: 'white' }}
                  onClick={handleAddToRentalCart}
                  disabled={rentalLoading}
                >
                  {rentalLoading ? 'Adding...' : 'Rent'}
                </button>
              </div>
            ) : (
              <button 
                className="btn btn-sm fw-bold px-3" 
                style={{ backgroundColor: '#FFDB3A', borderRadius: '8px', border: 'none' }}
                onClick={handleAddToCart}
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Buy'}
              </button>
            )}
          </div>
          {isRentalProduct && (
            <small className="text-muted mt-1" style={{ fontSize: '0.65rem' }}>
              🏷️ Available for rent
            </small>
          )}
        </div>
      </div>
    );
  }

  // Top Selling Design
  return (
    <div className="h-100 border-0 bg-transparent" style={{backgroundColor:'#fff'}}>
      <Link to={`/products/${product.slug}`} className="text-decoration-none">
        <div style={{ height: '280px', width: '100%', overflow: 'hidden', borderRadius: '15px' }}>
          <img 
            src={product.image || product.image_url || 'https://via.placeholder.com/300'} 
            alt={product.name} 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
              display: 'block' 
            }} 
          />
        </div>
      </Link>

      <div className="bg-white p-3 text-center" style={{ borderRadius: '0', marginTop: '10px' }}>
        <h6 className="fw-bold text-dark mb-3" style={{ fontSize: '1rem', minHeight: '2.8rem' }}>
          {product.name}
        </h6>
        {isRentalProduct ? (
          <>
            <div className="d-flex gap-2 mb-2">
              <button 
                className="btn fw-bold flex-grow-1 py-2" 
                style={{ backgroundColor: '#FFDB3A', borderRadius: '10px', border: 'none' }}
                onClick={handleAddToCart}
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Buy'}
              </button>
              <button 
                className="btn fw-bold flex-grow-1 py-2" 
                style={{ backgroundColor: '#28a745', borderRadius: '10px', border: 'none', color: 'white' }}
                onClick={handleAddToRentalCart}
                disabled={rentalLoading}
              >
                {rentalLoading ? 'Adding...' : 'Rent'}
              </button>
            </div>
            <small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>
              🏷️ Available for rent
            </small>
          </>
        ) : (
          <button 
            className="btn fw-bold w-100 py-2" 
            style={{ backgroundColor: '#FFDB3A', borderRadius: '10px', border: 'none' }}
            onClick={handleAddToCart}
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Buy'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;