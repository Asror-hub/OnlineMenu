import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiStar, FiUser, FiMail, FiPhone, FiMessageSquare, FiCheck, FiX, FiEye, FiFilter, FiChevronDown } from 'react-icons/fi';
import api from '../services/api';
import { useRestaurant } from '../contexts/RestaurantContext';

const FeedbacksContainer = styled.div`
  padding: 0;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  overflow-x: hidden;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0;
  padding: 24px 32px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 0;
  z-index: 100;
`;

const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const PageTitle = styled.h1`
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: -0.025em;
`;

const FeedbackCount = styled.div`
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
`;

const HeaderRight = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
`;

const StatsCard = styled.div`
  background: linear-gradient(135deg, ${props => props.$color}15 0%, ${props => props.$color}08 100%);
  border: 1px solid ${props => props.$color}30;
  border-radius: 12px;
  padding: 16px 20px;
  min-width: 140px;
  text-align: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px ${props => props.$color}20;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, ${props => props.$color} 0%, ${props => props.$color}80 100%);
  }
`;

const StatsValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: ${props => props.$color};
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const StatsLabel = styled.div`
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
`;


const MainContent = styled.div`
  display: flex;
  min-height: calc(100vh - 100px);
  position: relative;
  align-items: stretch;
`;

const FeedbackSidebar = styled.div`
  width: 400px;
  min-width: 400px;
  max-width: 400px;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  border-right: 3px solid #3b82f6;
  overflow-y: auto;
  padding: 0;
  position: relative;
  flex-shrink: 0;
  box-sizing: border-box;
  margin-right: 20px;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%);
    border-radius: 4px;
    border: 1px solid #e2e8f0;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 1px;
    height: 100%;
    background: linear-gradient(180deg, transparent 0%, #e2e8f0 50%, transparent 100%);
  }
`;

const FeedbackDetailsPanel = styled.div`
  flex: 1;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  overflow-y: auto;
  padding: 0;
  position: relative;
  min-width: 0;
  box-sizing: border-box;
  border-left: 1px solid #e2e8f0;
  margin-left: 20px;
  padding-left: 20px;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%);
    border-radius: 4px;
    border: 1px solid #e2e8f0;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
  }
`;

const FeedbacksList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;
  padding: 16px;
  box-sizing: border-box;
`;

const FeedbackSection = styled.div`
  margin: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  overflow: hidden;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  box-sizing: border-box;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;

  &:hover {
    background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  }
`;

const SectionTitle = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const SectionTitleText = styled.div`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SectionFeedbackCount = styled.div`
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
`;

const ChevronIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  transition: all 0.2s ease;
  transform: ${props => props.$expanded ? 'rotate(180deg)' : 'rotate(0deg)'};

  svg {
    width: 16px;
    height: 16px;
  }
`;

const EmptySection = styled.div`
  padding: 40px 24px;
  text-align: center;
  color: #64748b;
  font-style: italic;
`;

const SidebarTitle = styled.h3`
  margin: 0 0 20px 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
`;

const DayFilter = styled.div`
  margin-bottom: 24px;
`;

const DayFilterTitle = styled.h4`
  margin: 0 0 12px 0;
  color: #666;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const DayButton = styled.button`
  width: 100%;
  padding: 12px 16px;
  margin-bottom: 8px;
  border: 1px solid #e0e0e0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  font-size: 14px;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  &:hover {
    background: #f8f9fa;
    border-color: #667eea;
  }
  
  &.active {
    background: #667eea;
    color: white;
    border-color: #667eea;
  }
`;

const DropdownContainer = styled.div`
  position: relative;
  margin-bottom: 8px;
`;

const DropdownButton = styled.button`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  font-size: 14px;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  &:hover {
    background: #f8f9fa;
    border-color: #667eea;
  }
  
  &.active {
    background: #667eea;
    color: white;
    border-color: #667eea;
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  margin-top: 4px;
`;

const DropdownItem = styled.button`
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  font-size: 14px;
  color: #333;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover:not(:disabled) {
    background: #f8f9fa;
  }
  
  &.active {
    background: #667eea;
    color: white;
  }
  
  &:disabled {
    cursor: not-allowed;
    color: #999;
    background: #f8f9fa;
  }
`;

const DateDisplay = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 2px;
`;

const FeedbackPreview = styled.div`
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
  
  &:hover {
    border-color: #667eea;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
  }
  
  &.selected {
    border-color: #667eea;
    background: #f8f9ff;
  }
`;

const PreviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const PreviewName = styled.div`
  font-weight: 600;
  color: #333;
  font-size: 14px;
`;

const PreviewRating = styled.div`
  display: flex;
  gap: 2px;
`;

