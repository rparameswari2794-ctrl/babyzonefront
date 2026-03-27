import React from 'react';
// Ensure you have bootstrap installed: npm install bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';

const AboutPage = () => {
  return (
    <div className="bg-white min-vh-100 overflow-hidden">
      {/* 1. TOP SECTION: Content and Baby Image */}
      <div className="container py-5">
        {/* Breadcrumb */}
        <nav className="small text-muted mb-4">
          Home/ <span className="text-dark">About</span>
        </nav>

        {/* Page Title */}
        <h4 className="text-center fw-bold mb-5">About Us</h4>

        <div className="row align-items-start">
          
          {/* Left Side: Mission & Vision (col-lg-6) */}
          <div className="col-lg-6 pe-lg-5">
            <section className="mb-5">
              <h5 className="fw-bold mb-3">Our Mision</h5>
              <p className="text-small t mb-0">
                "To empower parents by providing thoughtfully designed, safe, and sustainable baby essentials that make childcare easier and more enjoyable for every family". 
                "To be the go-to online store for parents seeking reliable, expertly curated baby products, ensuring peace of mind with every purchase". 
                "To offer innovative, high-quality baby gear and apparel that promote infant comfort, safety, and healthy development from day one"
              </p>
            </section>

            <section>
              <h5 className="fw-bold mb-3">Our Vision</h5>
              <p className="text-small mb-0">
                "To create a world where every new parent has access to the best resources and products, fostering a generation of healthy, happy, and thriving children". 
                "To become the most beloved and trusted global community for parents, known for our commitment to quality, innovation, and family well-being". 
                "To revolutionize the way families shop for baby products, setting the standard for sustainability, transparency, and personalized support in the industry".
              </p>
            </section>
          </div>

          {/* Right Side: Image with Pink Shape (col-lg-6) */}
          <div className="col-lg-6 position-relative d-flex justify-content-center justify-content-lg-end mt-5 mt-lg-0">
            {/* Pink Background Circle */}
            <div 
              className="position-absolute translate-middle-y top-50"
              style={{ 
                backgroundColor: '#fda7d8ff', 
                width: '500px', 
                height: '500px', 
                borderRadius: '50%', 
                right: '-100px', 
                zIndex: 0 
              }} 
            />
            
            {/* The Main Circular Baby Image */}
            <div 
              className="position-relative z-1 shadow-lg overflow-hidden rounded-circle"
              style={{ width: '450px', height: '450px',right:'70px' }}
            >
              <img 
                src="/images/a1.jpg" 
                alt="Mother and baby" 
                className="w-100 h-100 object-fit-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. BOTTOM SECTION: Full Width Map Container */}
      <div className="w-100 position-relative" style={{ height: '500px',marginTop:'50px' }}>
        <img 
          src="/images/a2.jpg" 
          alt="Location Map" 
          className="w-100 h-100 object-fit-cover"
        />
        
        {/* Sun Flare Overlay Effect */}
        <div 
          className="position-absolute top-0 start-0 w-100 h-100 pointer-events-none"
          style={{ 
            background: 'radial-gradient(circle at 5% 5%, rgba(255,230,150,0.3) 0%, transparent 40%)' 
          }}
        />
      </div>
    </div>
  );
};

export default AboutPage;