// components/TestStatusUpdate.jsx
import React, { useState } from 'react';
import axios from '../api/axios';
import { toast } from 'react-toastify';

const TestStatusUpdate = ({ orderId, currentStatus, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(currentStatus);

  const statusOptions = [
    'pending', 'confirmed', 'processing', 'shipped', 
    'out_for_delivery', 'delivered', 'cancelled'
  ];

  const handleUpdateStatus = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`/orders/${orderId}/update_status/`, {
        status: status,
        notes: `Status updated to ${status} via test component`
      });
      
      console.log('Status update response:', response.data);
      toast.success(`Order status updated to ${status}`);
      
      // Call the onUpdate callback to refresh the page
      if (onUpdate) {
        onUpdate();
      }
      
    } catch (error) {
      console.error('Update failed:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: '1rem', 
      border: '1px solid #ccc', 
      borderRadius: '8px', 
      marginTop: '1rem',
      backgroundColor: '#f9f9f9'
    }}>
      <h4 style={{ marginBottom: '1rem' }}>⚠️ Test Status Update (Development Only)</h4>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <select 
          value={status} 
          onChange={(e) => setStatus(e.target.value)}
          style={{ 
            padding: '0.5rem', 
            borderRadius: '8px', 
            border: '1px solid #ccc',
            flex: 1
          }}
        >
          {statusOptions.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <button 
          onClick={handleUpdateStatus} 
          disabled={loading}
          style={{ 
            padding: '0.5rem 1.5rem', 
            backgroundColor: '#d63384', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Updating...' : 'Update Status'}
        </button>
      </div>
      <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.5rem' }}>
        Current Status: <strong>{currentStatus}</strong>
      </p>
    </div>
  );
};

export default TestStatusUpdate;