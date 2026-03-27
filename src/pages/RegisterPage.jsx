import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../api/axios';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaUserPlus } from 'react-icons/fa';

const RegisterPage = () => {
  // --- KEEPING YOUR ORIGINAL STATE ---
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // --- KEEPING YOUR ORIGINAL HANDLERS ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const { confirmPassword, ...registerData } = formData;
      const response = await axios.post('/auth/register/', registerData);
      if (response.data) {
        toast.success('Registration successful!');
        navigate('/login');
      }
    } catch (error) {
      toast.error('Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    /* WRAPPER: vh-100 and overflow-hidden prevents the page from scrolling */
    <div className="vh-100 d-flex flex-column overflow-hidden" style={{ backgroundColor: '#f8f9fa' }}>
      
      {/* CARD CONTAINER: flex-grow-1 centers the card vertically */}
      <div className="flex-grow-1 d-flex align-items-center justify-content-center p-3">
        <div className="card shadow-sm border-0" style={{ width: '100%', maxWidth: '450px', borderRadius: '8px',color:'#fcfbfbff',backgroundColor:'#FFB2E6', }}>
          <div className="card-body pb-4">
            
            <h2 className="text-center mb-4 fw-normal" style={{ fontSize: '1.5rem', color: '#333' }}>Register</h2>

            <form onSubmit={handleSubmit}>
              {/* Username */}
              <div className="mb-3">
                <input
                  name="username"
                  type="text"
                  className={`form-control py-2 ${errors.username ? 'is-invalid' : ''}`}
                  placeholder="Username *"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Email */}
              <div className="mb-3">
                <input
                  name="email"
                  type="email"
                  className={`form-control py-2 ${errors.email ? 'is-invalid' : ''}`}
                  placeholder="Email *"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Names: Using row to keep them side-by-side (Saves Vertical Space) */}
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <input
                    name="first_name"
                    type="text"
                    className={`form-control py-2 ${errors.first_name ? 'is-invalid' : ''}`}
                    placeholder="First Name *"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-6">
                  <input
                    name="last_name"
                    type="text"
                    className={`form-control py-2 ${errors.last_name ? 'is-invalid' : ''}`}
                    placeholder="Last Name *"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="mb-3">
                <input
                  name="password"
                  type="password"
                  className={`form-control py-2 ${errors.password ? 'is-invalid' : ''}`}
                  placeholder="Password *"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Confirm Password */}
              <div className="mb-4">
                <input
                  name="confirmPassword"
                  type="password"
                  className={`form-control py-2 ${errors.confirmPassword ? 'is-invalid' : ''}`}
                  placeholder="Confirm Password *"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Submit Button: Blue style from your image */}
              <button
                type="submit"
                className="btn btn-primary w-100 py-2 fw-bold"
                disabled={loading}
                style={{ backgroundColor: '#1976d2', border: 'none', borderRadius: '4px' }}
              >
                {loading ? 'REGISTERING...' : 'REGISTER'}
              </button>
            </form>

            <div className="text-center mt-3">
              <Link to="/login" className="text-decoration-none small" style={{ color: '#1976d2' }}>
                Already have an account? Login
              </Link>
            </div>

          </div>
        </div>
      </div>

      
    </div>
  );
};

export default RegisterPage;