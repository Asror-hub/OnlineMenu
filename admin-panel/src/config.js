// API Configuration
const getBaseURL = () => {
  // Check if we're in production
  if (process.env.NODE_ENV === 'production') {
    // Use the production backend URL
    return process.env.REACT_APP_API_URL || 'https://online-menu-backend.onrender.com';
  }
  // Development fallback
  return process.env.REACT_APP_API_URL || 'http://localhost:5000';
};

export const API_CONFIG = {
  BASE_URL: getBaseURL(),
  TIMEOUT: 10000, // 10 seconds
};

// Debug API configuration
console.log('🔍 API Config Debug:');
console.log('  REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
console.log('  BASE_URL:', API_CONFIG.BASE_URL);
console.log('  NODE_ENV:', process.env.NODE_ENV);

// Backend endpoints
export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    VALIDATE: '/api/auth/validate',
    USERS: '/api/auth/users',
    UPDATE_USER: (id) => `/api/auth/users/${id}`,
    DELETE_USER: (id) => `/api/auth/users/${id}`,
  },
  MENU: {
    BASE: '/api/admin/menu',
    CATEGORIES: '/api/admin/menu/categories',
    CREATE_CATEGORY: '/api/admin/menu/categories',
    CREATE_SUBCATEGORY: '/api/admin/menu/subcategories',
    UPDATE_CATEGORY: (id) => `/api/admin/menu/categories/${id}`,
    UPDATE_SUBCATEGORY: (id) => `/api/admin/menu/subcategories/${id}`,
    DELETE_CATEGORY: (id) => `/api/admin/menu/categories/${id}`,
    DELETE_SUBCATEGORY: (id) => `/api/admin/menu/subcategories/${id}`,
    REORDER_CATEGORIES: '/api/admin/menu/categories/reorder',
    REORDER_SUBCATEGORIES: '/api/admin/menu/subcategories/reorder',
  },
  ORDERS: {
    BASE: '/api/orders',
    STATUS: (id) => `/api/orders/${id}/status`,
  },
  UPLOAD: {
    IMAGE: '/api/upload/image',
  },
  SETTINGS: {
    BASE: '/api/admin/settings',
  },
};

