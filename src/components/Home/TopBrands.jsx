import React from 'react';


const brands = [
  { name: 'Fancy Fluff', img: '/images/4.jpg' },
  { name: 'Johnson Baby', img: '/images/5.jpg' },
  { name: 'Pampers', img: '/images/1.png' },
  { name: 'Babyking', img: '/images/2.webp' },
  { name: 'Kidlon', img: '/images/3.png' },
];

const TopBrands = () => {
  return (
    <section className="py-5 bg-white overflow-hidden">
      <div className="container text-center">
        <h5 className="fw-bold mb-5">Top Brands</h5>
        
        <div className="brand-wheel">
          <div className="brand-slide">
            {/* Render the brand list twice for a seamless loop */}
            {[...brands, ...brands].map((brand, idx) => (
              <div key={idx} className="brand-item">
                <div className="brand-card">
                  <img src={brand.img} alt={brand.name} className="img-fluid" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TopBrands;