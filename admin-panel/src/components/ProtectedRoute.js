import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useRestaurant } from '../contexts/RestaurantContext';

// SECURITY: Protected Route Component with Restaurant Isolation
const ProtectedRoute = ({ children, requiredRole = 'admin' }) => {
  const { isAuthenticated, user } = useAuth();

  console.log('🔍 ProtectedRoute Debug:', {
    isAuthenticated,
    user: user ? { id: user.id, role: user.role, restaurant_slug: user.restaurant_slug } : null,
    requiredRole
  });

  if (!isAuthenticated) {
    console.log('🔍 ProtectedRoute: Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (!user || user.role !== requiredRole) {
    console.log('🔍 ProtectedRoute: Invalid user or role, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('🔍 ProtectedRoute: Access granted, rendering children');
  // Restaurant context loading is now handled by RestaurantLoader
  return children;
};

export default ProtectedRoute;
