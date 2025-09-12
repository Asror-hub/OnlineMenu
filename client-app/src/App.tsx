import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { GlobalStyles } from './styles/GlobalStyles';
import { RestaurantProvider, useRestaurant } from './contexts/RestaurantContext';
import { OrderProvider } from './contexts/OrderContext';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import Footer from './components/Layout/Footer';
import MenuCategories from './components/Menu/MenuCategories';
import MenuList from './components/Menu/MenuList';
import Cart from './components/Cart/Cart';
import OrdersView from './components/OrdersView/OrdersView';
import ReservationButton from './components/Reservation/ReservationButton';

import api, { MenuItem, Category } from './services/api';
import { getRestaurantContext } from './config/api';

// Debug: Log that the app is starting
console.log('🚀 Client App: Starting to load...');
console.log('🚀 Client App: Current URL:', window.location.href);
console.log('🚀 Client App: User Agent:', navigator.userAgent);

const AppContainer = styled.div`
  min-height: 100vh;
  background: var(--color-gray-50);
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.main`
  padding-top: 80px; /* Account for fixed header */
  flex: 1;
`;

const ContentWrapper = styled.div<{ $sidebarOpen: boolean }>`
  display: flex;
  min-height: calc(100vh - 80px);
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SidebarWrapper = styled.div`
  @media (min-width: 769px) {
    width: 280px;
    flex-shrink: 0;
  }
`;

const MenuContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const LoadingScreen = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: var(--color-gray-50);
`;

const NotFoundScreen = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: var(--color-gray-50);
  color: var(--color-gray-600);
  text-align: center;
  padding: 2rem;
`;

const NotFoundTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-gray-800);
  margin-bottom: 1rem;
`;

const NotFoundMessage = styled.p`
  font-size: 1.125rem;
  color: var(--color-gray-600);
  margin-bottom: 2rem;
  max-width: 600px;
  line-height: 1.6;
`;

const LoadingSpinner = styled.div`
  width: 64px;
  height: 64px;
  border: 4px solid var(--color-gray-200);
  border-top: 4px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: var(--spacing-lg);
`;

const LoadingText = styled.h2`
  color: var(--color-gray-600);
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
`;

const ErrorScreen = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: var(--color-gray-50);
  padding: var(--spacing-lg);
  text-align: center;
`;

const ErrorIcon = styled.div`
  font-size: 4rem;
  margin-bottom: var(--spacing-lg);
`;

const ErrorTitle = styled.h2`
  color: var(--color-error);
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 var(--spacing-md) 0;
`;

const ErrorMessage = styled.p`
  color: var(--color-gray-600);
  font-size: 1rem;
  margin: 0 0 var(--spacing-lg) 0;
  max-width: 500px;
`;

const RetryButton = styled.button`
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--color-primary);
  color: var(--color-secondary);
  border: none;
  border-radius: var(--radius-lg);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover {
    background: #1d4ed8;
    transform: translateY(-1px);
  }
`;

const AppContent: React.FC = () => {
  const { restaurant, loading, error, loadRestaurantData } = useRestaurant();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [menuLoading, setMenuLoading] = useState(true);
  const [menuError, setMenuError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [showOrdersView, setShowOrdersView] = useState(false);

  // Check if we have a restaurant context (subdomain or path-based)
  const restaurantContext = getRestaurantContext();
  const hasRestaurantContext = restaurantContext.hasRestaurantContext;
  
  console.log('🏪 App Component - Restaurant Context:', restaurantContext);
  console.log('🏪 App Component - Has Restaurant Context:', hasRestaurantContext);

  // Load menu data
  useEffect(() => {
    const loadMenuData = async () => {
      try {
        setMenuLoading(true);
        setMenuError(null);
        
        const [items, cats] = await Promise.all([
          api.getMenuItems(),
          api.getCategories(),
        ]);
        
        setMenuItems(items);
        setCategories(cats);
      } catch (err: any) {
        console.error('Failed to load menu data:', err);
        setMenuError(err.response?.data?.message || err.message || 'Failed to load menu');
      } finally {
        setMenuLoading(false);
      }
    };

    if (restaurant) {
      loadMenuData();
    }
  }, [restaurant]);

  // Filter menu items by selected category
  const filteredMenuItems = selectedCategory
    ? menuItems.filter(item => item.category_id === selectedCategory.id)
    : menuItems;

  // Show loading screen
  if (loading) {
    console.log('🔄 App is loading restaurant...');
    return (
      <LoadingScreen>
        <LoadingSpinner />
        <LoadingText>Loading restaurant...</LoadingText>
      </LoadingScreen>
    );
  }

  // Show error screen
  if (error) {
    console.log('❌ App error:', error);
    return (
      <ErrorScreen>
        <ErrorIcon>⚠️</ErrorIcon>
        <ErrorTitle>Restaurant Not Found</ErrorTitle>
        <ErrorMessage>{error}</ErrorMessage>
        <RetryButton onClick={loadRestaurantData}>
          Try Again
        </RetryButton>
      </ErrorScreen>
    );
  }

  // Show menu error
  if (menuError) {
    return (
      <ErrorScreen>
        <ErrorIcon>🍽️</ErrorIcon>
        <ErrorTitle>Menu Unavailable</ErrorTitle>
        <ErrorMessage>{menuError}</ErrorMessage>
        <RetryButton onClick={() => window.location.reload()}>
          Refresh Page
        </RetryButton>
      </ErrorScreen>
    );
  }

  // Show 404 screen if no subdomain is detected
  if (!hasRestaurantContext) {
    console.log('❌ No restaurant context detected');
    return (
      <NotFoundScreen>
        <NotFoundTitle>Restaurant Not Found</NotFoundTitle>
        <NotFoundMessage>
          This restaurant is not available. Please check the URL or contact the restaurant directly.
        </NotFoundMessage>
      </NotFoundScreen>
    );
  }

  // Show orders view if active
  if (showOrdersView) {
    return (
      <OrdersView
        onBackToMenu={() => setShowOrdersView(false)}
      />
    );
  }

  return (
    <AppContainer>
      <Header
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        onCartToggle={() => setCartOpen(!cartOpen)}
        onOrdersToggle={() => setShowOrdersView(true)}
        isMenuOpen={sidebarOpen}
        isCartOpen={cartOpen}
      />

      <MainContent>
        <ContentWrapper $sidebarOpen={sidebarOpen}>
          <SidebarWrapper>
            <Sidebar
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
            />
          </SidebarWrapper>

          <MenuContent>
            <MenuCategories
              categories={categories}
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
            />
            
            <MenuList
              menuItems={filteredMenuItems}
              selectedCategory={selectedCategory}
              loading={menuLoading}
            />
          </MenuContent>
        </ContentWrapper>
      </MainContent>

      <Cart
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
      />

      <ReservationButton variant="floating" />

      <Footer />
    </AppContainer>
  );
};

const App: React.FC = () => {
  console.log('🚀 Client App: App component rendering...');
  
  try {
    return (
      <RestaurantProvider>
        <OrderProvider>
          <GlobalStyles />
          <AppContent />
        </OrderProvider>
      </RestaurantProvider>
    );
  } catch (error) {
    console.error('❌ Client App: Error in App component:', error);
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>App Error</h1>
        <p>Something went wrong loading the app.</p>
        <p>Error: {error instanceof Error ? error.message : String(error)}</p>
      </div>
    );
  }
};

export default App;