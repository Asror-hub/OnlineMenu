import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiX, FiCreditCard, FiDollarSign, FiSmartphone, FiMessageSquare, FiPercent } from 'react-icons/fi';
import { useOrder } from '../../contexts/OrderContext';

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderPlaced: () => void;
  onShowSuccess: () => void;
}

const CheckoutOverlay = styled.div<{ $isOpen: boolean }>`
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

const CheckoutContainer = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  max-width: 500px;
  height: 100vh;
  background: var(--color-secondary);
  box-shadow: var(--shadow-xl);
  z-index: 1001;
  transform: translateX(${props => props.$isOpen ? '0' : '100%'});
  transition: transform var(--transition-normal);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;

const CheckoutHeader = styled.div`
  padding: var(--spacing-lg);
  background: linear-gradient(135deg, var(--color-primary) 0%, #1d4ed8 100%);
  color: var(--color-secondary);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const CheckoutTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: var(--color-secondary);
  font-size: 1.5rem;
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  transition: background-color var(--transition-fast);
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const CheckoutContent = styled.div`
  flex: 1;
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
`;

const Section = styled.div`
  background: var(--color-gray-50);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  border: 1px solid var(--color-gray-200);
`;

const SectionTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-gray-800);
  margin: 0 0 var(--spacing-md) 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
`;

const PaymentMethodGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-sm);
`;

const PaymentMethodOption = styled.label<{ $isSelected: boolean }>`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border: 2px solid ${props => props.$isSelected ? 'var(--color-primary)' : 'var(--color-gray-200)'};
  border-radius: var(--radius-md);
  background: ${props => props.$isSelected ? 'var(--color-primary-light)' : 'var(--color-secondary)'};
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &:hover {
    border-color: var(--color-primary);
    background: var(--color-primary-light);
  }
`;

const PaymentMethodInput = styled.input`
  margin: 0;
`;

const PaymentMethodIcon = styled.div`
  color: var(--color-primary);
  font-size: 1.25rem;
`;

const PaymentMethodText = styled.div`
  flex: 1;
`;

const PaymentMethodName = styled.div`
  font-weight: 600;
  color: var(--color-gray-800);
`;

const PaymentMethodDescription = styled.div`
  font-size: 0.875rem;
  color: var(--color-gray-600);
  margin-top: 2px;
`;

const TipsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const TipsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-sm);
`;

const TipButton = styled.button<{ $isSelected: boolean }>`
  padding: var(--spacing-md);
  border: 2px solid ${props => props.$isSelected ? 'var(--color-primary)' : 'var(--color-gray-200)'};
  border-radius: var(--radius-md);
  background: ${props => props.$isSelected ? 'var(--color-primary)' : 'var(--color-secondary)'};
  color: ${props => props.$isSelected ? 'var(--color-secondary)' : 'var(--color-gray-700)'};
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &:hover {
    border-color: var(--color-primary);
    background: var(--color-primary);
    color: var(--color-secondary);
  }
`;

const CustomTipInput = styled.input`
  padding: var(--spacing-md);
  border: 2px solid var(--color-gray-200);
  border-radius: var(--radius-md);
  font-size: 1rem;
  text-align: center;
  
  &:focus {
    outline: none;
    border-color: var(--color-primary);
  }
`;

const CommentsTextarea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: var(--spacing-md);
  border: 2px solid var(--color-gray-200);
  border-radius: var(--radius-md);
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: var(--color-primary);
  }
  
  &::placeholder {
    color: var(--color-gray-500);
  }
`;

const OrderSummary = styled.div`
  background: var(--color-gray-50);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  border: 1px solid var(--color-gray-200);
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
  
  &:last-child {
    margin-bottom: 0;
    padding-top: var(--spacing-sm);
    border-top: 1px solid var(--color-gray-200);
    font-weight: 600;
    font-size: 1.125rem;
  }
`;

const SummaryLabel = styled.span`
  color: var(--color-gray-700);
`;

const SummaryValue = styled.span`
  color: var(--color-gray-800);
  font-weight: 500;
`;

