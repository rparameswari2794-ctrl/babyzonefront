// pages/NotFoundPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="container py-5 text-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-sm border-0 rounded-4 p-5">
            <h1 className="display-1 fw-bold text-muted">404</h1>
            <h3 className="mb-3">Page Not Found</h3>
            <p className="text-muted mb-4">
              The page you are looking for doesn't exist or has been moved.
            </p>
            <Link to="/" className="btn btn-pink px-4 py-2 rounded-pill">
              Go Back Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;