const PreviewText = styled.div`
  color: #666;
  font-size: 12px;
  line-height: 1.4;
  margin-bottom: 8px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const PreviewDate = styled.div`
  color: #999;
  font-size: 11px;
`;

const ContentArea = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-height: 400px;
`;

const ContentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e0e0e0;
`;

const ContentTitle = styled.h2`
  margin: 0;
  color: #333;
  font-size: 24px;
  font-weight: 700;
`;

const ContentRating = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const RatingDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #333;
`;

const FeedbackContent = styled.div`
  margin-bottom: 24px;
`;

const FeedbackText = styled.div`
  color: #333;
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 16px;
`;

const FeedbackDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
`;

const DetailItem = styled.div`
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
`;

const DetailLabel = styled.div`
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
`;

const DetailValue = styled.div`
  font-size: 14px;
  color: #333;
  font-weight: 600;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
`;

const ActionButton = styled.button`
  padding: 10px 20px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  
  &:hover {
    background: #f8f9fa;
    border-color: #ccc;
  }
  
  &.primary {
    background: #667eea;
    color: white;
    border-color: #667eea;
    
    &:hover {
      background: #5a6fd8;
    }
  }
  
  &.success {
    background: #28a745;
    color: white;
    border-color: #28a745;
    
    &:hover {
      background: #218838;
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #666;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
`;

const EmptyText = styled.div`
  font-size: 16px;
  margin-bottom: 8px;
`;

const EmptySubtext = styled.div`
  font-size: 14px;
  color: #999;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  margin: 0;
  color: #333;
  font-size: 28px;
  font-weight: 700;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-left: 4px solid ${props => props.$color || '#667eea'};
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 48px;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const StatLabel = styled.div`
  font-size: 16px;
  color: #666;
  font-weight: 600;
  margin-bottom: 4px;
`;

const StatSubtext = styled.div`
  font-size: 14px;
  color: #999;
`;

const StarRating = styled.div`
  display: flex;
  gap: 2px;
`;

const Star = styled.span`
  color: ${props => props.$filled ? '#ffc107' : '#e9ecef'};
  font-size: 16px;
`;


const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 16px;
  color: #666;
`;

const Feedbacks = () => {
  const { restaurant } = useRestaurant();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDay, setSelectedDay] = useState('today');
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [todayExpanded, setTodayExpanded] = useState(true);
  const [yesterdayExpanded, setYesterdayExpanded] = useState(false);
  const [last7DaysExpanded, setLast7DaysExpanded] = useState(false);
  const [last30DaysExpanded, setLast30DaysExpanded] = useState(false);
  const [allTimeExpanded, setAllTimeExpanded] = useState(false);
  const [stats, setStats] = useState({
    totalFeedbacks: 0,
    averageFoodRating: 0,
    averageServiceRating: 0,
    averageAtmosphereRating: 0,
    averageOverallRating: 0,
    todayFeedbacks: 0,
    weekFeedbacks: 0,
    monthFeedbacks: 0
  });
  const [responseText, setResponseText] = useState('');
  const [responding, setResponding] = useState(false);

  // Function to fetch order details
  const fetchOrderDetails = async (orderId) => {
    console.log('🔍 fetchOrderDetails called with orderId:', orderId);
    try {
      const response = await api.getOrderDetails(restaurant.id, orderId);
      console.log('🔍 Order details response:', response);
      
      // Orders API returns data directly, not wrapped in success object
      if (response && response.id) {
        setSelectedOrderDetails(response);
        console.log('🔍 Order details set:', response);
      } else {
        console.log('🔍 No order data found in response');
        setSelectedOrderDetails(null);
      }
    } catch (error) {
      console.error('Failed to fetch order details:', error);
      setSelectedOrderDetails(null);
    }
  };

  // Function to handle feedback selection
  const handleFeedbackSelection = (feedback) => {
    console.log('🔍 handleFeedbackSelection called with feedback:', feedback);
    setSelectedFeedback(feedback);
    setSelectedOrderDetails(null); // Reset order details
    
    // Fetch order details if feedback has an order_id
    if (feedback.order_id) {
      console.log('🔍 Feedback has order_id, fetching order details for:', feedback.order_id);
      fetchOrderDetails(feedback.order_id);
    } else {
      console.log('🔍 Feedback has no order_id, skipping order details fetch');
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  useEffect(() => {
    filterFeedbacksByDay();
  }, [selectedDay, feedbacks]);


  const fetchFeedbacks = async () => {
    if (!restaurant?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const [feedbacksResponse, statsResponse] = await Promise.all([
        api.getFeedbacks(restaurant.id),
        api.getFeedbackStats(restaurant.id)
      ]);
      
      if (feedbacksResponse.success) {
        setFeedbacks(feedbacksResponse.data);
      }
      
      if (statsResponse.success) {
        setStats(statsResponse.data);
      }
      
    } catch (err) {
      setError('Failed to load feedbacks. Please try again.');
      console.error('Error fetching feedbacks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResponseSubmit = async () => {
    if (!selectedFeedback || !responseText.trim()) return;
    
    try {
      setResponding(true);
      const response = await api.respondToFeedback(restaurant.id, selectedFeedback.id, responseText.trim());
      
      if (response.success) {
        // Update the selected feedback with the new response
        setSelectedFeedback(response.data);
        // Update the feedbacks list
        setFeedbacks(prev => prev.map(f => f.id === selectedFeedback.id ? response.data : f));
        setResponseText('');
        alert('Response sent successfully!');
      } else {
        alert('Failed to send response. Please try again.');
      }
    } catch (error) {
      console.error('Error sending response:', error);
      alert('Failed to send response. Please try again.');
    } finally {
      setResponding(false);
    }
  };

  const filterFeedbacksByDay = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    let filtered = [];
    
    switch (selectedDay) {
      case 'today':
        filtered = feedbacks.filter(feedback => {
          const feedbackDate = new Date(feedback.created_at);
          return feedbackDate.toDateString() === today.toDateString();
        });
        break;
      case 'yesterday':
        filtered = feedbacks.filter(feedback => {
          const feedbackDate = new Date(feedback.created_at);
          return feedbackDate.toDateString() === yesterday.toDateString();
        });
        break;
      case 'last7days':
        filtered = feedbacks.filter(feedback => {
          const feedbackDate = new Date(feedback.created_at);
          return feedbackDate >= lastWeek;
        });
        break;
      case 'last30days':
        filtered = feedbacks.filter(feedback => {
          const feedbackDate = new Date(feedback.created_at);
          return feedbackDate >= lastMonth;
        });
        break;
      default:
        filtered = feedbacks;
    }
    
    setFilteredFeedbacks(filtered);
    
    // Select first feedback if available
    if (filtered.length > 0 && !selectedFeedback) {
      setSelectedFeedback(filtered[0]);
    } else if (filtered.length === 0) {
      setSelectedFeedback(null);
    }
  };


  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} $filled={i < rating}>★</Star>
    ));
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTodayFeedbacks = () => {
    const today = new Date();
    return feedbacks.filter(feedback => {
      const feedbackDate = new Date(feedback.created_at);
      return feedbackDate.toDateString() === today.toDateString();
    });
  };

  const getYesterdayFeedbacks = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return feedbacks.filter(feedback => {
      const feedbackDate = new Date(feedback.created_at);
      return feedbackDate.toDateString() === yesterday.toDateString();
    });
  };

  const getPreviousDaysOptions = () => {
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    return [
      { value: 'last7days', label: 'Last 7 Days', date: `${formatDate(lastWeek)} - ${formatDate(today)}` },
      { value: 'last30days', label: 'Last 30 Days', date: `${formatDate(lastMonth)} - ${formatDate(today)}` },
      { value: 'all', label: 'All Time', date: 'All feedbacks' }
    ];
  };

  if (loading) {
    return (
      <FeedbacksContainer>
        <LoadingSpinner>Loading feedbacks...</LoadingSpinner>
      </FeedbacksContainer>
    );
  }

  const todayFeedbacks = getTodayFeedbacks();
  const yesterdayFeedbacks = getYesterdayFeedbacks();
  const last7DaysFeedbacks = feedbacks.filter(feedback => {
    const feedbackDate = new Date(feedback.created_at);
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    return feedbackDate >= lastWeek;
  });
  const last30DaysFeedbacks = feedbacks.filter(feedback => {
    const feedbackDate = new Date(feedback.created_at);
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    return feedbackDate >= lastMonth;
  });

  // Calculate average ratings from stats
  const averageFoodRating = Number(stats.averageFoodRating || 0).toFixed(1);
  const averageServiceRating = Number(stats.averageServiceRating || 0).toFixed(1);


  return (
    <FeedbacksContainer>
      <PageHeader>
        <HeaderLeft>
          <PageTitle>Customer Feedback</PageTitle>
          <FeedbackCount>
            {feedbacks.length} feedback{feedbacks.length !== 1 ? 's' : ''}
          </FeedbackCount>
        </HeaderLeft>
        
        <HeaderRight>
          <StatsCard $color="#ff6b6b">
            <StatsValue $color="#ff6b6b">
              {averageFoodRating}
            </StatsValue>
            <StatsLabel>Food Rating</StatsLabel>
          </StatsCard>
          
          <StatsCard $color="#4ecdc4">
            <StatsValue $color="#4ecdc4">
              {averageServiceRating}
            </StatsValue>
            <StatsLabel>Service Rating</StatsLabel>
          </StatsCard>
        </HeaderRight>
      </PageHeader>

      <MainContent>
        {/* Left Side - Feedback Sections (40%) */}
        <FeedbackSidebar>
          {/* Today Section */}
          <FeedbackSection>
            <SectionHeader onClick={() => setTodayExpanded(!todayExpanded)}>
              <SectionTitle>
                <SectionTitleText>📅 Today</SectionTitleText>
                <SectionFeedbackCount>{todayFeedbacks.length} feedback{todayFeedbacks.length !== 1 ? 's' : ''}</SectionFeedbackCount>
              </SectionTitle>
              <ChevronIcon $expanded={todayExpanded}>
                <FiChevronDown />
              </ChevronIcon>
            </SectionHeader>
            
            {todayExpanded && (
              <FeedbacksList>
                {todayFeedbacks.map((feedback) => (
                  <FeedbackPreview
                    key={feedback.id}
                    className={selectedFeedback?.id === feedback.id ? 'selected' : ''}
                    onClick={() => handleFeedbackSelection(feedback)}
                  >
                    <PreviewHeader>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <PreviewName>{feedback.customer_name}</PreviewName>
                        {feedback.order_number && (
                          <div style={{ 
                            fontSize: '12px', 
                            color: '#0ea5e9', 
                            fontWeight: '600',
                            background: '#f0f9ff',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            display: 'inline-block',
                            width: 'fit-content'
                          }}>
                            {feedback.order_number}
                          </div>
                        )}
                      </div>
                      <PreviewRating>
                        {renderStars(Math.round(parseFloat(feedback.overall_rating)))}
                      </PreviewRating>
                    </PreviewHeader>
                    <PreviewText>{feedback.feedback_text}</PreviewText>
                    <PreviewDate>
                      {new Date(feedback.created_at).toLocaleTimeString()}
                    </PreviewDate>
                  </FeedbackPreview>
                ))}
                {todayFeedbacks.length === 0 && (
                  <EmptySection>
                    <p>No feedbacks today</p>
                  </EmptySection>
                )}
              </FeedbacksList>
            )}
          </FeedbackSection>

          {/* Yesterday Section */}
          <FeedbackSection>
            <SectionHeader onClick={() => setYesterdayExpanded(!yesterdayExpanded)}>
              <SectionTitle>
                <SectionTitleText>📅 Yesterday</SectionTitleText>
                <SectionFeedbackCount>{yesterdayFeedbacks.length} feedback{yesterdayFeedbacks.length !== 1 ? 's' : ''}</SectionFeedbackCount>
              </SectionTitle>
              <ChevronIcon $expanded={yesterdayExpanded}>
                <FiChevronDown />
              </ChevronIcon>
            </SectionHeader>
            
            {yesterdayExpanded && (
              <FeedbacksList>
                {yesterdayFeedbacks.map((feedback) => (
                  <FeedbackPreview
                    key={feedback.id}
                    className={selectedFeedback?.id === feedback.id ? 'selected' : ''}
                    onClick={() => handleFeedbackSelection(feedback)}
                  >
                    <PreviewHeader>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <PreviewName>{feedback.customer_name}</PreviewName>
                        {feedback.order_number && (
                          <div style={{ 
                            fontSize: '12px', 
                            color: '#0ea5e9', 
                            fontWeight: '600',
                            background: '#f0f9ff',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            display: 'inline-block',
                            width: 'fit-content'
                          }}>
                            {feedback.order_number}
                          </div>
                        )}
                      </div>
                      <PreviewRating>
                        {renderStars(Math.round(parseFloat(feedback.overall_rating)))}
                      </PreviewRating>
                    </PreviewHeader>
                    <PreviewText>{feedback.feedback_text}</PreviewText>
                    <PreviewDate>
                      {new Date(feedback.created_at).toLocaleTimeString()}
                    </PreviewDate>
                  </FeedbackPreview>
                ))}
                {yesterdayFeedbacks.length === 0 && (
                  <EmptySection>
                    <p>No feedbacks yesterday</p>
                  </EmptySection>
                )}
              </FeedbacksList>
            )}
          </FeedbackSection>

          {/* Last 7 Days Section */}
          <FeedbackSection>
            <SectionHeader onClick={() => setLast7DaysExpanded(!last7DaysExpanded)}>
              <SectionTitle>
                <SectionTitleText>📅 Last 7 Days</SectionTitleText>
                <SectionFeedbackCount>{last7DaysFeedbacks.length} feedback{last7DaysFeedbacks.length !== 1 ? 's' : ''}</SectionFeedbackCount>
              </SectionTitle>
              <ChevronIcon $expanded={last7DaysExpanded}>
                <FiChevronDown />
              </ChevronIcon>
            </SectionHeader>
            
            {last7DaysExpanded && (
              <FeedbacksList>
                {last7DaysFeedbacks.map((feedback) => (
                  <FeedbackPreview
                    key={feedback.id}
                    className={selectedFeedback?.id === feedback.id ? 'selected' : ''}
                    onClick={() => handleFeedbackSelection(feedback)}
                  >
                    <PreviewHeader>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <PreviewName>{feedback.customer_name}</PreviewName>
                        {feedback.order_number && (
                          <div style={{ 
                            fontSize: '12px', 
                            color: '#0ea5e9', 
                            fontWeight: '600',
                            background: '#f0f9ff',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            display: 'inline-block',
                            width: 'fit-content'
                          }}>
                            {feedback.order_number}
                          </div>
                        )}
                      </div>
                      <PreviewRating>
                        {renderStars(Math.round(parseFloat(feedback.overall_rating)))}
                      </PreviewRating>
                    </PreviewHeader>
                    <PreviewText>{feedback.feedback_text}</PreviewText>
                    <PreviewDate>
                      {new Date(feedback.created_at).toLocaleDateString()}
                    </PreviewDate>
                  </FeedbackPreview>
                ))}
                {last7DaysFeedbacks.length === 0 && (
                  <EmptySection>
                    <p>No feedbacks in the last 7 days</p>
                  </EmptySection>
                )}
              </FeedbacksList>
            )}
          </FeedbackSection>

          {/* Last 30 Days Section */}
          <FeedbackSection>
            <SectionHeader onClick={() => setLast30DaysExpanded(!last30DaysExpanded)}>
              <SectionTitle>
                <SectionTitleText>📅 Last 30 Days</SectionTitleText>
                <SectionFeedbackCount>{last30DaysFeedbacks.length} feedback{last30DaysFeedbacks.length !== 1 ? 's' : ''}</SectionFeedbackCount>
              </SectionTitle>
              <ChevronIcon $expanded={last30DaysExpanded}>
                <FiChevronDown />
              </ChevronIcon>
            </SectionHeader>
            
            {last30DaysExpanded && (
              <FeedbacksList>
                {last30DaysFeedbacks.map((feedback) => (
                  <FeedbackPreview
                    key={feedback.id}
                    className={selectedFeedback?.id === feedback.id ? 'selected' : ''}
                    onClick={() => handleFeedbackSelection(feedback)}
                  >
                    <PreviewHeader>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <PreviewName>{feedback.customer_name}</PreviewName>
                        {feedback.order_number && (
                          <div style={{ 
                            fontSize: '12px', 
                            color: '#0ea5e9', 
                            fontWeight: '600',
                            background: '#f0f9ff',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            display: 'inline-block',
                            width: 'fit-content'
                          }}>
                            {feedback.order_number}
                          </div>
                        )}
                      </div>
                      <PreviewRating>
                        {renderStars(Math.round(parseFloat(feedback.overall_rating)))}
                      </PreviewRating>
                    </PreviewHeader>
                    <PreviewText>{feedback.feedback_text}</PreviewText>
                    <PreviewDate>
                      {new Date(feedback.created_at).toLocaleDateString()}
                    </PreviewDate>
                  </FeedbackPreview>
                ))}
                {last30DaysFeedbacks.length === 0 && (
                  <EmptySection>
                    <p>No feedbacks in the last 30 days</p>
                  </EmptySection>
                )}
              </FeedbacksList>
            )}
          </FeedbackSection>

          {/* All Time Section */}
          <FeedbackSection>
            <SectionHeader onClick={() => setAllTimeExpanded(!allTimeExpanded)}>
              <SectionTitle>
                <SectionTitleText>📅 All Time</SectionTitleText>
                <SectionFeedbackCount>{feedbacks.length} feedback{feedbacks.length !== 1 ? 's' : ''}</SectionFeedbackCount>
              </SectionTitle>
              <ChevronIcon $expanded={allTimeExpanded}>
                <FiChevronDown />
              </ChevronIcon>
            </SectionHeader>
            
            {allTimeExpanded && (
              <FeedbacksList>
                {feedbacks.map((feedback) => (
                  <FeedbackPreview
                    key={feedback.id}
                    className={selectedFeedback?.id === feedback.id ? 'selected' : ''}
                    onClick={() => handleFeedbackSelection(feedback)}
                  >
                    <PreviewHeader>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <PreviewName>{feedback.customer_name}</PreviewName>
                        {feedback.order_number && (
                          <div style={{ 
                            fontSize: '12px', 
                            color: '#0ea5e9', 
                            fontWeight: '600',
                            background: '#f0f9ff',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            display: 'inline-block',
                            width: 'fit-content'
                          }}>
                            {feedback.order_number}
                          </div>
                        )}
                      </div>
                      <PreviewRating>
                        {renderStars(Math.round(parseFloat(feedback.overall_rating)))}
                      </PreviewRating>
                    </PreviewHeader>
                    <PreviewText>{feedback.feedback_text}</PreviewText>
                    <PreviewDate>
                      {new Date(feedback.created_at).toLocaleDateString()}
                    </PreviewDate>
                  </FeedbackPreview>
                ))}
                {feedbacks.length === 0 && (
                  <EmptySection>
                    <p>No feedbacks yet</p>
                  </EmptySection>
                )}
              </FeedbacksList>
            )}
          </FeedbackSection>
        </FeedbackSidebar>

        {/* Right Side - Feedback Details (60%) */}
        <FeedbackDetailsPanel>
          {selectedFeedback ? (
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>{selectedFeedback.customer_name}</h2>
                  {selectedFeedback.order_id && (
                    <div style={{ 
                      marginTop: '8px', 
                      padding: '6px 12px', 
                      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', 
                      color: 'white', 
                      borderRadius: '20px', 
                      fontSize: '14px', 
                      fontWeight: '600',
                      display: 'inline-block'
                    }}>
                      📋 Order #{selectedFeedback.order_id}
                    </div>
                  )}
                  {!selectedFeedback.order_id && (
                    <div style={{ 
                      marginTop: '8px', 
                      padding: '6px 12px', 
                      background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)', 
                      color: 'white', 
                      borderRadius: '20px', 
                      fontSize: '14px', 
                      fontWeight: '600',
                      display: 'inline-block'
                    }}>
                      💬 General Feedback
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
                    {parseFloat(selectedFeedback.overall_rating).toFixed(1)}
                    <StarRating>
                      {renderStars(Math.round(parseFloat(selectedFeedback.overall_rating)))}
                    </StarRating>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <div style={{ 
                  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{ 
                    position: 'absolute', 
                    top: '0', 
                    left: '0', 
                    right: '0', 
                    height: '3px', 
                    background: 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)' 
                  }}></div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px', 
                    marginBottom: '12px' 
                  }}>
                    <div style={{ 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '50%', 
                      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}>
                      💬
                    </div>
                    <div>
                      <div style={{ 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        color: '#1e293b',
                        marginBottom: '2px'
                      }}>
                        Customer Feedback
                      </div>
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#64748b' 
                      }}>
                        {selectedFeedback.customer_name} • {new Date(selectedFeedback.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div style={{ 
                    color: '#1e293b', 
                    fontSize: '15px', 
                    lineHeight: '1.6',
                    fontStyle: 'italic',
                    paddingLeft: '44px'
                  }}>
                    "{selectedFeedback.feedback_text}"
                  </div>
                </div>

                {/* Order Items Section - Show if there's order data */}
                {(selectedFeedback.order_id || selectedFeedback.order_number || selectedFeedback.order_items) && (
                  <div style={{ 
                    marginTop: '24px', 
                    padding: '20px', 
                    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', 
                    borderRadius: '12px',
                    border: '1px solid #0ea5e9',
                    boxShadow: '0 2px 8px rgba(14, 165, 233, 0.1)'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      marginBottom: '16px',
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#0c4a6e'
                    }}>
                      🛒 Order Details
                      {selectedFeedback.order_number && (
                        <span style={{ 
                          background: '#0ea5e9', 
                          color: 'white', 
                          padding: '4px 8px', 
                          borderRadius: '6px', 
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {selectedFeedback.order_number}
                        </span>
                      )}
                    </div>
                    
                    {/* Use order_items from feedback data if available, otherwise fall back to selectedOrderDetails */}
                    {selectedFeedback.order_items && selectedFeedback.order_items.length > 0 ? (
                      <div>
                        {selectedFeedback.order_items.map((item, index) => (
                          <div key={index} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '12px 0',
                            borderBottom: index < selectedFeedback.order_items.length - 1 ? '1px solid #e0f2fe' : 'none'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{
                                background: '#0ea5e9',
                                color: 'white',
                                borderRadius: '12px',
                                padding: '4px 8px',
                                fontSize: '12px',
                                fontWeight: '600'
                              }}>
                                {item.quantity}x
                              </div>
                              <div>
                                <div style={{ fontWeight: '600', color: '#0c4a6e' }}>
                                  {item.name}
                                </div>
                                {item.notes && (
                                  <div style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>
                                    Note: {item.notes}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div style={{ fontWeight: '600', color: '#0c4a6e' }}>
                              ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        ))}
                        <div style={{
                          marginTop: '16px',
                          paddingTop: '16px',
                          borderTop: '2px solid #0ea5e9',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontWeight: '700',
                          fontSize: '16px',
                          color: '#0c4a6e'
                        }}>
                          <span>Total Items:</span>
                          <span>{selectedFeedback.order_items.length}</span>
                        </div>
                      </div>
                    ) : selectedOrderDetails ? (
                      <div>
                        {selectedOrderDetails.items && selectedOrderDetails.items.length > 0 ? (
                          <div>
                            {selectedOrderDetails.items.map((item, index) => (
                              <div key={index} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '12px 0',
                                borderBottom: index < selectedOrderDetails.items.length - 1 ? '1px solid #e0f2fe' : 'none'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <div style={{
                                    background: '#0ea5e9',
                                    color: 'white',
                                    borderRadius: '12px',
                                    padding: '4px 8px',
                                    fontSize: '12px',
                                    fontWeight: '600'
                                  }}>
                                    {item.quantity}x
                                  </div>
                                  <div>
                                    <div style={{ fontWeight: '600', color: '#0c4a6e' }}>
                                      {item.name}
                                    </div>
                                    {item.notes && (
                                      <div style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>
                                        Note: {item.notes}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div style={{ fontWeight: '600', color: '#0c4a6e' }}>
                                  ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                                </div>
                              </div>
                            ))}
                            <div style={{
                              marginTop: '16px',
                              paddingTop: '16px',
                              borderTop: '2px solid #0ea5e9',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              fontWeight: '700',
                              fontSize: '16px',
                              color: '#0c4a6e'
                            }}>
                              <span>Total:</span>
                              <span>${selectedOrderDetails.total_amount}</span>
                            </div>
                          </div>
                        ) : (
                          <div style={{ 
                            fontSize: '14px', 
                            color: '#64748b',
                            fontStyle: 'italic'
                          }}>
                            No items found for this order.
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ 
                        fontSize: '14px', 
                        color: '#64748b',
                        fontStyle: 'italic'
                      }}>
                        No order details available.
                      </div>
                    )}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px', marginTop: '24px' }}>
                  <div style={{ 
                    padding: '12px', 
                    background: 'linear-gradient(135deg, #f8f9fa 0%, #f1f3f4 100%)', 
                    borderRadius: '10px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      position: 'absolute', 
                      top: '0', 
                      left: '0', 
                      right: '0', 
                      height: '2px', 
                      background: 'linear-gradient(90deg, #6b7280 0%, #9ca3af 100%)' 
                    }}></div>
                    <div style={{ 
                      fontSize: '10px', 
                      color: '#6b7280', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.6px', 
                      marginBottom: '4px',
                      fontWeight: '600'
                    }}>Food Rating</div>
                    <div style={{ 
                      fontSize: '20px', 
                      color: '#374151', 
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span>
                        {selectedFeedback.food_rating ? selectedFeedback.food_rating.toFixed(1) : 'N/A'}
                        <span style={{ fontSize: '12px', color: '#9ca3af', marginLeft: '2px' }}>/5</span>
                      </span>
                      <StarRating style={{ gap: '1px' }}>
                        {renderStars(selectedFeedback.food_rating || 0)}
                      </StarRating>
                    </div>
                  </div>
                  
                  <div style={{ 
                    padding: '12px', 
                    background: 'linear-gradient(135deg, #f8f9fa 0%, #f1f3f4 100%)', 
                    borderRadius: '10px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      position: 'absolute', 
                      top: '0', 
                      left: '0', 
                      right: '0', 
                      height: '2px', 
                      background: 'linear-gradient(90deg, #6b7280 0%, #9ca3af 100%)' 
                    }}></div>
                    <div style={{ 
                      fontSize: '10px', 
                      color: '#6b7280', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.6px', 
                      marginBottom: '4px',
                      fontWeight: '600'
                    }}>Service Rating</div>
                    <div style={{ 
                      fontSize: '20px', 
                      color: '#374151', 
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span>
                        {selectedFeedback.service_rating ? selectedFeedback.service_rating.toFixed(1) : 'N/A'}
                        <span style={{ fontSize: '12px', color: '#9ca3af', marginLeft: '2px' }}>/5</span>
                      </span>
                      <StarRating style={{ gap: '1px' }}>
                        {renderStars(selectedFeedback.service_rating || 0)}
                      </StarRating>
                    </div>
                  </div>
                  
                  <div style={{ 
                    padding: '12px', 
                    background: 'linear-gradient(135deg, #f8f9fa 0%, #f1f3f4 100%)', 
                    borderRadius: '10px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      position: 'absolute', 
                      top: '0', 
                      left: '0', 
                      right: '0', 
                      height: '2px', 
                      background: 'linear-gradient(90deg, #6b7280 0%, #9ca3af 100%)' 
                    }}></div>
                    <div style={{ 
                      fontSize: '10px', 
                      color: '#6b7280', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.6px', 
                      marginBottom: '4px',
                      fontWeight: '600'
                    }}>Atmosphere Rating</div>
                    <div style={{ 
                      fontSize: '20px', 
                      color: '#374151', 
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span>
                        {selectedFeedback.atmosphere_rating ? selectedFeedback.atmosphere_rating.toFixed(1) : 'N/A'}
                        <span style={{ fontSize: '12px', color: '#9ca3af', marginLeft: '2px' }}>/5</span>
                      </span>
                      <StarRating style={{ gap: '1px' }}>
                        {renderStars(selectedFeedback.atmosphere_rating || 0)}
                      </StarRating>
                    </div>
                  </div>
                </div>

                {selectedFeedback.response_text && (
                  <div style={{ 
                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', 
                    borderRadius: '12px', 
                    padding: '16px', 
                    marginTop: '20px', 
                    borderLeft: '4px solid #3b82f6',
                    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.1)'
                  }}>
                    <div style={{ 
                      color: '#1e293b', 
                      fontSize: '15px', 
                      marginBottom: '8px',
                      fontWeight: '500'
                    }}>
                      <strong>Restaurant Response:</strong> {selectedFeedback.response_text}
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#64748b', 
                      fontStyle: 'italic' 
                    }}>
                      Responded on {new Date(selectedFeedback.response_date).toLocaleDateString()}
                    </div>
                  </div>
                )}

                {/* Respond Section */}
                <div style={{ 
                  marginTop: '24px', 
                  padding: '20px', 
                  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', 
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px', 
                    marginBottom: '16px' 
                  }}>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '50%', 
                      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '18px'
                    }}>
                      💬
                    </div>
                    <div>
                      <div style={{ 
                        fontSize: '16px', 
                        fontWeight: '600', 
                        color: '#1e293b',
                        marginBottom: '2px'
                      }}>
                        Respond to Customer
                      </div>
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#64748b' 
                      }}>
                        Leave a response for {selectedFeedback.customer_name}
                      </div>
                    </div>
                  </div>
                  
                                           <div style={{ 
                           display: 'flex', 
                           gap: '12px', 
                           alignItems: 'flex-end' 
                         }}>
                           <div style={{ flex: 1 }}>
                             <textarea
                               placeholder="Write your response to the customer..."
                               value={responseText}
                               onChange={(e) => setResponseText(e.target.value)}
                               style={{
                                 width: '100%',
                                 minHeight: '80px',
                                 padding: '12px',
                                 border: '1px solid #d1d5db',
                                 borderRadius: '8px',
                                 fontSize: '14px',
                                 fontFamily: 'inherit',
                                 resize: 'vertical',
                                 outline: 'none',
                                 transition: 'border-color 0.2s ease'
                               }}
                               onFocus={(e) => {
                                 e.target.style.borderColor = '#3b82f6';
                                 e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                               }}
                               onBlur={(e) => {
                                 e.target.style.borderColor = '#d1d5db';
                                 e.target.style.boxShadow = 'none';
                               }}
                             />
                           </div>
                           <button
                             onClick={handleResponseSubmit}
                             disabled={responding || !responseText.trim()}
                             style={{
                               padding: '12px 24px',
                               background: responding || !responseText.trim() 
                                 ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
                                 : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                               color: 'white',
                               border: 'none',
                               borderRadius: '8px',
                               fontSize: '14px',
                               fontWeight: '600',
                               cursor: responding || !responseText.trim() ? 'not-allowed' : 'pointer',
                               display: 'flex',
                               alignItems: 'center',
                               gap: '8px',
                               transition: 'all 0.2s ease',
                               boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)',
                               opacity: responding || !responseText.trim() ? 0.6 : 1
                             }}
                             onMouseEnter={(e) => {
                               if (!responding && responseText.trim()) {
                                 e.target.style.transform = 'translateY(-1px)';
                                 e.target.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.3)';
                               }
                             }}
                             onMouseLeave={(e) => {
                               e.target.style.transform = 'translateY(0)';
                               e.target.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.2)';
                             }}
                           >
                             <FiMessageSquare size={16} />
                             {responding ? 'Sending...' : 'Send Response'}
                           </button>
                         </div>
                </div>

              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px', opacity: '0.5' }}>📝</div>
              <div style={{ fontSize: '16px', marginBottom: '8px' }}>No feedback selected</div>
              <div style={{ fontSize: '14px', color: '#94a3b8' }}>Choose a feedback from the sidebar to view details</div>
            </div>
          )}
        </FeedbackDetailsPanel>
      </MainContent>
    </FeedbacksContainer>
  );
};

export default Feedbacks;
