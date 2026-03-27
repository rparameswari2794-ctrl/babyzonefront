// components/Navbar/Navbar.jsx - Fixed badge update to work immediately
import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { loginSuccess, logout } from '@/store/slices/authSlice';
import { fetchCart } from '@/store/slices/cartSlice';
import CategoriesDropdown from '../CategoriesDropDown';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { items, totalItems } = useSelector((state) => state.cart || { items: [], totalItems: 0 });
  const userRole = user?.role || 'user';
  
  const cartFetched = useRef(false);
  
  // Local state for immediate updates
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [showMessage, setShowMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Search suggestions data
  const searchCategories = [
    'baby care', 'baby products', 'baby essentials', 'mom care', 'mom products',
    'girl accessories', 'girl hair band', 'hair bows', 'hair clips', 'headbands',
    'girl shoes', 'girl footwear', 'girl dress', 'girl frock',
    'boy accessories', 'boy belt', 'boy shoes', 'boy footwear', 'boy dress',
    'rent products', 'rental service', 'baby stroller rental', 'baby bed rental'
  ];

  // Function to update wishlist count from localStorage
  const updateWishlistCount = () => {
    try {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setWishlistCount(wishlist.length);
    } catch (error) {
      console.error('Error reading wishlist:', error);
      setWishlistCount(0);
    }
  };

  // Update cart count
  useEffect(() => {
    const count = items?.reduce((total, item) => total + (item.quantity || 1), 0) || totalItems || 0;
    setCartCount(count);
  }, [items, totalItems]);

  // Update wishlist count on mount and listen for changes
  useEffect(() => {
    // Initial load
    updateWishlistCount();
    
    // Listen for custom wishlist update events
    const handleWishlistUpdate = (event) => {
      console.log('Wishlist update event received:', event.detail);
      updateWishlistCount();
    };
    
    // Listen for storage events (for cross-tab updates)
    const handleStorageChange = (e) => {
      if (e.key === 'wishlist') {
        console.log('Storage change detected for wishlist');
        updateWishlistCount();
      }
    };
    
    window.addEventListener('wishlistUpdated', handleWishlistUpdate);
    window.addEventListener('storage', handleStorageChange);
    
    // Also set up an interval to check for changes (fallback)
    const interval = setInterval(() => {
      updateWishlistCount();
    }, 1000);
    
    return () => {
      window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Fetch cart when user is authenticated - ONLY ONCE
  useEffect(() => {
    if (isAuthenticated && !cartFetched.current) {
      cartFetched.current = true;
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated]);

  // Filter search suggestions based on input
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const filtered = searchCategories.filter(category =>
        category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchSuggestions(filtered.slice(0, 8));
      setShowSuggestions(true);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  const showToast = (msg) => {
    setShowMessage(msg);
    setTimeout(() => setShowMessage(''), 3000);
  };

  // Smart search function
  const handleSearchSubmit = (query) => {
    if (query.trim()) {
      setShowSuggestions(false);
      const searchLower = query.toLowerCase();
      
      if (searchLower.includes('rent') || searchLower.includes('rental')) {
        navigate('/subcategory/rental');
        showToast('Showing Rental Services');
        return;
      }
      
      if (searchLower.includes('furniture') || searchLower.includes('bedding') || searchLower.includes('baby chair')) {
        navigate('/subcategory/furniture-bedding');
        showToast('Showing Furniture & Bedding');
        return;
      }
      
      if (searchLower.includes('mom') || searchLower.includes('baby care') || searchLower.includes('diaper')) {
        navigate('/subcategory/moms-baby-care');
        showToast('Showing Moms & Baby Care');
        return;
      }
      
      if (searchLower.includes('shoe') || searchLower.includes('footwear') || searchLower.includes('hair band')) {
        if (searchLower.includes('girl')) {
          navigate('/subcategory/footwear-accessories?gender=girl');
        } else if (searchLower.includes('boy')) {
          navigate('/subcategory/footwear-accessories?gender=boy');
        } else {
          navigate('/subcategory/footwear-accessories');
        }
        showToast('Showing Footwear & Accessories');
        return;
      }
      
      if (searchLower.includes('dress') || searchLower.includes('fashion') || searchLower.includes('clothing')) {
        if (searchLower.includes('girl')) {
          navigate('/subcategory/baby-fashion?gender=girl');
        } else if (searchLower.includes('boy')) {
          navigate('/subcategory/baby-fashion?gender=boy');
        } else {
          navigate('/subcategory/baby-fashion');
        }
        showToast('Showing Baby Fashion');
        return;
      }
      
      navigate(`/products?search=${encodeURIComponent(query)}`);
      showToast(`Searching for: ${query}`);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      handleSearchSubmit(searchQuery);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    handleSearchSubmit(suggestion);
  };

  const startVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      showToast('Voice search not supported in this browser');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsListening(true);
    recognition.start();

    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;
      setSearchQuery(speechResult);
      setIsListening(false);
      setTimeout(() => {
        handleSearchSubmit(speechResult);
      }, 100);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      showToast('Voice search error: ' + event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  const handleLogin = (role = 'user') => {
    const mockUser = {
      id: 1,
      name: role === 'admin' ? 'Admin User' :
        role === 'manager' ? 'Manager User' :
          role === 'billing_staff' ? 'Staff User' : 'Regular User',
      email: 'user@example.com',
      role: role,
    };
    const mockTokens = { access: 'mock-token', refresh: 'mock-refresh' };
    dispatch(loginSuccess({ access: mockTokens.access, refresh: mockTokens.refresh, user: mockUser }));
    showToast(`Logged in as ${role}`);
    navigate('/profile');
  };

  const handleLogout = () => {
    dispatch(logout());
    showToast('Logged out successfully');
    navigate('/');
  };

  const handleSendDailyReport = () => {
    if (!isAuthenticated) return;
    showToast('Daily report sent to admin!');
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg bg-white shadow-sm ">
        <div className="container-fluid px-4">
          <Link to="/" className="navbar-brand">
            <img src="/images/logo1.png" alt="BabyZone" className="navbarbrand-img1" style={{ height: '40px' }} />
            <img src="/images/logo2.png" alt="BabyZone" className="navbarbrand-img2" style={{ height: '30px', marginLeft: '8px' }} />
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarMain"
            aria-controls="navbarMain"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarMain">
            <form className="nav-form" onSubmit={handleSearch} style={{ position: 'relative', flex: 1 }}>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search for baby care, girl accessories, boy shoes, rental products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  onFocus={() => searchQuery.trim().length > 0 && setShowSuggestions(true)}
                />
              </div>
              <button
                className={`btn ${isListening ? 'btn-danger' : 'btn-outline-secondary'} form-btn`}
                type="button"
                onClick={startVoiceSearch}
                title="Voice search"
              >
                <i className="fas fa-microphone"></i>
              </button>
              
              {showSuggestions && searchSuggestions.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  zIndex: 1000,
                  maxHeight: '300px',
                  overflowY: 'auto',
                  marginTop: '5px'
                }}>
                  {searchSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      style={{
                        padding: '10px 15px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #f0f0f0',
                        transition: 'background 0.2s',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    >
                      <i className="fas fa-search me-2" style={{ color: '#6c757d', width: '20px' }}></i>
                      <span>{suggestion}</span>
                    </div>
                  ))}
                </div>
              )}
            </form>

            <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active-link' : 'nav-link'}>
                  Home
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/about" className={({ isActive }) => isActive ? 'nav-link active-link' : 'nav-link'}>
                  About
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/contact" className={({ isActive }) => isActive ? 'nav-link active-link' : 'nav-link'}>
                  Contact
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/forum" className={({ isActive }) => isActive ? 'nav-link active-link' : 'nav-link'}>
                  Forum
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/parenting-classes" className={({ isActive }) => isActive ? 'nav-link active-link' : 'nav-link'}>
                  Parenting classes
                </NavLink>
              </li>

              {isAuthenticated && (
                <li className="nav-item position-relative">
                  <NavLink to="/wishlist" className={({ isActive }) => isActive ? 'nav-link active-link' : 'nav-link'}>
                    <i className="fas fa-heart me-1"></i> Wishlist
                    {wishlistCount > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" 
                            style={{ fontSize: '10px', marginTop: '-5px', marginLeft: '-10px' }}>
                        {wishlistCount}
                        <span className="visually-hidden">items in wishlist</span>
                      </span>
                    )}
                  </NavLink>
                </li>
              )}

              {isAuthenticated && (
                <li className="nav-item position-relative">
                  <NavLink to="/cart" className={({ isActive }) => isActive ? 'nav-link active-link' : 'nav-link'}>
                    <i className="fas fa-shopping-cart me-1"></i> Cart
                    {cartCount > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" 
                            style={{ fontSize: '10px', marginTop: '-5px', marginLeft: '-10px' }}>
                        {cartCount}
                        <span className="visually-hidden">items in cart</span>
                      </span>
                    )}
                  </NavLink>
                </li>
              )}

              {!isAuthenticated ? (
                <>
                  <li className="nav-item">
                    <Link to="/login" className="btn btn-warning me-3 ms-2" style={{ fontWeight: '600' }}>Login</Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/register" className="btn btn-warning" style={{ fontWeight: '600', marginTop: '2px' }}>Register</Link>
                  </li>
                </>
              ) : (
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle"
                    href="#"
                    id="userDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <span className="me-1">
                      {user?.name ? user.name : <i className="fa-solid fa-circle-user fs-5"></i>}
                    </span>
                  </a>

                  <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2" aria-labelledby="userDropdown">
                    {userRole === 'user' && (
                      <>
                        <li><Link to="/forum" className="dropdown-item">
                          <i className="fas fa-comments me-2"></i> Forum
                        </Link></li>
                        <li><Link to="/parenting-classes" className="dropdown-item">
                          <i className="fas fa-chalkboard-user me-2"></i> Parenting Classes
                        </Link></li>
                        <li><Link to="/wishlist" className="dropdown-item">
                          <i className="fas fa-heart me-2"></i> My Wishlist
                          {wishlistCount > 0 && (
                            <span className="badge bg-danger ms-2">{wishlistCount}</span>
                          )}
                        </Link></li>
                        <li><Link to="/orders" className="dropdown-item">
                          <i className="fas fa-shopping-bag me-2"></i> My Orders
                        </Link></li>
                        <li><Link to="/profile" className="dropdown-item">
                          <i className="fas fa-user me-2"></i> Profile
                        </Link></li>
                      </>
                    )}
                    {userRole === 'billing_staff' && (
                      <>
                        <li><Link to="/billing-dashboard" className="dropdown-item">💰 Billing Dashboard</Link></li>
                        <li><Link to="/stock-details" className="dropdown-item">📦 Stock Details</Link></li>
                        <li><Link to="/profile" className="dropdown-item">👤 Staff Profile</Link></li>
                      </>
                    )}
                    {userRole === 'manager' && (
                      <>
                        <li><Link to="/manager/sales" className="dropdown-item">💰 Sales</Link></li>
                        <li><Link to="/manager/orders" className="dropdown-item">📦 Orders</Link></li>
                        <li><Link to="/manager/purchases" className="dropdown-item">🛒 Purchases</Link></li>
                        <li><Link to="/manager/employees" className="dropdown-item">👥 Employees</Link></li>
                        <li><Link to="/profile" className="dropdown-item">👤 Manager Profile</Link></li>
                        <li><hr className="dropdown-divider" /></li>
                        <li><button className="dropdown-item" onClick={handleSendDailyReport}>📧 Send Daily Report</button></li>
                      </>
                    )}
                    {userRole === 'admin' && (
                      <>
                        <li><Link to="/admin/orders" className="dropdown-item">📦 Orders</Link></li>
                        <li><Link to="/admin/employees" className="dropdown-item">👥 Employees</Link></li>
                        <li><Link to="/admin/stocks" className="dropdown-item">📊 Stocks</Link></li>
                        <li><Link to="/admin/customers" className="dropdown-item">👤 Customers</Link></li>
                        <li><Link to="/profile" className="dropdown-item">👤 Admin Profile</Link></li>
                      </>
                    )}
                    <li><hr className="dropdown-divider" /></li>
                    <li><button className="dropdown-item text-danger" onClick={handleLogout}>
                      <i className="fas fa-sign-out-alt me-2"></i> Logout
                    </button></li>
                  </ul>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>

      <div className="categories-bar">
        <div className="container-fluid category-container">
          <div className='d-flex flex-wrap gap-4'>
            <div className="dropdown">
              <CategoriesDropdown />
            </div>

            <Link to="/subcategory/baby-fashion" className="btn nav-btn">Baby Fashion</Link>
            <Link to="/subcategory/toys" className="btn nav-btn">Toys</Link>
            <Link to="/subcategory/footwear-accessories" className="btn nav-btn">Footwear & Accessories</Link>
            <Link to="/subcategory/moms-baby-care" className="btn nav-btn">Moms & Baby Care</Link>
            <Link to="/subcategory/furniture-bedding" className="btn nav-btn">Furniture & Bedding</Link>
            <Link to="/subcategory/rental" className="btn nav-btn">Rental Services</Link>
            <Link to="/subcategory/offers" className="btn nav-btn">Offers</Link>
          </div>
        </div>
      </div>

      {showMessage && (
        <div className="message-toast">
          {showMessage}
        </div>
      )}
    </>
  );
};

export default Navbar;