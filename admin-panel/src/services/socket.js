import { io } from 'socket.io-client';
import { API_CONFIG } from '../config';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect() {
    if (this.socket && this.isConnected) {
      console.log('Socket already connected, returning existing socket');
      return this.socket;
    }

    console.log('Attempting to connect to Socket.io at:', API_CONFIG.BASE_URL);
    
    try {
      this.socket = io(API_CONFIG.BASE_URL, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      this.socket.on('connect', () => {
        console.log('✅ Socket connected successfully:', this.socket.id);
        this.isConnected = true;
        
        // Join restaurant room for real-time updates
        this.joinRestaurantRoom();
      });

      this.socket.on('disconnect', () => {
        console.log('❌ Socket disconnected');
        this.isConnected = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
        this.isConnected = false;
      });

      this.socket.on('error', (error) => {
        console.error('❌ Socket error:', error);
      });

      return this.socket;
    } catch (error) {
      console.error('Failed to create socket connection:', error);
      return null;
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  onNewOrder(callback) {
    if (this.socket) {
      console.log('🔔 Setting up new-order event listener');
      this.socket.on('new-order', (data) => {
        console.log('🎉 New order received via socket:', data);
        callback(data);
      });
    } else {
      console.error('❌ Cannot set up new-order listener: socket not available');
    }
  }

  removeNewOrderListener() {
    if (this.socket) {
      this.socket.off('new-order');
    }
  }

  onReservationCreated(callback) {
    if (this.socket) {
      console.log('🔔 Setting up reservation-created event listener');
      this.socket.on('reservation_created', (data) => {
        console.log('🎉 New reservation received via socket:', data);
        callback(data);
      });
    } else {
      console.error('❌ Cannot set up reservation-created listener: socket not available');
    }
  }

  onReservationUpdated(callback) {
    if (this.socket) {
      console.log('🔔 Setting up reservation-updated event listener');
      this.socket.on('reservation_updated', (data) => {
        console.log('🎉 Reservation updated via socket:', data);
        callback(data);
      });
    } else {
      console.error('❌ Cannot set up reservation-updated listener: socket not available');
    }
  }

  removeReservationListeners() {
    if (this.socket) {
      this.socket.off('reservation_created');
      this.socket.off('reservation_updated');
    }
  }

  joinRestaurantRoom() {
    if (this.socket && this.isConnected) {
      try {
        const token = localStorage.getItem('adminToken');
        let restaurantId = null;
        
        // Try to get restaurant ID from JWT token first
        if (token && token !== 'dev-token-for-testing') {
          try {
            // Decode JWT token to get restaurant ID
            const payload = JSON.parse(atob(token.split('.')[1]));
            restaurantId = payload.restaurantId || payload.restaurant_id;
            console.log('🔗 Socket: Using restaurant ID from JWT token:', restaurantId);
          } catch (e) {
            console.warn('Could not decode JWT token for socket:', e);
          }
        }
        
        // Fallback to localStorage if JWT decoding failed or development token
        if (!restaurantId) {
          restaurantId = localStorage.getItem('restaurantId');
          console.log('🔗 Socket: Using restaurant ID from localStorage:', restaurantId);
        }
        
        if (restaurantId) {
          const validRestaurantId = parseInt(restaurantId);
          if (isNaN(validRestaurantId)) {
            console.error('❌ Invalid restaurant ID:', restaurantId);
            return;
          }
          this.socket.emit('join_restaurant', validRestaurantId);
          console.log(`🔗 Joined restaurant room: ${validRestaurantId}`);
        } else {
          console.warn('⚠️ No restaurant ID found for socket connection');
        }
      } catch (error) {
        console.error('❌ Error joining restaurant room:', error);
      }
    }
  }

  isSocketConnected() {
    return this.isConnected;
  }
}

export default new SocketService();
