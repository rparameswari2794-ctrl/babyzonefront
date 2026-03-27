// pages/WishlistPage.jsx - Working without API calls
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const WishlistPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState({});
  const [removeLoading, setRemoveLoading] = useState({});

  useEffect(() => {
    loadWishlistFromStorage();
  }, []);

  const loadWishlistFromStorage = () => {
    setLoading(true);
    try {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      console.log('Loaded wishlist items:', wishlist);
      setWishlistItems(wishlist);
    } catch (error) {
      console.error('Error loading wishlist:', error);
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = (productId, productName, e) => {
    e?.stopPropagation();
    setRemoveLoading(prev => ({ ...prev, [productId]: true }));
    
    try {
      const currentWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      const updatedWishlist = currentWishlist.filter(item => item.id !== productId);
      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
      setWishlistItems(prev => prev.filter(item => item.id !== productId));
      toast.success(`${productName} removed from wishlist`);
      
      // Update navbar count
      window.dispatchEvent(new CustomEvent('wishlistUpdated', { 
        detail: { count: updatedWishlist.length } 
      }));
    } catch (error) {
      console.error('Remove error:', error);
      toast.error('Failed to remove from wishlist');
    } finally {
      setRemoveLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleAddToCart = (product, e) => {
    e?.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please login first to add items to cart');
      navigate('/login');
      return;
    }
    
    // Since cart API is not working, show a message
    toast.info(`Add to cart functionality will be available soon. Product: ${product.name}`);
  };

  const handleAddAllToCart = () => {
    if (wishlistItems.length === 0) {
      toast.info('Your wishlist is empty');
      return;
    }
    
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }
    
    toast.info(`Add all to cart functionality will be available soon. ${wishlistItems.length} items`);
  };

  const handleMoveToCart = (product, e) => {
    e?.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }
    
    // Move to cart and remove from wishlist
    try {
      const currentWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      const updatedWishlist = currentWishlist.filter(item => item.id !== product.id);
      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
      setWishlistItems(prev => prev.filter(item => item.id !== product.id));
      
      toast.success(`${product.name} moved to cart! (Cart functionality coming soon)`);
      
      // Update navbar count
      window.dispatchEvent(new CustomEvent('wishlistUpdated', { 
        detail: { count: updatedWishlist.length } 
      }));
    } catch (error) {
      console.error('Move to cart error:', error);
      toast.error('Failed to move item to cart');
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
      localStorage.removeItem('wishlist');
      setWishlistItems([]);
      toast.success('Wishlist cleared');
      
      // Update navbar count
      window.dispatchEvent(new CustomEvent('wishlistUpdated', { detail: { count: 0 } }));
    }
  };

  const getProductImage = (product) => {
    if (product.image) return product.image;
    if (product.image_url) return product.image_url;
    return 'https://placehold.co/300x300/ff69b4/white?text=No+Image';
  };

  const getProductPrice = (product) => {
    if (product.selling_price) return product.selling_price;
    if (product.price) return product.price;
    return 0;
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center py-5">
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading your wishlist...</p>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="container mt-5 text-center py-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <i className="fas fa-heart-broken fa-4x text-muted mb-4"></i>
            <h3>Your Wishlist is Empty</h3>
            <p className="text-muted mb-4">Start adding items you love to your wishlist!</p>
            <Link to="/products" className="btn btn-warning px-4 py-2">
              <i className="fas fa-shopping-bag me-2"></i>Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 className="mb-1">
            <i className="fas fa-heart text-danger me-2"></i>
            My Wishlist
          </h2>
          <p className="text-muted mb-0">{wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} saved</p>
        </div>
        <div className="d-flex gap-2">
          <button 
            className="btn btn-outline-success" 
            onClick={handleAddAllToCart}
            disabled={wishlistItems.length === 0 || !isAuthenticated}
          >
            <i className="fas fa-shopping-cart me-2"></i>
            Add All to Cart
          </button>
          <button 
            className="btn btn-outline-danger" 
            onClick={handleClearAll}
            disabled={wishlistItems.length === 0}
          >
            <i className="fas fa-trash-alt me-2"></i>
            Clear All
          </button>
        </div>
      </div>

      <div className="row">
        {wishlistItems.map((product) => (
          <div className="col-md-3 col-sm-6 mb-4" key={product.id}>
            <div className="card h-100 position-relative" style={{ borderRadius: '12px', border: '1px solid #e0e0e0', transition: 'transform 0.2s' }}>
              <button
                onClick={(e) => handleRemoveFromWishlist(product.id, product.name, e)}
                disabled={removeLoading[product.id]}
                className="position-absolute top-0 end-0 m-2 btn btn-sm btn-light rounded-circle"
                style={{ 
                  zIndex: 10, 
                  width: '32px', 
                  height: '32px', 
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  backgroundColor: 'white',
                  border: '1px solid #ddd'
                }}
                title="Remove from wishlist"
              >
                {removeLoading[product.id] ? (
                  <span className="spinner-border spinner-border-sm" style={{ width: '12px', height: '12px' }}></span>
                ) : (
                  <i className="fas fa-times" style={{ fontSize: '14px' }}></i>
                )}
              </button>

              <Link to={`/products/${product.slug || product.id}`} className="text-decoration-none">
                <div className="d-flex align-items-center justify-content-center p-3" style={{ height: '200px', backgroundColor: '#f8f9fa' }}>
                  <img 
                    src={getProductImage(product)} 
                    alt={product.name} 
                    className="img-fluid" 
                    style={{ 
                      maxHeight: '100%', 
                      maxWidth: '100%', 
                      objectFit: 'contain' 
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://placehold.co/300x300/ff69b4/white?text=No+Image';
                    }}
                  />
                </div>
              </Link>

              <div className="card-body d-flex flex-column">
                <Link to={`/products/${product.slug || product.id}`} className="text-decoration-none text-dark">
                  <h6 className="fw-bold mb-2" style={{ 
                    fontSize: '0.95rem', 
                    minHeight: '2.5rem',
                    display: '-webkit-box',
                    WebkitLineClamp: '2',
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {product.name}
                  </h6>
                </Link>
                
                <div className="mb-2">
                  <span className="h5 text-danger fw-bold">₹ {getProductPrice(product)}</span>
                  {product.old_price && (
                    <span className="text-muted text-decoration-line-through ms-2" style={{ fontSize: '0.85rem' }}>
                      ₹ {product.old_price}
                    </span>
                  )}
                </div>

                {product.rating > 0 && (
                  <div className="mb-2">
                    <span className="text-warning">
                      {'★'.repeat(Math.floor(product.rating))}
                      {'☆'.repeat(5 - Math.floor(product.rating))}
                    </span>
                    <span className="text-muted ms-1" style={{ fontSize: '0.75rem' }}>
                      ({product.review_count || 0})
                    </span>
                  </div>
                )}

                <div className="mt-auto d-flex gap-2">
                  <button 
                    className="btn btn-warning flex-grow-1"
                    onClick={(e) => handleAddToCart(product, e)}
                    disabled={cartLoading[product.id]}
                    style={{ fontWeight: '500' }}
                  >
                    {cartLoading[product.id] ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                        Adding...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-shopping-cart me-1"></i> Add to Cart
                      </>
                    )}
                  </button>
                  <button 
                    className="btn btn-outline-success"
                    onClick={(e) => handleMoveToCart(product, e)}
                    disabled={cartLoading[product.id]}
                    title="Move to cart and remove from wishlist"
                  >
                    <i className="fas fa-arrow-right"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-4">
        <Link to="/products" className="btn btn-outline-warning px-4 py-2">
          <i className="fas fa-arrow-left me-2"></i>
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default WishlistPage;