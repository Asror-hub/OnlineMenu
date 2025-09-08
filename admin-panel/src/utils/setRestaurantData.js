// Utility to set restaurant data in localStorage for testing
export const setRestaurantData = (restaurantId, restaurantName, restaurantSlug) => {
  console.log('🔧 Setting restaurant data:', { restaurantId, restaurantName, restaurantSlug });
  
  // Set restaurant ID
  localStorage.setItem('restaurantId', restaurantId.toString());
  
  // Set current restaurant object
  const restaurantData = {
    id: parseInt(restaurantId),
    name: restaurantName,
    slug: restaurantSlug
  };
  localStorage.setItem('currentRestaurant', JSON.stringify(restaurantData));
  
  console.log('✅ Restaurant data set successfully');
  console.log('📊 Current restaurant data:', restaurantData);
};

// Example usage:
// setRestaurantData(16, "Asror's Restaurant", "admin3");
// setRestaurantData(25, "Test Restaurant", "test-restaurant");

