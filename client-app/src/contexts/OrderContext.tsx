import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api, { MenuItem, OrderItem, OrderResponse } from '../services/api';

interface CartItem extends OrderItem {
  menuItem: MenuItem;
}

interface CheckoutData {
  paymentMethod: 'cash' | 'card' | 'online';
  tipAmount: number;
  comments: string;
}

interface OrderContextType {
  cart: CartItem[];
  addToCart: (menuItem: MenuItem, quantity?: number, notes?: string) => void;
  removeFromCart: (menuItemId: number) => void;
  updateCartItemQuantity: (menuItemId: number, quantity: number) => void;
  updateCartItemNotes: (menuItemId: number, notes: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
  placeOrder: (specialInstructions?: string, checkoutData?: CheckoutData) => Promise<OrderResponse>;
  orderHistory: any[];
  loading: boolean;
  error: string | null;
  lastOrderData: OrderResponse | null;
  lastOrderItems: CartItem[];
  clearLastOrder: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};

interface OrderProviderProps {
  children: ReactNode;
}

export const OrderProvider: React.FC<OrderProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderHistory, setOrderHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastOrderData, setLastOrderData] = useState<OrderResponse | null>(null);
  const [lastOrderItems, setLastOrderItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('restaurant_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (err) {
        console.error('Failed to load cart from localStorage:', err);
        localStorage.removeItem('restaurant_cart');
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('restaurant_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (menuItem: MenuItem, quantity: number = 1, notes: string = '') => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(item => item.menu_item_id === menuItem.id);
      
      if (existingItemIndex >= 0) {
        // Update existing item
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: updatedCart[existingItemIndex].quantity + quantity,
          notes: notes || updatedCart[existingItemIndex].notes,
        };
        return updatedCart;
      } else {
        // Add new item
        return [...prevCart, {
          menu_item_id: menuItem.id,
          quantity,
          notes,
          menuItem,
        }];
      }
    });
  };

  const removeFromCart = (menuItemId: number) => {
    setCart(prevCart => prevCart.filter(item => item.menu_item_id !== menuItemId));
  };

  const updateCartItemQuantity = (menuItemId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(menuItemId);
      return;
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.menu_item_id === menuItemId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const updateCartItemNotes = (menuItemId: number, notes: string) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.menu_item_id === menuItemId
          ? { ...item, notes }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('restaurant_cart');
  };

  const clearLastOrder = () => {
    setLastOrderData(null);
    setLastOrderItems([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      return total + (Number(item.menuItem.price) * item.quantity);
    }, 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const placeOrder = async (specialInstructions?: string, checkoutData?: CheckoutData): Promise<OrderResponse> => {
    if (cart.length === 0) {
      throw new Error('Cart is empty');
    }

    setLoading(true);
    setError(null);

    try {
      const orderItems = cart.map(item => ({
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        notes: item.notes,
      }));

      // Combine special instructions and checkout comments
      const combinedInstructions = [
        specialInstructions,
        checkoutData?.comments
      ].filter(Boolean).join(' | ');

      const order = {
        items: orderItems,
        special_instructions: combinedInstructions || undefined,
        payment_method: checkoutData?.paymentMethod,
        tip_amount: checkoutData?.tipAmount,
      };

      const response = await api.placeGuestOrder(order);
      
      // Store order data and items for success screen
      setLastOrderData(response);
      setLastOrderItems([...cart]);
      
      // Clear cart after successful order
      clearCart();
      
      // Add to order history
      setOrderHistory(prev => [response, ...prev]);
      
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to place order';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const value: OrderContextType = {
    cart,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    updateCartItemNotes,
    clearCart,
    getCartTotal,
    getCartItemCount,
    placeOrder,
    orderHistory,
    loading,
    error,
    lastOrderData,
    lastOrderItems,
    clearLastOrder,
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};