const CheckoutFooter = styled.div`
  padding: var(--spacing-lg);
  background: var(--color-secondary);
  border-top: 1px solid var(--color-gray-200);
  position: sticky;
  bottom: 0;
`;

const PlaceOrderButton = styled.button<{ $disabled: boolean }>`
  width: 100%;
  padding: var(--spacing-lg);
  background: ${props => props.$disabled 
    ? 'var(--color-gray-300)' 
    : 'linear-gradient(135deg, var(--color-success) 0%, #059669 100%)'};
  color: var(--color-secondary);
  border: none;
  border-radius: var(--radius-lg);
  font-size: 1.125rem;
  font-weight: 600;
  transition: all var(--transition-fast);
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: var(--color-secondary);
  animation: spin 1s ease-in-out infinite;
  margin-right: var(--spacing-sm);
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const Checkout: React.FC<CheckoutProps> = ({ isOpen, onClose, onOrderPlaced, onShowSuccess }) => {
  const { cart, getCartTotal, placeOrder, loading } = useOrder();
  
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'online'>('cash');
  const [tipType, setTipType] = useState<'none' | 'percentage' | 'custom'>('none');
  const [tipPercentage, setTipPercentage] = useState<number>(15);
  const [customTipAmount, setCustomTipAmount] = useState<string>('');
  const [comments, setComments] = useState<string>('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const subtotal = getCartTotal();
  const tipAmount = tipType === 'none' ? 0 : 
                   tipType === 'percentage' ? (subtotal * tipPercentage / 100) :
                   parseFloat(customTipAmount) || 0;
  const total = subtotal + tipAmount;

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;

    setIsPlacingOrder(true);
    try {
      const checkoutData = {
        paymentMethod: paymentMethod,
        tipAmount: tipAmount,
        comments: comments.trim(),
      };

      await placeOrder(comments.trim(), checkoutData);
      onOrderPlaced();
      onShowSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to place order:', error);
      // Handle error (could show a toast notification)
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleTipPercentageChange = (percentage: number) => {
    setTipType('percentage');
    setTipPercentage(percentage);
    setCustomTipAmount('');
  };

  const handleCustomTipChange = (value: string) => {
    setCustomTipAmount(value);
    if (value) {
      setTipType('custom');
      setTipPercentage(0);
    }
  };

  if (!isOpen) return null;

  return (
    <CheckoutOverlay $isOpen={isOpen}>
      <CheckoutContainer $isOpen={isOpen}>
        <CheckoutHeader>
          <CheckoutTitle>Checkout</CheckoutTitle>
          <CloseButton onClick={onClose}>
            {React.createElement(FiX as any)}
          </CloseButton>
        </CheckoutHeader>

        <CheckoutContent>
          {/* Payment Method Section */}
          <Section>
            <SectionTitle>
              {React.createElement(FiCreditCard as any)}
              Payment Method
            </SectionTitle>
            <PaymentMethodGrid>
              <PaymentMethodOption $isSelected={paymentMethod === 'cash'}>
                <PaymentMethodInput
                  type="radio"
                  name="payment"
                  value="cash"
                  checked={paymentMethod === 'cash'}
                  onChange={(e) => setPaymentMethod(e.target.value as 'cash')}
                />
                <PaymentMethodIcon>
                  {React.createElement(FiDollarSign as any)}
                </PaymentMethodIcon>
                <PaymentMethodText>
                  <PaymentMethodName>Cash</PaymentMethodName>
                  <PaymentMethodDescription>Pay with cash at the restaurant</PaymentMethodDescription>
                </PaymentMethodText>
              </PaymentMethodOption>

              <PaymentMethodOption $isSelected={paymentMethod === 'card'}>
                <PaymentMethodInput
                  type="radio"
                  name="payment"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => setPaymentMethod(e.target.value as 'card')}
                />
                <PaymentMethodIcon>
                  {React.createElement(FiCreditCard as any)}
                </PaymentMethodIcon>
                <PaymentMethodText>
                  <PaymentMethodName>Card</PaymentMethodName>
                  <PaymentMethodDescription>Pay with card at the restaurant</PaymentMethodDescription>
                </PaymentMethodText>
              </PaymentMethodOption>

              <PaymentMethodOption $isSelected={paymentMethod === 'online'}>
                <PaymentMethodInput
                  type="radio"
                  name="payment"
                  value="online"
                  checked={paymentMethod === 'online'}
                  onChange={(e) => setPaymentMethod(e.target.value as 'online')}
                />
                <PaymentMethodIcon>
                  {React.createElement(FiSmartphone as any)}
                </PaymentMethodIcon>
                <PaymentMethodText>
                  <PaymentMethodName>Online Payment</PaymentMethodName>
                  <PaymentMethodDescription>Pay online with card or digital wallet</PaymentMethodDescription>
                </PaymentMethodText>
              </PaymentMethodOption>
            </PaymentMethodGrid>
          </Section>

          {/* Tips Section */}
          <Section>
            <SectionTitle>
              {React.createElement(FiPercent as any)}
              Tips
            </SectionTitle>
            <TipsSection>
              <TipsGrid>
                <TipButton 
                  $isSelected={tipType === 'none'}
                  onClick={() => {
                    setTipType('none');
                    setTipPercentage(0);
                    setCustomTipAmount('');
                  }}
                >
                  No Tip
                </TipButton>
                <TipButton 
                  $isSelected={tipType === 'percentage' && tipPercentage === 15}
                  onClick={() => handleTipPercentageChange(15)}
                >
                  15%
                </TipButton>
                <TipButton 
                  $isSelected={tipType === 'percentage' && tipPercentage === 18}
                  onClick={() => handleTipPercentageChange(18)}
                >
                  18%
                </TipButton>
                <TipButton 
                  $isSelected={tipType === 'percentage' && tipPercentage === 20}
                  onClick={() => handleTipPercentageChange(20)}
                >
                  20%
                </TipButton>
                <TipButton 
                  $isSelected={tipType === 'percentage' && tipPercentage === 25}
                  onClick={() => handleTipPercentageChange(25)}
                >
                  25%
                </TipButton>
                <TipButton 
                  $isSelected={tipType === 'custom'}
                  onClick={() => {
                    setTipType('custom');
                    setTipPercentage(0);
                  }}
                >
                  Custom
                </TipButton>
              </TipsGrid>
              
              {tipType === 'custom' && (
                <CustomTipInput
                  type="number"
                  placeholder="Enter tip amount"
                  value={customTipAmount}
                  onChange={(e) => handleCustomTipChange(e.target.value)}
                  min="0"
                  step="0.01"
                />
              )}
            </TipsSection>
          </Section>

          {/* Comments Section */}
          <Section>
            <SectionTitle>
              {React.createElement(FiMessageSquare as any)}
              Special Instructions
            </SectionTitle>
            <CommentsTextarea
              placeholder="Any special requests, allergies, or delivery instructions..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              maxLength={500}
            />
          </Section>

          {/* Order Summary */}
          <OrderSummary>
            <SectionTitle>Order Summary</SectionTitle>
            <SummaryRow>
              <SummaryLabel>Subtotal</SummaryLabel>
              <SummaryValue>${subtotal.toFixed(2)}</SummaryValue>
            </SummaryRow>
            {tipAmount > 0 && (
              <SummaryRow>
                <SummaryLabel>
                  Tip {tipType === 'percentage' ? `(${tipPercentage}%)` : ''}
                </SummaryLabel>
                <SummaryValue>${tipAmount.toFixed(2)}</SummaryValue>
              </SummaryRow>
            )}
            <SummaryRow>
              <SummaryLabel>Total</SummaryLabel>
              <SummaryValue>${total.toFixed(2)}</SummaryValue>
            </SummaryRow>
          </OrderSummary>
        </CheckoutContent>

        <CheckoutFooter>
          <PlaceOrderButton
            $disabled={loading || isPlacingOrder || cart.length === 0}
            onClick={handlePlaceOrder}
          >
            {loading || isPlacingOrder ? (
              <>
                <LoadingSpinner />
                Placing Order...
              </>
            ) : (
              `Place Order - $${total.toFixed(2)}`
            )}
          </PlaceOrderButton>
        </CheckoutFooter>
      </CheckoutContainer>
    </CheckoutOverlay>
  );
};

export default Checkout;
