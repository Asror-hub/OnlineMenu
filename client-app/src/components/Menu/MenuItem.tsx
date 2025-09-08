import React, { useState } from 'react';
import styled from 'styled-components';
import { FiPlus, FiMinus, FiEdit3 } from 'react-icons/fi';
import { MenuItem as MenuItemType } from '../../services/api';
import { useOrder } from '../../contexts/OrderContext';

interface MenuItemProps {
  item: MenuItemType;
}

const ItemContainer = styled.div`
  background: var(--color-secondary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  transition: all var(--transition-normal);
  border: 1px solid var(--color-gray-200);

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
`;

const ItemImage = styled.div`
  width: 100%;
  height: 200px;
  background: var(--color-gray-100);
  position: relative;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform var(--transition-normal);
  }

  &:hover img {
    transform: scale(1.05);
  }
`;

const ImagePlaceholder = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--color-gray-100) 0%, var(--color-gray-200) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-gray-400);
  font-size: 3rem;
`;

const ItemContent = styled.div`
  padding: var(--spacing-lg);
`;

const ItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-sm);
`;

const ItemName = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-gray-900);
  margin: 0;
  flex: 1;
  margin-right: var(--spacing-md);
`;

const ItemPrice = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-success);
  white-space: nowrap;
`;

const ItemDescription = styled.p`
  color: var(--color-gray-600);
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0 0 var(--spacing-md) 0;
`;

const ItemFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
`;

const QuantityControls = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  background: var(--color-gray-100);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xs);
`;

const QuantityButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  background: var(--color-secondary);
  color: var(--color-primary);
  border: 1px solid var(--color-gray-200);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);

  &:hover {
    background: var(--color-primary);
    color: var(--color-secondary);
    transform: scale(1.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const QuantityDisplay = styled.span`
  min-width: 24px;
  text-align: center;
  font-weight: 600;
  color: var(--color-gray-800);
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  background: linear-gradient(135deg, var(--color-primary) 0%, #1d4ed8 100%);
  color: var(--color-secondary);
  border: none;
  border-radius: var(--radius-lg);
  font-weight: 600;
  font-size: 0.875rem;
  transition: all var(--transition-fast);
  cursor: pointer;
  box-shadow: var(--shadow-sm);

  &:hover {
    background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const NotesButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  background: var(--color-gray-100);
  color: var(--color-gray-600);
  border: 1px solid var(--color-gray-200);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);

  &:hover {
    background: var(--color-gray-200);
    color: var(--color-gray-800);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const MenuItem: React.FC<MenuItemProps> = ({ item }) => {
  const { cart, addToCart, removeFromCart, updateCartItemQuantity } = useOrder();
  const [quantity, setQuantity] = useState(0);
  const [showNotes, setShowNotes] = useState(false);

  // Find cart item for this menu item
  const cartItem = cart.find(cartItem => cartItem.menu_item_id === item.id);

  // Update local quantity when cart changes
  React.useEffect(() => {
    setQuantity(cartItem?.quantity || 0);
  }, [cartItem]);

  const handleAddToCart = () => {
    addToCart(item, 1);
  };

  const handleIncreaseQuantity = () => {
    if (cartItem) {
      updateCartItemQuantity(item.id, cartItem.quantity + 1);
    } else {
      addToCart(item, 1);
    }
  };

  const handleDecreaseQuantity = () => {
    if (cartItem && cartItem.quantity > 1) {
      updateCartItemQuantity(item.id, cartItem.quantity - 1);
    } else if (cartItem) {
      removeFromCart(item.id);
    }
  };

  return (
    <ItemContainer>
      <ItemImage>
        {item.image_url ? (
          <img src={item.image_url} alt={item.name} />
        ) : (
          <ImagePlaceholder>
            🍽️
          </ImagePlaceholder>
        )}
      </ItemImage>

      <ItemContent>
        <ItemHeader>
          <ItemName>{item.name}</ItemName>
          <ItemPrice>${Number(item.price).toFixed(2)}</ItemPrice>
        </ItemHeader>

        <ItemDescription>{item.description}</ItemDescription>

        <ItemFooter>
          {quantity > 0 ? (
            <QuantityControls>
              <QuantityButton onClick={handleDecreaseQuantity}>
                {React.createElement(FiMinus as any)}
              </QuantityButton>
              <QuantityDisplay>{quantity}</QuantityDisplay>
              <QuantityButton onClick={handleIncreaseQuantity}>
                {React.createElement(FiPlus as any)}
              </QuantityButton>
            </QuantityControls>
          ) : (
            <AddButton onClick={handleAddToCart}>
              {React.createElement(FiPlus as any)}
              Add to Cart
            </AddButton>
          )}

          <NotesButton onClick={() => setShowNotes(!showNotes)}>
            {React.createElement(FiEdit3 as any)}
          </NotesButton>
        </ItemFooter>
      </ItemContent>
    </ItemContainer>
  );
};

export default MenuItem;
