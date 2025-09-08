import React, { useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useRestaurant } from '../contexts/RestaurantContext';
import { useAuth } from '../contexts/AuthContext';

// Component to automatically load restaurant context when accessing protected routes
const RestaurantLoader = ({ children }) => {
  const { restaurantSlug } = useParams();
  const { user } = useAuth();
  const { loadRestaurantContext, restaurant, loading, error } = useRestaurant();

  useEffect(() => {
    if (restaurantSlug && !restaurant) {
      console.log('Loading restaurant context for slug:', restaurantSlug);
      // Call the function directly to avoid dependency issues
      const loadContext = async () => {
        try {
          // Use the user data from AuthContext instead of making an API call
          if (!user || !user.restaurant_id) {
            throw new Error('No user or restaurant data available');
          }
          
          // Create restaurant object from user data
          const restaurantData = {
            id: user.restaurant_id,
            slug: user.restaurant_slug,
            name: user.restaurant_name
          };
          
          // SECURITY CHECK: Verify the restaurant slug matches the URL
          if (restaurantSlug && restaurantData.slug !== restaurantSlug) {
            throw new Error('Restaurant slug mismatch - security violation');
          }
          
          // Set restaurant data directly in the context
          // This will be handled by the RestaurantContext's auto-loading mechanism
        } catch (err) {
          console.error('Failed to load restaurant context:', err);
        }
      };
      
      loadContext();
    }
  }, [restaurantSlug, restaurant, user]); // Remove loadRestaurantContext dependency

  if (loading) {
    return <div>Loading restaurant...</div>;
  }

  if (error) {
    return <div>Error loading restaurant: {error}</div>;
  }

  if (!restaurant) {
    return <div>Restaurant not found</div>;
  }

  // SECURITY: Verify user belongs to this restaurant
  if (user && user.restaurant_id !== restaurant.id) {
    console.error('SECURITY VIOLATION: User trying to access different restaurant');
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default RestaurantLoader;
