import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import CustomSlideshow from '../components/Home/CustomSlideshow';
import CategorySection from '../components/Home/CategorySection';
import ProductSection from '../components/Home/ProductSection';
import TopBrands from '../components/Home/TopBrands';
import Testimonials from '../components/Home/Testimonials';

const HomePage = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('home/stats/');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="overflow-hidden"> {/* Prevents horizontal scroll from slants */}
      {/* 1. Hero Slideshow */}
      <CustomSlideshow />

      {/* 2. Oval Category Section */}
      <CategorySection />

      {/* 3. New Arrivals: White background - Hide wishlist */}
      <ProductSection 
        title="New Arrivals" 
        endpoint="home/new-arrivals/" 
        limit={8} 
        variant="default" 
        hideWishlist={true}
      />

      {/* 4. Top Selling: Applying the pink section class from your CSS - Hide wishlist */}
      <div className="bg-pink-section">
        <ProductSection 
          title="Top selling" 
          endpoint="home/top-selling/" 
          limit={4} 
          variant="top-selling" 
          hideWishlist={true}
        />
      </div>

      {/* 5. Rolling Top Brands */}
      <TopBrands />

      {/* 6. Testimonials: No extra wrapper to avoid grey gaps */}
      <Testimonials />
    </div>
  );
};

export default HomePage;