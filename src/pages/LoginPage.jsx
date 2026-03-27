import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import axios from '../api/axios';
import { loginSuccess } from '@/store/slices/authSlice';
import { FaUser, FaLock } from 'react-icons/fa';

const LoginPage = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('/auth/login/', formData);
      const { access, refresh, user } = response.data;
      
      dispatch(loginSuccess({ access, refresh, user }));
      toast.success(`Welcome back, ${user.name || user.username}!`);
      
      // Always go to home page after login
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      const errorMsg = error.response?.data?.error || 'Login failed. Please check your credentials.';
      toast.error(errorMsg);
      setErrors({ ...errors, general: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column overflow-hidden" style={{ backgroundColor: '#FFB2E6' }}>
      <div className="flex-grow-1 d-flex align-items-center justify-content-center p-3">
        <div className="card shadow-sm border-0" style={{ width: '100%', maxWidth: '400px', borderRadius: '8px', backgroundColor: '#fff' }}>
          <div className="card-body p-5">
            <h2 className="text-center mb-5 fw-normal" style={{ fontSize: '1.5rem', color: '#333' }}>Login</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-3 position-relative">
                <span className="position-absolute" style={{ left: '12px', top: '10px', color: '#666' }}><FaUser size={14}/></span>
                <input
                  name="username"
                  type="text"
                  className="form-control py-2 ps-5"
                  placeholder="Username *"
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-4 position-relative">
                <span className="position-absolute" style={{ left: '12px', top: '10px', color: '#666' }}><FaLock size={14}/></span>
                <input
                  name="password"
                  type="password"
                  className="form-control py-2 ps-5"
                  placeholder="Password *"
                  onChange={handleChange}
                  required
                />
              </div>

              {errors.general && (
                <div className="alert alert-danger text-center py-2 small mb-3">{errors.general}</div>
              )}

              <button
                type="submit"
                className="btn btn-primary w-100 py-2 fw-bold shadow-sm"
                disabled={loading}
                style={{ backgroundColor: '#1976d2', border: 'none' }}
              >
                {loading ? 'LOGGING IN...' : 'LOGIN'}
              </button>
            </form>

            <div className="text-center mt-3">
              <p className="text-small" style={{ fontSize: '12px' }}>
                New to BabyZone?{' '}
                <Link to="/register" className="text-decoration-none small" style={{ color: '#1818f3ff', marginLeft: '10px' }}>
                  Create Account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;