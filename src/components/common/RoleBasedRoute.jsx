// components/Common/RoleBasedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const RoleBasedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const userRole = user?.user_type || user?.role; // Adjust based on your user object structure

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(userRole)) {
    // Redirect to home page or unauthorized page
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RoleBasedRoute;