import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiCalendar, FiClock, FiUsers, FiPhone, FiMail, FiMapPin, FiCheck, FiX, FiEdit, FiEye, FiChevronLeft, FiChevronRight, FiRefreshCw } from 'react-icons/fi';
import api from '../services/api';
import socketService from '../services/socket';
import { debugRestaurantContext, setTestRestaurantContext } from '../utils/debugRestaurant';
import { setupTestContext } from '../utils/setupTestContext';
import { setupDevAuth } from '../utils/devAuth';

const ReservationsContainer = styled.div`
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

const ReservationCount = styled.div`
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
`;

const HeaderRight = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #2563eb;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    width: 16px;
    height: 16px;
  }
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

const ReservationSidebar = styled.div`
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

const ReservationDetailsPanel = styled.div`
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

const ReservationsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 0;
  padding: 8px 16px 16px 16px;
  box-sizing: border-box;
`;

const ReservationSection = styled.div`
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
  gap: 2px;
`;

const SectionTitleText = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: 0.025em;
  text-transform: uppercase;
`;

const SectionReservationCount = styled.div`
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
  background: #e2e8f0;
  padding: 2px 8px;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.025em;
`;

const ReservationSectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
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

const ReservationPreview = styled.div`
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
  position: relative;
  border-left: 6px solid ${props => {
    switch (props.$status) {
      case 'pending': return '#ffc107';
      case 'confirmed': return '#28a745';
      case 'started': return '#17a2b8';
      case 'completed': return '#6c757d';
      case 'cancelled': return '#dc3545';
      default: return '#e0e0e0';
    }
  }};
  
  &:hover {
    border-color: #667eea;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
    transform: translateY(-1px);
  }
  
  &.selected {
    border-color: #667eea;
    background: #f8f9ff;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
  }
`;

const PreviewName = styled.div`
  font-weight: 600;
  color: #333;
  font-size: 14px;
  margin-bottom: 6px;
`;

const PreviewDate = styled.div`
  color: #666;
  font-size: 12px;
  margin-bottom: 4px;
`;

const PreviewPeople = styled.div`
  color: #888;
  font-size: 11px;
  font-weight: 500;
`;

const StatusIndicator = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => {
    switch (props.$status) {
      case 'pending': return '#ffc107';
      case 'confirmed': return '#28a745';
      case 'started': return '#17a2b8';
      case 'completed': return '#6c757d';
      case 'cancelled': return '#dc3545';
      default: return '#e0e0e0';
    }
  }};
  box-shadow: 0 0 0 2px white, 0 0 0 3px ${props => {
    switch (props.$status) {
      case 'pending': return '#ffc107';
      case 'confirmed': return '#28a745';
      case 'started': return '#17a2b8';
      case 'completed': return '#6c757d';
      case 'cancelled': return '#dc3545';
      default: return '#e0e0e0';
    }
  }}20;
`;

