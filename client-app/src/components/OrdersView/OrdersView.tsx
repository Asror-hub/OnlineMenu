import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FiArrowLeft, FiClock, FiCheckCircle, FiX, FiShoppingBag } from 'react-icons/fi';
import { useOrder } from '../../contexts/OrderContext';
import api from '../../services/api';
import Footer from '../Layout/Footer';
import FeedbackForm from '../Feedback/FeedbackForm';

interface OrdersViewProps {
  onBackToMenu: () => void;
}

interface OrderItem {
  menu_item_id: number;
  quantity: number;
  notes?: string;
  menuItem: {
    id: number;
    name: string;
    price: string;
    image_url?: string;
  };
}

interface Order {
  id: number;
  status: string;
  total_amount: number;
  customer_name: string;
  customer_email: string;
  special_instructions?: string;
  payment_method?: string;
  tip_amount?: number;
  created_at: string;
  items: OrderItem[];
}

const OrdersContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  text-align: center;
`;

const OrdersContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding: var(--spacing-xl) var(--spacing-md);
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
  min-height: 100vh;

  @media (max-width: 768px) {
    padding: var(--spacing-lg) var(--spacing-sm);
  }
`;

const OrdersIcon = styled.div`
  color: var(--color-primary);
  font-size: 3.5rem;
  margin-bottom: var(--spacing-md);
  display: flex;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-primary) 0%, #059669 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));

  @media (max-width: 768px) {
    font-size: 3rem;
    margin-bottom: var(--spacing-sm);
  }
`;

const OrdersTitle = styled.h1`
  font-size: 2.25rem;
  font-weight: 800;
  color: var(--color-gray-800);
  margin: 0 0 var(--spacing-sm) 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  letter-spacing: -0.025em;

  @media (max-width: 768px) {
    font-size: 1.875rem;
  }
`;

const OrdersMessage = styled.p`
  font-size: 1rem;
  color: var(--color-gray-600);
  margin: 0 0 var(--spacing-xl) 0;
  line-height: 1.6;
  max-width: 600px;
  font-weight: 400;

  @media (max-width: 768px) {
    font-size: 0.9rem;
    margin: 0 0 var(--spacing-lg) 0;
  }
`;

const OrdersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  width: 100%;
  margin-bottom: var(--spacing-xl);

  @media (max-width: 768px) {
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-lg);
  }
`;

const OrderCard = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 16px;
  padding: var(--spacing-lg);
  border: 1px solid rgba(0, 0, 0, 0.05);
  width: 100%;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06), 0 2px 6px rgba(0, 0, 0, 0.02);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--color-primary) 0%, #059669 100%);
  }

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08), 0 3px 8px rgba(0, 0, 0, 0.03);
  }

  @media (max-width: 768px) {
    padding: var(--spacing-md);
    border-radius: 12px;
  }
`;

const OrderInfo = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md);
  background: rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  backdrop-filter: blur(10px);

  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: var(--spacing-xs);
  }
`;

const InfoItem = styled.div`
  text-align: center;
  padding: var(--spacing-sm);
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.05);

  @media (max-width: 768px) {
    padding: var(--spacing-xs);
  }
`;

const InfoLabel = styled.div`
  font-size: 0.7rem;
  color: var(--color-gray-500);
  margin-bottom: var(--spacing-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;

  @media (max-width: 768px) {
    font-size: 0.65rem;
  }
`;

const InfoValue = styled.div`
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-gray-800);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const OrderNumber = styled.div`
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--color-primary);
  margin-bottom: var(--spacing-md);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  letter-spacing: -0.025em;

  @media (max-width: 768px) {
    font-size: 1.25rem;
    margin-bottom: var(--spacing-sm);
  }
`;

const OrderTotal = styled.div`
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--color-success);
  margin-bottom: var(--spacing-md);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  letter-spacing: -0.025em;

  @media (max-width: 768px) {
    font-size: 1.25rem;
    margin-bottom: var(--spacing-sm);
  }
`;

const OrderStatus = styled.div<{ $status: string }>`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: 50px;
  font-size: 0.875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: var(--spacing-lg);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  
  ${props => {
    switch (props.$status) {
      case 'pending':
        return `
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          color: white;
        `;
      case 'accepted':
        return `
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
        `;
      case 'preparing':
        return `
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
        `;
      case 'ready':
        return `
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
          color: white;
        `;
      default:
        return `
          background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
          color: white;
        `;
    }
  }}
`;

