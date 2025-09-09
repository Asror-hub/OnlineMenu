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
      setLoading(true);
      setError(null);

      // Get fresh restaurant context
      const currentContext = getRestaurantContext();
      if (!currentContext.hasRestaurantContext) {
        throw new Error('No restaurant context found');
      }

      // Load restaurant info and settings in parallel
      const [restaurantData, settingsData] = await Promise.all([
        api.getRestaurantInfo(),
        api.getRestaurantSettings().catch(() => null), // Settings are optional
      ]);

      setRestaurant(restaurantData);
      setSettings(settingsData);

      // Update document title with restaurant name
      if (restaurantData.name) {
        document.title = `${restaurantData.name} - Menu`;
      }

      // Apply restaurant branding
      if (restaurantData.primary_color || restaurantData.secondary_color) {
        applyRestaurantBranding(restaurantData);
      }

    } catch (err: any) {
      console.error('Failed to load restaurant data:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load restaurant data');
      
      // Clear restaurant data on error
      setRestaurant(null);
      setSettings(null);
    } finally {
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
