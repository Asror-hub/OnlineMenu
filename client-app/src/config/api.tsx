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
  const pathname = window.location.pathname;
  
  console.log('🔍 Restaurant Context Detection:', { hostname, pathname });
  
  let restaurantSlug = null;
  let isSubdomain = false;
  let isPathBased = false;
  
  // Check for subdomain-based routing first
  const parts = hostname.split('.');
  if (parts.length > 1) {
    if (hostname.includes('localhost')) {
      // Development: restaurant-slug.localhost:3000
      restaurantSlug = parts[0];
      isSubdomain = true;
    } else {
      // Production: restaurant-slug.yourapp.com
      restaurantSlug = parts[0];
      isSubdomain = true;
    }
    
    // Skip common subdomains
    if (restaurantSlug && ['www', 'api', 'admin', 'app'].includes(restaurantSlug)) {
      restaurantSlug = null;
      isSubdomain = false;
    }
  }
  
  // If no subdomain found, check for path-based routing
  if (!restaurantSlug && pathname && pathname !== '/') {
    // Extract restaurant slug from path: /asror3 -> asror3
    const pathParts = pathname.split('/').filter(part => part.length > 0);
    if (pathParts.length > 0) {
      restaurantSlug = pathParts[0];
      isPathBased = true;
    }
  }
  
  const result = {
    restaurantSlug,
    isSubdomain,
    isPathBased,
    hasRestaurantContext: !!(restaurantSlug && (isSubdomain || isPathBased)),
    hostname,
    pathname,
  };
  
  console.log('✅ Restaurant Context Result:', result);
  
  return result;
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
