import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="py-5 mt-5 border-0" style={{ backgroundColor: '#ffa9daff' }}>
      <div className="container-fluid">
        <div className="row text-dark gy-1">

          {/* 1. Logo and Address Section - Left Aligned */}
          <div className="col-lg-2 col-md-6 col-sm-12">
            <div className="d-flex flex-column mb-3 align-items-start">
              <img src="/images/logo1.png" alt="BabyZone Logo" style={{ height: '70px', objectFit: 'contain' }} />
              <img src="/images/logo2.png" alt="BabyZone" style={{ height: '10px', marginTop: '5px',marginLeft:'20px'}} />
            </div>
            <p className="fw-bold mb-0 text-start" style={{ fontSize: '0.80rem', lineHeight: '1.4' }}>
              4th street, pallavaram,<br />
              Near bus stand<br />
              Madurai-234567
            </p>
          </div>

          {/* 2. Top Categories */}
          <div className="col-lg-2 col-md-6 col-sm-12">
            <h6 className="fw-bold mb-4">Top categories</h6>
            <ul className="list-unstyled d-flex flex-column gap-1">
              {['Baby Fashion', 'Toys', 'Footwear & Accessories', 'Moms & Baby care', 'Furniture & Bedding', 'Rental services'].map((item) => (
                <li key={item}><Link to="#" className="text-dark text-decoration-none fw-bold" style={{ fontSize: '11px' }}>{item}</Link></li>
              ))}
            </ul>
          </div>

          {/* 3. Customer Support */}
          <div className="col-lg-2 col-md-6 col-sm-12">
            <h6 className="fw-bold mb-4">Customer support</h6>
            <ul className="list-unstyled d-flex flex-column gap-1">
              {['Help & contact us', 'Delivery information', 'Track your order', 'Returns & exchange', 'Promotion Terms & conditions', 'Terms & conditions'].map((item) => (
                <li key={item}><Link to="#" className="text-dark text-decoration-none fw-bold" style={{ fontSize: '11px' }}>{item}</Link></li>
              ))}
            </ul>
          </div>

          {/* 4. Useful Links */}
          <div className="col-lg-2 col-md-6 col-sm-12">
            <h6 className="fw-bold mb-4">Useful Links</h6>
            <ul className="list-unstyled d-flex flex-column gap-1">
              {['Store finder', 'Sitemap', 'Fees and payments policy'].map((item) => (
                <li key={item}><Link to="#" className="text-dark text-decoration-none fw-bold" style={{ fontSize: '11px' }}>{item}</Link></li>
              ))}
            </ul>
          </div>

          {/* 5. About & Social Media - Now Side by Side */}
          <div className="col-lg-2 col-md-6 col-sm-12">
            <h6 className="fw-bold mb-4">About BabyZone</h6>
            <ul className="list-unstyled d-flex flex-column gap-1">
              <li><Link to="#" className="text-dark text-decoration-none fw-bold" style={{ fontSize: '11px' }}>Privacy Policy</Link></li>
              <li><Link to="#" className="text-dark text-decoration-none fw-bold" style={{ fontSize: '11px' }}>Terms & conditions</Link></li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-6 col-sm-12">
            <h6 className="fw-bold mb-4">Social Media</h6>
            <div className="d-flex gap-1 flex-wrap">
              <SocialIcon bgColor="#000" iconClass="fab fa-facebook-f" link="https://www.facebook.com/" iconColor="#1877F2" />
              <SocialIcon bgColor="#000" iconClass="fab fa-instagram" link="https://www.instagram.com/accounts/login/?hl=en" />
              <SocialIcon bgColor="#000" iconClass="fab fa-twitter" link="https://x.com/" iconColor="#1DA1F2" />
              <SocialIcon bgColor="#000" iconClass="fab fa-youtube" link="https://www.youtube.com" iconColor="#FF0000" />
            </div>
          </div>
        </div>

      </div>
    </footer >
  );
};

const SocialIcon = ({ iconClass, link, iconColor }) => (
  <a href={link} target="_blank" rel="noopener noreferrer"
    className="d-flex align-items-center justify-content-center text-decoration-none"
    style={{
      width: '32px', // Slightly larger for better tap targets
      height: '32px',
      backgroundColor: '#000', 
      borderRadius: '6px',
    }}>
    {/* Corrected: Use className instead of class */}
    <i 
      className={iconClass} 
      style={{ 
        color: iconColor || '#fff', // White fallback if no color provided
        fontSize: '14px' 
      }}
    ></i>
  </a>
);

export default Footer;