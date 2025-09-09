import axios, { AxiosInstance } from 'axios';
import { API_CONFIG, ENDPOINTS, getRestaurantContext, getSessionId } from '../config/api';

// Types
export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: string; // API returns price as string
  image_url?: string;
  category_id: number;
  subcategory_id?: number;
  category_name: string;
  subcategory_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  icon?: string;
  position: number;
  is_active: boolean;
  subcategories: Subcategory[];
  created_at: string;
}

export interface Subcategory {
  id: number;
  name: string;
  icon?: string;
  category_id: number;
  is_active: boolean;
  created_at: string;
}

export interface RestaurantInfo {
  id: number;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  phone?: string;
  email?: string;
  address?: string;
  google_maps_link?: string;
  open_time: string;
  close_time: string;
  timezone: string;
  is_active: boolean;
}

export interface RestaurantSettings {
  wifi_name?: string;
  wifi_password?: string;
  instagram?: string;
  facebook?: string;
  trip_advisor?: string;
  whatsapp?: string;
  telegram?: string;
  custom_social_media?: any[];
}

export interface OrderItem {
  menu_item_id: number;
  quantity: number;
  notes?: string;
}

export interface Order {
  items: OrderItem[];
  special_instructions?: string;
  session_id?: string;
  payment_method?: 'cash' | 'card' | 'online';
  tip_amount?: number;
}

export interface OrderResponse {
  message: string;
  order_id: number;
  total_amount: number;
}

export interface Reservation {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  reservation_date: string;
  reservation_time: string;
  party_size: number;
  special_requests?: string;
  table_number?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'started';
  created_at: string;
  updated_at: string;
}

export interface CreateReservationRequest {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  reservation_date: string;
  reservation_time: string;
  party_size: number;
  special_requests?: string;
  table_number?: string;
}

export interface FeedbackData {
  order_id: number | null;
  customer_name: string;
  customer_email?: string;
  rating: number;
  food_rating?: number;
  service_rating?: number;
  atmosphere_rating?: number;
  feedback_text?: string;
  feedback_type?: 'general' | 'complaint' | 'compliment' | 'suggestion';
  is_public?: boolean;
  is_verified?: boolean;
}

class ApiService {
  private api: AxiosInstance;
  private restaurantContext: ReturnType<typeof getRestaurantContext>;

