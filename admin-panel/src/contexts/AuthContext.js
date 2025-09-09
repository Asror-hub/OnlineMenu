import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { setupDevAuth, getDevUserData, isDevelopmentMode, clearDevToken } from '../utils/devAuth';

// No need to import useRestaurant here - it will be handled by the component using AuthContext

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [restaurantId, setRestaurantId] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Check if localStorage is available
  const isLocalStorageAvailable = (() => {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  })();

  useEffect(() => {
    // Check if user is already logged in (e.g., from localStorage)
    if (!isLocalStorageAvailable) {
      console.warn('localStorage not available, skipping token validation');
      setLoading(false);
      return;
    }
    
    try {
      const token = localStorage.getItem('adminToken');
      
      if (token) {
        // Check if it's a real JWT token (not development token)
        if (token !== 'dev-token-for-testing') {
          console.log('🔍 Found real JWT token, validating with backend...');
          // Validate real token with backend
          validateToken(token);
        } else if (isDevelopmentMode()) {
          console.log('🔧 Development mode: Using development token');
          
          // Get real restaurant data from localStorage instead of mock data
          const restaurantId = localStorage.getItem('restaurantId');
          const currentRestaurant = localStorage.getItem('currentRestaurant');
          
          let restaurantData = null;
          if (currentRestaurant) {
            try {
              restaurantData = JSON.parse(currentRestaurant);
            } catch (e) {
              console.error('Error parsing restaurant data:', e);
            }
          }
          
          // Create user data with real restaurant information
          const devUserData = {
            id: 1,
            email: 'admin@example.com',
            name: 'Admin User',
            role: 'admin',
            restaurant_id: restaurantId ? parseInt(restaurantId) : 25,
            restaurant_slug: restaurantData?.slug || 'test-restaurant',
            restaurant_name: restaurantData?.name || 'Test Restaurant'
          };
          
          console.log('🔧 Using development token with real restaurant data:', {
            restaurant_id: devUserData.restaurant_id,
            restaurant_name: devUserData.restaurant_name,
            restaurant_slug: devUserData.restaurant_slug
          });
          
          setIsAuthenticated(true);
          setUser(devUserData);
          setRestaurantId(devUserData.restaurant_id);
          setLoading(false);
        } else {
          console.log('❌ Development token found but not in development mode');
          setLoading(false);
        }
      } else {
        console.log('❌ No token found');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      setLoading(false);
    }
  }, [isLocalStorageAvailable]); // eslint-disable-line react-hooks/exhaustive-deps

  const validateToken = async (token) => {
    try {
      console.log('Validating token...');
      const result = await api.validateToken();
      console.log('Token validation result:', result);
      
      if (result && result.user) {
        setIsAuthenticated(true);
        setUser({
          id: result.user.id,
          role: result.user.role,
          name: result.user.name,
          email: result.user.email,
          phone: result.user.phone || '',
          address: result.user.address || '',
          restaurant_id: result.user.restaurant_id,
          restaurant_slug: result.user.restaurant_slug,
          restaurant_name: result.user.restaurant_name
        });
        setRestaurantId(result.user.restaurant_id);
        console.log('Token validation successful, user authenticated');
        
        // Sync localStorage with JWT token data
        if (isLocalStorageAvailable) {
          try {
            localStorage.setItem('restaurantId', result.user.restaurant_id.toString());
            localStorage.setItem('currentRestaurant', JSON.stringify({
              id: result.user.restaurant_id,
              slug: result.user.restaurant_slug,
              name: result.user.restaurant_name
            }));
            console.log('🔄 Synced localStorage with JWT token data:', {
              restaurantId: result.user.restaurant_id,
              restaurantName: result.user.restaurant_name
            });
          } catch (storageError) {
            console.error('Error syncing localStorage:', storageError);
          }
        }
        
        // No need to redirect on token validation - just set the state
        console.log('Token validation successful, user authenticated');
      } else {
        console.error('Invalid token validation result:', result);
        logout();
      }
    } catch (error) {
      console.error('Token validation failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      // Clear any development token before real login
      clearDevToken();
      
      const result = await api.login(credentials);
      console.log('AuthContext: Login API result:', result);
      
      // Store token and user data
      if (isLocalStorageAvailable) {
        try {
          localStorage.setItem('adminToken', result.token);
          console.log('AuthContext: Token stored in localStorage');
        } catch (storageError) {
          console.error('Error storing token in localStorage:', storageError);
        }
      } else {
        console.warn('localStorage not available, token not stored');
      }
      
      console.log('AuthContext: Setting isAuthenticated to true');
      setIsAuthenticated(true);
      
      const userData = {
        id: result.user.id,
        role: result.user.role,
        name: result.user.name,
        email: result.user.email,
        phone: result.user.phone || '',
        address: result.user.address || '',
        restaurant_id: result.user.restaurant_id,
        restaurant_slug: result.user.restaurant_slug,
        restaurant_name: result.user.restaurant_name
      };
      
      console.log('AuthContext: Setting user data:', userData);
      setUser(userData);
      setRestaurantId(result.user.restaurant_id);
      
      // Auto-redirect after successful login
      console.log('AuthContext: Login result user data:', result.user);
      console.log('AuthContext: restaurant_slug value:', result.user.restaurant_slug);
      console.log('AuthContext: restaurant_slug type:', typeof result.user.restaurant_slug);
      
      if (result.user.restaurant_slug && result.user.restaurant_slug !== 'null' && result.user.restaurant_slug !== 'undefined') {
        console.log('AuthContext: Auto-redirecting to admin panel');
        const redirectUrl = `/${result.user.restaurant_slug}/admin`;
        console.log('AuthContext: Redirect URL:', redirectUrl);
        
        // Use window.location.href for more reliable redirect
        window.location.href = redirectUrl;
      } else {
        console.warn('AuthContext: No valid restaurant_slug found, redirecting to default admin');
        console.log('AuthContext: restaurant_slug was:', result.user.restaurant_slug);
        // Fallback to a default admin route or show an error
        window.location.href = '/admin';
      }
      
      return { success: true, user: result.user };
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      console.log('AuthContext: Starting registration...');
      const result = await api.register(userData);
      console.log('AuthContext: Registration API result:', result);
      
      // Store token and user data
      localStorage.setItem('adminToken', result.token);
      console.log('AuthContext: Token stored in localStorage');
      
      setIsAuthenticated(true);
      console.log('AuthContext: isAuthenticated set to true');
      
      const userDataToSet = {
        id: result.user.id,
        role: result.user.role,
        name: result.user.name,
        email: result.user.email,
        phone: result.user.phone || '',
        address: result.user.address || '',
        restaurant_id: result.user.restaurant_id,
        restaurant_slug: result.user.restaurant_slug,
        restaurant_name: result.user.restaurant_name
      };
      
      console.log('AuthContext: Setting user data:', userDataToSet);
      setUser(userDataToSet);
      setRestaurantId(result.user.restaurant_id);
      console.log('AuthContext: User state updated');
      
      return { success: true, user: userDataToSet };
    } catch (error) {
      console.error('AuthContext: Registration error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    if (isLocalStorageAvailable) {
      try {
        localStorage.removeItem('adminToken');
      } catch (error) {
        console.error('Error removing token from localStorage:', error);
      }
    }
    setIsAuthenticated(false);
    setUser(null);
    setRestaurantId(null);
  };

  const value = {
    isAuthenticated,
    user,
    restaurantId,
    loading,
    login,
    register,
    logout
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
