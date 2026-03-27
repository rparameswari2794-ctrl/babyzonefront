import { useState, useEffect } from "react";


const slides = [
  {
    id: 1,
    layout: "two-images-center-text",
    images: ["/images/home1.jpg", "/images/home2.jpg"],
    discount: "30%",
    title: "Baby beds & Accessories",
  },
  {
    id: 2,
    layout: "three-images-text-below",
    images: ["/images/home3.jpg", "/images/home4.jpg", "/images/home5.jpg"],
    discount: "Flat 30% Off",
    title: "New Launch",
    subtitle: "Strollers, car seats & much more",
  },
];

export default function CustomSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);

  const slide = slides[currentIndex];

  return (
    <div className="slideshow-wrapper">
      {/* ===== LAYOUT 1: Slanted Parallelogram ===== */}
      {currentIndex === 0 && (
        <div className="container-fluid p-0 position-relative">
          <div className="row g-0 align-items-center bg-pink banner-height">
            {/* Left Image */}
            <div className="col-lg-4 col-md-4 col-sm-4 p-0 left-slant">
              <img src={slide.images[0]} className="banner-img" alt="left" />
            </div>
            
            {/* Center Content */}
            <div className="col-lg-4 col-md-4 col-sm-4 skew-box" style={{ zIndex: 2 }}>
              <div className="black-badge-skew">
                <span>Flat</span> <span className="pink-text">{slide.discount}</span><span> Off</span>
              </div>
              <p className="banner-text mt-3">{slide.title}</p>
              <button className="shop-now-btn mt-2">Shop Now</button>
            </div>

            {/* Right Image */}
            <div className="col-lg-4 col-md-4 col-sm-4 p-0 right-slant">
              <img src={slide.images[1]} className="banner-img" alt="right" />
            </div>
          </div>
          <button className="nav-arrow prev" onClick={prevSlide}>❮</button>
        </div>
      )}

      {/* ===== LAYOUT 2: Product Row ===== */}
      {currentIndex === 1 && (
        <div className="container-fluid p-0 position-relative">
          <div className="row g-0 align-items-center bg-pink banner-height px-md-5">
            <div className="col-md-8 d-flex justify-content-center gap-4 py-4">
              {slide.images.map((img, i) => (
                <div key={i} className="product-card">
                  <img src={img} className="img-fluid rounded-4 shadow-sm" alt="product" />
                </div>
              ))}
            </div>
            <div className="col-md-4 text-center text-md-start px-4">
              <div className="black-badge-straight">{slide.discount}</div>
              <h3 className="fw-bold mt-4 mb-2" style={{ fontSize: '2rem' }}>{slide.title}</h3>
              <p className="text-dark mb-4">{slide.subtitle}</p>
              <button className="shop-now-btn">Shop Now</button>
            </div>
          </div>
          <button className="nav-arrow next" onClick={nextSlide}>❯</button>
        </div>
      )}
    </div>
  );
}