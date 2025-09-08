import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  FiX, 
  FiCalendar, 
  FiClock, 
  FiUsers, 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiMessageSquare,
  FiCheck,
  FiAlertCircle
} from 'react-icons/fi';
import apiService, { CreateReservationRequest } from '../../services/api';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (reservation: any) => void;
}

const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 1000;
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`;

const ModalContainer = styled.div<{ $isOpen: boolean }>`
  background: white;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-2xl);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  transform: ${props => props.$isOpen ? 'scale(1)' : 'scale(0.9)'};
  transition: all var(--transition-normal);
`;

const ModalHeader = styled.div`
  padding: 1.5rem 1.5rem 1rem;
  border-bottom: 1px solid var(--color-gray-200);
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-gray-800);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: var(--color-gray-400);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);

  &:hover {
    background: var(--color-gray-100);
    color: var(--color-gray-600);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-gray-700);
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 2px solid var(--color-gray-200);
  border-radius: var(--radius-lg);
  font-size: 1rem;
  transition: all var(--transition-fast);

  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &::placeholder {
    color: var(--color-gray-400);
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 2px solid var(--color-gray-200);
  border-radius: var(--radius-lg);
  font-size: 1rem;
  background: white;
  transition: all var(--transition-fast);

  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 2px solid var(--color-gray-200);
  border-radius: var(--radius-lg);
  font-size: 1rem;
  min-height: 80px;
  resize: vertical;
  font-family: inherit;
  transition: all var(--transition-fast);

  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &::placeholder {
    color: var(--color-gray-400);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: var(--radius-lg);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  ${props => props.$variant === 'primary' ? `
    background: var(--color-primary);
    color: white;

    &:hover:not(:disabled) {
      background: #1d4ed8;
      transform: translateY(-1px);
    }
  ` : `
    background: var(--color-gray-100);
    color: var(--color-gray-700);

    &:hover:not(:disabled) {
      background: var(--color-gray-200);
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: var(--radius-lg);
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SuccessMessage = styled.div`
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #16a34a;
  padding: 0.75rem;
  border-radius: var(--radius-lg);
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
`;

const ReservationModal: React.FC<ReservationModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const [formData, setFormData] = useState<CreateReservationRequest>({
    customer_name: '',
    customer_email: 'no-email@example.com', // Default value for backend
    customer_phone: '',
    reservation_date: '',
    reservation_time: '',
    party_size: 2,
    special_requests: '',
    table_number: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Generate time options (every 30 minutes from 9 AM to 10 PM)
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 9; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        options.push(timeString);
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  // Get minimum date (today, but we'll validate time on submission)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Validate reservation time is in the future
  const validateReservationTime = (date: string, time: string) => {
    if (!date || !time) return true; // Let required validation handle empty fields
    
    const reservationDateTime = new Date(`${date}T${time}`);
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + (60 * 60 * 1000));
    
    return reservationDateTime > oneHourFromNow;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Client-side validation
    if (!formData.customer_name.trim()) {
      setError('Full name is required');
      setLoading(false);
      return;
    }

    if (!formData.customer_phone.trim()) {
      setError('Phone number is required');
      setLoading(false);
      return;
    }

    if (formData.customer_phone.length < 10) {
      setError('Phone number must be at least 10 characters');
      setLoading(false);
      return;
    }

    if (!formData.reservation_date) {
      setError('Reservation date is required');
      setLoading(false);
      return;
    }

    if (!formData.reservation_time) {
      setError('Reservation time is required');
      setLoading(false);
      return;
    }

    if (!validateReservationTime(formData.reservation_date, formData.reservation_time)) {
      setError('Reservation must be at least 1 hour in the future');
      setLoading(false);
      return;
    }

    try {
      console.log('📊 Sending reservation data:', formData);
      const reservation = await apiService.createReservation(formData);
      console.log('✅ Reservation created successfully:', reservation);
      setSuccess(true);
      
      if (onSuccess) {
        onSuccess(reservation);
      }

      // Reset form after 2 seconds
      setTimeout(() => {
        setSuccess(false);
        setFormData({
          customer_name: '',
          customer_email: 'no-email@example.com', // Default value for backend
          customer_phone: '',
          reservation_date: '',
          reservation_time: '',
          party_size: 2,
          special_requests: '',
          table_number: ''
        });
        onClose();
      }, 2000);

    } catch (err: any) {
      console.error('Reservation error:', err);
      console.error('Error details:', err.response?.data);
      
      // Handle validation errors from backend
      if (err.response?.data?.errors) {
        const errorMessages = err.response.data.errors.map((error: any) => error.msg).join(', ');
        setError(errorMessages);
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to create reservation');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  if (success) {
    return (
      <ModalOverlay $isOpen={isOpen}>
        <ModalContainer $isOpen={isOpen}>
          <ModalBody>
            <SuccessMessage>
              <FiCheck />
              Reservation created successfully! You will receive a confirmation email shortly.
            </SuccessMessage>
          </ModalBody>
        </ModalContainer>
      </ModalOverlay>
    );
  }

  return (
    <ModalOverlay $isOpen={isOpen} onClick={handleClose}>
      <ModalContainer $isOpen={isOpen} onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            <FiCalendar />
            Make a Reservation
          </ModalTitle>
          <CloseButton onClick={handleClose} disabled={loading}>
            <FiX />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          {error && (
            <ErrorMessage>
              <FiAlertCircle />
              {error}
            </ErrorMessage>
          )}

          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>
                <FiUser />
                Full Name *
              </Label>
              <Input
                type="text"
                name="customer_name"
                value={formData.customer_name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                required
              />
            </FormGroup>

            <FormRow>
              <FormGroup>
                <Label>
                  <FiPhone />
                  Phone *
                </Label>
                <Input
                  type="tel"
                  name="customer_phone"
                  value={formData.customer_phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>
                  <FiUsers />
                  Party Size *
                </Label>
                <Select
                  name="party_size"
                  value={formData.party_size}
                  onChange={handleInputChange}
                  required
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(size => (
                    <option key={size} value={size}>
                      {size} {size === 1 ? 'person' : 'people'}
                    </option>
                  ))}
                </Select>
              </FormGroup>
            </FormRow>

            <FormRow>
              <FormGroup>
                <Label>
                  <FiCalendar />
                  Date *
                </Label>
                <Input
                  type="date"
                  name="reservation_date"
                  value={formData.reservation_date}
                  onChange={handleInputChange}
                  min={getMinDate()}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>
                  <FiClock />
                  Time *
                </Label>
                <Select
                  name="reservation_time"
                  value={formData.reservation_time}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select time</option>
                  {timeOptions.map(time => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </Select>
              </FormGroup>
            </FormRow>

            <FormGroup>
              <Label>
                <FiMessageSquare />
                Special Requests
              </Label>
              <TextArea
                name="special_requests"
                value={formData.special_requests}
                onChange={handleInputChange}
                placeholder="Any special requests or dietary requirements?"
                rows={3}
              />
            </FormGroup>

            <ButtonGroup>
              <Button 
                type="button" 
                $variant="secondary" 
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                $variant="primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <LoadingSpinner />
                    Creating...
                  </>
                ) : (
                  'Make Reservation'
                )}
              </Button>
            </ButtonGroup>
          </Form>
        </ModalBody>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default ReservationModal;
