// src/components/APIDebug.jsx
import React, { useState } from 'react';
import axios from '@/api/axios';

const APIDebug = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testEndpoint = async (name, method, url, data = null) => {
    setLoading(true);
    try {
      let response;
      if (method === 'GET') response = await axios.get(url);
      if (method === 'POST') response = await axios.post(url, data);
      if (method === 'DELETE') response = await axios.delete(url);
      
      setResults(prev => ({
        ...prev,
        [name]: { status: response.status, data: response.data, success: true }
      }));
      console.log(`${name}:`, response.data);
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [name]: { status: error.response?.status, error: error.message, success: false }
      }));
      console.error(`${name} failed:`, error.response?.status, error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4 p-4" style={{ border: '1px solid #ddd', borderRadius: '8px' }}>
      <h3>🔧 API Debug Tool</h3>
      <p>Test your API endpoints here:</p>
      
      <div className="d-flex gap-2 flex-wrap mb-3">
        <button 
          className="btn btn-primary btn-sm"
          onClick={() => testEndpoint('GET /wishlist/', 'GET', '/wishlist/')}
          disabled={loading}
        >
          Test GET /wishlist/
        </button>
        
        <button 
          className="btn btn-success btn-sm"
          onClick={() => testEndpoint('POST /wishlist/add/1/', 'POST', '/wishlist/add/1/')}
          disabled={loading}
        >
          Test POST /wishlist/add/1/
        </button>
        
        <button 
          className="btn btn-danger btn-sm"
          onClick={() => testEndpoint('DELETE /wishlist/remove/1/', 'DELETE', '/wishlist/remove/1/')}
          disabled={loading}
        >
          Test DELETE /wishlist/remove/1/
        </button>
        
        <button 
          className="btn btn-info btn-sm"
          onClick={() => testEndpoint('GET /products/1/', 'GET', '/products/1/')}
          disabled={loading}
        >
          Test GET /products/1/
        </button>
        
        <button 
          className="btn btn-warning btn-sm"
          onClick={() => testEndpoint('GET /api/wishlist/', 'GET', '/api/wishlist/')}
          disabled={loading}
        >
          Test GET /api/wishlist/
        </button>
      </div>
      
      {loading && <div className="spinner-border spinner-border-sm text-primary" />}
      
      {Object.keys(results).length > 0 && (
        <div className="mt-3">
          <h5>Results:</h5>
          {Object.entries(results).map(([name, result]) => (
            <div key={name} className="mb-2 p-2" style={{ 
              backgroundColor: result.success ? '#d4edda' : '#f8d7da',
              borderRadius: '4px'
            }}>
              <strong>{name}:</strong> {result.success ? '✅' : '❌'} 
              {result.status && ` Status: ${result.status}`}
              {result.error && ` Error: ${result.error}`}
              {result.data && (
                <details>
                  <summary>Response Data</summary>
                  <pre style={{ fontSize: '12px', maxHeight: '200px', overflow: 'auto' }}>
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default APIDebug;