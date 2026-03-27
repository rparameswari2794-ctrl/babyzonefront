import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from '../api/axios';
import ProductCard from '../components/Products/ProductCard';

const PRODUCTS_PER_PAGE = 6;

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [ageGroupOptions, setAgeGroupOptions] = useState([]);

  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category');
  const search = searchParams.get('search');

  // Filter states
  const [filters, setFilters] = useState({
    brand: searchParams.get('brand') || '',
    age_group: searchParams.get('age_group') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    is_top_selling: searchParams.get('is_top_selling') === 'true',
    is_new_arrival: searchParams.get('is_new_arrival') === 'true',
    sort_by: searchParams.get('sort_by') || '-created_at',
  });

  const brandOptions = [
    'Babyhug', 'Babyoye', 'Kookie kids', 'Carter’s', 
    'Dapper Dudes', 'Mothercare', 'FirstStep', 'Cocoon',
  ];

  const sortOptions = [
    { value: '-created_at', label: 'Newest' },
    { value: 'price', label: 'Price: Low to High' },
    { value: '-price', label: 'Price: High to Low' },
  ];

  // Fetch age groups
  useEffect(() => {
    const fetchAgeGroups = async () => {
      try {
        const response = await axios.get('/age-groups/');
        const groups = response.data.results || response.data;
        if (Array.isArray(groups)) {
          setAgeGroupOptions(groups.map(g => g.name));
        } else {
          // Default age groups if API fails
          setAgeGroupOptions(['0-6 months', '7-12 months', '1-2 years', '3-5 years', '6+ years']);
        }
      } catch (err) {
        console.error('Failed to fetch age groups:', err);
        setAgeGroupOptions(['0-6 months', '7-12 months', '1-2 years', '3-5 years', '6+ years']);
      }
    };
    fetchAgeGroups();
  }, []);

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, [filters, category, search, currentPage]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let res;
      let allProducts = [];

      if (search) {
        res = await axios.get(`/products/search/`, { params: { q: search } });
        allProducts = res.data.results || res.data;
      } else if (category) {
        res = await axios.get(`/products/by-category/${category}/`);
        allProducts = res.data.results || res.data;
      } else {
        res = await axios.get('/products/');
        allProducts = res.data.results || res.data;
      }

      let data = [...allProducts];

      // Apply filters
      if (filters.brand) {
        data = data.filter(p => p.brand === filters.brand);
      }
      
      // Age group filter - using ManyToMany relationship
      if (filters.age_group) {
        data = data.filter(p => p.age_groups && p.age_groups.some(ag => ag === filters.age_group));
      }
      
      if (filters.min_price) {
        data = data.filter(p => p.price >= parseFloat(filters.min_price));
      }
      if (filters.max_price) {
        data = data.filter(p => p.price <= parseFloat(filters.max_price));
      }
      if (filters.is_top_selling) {
        data = data.filter(p => p.is_top_selling);
      }
      if (filters.is_new_arrival) {
        data = data.filter(p => p.is_new_arrival);
      }

      // Apply sorting
      if (filters.sort_by === 'price') {
        data.sort((a, b) => a.price - b.price);
      } else if (filters.sort_by === '-price') {
        data.sort((a, b) => b.price - a.price);
      }

      setTotalProducts(data.length);
      
      const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
      const end = start + PRODUCTS_PER_PAGE;
      setProducts(data.slice(start, end));
      setTotalPages(Math.ceil(data.length / PRODUCTS_PER_PAGE));
      
    } catch (err) {
      setError('Failed to load products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      brand: '',
      age_group: '',
      min_price: '',
      max_price: '',
      is_top_selling: false,
      is_new_arrival: false,
      sort_by: '-created_at',
    });
    setCurrentPage(1);
  };

  if (loading && currentPage === 1) {
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
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#e3dfdfff', minHeight: '100vh' }}>
      <div className="container-fluid py-4 px-4">
        <div className="row">
          {/* Filter Sidebar */}
          <aside className="col-lg-3 mb-4">
            <div className="p-4 shadow-sm" style={{ background: '#fff', borderRadius: '12px' }}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="mb-0 fw-bold">Filters</h5>
                <button 
                  onClick={clearFilters} 
                  className="text-danger text-decoration-none small bg-transparent border-0"
                >
                  Clear All
                </button>
              </div>

              {/* Age Group Filter */}
              <div className="mb-4">
                <label className="fw-bold mb-2">Age Group</label>
                <select
                  className="form-select"
                  value={filters.age_group}
                  onChange={(e) => handleFilterChange('age_group', e.target.value)}
                >
                  <option value="">All</option>
                  {ageGroupOptions.map(ag => (
                    <option key={ag} value={ag}>{ag}</option>
                  ))}
                </select>
              </div>

              {/* Brand Filter */}
              <div className="mb-4">
                <label className="fw-bold mb-2">Brand</label>
                <select
                  className="form-select"
                  value={filters.brand}
                  onChange={(e) => handleFilterChange('brand', e.target.value)}
                >
                  <option value="">All</option>
                  {brandOptions.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* Price Filter */}
              <div className="mb-4">
                <label className="fw-bold mb-2">Price Range</label>
                <div className="row g-2">
                  <div className="col-6">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Min"
                      value={filters.min_price}
                      onChange={(e) => handleFilterChange('min_price', e.target.value)}
                    />
                  </div>
                  <div className="col-6">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Max"
                      value={filters.max_price}
                      onChange={(e) => handleFilterChange('max_price', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Collections Filter */}
              <div className="mb-4">
                <label className="fw-bold mb-2">Collections</label>
                <div className="form-check mb-2">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="topSelling"
                    checked={filters.is_top_selling}
                    onChange={(e) => handleFilterChange('is_top_selling', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="topSelling">
                    Top Selling
                  </label>
                </div>
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="newArrival"
                    checked={filters.is_new_arrival}
                    onChange={(e) => handleFilterChange('is_new_arrival', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="newArrival">
                    New Arrivals
                  </label>
                </div>
              </div>

              {/* Sort By */}
              <div>
                <label className="fw-bold mb-2">Sort By</label>
                <select
                  className="form-select"
                  value={filters.sort_by}
                  onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                >
                  {sortOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </aside>

          {/* Products */}
          <main className="col-lg-9">
            <div className="page-header mb-4">
              <h2 className="h3 fw-bold">
                {category ? `${category.replace(/-/g, ' ')}` : search ? `Search: "${search}"` : 'All Products'}
              </h2>
            </div>

            {/* Active Filters */}
            {(filters.brand || filters.age_group || filters.min_price || filters.max_price || filters.is_top_selling || filters.is_new_arrival) && (
              <div className="active-filters mb-4 d-flex flex-wrap gap-2 align-items-center">
                <span className="text-muted small">Active Filters:</span>
                {filters.age_group && (
                  <span className="bg-light px-3 py-1 rounded-pill small d-inline-flex align-items-center gap-2">
                    Age: {filters.age_group}
                    <button 
                      className="btn-close"
                      style={{ fontSize: '8px', width: '12px', height: '12px' }}
                      onClick={() => handleFilterChange('age_group', '')}
                    />
                  </span>
                )}
                {filters.brand && (
                  <span className="bg-light px-3 py-1 rounded-pill small d-inline-flex align-items-center gap-2">
                    Brand: {filters.brand}
                    <button 
                      className="btn-close"
                      style={{ fontSize: '8px', width: '12px', height: '12px' }}
                      onClick={() => handleFilterChange('brand', '')}
                    />
                  </span>
                )}
                {(filters.min_price || filters.max_price) && (
                  <span className="bg-light px-3 py-1 rounded-pill small d-inline-flex align-items-center gap-2">
                    Price: {filters.min_price || '0'} - {filters.max_price || '∞'}
                    <button 
                      className="btn-close"
                      style={{ fontSize: '8px', width: '12px', height: '12px' }}
                      onClick={() => {
                        handleFilterChange('min_price', '');
                        handleFilterChange('max_price', '');
                      }}
                    />
                  </span>
                )}
                {filters.is_top_selling && (
                  <span className="bg-light px-3 py-1 rounded-pill small d-inline-flex align-items-center gap-2">
                    Top Selling
                    <button 
                      className="btn-close"
                      style={{ fontSize: '8px', width: '12px', height: '12px' }}
                      onClick={() => handleFilterChange('is_top_selling', false)}
                    />
                  </span>
                )}
                {filters.is_new_arrival && (
                  <span className="bg-light px-3 py-1 rounded-pill small d-inline-flex align-items-center gap-2">
                    New Arrivals
                    <button 
                      className="btn-close"
                      style={{ fontSize: '8px', width: '12px', height: '12px' }}
                      onClick={() => handleFilterChange('is_new_arrival', false)}
                    />
                  </span>
                )}
              </div>
            )}

            {/* Products Count and Sort */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <span className="text-muted small">
                Showing {products.length} of {totalProducts} products
              </span>
              <div className="sort-section d-flex align-items-center gap-2">
                <label className="small mb-0">Sort by:</label>
                <select
                  className="form-select form-select-sm"
                  style={{ width: 'auto' }}
                  value={filters.sort_by}
                  onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                >
                  {sortOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Product Grid */}
            {products.length === 0 ? (
              <div className="text-center py-5">
                <i className="fa-solid fa-eye-slash fa-3x text-muted mb-3"></i>
                <h4>No Products Found</h4>
                <p className="text-muted">Try adjusting your filters or check back later</p>
                <button className="btn btn-outline-dark" onClick={clearFilters}>
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="row g-4">
                  {products.map(product => (
                    <div key={product.id} className="col-md-6 col-lg-4">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="text-center mt-5">
                    <nav aria-label="Page navigation">
                      <ul className="pagination justify-content-center">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                          <button className="page-link" onClick={() => setCurrentPage(prev => prev - 1)}>
                            <i className="fa-solid fa-chevron-left"></i>
                          </button>
                        </li>
                        {[...Array(totalPages).keys()].map(i => {
                          const pageNum = i + 1;
                          if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 2 && pageNum <= currentPage + 2)) {
                            return (
                              <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                                <button className="page-link" onClick={() => setCurrentPage(pageNum)}>
                                  {pageNum}
                                </button>
                              </li>
                            );
                          } else if ((pageNum === currentPage - 3 && currentPage > 4) || (pageNum === currentPage + 3 && currentPage < totalPages - 3)) {
                            return <li key={pageNum} className="page-item disabled"><span className="page-link">...</span></li>;
                          }
                          return null;
                        })}
                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                          <button className="page-link" onClick={() => setCurrentPage(prev => prev + 1)}>
                            <i className="fa-solid fa-chevron-right"></i>
                          </button>
                        </li>
                      </ul>
                    </nav>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;