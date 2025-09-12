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
  const fullUrl = window.location.href;
  
  console.log('🔍 Restaurant Context Detection - DETAILED DEBUG:');
  console.log('  Full URL:', fullUrl);
  console.log('  Hostname:', hostname);
  console.log('  Pathname:', pathname);
  console.log('  Search:', window.location.search);
  console.log('  Hash:', window.location.hash);
  
  let restaurantSlug = null;
  let isSubdomain = false;
  let isPathBased = false;
  
  // Check for hash-based routing first (highest priority)
  console.log('🔍 Checking hash-based routing...');
  if (window.location.hash) {
    console.log('  Hash found, extracting slug...');
    // Extract restaurant slug from hash: #/asror3 -> asror3
    const hashParts = window.location.hash.split('/').filter(part => part.length > 0);
    console.log('  Hash parts:', hashParts);
    
    if (hashParts.length > 0) {
      restaurantSlug = hashParts[0];
      isPathBased = true;
      console.log('  ✅ Hash-based slug detected:', restaurantSlug);
    } else {
      console.log('  ❌ No valid hash parts found');
    }
  } else {
    console.log('  ❌ No hash-based routing (no hash)');
  }
  
  // If no hash found, check for subdomain-based routing
  console.log('🔍 Checking subdomain routing...');
  if (!restaurantSlug) {
    const parts = hostname.split('.');
    console.log('  Hostname parts:', parts);
    
    if (parts.length > 1) {
      if (hostname.includes('localhost')) {
        // Development: restaurant-slug.localhost:3000
        restaurantSlug = parts[0];
        isSubdomain = true;
        console.log('  ✅ Development subdomain detected:', restaurantSlug);
      } else {
        // Production: restaurant-slug.yourapp.com
        restaurantSlug = parts[0];
        isSubdomain = true;
        console.log('  ✅ Production subdomain detected:', restaurantSlug);
      }
      
      // Skip common subdomains
      if (restaurantSlug && ['www', 'api', 'admin', 'app'].includes(restaurantSlug)) {
        console.log('  ❌ Skipping common subdomain:', restaurantSlug);
        restaurantSlug = null;
        isSubdomain = false;
      }
    } else {
      console.log('  ❌ No subdomain detected (parts.length <= 1)');
    }
  } else {
    console.log('  ❌ Skipping subdomain check (restaurantSlug already found from hash)');
  }
  
  const result = {
    restaurantSlug,
    isSubdomain,
    isPathBased,
    hasRestaurantContext: !!(restaurantSlug && (isSubdomain || isPathBased)),
    hostname,
    pathname,
  };
  
  console.log('✅ Restaurant Context Final Result:', result);
  console.log('  Restaurant Slug:', result.restaurantSlug);
  console.log('  Is Subdomain:', result.isSubdomain);
  console.log('  Is Path Based:', result.isPathBased);
  console.log('  Has Restaurant Context:', result.hasRestaurantContext);
  
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
