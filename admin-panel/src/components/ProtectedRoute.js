import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useRestaurant } from '../contexts/RestaurantContext';

// SECURITY: Protected Route Component with Restaurant Isolation
const ProtectedRoute = ({ children, requiredRole = 'admin' }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user || user.role !== requiredRole) {
    return <Navigate to="/login" replace />;
  }

  // Restaurant context loading is now handled by RestaurantLoader
  return children;
};

export default ProtectedRoute;
