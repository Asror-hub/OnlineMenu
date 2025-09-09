import { API_CONFIG, ENDPOINTS } from '../config';

class ApiService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    
    // Check if localStorage is available
    this.isLocalStorageAvailable = (() => {
      try {
        const test = '__localStorage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
      } catch (e) {
        return false;
      }
    })();
  }

  // Helper method to get auth headers
  getAuthHeaders() {
    if (!this.isLocalStorageAvailable) {
      return {
        'Content-Type': 'application/json',
        'Authorization': ''
      };
    }
    
    try {
      const token = localStorage.getItem('adminToken');
      return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      };
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      return {
        'Content-Type': 'application/json',
        'Authorization': ''
      };
    }
  }

  // Helper method to get auth headers with restaurant context
  getRestaurantHeaders() {
    if (!this.isLocalStorageAvailable) {
      return {
        'Content-Type': 'application/json',
        'Authorization': '',
        'X-Restaurant-Id': '',
        'X-Restaurant-Slug': ''
      };
    }
    
    try {
      const token = localStorage.getItem('adminToken');
      let restaurantId = null;
      let restaurantSlug = null;
      
      // Try to get restaurant data from JWT token first
      if (token && token !== 'dev-token-for-testing') {
        try {
          // Decode JWT token to get restaurant data
          const payload = JSON.parse(atob(token.split('.')[1]));
          restaurantId = payload.restaurantId || payload.restaurant_id;
          restaurantSlug = payload.restaurantSlug || payload.restaurant_slug;
          console.log('🔍 API: Using restaurant data from JWT token:', { id: restaurantId, slug: restaurantSlug });
        } catch (e) {
          console.warn('Could not decode JWT token:', e);
        }
      }
      
      // Fallback to localStorage if JWT decoding failed or development token
      if (!restaurantId || !restaurantSlug) {
        restaurantId = localStorage.getItem('restaurantId');
        
        // If no restaurant data, try to parse it from the stored restaurant data
        if (!restaurantId || !restaurantSlug) {
          try {
            const restaurantData = localStorage.getItem('currentRestaurant');
            if (restaurantData) {
              const parsed = JSON.parse(restaurantData);
              restaurantId = restaurantId || parsed.id;
              restaurantSlug = restaurantSlug || parsed.slug;
            }
          } catch (e) {
            console.warn('Could not parse restaurant data from localStorage');
          }
        }
        console.log('🔍 API: Using restaurant data from localStorage:', { id: restaurantId, slug: restaurantSlug });
      }
      
      return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        'X-Restaurant-Id': restaurantId || '',
        'X-Restaurant-Slug': restaurantSlug || ''
      };
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      return {
        'Content-Type': 'application/json',
        'Authorization': '',
        'X-Restaurant-Id': '',
        'X-Restaurant-Slug': ''
      };
    }
  }

  // Helper method to get auth headers without Content-Type (for FormData)
  getAuthHeadersNoContentType() {
    if (!this.isLocalStorageAvailable) {
      return {
        'Authorization': ''
      };
    }
    
    try {
      const token = localStorage.getItem('adminToken');
      return {
        'Authorization': token ? `Bearer ${token}` : ''
      };
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      return {
        'Authorization': ''
      };
    }
  }

  // Helper method to handle API responses
  async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Helper method to handle network errors
  async handleNetworkError(error) {
    console.error('🔍 Network Error Details:', error);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the server. Please check your internet connection and try again.');
    }
    
    if (error.name === 'AbortError') {
      throw new Error('Request timeout: The server took too long to respond. Please try again.');
    }
    
    throw error;
  }

  // Restaurant Settings APIs
  async getRestaurantSettings() {
    const response = await fetch(`${this.baseURL}${ENDPOINTS.SETTINGS.BASE}`, {
      headers: this.getRestaurantHeaders()
    });

    return this.handleResponse(response);
  }

  async saveRestaurantSettings(settings) {
    const response = await fetch(`${this.baseURL}${ENDPOINTS.SETTINGS.BASE}`, {
      method: 'POST',
      headers: this.getRestaurantHeaders(),
      body: JSON.stringify(settings)
    });

    return this.handleResponse(response);
  }

  // Authentication APIs
  async login(credentials) {
    try {
      const url = `${this.baseURL}${ENDPOINTS.AUTH.LOGIN}`;
      console.log('🔍 API Login - Base URL:', this.baseURL);
      console.log('🔍 API Login - Full URL:', url);
      console.log('🔍 API Login - Credentials:', { email: credentials.email, password: '***' });
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password
        })
      });

      console.log('🔍 API Login - Response status:', response.status);
      console.log('🔍 API Login - Response headers:', response.headers);
      
      return this.handleResponse(response);
    } catch (error) {
      console.error('🔍 API Login - Error:', error);
      return this.handleNetworkError(error);
    }
  }

  async validateToken() {
    const response = await fetch(`${this.baseURL}${ENDPOINTS.AUTH.VALIDATE}`, {
      headers: this.getAuthHeaders()
    });

    return this.handleResponse(response);
  }

  async register(userData) {
    // Generate slug from restaurant name
    const slug = userData.restaurantName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    const response = await fetch(`${this.baseURL}${ENDPOINTS.AUTH.REGISTER}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: userData.restaurantName, // Use restaurant name as the user's name
        email: userData.email,
        password: userData.password,
        phone: userData.phone,
        role: 'admin', // Force admin role for admin panel
        restaurantName: userData.restaurantName,
        restaurantSlug: slug
      })
    });

    return this.handleResponse(response);
  }

  // Restaurant Context API
  async getRestaurantContext() {
    const response = await fetch(`${this.baseURL}/api/admin/restaurants/context`, {
      headers: this.getAuthHeaders()
    });

    return this.handleResponse(response);
  }

  // User Management APIs
  async getUsers() {
    const headers = this.getRestaurantHeaders();
    console.log('getUsers API call - Headers:', headers);
    console.log('getUsers API call - URL:', `${this.baseURL}/api/admin/users`);
    
    const response = await fetch(`${this.baseURL}/api/admin/users`, {
      headers: headers
    });

    return this.handleResponse(response);
  }

  async createUser(userData) {
    const response = await fetch(`${this.baseURL}/api/admin/users`, {
      method: 'POST',
      headers: this.getRestaurantHeaders(),
      body: JSON.stringify({
        ...userData,
        role: userData.role || 'staff' // Default to staff, admin cannot create other admins
      })
    });

    return this.handleResponse(response);
  }

  async updateUser(userId, userData) {
    const response = await fetch(`${this.baseURL}/api/admin/users/${userId}`, {
      method: 'PUT',
      headers: this.getRestaurantHeaders(),
      body: JSON.stringify(userData)
    });

    return this.handleResponse(response);
  }

  async deleteUser(userId) {
    const response = await fetch(`${this.baseURL}/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: this.getRestaurantHeaders()
    });

    return this.handleResponse(response);
  }

  // Menu Management APIs
  async getMenuItems() {
    const headers = this.getRestaurantHeaders();
    
    const response = await fetch(`${this.baseURL}/api/admin/menu`, {
      headers: headers
    });

    return this.handleResponse(response);
  }

  async createMenuItem(menuData) {
    const formData = new FormData();
    formData.append('name', menuData.name);
    formData.append('description', menuData.description);
    formData.append('price', parseFloat(menuData.price));
    formData.append('category_id', parseInt(menuData.category_id));
    if (menuData.subcategory_id) {
      formData.append('subcategory_id', parseInt(menuData.subcategory_id));
    }
    if (menuData.image && menuData.image instanceof File) {
      formData.append('image', menuData.image);
    } else if (menuData.image) {
      formData.append('image_url', menuData.image);
    }
    formData.append('is_active', menuData.available.toString());

    // Get restaurant headers but remove Content-Type for FormData
    const headers = this.getRestaurantHeaders();
    delete headers['Content-Type'];

    const response = await fetch(`${this.baseURL}${ENDPOINTS.MENU.BASE}`, {
      method: 'POST',
      headers: headers,
      body: formData
    });

    return this.handleResponse(response);
  }

  async updateMenuItem(id, menuData) {
    const formData = new FormData();
    formData.append('name', menuData.name);
    formData.append('description', menuData.description);
    formData.append('price', parseFloat(menuData.price));
    formData.append('category_id', parseInt(menuData.category_id));
    if (menuData.subcategory_id) {
      formData.append('subcategory_id', parseInt(menuData.subcategory_id));
    }
    if (menuData.image && menuData.image instanceof File) {
      formData.append('image', menuData.image);
    } else if (menuData.image) {
      formData.append('image_url', menuData.image);
    }
    formData.append('is_active', menuData.available.toString());

    // Get restaurant headers but remove Content-Type for FormData
    const headers = this.getRestaurantHeaders();
    delete headers['Content-Type'];

    const response = await fetch(`${this.baseURL}${ENDPOINTS.MENU.BASE}/${id}`, {
      method: 'PUT',
      headers: headers,
      body: formData
    });

    return this.handleResponse(response);
  }

  async updateMenuItemAvailability(id, isActive) {
    const formData = new FormData();
    formData.append('is_active', isActive.toString());

    const response = await fetch(`${this.baseURL}${ENDPOINTS.MENU.BASE}/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeadersNoContentType(),
      body: formData
    });

    return this.handleResponse(response);
  }

  async deleteMenuItem(id) {
    const response = await fetch(`${this.baseURL}${ENDPOINTS.MENU.BASE}/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse(response);
  }

  async getCategories() {
    const response = await fetch(`${this.baseURL}/api/admin/menu/categories`, {
      headers: this.getRestaurantHeaders()
    });

    return this.handleResponse(response);
  }

  async getSubcategories() {
    const response = await fetch(`${this.baseURL}/api/admin/menu/subcategories`, {
      headers: this.getRestaurantHeaders()
    });

    return this.handleResponse(response);
  }

  async createCategory(categoryData) {
    const response = await fetch(`${this.baseURL}/api/admin/menu/categories`, {
      method: 'POST',
      headers: this.getRestaurantHeaders(),
      body: JSON.stringify(categoryData)
    });

    return this.handleResponse(response);
  }

  async createSubcategory(subcategoryData) {
    const response = await fetch(`${this.baseURL}/api/admin/menu/subcategories`, {
      method: 'POST',
      headers: this.getRestaurantHeaders(),
      body: JSON.stringify(subcategoryData)
    });

    return this.handleResponse(response);
  }

  async updateSubcategory(id, subcategoryData) {
    const response = await fetch(`${this.baseURL}${ENDPOINTS.MENU.UPDATE_SUBCATEGORY(id)}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(subcategoryData)
    });

    return this.handleResponse(response);
  }

  async updateCategory(id, categoryData) {
    const response = await fetch(`${this.baseURL}${ENDPOINTS.MENU.UPDATE_CATEGORY(id)}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(categoryData)
    });

    return this.handleResponse(response);
  }

  async deleteCategory(id) {
    const response = await fetch(`${this.baseURL}${ENDPOINTS.MENU.DELETE_CATEGORY(id)}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse(response);
  }

  async reorderCategories(categoryOrders) {
    const response = await fetch(`${this.baseURL}${ENDPOINTS.MENU.REORDER_CATEGORIES}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ categories: categoryOrders })
    });

    return this.handleResponse(response);
  }

  async reorderSubcategories(subcategoryOrders) {
    const response = await fetch(`${this.baseURL}${ENDPOINTS.MENU.REORDER_SUBCATEGORIES}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ subcategories: subcategoryOrders })
    });

    return this.handleResponse(response);
  }

  async deleteSubcategory(id) {
    const response = await fetch(`${this.baseURL}${ENDPOINTS.MENU.DELETE_SUBCATEGORY(id)}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse(response);
  }

  // Order Management APIs
  async getOrders() {
    const response = await fetch(`${this.baseURL}/api/admin/orders`, {
      headers: this.getRestaurantHeaders()
    });

    return this.handleResponse(response);
  }

  async getOrderDetails(restaurantId, id) {
    const response = await fetch(`${this.baseURL}${ENDPOINTS.ORDERS.BASE}/${id}`, {
      headers: this.getRestaurantHeaders()
    });

    return this.handleResponse(response);
  }

  async updateOrderStatus(id, status) {
    const response = await fetch(`${this.baseURL}/api/admin/orders/${id}/status`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status })
    });

    return this.handleResponse(response);
  }



  async updateUser(id, userData) {
    const response = await fetch(`${this.baseURL}${ENDPOINTS.AUTH.UPDATE_USER(id)}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData)
    });

    return this.handleResponse(response);
  }

  async deleteUser(id) {
    const response = await fetch(`${this.baseURL}${ENDPOINTS.AUTH.DELETE_USER(id)}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse(response);
  }

  // Dashboard Statistics APIs
  async getDashboardStats() {
    try {
      const headers = this.getRestaurantHeaders();
      console.log('Dashboard stats API call - Headers:', headers);
      console.log('Dashboard stats API call - URL:', `${this.baseURL}/api/dashboard/analytics`);
      
      const response = await fetch(`${this.baseURL}/api/dashboard/analytics`, {
        headers: headers
      });

      console.log('Dashboard stats response status:', response.status);
      const result = await this.handleResponse(response);
      console.log('Dashboard stats result:', result);
      return result;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        success: false,
        data: {
          stats: {
            total_orders: 0,
            pending_orders: 0,
            completed_orders: 0,
            cancelled_orders: 0,
            total_revenue: 0,
            avg_order_value: 0,
            active_menu_items: 0,
            total_users: 0
          }
        }
      };
    }
  }

  // Get orders data by time period
  async getOrdersByPeriod(period = 'today') {
    try {
      const response = await fetch(`${this.baseURL}/api/dashboard/orders-by-period?period=${period}`, {
        headers: this.getRestaurantHeaders()
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching orders by period:', error);
      return {
        success: false,
        data: {
          period,
          data: [],
          totalOrders: 0,
          totalRevenue: 0
        }
      };
    }
  }

  // Get top selling items
  async getTopSellingItems(limit = 10) {
    try {
      const response = await fetch(`${this.baseURL}/api/dashboard/top-selling-items?limit=${limit}`, {
        headers: this.getRestaurantHeaders()
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching top selling items:', error);
      return {
        success: false,
        data: []
      };
    }
  }

  // Get payment methods distribution
  async getPaymentMethods() {
    try {
      const response = await fetch(`${this.baseURL}/api/dashboard/payment-methods`, {
        headers: this.getRestaurantHeaders()
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      return {
        success: false,
        data: {
          methods: [],
          totalOrders: 0,
          totalValue: 0
        }
      };
    }
  }

  // Get recent orders
  async getRecentOrders(limit = 10) {
    try {
      const response = await fetch(`${this.baseURL}/api/dashboard/recent-orders?limit=${limit}`, {
        headers: this.getRestaurantHeaders()
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching recent orders:', error);
      return {
        success: false,
        data: []
      };
    }
  }

  // Get overview data
  async getOverviewData() {
    try {
      const response = await fetch(`${this.baseURL}/api/dashboard/overview`, {
        headers: this.getRestaurantHeaders()
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching overview data:', error);
      return {
        success: false,
        data: {
          todayOrders: 0,
          weekOrders: 0,
          monthOrders: 0,
          todayRevenue: 0,
          weekRevenue: 0,
          monthRevenue: 0,
          uniqueCustomers: 0,
          activeItems: 0
        }
      };
    }
  }

  // File Upload API (for menu item images)
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${this.baseURL}${ENDPOINTS.UPLOAD.IMAGE}`, {
      method: 'POST',
      headers: {
        'Authorization': this.getAuthHeaders().Authorization
      },
      body: formData
    });

    return this.handleResponse(response);
  }

  // Feedback methods
  async getFeedbacks(restaurantId) {
    const response = await fetch(`${this.baseURL}/api/feedbacks`, {
      method: 'GET',
      headers: this.getRestaurantHeaders()
    });
    return this.handleResponse(response);
  }

  async getFeedbacksByDate(restaurantId, startDate, endDate) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await fetch(`${this.baseURL}/api/feedbacks/by-date?${params}`, {
      method: 'GET',
      headers: this.getRestaurantHeaders()
    });
    return this.handleResponse(response);
  }

  async getFeedbackStats(restaurantId) {
    const response = await fetch(`${this.baseURL}/api/feedbacks/stats`, {
      method: 'GET',
      headers: this.getRestaurantHeaders()
    });
    return this.handleResponse(response);
  }

  async getFeedbackById(restaurantId, feedbackId) {
    const response = await fetch(`${this.baseURL}/api/feedbacks/${feedbackId}`, {
      method: 'GET',
      headers: this.getRestaurantHeaders()
    });
    return this.handleResponse(response);
  }

  async createFeedback(restaurantId, feedbackData) {
    const response = await fetch(`${this.baseURL}/api/feedbacks`, {
      method: 'POST',
      headers: this.getRestaurantHeaders(),
      body: JSON.stringify(feedbackData)
    });
    return this.handleResponse(response);
  }

  async respondToFeedback(restaurantId, feedbackId, responseText) {
    const response = await fetch(`${this.baseURL}/api/feedbacks/${feedbackId}/respond`, {
      method: 'POST',
      headers: this.getRestaurantHeaders(),
      body: JSON.stringify({ response_text: responseText })
    });
    return this.handleResponse(response);
  }

  async updateFeedbackVerification(restaurantId, feedbackId, isVerified) {
    const response = await fetch(`${this.baseURL}/api/feedbacks/${feedbackId}/verify`, {
      method: 'PATCH',
      headers: this.getRestaurantHeaders(),
      body: JSON.stringify({ is_verified: isVerified })
    });
    return this.handleResponse(response);
  }

  async deleteFeedback(restaurantId, feedbackId) {
    const response = await fetch(`${this.baseURL}/api/feedbacks/${feedbackId}`, {
      method: 'DELETE',
      headers: this.getRestaurantHeaders()
    });
    return this.handleResponse(response);
  }

  // Reservations APIs
  async getReservations() {
    console.log('🔍 API: Making getReservations request to:', `${this.baseURL}/api/reservations`);
    console.log('🔍 API: Headers:', this.getRestaurantHeaders());
    
    const response = await fetch(`${this.baseURL}/api/reservations`, {
      headers: this.getRestaurantHeaders()
    });
    
    console.log('🔍 API: Response status:', response.status);
    
    const result = await this.handleResponse(response);
    console.log('🔍 API: Response data:', result);
    
    return result;
  }

  async getReservationsByDate(startDate, endDate) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await fetch(`${this.baseURL}/api/reservations/by-date?${params}`, {
      headers: this.getRestaurantHeaders()
    });
    return this.handleResponse(response);
  }

  async getReservationById(id) {
    const response = await fetch(`${this.baseURL}/api/reservations/${id}`, {
      headers: this.getRestaurantHeaders()
    });
    return this.handleResponse(response);
  }

  async createReservation(reservationData) {
    const response = await fetch(`${this.baseURL}/api/reservations`, {
      method: 'POST',
      headers: this.getRestaurantHeaders(),
      body: JSON.stringify(reservationData)
    });
    return this.handleResponse(response);
  }

  async updateReservationStatus(id, status) {
    const response = await fetch(`${this.baseURL}/api/reservations/${id}/status`, {
      method: 'PATCH',
      headers: this.getRestaurantHeaders(),
      body: JSON.stringify({ status })
    });
    return this.handleResponse(response);
  }

  async updateReservation(id, reservationData) {
    const response = await fetch(`${this.baseURL}/api/reservations/${id}`, {
      method: 'PUT',
      headers: this.getRestaurantHeaders(),
      body: JSON.stringify(reservationData)
    });
    return this.handleResponse(response);
  }

  async deleteReservation(id) {
    const response = await fetch(`${this.baseURL}/api/reservations/${id}`, {
      method: 'DELETE',
      headers: this.getRestaurantHeaders()
    });
    return this.handleResponse(response);
  }

  async getReservationStats() {
    const response = await fetch(`${this.baseURL}/api/reservations/stats/overview`, {
      headers: this.getRestaurantHeaders()
    });
    return this.handleResponse(response);
  }
}

export default new ApiService();
