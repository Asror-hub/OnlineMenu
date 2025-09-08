import React, { useState, useEffect } from 'react';
import { FiEye, FiCheck, FiX, FiClock, FiVolume2, FiVolumeX, FiRefreshCw, FiChevronDown } from 'react-icons/fi';
import styled, { keyframes, css } from 'styled-components';
import api from '../services/api';
import socketService from '../services/socket';
import notificationService from '../utils/notifications';
import { useRestaurant } from '../contexts/RestaurantContext';

// Keyframes
const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(40, 167, 69, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(40, 167, 69, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(40, 167, 69, 0);
  }
`;

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const slideInDown = keyframes`
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
`;

const persistentPulse = keyframes`
  0%, 100% {
    box-shadow: 0 8px 25px rgba(220, 53, 69, 0.3);
  }
  50% {
    box-shadow: 0 8px 25px rgba(220, 53, 69, 0.6);
  }
`;

const newOrderPulse = keyframes`
  0%, 100% {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
  50% {
    box-shadow: 0 0 20px rgba(40, 167, 69, 0.4), 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
`;

// Styled Components
const OrderManagementContainer = styled.div`
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
  color: #1e293b;
  font-size: 2.25rem;
  font-weight: 800;
  background: linear-gradient(135deg, #1e293b 0%, #475569 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.025em;
`;

const OrderCount = styled.span`
  color: #64748b;
  font-size: 1.1rem;
  font-weight: 600;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid #cbd5e1;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const HeaderControls = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #f8fafc;
  padding: 12px 20px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const ConnectionStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 8px 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const StatusDot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  animation: ${pulse} 2s infinite;
  box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.1);
  background: ${props => props.$connected ? '#28a745' : '#dc3545'};
`;

const StatusText = styled.span`
  color: #6c757d;
  font-weight: 500;
`;

const AudioStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f8f9fa;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
`;

const TestSoundButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: #ffc107;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1.2rem;

  &:hover {
    background: #e0a800;
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1.1rem;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);

  &:hover {
    background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  }

  &:active {
    transform: translateY(0) scale(0.98);
  }

  ${props => props.loading && css`
    opacity: 0.7;
    cursor: not-allowed;
  `}

  .spinning {
    animation: ${spin} 1s linear infinite;
  }
`;

const SoundToggle = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: #f8f9fa;
  color: #6c757d;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1.1rem;

  &:hover {
    background: #e9ecef;
    transform: scale(1.05);
  }

  ${props => props.enabled && css`
    background: #28a745;
    color: white;

    &:hover {
      background: #218838;
    }
  `}

  ${props => props.disabled && css`
    background: #dc3545;
    color: white;

    &:hover {
      background: #c82333;
    }
  `}
`;

const NewOrderNotification = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
  animation: ${slideInDown} 0.5s ease-out;

  ${props => props.persistent && css`
    background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
    animation: ${persistentPulse} 2s infinite;
  `}
`;

const NotificationContent = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
`;

const NotificationIcon = styled.span`
  font-size: 1.5rem;
  animation: ${bounce} 2s infinite;
`;

const NotificationMessage = styled.span`
  font-weight: 600;
  font-size: 1.1rem;
`;

const NotificationTime = styled.span`
  font-size: 0.9rem;
  opacity: 0.9;
`;

const NotificationClose = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  transition: background-color 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const NotificationActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const NotificationAccept = styled.button`
  background: #28a745;
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #218838;
  }
`;

const PendingOrdersControl = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 1rem;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  color: #856404;
`;

const PendingCount = styled.span`
  font-weight: 600;
  font-size: 0.9rem;
`;

const StopAllSounds = styled.button`
  background: #dc3545;
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #c82333;
  }
`;

const MainContent = styled.div`
  display: flex;
  gap: 40px;
  height: calc(100vh - 120px);
  overflow: hidden;
  background: white;
  margin: 24px;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  position: relative;
  align-items: stretch;
`;

const OrderSidebar = styled.div`
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

const OrderDetailsPanel = styled.div`
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

const OrdersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;
  padding: 16px;
  box-sizing: border-box;
`;

const OrderSection = styled.div`
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
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
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
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
    transform: translateX(4px);
  }

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 4px;
    height: 100%;
    background: linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover::before {
    opacity: 1;
  }
`;

const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SectionTitleText = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: -0.025em;
  background: linear-gradient(135deg, #1e293b 0%, #475569 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const SectionOrderCount = styled.div`
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`;

const ChevronIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: #64748b;
  transition: all 0.3s ease;
  background: #f1f5f9;
  border-radius: 50%;
  border: 1px solid #e2e8f0;

  &:hover {
    background: #e2e8f0;
    color: #475569;
    transform: scale(1.1);
  }

  ${props => props.$expanded && css`
    transform: rotate(180deg);
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    color: white;
    border-color: #3b82f6;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
  `}

  svg {
    width: 18px;
    height: 18px;
    transition: all 0.3s ease;
  }
`;

const EmptySection = styled.div`
  padding: 40px 20px;
  text-align: center;
  color: #64748b;

  p {
    margin: 0;
    font-size: 16px;
  }
`;

const OrderCardStyled = styled.div`
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  margin: 8px 0;
  overflow: hidden;
  padding: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  position: relative;

  &:hover {
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    border-color: #3b82f6;
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
  }

  &::after {
    content: 'Click to view details';
    position: absolute;
    top: 8px;
    right: 8px;
    background: rgba(59, 130, 246, 0.1);
    color: #3b82f6;
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 0.7rem;
    font-weight: 500;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  &:hover::after {
    opacity: 1;
  }

  ${props => props.$newOrder && css`
    border: 2px solid #28a745;
    background: linear-gradient(135deg, #f8fff9 0%, #e8f5e8 100%);
    animation: ${newOrderPulse} 2s ease-in-out;
  `}

  ${props => props.$selected && css`
    background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
    border: 2px solid #3b82f6;
    box-shadow: 0 8px 24px rgba(59, 130, 246, 0.25);
    transform: translateY(-2px);
  `}
`;

const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
`;

const OrderInfo = styled.div`
  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 0.5rem;
  }
`;

const CustomerName = styled.div`
  font-size: 1rem;
  color: #7f8c8d;
  margin-bottom: 0.25rem;
`;

const TotalAmount = styled.span`
  font-weight: 700;
  color: #059669;
  font-size: 1.1rem;
  margin-top: 0.25rem;
`;

const OrderDate = styled.div`
  font-size: 0.9rem;
  color: #95a5a6;
`;

const OrderStatus = styled.div`
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
`;

const NewOrderBadge = styled.div`
  background: #28a745;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  animation: ${bounce} 1s infinite;
`;

const PendingOrderBadge = styled.div`
  background: #dc3545;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  animation: ${pulse} 1s infinite;
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background-color: ${props => {
    switch (props.$status) {
      case 'orange': return '#fff3cd';
      case 'blue': return '#d1ecf1';
      case 'purple': return '#e2d9f3';
      case 'green': return '#d4edda';
      case 'red': return '#f8d7da';
      case 'gray': return '#e2e3e5';
      default: return '#e2e3e5';
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'orange': return '#856404';
      case 'blue': return '#0c5460';
      case 'purple': return '#6f42c1';
      case 'green': return '#155724';
      case 'red': return '#721c24';
      case 'gray': return '#383d41';
      default: return '#383d41';
    }
  }};
`;

const OrderSummary = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
`;

const ItemsSummary = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  p {
    margin: 0;
    color: #555;
    font-size: 0.9rem;
  }

  strong {
    color: #2c3e50;
  }
`;

const OrderActions = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const ActionBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  ${props => {
    switch (props.$variant) {
      case 'view':
        return css`
          background-color: #e3f2fd;
          color: #1976d2;
          &:hover { background-color: #bbdefb; }
        `;
      case 'accept':
        return css`
          background-color: #e8f5e8;
          color: #2e7d32;
          &:hover { background-color: #c8e6c9; }
        `;
      case 'ready':
        return css`
          background-color: #fff3e0;
          color: #f57c00;
          &:hover { background-color: #ffe0b2; }
        `;
      case 'delivered':
        return css`
          background-color: #e8f5e8;
          color: #2e7d32;
          &:hover { background-color: #c8e6c9; }
        `;
      case 'cancel':
        return css`
          background-color: #ffebee;
          color: #d32f2f;
          &:hover { background-color: #ffcdd2; }
        `;
      default:
        return css`
          background-color: #e3f2fd;
          color: #1976d2;
          &:hover { background-color: #bbdefb; }
        `;
    }
  }}
`;

const OrderDetailsContent = styled.div`
  padding: 32px 40px;
  height: 100%;
  background: white;
  margin: 24px 24px 24px 40px;
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  box-sizing: border-box;

  .order-details {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .customer-info, .order-items, .order-meta, .status-update {
    background: #f8fafc;
    padding: 1.5rem;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
  }

  .customer-info h3, .order-items h3, .order-meta h3, .status-update h3 {
    margin: 0 0 1rem 0;
    color: #1e293b;
    font-size: 1.25rem;
    font-weight: 600;
    border-bottom: 2px solid #3b82f6;
    padding-bottom: 0.5rem;
  }

  .customer-info p, .order-meta p {
    margin: 0.5rem 0;
    color: #475569;
    font-size: 0.95rem;
  }

  .order-item {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .item-details {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .item-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .item-name {
    font-weight: 600;
    color: #1e293b;
    font-size: 1rem;
  }

  .total-amount {
    font-weight: 700;
    color: #059669;
    font-size: 1.1rem;
    margin-top: 0.25rem;
  }

  .item-quantity {
    background: #3b82f6;
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 600;
  }



  .item-notes {
    color: #dc2626;
    font-size: 0.9rem;
    margin: 0;
    background: #fef2f2;
    padding: 0.5rem;
    border-radius: 6px;
    border-left: 3px solid #dc2626;
  }

  .item-price {
    font-weight: 600;
    color: #059669;
    font-size: 1rem;
  }

  .order-summary {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 1rem;
    margin-top: 1rem;
  }

  .subtotal, .tip, .order-total {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
  }

  .subtotal, .tip {
    border-bottom: 1px solid #e2e8f0;
    color: #64748b;
  }

  .order-total {
    font-size: 1.1rem;
    color: #1e293b;
    border-top: 2px solid #3b82f6;
    margin-top: 0.5rem;
    padding-top: 0.75rem;
  }

  .status-badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-left: 0.5rem;
  }

  .status-badge.orange {
    background: #fff3cd;
    color: #856404;
  }

  .status-badge.blue {
    background: #d1ecf1;
    color: #0c5460;
  }

  .status-badge.green {
    background: #d4edda;
    color: #155724;
  }

  .status-badge.gray {
    background: #e2e3e5;
    color: #383d41;
  }

  .status-buttons {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .status-buttons button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.9rem;
  }

  .status-buttons button:not(:disabled) {
    background: #3b82f6;
    color: white;
  }

  .status-buttons button:not(:disabled):hover {
    background: #2563eb;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
  }

  .status-buttons button:disabled {
    background: #e2e8f0;
    color: #64748b;
    cursor: not-allowed;
  }

  .special-instructions {
    margin-top: 15px;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 8px;
    border-left: 4px solid #007bff;
  }

  .special-instructions h4 {
    margin: 0 0 10px 0;
    color: #007bff;
    font-size: 14px;
    font-weight: 600;
  }

  .comments-box {
    background: white;
    padding: 12px;
    border-radius: 6px;
    border: 1px solid #e9ecef;
    font-style: italic;
    color: #495057;
    line-height: 1.4;
  }
`;

const DetailsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e2e8f0;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 60px;
    height: 2px;
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    border-radius: 1px;
  }

  h2 {
    margin: 0;
    color: #1e293b;
    font-size: 2rem;
    font-weight: 800;
    background: linear-gradient(135deg, #1e293b 0%, #475569 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.025em;
  }
`;

const CloseDetailsBtn = styled.button`
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border: 1px solid #cbd5e1;
  font-size: 20px;
  color: #64748b;
  cursor: pointer;
  padding: 12px;
  border-radius: 50%;
  transition: all 0.3s ease;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  &:hover {
    background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
    color: #475569;
    transform: scale(1.1);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const NoOrderSelected = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  padding: 40px;
  box-sizing: border-box;
`;

const NoOrderContent = styled.div`
  text-align: center;
  color: #64748b;
  background: white;
  padding: 48px;
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  max-width: 400px;

  h2 {
    margin: 0 0 16px 0;
    font-size: 1.75rem;
    color: #1e293b;
    font-weight: 700;
    background: linear-gradient(135deg, #1e293b 0%, #475569 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  p {
    margin: 0;
    font-size: 1.1rem;
    line-height: 1.6;
    color: #64748b;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
  color: #64748b;
  font-size: 1.1rem;
`;

const OrderManagement = () => {
  const { restaurant } = useRestaurant();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);


  const [soundEnabled, setSoundEnabled] = useState(true);
  const [newOrderNotification, setNewOrderNotification] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [newOrderIds, setNewOrderIds] = useState(new Set());
  const [pendingOrderIds, setPendingOrderIds] = useState(new Set());
  const [newOrdersExpanded, setNewOrdersExpanded] = useState(true);
  const [inProgressExpanded, setInProgressExpanded] = useState(true);
  const [finishedExpanded, setFinishedExpanded] = useState(true);

  useEffect(() => {
    fetchOrders();
    setupSocketConnection();
    
    // Initialize audio context after a short delay
    const audioTimer = setTimeout(() => {
      if (soundEnabled) {
        notificationService.testSound();
      }
      // Also request notification permission
      notificationService.requestNotificationPermission();
    }, 2000);
    
    return () => {
      // Cleanup socket connection
      socketService.removeNewOrderListener();
      socketService.disconnect();
      clearTimeout(audioTimer);
      
      // Stop all continuous sounds
      notificationService.stopAllContinuousSounds();
    };
  }, [soundEnabled]);

  const setupSocketConnection = () => {
    console.log('🔌 Setting up Socket.io connection...');
    try {
      const socket = socketService.connect();
      console.log('Socket service returned:', socket);
      
      if (socket) {
        console.log('✅ Socket connection established');
        
        // Listen for connection status
        socket.on('connect', () => {
          setSocketConnected(true);
          console.log('✅ Socket connected in component:', socket.id);
        });
        
        socket.on('disconnect', () => {
          setSocketConnected(false);
          console.log('❌ Socket disconnected in component');
        });
        
        console.log('🔔 Setting up new-order listener...');
        socketService.onNewOrder((data) => {
          console.log('🎉 New order received via socket in component:', data);
          handleNewOrder(data);
        });
      } else {
        console.error('❌ Socket service returned null/undefined');
      }
    } catch (error) {
      console.error('❌ Failed to setup socket connection:', error);
    }
  };

  // Initialize audio context on user interaction
  const initializeAudio = () => {
    if (soundEnabled) {
      console.log('Initializing audio on user interaction...');
      notificationService.testSound();
    }
  };

  // Force audio initialization when component mounts or sound is enabled
  useEffect(() => {
    if (soundEnabled) {
      // Small delay to ensure component is fully mounted
      const timer = setTimeout(() => {
        console.log('Forcing audio initialization...');
        notificationService.testSound();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [soundEnabled]);

  const handleNewOrder = async (orderData) => {
    try {
      // Start continuous sound for this order
      if (soundEnabled) {
        notificationService.startContinuousSound(orderData.orderId);
      }

      // Add to pending orders
      setPendingOrderIds(prev => new Set([...prev, orderData.orderId]));

      // Show persistent notification
      setNewOrderNotification({
        message: `New order #${orderData.orderId} received! Click to accept.`,
        timestamp: new Date().toLocaleTimeString(),
        orderId: orderData.orderId,
        persistent: true
      });

      // Fetch updated orders list
      await fetchOrders();
      
      // Mark this order as new for highlighting
      setNewOrderIds(prev => new Set([...prev, orderData.orderId]));
      
      // Remove highlight after 10 seconds
      setTimeout(() => {
        setNewOrderIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(orderData.orderId);
          return newSet;
        });
      }, 10000);
      
      // Flash the page title to draw attention
      const originalTitle = document.title;
      document.title = '🔔 NEW ORDER! - Admin Panel';
      setTimeout(() => {
        document.title = originalTitle;
      }, 2000);
    } catch (error) {
      console.error('Error handling new order:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const ordersData = await api.getOrders();
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Fallback to mock data if API fails
      setOrders([
        {
          id: 1,
          customer_name: 'John Doe',
          customer_email: 'john@example.com',
          total_amount: 24.97,
          status: 'pending',
          created_at: '2024-01-15T10:30:00',
          delivery_address: '123 Main St, City, State 12345',
          special_instructions: 'Extra cheese please'
        },
        {
          id: 2,
          customer_name: 'Jane Smith',
          customer_email: 'jane@example.com',
          total_amount: 26.97,
          status: 'preparing',
          created_at: '2024-01-15T11:00:00',
          delivery_address: '456 Oak Ave, City, State 12345',
          special_instructions: 'No onions on burger'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'orange';
      case 'accept':
      case 'accepted': return 'blue';
      case 'delivered': return 'green';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FiClock />;
      case 'accept':
      case 'accepted': return <FiCheck />;
      case 'delivered': return <FiCheck />;
      default: return <FiClock />;
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      
      // Update orders list
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus }
          : order
      ));

      // If order is no longer pending, stop continuous sound and remove from pending
      if (newStatus !== 'pending') {
        notificationService.stopContinuousSound(orderId);
        setPendingOrderIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(orderId);
          return newSet;
        });

        // If this was the persistent notification, clear it
        if (newOrderNotification && newOrderNotification.orderId === orderId) {
          setNewOrderNotification(null);
        }

        console.log(`Order ${orderId} status changed to ${newStatus}, continuous sound stopped`);
      }

      // Show success notification with section information
      let sectionInfo = '';
      if (newStatus === 'pending') {
        sectionInfo = ' (moved to New Orders)';
      } else if (newStatus === 'accept' || newStatus === 'accepted') {
        sectionInfo = ' (moved to In Progress)';
      } else if (newStatus === 'delivered') {
        sectionInfo = ' (moved to Finished)';
      }

      notificationService.showNotification(
        `Order #${orderId} status updated to ${newStatus}${sectionInfo}`,
        'success'
      );
    } catch (error) {
      console.error('Error updating order status:', error);
      notificationService.showNotification(
        `Failed to update order status: ${error.message}`,
        'error'
      );
    }
  };

  const viewOrderDetails = async (order) => {
    try {
      console.log('🔍 Fetching order details for order:', order.id);
      console.log('📋 Order data:', order);
      console.log('📝 Special instructions in order data:', order.special_instructions);
      
      const orderDetails = await api.getOrderDetails(restaurant.id, order.id);
      console.log('✅ Order details received:', orderDetails);
      console.log('📝 Special instructions in order details:', orderDetails.special_instructions);
      
      setSelectedOrder(orderDetails);
    } catch (error) {
      console.error('❌ Error fetching order details:', error);
      console.error('❌ Error details:', error.message);
      alert(`Failed to load order details: ${error.message}`);
    }
  };

  // Separate orders into sections
  const newOrders = orders.filter(order => order.status === 'pending');
  const inProgressOrders = orders.filter(order => order.status === 'accept' || order.status === 'accepted');
  const finishedOrders = orders.filter(order => order.status === 'delivered');



  // OrderCard component - Simplified
  const OrderCard = ({ order }) => (
    <OrderCardStyled 
      $newOrder={newOrderIds.has(order.id)}
      $selected={selectedOrder?.id === order.id}
      onClick={() => viewOrderDetails(order)}
    >
      <OrderHeader>
        <OrderInfo>
          <h3>Order #{order.id}</h3>
          <TotalAmount>${order.total_amount}</TotalAmount>
        </OrderInfo>
        
        <OrderStatus>
          {newOrderIds.has(order.id) && (
            <NewOrderBadge>NEW</NewOrderBadge>
          )}
          {pendingOrderIds.has(order.id) && (
            <PendingOrderBadge>
              🔊 {notificationService.isContinuousSoundPlaying(order.id) ? 'SOUNDING' : 'PENDING'}
            </PendingOrderBadge>
          )}
          <StatusBadge $status={getStatusColor(order.status)}>
            {getStatusIcon(order.status)}
            {order.status}
          </StatusBadge>
        </OrderStatus>
      </OrderHeader>
    </OrderCardStyled>
  );

  if (loading) {
    return (
      <OrderManagementContainer>
        <LoadingSpinner>Loading orders...</LoadingSpinner>
      </OrderManagementContainer>
    );
  }

  return (
    <OrderManagementContainer>
      <PageHeader>
        <HeaderLeft>
          <PageTitle>Order Management</PageTitle>
          <OrderCount>
            {orders.length} order{orders.length !== 1 ? 's' : ''}
          </OrderCount>
        </HeaderLeft>
        <HeaderControls>
          
          <ConnectionStatus>
            <StatusDot $connected={socketConnected} />
            <StatusText>
              {socketConnected ? 'Live' : 'Offline'}
            </StatusText>
          </ConnectionStatus>
          
          <AudioStatus>
            <StatusDot $connected={notificationService.audioContext && notificationService.audioContext.state === 'running'} />
            <StatusText>
              Audio: {notificationService.audioContext ? notificationService.audioContext.state : 'Not ready'}
            </StatusText>
          </AudioStatus>
          
          <RefreshButton
            onClick={fetchOrders}
            disabled={loading}
            loading={loading}
            title="Refresh orders"
          >
            <FiRefreshCw className={loading ? 'spinning' : ''} />
          </RefreshButton>
          
          <TestSoundButton
            onClick={() => {
              notificationService.testSound();
              // Also try to resume audio context
              if (notificationService.audioContext && notificationService.audioContext.state === 'suspended') {
                notificationService.audioContext.resume();
              }
            }}
            title={`Test notification sound and initialize audio (Audio: ${notificationService.audioContext ? notificationService.audioContext.state : 'Not initialized'})`}
          >
            🔊
          </TestSoundButton>
          
          <SoundToggle
            $enabled={soundEnabled}
            disabled={!soundEnabled}
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) {
                notificationService.enable();
              } else {
                notificationService.disable();
              }
            }}
            title={soundEnabled ? 'Disable sound notifications' : 'Enable sound notifications'}
          >
            {soundEnabled ? <FiVolume2 /> : <FiVolumeX />}
          </SoundToggle>

          {pendingOrderIds.size > 0 && (
            <PendingOrdersControl>
              <PendingCount>{pendingOrderIds.size} pending</PendingCount>
              <StopAllSounds
                onClick={() => {
                  notificationService.stopAllContinuousSounds();
                  setPendingOrderIds(new Set());
                  setNewOrderNotification(null);
                }}
                title="Stop all continuous sounds"
              >
                🔇 Stop All
              </StopAllSounds>
            </PendingOrdersControl>
          )}
        </HeaderControls>
      </PageHeader>

      {/* New Order Notification */}
      {newOrderNotification && (
        <NewOrderNotification persistent={newOrderNotification.persistent}>
          <NotificationContent>
            <NotificationIcon>🔔</NotificationIcon>
            <NotificationMessage>{newOrderNotification.message}</NotificationMessage>
            <NotificationTime>{newOrderNotification.timestamp}</NotificationTime>
          </NotificationContent>
          
          {newOrderNotification.persistent ? (
            <NotificationActions>
              <NotificationAccept
                onClick={() => {
                  if (newOrderNotification.orderId) {
                    updateOrderStatus(newOrderNotification.orderId, 'accept');
                  }
                }}
                title="Accept this order"
              >
                ✓ Accept
              </NotificationAccept>
              <NotificationClose
                onClick={() => setNewOrderNotification(null)}
                title="Dismiss notification"
              >
                ×
              </NotificationClose>
            </NotificationActions>
          ) : (
            <NotificationClose
              onClick={() => setNewOrderNotification(null)}
            >
              ×
            </NotificationClose>
          )}
        </NewOrderNotification>
      )}

      <MainContent>
        {/* Left Sidebar - Order Sections (20%) */}
        <OrderSidebar>
          {/* New Orders Section */}
          <OrderSection>
            <SectionHeader onClick={() => setNewOrdersExpanded(!newOrdersExpanded)}>
              <SectionTitle>
                <SectionTitleText>🆕 New Orders</SectionTitleText>
                <SectionOrderCount>{newOrders.length} order{newOrders.length !== 1 ? 's' : ''}</SectionOrderCount>
              </SectionTitle>
              <ChevronIcon $expanded={newOrdersExpanded}>
                <FiChevronDown />
              </ChevronIcon>
            </SectionHeader>
            
            {newOrdersExpanded && (
              <OrdersList>
                {newOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </OrdersList>
            )}
          </OrderSection>

          {/* In Progress Section */}
          <OrderSection>
            <SectionHeader onClick={() => setInProgressExpanded(!inProgressExpanded)}>
              <SectionTitle>
                <SectionTitleText>⏳ In Progress</SectionTitleText>
                <SectionOrderCount>{inProgressOrders.length} order{inProgressOrders.length !== 1 ? 's' : ''}</SectionOrderCount>
              </SectionTitle>
              <ChevronIcon $expanded={inProgressExpanded}>
                <FiChevronDown />
              </ChevronIcon>
            </SectionHeader>
            
            {inProgressExpanded && (
              <OrdersList>
                {inProgressOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </OrdersList>
            )}
          </OrderSection>

          {/* Finished Section */}
          <OrderSection>
            <SectionHeader onClick={() => setFinishedExpanded(!finishedExpanded)}>
              <SectionTitle>
                <SectionTitleText>✅ Finished</SectionTitleText>
                <SectionOrderCount>{finishedOrders.length} order{finishedOrders.length !== 1 ? 's' : ''}</SectionOrderCount>
              </SectionTitle>
              <ChevronIcon $expanded={finishedExpanded}>
                <FiChevronDown />
              </ChevronIcon>
            </SectionHeader>
            
            {finishedExpanded && (
              <OrdersList>
                {finishedOrders.length > 0 ? (
                  finishedOrders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))
                ) : (
                  <EmptySection>
                    <p>No finished orders yet</p>
                  </EmptySection>
                )}
              </OrdersList>
            )}
          </OrderSection>
        </OrderSidebar>

        {/* Right Side - Order Details (80%) */}
        <OrderDetailsPanel>
          {selectedOrder ? (
            <OrderDetailsContent>
              <DetailsHeader>
                <h2>Order #{selectedOrder.id} Details</h2>
                <CloseDetailsBtn
                  onClick={() => setSelectedOrder(null)}
                  title="Close details"
                >
                  ×
                </CloseDetailsBtn>
              </DetailsHeader>
              
              <div className="order-details">
                <div className="customer-info">
                  <h3>Customer Information</h3>
                  <p><strong>Name:</strong> {selectedOrder.customer_name || 'Not available'}</p>
                  <p><strong>Email:</strong> {selectedOrder.customer_email || 'Not available'}</p>
                  {selectedOrder.customer_phone && (
                    <p><strong>Phone:</strong> {selectedOrder.customer_phone}</p>
                  )}
                  {selectedOrder.delivery_address && (
                    <p><strong>Address:</strong> {selectedOrder.delivery_address}</p>
                  )}
                  {/* Debug info */}
                  <div style={{fontSize: '0.8rem', color: '#666', marginTop: '10px'}}>
                    <strong>Debug:</strong> Customer data available: {selectedOrder.customer_name ? 'Yes' : 'No'}
                  </div>
                </div>

                {/* Debug info for comments */}
                <div style={{fontSize: '0.8rem', color: '#666', marginTop: '10px'}}>
                  <strong>Debug:</strong> Special instructions available: {selectedOrder.special_instructions ? 'Yes' : 'No'}
                  {selectedOrder.special_instructions && (
                    <span> - Content: "{selectedOrder.special_instructions}"</span>
                  )}
                </div>
                
                {selectedOrder.special_instructions && (
                  <div className="special-instructions">
                    <h3>📝 Customer Comments</h3>
                    <div className="comments-box">
                      {selectedOrder.special_instructions}
                    </div>
                  </div>
                )}

                <div className="order-items">
                  <h3>Order Items</h3>
                  {/* Debug info */}
                  <div style={{fontSize: '0.8rem', color: '#666', marginBottom: '10px'}}>
                    <strong>Debug:</strong> Items available: {selectedOrder.items ? selectedOrder.items.length : 0} items
                  </div>
                  {selectedOrder.items && selectedOrder.items.map((item, index) => (
                    <div key={index} className="order-item">
                      <div className="item-details">
                        <div className="item-header">
                          <div className="item-info">
                            <span className="item-quantity">x{item.quantity}</span>
                            <span className="item-name">{item.name}</span>
                          </div>
                          <span className="item-price">${item.price}</span>
                        </div>
                        {item.notes && (
                          <p className="item-notes"><strong>Notes:</strong> {item.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="order-summary">
                    <div className="subtotal">
                      <span>Subtotal:</span>
                      <span>${(selectedOrder.total_amount - (selectedOrder.tip_amount || 0)).toFixed(2)}</span>
                    </div>
                    {selectedOrder.tip_amount && selectedOrder.tip_amount > 0 && (
                      <div className="tip">
                        <span>Tip:</span>
                        <span>${selectedOrder.tip_amount}</span>
                      </div>
                    )}
                    <div className="order-total">
                      <strong>Total: ${selectedOrder.total_amount}</strong>
                    </div>
                  </div>
                </div>

                <div className="order-meta">
                  <h3>Order Information</h3>
                  <p><strong>Order Date:</strong> {new Date(selectedOrder.created_at).toLocaleString()}</p>
                  <p><strong>Status:</strong> 
                    <span className={`status-badge ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </p>
                  {selectedOrder.payment_method && (
                    <p><strong>Payment Method:</strong> {selectedOrder.payment_method}</p>
                  )}

                </div>

                <div className="status-update">
                  <h3>Update Status</h3>
                  <div className="status-buttons">
                    {selectedOrder.status === 'pending' && (
                      <button onClick={() => updateOrderStatus(selectedOrder.id, 'accept')}>
                        Accept Order
                      </button>
                    )}
                    {(selectedOrder.status === 'accept' || selectedOrder.status === 'accepted') && (
                      <button onClick={() => updateOrderStatus(selectedOrder.id, 'delivered')}>
                        Mark Delivered
                      </button>
                    )}
                    {selectedOrder.status === 'delivered' && (
                      <button disabled style={{ opacity: 0.7, cursor: 'not-allowed' }}>
                        ✓ Order Completed
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </OrderDetailsContent>
          ) : (
            <NoOrderSelected>
              <NoOrderContent>
                <h2>No Order Selected</h2>
                <p>Click on an order from the left sidebar to view its details</p>
              </NoOrderContent>
            </NoOrderSelected>
          )}
        </OrderDetailsPanel>
      </MainContent>
    </OrderManagementContainer>
  );
};



export default OrderManagement;
