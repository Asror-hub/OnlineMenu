import React from 'react';
import { useRestaurant } from '../contexts/RestaurantContext';
import Sidebar from './Sidebar';
import styled from 'styled-components';

// Styled components for proper layout
const LayoutContainer = styled.div`
  display: flex;
  height: 100vh;
`;

const MainContent = styled.main`
  flex: 1;
  margin-left: 280px; /* Account for sidebar width */
  overflow: auto;
  background-color: #f5f7fa;
  
  /* Responsive design for mobile */
  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

// SECURITY: Restaurant-Specific Layout Component
const RestaurantLayout = ({ children }) => {
  const { restaurant, loading, error, isValidContext } = useRestaurant();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading {restaurant?.name || 'your restaurant'}'s admin panel...
      </div>
    );
  }

  if (error || !isValidContext()) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#dc3545'
      }}>
        {error || 'Invalid restaurant context. Please log in again.'}
      </div>
    );
  }

  // SECURITY: Display restaurant-specific branding
  document.title = `${restaurant.name} - Admin Panel`;

  return (
    <LayoutContainer>
      <Sidebar />
      <MainContent>
        {children}
      </MainContent>
    </LayoutContainer>
  );
};

export default RestaurantLayout;
