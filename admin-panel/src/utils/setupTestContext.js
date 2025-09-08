// Utility to set up test context for admin panel
export const setupTestContext = () => {
  console.log('🔧 Setting up test context for admin panel...');
  
  // Set restaurant context to match client app
  localStorage.setItem('restaurantId', '25');
  localStorage.setItem('currentRestaurant', JSON.stringify({
    id: 25,
    slug: 'test-restaurant',
    name: 'Test Restaurant'
  }));
  
  // Set a test admin token (this won't work for real auth, but helps with debugging)
  localStorage.setItem('adminToken', 'test-token');
  
  console.log('✅ Test context set:', {
    restaurantId: localStorage.getItem('restaurantId'),
    currentRestaurant: localStorage.getItem('currentRestaurant'),
    adminToken: localStorage.getItem('adminToken') ? 'Set' : 'Not set'
  });
};

// Force refresh the page to apply context
export const refreshWithContext = () => {
  setupTestContext();
  window.location.reload();
};
