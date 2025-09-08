// API Configuration for Client App
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  TIMEOUT: 10000,
};

export const ENDPOINTS = {
  // Public endpoints (no authentication required)
  MENU: {
    BASE: '/api/menu',
    CATEGORIES: '/api/menu/categories',
  },
  SETTINGS: {
    BASE: '/api/settings',
  },
  ORDERS: {
    BASE: '/api/orders',
    GUEST: '/api/orders/guest',
    ACTIVE: '/api/orders/public/active',
    RECENTLY_FINISHED: '/api/orders/public/recently-finished',
    SESSION: (sessionId: string) => `/api/orders/session/${sessionId}`,
  },
  RESTAURANT: {
    INFO: '/api/restaurants/public/info',
    SETTINGS: '/api/restaurants/public/settings',
  },
};

// Restaurant context detection
export const getRestaurantContext = () => {
  const hostname = window.location.hostname;
  
  // Extract subdomain from hostname
  const parts = hostname.split('.');
  let restaurantSlug = null;
  
  // Handle different domain patterns:
  // - localhost:3000 (development)
  // - restaurant-slug.localhost:3000 (development with subdomain)
  // - restaurant-slug.yourapp.com (production)
  if (parts.length > 1) {
    if (hostname.includes('localhost')) {
      // Development: restaurant-slug.localhost:3000
      restaurantSlug = parts[0];
    } else {
      // Production: restaurant-slug.yourapp.com
      restaurantSlug = parts[0];
    }
  }
  
  // Skip common subdomains
  if (restaurantSlug && ['www', 'api', 'admin', 'app'].includes(restaurantSlug)) {
    restaurantSlug = null;
  }
  
  return {
    restaurantSlug,
    isSubdomain: !!restaurantSlug,
    hostname,
  };
};

// Generate session ID for guest orders
export const generateSessionId = () => {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

// Get or create session ID
export const getSessionId = () => {
  let sessionId = localStorage.getItem('restaurant_session_id');
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem('restaurant_session_id', sessionId);
  }
  return sessionId;
};
