import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import axios from '../api/axios';
import ProductCard from '../components/Products/ProductCard';

const SubcategoryPage = () => {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [ageGroupOptions, setAgeGroupOptions] = useState([]);

  // Determine if category is gender-specific and which gender
  const getCategoryGender = (categorySlug) => {
    // Categories that are exclusively for girls
    const girlCategories = [
      'baby-girl-fashion',
      'girls-accessories',
      'footwear-girls',
      'girls_fashion',
      'girls-fashion',
      'girls_accessories',
    ];

    // Categories that are exclusively for boys
    const boyCategories = [
      'boys-fashion',
      'boys-accessories',
      'footwear-boys',
      'boys_fashion',
      'boys_accessories',
    ];

    // Exact matches
    if (girlCategories.includes(categorySlug)) return 'Girl';
    if (boyCategories.includes(categorySlug)) return 'Boy';

    // Partial matches (for dynamic slugs)
    if (categorySlug.includes('girl')) return 'Girl';
    if (categorySlug.includes('boy')) return 'Boy';

    return null;
  };

  const categoryGender = getCategoryGender(slug);

  const getDefaultGender = () => {
    if (categoryGender) return categoryGender;
    return '';
  };

  const getFilterConfig = (categorySlug) => {
    const hasAgeFilter = !['offers', 'rental', 'rental-services', 'moms-baby-care', 'moms-care', 'baby-care', 'furniture-bedding', 'furniture', 'bedding'].includes(categorySlug);
    const hasGenderFilter = categoryGender === null &&
      !['moms-baby-care', 'moms-care', 'baby-care', 'furniture-bedding', 'furniture', 'bedding', 'rental', 'rental-services', 'offers'].includes(categorySlug);

    const configs = {
      // Baby Fashion - mixed category (shows both boy and girl)
      'baby-fashion': { gender: true, age: true, brand: true, price: true, collections: true, sort: true },
      'baby-girl-fashion': { gender: true, age: true, brand: true, price: true, collections: true, sort: true },
      'boys-fashion': { gender: true, age: true, brand: true, price: true, collections: true, sort: true },
      'footwear-accessories': { gender: true, age: true, brand: true, price: true, collections: true, sort: true },
      'boys-accessories': { gender: true, age: true, brand: true, price: true, collections: true, sort: true },
      'girls-accessories': { gender: true, age: true, brand: true, price: true, collections: true, sort: true },
      'footwear-boys': { gender: true, age: true, brand: true, price: true, collections: true, sort: true },
      'footwear-girls': { gender: true, age: true, brand: true, price: true, collections: true, sort: true },
      'moms-baby-care': { gender: false, age: false, brand: true, price: true, collections: true, sort: true },
      'moms-care': { gender: false, age: false, brand: true, price: true, collections: true, sort: true },
      'baby-care': { gender: false, age: false, brand: true, price: true, collections: true, sort: true },
      'furniture-bedding': { gender: false, age: false, brand: true, price: true, collections: true, sort: true },
      'furniture': { gender: false, age: false, brand: true, price: true, collections: true, sort: true },
      'bedding': { gender: false, age: false, brand: true, price: true, collections: true, sort: true },
      'rental': { gender: false, age: true, brand: true, price: true, collections: true, sort: true },
      'rental-services': { gender: false, age: true, brand: true, price: true, collections: true, sort: true },
      'offers': { gender: false, age: false, brand: true, price: true, collections: true, sort: true },
      'toys': { gender: false, age: true, brand: true, price: true, collections: true, sort: true },
    };

    return configs[categorySlug] || { gender: hasGenderFilter, age: hasAgeFilter, brand: true, price: true, collections: true, sort: true };
  };

  const filterConfig = getFilterConfig(slug);

  const [openFilters, setOpenFilters] = useState({
    gender: filterConfig.gender,
    age: filterConfig.age,
    brand: filterConfig.brand,
    price: filterConfig.price,
    collections: filterConfig.collections,
    sort: filterConfig.sort,
  });

  const priceRanges = [
    { label: 'Under ₹500', min: 0, max: 500 },
    { label: '₹500 - ₹1000', min: 500, max: 1000 },
    { label: '₹1000 - ₹2000', min: 1000, max: 2000 },
    { label: '₹2000 - ₹5000', min: 2000, max: 5000 },
    { label: 'Above ₹5000', min: 5000, max: null },
  ];

  const [filters, setFilters] = useState({
    gender: filterConfig.gender ? (searchParams.get('gender') || getDefaultGender()) : '',
    age_group: filterConfig.age ? (searchParams.get('age_group') || '') : '',
    brand: filterConfig.brand ? (searchParams.get('brand') || '') : '',
    price_range: filterConfig.price ? (searchParams.get('price_range') || '') : '',
    is_top_selling: filterConfig.collections ? (searchParams.get('is_top_selling') === 'true') : false,
    is_new_arrival: filterConfig.collections ? (searchParams.get('is_new_arrival') === 'true') : false,
    sort_by: filterConfig.sort ? (searchParams.get('sort_by') || '-created_at') : '-created_at',
  });

  const genderOptions = ['Boy', 'Girl'];
  const brandOptions = ['Babyhug', 'Babyoye', 'Kookie kids', 'Carter’s', 'Dapper Dudes', 'Mothercare', 'FirstStep', 'Cocoon'];

  const sortOptions = [
    { value: '-created_at', label: 'Newest' },
    { value: 'price', label: 'Price: Low to High' },
    { value: '-price', label: 'Price: High to Low' },
    { value: 'name', label: 'Name: A to Z' },
    { value: '-name', label: 'Name: Z to A' },
  ];

  const normalizeAgeGroup = (ageString) => {
    if (!ageString) return '';
    return String(ageString)
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[-–—]/g, '-');
  };

  const detectGenderFromName = (productName) => {
    const name = productName.toLowerCase();

    const boyKeywords = ['boy', 'boys', 'male', 'man', 'gentleman', 'for boy', 'baby boy', 'little boy', 'son'];
    const girlKeywords = ['girl', 'girls', 'female', 'woman', 'lady', 'for girl', 'baby girl', 'little girl', 'daughter'];

    let isBoy = false;
    let isGirl = false;

    for (const keyword of boyKeywords) {
      if (name.includes(keyword)) {
        isBoy = true;
        break;
      }
    }

    for (const keyword of girlKeywords) {
      if (name.includes(keyword)) {
        isGirl = true;
        break;
      }
    }

    if (isBoy && !isGirl) return 'Boy';
    if (isGirl && !isBoy) return 'Girl';
    if (isBoy && isGirl) return 'Unisex';
    return null;
  };

  const isGenderMatch = (product, filterGender) => {
    if (!filterGender) return true;

    if (categoryGender) {
      return categoryGender === filterGender;
    }

    const filterGenderLower = String(filterGender).toLowerCase().trim();

    if (product.gender) {
      const productGender = String(product.gender).toLowerCase().trim();

      if (productGender === filterGenderLower) return true;

      if (filterGenderLower === 'boy') {
        if (productGender === 'boy' || productGender === 'boys' || productGender === 'male') return true;
      } else if (filterGenderLower === 'girl') {
        if (productGender === 'girl' || productGender === 'girls' || productGender === 'female') return true;
      }
    }

    const detectedGender = detectGenderFromName(product.name);
    if (detectedGender) {
      return detectedGender.toLowerCase() === filterGenderLower;
    }

    if (product.category_name) {
      const categoryName = product.category_name.toLowerCase();
      if (filterGenderLower === 'boy' && categoryName.includes('boy')) return true;
      if (filterGenderLower === 'girl' && categoryName.includes('girl')) return true;
    }

    return false;
  };

  const isAgeGroupMatch = (product, filterAge) => {
    if (!filterAge) return true;

    const filterAgeLower = String(filterAge).toLowerCase().trim();

    if (product.age_groups && Array.isArray(product.age_groups)) {
      if (product.age_groups.length === 0) return false;

      for (let ag of product.age_groups) {
        let ageGroupName = '';

        if (typeof ag === 'object') {
          ageGroupName = ag.name || ag.age_group_name || ag.title || String(ag);
        } else {
          ageGroupName = String(ag);
        }

        const normalizedAge = ageGroupName.toLowerCase().trim();

        if (normalizedAge === filterAgeLower) return true;
        if (normalizedAge.includes(filterAgeLower)) return true;
        if (filterAgeLower.includes(normalizedAge)) return true;
      }
      return false;
    }

    if (product.age_group) {
      const productAge = String(product.age_group).toLowerCase().trim();
      return productAge === filterAgeLower || productAge.includes(filterAgeLower);
    }

    return false;
  };

  useEffect(() => {
    setAgeGroupOptions(['0-6 months', '6-12 months', '1-2 years', '2-4 years', '4-6 years']);
  }, []);

  const getPriceRangeValues = (priceRangeKey) => {
    const range = priceRanges.find(r => `${r.min}-${r.max}` === priceRangeKey);
    if (range) {
      return { min: range.min, max: range.max };
    }
    return { min: null, max: null };
  };

  const getCategorySlugs = (slug) => {
    const categoryMap = {
      'baby-fashion': ['baby-fashion', 'baby-girl-fashion'],
      'baby-girl-fashion': ['baby-girl-fashion'],
      'boys-fashion': ['baby-fashion'],
      'toys': ['toys'],
      'footwear-accessories': ['boys-accessories', 'girls-accessories', 'footwear-boys', 'footwear-girls'],
      'boys-accessories': ['boys-accessories'],
      'girls-accessories': ['girls-accessories'],
      'footwear-boys': ['footwear-boys'],
      'footwear-girls': ['footwear-girls'],
      'moms-baby-care': ['moms-care', 'baby-care'],
      'moms-care': ['moms-care'],
      'baby-care': ['baby-care'],
      'furniture-bedding': ['furniture', 'bedding'],
      'furniture': ['furniture'],
      'bedding': ['bedding'],
      'rental': ['rental-services'],
      'rental-services': ['rental-services'],
      'offers': ['offers'],
    };
    return categoryMap[slug] || [slug];
  };

  const formatCategoryName = (slug) => {
    const displayNames = {
      'baby-fashion': 'Baby Fashion',
      'baby-girl-fashion': 'Baby Girl Fashion',
      'boys-fashion': 'Boys Fashion',
      'toys': 'Toys',
      'footwear-accessories': 'Footwear & Accessories',
      'boys-accessories': 'Boys Accessories',
      'girls-accessories': 'Girls Accessories',
      'footwear-boys': 'Boys Footwear',
      'footwear-girls': 'Girls Footwear',
      'moms-baby-care': 'Moms & Baby Care',
      'moms-care': 'Moms Care',
      'baby-care': 'Baby Care',
      'furniture-bedding': 'Furniture & Bedding',
      'furniture': 'Furniture',
      'bedding': 'Bedding',
      'rental': 'Rental Services',
      'rental-services': 'Rental Services',
      'offers': 'Offers',
    };
    return displayNames[slug] || slug.replace(/-/g, ' ');
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [slug, filters, currentPage]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const categorySlugs = getCategorySlugs(slug);
      console.log('Fetching categories:', categorySlugs);
      console.log('Category gender:', categoryGender);

      let allProducts = [];

      for (const catSlug of categorySlugs) {
        try {
          const url = `/products/by-category/${catSlug}/`;
          const response = await axios.get(url);
          const productsData = response.data.results || response.data;
          if (Array.isArray(productsData) && productsData.length > 0) {
            allProducts.push(...productsData);
          }
        } catch (err) {
          console.error(`Error fetching category ${catSlug}:`, err);
        }
      }

      console.log('Total products collected:', allProducts.length);

      if (allProducts.length > 0) {
        console.log('🔍 DEBUG: Age Groups in first 3 products:');
        allProducts.slice(0, 3).forEach(product => {
          console.log(`  Product: ${product.name}`);
          console.log(`    age_groups:`, product.age_groups);
          console.log(`    age_group:`, product.age_group);
        });

        const uniqueAgeGroups = new Set();
        allProducts.forEach(product => {
          if (product.age_groups && Array.isArray(product.age_groups)) {
            product.age_groups.forEach(ag => {
              const name = typeof ag === 'object' ? (ag.name || ag) : ag;
              uniqueAgeGroups.add(String(name));
            });
          }
          if (product.age_group) {
            uniqueAgeGroups.add(String(product.age_group));
          }
        });
        console.log('📊 All available age groups in products:', Array.from(uniqueAgeGroups));

        if (uniqueAgeGroups.size > 0) {
          setAgeGroupOptions(Array.from(uniqueAgeGroups));
        }
      }

      let filteredProducts = [...allProducts];

      // Apply gender filter
      if (filterConfig.gender && filters.gender) {
        const beforeCount = filteredProducts.length;
        filteredProducts = filteredProducts.filter(p => isGenderMatch(p, filters.gender));
        console.log(`🎯 Gender filter "${filters.gender}": ${beforeCount} → ${filteredProducts.length} products`);
      }

      // Apply age group filter
      if (filterConfig.age && filters.age_group) {
        const beforeCount = filteredProducts.length;
        filteredProducts = filteredProducts.filter(p => isAgeGroupMatch(p, filters.age_group));
        console.log(`🎯 Age filter "${filters.age_group}": ${beforeCount} → ${filteredProducts.length} products`);
      }

      // Apply brand filter
      if (filterConfig.brand && filters.brand) {
        filteredProducts = filteredProducts.filter(p => p.brand === filters.brand);
      }

      // Apply price range filter
      if (filterConfig.price && filters.price_range) {
        const { min, max } = getPriceRangeValues(filters.price_range);
        if (min !== null) {
          filteredProducts = filteredProducts.filter(p => p.price >= min);
        }
        if (max !== null) {
          filteredProducts = filteredProducts.filter(p => p.price <= max);
        }
      }

      // Apply collection filters
      if (filterConfig.collections) {
        if (filters.is_top_selling) {
          filteredProducts = filteredProducts.filter(p => p.is_top_selling === true);
        }
        if (filters.is_new_arrival) {
          filteredProducts = filteredProducts.filter(p => p.is_new_arrival === true);
        }
      }

      // Apply sorting
      if (filterConfig.sort) {
        const sortBy = filters.sort_by;
        if (sortBy === 'price') {
          filteredProducts.sort((a, b) => a.price - b.price);
        } else if (sortBy === '-price') {
          filteredProducts.sort((a, b) => b.price - a.price);
        } else if (sortBy === 'name') {
          filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortBy === '-name') {
          filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
        } else if (sortBy === '-created_at') {
          filteredProducts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }
      }

      console.log('✅ Final products after filters:', filteredProducts.length);
      setTotalProducts(filteredProducts.length);
      setProducts(filteredProducts);
      setTotalPages(Math.ceil(filteredProducts.length / 9));
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const newParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '') {
        if (typeof value === 'boolean') {
          if (value) newParams.set(key, 'true');
        } else {
          newParams.set(key, value);
        }
      }
    });
    setSearchParams(newParams);
  }, [filters, setSearchParams]);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      gender: getDefaultGender(),
      age_group: '',
      brand: '',
      price_range: '',
      is_top_selling: false,
      is_new_arrival: false,
      sort_by: '-created_at',
    });
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const toggleFilter = (filterName) => {
    setOpenFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };

  const productsPerPage = 9;
  const startIndex = (currentPage - 1) * productsPerPage;
  const currentProducts = products.slice(startIndex, startIndex + productsPerPage);

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
      <div className="container py-5">
        <div className="alert alert-danger text-center">
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => fetchProducts()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#fff' }}>
      <div className="container-fluid py-5">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link to="/">Home</Link></li>
            <li className="breadcrumb-item active">{formatCategoryName(slug)}</li>
          </ol>
        </nav>

        <div className="row">
          {/* FILTER SIDEBAR */}
          <aside className="col-lg-3 mb-4">
            <div className="filter-sidebar p-4 shadow-sm" style={{ background: '#fff', borderRadius: '12px' }}>
              <div className="filter-header d-flex justify-content-between align-items-center mb-4">
                <h5 className="mb-0 fw-bold">Filters</h5>
                <button onClick={clearFilters} className="text-danger text-decoration-none small bg-transparent border-0">
                  Clear All
                </button>
              </div>

              {/* Gender Filter - Only show for mixed categories */}
              {filterConfig.gender && !categoryGender && (
                <div className="filter-section mb-4">
                  <div className="filter-title d-flex justify-content-between align-items-center cursor-pointer" onClick={() => toggleFilter('gender')} style={{ cursor: 'pointer' }}>
                    <h6 className="fw-bold mb-0">Gender</h6>
                    <i className={`fa-solid fa-chevron-${openFilters.gender ? 'down' : 'right'}`} style={{ fontSize: '12px' }}></i>
                  </div>
                  {openFilters.gender && (
                    <div className="filter-options mt-3">
                      <div className="d-flex gap-3">
                        {genderOptions.map(g => (
                          <div className="form-check" key={g}>
                            <input type="radio" className="form-check-input" id={`gender${g}`} name="gender" value={g} checked={filters.gender === g} onChange={(e) => handleFilterChange('gender', e.target.value)} />
                            <label className="form-check-label" htmlFor={`gender${g}`}>{g}</label>
                          </div>
                        ))}
                        {filters.gender && (
                          <button className="btn btn-sm btn-link text-danger p-0" onClick={() => handleFilterChange('gender', '')}>Clear</button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Gender Badge for gender-specific categories */}
              {categoryGender && filterConfig.gender !== false && (
                <div className="filter-section mb-4">
                  <div className="filter-title mb-2">
                    <h6 className="fw-bold mb-0">Gender</h6>
                  </div>
                  <div className="filter-options">
                    <span className="badge bg-primary px-3 py-2" style={{ fontSize: '14px' }}>{categoryGender}</span>
                  </div>
                </div>
              )}

              {/* Age Group Filter */}
              {filterConfig.age && (
                <div className="filter-section mb-4">
                  <div className="filter-title d-flex justify-content-between align-items-center cursor-pointer" onClick={() => toggleFilter('age')} style={{ cursor: 'pointer' }}>
                    <h6 className="fw-bold mb-0">Age Group</h6>
                    <i className={`fa-solid fa-chevron-${openFilters.age ? 'down' : 'right'}`} style={{ fontSize: '12px' }}></i>
                  </div>
                  {openFilters.age && (
                    <div className="filter-options mt-3">
                      <select className="form-select form-select-sm" value={filters.age_group} onChange={(e) => handleFilterChange('age_group', e.target.value)}>
                        <option value="">All Ages</option>
                        {ageGroupOptions.map(ag => <option key={ag} value={ag}>{ag}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Brand Filter */}
              {filterConfig.brand && (
                <div className="filter-section mb-4">
                  <div className="filter-title d-flex justify-content-between align-items-center cursor-pointer" onClick={() => toggleFilter('brand')} style={{ cursor: 'pointer' }}>
                    <h6 className="fw-bold mb-0">Brand</h6>
                    <i className={`fa-solid fa-chevron-${openFilters.brand ? 'down' : 'right'}`} style={{ fontSize: '12px' }}></i>
                  </div>
                  {openFilters.brand && (
                    <div className="filter-options mt-3">
                      <select className="form-select form-select-sm" value={filters.brand} onChange={(e) => handleFilterChange('brand', e.target.value)}>
                        <option value="">All Brands</option>
                        {brandOptions.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Price Filter */}
              {filterConfig.price && (
                <div className="filter-section mb-4">
                  <div className="filter-title d-flex justify-content-between align-items-center cursor-pointer" onClick={() => toggleFilter('price')} style={{ cursor: 'pointer' }}>
                    <h6 className="fw-bold mb-0">Price</h6>
                    <i className={`fa-solid fa-chevron-${openFilters.price ? 'down' : 'right'}`} style={{ fontSize: '12px' }}></i>
                  </div>
                  {openFilters.price && (
                    <div className="filter-options mt-3">
                      {priceRanges.map((range, index) => (
                        <div className="form-check mb-2" key={index}>
                          <input type="radio" className="form-check-input" id={`price_${index}`} name="price_range" value={`${range.min}-${range.max}`} checked={filters.price_range === `${range.min}-${range.max}`} onChange={(e) => handleFilterChange('price_range', e.target.value)} />
                          <label className="form-check-label" htmlFor={`price_${index}`}>{range.label}</label>
                        </div>
                      ))}
                      {filters.price_range && (
                        <button className="btn btn-sm btn-link text-danger p-0 mt-2" onClick={() => handleFilterChange('price_range', '')}>Clear Price Filter</button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Collections Filter */}
              {filterConfig.collections && (
                <div className="filter-section mb-4">
                  <div className="filter-title d-flex justify-content-between align-items-center cursor-pointer" onClick={() => toggleFilter('collections')} style={{ cursor: 'pointer' }}>
                    <h6 className="fw-bold mb-0">Collections</h6>
                    <i className={`fa-solid fa-chevron-${openFilters.collections ? 'down' : 'right'}`} style={{ fontSize: '12px' }}></i>
                  </div>
                  {openFilters.collections && (
                    <div className="filter-options mt-3">
                      <div className="form-check mb-2">
                        <input type="checkbox" className="form-check-input" id="topSelling" checked={filters.is_top_selling} onChange={(e) => handleFilterChange('is_top_selling', e.target.checked)} />
                        <label className="form-check-label" htmlFor="topSelling">Top Selling</label>
                      </div>
                      <div className="form-check">
                        <input type="checkbox" className="form-check-input" id="newArrival" checked={filters.is_new_arrival} onChange={(e) => handleFilterChange('is_new_arrival', e.target.checked)} />
                        <label className="form-check-label" htmlFor="newArrival">New Arrivals</label>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Sort By */}
              {filterConfig.sort && (
                <div className="filter-section">
                  <div className="filter-title d-flex justify-content-between align-items-center cursor-pointer" onClick={() => toggleFilter('sort')} style={{ cursor: 'pointer' }}>
                    <h6 className="fw-bold mb-0">Sort By</h6>
                    <i className={`fa-solid fa-chevron-${openFilters.sort ? 'down' : 'right'}`} style={{ fontSize: '12px' }}></i>
                  </div>
                  {openFilters.sort && (
                    <div className="filter-options mt-3">
                      <select className="form-select form-select-sm" value={filters.sort_by} onChange={(e) => handleFilterChange('sort_by', e.target.value)}>
                        {sortOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>
          </aside>

          {/* PRODUCTS */}
          <main className="col-lg-9">
            <div className="page-header mb-4">
              <h2 className="h3 fw-bold">{formatCategoryName(slug)}</h2>
            </div>

            {/* Active Filters */}
            {(filters.gender || filters.age_group || filters.brand || filters.price_range || filters.is_top_selling || filters.is_new_arrival) && (
              <div className="active-filters mb-4 d-flex flex-wrap gap-2 align-items-center">
                <span className="text-muted small">Active Filters:</span>
                {filterConfig.gender && filters.gender && !categoryGender && <span className="filter-tag bg-light px-3 py-1 rounded-pill small">Gender: {filters.gender} <button className="btn-close" style={{ fontSize: '8px', width: '12px', height: '12px' }} onClick={() => handleFilterChange('gender', '')} /></span>}
                {filterConfig.age && filters.age_group && <span className="filter-tag bg-light px-3 py-1 rounded-pill small">Age: {filters.age_group} <button className="btn-close" style={{ fontSize: '8px', width: '12px', height: '12px' }} onClick={() => handleFilterChange('age_group', '')} /></span>}
                {filterConfig.brand && filters.brand && <span className="filter-tag bg-light px-3 py-1 rounded-pill small">Brand: {filters.brand} <button className="btn-close" style={{ fontSize: '8px', width: '12px', height: '12px' }} onClick={() => handleFilterChange('brand', '')} /></span>}
                {filterConfig.price && filters.price_range && <span className="filter-tag bg-light px-3 py-1 rounded-pill small">Price: {priceRanges.find(r => `${r.min}-${r.max}` === filters.price_range)?.label || filters.price_range} <button className="btn-close" style={{ fontSize: '8px', width: '12px', height: '12px' }} onClick={() => handleFilterChange('price_range', '')} /></span>}
                {filterConfig.collections && filters.is_top_selling && <span className="filter-tag bg-light px-3 py-1 rounded-pill small">Top Selling <button className="btn-close" style={{ fontSize: '8px', width: '12px', height: '12px' }} onClick={() => handleFilterChange('is_top_selling', false)} /></span>}
                {filterConfig.collections && filters.is_new_arrival && <span className="filter-tag bg-light px-3 py-1 rounded-pill small">New Arrivals <button className="btn-close" style={{ fontSize: '8px', width: '12px', height: '12px' }} onClick={() => handleFilterChange('is_new_arrival', false)} /></span>}
              </div>
            )}

            {/* Products Count and Sort */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <span className="text-muted small">Showing {currentProducts.length} of {totalProducts} products</span>
              {filterConfig.sort && (
                <div className="sort-section d-flex align-items-center gap-2">
                  <label className="small mb-0">Sort by:</label>
                  <select className="form-select form-select-sm" style={{ width: 'auto' }} value={filters.sort_by} onChange={(e) => handleFilterChange('sort_by', e.target.value)}>
                    {sortOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
              )}
            </div>

            {/* Product Grid */}
            {currentProducts.length === 0 ? (
              <div className="text-center py-5">
                <i className="fa-solid fa-eye-slash fa-3x text-muted mb-3"></i>
                <h4>No Products Found</h4>
                <p className="text-muted">Try adjusting your filters or check back later</p>
                <button className="btn btn-outline-dark" onClick={clearFilters}>Clear Filters</button>
              </div>
            ) : (
              <>
                <div className="row g-4">
                  {currentProducts.map(product => (
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
                          <button className="page-link" onClick={() => goToPage(currentPage - 1)}><i className="fa-solid fa-chevron-left"></i></button>
                        </li>
                        {[...Array(totalPages).keys()].map(i => {
                          const pageNum = i + 1;
                          if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 2 && pageNum <= currentPage + 2)) {
                            return (
                              <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                                <button className="page-link" onClick={() => goToPage(pageNum)}>{pageNum}</button>
                              </li>
                            );
                          } else if ((pageNum === currentPage - 3 && currentPage > 4) || (pageNum === currentPage + 3 && currentPage < totalPages - 3)) {
                            return <li key={pageNum} className="page-item disabled"><span className="page-link">...</span></li>;
                          }
                          return null;
                        })}
                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                          <button className="page-link" onClick={() => goToPage(currentPage + 1)}><i className="fa-solid fa-chevron-right"></i></button>
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

export default SubcategoryPage;