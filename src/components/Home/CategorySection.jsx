import React from 'react';
import { Link } from 'react-router-dom';

const categories = [
  { name: 'Boys Fashion', img: '/images/hom1.jpg', slug: 'boys-fashion' },
  { name: 'Girls Fashion', img: '/images/hom2.jpg', slug: 'baby-girl-fashion' },
  { name: 'Footwear', img: '/images/hom3.webp', slug: 'footwear-boys' },
  { name: 'Accessories', img: '/images/hom4.jpg', slug: 'girls-accessories' },
  { name: 'Toys', img: '/images/hom5.jpg', slug: 'toys' },
  { name: 'Beds', img: '/images/hom6.jpg', slug: 'furniture-bedding' },
];

const CategorySection = () => {
  return (
    <section className="cat-section py-5 bg-white">
      <div className="container-fluid text-center">
        <h2 className="mb-5 fw-bold">Categories</h2>
        
        <div className="d-flex flex-row flex-wrap justify-content-center gap-5">
          {categories.map((category) => (
            <Link
              key={category.slug}
              to={`/subcategory/${category.slug}`}
              className="text-decoration-none category-item"
            >
              {/* Single Oval Image Frame */}
              <div className="oval-container mb-3">
                <img 
                  src={category.img} 
                  alt={category.name} 
                  className="category-img" 
                />
              </div>
              
              <p className="fw-bold text-dark category-label">{category.name}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;