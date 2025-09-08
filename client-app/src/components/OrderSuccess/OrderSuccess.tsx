import React from 'react';
import styled from 'styled-components';
import { FiCheckCircle, FiClock, FiShoppingBag, FiArrowLeft } from 'react-icons/fi';
import { OrderResponse } from '../../services/api';

interface OrderSuccessProps {
  orderData: OrderResponse;
  orderItems: Array<{
    menu_item_id: number;
    quantity: number;
    notes?: string;
    menuItem: {
      id: number;
      name: string;
      price: string;
      image_url?: string;
    };
  }>;
  onBackToMenu: () => void;
}

const SuccessContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--color-secondary);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  text-align: center;
`;

const SuccessContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: var(--spacing-xl);
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
`;

const SuccessIcon = styled.div`
  color: var(--color-success);
  font-size: 5rem;
  margin-bottom: var(--spacing-xl);
  display: flex;
  justify-content: center;
`;

const SuccessTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-gray-800);
  margin: 0 0 var(--spacing-lg) 0;
`;

const SuccessMessage = styled.p`
  font-size: 1.25rem;
  color: var(--color-gray-600);
  margin: 0 0 var(--spacing-2xl) 0;
  line-height: 1.6;
  max-width: 500px;
`;

const OrderDetails = styled.div`
  background: var(--color-gray-50);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-2xl);
  border: 1px solid var(--color-gray-200);
  width: 100%;
`;

const OrderInfo = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
`;

const InfoItem = styled.div`
  text-align: center;
`;

const InfoLabel = styled.div`
  font-size: 0.875rem;
  color: var(--color-gray-600);
  margin-bottom: var(--spacing-xs);
  font-weight: 500;
`;

const InfoValue = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-gray-800);
`;

const OrderNumber = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
`;

const PreparationTime = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-success);
`;

const OrderItems = styled.div`
  margin-top: var(--spacing-lg);
`;

const ItemsTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-gray-800);
  margin: 0 0 var(--spacing-md) 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
`;

const ItemList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
`;

const OrderItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md);
  background: var(--color-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-gray-200);
`;

const ItemInfo = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex: 1;
`;

const ItemImage = styled.img`
  width: 50px;
  height: 50px;
  border-radius: var(--radius-md);
  object-fit: cover;
  background: var(--color-gray-100);
`;

const ItemDetails = styled.div`
  flex: 1;
`;

const ItemName = styled.div`
  font-weight: 600;
  color: var(--color-gray-800);
  margin-bottom: 2px;
`;

const ItemNotes = styled.div`
  font-size: 0.875rem;
  color: var(--color-gray-600);
  font-style: italic;
`;

const ItemQuantity = styled.div`
  background: var(--color-primary);
  color: var(--color-secondary);
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 0.875rem;
  margin-right: var(--spacing-sm);
`;

const ItemPrice = styled.div`
  font-weight: 600;
  color: var(--color-gray-800);
`;

const TotalAmount = styled.div`
  background: linear-gradient(135deg, var(--color-primary) 0%, #1d4ed8 100%);
  color: var(--color-secondary);
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-2xl);
  width: 100%;
`;

const TotalLabel = styled.div`
  font-size: 1.125rem;
  margin-bottom: var(--spacing-sm);
  opacity: 0.9;
`;

const TotalValue = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
`;

const BackToMenuButton = styled.button`
  width: 100%;
  max-width: 300px;
  padding: var(--spacing-xl);
  background: linear-gradient(135deg, var(--color-success) 0%, #059669 100%);
  color: var(--color-secondary);
  border: none;
  border-radius: var(--radius-lg);
  font-size: 1.25rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
`;

const OrderSuccess: React.FC<OrderSuccessProps> = ({ 
  orderData, 
  orderItems, 
  onBackToMenu 
}) => {
  // Calculate estimated preparation time (15-30 minutes)
  const estimatedTime = Math.floor(Math.random() * 16) + 15; // 15-30 minutes

  return (
    <SuccessContainer>
      <SuccessContent>
        <SuccessIcon>
          {React.createElement(FiCheckCircle as any)}
        </SuccessIcon>
        
        <SuccessTitle>Order Placed Successfully!</SuccessTitle>
        
        <SuccessMessage>
          Thank you for your order! We've received your request and will start preparing it right away.
        </SuccessMessage>
        
        <OrderDetails>
          <OrderInfo>
            <InfoItem>
              <InfoLabel>Order Number</InfoLabel>
              <OrderNumber>#{orderData.order_id}</OrderNumber>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Estimated Time</InfoLabel>
              <PreparationTime>{estimatedTime} min</PreparationTime>
            </InfoItem>
          </OrderInfo>
          
          <OrderItems>
            <ItemsTitle>
              {React.createElement(FiShoppingBag as any)}
              Your Order Items
            </ItemsTitle>
            <ItemList>
              {orderItems.map((item, index) => (
                <OrderItem key={index}>
                  <ItemInfo>
                    {item.menuItem.image_url && (
                      <ItemImage 
                        src={item.menuItem.image_url} 
                        alt={item.menuItem.name}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    <ItemDetails>
                      <ItemName>{item.menuItem.name}</ItemName>
                      {item.notes && (
                        <ItemNotes>Note: {item.notes}</ItemNotes>
                      )}
                    </ItemDetails>
                  </ItemInfo>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <ItemQuantity>x{item.quantity}</ItemQuantity>
                    <ItemPrice>${Number(item.menuItem.price).toFixed(2)}</ItemPrice>
                  </div>
                </OrderItem>
              ))}
            </ItemList>
          </OrderItems>
        </OrderDetails>
        
        <TotalAmount>
          <TotalLabel>Total Amount</TotalLabel>
          <TotalValue>${orderData.total_amount.toFixed(2)}</TotalValue>
        </TotalAmount>
        
        <BackToMenuButton onClick={onBackToMenu}>
          {React.createElement(FiArrowLeft as any)}
          Back to Menu
        </BackToMenuButton>
      </SuccessContent>
    </SuccessContainer>
  );
};

export default OrderSuccess;
