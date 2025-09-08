import React from 'react';
import styled from 'styled-components';
import { MenuItem as MenuItemType, Category } from '../../services/api';
import MenuItem from './MenuItem';

interface MenuListProps {
  menuItems: MenuItemType[];
  selectedCategory: Category | null;
  loading: boolean;
}

const MenuContainer = styled.div`
  padding: var(--spacing-lg);
  max-width: 1200px;
  margin: 0 auto;
`;

const MenuGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-xl);
  margin-top: var(--spacing-lg);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  flex-direction: column;
  gap: var(--spacing-lg);
`;

const LoadingSpinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid var(--color-gray-200);
  border-top: 4px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
`;

const LoadingText = styled.p`
  color: var(--color-gray-600);
  font-size: 1.125rem;
  margin: 0;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: var(--spacing-3xl);
  color: var(--color-gray-500);
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: var(--spacing-lg);
`;

const EmptyTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-gray-700);
  margin: 0 0 var(--spacing-md) 0;
`;

const EmptyDescription = styled.p`
  font-size: 1rem;
  color: var(--color-gray-500);
  margin: 0;
  max-width: 400px;
  margin: 0 auto;
`;

const CategoryHeader = styled.div`
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-lg);
  background: linear-gradient(135deg, var(--color-primary) 0%, #1d4ed8 100%);
  border-radius: var(--radius-xl);
  color: var(--color-secondary);
  text-align: center;
`;

const CategoryTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 var(--spacing-sm) 0;
`;

const CategoryDescription = styled.p`
  font-size: 1rem;
  opacity: 0.9;
  margin: 0;
`;

const MenuList: React.FC<MenuListProps> = ({ 
  menuItems, 
  selectedCategory, 
  loading 
}) => {
  if (loading) {
    return (
      <MenuContainer>
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>Loading menu items...</LoadingText>
        </LoadingContainer>
      </MenuContainer>
    );
  }

  if (menuItems.length === 0) {
    return (
      <MenuContainer>
        <EmptyState>
          <EmptyIcon>🍽️</EmptyIcon>
          <EmptyTitle>
            {selectedCategory 
              ? `No items in ${selectedCategory.name}` 
              : 'No menu items available'
            }
          </EmptyTitle>
          <EmptyDescription>
            {selectedCategory 
              ? 'This category doesn\'t have any items yet. Check back later!'
              : 'The restaurant hasn\'t added any menu items yet. Please check back later!'
            }
          </EmptyDescription>
        </EmptyState>
      </MenuContainer>
    );
  }

  return (
    <MenuContainer>
      {selectedCategory && (
        <CategoryHeader>
          <CategoryTitle>{selectedCategory.name}</CategoryTitle>
          <CategoryDescription>
            {menuItems.length} item{menuItems.length !== 1 ? 's' : ''} available
          </CategoryDescription>
        </CategoryHeader>
      )}

      <MenuGrid>
        {menuItems.map((item) => (
          <MenuItem key={item.id} item={item} />
        ))}
      </MenuGrid>
    </MenuContainer>
  );
};

export default MenuList;