const OrderItems = styled.div`
  margin-top: var(--spacing-lg);
  padding: var(--spacing-lg);
  background: rgba(255, 255, 255, 0.4);
  border-radius: 16px;
  backdrop-filter: blur(10px);
`;

const ItemsTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-gray-800);
  margin: 0 0 var(--spacing-lg) 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`;

const ItemList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const OrderItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md);
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  @media (max-width: 768px) {
    padding: var(--spacing-sm);
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
`;

const ItemInfo = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex: 1;

  @media (max-width: 768px) {
    width: 100%;
    gap: var(--spacing-sm);
  }
`;

const ItemImage = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
  }
`;

const ItemDetails = styled.div`
  flex: 1;
  min-width: 0;

  @media (max-width: 768px) {
    flex: 1;
  }
`;

const ItemName = styled.div`
  font-weight: 600;
  color: var(--color-gray-800);
  margin-bottom: 2px;
  font-size: 1rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  word-wrap: break-word;

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const ItemNotes = styled.div`
  font-size: 0.75rem;
  color: var(--color-gray-600);
  font-style: italic;
  background: rgba(0, 0, 0, 0.05);
  padding: 2px var(--spacing-xs);
  border-radius: 4px;
  margin-top: 2px;
  word-wrap: break-word;

  @media (max-width: 768px) {
    font-size: 0.7rem;
    padding: 1px var(--spacing-xs);
  }
