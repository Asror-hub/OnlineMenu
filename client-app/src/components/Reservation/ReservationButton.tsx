import React, { useState } from 'react';
import styled from 'styled-components';
import { FiCalendar, FiX } from 'react-icons/fi';
import ReservationModal from './ReservationModal';

interface ReservationButtonProps {
  variant?: 'sidebar' | 'footer' | 'floating';
  className?: string;
}

const Button = styled.button<{ $variant: string }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: ${props => props.$variant === 'floating' ? '1rem 1.5rem' : '0.875rem 1rem'};
  background: ${props => props.$variant === 'floating' 
    ? 'linear-gradient(135deg, var(--color-primary) 0%, #1d4ed8 100%)'
    : 'var(--color-primary)'
  };
  color: white;
  border: none;
  border-radius: ${props => props.$variant === 'floating' ? 'var(--radius-xl)' : 'var(--radius-lg)'};
  font-size: ${props => props.$variant === 'floating' ? '1rem' : '0.875rem'};
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: ${props => props.$variant === 'floating' 
    ? 'var(--shadow-lg)' 
    : 'var(--shadow-sm)'
  };
  width: ${props => props.$variant === 'floating' ? 'auto' : '100%'};
  justify-content: center;

  &:hover {
    background: ${props => props.$variant === 'floating'
      ? 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)'
      : '#1d4ed8'
    };
    transform: translateY(-2px);
    box-shadow: ${props => props.$variant === 'floating' 
      ? 'var(--shadow-xl)' 
      : 'var(--shadow-md)'
    };
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    width: ${props => props.$variant === 'floating' ? '20px' : '18px'};
    height: ${props => props.$variant === 'floating' ? '20px' : '18px'};
    flex-shrink: 0;
  }
`;

const FloatingButton = styled(Button)`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 100;
  border-radius: 50px;
  padding: 1rem 1.5rem;
  box-shadow: var(--shadow-xl);

  @media (max-width: 768px) {
    bottom: 1rem;
    right: 1rem;
    padding: 0.875rem 1.25rem;
    font-size: 0.875rem;
  }
`;

const SidebarButton = styled(Button)`
  background: var(--color-gray-50);
  color: var(--color-gray-700);
  border: 2px solid var(--color-gray-200);
  margin-bottom: var(--spacing-sm);

  &:hover {
    background: var(--color-primary);
    color: white;
    border-color: var(--color-primary);
  }
`;

const FooterButton = styled(Button)`
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-top: 1rem;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
  }
`;

const ReservationButton: React.FC<ReservationButtonProps> = ({ 
  variant = 'sidebar', 
  className 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSuccess = (reservation: any) => {
    console.log('Reservation created:', reservation);
    // You can add additional success handling here
  };

  const ButtonComponent = variant === 'floating' ? FloatingButton : 
                         variant === 'footer' ? FooterButton : 
                         SidebarButton;

  return (
    <>
      <ButtonComponent 
        $variant={variant}
        className={className}
        onClick={() => setIsModalOpen(true)}
      >
        <FiCalendar />
        Make a Reservation
      </ButtonComponent>

      <ReservationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
};

export default ReservationButton;

