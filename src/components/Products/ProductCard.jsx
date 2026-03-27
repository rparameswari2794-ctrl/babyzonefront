// components/Product/ProductCard.jsx - Updated with WishlistContext for backend sync
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCartAsync, fetchCart } from '@/store/slices/cartSlice';
import { toast } from 'react-toastify';
import axios from '@/api/axios';
import { useWishlist } from '@/context/WishlistContext';

const ProductCard = ({ product, variant = "default", hideWishlist = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { addToWishlist, removeFromWishlist, isInWishlist: isInWishlistContext, refreshWishlist } = useWishlist();
  const [loading, setLoading] = React.useState(false);
  const [rentalLoading, setRentalLoading] = React.useState(false);
  const [wishlistLoading, setWishlistLoading] = React.useState(false);
  const [wishlistTrigger, setWishlistTrigger] = React.useState(false);
  const isTopSelling = variant === "top-selling";

  // Check if product is a rental product
  const isRentalProduct = React.useMemo(() => {
    return product.is_rental_available === true || 
           product.category_name === 'Rental Services' ||
           product.category_slug === 'rental-services' ||
           (product.rental_info && Object.keys(product.rental_info).length > 0);
  }, [product]);

  // Check if product is in wishlist using context or localStorage
  const isInWishlist = React.useMemo(() => {
    // First try context, fallback to localStorage
    try {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      return wishlist.some(item => item.id === product.id);
    } catch (error) {
      return false;
    }
  }, [product.id, wishlistTrigger]);

  // Function to add/remove from wishlist with backend sync
  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Please login first to add to wishlist');
      navigate('/login');
      return;
    }
    
    setWishlistLoading(true);
    try {
      // Get current wishlist from localStorage
      const currentWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      
      if (isInWishlist) {
        // Remove from wishlist - sync with backend
        await removeFromWishlist(product.id, product.name);
        toast.success(`${product.name} removed from wishlist`);
      } else {
        // Add to wishlist with full product data - sync with backend
        const wishlistItem = {
          id: product.id,
          name: product.name,
          price: product.price,
          selling_price: product.selling_price || product.price,
          image: product.image || product.image_url || 'https://placehold.co/300x300/ff69b4/white?text=No+Image',
          slug: product.slug,
          stock_quantity: product.stock_quantity,
          rating: product.rating,
          review_count: product.review_count,
          old_price: product.old_price
        };
        await addToWishlist(wishlistItem);
        toast.success(`${product.name} added to wishlist`);
      }
      
      // Refresh wishlist to ensure consistency
      await refreshWishlist();
      
      // Trigger re-render to update heart icon
      setWishlistTrigger(prev => !prev);
      
      // Dispatch event for navbar update
      const updatedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      window.dispatchEvent(new CustomEvent('wishlistUpdated', { 
        detail: { count: updatedWishlist.length } 
      }));
      
    } catch (error) {
      console.error('Wishlist error:', error);
      toast.error('Unable to update wishlist');
    } finally {
      setWishlistLoading(false);
    }
  };

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
      
      if (product.rental_info) {
        requestData.rental_price_per_day = product.rental_info.rental_price_per_day;
        requestData.security_deposit = product.rental_info.security_deposit;
      }
      
      const response = await axios.post('/cart/add/', requestData);
      
      if (response.status === 200 || response.status === 201) {
        toast.success(`${product.name} added to cart for rent!`);
        await dispatch(fetchCart());
        setTimeout(() => navigate('/cart'), 500);
      }
    } catch (error) {
      console.error('Add to rental cart error:', error);
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
  const shouldShowWishlist = !hideWishlist && !isRentalProduct;

  // Standard Design
  if (!isTopSelling) {
    return (
      <div className="card h-100 p-2" style={{ borderRadius: '12px', backgroundColor: '#fff', border: '1px solid #050505ff', position: 'relative' }}>
        {/* Wishlist Heart Icon */}
        {shouldShowWishlist && (
          <button
            onClick={handleWishlistToggle}
            disabled={wishlistLoading}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: 'white',
              border: `2px solid #FFB2E6`,
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
              zIndex: 10,
              transition: 'all 0.2s ease',
              padding: 0
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
            }}
          >
            {wishlistLoading ? (
              <div className="spinner-border spinner-border-sm" style={{ width: '14px', height: '14px', color: '#FFB2E6' }}></div>
            ) : (
              <i 
                className={`${isInWishlist ? 'fas' : 'far'} fa-heart`}
                style={{ 
                  fontSize: '16px',
                  color: '#FFB2E6',
                  transition: 'all 0.2s ease'
                }}
              ></i>
            )}
          </button>
        )}
        
        <Link to={`/products/${product.slug}`} className="text-decoration-none">
          <div className="d-flex align-items-center justify-content-center p-2" style={{ height: '180px' }}>
            <img 
              src={product.image || product.image_url || 'https://placehold.co/300x300/ff69b4/white?text=No+Image'} 
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
              <button 
                className="btn btn-sm fw-bold px-3" 
                style={{ backgroundColor: '#28a745', borderRadius: '8px', border: 'none', color: 'white' }}
                onClick={handleAddToRentalCart}
                disabled={rentalLoading}
              >
                {rentalLoading ? 'Adding...' : 'Rent Now'}
              </button>
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
    <div className="h-100 border-0 bg-transparent" style={{backgroundColor:'#fff', position: 'relative'}}>
      {/* Wishlist Heart Icon */}
      {shouldShowWishlist && (
        <button
          onClick={handleWishlistToggle}
          disabled={wishlistLoading}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: 'white',
            border: `2px solid #FFB2E6`,
            borderRadius: '50%',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 10,
            transition: 'all 0.2s ease',
            padding: 0
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
          }}
        >
          {wishlistLoading ? (
            <div className="spinner-border spinner-border-sm" style={{ width: '16px', height: '16px', color: '#FFB2E6' }}></div>
          ) : (
            <i 
              className={`${isInWishlist ? 'fas' : 'far'} fa-heart`}
              style={{ 
                fontSize: '18px',
                color: '#FFB2E6',
                transition: 'all 0.2s ease'
              }}
            ></i>
          )}
        </button>
      )}
      
      <Link to={`/products/${product.slug}`} className="text-decoration-none">
        <div style={{ height: '280px', width: '100%', overflow: 'hidden', borderRadius: '15px' }}>
          <img 
            src={product.image || product.image_url || 'https://placehold.co/300x300/ff69b4/white?text=No+Image'} 
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
        <h6 
          className="fw-bold text-dark mb-3" 
          style={{ 
            fontSize: '1rem', 
            minHeight: '2.8rem',
            display: '-webkit-box',
            WebkitLineClamp: '2',
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {product.name}
        </h6>
        {isRentalProduct ? (
          <button 
            className="btn fw-bold w-100 py-2" 
            style={{ backgroundColor: '#28a745', borderRadius: '10px', border: 'none', color: 'white' }}
            onClick={handleAddToRentalCart}
            disabled={rentalLoading}
          >
            {rentalLoading ? 'Adding...' : 'Rent Now'}
          </button>
        ) : (
          <button 
            className="btn fw-bold w-100 py-2" 
            style={{ backgroundColor: '#FFDB3A', borderRadius: '10px', border: 'none' }}
            onClick={handleAddToCart}
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Buy Now'}
          </button>
        )}
        {isRentalProduct && (
          <small className="text-muted d-block mt-2" style={{ fontSize: '0.7rem' }}>
            🏷️ Available for rent
          </small>
        )}
      </div>
    </div>
  );
};

export default ProductCard;