  constructor() {
    this.restaurantContext = getRestaurantContext();
    
    this.api = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include restaurant context
    this.api.interceptors.request.use(
      (config) => {
        // Get fresh restaurant context on each request
        const currentContext = getRestaurantContext();
        
        // Add restaurant context headers
        if (currentContext.restaurantSlug) {
          config.headers['X-Restaurant-Slug'] = currentContext.restaurantSlug;
        }
        
        // Add session ID for guest orders
        config.headers['X-Session-Id'] = getSessionId();
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // Restaurant Info APIs
  async getRestaurantInfo(): Promise<RestaurantInfo> {
    const response = await this.api.get('/api/restaurants/public/info');
    return response.data;
  }

  async getRestaurantSettings(): Promise<RestaurantSettings> {
    const response = await this.api.get('/api/restaurants/public/settings');
    return response.data;
  }

  // Menu APIs
  async getMenuItems(): Promise<MenuItem[]> {
    const response = await this.api.get(ENDPOINTS.MENU.BASE);
    return response.data;
  }

  async getCategories(): Promise<Category[]> {
    const response = await this.api.get(ENDPOINTS.MENU.CATEGORIES);
    return response.data;
  }

  // Order APIs
  async placeGuestOrder(order: Order): Promise<OrderResponse> {
    const response = await this.api.post(ENDPOINTS.ORDERS.GUEST, {
      ...order,
      session_id: getSessionId(),
    });
    return response.data;
  }

  async getActiveOrders(): Promise<any[]> {
    // Use the public endpoint that bypasses authentication
    const response = await this.api.get(ENDPOINTS.ORDERS.ACTIVE);
    return response.data.orders || [];
  }

  async getRecentlyFinishedOrders(): Promise<any[]> {
    // Get recently finished orders (last 24 hours) for feedback
    const response = await this.api.get(ENDPOINTS.ORDERS.RECENTLY_FINISHED);
    return response.data.orders || [];
  }


  async getOrdersBySession(sessionId: string): Promise<any[]> {
    const response = await this.api.get(ENDPOINTS.ORDERS.SESSION(sessionId));
    return response.data.orders || [];
  }

  // Reservation APIs
  async createReservation(reservation: CreateReservationRequest): Promise<Reservation> {
    console.log('🔍 API: Creating reservation with data:', reservation);
    console.log('🔍 API: Headers:', this.api.defaults.headers);
    
    try {
      const response = await this.api.post('/api/reservations/public', reservation);
      console.log('✅ API: Reservation created successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ API: Reservation creation failed:', error.response?.data || error.message);
      throw error;
    }
  }

  async getReservationById(id: number): Promise<Reservation> {
    const response = await this.api.get(`/api/reservations/public/${id}`);
    return response.data;
  }

  async updateReservation(id: number, updates: Partial<CreateReservationRequest>): Promise<Reservation> {
    const response = await this.api.put(`/api/reservations/public/${id}`, updates);
    return response.data;
  }

  async cancelReservation(id: number): Promise<Reservation> {
    const response = await this.api.patch(`/api/reservations/public/${id}/cancel`);
    return response.data;
  }

  // Feedback APIs
  async submitFeedback(feedback: FeedbackData): Promise<any> {
    try {
      // Try the new public endpoint first
      const response = await this.api.post('/api/feedbacks/public', feedback);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.log('Public feedback endpoint not available, using fallback method');
        // Fallback: Store feedback in localStorage for now
        const feedbacks = JSON.parse(localStorage.getItem('pending_feedbacks') || '[]');
        feedbacks.push({
          ...feedback,
          id: Date.now(),
          timestamp: new Date().toISOString()
        });
        localStorage.setItem('pending_feedbacks', JSON.stringify(feedbacks));
        
        // Return success response
        return {
          success: true,
          message: 'Feedback saved locally (will be submitted when server is updated)',
          data: feedback
        };
      }
      throw error;
    }
  }

  // Submit all pending feedback from localStorage
  async submitPendingFeedbacks(): Promise<any> {
    try {
      const pendingFeedbacks = JSON.parse(localStorage.getItem('pending_feedbacks') || '[]');
      
      if (pendingFeedbacks.length === 0) {
        return { success: true, message: 'No pending feedback to submit', submitted: 0 };
      }

      console.log(`Submitting ${pendingFeedbacks.length} pending feedback items...`);
      
      const results: Array<{ success: boolean; feedback: number; error?: any }> = [];
      for (const feedback of pendingFeedbacks) {
        try {
          const response = await this.api.post('/api/feedbacks/public', feedback);
          results.push({ success: true, feedback: feedback.id });
        } catch (error) {
          console.error(`Failed to submit feedback ${feedback.id}:`, error);
          results.push({ success: false, feedback: feedback.id, error });
        }
      }

      // Remove successfully submitted feedback from localStorage
      const successfulIds = results.filter(r => r.success).map(r => r.feedback);
      const remainingFeedbacks = pendingFeedbacks.filter((f: any) => !successfulIds.includes(f.id));
      localStorage.setItem('pending_feedbacks', JSON.stringify(remainingFeedbacks));

      const submittedCount = successfulIds.length;
      const failedCount = results.length - submittedCount;

      return {
        success: true,
        message: `Submitted ${submittedCount} feedback items, ${failedCount} failed`,
        submitted: submittedCount,
        failed: failedCount,
        results
      };
    } catch (error) {
      console.error('Error submitting pending feedbacks:', error);
      return { success: false, message: 'Error submitting pending feedbacks', error };
    }
  }

  // Get pending feedback count
  getPendingFeedbacksCount(): number {
    const pendingFeedbacks = JSON.parse(localStorage.getItem('pending_feedbacks') || '[]');
    return pendingFeedbacks.length;
  }

  // Utility methods
  getRestaurantContext() {
    return this.restaurantContext;
  }

  getSessionId() {
    return getSessionId();
  }
}

const apiService = new ApiService();
export default apiService;