const StatusText = styled.div`
  color: ${props => {
    switch (props.$status) {
      case 'pending': return '#856404';
      case 'confirmed': return '#155724';
      case 'started': return '#0c5460';
      case 'completed': return '#6c757d';
      case 'cancelled': return '#721c24';
      default: return '#6c757d';
    }
  }};
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 4px;
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

const ReservationDetails = styled.div`
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
  
  &.danger {
    background: #dc3545;
    color: white;
    border-color: #dc3545;
    
    &:hover {
      background: #c82333;
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

// Date Selection Components
const DateSelectionContainer = styled.div`
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
`;

const DateSelectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const DateSelectionTitle = styled.h3`
  margin: 0;
  color: #333;
  font-size: 16px;
  font-weight: 600;
`;

const DateNavigation = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px 12px 0 0;
  }
`;

const DateNavButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  color: #667eea;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.1), transparent);
    transition: left 0.5s;
  }
  
  &:hover {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-color: #667eea;
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(-1px) scale(1.02);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);
  }
  
  svg {
    transition: transform 0.2s ease;
  }
  
  &:hover svg {
    transform: scale(1.1);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const CurrentDateDisplay = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 120px;
`;

const DateText = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 2px;
`;

const DayText = styled.div`
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const DateInput = styled.input`
  padding: 14px 18px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  flex: 1;
  min-width: 180px;
  background: white;
  color: #1e293b;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  cursor: pointer;
  
  &::placeholder {
    color: #94a3b8;
    font-weight: 400;
  }
  
  &:focus {
    outline: none;
    border-color: #667eea;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1), 0 4px 12px rgba(102, 126, 234, 0.15);
    transform: translateY(-1px);
    cursor: text;
  }
  
  &:hover {
    border-color: #cbd5e1;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    cursor: pointer;
  }
`;

const CardsRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
  align-items: stretch;
`;

const ToggleCard = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
  display: inline-block;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  }
`;

const ToggleLabel = styled.label`
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  user-select: none;
  width: 100%;
`;

const ToggleInput = styled.input`
  display: none;
`;

const ToggleSlider = styled.div`
  position: relative;
  width: 50px;
  height: 24px;
  background: #e2e8f0;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &::before {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  ${ToggleInput}:checked + & {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    
    &::before {
      transform: translateX(26px);
      box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
    }
  }
`;

const ToggleText = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  transition: color 0.2s ease;
  
  ${ToggleInput}:checked ~ & {
    color: #667eea;
  }
`;

const ShowAllToggle = styled.div`
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #d1d5db;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

const FiltersContainer = styled.div`
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const FilterRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: stretch;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FilterLabel = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const FilterInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  min-width: 150px;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
  }
`;

const FilterSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  min-width: 150px;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 16px;
  color: #666;
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #f5c6cb;
`;

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    // Create today's date in local timezone to avoid timezone issues
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate());
  }); // Show today's reservations by default
  const [showAllReservations, setShowAllReservations] = useState(false); // Toggle for showing all reservations
  const [autoAcceptOrders, setAutoAcceptOrders] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    pending: 0,
    started: 0,
    cancelled: 0,
    completed: 0
  });

  // Filter reservations based on current filters and selected date
  const filteredReservations = reservations.filter(reservation => {
    // Special logic for pending reservations - they should always show on current day
    const today = new Date().toISOString().split('T')[0];
    const isPending = reservation.status === 'pending';
    
    let matchesDate;
    if (showAllReservations) {
      // Show all reservations when toggle is on
      matchesDate = true;
    } else if (isPending) {
      // Pending reservations always show on current day, regardless of selected date
      matchesDate = selectedDate.toISOString().split('T')[0] === today;
    } else {
      // Confirmed/completed/cancelled reservations show on their actual date
      matchesDate = reservation.reservation_date.startsWith(selectedDate.toISOString().split('T')[0]);
    }
    
    const matchesStatus = !filters.status || reservation.status === filters.status;
    const matchesSearch = !filters.search || 
      reservation.customer_name.toLowerCase().includes(filters.search.toLowerCase()) ||
      reservation.customer_email.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesDate && matchesStatus && matchesSearch;
  });

  // Debug filtering
  const today = new Date().toISOString().split('T')[0];
  const pendingReservations = reservations.filter(r => r.status === 'pending');
  const confirmedReservations = reservations.filter(r => r.status !== 'pending');
  
  console.log('🔍 Filtering Debug:', {
    totalReservations: reservations.length,
    selectedDate: selectedDate ? selectedDate.toISOString().split('T')[0] : 'All',
    showAllReservations: showAllReservations,
    today: today,
    pendingCount: pendingReservations.length,
    confirmedCount: confirmedReservations.length,
    filteredCount: filteredReservations.length,
    logic: showAllReservations ? 'Show all reservations' : 'Pending on current day, confirmed on actual date',
    sampleReservation: reservations[0] ? {
      id: reservations[0].id,
      customer_name: reservations[0].customer_name,
      reservation_date: reservations[0].reservation_date,
      status: reservations[0].status,
      willShowOn: showAllReservations ? 'All' : (reservations[0].status === 'pending' ? 'Current Day' : 'Actual Date')
    } : null
  });

  useEffect(() => {
    // Debug restaurant context
    debugRestaurantContext();
    
    // Set up development authentication and context
    setupDevAuth();
    
    fetchReservations();
  }, [filters, selectedDate]);

  // Socket.IO real-time updates
  useEffect(() => {
    // Connect to socket
    const socket = socketService.connect();
    
    if (socket) {
      // Listen for new reservations
      socketService.onReservationCreated((newReservation) => {
        console.log('New reservation received:', newReservation);
        setReservations(prevReservations => {
          // Check if reservation already exists to avoid duplicates
          const exists = prevReservations.some(r => r.id === newReservation.id);
          if (!exists) {
            return [newReservation, ...prevReservations];
          }
          return prevReservations;
        });
      });

      // Listen for reservation updates
      socketService.onReservationUpdated((updatedReservation) => {
        console.log('Reservation updated:', updatedReservation);
        setReservations(prevReservations => 
          prevReservations.map(r => 
            r.id === updatedReservation.id ? updatedReservation : r
          )
        );
      });
    }

    // Cleanup on unmount
    return () => {
      socketService.removeReservationListeners();
    };
  }, []);

  useEffect(() => {
    // Select first reservation if available
    if (filteredReservations.length > 0 && !selectedReservation) {
      setSelectedReservation(filteredReservations[0]);
    }
  }, [filteredReservations, selectedReservation]);

  // Separate useEffect for auto-accept functionality
  useEffect(() => {
    if (autoAcceptOrders && reservations.length > 0) {
      const pendingReservations = reservations.filter(r => r.status === 'pending');
      if (pendingReservations.length > 0) {
        console.log('🔄 Auto-accepting reservations:', pendingReservations.length);
        // Simulate auto-accepting after a short delay
        const timeoutId = setTimeout(() => {
          // Auto-accept each pending reservation by calling handleStatusChange
          pendingReservations.forEach((reservation, index) => {
            setTimeout(() => {
              console.log(`✅ Auto-accepting reservation ${reservation.id} (${reservation.customer_name})`);
              handleStatusChange(reservation.id, 'confirmed');
            }, index * 500); // Stagger the updates by 500ms each
          });
        }, 1000); // 1 second delay to show the auto-accept in action

        // Cleanup timeout on unmount or dependency change
        return () => clearTimeout(timeoutId);
      }
    }
  }, [autoAcceptOrders, reservations.length]); // Run when autoAcceptOrders changes or reservations change

  // Date navigation functions
  const goToPreviousDay = () => {
    const baseDate = selectedDate || new Date();
    const newDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const goToNextDay = () => {
    const baseDate = selectedDate || new Date();
    const newDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const toggleShowAllReservations = () => {
    setShowAllReservations(!showAllReservations);
  };

  const handleDateChange = (e) => {
    // Create date in local timezone to avoid timezone issues
    const dateString = e.target.value; // Format: YYYY-MM-DD
    const [year, month, day] = dateString.split('-').map(Number);
    const localDate = new Date(year, month - 1, day); // month is 0-indexed
    setSelectedDate(localDate);
  };

  // Format date for display
  const formatDate = (date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateShort = (date) => {
    if (!date) return 'All Dates';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateForInput = (date) => {
    if (!date) return '';
    // Format date in local timezone to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching reservations...');
      console.log('🔍 Current restaurant context:', {
        restaurantId: localStorage.getItem('restaurantId'),
        currentRestaurant: localStorage.getItem('currentRestaurant')
      });
      
      // Get reservations from API
      const reservationsData = await api.getReservations() || [];
      
      console.log('📊 Reservations fetched:', reservationsData.length, reservationsData);
      console.log('📊 API Response details:', {
        isArray: Array.isArray(reservationsData),
        firstItem: reservationsData[0],
        sampleData: reservationsData.slice(0, 3)
      });

      // Calculate stats
      const total = reservationsData.length;
      const confirmed = reservationsData.filter(r => r.status === 'confirmed').length;
      const pending = reservationsData.filter(r => r.status === 'pending').length;
      const started = reservationsData.filter(r => r.status === 'started').length;
      const cancelled = reservationsData.filter(r => r.status === 'cancelled').length;
      const completed = reservationsData.filter(r => r.status === 'completed').length;

      console.log('📊 Calculated stats:', { total, confirmed, pending, started, cancelled, completed });

      setStats({ total, confirmed, pending, started, cancelled, completed });
      setReservations(reservationsData);
    } catch (err) {
      setError('Failed to load reservations. Please try again.');
      console.error('Error fetching reservations:', err);
      console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        response: err.response
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (reservationId, newStatus) => {
    try {
      // Call the API to update the status
      await api.updateReservationStatus(reservationId, newStatus);
      
      // Update local state and recalculate stats
      setReservations(prevReservations => {
        const updatedReservations = prevReservations.map(res => 
        res.id === reservationId 
          ? { ...res, status: newStatus }
          : res
      );
      
      const total = updatedReservations.length;
      const confirmed = updatedReservations.filter(r => r.status === 'confirmed').length;
      const pending = updatedReservations.filter(r => r.status === 'pending').length;
        const started = updatedReservations.filter(r => r.status === 'started').length;
      const cancelled = updatedReservations.filter(r => r.status === 'cancelled').length;
      const completed = updatedReservations.filter(r => r.status === 'completed').length;

        setStats({ total, confirmed, pending, started, cancelled, completed });
        
        return updatedReservations;
      });
      
      // Update selected reservation if it's the one being changed
      if (selectedReservation?.id === reservationId) {
        setSelectedReservation(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error('Error updating reservation status:', err);
      setError('Failed to update reservation status. Please try again.');
    }
  };

  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case 'pending': return 'confirmed';
      case 'confirmed': return 'started';
      case 'started': return 'completed';
      case 'completed': return 'completed'; // No further action
      case 'cancelled': return 'cancelled'; // No further action
      default: return 'confirmed';
    }
  };

  const getButtonText = (status) => {
    switch (status) {
      case 'pending': return 'Confirm';
      case 'confirmed': return 'Start';
      case 'started': return 'Finish';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return 'Confirm';
    }
  };

  const getButtonColor = (status) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'confirmed': return '#28a745';
      case 'started': return '#17a2b8';
      case 'completed': return '#6c757d';
      case 'cancelled': return '#dc3545';
      default: return '#ffc107';
    }
  };

  if (loading) {
    return (
      <ReservationsContainer>
        <LoadingSpinner>Loading reservations...</LoadingSpinner>
      </ReservationsContainer>
    );
  }

  return (
    <ReservationsContainer>
      <PageHeader>
        <HeaderLeft>
          <PageTitle>Reservations</PageTitle>
        </HeaderLeft>
        
        <HeaderRight>
          <RefreshButton onClick={fetchReservations}>
            <FiRefreshCw />
            Refresh
          </RefreshButton>
          <ToggleCard>
            <ToggleLabel>
              <ToggleText>Auto Accept Reservations</ToggleText>
              <ToggleInput
                type="checkbox"
                checked={autoAcceptOrders}
                onChange={(e) => setAutoAcceptOrders(e.target.checked)}
              />
              <ToggleSlider />
            </ToggleLabel>
          </ToggleCard>
        </HeaderRight>
      </PageHeader>

      <MainContent>
        {/* Left Side - Reservation List (40%) */}
        <ReservationSidebar>
      {/* Date Selection Component */}
      <DateSelectionContainer>
        <DateSelectionHeader>
          <DateSelectionTitle>Select Date</DateSelectionTitle>
          <CurrentDateDisplay>
            <DateText>{formatDateShort(selectedDate)}</DateText>
            <DayText>{selectedDate ? selectedDate.toLocaleDateString('en-US', { weekday: 'long' }) : 'All Reservations'}</DayText>
          </CurrentDateDisplay>
        </DateSelectionHeader>
        
        <CardsRow>
            <DateNavigation>
              <DateNavButton onClick={goToPreviousDay} title="Previous Day">
                <FiChevronLeft size={20} />
              </DateNavButton>
              
              <DateInput
                type="date"
                value={formatDateForInput(selectedDate)}
                onChange={handleDateChange}
              />
              
              <DateNavButton onClick={goToNextDay} title="Next Day">
                <FiChevronRight size={20} />
              </DateNavButton>
            </DateNavigation>
            
            <ShowAllToggle>
              <ToggleLabel>
                <ToggleText>Show All Reservations</ToggleText>
                <ToggleInput
                  type="checkbox"
                  checked={showAllReservations}
                  onChange={toggleShowAllReservations}
                />
                <ToggleSlider />
              </ToggleLabel>
            </ShowAllToggle>
              
        </CardsRow>
      </DateSelectionContainer>


          {/* New Reservations (Pending) - Only show if there are pending reservations */}
          {filteredReservations.filter(r => r.status === 'pending').length > 0 && (
            <ReservationSection>
              <ReservationSectionHeader>
                <SectionTitle>
                  <SectionTitleText>New Reservations</SectionTitleText>
                </SectionTitle>
              </ReservationSectionHeader>
              
              <ReservationsList>
                {filteredReservations.filter(r => r.status === 'pending').map((reservation) => (
                  <ReservationPreview
                    key={reservation.id}
                    $status={reservation.status}
                    className={selectedReservation?.id === reservation.id ? 'selected' : ''}
                    onClick={() => setSelectedReservation(reservation)}
                  >
                    <StatusIndicator $status={reservation.status} />
                    <PreviewName>{reservation.customer_name}</PreviewName>
                    <PreviewDate>
                      {formatDate(reservation.reservation_date)} at {reservation.reservation_time}
                    </PreviewDate>
                    <PreviewPeople>
                      {reservation.party_size} people
                    </PreviewPeople>
                    <StatusText $status={reservation.status}>
                      {reservation.status}
                    </StatusText>
                  </ReservationPreview>
                ))}
              </ReservationsList>
            </ReservationSection>
          )}

          {/* Active Reservations (Confirmed & Started) - Only show if there are active reservations */}
          {filteredReservations.filter(r => r.status === 'confirmed' || r.status === 'started').length > 0 && (
            <ReservationSection>
              <ReservationSectionHeader>
                <SectionTitle>
                  <SectionTitleText>Active Reservations</SectionTitleText>
                </SectionTitle>
              </ReservationSectionHeader>
              
              <ReservationsList>
                {filteredReservations.filter(r => r.status === 'confirmed' || r.status === 'started').map((reservation) => (
                  <ReservationPreview
                    key={reservation.id}
                    $status={reservation.status}
                    className={selectedReservation?.id === reservation.id ? 'selected' : ''}
                    onClick={() => setSelectedReservation(reservation)}
                  >
                    <StatusIndicator $status={reservation.status} />
                    <PreviewName>{reservation.customer_name}</PreviewName>
                    <PreviewDate>
                      {formatDate(reservation.reservation_date)} at {reservation.reservation_time}
                    </PreviewDate>
                    <PreviewPeople>
                      {reservation.party_size} people
                    </PreviewPeople>
                    <StatusText $status={reservation.status}>
                      {reservation.status}
                    </StatusText>
                  </ReservationPreview>
                ))}
              </ReservationsList>
            </ReservationSection>
          )}

          {/* Completed Reservations - Only show if there are completed reservations */}
          {filteredReservations.filter(r => r.status === 'completed').length > 0 && (
            <ReservationSection>
              <ReservationSectionHeader>
                <SectionTitle>
                  <SectionTitleText>Completed</SectionTitleText>
                </SectionTitle>
              </ReservationSectionHeader>
              
              <ReservationsList>
                {filteredReservations.filter(r => r.status === 'completed').map((reservation) => (
                  <ReservationPreview
                    key={reservation.id}
                    $status={reservation.status}
                    className={selectedReservation?.id === reservation.id ? 'selected' : ''}
                    onClick={() => setSelectedReservation(reservation)}
                  >
                    <StatusIndicator $status={reservation.status} />
                    <PreviewName>{reservation.customer_name}</PreviewName>
                    <PreviewDate>
                      {formatDate(reservation.reservation_date)} at {reservation.reservation_time}
                    </PreviewDate>
                    <PreviewPeople>
                      {reservation.party_size} people
                    </PreviewPeople>
                    <StatusText $status={reservation.status}>
                      {reservation.status}
                    </StatusText>
                  </ReservationPreview>
                ))}
              </ReservationsList>
            </ReservationSection>
          )}

          {/* Cancelled Reservations - Only show if there are cancelled reservations */}
          {filteredReservations.filter(r => r.status === 'cancelled').length > 0 && (
            <ReservationSection>
              <ReservationSectionHeader>
                <SectionTitle>
                  <SectionTitleText>Cancelled</SectionTitleText>
                </SectionTitle>
              </ReservationSectionHeader>
              
              <ReservationsList>
                {filteredReservations.filter(r => r.status === 'cancelled').map((reservation) => (
                  <ReservationPreview
                    key={reservation.id}
                    $status={reservation.status}
                    className={selectedReservation?.id === reservation.id ? 'selected' : ''}
                    onClick={() => setSelectedReservation(reservation)}
                  >
                    <StatusIndicator $status={reservation.status} />
                    <PreviewName>{reservation.customer_name}</PreviewName>
                    <PreviewDate>
                      {formatDate(reservation.reservation_date)} at {reservation.reservation_time}
                    </PreviewDate>
                    <PreviewPeople>
                      {reservation.party_size} people
                    </PreviewPeople>
                    <StatusText $status={reservation.status}>
              {reservation.status}
                    </StatusText>
                  </ReservationPreview>
                ))}
              </ReservationsList>
            </ReservationSection>
          )}
        </ReservationSidebar>

        {/* Right Side - Reservation Details (60%) */}
        <ReservationDetailsPanel>
          {selectedReservation ? (
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>{selectedReservation.customer_name}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    padding: '6px 12px', 
                    borderRadius: '4px', 
                    fontSize: '12px', 
                    fontWeight: '600', 
                    textTransform: 'uppercase',
                    background: selectedReservation.status === 'confirmed' ? '#d4edda' : 
                               selectedReservation.status === 'pending' ? '#fff3cd' : 
                               selectedReservation.status === 'cancelled' ? '#f8d7da' : '#d1ecf1',
                    color: selectedReservation.status === 'confirmed' ? '#155724' : 
                           selectedReservation.status === 'pending' ? '#856404' : 
                           selectedReservation.status === 'cancelled' ? '#721c24' : '#0c5460'
                  }}>
                    {selectedReservation.status}
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
                      📅
                    </div>
                    <div>
                      <div style={{ 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        color: '#1e293b',
                        marginBottom: '2px'
                      }}>
                        Reservation Details
                      </div>
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#64748b' 
                      }}>
                        {selectedReservation.customer_name} • {formatDate(selectedReservation.reservation_date)}
                      </div>
                    </div>
                  </div>
                  <div style={{ 
                    color: '#1e293b', 
                    fontSize: '15px', 
                    lineHeight: '1.6',
                    paddingLeft: '44px'
                  }}>
                    <strong>Date:</strong> {selectedReservation.reservation_date}<br/>
                    <strong>Time:</strong> {selectedReservation.reservation_time}<br/>
                    <strong>Party Size:</strong> {selectedReservation.party_size} people<br/>
                    <strong>Table:</strong> {selectedReservation.table_number || 'TBD'}
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px', marginTop: '24px' }}>
                  <div style={{ 
                    padding: '12px', 
                    background: 'linear-gradient(135deg, #f8f9fa 0%, #f1f3f4 100%)', 
                    borderRadius: '10px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)'
                  }}>
                    <div style={{ 
                      fontSize: '10px', 
                      color: '#6b7280', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.6px', 
                      marginBottom: '4px',
                      fontWeight: '600'
                    }}>Contact Information</div>
                    <div style={{ 
                      fontSize: '14px', 
                      color: '#374151', 
                      fontWeight: '600',
                      lineHeight: '1.4'
                    }}>
                      <div>📧 {selectedReservation.customer_email}</div>
                      <div>📞 {selectedReservation.customer_phone}</div>
                    </div>
                  </div>
                  
                  <div style={{ 
                    padding: '12px', 
                    background: 'linear-gradient(135deg, #f8f9fa 0%, #f1f3f4 100%)', 
                    borderRadius: '10px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)'
                  }}>
                    <div style={{ 
                      fontSize: '10px', 
                      color: '#6b7280', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.6px', 
                      marginBottom: '4px',
                      fontWeight: '600'
                    }}>Reservation Info</div>
                    <div style={{ 
                      fontSize: '14px', 
                      color: '#374151', 
                      fontWeight: '600',
                      lineHeight: '1.4'
                    }}>
                      <div>👥 {selectedReservation.party_size} people</div>
                      <div>🪑 Table {selectedReservation.table_number || 'TBD'}</div>
                    </div>
                  </div>
                </div>

                {selectedReservation.special_requests && (
                  <div style={{ 
                    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', 
                    borderRadius: '12px', 
                    padding: '16px', 
                    marginTop: '20px', 
                    borderLeft: '4px solid #f59e0b',
                    boxShadow: '0 2px 8px rgba(245, 158, 11, 0.1)'
                  }}>
                    <div style={{ 
                      color: '#92400e', 
                      fontSize: '15px', 
                      marginBottom: '8px',
                      fontWeight: '500'
                    }}>
                      <strong>Special Requests:</strong> {selectedReservation.special_requests}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ 
                  marginTop: '24px', 
                  padding: '20px', 
                  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', 
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    gap: '12px', 
                    alignItems: 'center' 
                  }}>
                    {selectedReservation.status !== 'completed' && selectedReservation.status !== 'cancelled' && (
                      <button
                        onClick={() => handleStatusChange(selectedReservation.id, getNextStatus(selectedReservation.status))}
                        style={{
                          padding: '10px 20px',
                          background: getButtonColor(selectedReservation.status),
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <FiCheck size={16} />
                        {getButtonText(selectedReservation.status)}
                      </button>
                    )}
                    {(selectedReservation.status === 'completed' || selectedReservation.status === 'cancelled') && (
                      <button
                        disabled
                        style={{
                          padding: '10px 20px',
                          background: getButtonColor(selectedReservation.status),
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'not-allowed',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          transition: 'all 0.2s ease',
                          opacity: 0.7
                        }}
                      >
                        <FiCheck size={16} />
                        {getButtonText(selectedReservation.status)}
                      </button>
                    )}
                    {selectedReservation.status !== 'completed' && selectedReservation.status !== 'cancelled' && (
                      <button
                        onClick={() => handleStatusChange(selectedReservation.id, 'cancelled')}
                        style={{
                          padding: '10px 20px',
                          background: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <FiX size={16} />
                Cancel
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px', opacity: '0.5' }}>📅</div>
              <div style={{ fontSize: '16px', marginBottom: '8px' }}>No reservation selected</div>
              <div style={{ fontSize: '14px', color: '#94a3b8' }}>Choose a reservation from the sidebar to view details</div>
            </div>
          )}
        </ReservationDetailsPanel>
      </MainContent>
    </ReservationsContainer>
  );
};

export default Reservations;