`;

const ItemQuantity = styled.div`
  background: linear-gradient(135deg, var(--color-primary) 0%, #059669 100%);
  color: white;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  margin-right: var(--spacing-sm);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
  flex-shrink: 0;

  @media (max-width: 768px) {
    font-size: 0.8rem;
    padding: 2px var(--spacing-xs);
    margin-right: 0;
    margin-bottom: var(--spacing-xs);
  }
`;

const ItemPrice = styled.div`
  font-weight: 600;
  color: var(--color-gray-800);
  font-size: 1rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;

  @media (max-width: 768px) {
    font-size: 0.9rem;
    align-self: flex-end;
  }
`;

const BackToMenuButton = styled.button`
  width: 100%;
  max-width: 300px;
  padding: var(--spacing-lg) var(--spacing-xl);
  background: linear-gradient(135deg, var(--color-primary) 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 1.125rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  letter-spacing: 0.025em;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    background: linear-gradient(135deg, #059669 0%, var(--color-primary) 100%);
  }
  
  &:active {
    transform: translateY(-1px);
  }

  @media (max-width: 768px) {
    max-width: 280px;
    padding: var(--spacing-md) var(--spacing-lg);
    font-size: 1rem;
    border-radius: 12px;
  }
`;

const SpecialInstructions = styled.div`
  margin-top: var(--spacing-lg);
  padding: var(--spacing-lg);
  background: linear-gradient(135deg, #e0f2fe 0%, #b3e5fc 100%);
  border-radius: 16px;
  border-left: 4px solid #0288d1;
  box-shadow: 0 4px 12px rgba(2, 136, 209, 0.1);
`;

const InstructionsTitle = styled.h3`
  margin: 0 0 var(--spacing-sm) 0;
  color: #0288d1;
  font-size: 1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const InstructionsText = styled.div`
  background: rgba(255, 255, 255, 0.8);
  padding: var(--spacing-md);
  border-radius: 12px;
  border: 1px solid rgba(2, 136, 209, 0.2);
  font-style: italic;
  color: #01579b;
  line-height: 1.6;
  font-weight: 500;
  backdrop-filter: blur(10px);
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl);
  text-align: center;
  color: var(--color-gray-600);
  background: rgba(255, 255, 255, 0.6);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
`;

const EmptyIcon = styled.div`
  font-size: 5rem;
  margin-bottom: var(--spacing-lg);
  opacity: 0.6;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
`;

const EmptyTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 var(--spacing-md) 0;
  color: var(--color-gray-700);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`;

const EmptyMessage = styled.p`
  font-size: 1.125rem;
  margin: 0 0 var(--spacing-lg) 0;
  max-width: 500px;
  line-height: 1.7;
  color: var(--color-gray-600);
  font-weight: 400;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--spacing-2xl);
  background: rgba(255, 255, 255, 0.6);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
`;

const Spinner = styled.div`
  width: 50px;
  height: 50px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-top: 4px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const OrdersView: React.FC<OrdersViewProps> = ({ onBackToMenu }) => {
  const { orderHistory } = useOrder();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    orderId: number;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    orderItems?: OrderItem[];
  }>({
    isOpen: false,
    orderId: 0,
    orderNumber: '',
    customerName: '',
    customerEmail: '',
    orderItems: []
  });
  const [shownFeedbackOrders, setShownFeedbackOrders] = useState<Set<number>>(() => {
    // Load from localStorage on component mount
    try {
      const saved = localStorage.getItem('shownFeedbackOrders');
      const loadedSet = saved ? new Set(JSON.parse(saved) as number[]) : new Set<number>();
      console.log('🔄 Loaded shownFeedbackOrders from localStorage:', Array.from(loadedSet));
      return loadedSet;
    } catch (error) {
      console.error('Error loading shownFeedbackOrders from localStorage:', error);
      return new Set<number>();
    }
  });
  const [previousOrderStatuses, setPreviousOrderStatuses] = useState<Map<number, string>>(new Map());
  const [orderReadyTimes, setOrderReadyTimes] = useState<Map<number, number>>(new Map()); // Track when orders become ready
  
  // New state for multiple orders feedback
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [currentOrderIndex, setCurrentOrderIndex] = useState<number>(0);
  const [showOrderSelection, setShowOrderSelection] = useState<boolean>(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [lastFinishedOrder, setLastFinishedOrder] = useState<Order | null>(null); // Track the last finished order
  const isFeedbackModalOpenRef = useRef(false);

  // Function to clear feedback tracking (for testing)
  const clearFeedbackTracking = () => {
    setShownFeedbackOrders(new Set());
    try {
      localStorage.removeItem('shownFeedbackOrders');
      console.log('🧹 Cleared feedback tracking from localStorage');
    } catch (error) {
      console.error('Error clearing shownFeedbackOrders from localStorage:', error);
    }
  };

  // Functions to handle multiple orders feedback
  const handleOrderSelect = (orderIndex: number) => {
    setCurrentOrderIndex(orderIndex);
    const selectedOrder = availableOrders[orderIndex];
    console.log('🎯 Selected order for feedback:', selectedOrder.id);
    
    setFeedbackModal({
      isOpen: true,
      orderId: selectedOrder.id,
      orderNumber: selectedOrder.id.toString(),
      customerName: selectedOrder.customer_name || 'Guest',
      customerEmail: selectedOrder.customer_email || '',
      orderItems: selectedOrder.items || []
    });
    setShowOrderSelection(false);
    
    // Mark this order as having shown feedback modal
    setShownFeedbackOrders(prev => {
      const newSet = new Set(prev).add(selectedOrder.id);
      // Save to localStorage
      try {
        localStorage.setItem('shownFeedbackOrders', JSON.stringify(Array.from(newSet)));
      } catch (error) {
        console.error('Error saving shownFeedbackOrders to localStorage:', error);
      }
      return newSet;
    });
  };

  const handleNextOrder = () => {
    if (currentOrderIndex < availableOrders.length - 1) {
      const nextIndex = currentOrderIndex + 1;
      setCurrentOrderIndex(nextIndex);
      handleOrderSelect(nextIndex);
    }
  };

  const handlePreviousOrder = () => {
    if (currentOrderIndex > 0) {
      const prevIndex = currentOrderIndex - 1;
      setCurrentOrderIndex(prevIndex);
      handleOrderSelect(prevIndex);
    }
  };

  const handleFeedbackSubmitted = (orderId: number) => {
    // Mark this order as having received feedback
    setShownFeedbackOrders(prev => {
      const newSet = new Set(prev).add(orderId);
      // Save to localStorage
      try {
        localStorage.setItem('shownFeedbackOrders', JSON.stringify(Array.from(newSet)));
      } catch (error) {
        console.error('Error saving shownFeedbackOrders to localStorage:', error);
      }
      return newSet;
    });
    console.log('✅ Feedback submitted for order:', orderId);
    
    // Check if there are more orders to give feedback for
    const remainingOrders = availableOrders.filter(order => 
      !shownFeedbackOrders.has(order.id) && order.id !== orderId
    );
    
    if (remainingOrders.length > 0) {
      console.log('🔄 More orders available for feedback:', remainingOrders.length);
      // Show next order or selection UI
      if (remainingOrders.length === 1) {
        handleOrderSelect(availableOrders.findIndex(order => order.id === remainingOrders[0].id));
      } else {
        setShowOrderSelection(true);
        setCurrentOrderIndex(0);
      }
    } else {
      console.log('✅ All orders have received feedback');
      setShowOrderSelection(false);
    }
  };

  useEffect(() => {
    const loadOrders = async () => {
      // Don't refresh orders if feedback modal is open
      if (isFeedbackModalOpenRef.current) {
        console.log('⏸️ Skipping order refresh - feedback modal is open');
        return;
      }
      try {
        setLoading(true);
        setError(null);
        
        console.log('Loading active orders from server...');
        
        // Fetch active orders
        const activeOrders = await api.getActiveOrders();
        
        console.log('OrdersView - Active orders from server:', activeOrders);
        console.log('Previous order statuses:', Array.from(previousOrderStatuses.entries()));
        
        // Map the active orders to the expected format
        const mappedOrders = activeOrders.map(order => ({
          id: order.id,
          status: order.status,
          total_amount: order.total_amount,
          customer_name: order.customer_name || 'Guest',
          customer_email: order.customer_email || '',
          special_instructions: order.special_instructions || '',
          payment_method: order.payment_method || 'cash',
          tip_amount: order.tip_amount || 0,
          created_at: order.created_at,
          items: order.items || []
        }));
        
        console.log('Mapped active orders:', mappedOrders);
        console.log('Current order IDs:', mappedOrders.map(o => o.id));
        console.log('Previous order IDs:', Array.from(previousOrderStatuses.keys()));
        
        // Check for status changes to detect finished orders
        const currentOrderStatuses = new Map<number, string>();
        const newlyFinishedOrders: any[] = [];
        
        mappedOrders.forEach(order => {
          currentOrderStatuses.set(order.id, order.status);
          
          // Check if this order was previously active but is now finished
          const previousStatus = previousOrderStatuses.get(order.id);
          if (previousStatus && 
              previousStatus !== 'delivered' && 
              previousStatus !== 'finished' && 
              previousStatus !== 'completed' &&
              (order.status === 'delivered' || order.status === 'finished' || order.status === 'completed')) {
            console.log(`🎯 Order ${order.id} status changed from "${previousStatus}" to "${order.status}" - TRIGGERING FEEDBACK!`);
            newlyFinishedOrders.push(order);
            // Store this as the last finished order
            setLastFinishedOrder(order);
          }
          
          // Track when orders become ready for time-based feedback trigger
          if (order.status === 'ready' && !orderReadyTimes.has(order.id)) {
            console.log(`⏰ Order ${order.id} is ready - starting feedback timer`);
            setOrderReadyTimes(prev => new Map(prev).set(order.id, Date.now()));
          }
        });
        
        // Also check for orders that disappeared from active list (they were finished)
        previousOrderStatuses.forEach((status, orderId) => {
          if (!currentOrderStatuses.has(orderId) && 
              status !== 'delivered' && 
              status !== 'finished' && 
              status !== 'completed') {
            console.log(`Order ${orderId} disappeared from active list (was "${status}")`);
            // This order was likely finished, but we need to get its details
            // For now, we'll use a simple approach and show feedback for any order that disappears
            if (!shownFeedbackOrders.has(orderId)) {
            // Create a minimal order object for the feedback modal
            const finishedOrder = {
              id: orderId,
              status: 'delivered', // Assume delivered
              customer_name: 'Guest',
              customer_email: ''
            };
            newlyFinishedOrders.push(finishedOrder);
            
            // Also store as last finished order with proper Order interface
            const orderForLastFinished = {
              id: orderId,
              status: 'delivered',
              total_amount: 0,
              customer_name: 'Guest',
              customer_email: '',
              created_at: new Date().toISOString(),
              items: []
            };
            setLastFinishedOrder(orderForLastFinished);
            }
          }
        });
        
        // Check for time-based feedback triggers (orders ready for 15+ minutes)
        const currentTime = Date.now();
        const FEEDBACK_DELAY_MINUTES = 15; // Show feedback after 15 minutes of order being ready
        const FEEDBACK_DELAY_MS = FEEDBACK_DELAY_MINUTES * 60 * 1000;
        
        orderReadyTimes.forEach((readyTime, orderId) => {
          if (!shownFeedbackOrders.has(orderId) && 
              currentTime - readyTime >= FEEDBACK_DELAY_MS) {
            console.log(`⏰ Order ${orderId} has been ready for ${FEEDBACK_DELAY_MINUTES}+ minutes - TRIGGERING TIME-BASED FEEDBACK!`);
            const timeBasedOrder = { 
              id: orderId, 
              status: 'ready', 
              customer_name: 'Guest', 
              customer_email: '',
              timeBased: true // Flag to indicate this is time-based trigger
            };
            newlyFinishedOrders.push(timeBasedOrder);
            // Store this as the last finished order for time-based feedback
            // Create a proper Order object for setLastFinishedOrder
            const orderForLastFinished = {
              id: orderId,
              status: 'ready',
              total_amount: 0,
              customer_name: 'Guest',
              customer_email: '',
              created_at: new Date().toISOString(),
              items: []
            };
            setLastFinishedOrder(orderForLastFinished);
          }
        });
        
        // Update previous statuses
        setPreviousOrderStatuses(currentOrderStatuses);
        
        // Debug: Log all order statuses
        mappedOrders.forEach(order => {
          console.log(`Order ${order.id} status: "${order.status}"`);
        });
        
        // Also check for any orders that currently have finished status (fallback)
        const currentFinishedOrders = mappedOrders.filter(order => 
          (order.status === 'delivered' || order.status === 'finished' || order.status === 'completed') &&
          !shownFeedbackOrders.has(order.id)
        );
        
        // Combine newly finished orders with currently finished orders
        const allFinishedOrders = [...newlyFinishedOrders, ...currentFinishedOrders].filter(order => 
          !shownFeedbackOrders.has(order.id)
        );
        
        console.log('Newly finished orders found for feedback:', newlyFinishedOrders.length);
        console.log('Currently finished orders found for feedback:', currentFinishedOrders.length);
        console.log('Total finished orders for feedback:', allFinishedOrders.length);
        console.log('Already shown feedback orders:', Array.from(shownFeedbackOrders));
        
        if (allFinishedOrders.length > 0) {
          console.log('First finished order for feedback:', allFinishedOrders[0]);
          console.log('🎉 FEEDBACK MODAL SHOULD APPEAR NOW!');
          
          // Show feedback modal for the first finished order that hasn't been shown yet
          const finishedOrder = allFinishedOrders[0];
          const triggerType = finishedOrder.timeBased ? 'time-based' : 'admin-triggered';
          console.log(`📝 Feedback trigger type: ${triggerType}`);
          
          // Only show feedback if there are no active orders OR if this is a time-based trigger
          const hasActiveOrders = mappedOrders.length > 0;
          if (!hasActiveOrders || finishedOrder.timeBased) {
            setFeedbackModal({
              isOpen: true,
              orderId: finishedOrder.id,
              orderNumber: finishedOrder.id.toString(),
              customerName: finishedOrder.customer_name,
              customerEmail: finishedOrder.customer_email,
              orderItems: finishedOrder.items || []
            });
            setIsFeedbackModalOpen(true);
            isFeedbackModalOpenRef.current = true;
            // Mark this order as having shown feedback modal
            setShownFeedbackOrders(prev => {
              const newSet = new Set(prev).add(finishedOrder.id);
              // Save to localStorage
              try {
                localStorage.setItem('shownFeedbackOrders', JSON.stringify(Array.from(newSet)));
              } catch (error) {
                console.error('Error saving shownFeedbackOrders to localStorage:', error);
              }
              return newSet;
            });
          } else {
            console.log('⏸️ Skipping feedback modal - there are still active orders');
          }
        }
        
        // Set active orders for display
        setOrders(mappedOrders);
        
        // Show feedback modal immediately when no active orders exist (all orders finished)
        if (mappedOrders.length === 0 && !isFeedbackModalOpenRef.current) {
          console.log('🎉 NO ACTIVE ORDERS - SHOWING FEEDBACK MODAL IMMEDIATELY');
          console.log('Previous orders:', Array.from(previousOrderStatuses.keys()));
          console.log('Shown feedback orders:', Array.from(shownFeedbackOrders));
          console.log('Last finished order:', lastFinishedOrder);
          
          // Try to get the most recent completed order from the database
          let orderToUse = lastFinishedOrder;
          
          if (!orderToUse) {
            console.log('🔍 No lastFinishedOrder, trying to fetch most recent completed order...');
            try {
              // Fetch recently finished orders from the database (last 24 hours)
              const finishedOrders = await api.getRecentlyFinishedOrders();
              console.log('🔍 Fetched finished orders:', finishedOrders.length);
              
              if (finishedOrders && Array.isArray(finishedOrders) && finishedOrders.length > 0) {
                // Filter out orders that have already received feedback
                const ordersWithoutFeedback = finishedOrders.filter(order => 
                  !shownFeedbackOrders.has(order.id) && 
                  (order.status === 'delivered' || order.status === 'finished' || order.status === 'completed')
                );
                
                console.log('🔍 Total finished orders from API:', finishedOrders.length);
                console.log('🔍 Orders without feedback:', ordersWithoutFeedback.length);
                console.log('🔍 Already shown feedback for:', Array.from(shownFeedbackOrders));
                console.log('🔍 Orders that will be excluded:', finishedOrders.filter(order => shownFeedbackOrders.has(order.id)).map(o => o.id));
                console.log('🔍 Orders that will be shown:', ordersWithoutFeedback.map(o => o.id));
                
                if (ordersWithoutFeedback.length > 0) {
                  // Double-check that no orders with feedback are being shown
                  const hasOrdersWithFeedback = ordersWithoutFeedback.some(order => shownFeedbackOrders.has(order.id));
                  if (hasOrdersWithFeedback) {
                    console.error('❌ ERROR: Orders with feedback are being shown! This should not happen.');
                    console.error('Orders with feedback in the list:', ordersWithoutFeedback.filter(order => shownFeedbackOrders.has(order.id)).map(o => o.id));
                  }
                  
                  // Store all available orders for selection
                  setAvailableOrders(ordersWithoutFeedback);
                  
                  if (ordersWithoutFeedback.length === 1) {
                    // Only one order, show feedback directly
                    console.log('✅ Only one order without feedback, showing directly');
                    orderToUse = ordersWithoutFeedback[0];
                  } else {
                    // Multiple orders, show selection UI
                    console.log('✅ Multiple orders without feedback, showing selection UI');
                    setShowOrderSelection(true);
                    setCurrentOrderIndex(0);
                    orderToUse = ordersWithoutFeedback[0]; // Default to first order
                  }
                } else {
                  console.log('⚠️ All finished orders have already received feedback - no orders to show');
                  console.log('🔍 This means all orders in the last 24 hours already have feedback');
                }
              } else {
                console.log('⚠️ No finished orders found in the last 24 hours');
              }
            } catch (error) {
              console.error('❌ Error fetching recent finished orders:', error);
            }
          }
          
          // Use the order if available and verified as finished, otherwise use generic feedback
          if (orderToUse) {
            // Double-check that the order is really finished
            const isOrderFinished = orderToUse.status === 'delivered' || 
                                  orderToUse.status === 'finished' || 
                                  orderToUse.status === 'completed';
            
            if (isOrderFinished) {
              console.log('✅ Using verified finished order for feedback:', orderToUse.id, 'Status:', orderToUse.status);
              setFeedbackModal({
                isOpen: true,
                orderId: orderToUse.id,
                orderNumber: orderToUse.id.toString(),
                customerName: orderToUse.customer_name || 'Guest',
                customerEmail: orderToUse.customer_email || '',
                orderItems: orderToUse.items || []
              });
            } else {
              console.log('⚠️ Order is not finished, status:', orderToUse.status, 'Using generic feedback');
              setFeedbackModal({
                isOpen: true,
                orderId: 0, // Generic feedback for non-finished orders
                orderNumber: 'Finished Orders',
                customerName: 'Guest',
                customerEmail: '',
                orderItems: []
              });
            }
          } else {
            console.log('⚠️ No completed orders found, using generic feedback');
            setFeedbackModal({
              isOpen: true,
              orderId: 0, // Generic feedback for finished orders
              orderNumber: 'Finished Orders',
              customerName: 'Guest',
              customerEmail: '',
              orderItems: []
            });
          }
          setIsFeedbackModalOpen(true);
          isFeedbackModalOpenRef.current = true;
        }
      } catch (err: any) {
        console.error('Failed to load orders:', err);
        setError(err.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
    
    // Set up polling to check for order status changes
    const interval = setInterval(loadOrders, 10000); // Check every 10 seconds
    
    return () => clearInterval(interval);
  }, []); // Remove isFeedbackModalOpen from dependencies

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return FiClock;
      case 'accepted': return FiCheckCircle;
      case 'preparing': return FiClock;
      case 'ready': return FiCheckCircle;
      case 'delivered': return FiCheckCircle;
      default: return FiClock;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };



  const submitPendingFeedbacks = async () => {
    try {
      console.log('🔄 Submitting pending feedbacks...');
      const result = await api.submitPendingFeedbacks();
      console.log('✅ Pending feedbacks result:', result);
      
      if (result.success) {
        alert(`Successfully submitted ${result.submitted} feedback items to the database!`);
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error('Failed to submit pending feedbacks:', error);
      alert('Failed to submit pending feedbacks. Please try again.');
    }
  };

  const pendingCount = api.getPendingFeedbacksCount();

  if (loading) {
    return (
      <OrdersContainer>
        <OrdersContent>
          <OrdersIcon>
            {React.createElement(FiClock as any)}
          </OrdersIcon>
          <OrdersTitle>Loading Orders...</OrdersTitle>
          <LoadingSpinner>
            <Spinner />
          </LoadingSpinner>
        </OrdersContent>
      </OrdersContainer>
    );
  }

  if (error) {
    return (
      <OrdersContainer>
        <OrdersContent>
          <OrdersIcon>⚠️</OrdersIcon>
          <OrdersTitle>Error Loading Orders</OrdersTitle>
          <OrdersMessage>{error}</OrdersMessage>
          <BackToMenuButton onClick={onBackToMenu}>
            {React.createElement(FiArrowLeft as any)}
            Back to Menu
          </BackToMenuButton>
        </OrdersContent>
      </OrdersContainer>
    );
  }

  console.log('Rendering OrdersView with orders:', orders);
  console.log('Orders length:', orders.length);

  return (
    <OrdersContainer>
      <OrdersContent>
        <OrdersIcon>
          {React.createElement(FiClock as any)}
        </OrdersIcon>
        
        <OrdersTitle>My Orders</OrdersTitle>
        
        <OrdersMessage>
          Here are all your orders that are not yet completed. You can track their status and view details.
        </OrdersMessage>
        
        {orders.length === 0 ? (
          <>
            {showOrderSelection && availableOrders.length > 1 ? (
              <OrderSelectionContainer>
                <OrderSelectionTitle>Select Order to Give Feedback</OrderSelectionTitle>
                <div style={{ marginBottom: '10px', textAlign: 'center' }}>
                  <button 
                    onClick={clearFeedbackTracking}
                    style={{
                      background: '#ff6b6b',
                      color: 'white',
                      border: 'none',
                      padding: '5px 10px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Clear Feedback Tracking (Testing)
                  </button>
                </div>
                <OrderSelectionList>
                  {availableOrders.map((order, index) => (
                    <OrderSelectionItem 
                      key={order.id}
                      onClick={() => handleOrderSelect(index)}
                      $isSelected={index === currentOrderIndex}
                    >
                      <SelectionOrderInfo>
                        <SelectionOrderNumber>Order #{order.id}</SelectionOrderNumber>
                        <SelectionOrderCustomer>{order.customer_name || 'Guest'}</SelectionOrderCustomer>
                        <SelectionOrderItems>
                          {order.items?.length || 0} items
                          {order.items && order.items.length > 0 && (
                            <span> - {order.items.map(item => `${item.quantity}x ${item.menuItem.name}`).join(', ')}</span>
                          )}
                        </SelectionOrderItems>
                      </SelectionOrderInfo>
                      <SelectionOrderStatus $status={order.status}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </SelectionOrderStatus>
                    </OrderSelectionItem>
                  ))}
                </OrderSelectionList>
                <OrderSelectionActions>
                  <button onClick={() => setShowOrderSelection(false)}>
                    Cancel
                  </button>
                </OrderSelectionActions>
              </OrderSelectionContainer>
            ) : (
              <FeedbackForm
                orderId={feedbackModal.orderId}
                orderNumber={feedbackModal.orderNumber}
                customerName={feedbackModal.customerName}
                customerEmail={feedbackModal.customerEmail}
                orderItems={feedbackModal.orderItems}
                onClose={() => {
                  setIsFeedbackModalOpen(false);
                  isFeedbackModalOpenRef.current = false;
                }}
                onFeedbackSubmitted={handleFeedbackSubmitted}
              />
            )}
          </>
        ) : (
          <OrdersList>
            {orders.map((order) => (
              <OrderCard key={order.id}>
                <OrderInfo>
                  <InfoItem>
                    <InfoLabel>Order Number</InfoLabel>
                    <OrderNumber>#{order.id}</OrderNumber>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Status</InfoLabel>
                    <OrderStatus $status={order.status}>
                      {React.createElement(getStatusIcon(order.status) as any)}
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </OrderStatus>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Total Amount</InfoLabel>
                    <OrderTotal>${Number(order.total_amount).toFixed(2)}</OrderTotal>
                  </InfoItem>
                </OrderInfo>
                
                {order.special_instructions && (
                  <SpecialInstructions>
                    <InstructionsTitle>📝 Customer Comments</InstructionsTitle>
                    <InstructionsText>{order.special_instructions}</InstructionsText>
                  </SpecialInstructions>
                )}

                <OrderItems>
                  <ItemsTitle>
                    {React.createElement(FiShoppingBag as any)}
                    Your Order Items
                  </ItemsTitle>
                  <ItemList>
                    {order.items.map((item, index) => (
                      <OrderItem key={index}>
                        <ItemInfo>
                          {item.menuItem.image_url && (
                            <ItemImage 
                              src={item.menuItem.image_url} 
                              alt={item.menuItem.name}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          )}
                          <ItemDetails>
                            <ItemName>{item.menuItem.name}</ItemName>
                            {item.notes && (
                              <ItemNotes>Note: {item.notes}</ItemNotes>
                            )}
                          </ItemDetails>
                        </ItemInfo>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <ItemQuantity>x{item.quantity}</ItemQuantity>
                          <ItemPrice>${Number(item.menuItem.price).toFixed(2)}</ItemPrice>
                        </div>
                      </OrderItem>
                    ))}
                  </ItemList>
                </OrderItems>
              </OrderCard>
            ))}
          </OrdersList>
        )}
        
        {/* Back to Menu Button - Always visible */}
        <BackToMenuButton onClick={onBackToMenu}>
          {React.createElement(FiArrowLeft as any)}
          Back to Menu
        </BackToMenuButton>
        
        {/* Submit Pending Feedback Button */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          
          
        {pendingCount > 0 && (
          <button
            onClick={submitPendingFeedbacks}
            style={{
              padding: '10px 20px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            📤 Submit Pending Feedback ({pendingCount})
          </button>
        )}
        
        </div>
        
      </OrdersContent>
      
      <Footer />
      
    </OrdersContainer>
  );
};

// Styled components for order selection
const OrderSelectionContainer = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 16px;
  padding: var(--spacing-lg);
  max-width: 600px;
  width: 100%;
  margin: 0 auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
`;

const OrderSelectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
  text-align: center;
  margin-bottom: var(--spacing-lg);
`;

const OrderSelectionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
`;

const OrderSelectionItem = styled.div<{ $isSelected: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  border: 2px solid ${props => props.$isSelected ? 'var(--color-primary)' : '#e2e8f0'};
  border-radius: 12px;
  background: ${props => props.$isSelected ? '#f0f9ff' : '#ffffff'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: var(--color-primary);
    background: #f0f9ff;
  }
`;

const SelectionOrderInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const SelectionOrderNumber = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-primary);
`;

const SelectionOrderCustomer = styled.div`
  font-size: 0.9rem;
  color: #64748b;
`;

const SelectionOrderItems = styled.div`
  font-size: 0.85rem;
  color: #64748b;
`;

const SelectionOrderStatus = styled.div<{ $status: string }>`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  background: ${props => {
    switch (props.$status) {
      case 'delivered': return '#dcfce7';
      case 'finished': return '#dcfce7';
      case 'completed': return '#dcfce7';
      default: return '#f1f5f9';
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'delivered': return '#166534';
      case 'finished': return '#166534';
      case 'completed': return '#166534';
      default: return '#64748b';
    }
  }};
`;

const OrderSelectionActions = styled.div`
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  
  button {
    padding: 10px 20px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background: #ffffff;
    color: #64748b;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
    }
  }
`;

export default OrdersView;
