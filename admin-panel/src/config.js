// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  TIMEOUT: 10000, // 10 seconds
};

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

