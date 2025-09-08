// Debug utilities for restaurant context
// This file provides debugging helpers for restaurant data management

export const debugRestaurantContext = (context) => {
  console.log('🏪 Restaurant Context Debug:', {
    restaurant: context.restaurant,
    isLoading: context.isLoading,
    error: context.error,
    timestamp: new Date().toISOString()
  });
};

export const setTestRestaurantContext = (context, testData) => {
  console.log('🧪 Setting test restaurant context:', testData);
  
  if (context.setRestaurant) {
    context.setRestaurant(testData);
  }
  
  if (context.setLoading) {
    context.setLoading(false);
  }
  
  if (context.setError) {
    context.setError(null);
  }
};

export const logRestaurantState = (state) => {
  console.group('🏪 Restaurant State');
  console.log('Current restaurant:', state.restaurant);
  console.log('Loading state:', state.isLoading);
  console.log('Error state:', state.error);
  console.log('Last updated:', new Date().toISOString());
  console.groupEnd();
};

export const validateRestaurantData = (restaurant) => {
  const required = ['id', 'name', 'slug'];
  const missing = required.filter(field => !restaurant[field]);
  
  if (missing.length > 0) {
    console.warn('⚠️ Missing required restaurant fields:', missing);
    return false;
  }
  
  console.log('✅ Restaurant data is valid');
  return true;
};

export default {
  debugRestaurantContext,
  setTestRestaurantContext,
  logRestaurantState,
  validateRestaurantData
};
