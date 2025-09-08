import React from 'react';
import styled from 'styled-components';
import { Category } from '../../services/api';

interface MenuCategoriesProps {
  categories: Category[];
  selectedCategory: Category | null;
  onCategorySelect: (category: Category | null) => void;
}

const CategoriesContainer = styled.div`
  display: flex;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg);
  background: var(--color-secondary);
  border-bottom: 1px solid var(--color-gray-200);
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const CategoryButton = styled.button<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  background: ${props => props.$isActive 
    ? 'linear-gradient(135deg, var(--color-primary) 0%, #1d4ed8 100%)'
    : 'var(--color-gray-100)'};
  color: ${props => props.$isActive 
    ? 'var(--color-secondary)'
    : 'var(--color-gray-700)'};
  border: none;
  border-radius: var(--radius-xl);
  font-weight: 600;
  font-size: 0.875rem;
  white-space: nowrap;
  transition: all var(--transition-fast);
  cursor: pointer;
  box-shadow: ${props => props.$isActive 
    ? 'var(--shadow-md)'
    : 'none'};

  &:hover {
    background: ${props => props.$isActive 
      ? 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)'
      : 'var(--color-gray-200)'};
    transform: translateY(-1px);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const AllCategoriesButton = styled(CategoryButton)`
  background: ${props => props.$isActive 
    ? 'linear-gradient(135deg, var(--color-primary) 0%, #1d4ed8 100%)'
    : 'var(--color-gray-100)'};
  color: ${props => props.$isActive 
    ? 'var(--color-secondary)'
    : 'var(--color-gray-700)'};
`;

const MenuCategories: React.FC<MenuCategoriesProps> = ({
  categories,
  selectedCategory,
  onCategorySelect,
}) => {
  return (
    <CategoriesContainer>
      <AllCategoriesButton
        $isActive={selectedCategory === null}
        onClick={() => onCategorySelect(null)}
      >
        All Items
      </AllCategoriesButton>
      
      {categories.map((category) => (
        <CategoryButton
          key={category.id}
          $isActive={selectedCategory?.id === category.id}
          onClick={() => onCategorySelect(category)}
        >
          {category.name}
        </CategoryButton>
      ))}
    </CategoriesContainer>
  );
};

export default MenuCategories;
