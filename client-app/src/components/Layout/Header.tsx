import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiShoppingCart, FiMenu, FiX, FiClock } from 'react-icons/fi';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { useOrder } from '../../contexts/OrderContext';
import api from '../../services/api';

interface HeaderProps {
  onMenuToggle: () => void;
  onCartToggle: () => void;
  onOrdersToggle: () => void;
  isMenuOpen: boolean;
  isCartOpen: boolean;
}

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: linear-gradient(135deg, var(--color-primary) 0%, #1d4ed8 100%);
  box-shadow: var(--shadow-lg);
  backdrop-filter: blur(10px);
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-md) var(--spacing-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
`;

const Logo = styled.div`
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  background: var(--color-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.25rem;
  color: var(--color-primary);
  box-shadow: var(--shadow-md);
`;

const RestaurantInfo = styled.div`
  h1 {
    color: var(--color-secondary);
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
  }
  
  p {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.875rem;
    margin: 0;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  background: ${props => props.$variant === 'primary' 
    ? 'rgba(255, 255, 255, 0.2)' 
    : 'rgba(255, 255, 255, 0.1)'};
  color: var(--color-secondary);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all var(--transition-fast);
  position: relative;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const CartBadge = styled.span`
  position: absolute;
  top: -8px;
  right: -8px;
  background: var(--color-error);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MobileMenuButton = styled(ActionButton)`
  @media (min-width: 769px) {
    display: none;
  }
`;

const DesktopActions = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const Header: React.FC<HeaderProps> = ({ 
  onMenuToggle, 
  onCartToggle, 
  onOrdersToggle,
  isMenuOpen, 
  isCartOpen 
}) => {
  const { restaurant } = useRestaurant();
  const { getCartItemCount } = useOrder();
  const [hasActiveOrders, setHasActiveOrders] = useState(false);
  
  const cartItemCount = getCartItemCount();
  
  // Check for active orders from server
  useEffect(() => {
    const checkActiveOrders = async () => {
      try {
        const activeOrders = await api.getActiveOrders();
        console.log('Header - Active orders from server:', activeOrders);
        console.log('Header - Active orders count:', activeOrders.length);
        setHasActiveOrders(activeOrders.length > 0);
      } catch (error) {
        console.error('Header - Failed to check active orders:', error);
        setHasActiveOrders(false);
      }
    };

    // Check immediately
    checkActiveOrders();
    
    // Check every 30 seconds for updates
    const interval = setInterval(checkActiveOrders, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <HeaderContainer>
      <HeaderContent>
        <LogoSection>
          <MobileMenuButton onClick={onMenuToggle}>
            {isMenuOpen ? React.createElement(FiX as any) : React.createElement(FiMenu as any)}
          </MobileMenuButton>
          
          <Logo>
            {restaurant?.name?.charAt(0) || 'R'}
          </Logo>
          
          <RestaurantInfo>
            <h1>{restaurant?.name || 'Restaurant'}</h1>
            <p>Online Menu</p>
          </RestaurantInfo>
        </LogoSection>

        <HeaderActions>
          <DesktopActions>
            <ActionButton onClick={onMenuToggle}>
              {React.createElement(FiMenu as any)}
            </ActionButton>
          </DesktopActions>
          
          {hasActiveOrders && (
            <ActionButton onClick={onOrdersToggle} $variant="secondary" title="View Active Orders">
              {React.createElement(FiClock as any)}
            </ActionButton>
          )}
          
          {/* Debug indicator - remove in production */}
          {process.env.NODE_ENV === 'development' && (
            <div style={{ 
              position: 'absolute', 
              top: '10px', 
              right: '10px', 
              background: hasActiveOrders ? 'green' : 'red', 
              color: 'white', 
              padding: '2px 6px', 
              fontSize: '10px',
              borderRadius: '3px',
              zIndex: 9999,
              cursor: 'pointer'
            }} onClick={async () => {
              try {
                const activeOrders = await api.getActiveOrders();
                console.log('Manual refresh - Active orders:', activeOrders);
                setHasActiveOrders(activeOrders.length > 0);
              } catch (error) {
                console.error('Manual refresh failed:', error);
              }
            }}>
              {hasActiveOrders ? 'Active Orders' : 'No Active Orders'} (Click to refresh)
            </div>
          )}
          
          <ActionButton onClick={onCartToggle} $variant="primary">
            {React.createElement(FiShoppingCart as any)}
            {cartItemCount > 0 && (
              <CartBadge>{cartItemCount}</CartBadge>
            )}
          </ActionButton>
        </HeaderActions>
      </HeaderContent>
    </HeaderContainer>
  );
};

export default Header;
