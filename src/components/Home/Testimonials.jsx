import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import { FaStar, FaThumbsUp, FaThumbsDown } from 'react-icons/fa';

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true);
        const response = await axios.get('home/testimonials/');
        let data = Array.isArray(response.data) ? response.data : response.data.results || [];
        setTestimonials(data.slice(0, 4)); // Limit to 4 as per your design
      } catch (error) {
        console.error('Error fetching testimonials:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  if (loading) return <div className="text-center py-5 border-0"><div className="spinner-border text-pink" role="status"></div></div>;

  return (
    <section className="py-5 bg-white">
      <div className="container">
        <h5 className="text-center fw-bold mb-5">Our happy customer</h5>

        <div className="row g-4 justify-content-center">
          {testimonials.map((testimonial, index) => (
            <div key={testimonial.id || index} className="col-12 col-md-6 col-lg-3">
              <div className="testimonial-card">
                {/* Avatar: use testimonial.photo if available, else fallback to UI avatar */}
                <div className="avatar-wrapper">
                  <img
                    src={testimonial.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.user_name || testimonial.name)}&background=random`}
                    alt={testimonial.user_name || testimonial.name}
                    className="avatar-img"
                  />
                </div>

                <div className="card-body-custom pt-5 text-center">
                  <h5 className="fw-bold mb-1">{testimonial.user_name || testimonial.name}</h5>

                  {/* Dynamic star rating based on testimonial.rating */}
                  <div className="text-warning mb-2 small">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        color={i < (testimonial.rating || 5) ? "#ffc107" : "#060606ff"}
                      />
                    ))}
                  </div>

                  <p className="testimonial-text  mb-1">
                    {testimonial.comment || testimonial.message}
                  </p>

                  {/* Interaction counts from API */}
                  <div className="d-flex justify-content-end gap-3">
                    <span className="small text-muted">
                      <FaThumbsDown className="me-1" /> {testimonial.dislike_count || 0}
                    </span>
                    <span className="small text-muted">
                      <FaThumbsUp className="me-1" /> {testimonial.like_count || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View More Button */}
        <div className="view-btn mt-5 text-center">
          <button className="btn btn-warning fw-bold px-4 py-2" style={{ backgroundColor: '#FFD700', border: 'none', borderRadius: '10px' }}>
            View More
          </button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;