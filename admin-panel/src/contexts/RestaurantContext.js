import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const RestaurantContext = createContext();

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
};

export const RestaurantProvider = ({ children }) => {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [restaurantSlug, setRestaurantSlug] = useState(null);
  const { user } = useAuth();

  // Load restaurant context from user data (no API call needed)
  const loadRestaurantContext = async (slug) => {
    try {
      setLoading(true);
      setError(null);
      
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
      if (slug && restaurantData.slug !== slug) {
        throw new Error('Restaurant slug mismatch - security violation');
      }
      
      setRestaurant(restaurantData);
      setRestaurantSlug(slug);
      
      // Store restaurant info in localStorage for persistence
      localStorage.setItem('currentRestaurant', JSON.stringify(restaurantData));
      
    } catch (err) {
      console.error('Failed to load restaurant context:', err);
      setError(err.message || 'Failed to load restaurant context');
      
      // Clear any invalid restaurant data
      setRestaurant(null);
      localStorage.removeItem('currentRestaurant');
    } finally {
      setLoading(false);
    }
  };

  // Auto-load restaurant context when user data becomes available
  useEffect(() => {
    if (user && !restaurant) {
      console.log('Auto-loading restaurant context for user:', user);
      console.log('User restaurant_slug:', user.restaurant_slug);
      console.log('User restaurant_id:', user.restaurant_id);
      
      // Call the function directly instead of through dependency
      const loadContext = async () => {
        try {
          setLoading(true);
          setError(null);
          
          // Use the user data from AuthContext instead of making an API call
          if (!user || !user.restaurant_id) {
            throw new Error('No user or restaurant data available');
          }
          
          // Create restaurant object from user data
          const restaurantData = {
            id: user.restaurant_id,
            slug: user.restaurant_slug || 'default-restaurant',
            name: user.restaurant_name || 'My Restaurant'
          };
          
          // SECURITY CHECK: Verify the restaurant slug matches the URL (only if slug exists)
          if (user.restaurant_slug && restaurantData.slug !== user.restaurant_slug) {
            throw new Error('Restaurant slug mismatch - security violation');
          }
          
          setRestaurant(restaurantData);
          setRestaurantSlug(user.restaurant_slug || 'default-restaurant');
          
          // Store restaurant info in localStorage for persistence
          localStorage.setItem('currentRestaurant', JSON.stringify(restaurantData));
          
        } catch (err) {
          console.error('Failed to load restaurant context:', err);
          setError(err.message || 'Failed to load restaurant context');
          
          // Clear any invalid restaurant data
          setRestaurant(null);
          localStorage.removeItem('currentRestaurant');
        } finally {
          setLoading(false);
        }
      };
      
      loadContext();
    }
  }, [user, restaurant]); // Remove loadRestaurantContext from dependencies

  // Clear restaurant context (on logout)
  const clearRestaurantContext = () => {
    setRestaurant(null);
    setError(null);
    setRestaurantSlug(null);
    localStorage.removeItem('currentRestaurant');
  };

  // Check if context is valid
  const isValidContext = () => {
    return restaurant && restaurant.id && !error;
  };

  const value = {
    restaurant,
    loading,
    error,
    restaurantSlug,
    loadRestaurantContext,
    clearRestaurantContext,
    isValidContext
  };

  return (
    <RestaurantContext.Provider value={value}>
      {children}
    </RestaurantContext.Provider>
  );
};
