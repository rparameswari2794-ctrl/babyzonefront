import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import axios from '../api/axios';
import { addToCartAsync } from '../store/slices/cartSlice';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [rentalDays, setRentalDays] = useState(7);
  const [addingToCart, setAddingToCart] = useState(false);
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    if (!slug) {
      setLoading(false);
      toast.error('Invalid product');
      return;
    }
    
    try {
      // Try to fetch by slug first
      let response;
      try {
        response = await axios.get(`/products/${slug}/`);
      } catch (error) {
        // If slug fails, try by ID (if slug is a number)
        if (!isNaN(slug)) {
          response = await axios.get(`/products/${slug}/`);
        } else {
          throw error;
        }
      }
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login first to add items to cart');
      return;
    }

    setAddingToCart(true);
    try {
      const isRental = product.is_rental_available || false;
      
      const cartItemData = {
        productId: product.id,
        quantity: quantity,
        is_rental: isRental,
        product_name: product.name,
        product_price: isRental ? (product.rental_price_per_day || product.price) : product.final_price,
        rental_days: isRental ? rentalDays : null,
        rental_product_id: product.rental_info?.id || null
      };
      
      await dispatch(addToCartAsync(cartItemData)).unwrap();
      toast.success(isRental ? 'Added to rental cart!' : 'Added to cart!');
    } catch (error) {
      toast.error('Failed to add to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };
  // In ProductCard.jsx - Update the handleWishlistToggle function

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
      // Remove from wishlist
      const updatedWishlist = currentWishlist.filter(item => item.id !== product.id);
      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
      toast.success(`${product.name} removed from wishlist`);
    } else {
      // Add to wishlist with COMPLETE product data
      const wishlistItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        selling_price: product.selling_price || product.price,
        final_price: product.final_price || product.price,
        image: product.image || product.image_url || 'https://placehold.co/300x300/ff69b4/white?text=No+Image',
        slug: product.slug || product.id,
        stock_quantity: product.stock_quantity || product.stock || 0,
        rating: product.rating || 0,
        review_count: product.review_count || 0,
        old_price: product.old_price || product.discount_price,
        discount_price: product.discount_price,
        discount_percentage: product.discount_percentage,
        description: product.description || '',
        category: product.category,
        category_name: product.category_name,
        is_rental_available: product.is_rental_available || false
      };
      currentWishlist.push(wishlistItem);
      localStorage.setItem('wishlist', JSON.stringify(currentWishlist));
      toast.success(`${product.name} added to wishlist`);
    }
    
    // Dispatch event to update navbar badge
    const updatedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    window.dispatchEvent(new CustomEvent('wishlistUpdated', { 
      detail: { count: updatedWishlist.length } 
    }));
    
    // Trigger re-render to update heart icon
    setWishlistTrigger(prev => !prev);
    
  } catch (error) {
    console.error('Wishlist error:', error);
    toast.error('Unable to update wishlist');
  } finally {
    setWishlistLoading(false);
  }
};  

  // Helper to get price display
  const getPriceDisplay = () => {
    if (product.is_rental_available) {
      const dailyRate = product.rental_price_per_day || product.price;
      return (
        <>
          <span className="fs-3 fw-bold text-danger">₹{dailyRate}</span>
          <span className="text-muted"> / day</span>
          <div className="mt-2">
            <span className="text-muted">Total for {rentalDays} days: </span>
            <span className="fw-bold">₹{dailyRate * rentalDays}</span>
          </div>
        </>
      );
    }
    
    if (product.discount_price) {
      return (
        <>
          <span className="fs-3 fw-bold text-danger">₹{product.final_price}</span>
          <span className="text-muted text-decoration-line-through ms-2">₹{product.price}</span>
          <span className="text-success ms-2">{product.discount_percentage}% OFF</span>
        </>
      );
    }
    
    return <span className="fs-3 fw-bold text-danger">₹{product.price}</span>;
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

  if (!product) {
    return (
      <div className="container py-5 text-center">
        <h3>Product not found</h3>
        <Link to="/products" className="btn btn-primary mt-3">Browse Products</Link>
      </div>
    );
  }

  const isRental = product.is_rental_available || false;

  return (
    <div className="container py-5" style={{backgroundColor:'#fff'}}>
      <div className="row g-4 align-items-start">
        {/* Product Image */}
        <div className="col-md-6 text-center">
          <img
            src={product.image || 'https://placehold.co/500x500/ff69b4/white?text=No+Image'}
            alt={product.name}
            className="img-fluid rounded shadow"
            style={{ maxHeight: '400px', objectFit: 'contain' }}
          />
        </div>

        {/* Product Details */}
        <div className="col-md-6">
          <h2 className="fw-bold mb-3">{product.name}</h2>
          <p className="text-muted">{product.description}</p>

          {/* Price */}
          <div className="mb-3">
            {getPriceDisplay()}
          </div>

          {/* Quantity/Rental Days */}
          <div className="mb-3">
            <label className="fw-bold">
              {isRental ? 'Number of Days' : 'Quantity'}
            </label>
            {isRental ? (
              <div className="d-flex align-items-center gap-2 mt-2">
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={rentalDays}
                  onChange={(e) => setRentalDays(Number(e.target.value))}
                  className="form-control w-50"
                />
                <span className="text-muted small">(max 30 days)</span>
              </div>
            ) : (
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="form-control w-25 mt-2"
              />
            )}
          </div>

          {/* Buttons */}
          <button
            onClick={handleAddToCart}
            className="btn btn-dark px-4 py-2 me-2"
            disabled={addingToCart}
          >
            {addingToCart ? 'Adding...' : (isRental ? 'Add to Rental Cart' : 'Add to Cart')}
          </button>
          <Link to="/cart" className="btn btn-outline-dark px-4 py-2">
            View Cart
          </Link>

          {isRental && (
            <div className="alert alert-info mt-3 small">
              <i className="fas fa-info-circle me-2"></i>
              Rental terms: Security deposit required. Free delivery and pickup.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;