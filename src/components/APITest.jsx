// src/components/APITest.jsx
import React, { useEffect, useState } from 'react';
import instance from '../api/axios';

const APITest = () => {
  const [status, setStatus] = useState('Testing connection...');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const testAPI = async () => {
      try {
        // Test public endpoint
        const response = await instance.get('/');
        setStatus('✅ Connected successfully!');
        setData(response.data);
        console.log('API Response:', response.data);
      } catch (err) {
        setStatus('❌ Connection failed');
        setError(err.userMessage || err.message);
        console.error('API Error:', err);
      }
    };
    
    testAPI();
  }, []);

  return (
    <div style={{ 
      padding: '20px', 
      margin: '20px', 
      border: '1px solid #ddd', 
      borderRadius: '8px',
      backgroundColor: '#f9f9f9'
    }}>
      <h3>🔌 API Connection Test</h3>
      <p><strong>Frontend:</strong> http://localhost:5173</p>
      <p><strong>Backend (via proxy):</strong> http://localhost:8000</p>
      <p><strong>Status:</strong> {status}</p>
      {error && (
        <div style={{ color: 'red', marginTop: '10px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      {data && (
        <details style={{ marginTop: '10px' }}>
          <summary>Response Data</summary>
          <pre style={{ 
            backgroundColor: '#f0f0f0', 
            padding: '10px', 
            borderRadius: '4px',
            overflow: 'auto'
          }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
};

export default APITest;