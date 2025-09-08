// Development authentication utilities
import { setupTestContext } from './setupTestContext';

// Create a valid JWT token for development
export const createDevToken = () => {
  // This is a mock token for development - in production, this would come from the backend
  const mockToken = 'dev-token-for-testing';
  return mockToken;
};

// Mock user data for development
export const getDevUserData = () => {
  // Get real restaurant data from localStorage
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
  
  return {
    id: 1,
    role: 'admin',
    name: 'Development Admin',
    email: 'admin@test.com',
    phone: '+1234567890',
    address: 'Test Address',
    restaurant_id: restaurantId ? parseInt(restaurantId) : 25,
    restaurant_slug: restaurantData?.slug || 'test-restaurant',
    restaurant_name: restaurantData?.name || 'Test Restaurant'
  };
};

// Bypass authentication for development
export const setupDevAuth = () => {
  console.log('🔧 Setting up development authentication...');
  
  // Check if there's already a real JWT token
  const existingToken = localStorage.getItem('adminToken');
  if (existingToken && existingToken !== 'dev-token-for-testing') {
    console.log('🔍 Real JWT token found, not overriding with development token');
    console.log('📊 Existing token:', existingToken.substring(0, 20) + '...');
    return;
  }
  
  // Set up restaurant context
  setupTestContext();
  
  // Set a development token only if no real token exists
  localStorage.setItem('adminToken', createDevToken());
  
  // Set user data in localStorage for persistence
  localStorage.setItem('devUserData', JSON.stringify(getDevUserData()));
  
  console.log('✅ Development authentication setup complete');
};

// Check if we're in development mode
export const isDevelopmentMode = () => {
  return process.env.NODE_ENV === 'development' || 
         window.location.hostname === 'localhost' ||
         window.location.hostname === '127.0.0.1';
};

// Clear development token when real login happens
export const clearDevToken = () => {
  const token = localStorage.getItem('adminToken');
  if (token === 'dev-token-for-testing') {
    console.log('🧹 Clearing development token');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('devUserData');
  }
};
