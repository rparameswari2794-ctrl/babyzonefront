// components/Product/ProductSection.jsx
import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import ProductCard from '@/components/Products/ProductCard';
import { Link } from 'react-router-dom';

const ProductSection = ({ title, endpoint, limit, variant = "default", hideWishlist = false }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const isTopSelling = variant === "top-selling";
  const isNewArrival = title === "New Arrivals";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(endpoint);
        let data = Array.isArray(response.data) ? response.data : (response.data.results || []);
        setProducts(data.slice(0, limit));
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [endpoint, limit]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-pink" />
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className={`py-5 ${isTopSelling ? 'bg-pink-section' : ''}`}>
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="fw-bold mb-0 text-start" style={{ fontSize: '1.1rem' }}>{title}</h5>
          
          {/* View All hidden for Top Selling and New Arrivals */}
          {!isTopSelling && !isNewArrival && (
            <Link to="/products" className="text-dark fw-bold text-decoration-none">View All</Link>
          )}
        </div>
        
        <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-4">
          {products.map((product) => (
            <div key={product.id} className="col">
              <ProductCard 
                product={product} 
                variant={variant}
                hideWishlist={hideWishlist}  // Pass the hideWishlist prop to ProductCard
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductSection;