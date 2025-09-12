import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import api, { RestaurantInfo, RestaurantSettings } from '../services/api';
import { getRestaurantContext } from '../config/api';

interface RestaurantContextType {
  restaurant: RestaurantInfo | null;
  settings: RestaurantSettings | null;
  loading: boolean;
  error: string | null;
  restaurantSlug: string | null;
  isSubdomain: boolean;
  loadRestaurantData: () => Promise<void>;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
};

interface RestaurantProviderProps {
  children: ReactNode;
}

export const RestaurantProvider: React.FC<RestaurantProviderProps> = ({ children }) => {
  const [restaurant, setRestaurant] = useState<RestaurantInfo | null>(null);
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const restaurantContext = getRestaurantContext();
  const { restaurantSlug, isSubdomain } = restaurantContext;

  const loadRestaurantData = useCallback(async () => {
    try {
      console.log('🔄 RestaurantContext: Starting to load restaurant data - DETAILED DEBUG:');
      console.log('  Current URL:', window.location.href);
      console.log('  Timestamp:', new Date().toISOString());
      
      setLoading(true);
      setError(null);

      // Get fresh restaurant context
      const currentContext = getRestaurantContext();
      console.log('🏪 RestaurantContext: Current context analysis:');
      console.log('  Context object:', currentContext);
      console.log('  Has restaurant context:', currentContext.hasRestaurantContext);
      console.log('  Restaurant slug:', currentContext.restaurantSlug);
      console.log('  Is path based:', currentContext.isPathBased);
      console.log('  Is subdomain:', currentContext.isSubdomain);
      
      if (!currentContext.hasRestaurantContext) {
        const errorMsg = 'No restaurant context found - cannot determine restaurant from URL';
        console.error('❌ RestaurantContext:', errorMsg);
        console.error('  URL breakdown:', {
          hostname: window.location.hostname,
          pathname: window.location.pathname,
          search: window.location.search,
          hash: window.location.hash
        });
        throw new Error(errorMsg);
      }

      console.log('🏪 RestaurantContext: Restaurant context found, loading data...');
      console.log('  Restaurant slug to use:', currentContext.restaurantSlug);
      
      // Load restaurant info and settings in parallel
      console.log('  Starting parallel API calls...');
      const [restaurantData, settingsData] = await Promise.all([
        api.getRestaurantInfo(),
        api.getRestaurantSettings().catch((settingsErr) => {
          console.warn('⚠️ RestaurantContext: Settings API failed (optional):', settingsErr);
          return null;
        }),
      ]);

      console.log('✅ RestaurantContext: API calls completed:');
      console.log('  Restaurant data:', restaurantData);
      console.log('  Settings data:', settingsData);

      setRestaurant(restaurantData);
      setSettings(settingsData);

      // Update document title with restaurant name
      if (restaurantData.name) {
        document.title = `${restaurantData.name} - Menu`;
        console.log('  Document title updated to:', document.title);
      }

      // Apply restaurant branding
      if (restaurantData.primary_color || restaurantData.secondary_color) {
        console.log('  Applying restaurant branding...');
        applyRestaurantBranding(restaurantData);
      }

      console.log('✅ RestaurantContext: Data loading completed successfully');

    } catch (err: any) {
      console.error('❌ RestaurantContext: Failed to load restaurant data - DETAILED ERROR:');
      console.error('  Error type:', typeof err);
      console.error('  Error message:', err.message);
      console.error('  Error stack:', err.stack);
      console.error('  Error response:', err.response?.data);
      console.error('  Error status:', err.response?.status);
      console.error('  Full error object:', err);
      
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load restaurant data';
      console.error('  Setting error message:', errorMessage);
      
      setError(errorMessage);
      
      // Clear restaurant data on error
      setRestaurant(null);
      setSettings(null);
    } finally {
      console.log('🔄 RestaurantContext: Setting loading to false');
      setLoading(false);
    }
  }, []);

  const applyRestaurantBranding = (restaurantData: RestaurantInfo) => {
    const root = document.documentElement;
    
    if (restaurantData.primary_color) {
      root.style.setProperty('--restaurant-primary', restaurantData.primary_color);
    }
    
    if (restaurantData.secondary_color) {
      root.style.setProperty('--restaurant-secondary', restaurantData.secondary_color);
    }
  };

  useEffect(() => {
    loadRestaurantData();
  }, [restaurantSlug, loadRestaurantData]);

  const value: RestaurantContextType = {
    restaurant,
    settings,
    loading,
    error,
    restaurantSlug,
    isSubdomain,
    loadRestaurantData,
  };

  return (
    <RestaurantContext.Provider value={value}>
      {children}
    </RestaurantContext.Provider>
  );
};
