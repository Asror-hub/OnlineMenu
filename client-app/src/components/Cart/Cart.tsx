import React, { useState } from 'react';
import styled from 'styled-components';
import { FiShoppingCart, FiX, FiPlus, FiMinus, FiTrash2 } from 'react-icons/fi';
import { useOrder } from '../../contexts/OrderContext';
import Checkout from '../Checkout/Checkout';
import OrderSuccess from '../OrderSuccess/OrderSuccess';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transition: all var(--transition-normal);
`;

const CartContainer = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  max-width: 400px;
  height: 100vh;
  background: var(--color-secondary);
  box-shadow: var(--shadow-xl);
  z-index: 1001;
  transform: translateX(${props => props.$isOpen ? '0' : '100%'});
  transition: transform var(--transition-normal);
  display: flex;
  flex-direction: column;
`;

const CartHeader = styled.div`
  padding: var(--spacing-lg);
  background: linear-gradient(135deg, var(--color-primary) 0%, #1d4ed8 100%);
  color: var(--color-secondary);
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const CartTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
`;

const CloseButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.2);
  color: var(--color-secondary);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const CartContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-lg);
`;

const CartItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const CartItem = styled.div`
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--color-gray-50);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-gray-200);
`;

const ItemImage = styled.div`
  width: 60px;
  height: 60px;
  border-radius: var(--radius-md);
  overflow: hidden;
  flex-shrink: 0;
  background: var(--color-gray-200);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ItemDetails = styled.div`
  flex: 1;
  min-width: 0;
`;

const ItemName = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-gray-900);
  margin: 0 0 var(--spacing-xs) 0;
`;

const ItemPrice = styled.div`
  font-size: 0.875rem;
  color: var(--color-success);
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
`;

const ItemControls = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
`;

const QuantityButton = styled.button`
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  background: var(--color-primary);
  color: var(--color-secondary);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);

  &:hover {
    background: #1d4ed8;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const QuantityDisplay = styled.span`
  min-width: 20px;
  text-align: center;
  font-weight: 600;
  color: var(--color-gray-800);
  font-size: 0.875rem;
`;

const RemoveButton = styled.button`
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  background: var(--color-error);
  color: var(--color-secondary);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);

  &:hover {
    background: #dc2626;
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const EmptyCart = styled.div`
  text-align: center;
  padding: var(--spacing-3xl);
  color: var(--color-gray-500);
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: var(--spacing-lg);
`;

const EmptyTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-gray-700);
  margin: 0 0 var(--spacing-sm) 0;
`;

const EmptyDescription = styled.p`
  font-size: 0.875rem;
  color: var(--color-gray-500);
  margin: 0;
`;

const CartFooter = styled.div`
  padding: var(--spacing-lg);
  border-top: 1px solid var(--color-gray-200);
  background: var(--color-gray-50);
`;

const CartTotal = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md);
  background: var(--color-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-gray-200);
`;

const TotalLabel = styled.div`
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-gray-800);
`;

const TotalAmount = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-success);
`;

const CheckoutButton = styled.button`
  width: 100%;
  padding: var(--spacing-lg);
  background: linear-gradient(135deg, var(--color-success) 0%, #059669 100%);
  color: var(--color-secondary);
  border: none;
  border-radius: var(--radius-lg);
  font-size: 1.125rem;
  font-weight: 600;
  transition: all var(--transition-fast);
  cursor: pointer;
  box-shadow: var(--shadow-md);

  &:hover {
    background: linear-gradient(135deg, #059669 0%, #047857 100%);
    transform: translateY(-1px);
    box-shadow: var(--shadow-lg);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const Cart: React.FC<CartProps> = ({ isOpen, onClose }) => {
  const { 
    cart, 
    removeFromCart, 
    updateCartItemQuantity, 
    getCartTotal, 
    loading,
    lastOrderData,
    lastOrderItems
  } = useOrder();

  const [showCheckout, setShowCheckout] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleCheckout = () => {
    setShowCheckout(true);
  };

  const handleOrderPlaced = () => {
    setShowCheckout(false);
    onClose();
  };

  const handleCheckoutClose = () => {
    setShowCheckout(false);
  };

  const handleShowSuccess = () => {
    setShowSuccess(true);
  };

  const handleBackToMenu = () => {
    setShowSuccess(false);
    onClose();
  };

  const total = getCartTotal();

  return (
    <>
      <CartOverlay $isOpen={isOpen} onClick={onClose}>
        <CartContainer $isOpen={isOpen} onClick={(e) => e.stopPropagation()}>
        <CartHeader>
          <CartTitle>
            {React.createElement(FiShoppingCart as any)}
            Cart ({cart.length})
          </CartTitle>
          <CloseButton onClick={onClose}>
            {React.createElement(FiX as any)}
          </CloseButton>
        </CartHeader>

        <CartContent>
          {cart.length === 0 ? (
            <EmptyCart>
              <EmptyIcon>🛒</EmptyIcon>
              <EmptyTitle>Your cart is empty</EmptyTitle>
              <EmptyDescription>
                Add some delicious items to get started!
              </EmptyDescription>
            </EmptyCart>
          ) : (
            <CartItems>
              {cart.map((item) => (
                <CartItem key={item.menu_item_id}>
                  <ItemImage>
                    {item.menuItem.image_url ? (
                      <img src={item.menuItem.image_url} alt={item.menuItem.name} />
                    ) : (
                      <div style={{ 
                        width: '100%', 
                        height: '100%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontSize: '1.5rem'
                      }}>
                        🍽️
                      </div>
                    )}
                  </ItemImage>

                  <ItemDetails>
                    <ItemName>{item.menuItem.name}</ItemName>
                    <ItemPrice>${Number(item.menuItem.price).toFixed(2)}</ItemPrice>
                    
                    <ItemControls>
                      <QuantityButton
                        onClick={() => updateCartItemQuantity(item.menu_item_id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        {React.createElement(FiMinus as any)}
                      </QuantityButton>
                      <QuantityDisplay>{item.quantity}</QuantityDisplay>
                      <QuantityButton
                        onClick={() => updateCartItemQuantity(item.menu_item_id, item.quantity + 1)}
                      >
                        {React.createElement(FiPlus as any)}
                      </QuantityButton>
                      <RemoveButton
                        onClick={() => removeFromCart(item.menu_item_id)}
                      >
                        {React.createElement(FiTrash2 as any)}
                      </RemoveButton>
                    </ItemControls>
                  </ItemDetails>
                </CartItem>
              ))}
            </CartItems>
          )}
        </CartContent>

        {cart.length > 0 && (
          <CartFooter>
            <CartTotal>
              <TotalLabel>Total</TotalLabel>
              <TotalAmount>${total.toFixed(2)}</TotalAmount>
            </CartTotal>
            
            <CheckoutButton
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Checkout'}
            </CheckoutButton>
          </CartFooter>
        )}
        </CartContainer>
      </CartOverlay>
      
      <Checkout
        isOpen={showCheckout}
        onClose={handleCheckoutClose}
        onOrderPlaced={handleOrderPlaced}
        onShowSuccess={handleShowSuccess}
      />
      
      {showSuccess && lastOrderData && lastOrderItems.length > 0 && (
        <OrderSuccess
          orderData={lastOrderData}
          orderItems={lastOrderItems}
          onBackToMenu={handleBackToMenu}
        />
      )}
    </>
  );
};

export default Cart;