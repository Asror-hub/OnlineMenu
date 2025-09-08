import React, { useState } from 'react';
import styled from 'styled-components';
import { FiStar, FiSend, FiHeart, FiThumbsUp, FiMessageSquare, FiShoppingBag } from 'react-icons/fi';
import api from '../../services/api';

interface OrderItem {
  menu_item_id: number;
  quantity: number;
  notes?: string;
  menuItem: {
    id: number;
    name: string;
    price: string;
    image_url?: string;
  };
}

interface FeedbackFormProps {
  orderId: number;
  orderNumber: string;
  customerName?: string;
  customerEmail?: string;
  orderItems?: OrderItem[];
  onClose: () => void;
  onFeedbackSubmitted?: (orderId: number) => void;
}

interface FeedbackData {
  order_id: number | null;
  customer_name: string;
  customer_email?: string;
  rating: number;
  food_rating?: number;
  service_rating?: number;
  atmosphere_rating?: number;
  feedback_text?: string;
  feedback_type?: 'general' | 'complaint' | 'compliment' | 'suggestion';
  is_public?: boolean;
}

const FormContainer = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 16px;
  padding: var(--spacing-lg);
  max-width: 480px;
  width: 100%;
  margin: 0 auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  backdrop-filter: blur(10px);
`;

const FormHeader = styled.div`
  text-align: center;
  margin-bottom: var(--spacing-lg);
`;

const FormTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-primary);
  margin: 0 0 var(--spacing-xs) 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
`;

const FormSubtitle = styled.p`
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  margin: 0;
  opacity: 0.8;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const RatingSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
`;

const RatingLabel = styled.label`
  font-weight: 500;
  color: var(--color-text);
  font-size: 0.9rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StarContainer = styled.div`
  display: flex;
  gap: 2px;
  align-items: center;
`;

const StarButton = styled.button<{ $filled: boolean }>`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  color: ${props => props.$filled ? '#fbbf24' : '#d1d5db'};
  transition: all 0.2s ease;
  padding: 2px;
  
  &:hover {
    color: #fbbf24;
    transform: scale(1.1);
  }
`;

const RatingValue = styled.span`
  font-weight: 500;
  color: var(--color-primary);
  font-size: 0.85rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: var(--spacing-sm);
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  font-family: inherit;
  resize: vertical;
  transition: all 0.2s ease;
  background: #fafbfc;
  
  &:focus {
    outline: none;
    border-color: var(--color-primary);
    background: white;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &::placeholder {
    color: #94a3b8;
    font-size: 0.85rem;
  }
`;

const TypeSelector = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-xs);
`;

const TypeButton = styled.button<{ $selected: boolean }>`
  padding: var(--spacing-sm);
  border: 1px solid ${props => props.$selected ? 'var(--color-primary)' : '#e2e8f0'};
  border-radius: 6px;
  background: ${props => props.$selected ? 'var(--color-primary-light)' : '#fafbfc'};
  color: ${props => props.$selected ? 'var(--color-primary)' : 'var(--color-text)'};
  font-weight: 500;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  
  &:hover {
    border-color: var(--color-primary);
    background: var(--color-primary-light);
    transform: translateY(-1px);
  }
`;

const SubmitButton = styled.button<{ $disabled: boolean }>`
  background: ${props => props.$disabled ? '#94a3b8' : 'linear-gradient(135deg, var(--color-primary) 0%, #1d4ed8 100%)'};
  color: white;
  border: none;
  border-radius: 8px;
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
  
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const SuccessMessage = styled.div<{ $isLocal?: boolean }>`
  background: ${props => props.$isLocal ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' : 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)'};
  color: ${props => props.$isLocal ? '#92400e' : '#065f46'};
  padding: var(--spacing-md);
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  border: 1px solid ${props => props.$isLocal ? '#f59e0b' : '#10b981'};
`;

const ErrorMessage = styled.div`
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #dc2626;
  padding: var(--spacing-sm);
  border-radius: 6px;
  font-size: 0.85rem;
  text-align: center;
  border: 1px solid #f87171;
`;

const OrderItemsSection = styled.div`
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  border: 1px solid #e2e8f0;
`;

const OrderItemsTitle = styled.h3`
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-primary);
  margin: 0 0 var(--spacing-sm) 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
`;

const OrderItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xs) 0;
  border-bottom: 1px solid #e2e8f0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const ItemName = styled.span`
  font-size: 0.85rem;
  color: #374151;
  font-weight: 500;
`;

const ItemQuantity = styled.span`
  font-size: 0.8rem;
  color: #6b7280;
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
  margin-right: var(--spacing-xs);
`;

const ItemPrice = styled.span`
  font-size: 0.85rem;
  color: var(--color-primary);
  font-weight: 600;
