// pages/ProfilePage.jsx - Updated to use updateProfile action
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../api/axios';
import { updateProfile } from '@/store/slices/authSlice'; // Import updateProfile action

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    pincode: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        pincode: user.pincode || ''
      });
    }
  }, [user, isAuthenticated, navigate]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // 1. Update backend
      const response = await axios.put('/profile/update/', formData);
      console.log('Profile update response:', response.data);
      
      // 2. Update Redux store and localStorage using the updateProfile action
      dispatch(updateProfile({
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        pincode: formData.pincode
      }));
      
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      
    } catch (error) {
      console.error('Update error:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'Failed to update profile. ';
      if (error.response?.data?.error) {
        errorMessage += error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else if (error.response?.data?.non_field_errors) {
        errorMessage += error.response.data.non_field_errors.join(', ');
      } else {
        errorMessage += 'Please try again.';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div style={{ padding: '2rem 0', backgroundColor: '#ffffff', minHeight: 'calc(100vh - 200px)' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1rem' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>My Profile</h1>
          <p style={{ color: '#6c757d' }}>Manage your account information</p>
        </div>

        {/* Profile Card */}
        <div style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '20px', 
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          overflow: 'hidden'
        }}>
          {/* Profile Header */}
          <div style={{ 
            padding: '2rem', 
            textAlign: 'center', 
            borderBottom: '1px solid #f0f0f0', 
            backgroundColor: '#f8f9fa'
          }}>
            <div style={{ 
              width: '100px', 
              height: '100px', 
              backgroundColor: '#d63384', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 1rem'
            }}>
              <i className="fas fa-user" style={{ fontSize: '3rem', color: 'white' }}></i>
            </div>
            <h3 style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
              {formData.first_name || formData.last_name ? 
                `${formData.first_name} ${formData.last_name}`.trim() : 
                user?.email?.split('@')[0]}
            </h3>
            <p style={{ color: '#6c757d' }}>{user?.email}</p>
          </div>
          
          {/* Profile Content */}
          <div style={{ padding: '2rem' }}>
            {!isEditing ? (
              // View Mode
              <>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(2, 1fr)', 
                  gap: '1.5rem',
                  marginBottom: '2rem'
                }}>
                  <div>
                    <p style={{ color: '#6c757d', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                      <i className="fas fa-user" style={{ marginRight: '0.5rem', color: '#d63384' }}></i>
                      First Name
                    </p>
                    <p style={{ fontWeight: '500', fontSize: '1rem', marginBottom: 0 }}>
                      {formData.first_name || 'Not set'}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: '#6c757d', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                      <i className="fas fa-user" style={{ marginRight: '0.5rem', color: '#d63384' }}></i>
                      Last Name
                    </p>
                    <p style={{ fontWeight: '500', fontSize: '1rem', marginBottom: 0 }}>
                      {formData.last_name || 'Not set'}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: '#6c757d', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                      <i className="fas fa-envelope" style={{ marginRight: '0.5rem', color: '#d63384' }}></i>
                      Email
                    </p>
                    <p style={{ fontWeight: '500', fontSize: '1rem', marginBottom: 0 }}>
                      {formData.email}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: '#6c757d', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                      <i className="fas fa-phone" style={{ marginRight: '0.5rem', color: '#d63384' }}></i>
                      Phone Number
                    </p>
                    <p style={{ fontWeight: '500', fontSize: '1rem', marginBottom: 0 }}>
                      {formData.phone || 'Not set'}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: '#6c757d', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                      <i className="fas fa-map-marker-alt" style={{ marginRight: '0.5rem', color: '#d63384' }}></i>
                      Address
                    </p>
                    <p style={{ fontWeight: '500', fontSize: '1rem', marginBottom: 0 }}>
                      {formData.address || 'Not set'}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: '#6c757d', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                      <i className="fas fa-city" style={{ marginRight: '0.5rem', color: '#d63384' }}></i>
                      City
                    </p>
                    <p style={{ fontWeight: '500', fontSize: '1rem', marginBottom: 0 }}>
                      {formData.city || 'Not set'}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: '#6c757d', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                      <i className="fas fa-mail-bulk" style={{ marginRight: '0.5rem', color: '#d63384' }}></i>
                      Pincode
                    </p>
                    <p style={{ fontWeight: '500', fontSize: '1rem', marginBottom: 0 }}>
                      {formData.pincode || 'Not set'}
                    </p>
                  </div>
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <button
                    onClick={() => setIsEditing(true)}
                    style={{
                      padding: '0.75rem 2rem',
                      fontSize: '1rem',
                      borderRadius: '50px',
                      border: 'none',
                      backgroundColor: '#d63384',
                      color: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      fontWeight: '500'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#c2256e';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#d63384';
                    }}
                  >
                    <i className="fas fa-edit" style={{ marginRight: '0.5rem' }}></i>
                    Edit Profile
                  </button>
                </div>
              </>
            ) : (
              // Edit Mode
              <form onSubmit={handleUpdateProfile}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      <i className="fas fa-user" style={{ marginRight: '0.5rem', color: '#d63384' }}></i>
                      First Name
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '12px',
                        border: '1px solid #dee2e6',
                        fontSize: '1rem',
                        transition: 'border-color 0.3s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#d63384'}
                      onBlur={(e) => e.target.style.borderColor = '#dee2e6'}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      <i className="fas fa-user" style={{ marginRight: '0.5rem', color: '#d63384' }}></i>
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '12px',
                        border: '1px solid #dee2e6',
                        fontSize: '1rem',
                        transition: 'border-color 0.3s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#d63384'}
                      onBlur={(e) => e.target.style.borderColor = '#dee2e6'}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      <i className="fas fa-envelope" style={{ marginRight: '0.5rem', color: '#d63384' }}></i>
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '12px',
                        border: '1px solid #dee2e6',
                        fontSize: '1rem',
                        backgroundColor: '#f8f9fa'
                      }}
                      disabled
                    />
                    <small style={{ color: '#6c757d', fontSize: '0.75rem' }}>Email cannot be changed</small>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      <i className="fas fa-phone" style={{ marginRight: '0.5rem', color: '#d63384' }}></i>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '12px',
                        border: '1px solid #dee2e6',
                        fontSize: '1rem',
                        transition: 'border-color 0.3s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#d63384'}
                      onBlur={(e) => e.target.style.borderColor = '#dee2e6'}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      <i className="fas fa-map-marker-alt" style={{ marginRight: '0.5rem', color: '#d63384' }}></i>
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Enter your street address"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '12px',
                        border: '1px solid #dee2e6',
                        fontSize: '1rem',
                        transition: 'border-color 0.3s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#d63384'}
                      onBlur={(e) => e.target.style.borderColor = '#dee2e6'}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      <i className="fas fa-city" style={{ marginRight: '0.5rem', color: '#d63384' }}></i>
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Enter your city"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '12px',
                        border: '1px solid #dee2e6',
                        fontSize: '1rem',
                        transition: 'border-color 0.3s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#d63384'}
                      onBlur={(e) => e.target.style.borderColor = '#dee2e6'}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      <i className="fas fa-mail-bulk" style={{ marginRight: '0.5rem', color: '#d63384' }}></i>
                      Pincode
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      placeholder="Enter 6-digit pincode"
                      maxLength="6"
                      pattern="\d{6}"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '12px',
                        border: '1px solid #dee2e6',
                        fontSize: '1rem',
                        transition: 'border-color 0.3s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#d63384'}
                      onBlur={(e) => e.target.style.borderColor = '#dee2e6'}
                    />
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        first_name: user?.first_name || '',
                        last_name: user?.last_name || '',
                        email: user?.email || '',
                        phone: user?.phone || '',
                        address: user?.address || '',
                        city: user?.city || '',
                        pincode: user?.pincode || ''
                      });
                    }}
                    style={{
                      padding: '0.75rem 2rem',
                      borderRadius: '50px',
                      border: '1px solid #6c757d',
                      backgroundColor: 'transparent',
                      color: '#6c757d',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      fontWeight: '500'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#6c757d';
                      e.target.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.color = '#6c757d';
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      padding: '0.75rem 2rem',
                      borderRadius: '50px',
                      border: 'none',
                      backgroundColor: '#d63384',
                      color: 'white',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.7 : 1,
                      transition: 'all 0.3s',
                      fontWeight: '500'
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) e.target.style.backgroundColor = '#c2256e';
                    }}
                    onMouseLeave={(e) => {
                      if (!loading) e.target.style.backgroundColor = '#d63384';
                    }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm" style={{ marginRight: '0.5rem' }}></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save" style={{ marginRight: '0.5rem' }}></i>
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;