`;

const FeedbackForm: React.FC<FeedbackFormProps> = ({
  orderId,
  orderNumber,
  customerName = 'Guest',
  customerEmail = '',
  orderItems = [],
  onClose,
  onFeedbackSubmitted
}) => {
  const [ratings, setRatings] = useState({
    overall: 0,
    food: 0,
    service: 0,
    atmosphere: 0
  });
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackType, setFeedbackType] = useState<'general' | 'complaint' | 'compliment' | 'suggestion'>('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isLocalSave, setIsLocalSave] = useState(false);

  const renderStars = (rating: number, onRatingChange: (rating: number) => void) => {
    return Array.from({ length: 5 }, (_, index) => (
      <StarButton
        key={index}
        type="button"
        $filled={index < rating}
        onClick={() => onRatingChange(index + 1)}
      >
        <FiStar />
      </StarButton>
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (ratings.overall === 0) {
      setError('Please provide an overall rating');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const feedbackData: FeedbackData = {
        order_id: orderId, // Pass orderId directly - backend will handle 0 as general feedback
        customer_name: customerName || 'Guest',
        customer_email: customerEmail || '',
        rating: ratings.overall,
        food_rating: ratings.food,
        service_rating: ratings.service,
        atmosphere_rating: ratings.atmosphere,
        feedback_text: feedbackText,
        feedback_type: feedbackType,
        is_public: true
      };

      const result = await api.submitFeedback(feedbackData);
      
      // Check if feedback was saved locally
      if (result.message && result.message.includes('saved locally')) {
        setIsLocalSave(true);
      }
      
      setIsSubmitted(true);
      console.log('Feedback submitted successfully:', result);
      
      // Call the feedback submitted callback if provided
      if (onFeedbackSubmitted && orderId > 0) {
        onFeedbackSubmitted(orderId);
      }
    } catch (err: any) {
      console.error('Failed to submit feedback:', err);
      setError(err.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <FormContainer>
        <SuccessMessage $isLocal={isLocalSave}>
          <FiHeart />
          {isLocalSave ? (
            <>
              Feedback saved locally!<br />
              <small>(Server needs restart to submit to database)</small>
            </>
          ) : (
            'Thank you for your feedback!'
          )}
        </SuccessMessage>
      </FormContainer>
    );
  }

  return (
    <FormContainer>
      <FormHeader>
        <FormTitle>
          <FiMessageSquare />
          Share Your Experience
        </FormTitle>
        <FormSubtitle>
          {orderNumber === 'Finished Orders' 
            ? 'How was your dining experience?' 
            : `How was your order #${orderNumber}?`
          }
        </FormSubtitle>
      </FormHeader>

      {/* Display ordered items if available */}
      {orderItems && orderItems.length > 0 && (
        <OrderItemsSection>
          <OrderItemsTitle>
            <FiShoppingBag />
            Your Order Items
          </OrderItemsTitle>
          {orderItems.map((item, index) => (
            <OrderItem key={index}>
              <div>
                <ItemQuantity>{item.quantity}x</ItemQuantity>
                <ItemName>{item.menuItem.name}</ItemName>
              </div>
              <ItemPrice>${(parseFloat(item.menuItem.price) * item.quantity).toFixed(2)}</ItemPrice>
            </OrderItem>
          ))}
        </OrderItemsSection>
      )}

      <Form onSubmit={handleSubmit}>
        <RatingSection>
          <RatingLabel>
            Overall Rating *
            <RatingValue>{ratings.overall > 0 ? `${ratings.overall}/5` : ''}</RatingValue>
          </RatingLabel>
          <StarContainer>
            {renderStars(ratings.overall, (rating) => setRatings(prev => ({ ...prev, overall: rating })))}
          </StarContainer>
        </RatingSection>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-sm)' }}>
          <RatingSection>
            <RatingLabel>
              Food
              <RatingValue>{ratings.food > 0 ? `${ratings.food}/5` : ''}</RatingValue>
            </RatingLabel>
            <StarContainer>
              {renderStars(ratings.food, (rating) => setRatings(prev => ({ ...prev, food: rating })))}
            </StarContainer>
          </RatingSection>

          <RatingSection>
            <RatingLabel>
              Service
              <RatingValue>{ratings.service > 0 ? `${ratings.service}/5` : ''}</RatingValue>
            </RatingLabel>
            <StarContainer>
              {renderStars(ratings.service, (rating) => setRatings(prev => ({ ...prev, service: rating })))}
            </StarContainer>
          </RatingSection>
        </div>

        <RatingSection>
          <RatingLabel>
            Atmosphere
            <RatingValue>{ratings.atmosphere > 0 ? `${ratings.atmosphere}/5` : ''}</RatingValue>
          </RatingLabel>
          <StarContainer>
            {renderStars(ratings.atmosphere, (rating) => setRatings(prev => ({ ...prev, atmosphere: rating })))}
          </StarContainer>
        </RatingSection>

        <RatingSection>
          <RatingLabel>Additional Comments</RatingLabel>
          <TextArea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="Tell us more about your experience..."
            maxLength={500}
          />
        </RatingSection>

        <RatingSection>
          <RatingLabel>Feedback Type</RatingLabel>
          <TypeSelector>
            <TypeButton
              type="button"
              $selected={feedbackType === 'general'}
              onClick={() => setFeedbackType('general')}
            >
              <FiMessageSquare />
              General
            </TypeButton>
            <TypeButton
              type="button"
              $selected={feedbackType === 'compliment'}
              onClick={() => setFeedbackType('compliment')}
            >
              <FiThumbsUp />
              Compliment
            </TypeButton>
            <TypeButton
              type="button"
              $selected={feedbackType === 'suggestion'}
              onClick={() => setFeedbackType('suggestion')}
            >
              <FiMessageSquare />
              Suggestion
            </TypeButton>
            <TypeButton
              type="button"
              $selected={feedbackType === 'complaint'}
              onClick={() => setFeedbackType('complaint')}
            >
              <FiMessageSquare />
              Complaint
            </TypeButton>
          </TypeSelector>
        </RatingSection>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <SubmitButton type="submit" $disabled={isSubmitting}>
          <FiSend />
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </SubmitButton>
      </Form>
    </FormContainer>
  );
};

export default FeedbackForm;
