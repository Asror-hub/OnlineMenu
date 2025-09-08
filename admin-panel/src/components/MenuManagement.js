import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiEyeOff, FiFolder, FiChevronDown, FiChevronRight, FiChevronLeft, FiArrowLeft, FiArrowRight, FiImage, FiDollarSign, FiTag, FiEdit2, FiCoffee, FiDroplet, FiStar, FiSearch, FiChevronUp } from 'react-icons/fi';
import styled, { css } from 'styled-components';
import api from '../services/api';
import { API_CONFIG } from '../config';
import { useAuth } from '../contexts/AuthContext';





// Styled Components
const MenuManagementContainer = styled.div`
  padding: 32px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%);
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  position: relative;
  overflow-x: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(147, 51, 234, 0.06) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(236, 72, 153, 0.04) 0%, transparent 50%);
    pointer-events: none;
  }
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding: 32px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 20px;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.08),
    0 8px 16px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
`;

const PageTitle = styled.h1`
  margin: 0;
  font-size: 2.5rem;
  font-weight: 900;
  background: linear-gradient(135deg, #1e293b 0%, #475569 50%, #64748b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.025em;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 60px;
    height: 3px;
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    border-radius: 2px;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
  }
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.75rem;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);

  &:hover {
    background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(59, 130, 246, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

const TabContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 24px;
  background: #ffffff;
  padding: 12px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
`;

const Tab = styled.button`
  padding: 0.875rem 1.75rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  background: transparent;
  color: #64748b;

  ${props => props.active && css`
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    color: white;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
  `}

  &:hover:not([data-active="true"]) {
    background: #f1f5f9;
    color: #475569;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  max-width: 400px;
  padding: 1rem 1.25rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  background: #ffffff;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &:hover {
    border-color: #cbd5e1;
  }

  &::placeholder {
    color: #94a3b8;
  }
`;

const ContentGrid = styled.div`
  display: grid;
  gap: 24px;
  margin-top: 24px;
`;

const CategoryCard = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;



const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  padding: 0;
  max-width: 700px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  border: 1px solid #e2e8f0;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32px 32px 0 32px;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 32px;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: #1e293b;
  font-size: 1.75rem;
  font-weight: 700;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #64748b;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: #f1f5f9;
    color: #475569;
  }
`;

const Form = styled.form`
  padding: 0 32px 32px 32px;
`;

const FormGroup = styled.div`
  margin-bottom: 2rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.75rem;
  font-weight: 600;
  color: #374151;
  font-size: 1rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem 1.25rem;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.2s ease;
  min-height: 48px;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 1rem 1.25rem;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  font-size: 1rem;
  background: white;
  transition: all 0.2s ease;
  min-height: 48px;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 1rem 1.25rem;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  font-size: 1rem;
  min-height: 120px;
  resize: vertical;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
`;

const Checkbox = styled.input`
  width: 20px;
  height: 20px;
  margin: 0;
  cursor: pointer;
`;

const CheckboxLabel = styled.label`
  margin: 0;
  font-weight: 600;
  color: #374151;
  font-size: 1rem;
  cursor: pointer;
`;

const FileInput = styled.div`
  position: relative;
  display: inline-block;
  cursor: pointer;
`;

const FileInputButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 48px;

  &:hover {
    background: #e5e7eb;
    border-color: #9ca3af;
    transform: translateY(-1px);
  }
`;

const HiddenFileInput = styled.input`
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
`;

const FormActions = styled.div`
  display: flex;
  gap: 1.5rem;
  justify-content: flex-end;
  margin-top: 2.5rem;
  padding-top: 2rem;
  border-top: 1px solid #e2e8f0;
`;

const SubmitButton = styled.button`
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 48px;

  &:hover {
    background: linear-gradient(135deg, #059669 0%, #047857 100%);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const CancelButton = styled.button`
  padding: 1rem 2rem;
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 48px;

  &:hover {
    background: #e5e7eb;
    border-color: #9ca3af;
  }
`;



const SuccessMessage = styled.div`
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  color: #16a34a;
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid #bbf7d0;
  margin-bottom: 1rem;
  font-size: 0.95rem;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(22, 163, 74, 0.1);
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const ResetButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.5rem;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  color: #64748b;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  &:hover {
    background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
    border-color: #94a3b8;
  }
`;

const AddCategoryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.5rem;
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.2);

  &:hover {
    background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  }
`;

const ErrorMessage = styled.div`
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border: 1px solid #fecaca;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.1);
`;

const ErrorContent = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: #dc2626;
  font-weight: 600;
`;

const ErrorIcon = styled.span`
  font-size: 1.5rem;
`;

const ErrorActions = styled.div`
  display: flex;
  gap: 12px;
`;

const RetryButton = styled.button`
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(220, 38, 38, 0.2);
  }
`;

const CloseErrorButton = styled.button`
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: linear-gradient(135deg, #4b5563 0%, #374151 100%);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(107, 114, 128, 0.2);
  }
`;

const MenuContent = styled.div`
`;

const SearchSection = styled.div`
  margin-bottom: 24px;
`;

const SearchContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  overflow: hidden;
  transition: all 0.2s ease;

  &:focus-within {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 16px;
  color: #64748b;
  z-index: 2;
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const ClearSearchButton = styled.button`
  position: absolute;
  right: 16px;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #64748b;
  z-index: 2;

  &:hover {
    background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
    color: #475569;
  }
`;

const SearchResultsInfo = styled.div`
  margin-top: 12px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border: 1px solid #bfdbfe;
  border-radius: 12px;
  color: #1e40af;
  font-weight: 600;
  text-align: center;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
`;

const EmptySearchState = styled.div`
  text-align: center;
  padding: 60px 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 20px;
  border: 2px dashed #cbd5e1;
  margin: 40px 0;

  .empty-icon {
    font-size: 4rem;
    color: #94a3b8;
    margin-bottom: 16px;
  }
`;

const MenuGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px 0;
`;

const MenuItemCard = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: relative;
  display: flex;
  height: 140px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    border-color: #3b82f6;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover::before {
    opacity: 1;
  }
`;

const ItemImageContainer = styled.div`
  position: relative;
  width: 140px;
  height: 140px;
  overflow: hidden;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  flex-shrink: 0;

  .item-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.2s ease;
  }

  &:hover .item-image {
    transform: scale(1.05);
  }
`;

const ItemStatusBadge = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;

  .status {
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  .status.active {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
  }

  .status.inactive {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: white;
  }
`;

const ItemContent = styled.div`
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const ItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
`;

const ItemTitle = styled.h3`
  margin: 0;
  color: #1e293b;
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.3;
  flex: 1;
  margin-right: 16px;
`;

const PriceAmount = styled.span`
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 1.1rem;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  white-space: nowrap;
`;

const ItemDescription = styled.p`
  color: #64748b;
  font-size: 0.85rem;
  line-height: 1.4;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ItemMeta = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-size: 0.85rem;

  .meta-icon {
    color: #94a3b8;
    width: 16px;
    height: 16px;
  }

  .meta-text {
    font-weight: 500;
  }
`;

const ItemActions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: nowrap;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: none;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  min-width: 0;

  &.edit-btn {
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    color: white;

    &:hover {
      background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }
  }

  &.delete-btn {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: white;

    &:hover {
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    }
  }

  &.toggle-btn {
    background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
    color: #475569;
    border: 1px solid #cbd5e1;

    &:hover {
      background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    &.active {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      border-color: #10b981;

      &:hover {
        background: linear-gradient(135deg, #059669 0%, #047857 100%);
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
      }
    }

    &.inactive {
      background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
      color: #dc2626;
      border-color: #fecaca;

      &:hover {
        background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
        box-shadow: 0 4px 12px rgba(220, 38, 38, 0.1);
      }
    }
  }

  svg {
    width: 16px;
    height: 16px;
    transition: transform 0.2s ease;
  }

  &:hover svg {
    transform: scale(1.1);
  }
`;



const EmptyIcon = styled.div`
  font-size: 4rem;
  color: #94a3b8;
  margin-bottom: 16px;
`;

const CategoriesContent = styled.div`
`;

const CategoriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  margin-top: 24px;
`;

const MenuItemsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
  margin-top: 24px;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  color: #64748b;
`;

const LoadingSpinnerStyled = styled.div`
  width: 60px;
  height: 60px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 24px;

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #1e293b;
`;

const LoadingSubtext = styled.div`
  font-size: 1.1rem;
  color: #64748b;
  margin-bottom: 24px;
`;

const LoadingRetryBtn = styled.button`
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);

  &:hover {
    background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  }
`;

const CategoriesSection = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  margin-bottom: 32px;
`;

const CategoriesHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 2px solid rgba(59, 130, 246, 0.1);
`;

const CategoriesTitle = styled.h2`
  margin: 0;
  color: #1e293b;
  font-size: 1.75rem;
  font-weight: 800;
  background: linear-gradient(135deg, #1e293b 0%, #475569 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const AddCategoryBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);

  &:hover {
    background: linear-gradient(135deg, #059669 0%, #047857 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(16, 185, 129, 0.3);
  }

  svg {
    transition: all 0.2s ease;
  }

  &:hover svg {
    transform: scale(1.1);
  }
`;

const ReorderInstructions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 1px solid #f59e0b;
  border-radius: 16px;
  padding: 16px 20px;
  margin-bottom: 24px;
  font-size: 0.95rem;
  color: #92400e;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
`;

const ReorderIcon = styled.span`
  font-size: 1.2rem;
`;

const CategoriesCarousel = styled.div`
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding: 8px 4px;
  margin-bottom: 32px;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;

  &::-webkit-scrollbar {
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  }
`;

const CategoryChip = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 2px solid ${props => props.$active ? '#3b82f6' : '#e2e8f0'};
  border-radius: 20px;
  padding: 20px 24px;
  min-width: 280px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  ${props => props.$active && css`
    border-color: #3b82f6;
    background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  `}
`;

const MoveButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-right: 8px;
`;

const MoveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  color: #64748b;
  cursor: pointer;
  font-size: 14px;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
    color: #475569;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const ClickableContent = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
`;

const ChipIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, ${props => props.$active ? '#3b82f6' : '#f1f5f9'} 0%, ${props => props.$active ? '#1d4ed8' : '#e2e8f0'} 100%);
  border-radius: 12px;
  color: ${props => props.$active ? 'white' : '#64748b'};
  font-size: 20px;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const ChipContent = styled.div`
  flex: 1;

  h4 {
    margin: 0 0 4px 0;
    color: #1e293b;
    font-size: 1.1rem;
    font-weight: 700;
  }

  .subcategory-count {
    color: #64748b;
    font-size: 0.9rem;
    font-weight: 500;
  }
`;

const ChipActions = styled.div`
  display: flex;
  gap: 8px;
  margin-left: 8px;
`;

const ActionBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 16px;

  &:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &.edit:hover:not(:disabled) {
    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
    color: #1d4ed8;
    border-color: #3b82f6;
  }

  &.delete:hover:not(:disabled) {
    background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
    color: #dc2626;
    border-color: #ef4444;
  }



  svg {
    transition: all 0.2s ease;
  }

  &:hover:not(:disabled) svg {
    transform: scale(1.1);
  }
`;

const EmptyCategories = styled.div`
  text-align: center;
  padding: 48px 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 2px dashed #cbd5e1;
  border-radius: 20px;
  color: #64748b;

  p {
    margin: 0 0 20px 0;
    font-size: 1.1rem;
    font-weight: 600;
  }
`;

// Enhanced Subcategories Section
const SubcategoriesSection = styled.div`
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 20px;
  padding: 28px;
  margin-top: 24px;
  border: 1px solid rgba(59, 130, 246, 0.1);
`;

const SubcategoriesHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(59, 130, 246, 0.1);

  h4 {
    margin: 0;
    color: #1e293b;
    font-size: 1.3rem;
    font-weight: 700;
  }
`;

const AddSubcategoryBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.2);

  &:hover {
    background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  }
`;

const SubcategoriesCarousel = styled.div`
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 8px 4px;
  margin-bottom: 24px;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
    border-radius: 3px;
  }
`;

const SubcategoryChip = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, #ffffff 0%, #faf5ff 100%);
  border: 2px solid ${props => props.$selected ? '#8b5cf6' : '#e2e8f0'};
  border-radius: 16px;
  padding: 16px 20px;
  min-width: 220px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  ${props => props.$selected && css`
    border-color: #8b5cf6;
    background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.15);
  `}
`;

const SubcategoryIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, ${props => props.$selected ? '#8b5cf6' : '#f1f5f9'} 0%, ${props => props.$selected ? '#7c3aed' : '#e2e8f0'} 100%);
  border-radius: 10px;
  color: ${props => props.$selected ? 'white' : '#64748b'};
  font-size: 16px;
`;

const SubcategoryContent = styled.div`
  flex: 1;

  h5 {
    margin: 0;
    color: #1e293b;
    font-size: 1rem;
    font-weight: 600;
  }
`;

const SubcategoryMoveButtons = styled.div`
  display: flex;
  gap: 4px;
  margin-right: 8px;
`;

const SubcategoryMoveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 12px;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
    color: #4f46e5;
    border-color: #6366f1;
    transform: scale(1.05);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const SubcategoryActions = styled.div`
  display: flex;
  gap: 6px;
  margin-left: 8px;
`;

const SubcategoryActionBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;

  &:hover {
    transform: scale(1.1);
  }

  &.edit-btn:hover {
    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
    color: #1d4ed8;
    border-color: #3b82f6;
  }

  &.delete-btn:hover {
    background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
    color: #dc2626;
    border-color: #ef4444;
  }
`;

const EmptySubcategories = styled.div`
  text-align: center;
  padding: 32px 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 2px dashed #cbd5e1;
  border-radius: 16px;
  color: #64748b;

  p {
    margin: 0 0 16px 0;
    font-size: 1rem;
    font-weight: 500;
  }
`;

// Enhanced Menu Items Section
const MenuItemsSection = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 20px;
  padding: 28px;
  margin-top: 24px;
  border: 1px solid rgba(59, 130, 246, 0.1);
`;

const MenuItemsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(59, 130, 246, 0.1);

  h4 {
    margin: 0;
    color: #1e293b;
    font-size: 1.3rem;
    font-weight: 700;
  }

  .subcategory-filter {
    color: #8b5cf6;
    font-weight: 600;
  }
`;

const HeaderActionsStyled = styled.div`
  display: flex;
  gap: 12px;
`;

const AddItemBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(6, 182, 212, 0.2);

  &:hover {
    background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%);
  }
`;

const MenuList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const MenuItemRow = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
`;

const ItemImage = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ItemInfo = styled.div`
  flex: 1;

  .item-title {
    margin: 0 0 4px 0;
    color: #1e293b;
    font-size: 1.1rem;
    font-weight: 600;
  }
`;

const ItemPrice = styled.div`
  .price {
    color: #059669;
    font-size: 1.1rem;
    font-weight: 700;
  }
`;

const ItemActionsStyled = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ItemActionBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  color: #64748b;
  cursor: pointer;
  font-size: 16px;

  &.edit:hover {
    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
    color: #1d4ed8;
    border-color: #3b82f6;
  }

  &.delete:hover {
    background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
    color: #dc2626;
    border-color: #ef4444;
  }
`;

const ToggleSwitchContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const ToggleSwitch = styled.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + .toggle-label .toggle-slider {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  }

  &:checked + .toggle-label .toggle-slider:before {
    transform: translateX(20px);
  }
`;

const ToggleLabel = styled.label`
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  background: #cbd5e1;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #94a3b8;
  }

  .toggle-slider {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .toggle-slider:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }
`;

const EmptyMenuItems = styled.div`
  text-align: center;
  padding: 32px 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 2px dashed #cbd5e1;
  border-radius: 16px;
  color: #64748b;

  p {
    margin: 0 0 16px 0;
    font-size: 1rem;
    font-weight: 500;
  }
`;

const NoCategorySelected = styled.div`
  text-align: center;
  padding: 48px 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 2px dashed #cbd5e1;
  border-radius: 20px;
  color: #64748b;

  p {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 500;
  }
`;

const MenuManagement = () => {
  const { user, restaurantId } = useAuth();
  
  // Helper function to construct full image URL (for backward compatibility)
  const getFullImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http')) return imageUrl; // Already a full URL (B2)
    return `${API_CONFIG.BASE_URL}${imageUrl}`; // Fallback for local URLs
  };

  // Helper function to get icon component
  const getIconComponent = (iconName) => {
    switch (iconName) {
      case 'FiTag':
        return <FiTag />;
      case 'FiFolder':
        return <FiFolder />;
      case 'FiCoffee':
        return <FiCoffee />;
      case 'FiDroplet':
        return <FiDroplet />;
      case 'FiStar':
        return <FiStar />;
      default:
        return <FiTag />; // Fallback icon
    }
  };

  // Simple Category Component with Move Buttons
  const CategoryChipWithMoveButtons = ({ category, isActive, onClick, onEdit, onDelete, index, totalCategories, onMoveUp, onMoveDown }) => {
    
    return (
      <CategoryChip active={isActive}>
        {/* Move Buttons */}
        <MoveButtons>
          <MoveButton 
            onClick={(e) => {
              e.stopPropagation();
              if (onMoveUp && typeof onMoveUp === 'function') {
                onMoveUp(index);
              }
            }}
            disabled={index === 0}
            title="Move Left (Earlier)"
          >
            <FiArrowLeft />
          </MoveButton>
          <MoveButton 
            onClick={(e) => {
              e.stopPropagation();
              if (onMoveDown && typeof onMoveDown === 'function') {
                onMoveDown(index);
              }
            }}
            disabled={index === totalCategories - 1}
            title="Move Right (Later)"
          >
            <FiArrowRight />
          </MoveButton>
        </MoveButtons>
        
        {/* Clickable Content */}
        <ClickableContent onClick={onClick}>
          <ChipIcon active={isActive}>
            {getIconComponent(category.icon)}
          </ChipIcon>
          <ChipContent>
            <h4>{category.name}</h4>
            <span className="subcategory-count">
              {category.subcategories?.length || 0} subcategories
            </span>
          </ChipContent>
        </ClickableContent>
        
        <ChipActions>
          <ActionBtn 
            className="edit"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(category);
            }}
          >
            <FiEdit2 />
          </ActionBtn>
          <ActionBtn 
            className="delete"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(category.id);
            }}
            title="Delete category"
          >
            <FiTrash2 />
          </ActionBtn>
        </ChipActions>
      </CategoryChip>
    );
  };

  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('categories'); // 'categories' or 'menu'
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [error, setError] = useState(''); // New state for error messages
  const [searchTerm, setSearchTerm] = useState(''); // Search functionality
  
  // Modal states
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showAddSubcategoryModal, setShowAddSubcategoryModal] = useState(false);
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [showEditSubcategoryModal, setShowEditSubcategoryModal] = useState(false);

  // Form data states
  const [itemFormData, setItemFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    subcategory_id: '',
    image: '',
    available: true
  });

  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    parent_category_id: '',
    icon: 'FiTag'
  });

  const [subcategoryFormData, setSubcategoryFormData] = useState({
    name: '',
    category_id: '',
    icon: 'FiTag'
  });

  // Editing states
  const [editingItem, setEditingItem] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [selectedCategoryForSubcategory, setSelectedCategoryForSubcategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);

  useEffect(() => {
    fetchMenuData();
  }, [user, restaurantId]);



  const fetchMenuData = async () => {
    try {
      setLoading(true);
      
      const [items, cats] = await Promise.all([
        api.getMenuItems(),
        api.getCategories()
      ]);
      
      // The backend already returns categories with their subcategories in the correct order
      // No need to manually associate them
      setMenuItems(items || []);
      setCategories(cats || []);
      
    } catch (error) {
      console.error('Error fetching menu data:', error);
      setError(`Failed to load data: ${error.message}`);
      // Initialize with empty arrays if API fails
      setMenuItems([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategoryExpansion = (categoryId) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleAddItem = () => {
    setItemFormData({
      name: '',
      description: '',
      price: '',
      category_id: '',
      subcategory_id: '',
      image: '',
      available: true
    });
    setShowAddItemModal(true);
  };

  const handleAddCategory = () => {
    setShowAddCategoryModal(true);
    resetCategoryForm();
  };

  // Move Buttons functionality
  const handleMoveUp = async (index) => {
    if (index === 0) return; // Can't move up if already at top
    
    const newCategories = [...categories];
    const temp = newCategories[index];
    newCategories[index] = newCategories[index - 1];
    newCategories[index - 1] = temp;
    
    // Store original order for potential revert
    const originalCategories = [...categories];
    
    // Update frontend state immediately
    setCategories(newCategories);

    // Update positions in backend
    try {
      const categoryOrders = newCategories.map((cat, idx) => ({
        id: cat.id,
        position: idx
      }));
      
      await api.reorderCategories(categoryOrders);
      
      // No need to refresh from backend since we're maintaining the order locally
      // and the backend will return the correct order on next fetch
      
    } catch (error) {
      console.error('Failed to reorder categories:', error);
      // Revert to original order if backend update fails
      setCategories(originalCategories);
    }
  };

  const handleMoveDown = async (index) => {
    if (index === categories.length - 1) return; // Can't move down if already at bottom
    
    const newCategories = [...categories];
    const temp = newCategories[index];
    newCategories[index] = newCategories[index + 1];
    newCategories[index + 1] = temp;
    
    // Store original order for potential revert
    const originalCategories = [...categories];
    
    // Update frontend state immediately
    setCategories(newCategories);

    // Update positions in backend
    try {
      const categoryOrders = newCategories.map((cat, idx) => ({
        id: cat.id,
        position: idx
      }));
      
      await api.reorderCategories(categoryOrders);
      
      // No need to refresh from backend since we're maintaining the order locally
      // and the backend will return the correct order on next fetch
      
    } catch (error) {
      console.error('Failed to reorder categories:', error);
      // Revert to original order if backend update fails
      setCategories(originalCategories);
    }
  };

  // Subcategory Move Buttons functionality
  const handleSubcategoryMoveUp = async (categoryId, index) => {
    if (index === 0) return; // Can't move up if already at top
    
    const category = categories.find(c => c.id === categoryId);
    if (!category || !category.subcategories) return;
    
    const newSubcategories = [...category.subcategories];
    const temp = newSubcategories[index];
    newSubcategories[index] = newSubcategories[index - 1];
    newSubcategories[index - 1] = temp;
    
    // Store original order for potential revert
    const originalCategories = [...categories];
    
    // Update frontend state immediately
    const updatedCategories = categories.map(c => 
      c.id === categoryId 
        ? { ...c, subcategories: newSubcategories }
        : c
    );
    setCategories(updatedCategories);

    // Update positions in backend
    try {
      const subcategoryOrders = newSubcategories.map((subcat, idx) => ({
        id: subcat.id,
        position: idx
      }));
      
      await api.reorderSubcategories(subcategoryOrders);
      
      // No need to refresh from backend since we're maintaining the order locally
      // and the backend will return the correct order on next fetch
      
    } catch (error) {
      console.error('Failed to reorder subcategories:', error);
      // Revert to original order if backend update fails
      setCategories(originalCategories);
    }
  };

  const handleSubcategoryMoveDown = async (categoryId, index) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category || !category.subcategories || index === category.subcategories.length - 1) return; // Can't move down if already at bottom
    
    const newSubcategories = [...category.subcategories];
    const temp = newSubcategories[index];
    newSubcategories[index] = newSubcategories[index + 1];
    newSubcategories[index + 1] = temp;
    
    // Store original order for potential revert
    const originalCategories = [...categories];
    
    // Update frontend state immediately
    const updatedCategories = categories.map(c => 
      c.id === categoryId 
        ? { ...c, subcategories: newSubcategories }
        : c
    );
    setCategories(updatedCategories);

    // Update positions in backend
    try {
      const subcategoryOrders = newSubcategories.map((subcat, idx) => ({
        id: subcat.id,
        position: idx
      }));
      
      await api.reorderSubcategories(subcategoryOrders);
      
      // No need to refresh from backend since we're maintaining the order locally
      // and the backend will return the correct order on next fetch
      
    } catch (error) {
      console.error('Failed to reorder subcategories:', error);
      // Revert to original order if backend update fails
      setCategories(originalCategories);
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setItemFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category_id,
      subcategory: item.subcategory_id || '',
      image: item.image_url || '',
      available: item.is_active
    });
    setShowEditItemModal(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      parent_category_id: category.parent_category_id || '',
      icon: category.icon || 'FiTag'
    });
    setShowEditCategoryModal(true);
  };



  const handleDeleteSubcategory = async (id) => {
    if (window.confirm('⚠️ PERMANENT DELETION: Are you sure you want to delete this subcategory? This will PERMANENTLY delete all menu items and images within this subcategory. This action cannot be undone!')) {
      try {
        setLoading(true);
        setError('');
        
        await api.deleteSubcategory(id);
        
        // Refresh the complete data to maintain relationships
        await fetchMenuData();
        
        // Show success message
        setError(''); // Clear any previous errors
      } catch (error) {
        console.error('Error deleting subcategory:', error);
        setError(error.message || 'Failed to delete subcategory');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm('⚠️ PERMANENT DELETION: Are you sure you want to delete this menu item? This will PERMANENTLY remove the item and its image from both the database and cloud storage. This action cannot be undone!')) {
      try {
        setLoading(true);
        setError('');
        
        await api.deleteMenuItem(id);
        
        // Refresh the complete data to maintain relationships
        await fetchMenuData();
        
        // Show success message
        setError(''); // Clear any previous errors
      } catch (error) {
        console.error('Error deleting menu item:', error);
        setError(error.message || 'Failed to delete menu item');
      } finally {
        setLoading(false);
      }
    }
    };

  const handleToggleAvailability = async (id, newStatus) => {
    try {
      setLoading(true);
      setError('');
      
      // Update the item's availability status using the dedicated API method
      const updatedItem = await api.updateMenuItemAvailability(id, newStatus);
      
      // Refresh the complete data to maintain relationships
      await fetchMenuData();
      
      console.log(`Item ${id} availability set to: ${newStatus}`);
    } catch (error) {
      console.error('Error updating item availability:', error);
      setError(error.message || 'Failed to update item availability');
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      
      // Prepare the data, converting empty string to null for parent_category_id
      const categoryData = {
        name: categoryFormData.name,
        parent_category_id: categoryFormData.parent_category_id || null,
        icon: categoryFormData.icon
      };
      
      if (showAddCategoryModal) {
        const newCategory = await api.createCategory(categoryData);
        // Refresh the complete data to get subcategories
        await fetchMenuData();
        setShowAddCategoryModal(false);
      } else if (showEditCategoryModal) {
        const updatedCategory = await api.updateCategory(editingCategory.id, categoryData);
        // Refresh the complete data to get subcategories
        await fetchMenuData();
        setShowEditCategoryModal(false);
        setEditingCategory(null);
      }
    } catch (error) {
      console.error('Error saving category:', error);
      setError(error.message || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('⚠️ PERMANENT DELETION: Are you sure you want to delete this category? This will PERMANENTLY delete all subcategories, menu items, and images. This action cannot be undone!')) {
      try {
        setLoading(true);
        setError('');
        
        await api.deleteCategory(id);
        
        // Refresh the complete data to maintain relationships
        await fetchMenuData();
        
        // Show success message
        setError(''); // Clear any previous errors
        // You could add a success state here if you want to show success messages
      } catch (error) {
        console.error('Error deleting category:', error);
        setError(error.message || 'Failed to delete category');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleItemSubmit = async (e) => {
    e.preventDefault();
    
    console.log('DEBUG: handleItemSubmit called!');
    console.log('DEBUG: Form event:', e);
    console.log('DEBUG: Current itemFormData:', itemFormData);
    
    try {
      setLoading(true);
      setError('');
      
      // Debug: Log the form data
      console.log('Submitting menu item form data:', itemFormData);
      console.log('Image type:', typeof itemFormData.image);
      console.log('Image instanceof File:', itemFormData.image instanceof File);
      console.log('Category value:', itemFormData.category_id, 'Type:', typeof itemFormData.category_id);
      console.log('Subcategory value:', itemFormData.subcategory_id, 'Type:', typeof itemFormData.subcategory_id);
      if (itemFormData.image) {
        console.log('Image name:', itemFormData.image.name);
        console.log('Image size:', itemFormData.image.size);
      }
      
      if (showAddItemModal) {
        console.log('DEBUG: About to call api.createMenuItem with:', itemFormData);
        const newItem = await api.createMenuItem(itemFormData);
        console.log('DEBUG: API returned new item:', newItem);
        
        // Refresh the complete data to maintain relationships
        console.log('DEBUG: About to call fetchMenuData()');
        await fetchMenuData();
        console.log('DEBUG: fetchMenuData() completed');
        
        // Reset form and close modal
        setItemFormData({
          name: '',
          description: '',
          price: '',
          category_id: '',
          subcategory_id: '',
          image: '',
          available: true
        });
        setShowAddItemModal(false);
      } else if (showEditItemModal) {
        const updatedItem = await api.updateMenuItem(editingItem.id, itemFormData);
        
        // Refresh the complete data to maintain relationships
        await fetchMenuData();
        
        setShowEditItemModal(false);
        setEditingItem(null);
      }
    } catch (error) {
      console.error('Error saving menu item:', error);
      setError(error.message || 'Failed to save menu item');
    } finally {
      setLoading(false);
    }
  };

  const handleSubcategorySubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      
      if (showAddSubcategoryModal) {
        const newSubcategory = await api.createSubcategory(subcategoryFormData);
        
        // Update the categories state to include the new subcategory
        setCategories(categories.map(cat => {
          if (cat.id === subcategoryFormData.category_id) {
            return {
              ...cat,
              subcategories: [...(cat.subcategories || []), newSubcategory]
            };
          }
          return cat;
        }));
        
        setShowAddSubcategoryModal(false);
        setSelectedCategoryForSubcategory(null);
      } else if (showEditSubcategoryModal) {
        const updatedSubcategory = await api.updateSubcategory(editingSubcategory.id, subcategoryFormData);
        
        // Update the categories state
        setCategories(categories.map(cat => {
          if (cat.id === subcategoryFormData.category_id) {
            return {
              ...cat,
              subcategories: (cat.subcategories || []).map(subcat => 
                subcat.id === editingSubcategory.id 
                  ? updatedSubcategory
                  : subcat
              )
            };
          }
          return cat;
        }));
        
        setShowEditSubcategoryModal(false);
        setEditingSubcategory(null);
      }
    } catch (error) {
      console.error('Error saving subcategory:', error);
      setError(error.message || 'Failed to save subcategory');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e, formType = 'item') => {
    const { name, value } = e.target;
    
    console.log('DEBUG: handleInputChange called:', { name, value, formType });
    
    if (formType === 'category') {
      setCategoryFormData(prev => ({ ...prev, [name]: value }));
    } else if (formType === 'subcategory') {
      setSubcategoryFormData(prev => ({ ...prev, [name]: value }));
    } else {
      setItemFormData(prev => {
        const newData = { ...prev, [name]: value };
        console.log('DEBUG: Updated itemFormData:', newData);
        return newData;
      });
    }
  };

  const getParentCategories = () => {
    console.log('DEBUG: getParentCategories called, categories:', categories);
    return categories.filter(cat => cat.id !== 'uncategorized');
  };

  const getSubcategories = (categoryId) => {
    if (!categoryId || categoryId === 'uncategorized') return [];
    const category = categories.find(cat => parseInt(cat.id) === parseInt(categoryId));
    console.log('DEBUG: getSubcategories called with categoryId:', categoryId);
    console.log('DEBUG: Found category:', category);
    console.log('DEBUG: Category subcategories:', category?.subcategories);
    return category ? category.subcategories || [] : [];
  };

  const getCategoryName = (item) => {
    if (item.category_name) return item.category_name;
    if (item.category) return item.category;
    return 'Uncategorized';
  };

  const getSubcategoryName = (item) => {
    if (item.subcategory_name) return item.subcategory_name;
    if (item.subcategory) return item.subcategory;
    return '';
  };

  // Filter menu items based on search term
  const getFilteredMenuItems = () => {
    if (!searchTerm.trim()) return menuItems;
    
    const searchLower = searchTerm.toLowerCase();
    return menuItems.filter(item => 
      item.name.toLowerCase().includes(searchLower) ||
      (item.description && item.description.toLowerCase().includes(searchLower)) ||
      getCategoryName(item).toLowerCase().includes(searchLower) ||
      getSubcategoryName(item).toLowerCase().includes(searchLower) ||
      item.price.toString().includes(searchLower)
    );
  };

  const handleRefresh = () => {
    fetchMenuData();
  };

  const handleReset = () => {
    setMenuItems([]);
    setCategories([]);
    setSelectedCategoryForSubcategory(null);
    setSelectedSubcategory(null);
    setError('');
  };

  const handleAddSubcategory = (categoryId) => {
    setSelectedCategoryForSubcategory(categoryId);
    setSubcategoryFormData({
      name: '',
      category_id: categoryId,
      icon: 'FiTag'
    });
    setShowAddSubcategoryModal(true);
  };

  const resetSubcategoryForm = () => {
    setSubcategoryFormData({
      name: '',
      category_id: '',
      icon: 'FiTag'
    });
  };

  const resetCategoryForm = () => {
    setCategoryFormData({
      name: '',
      parent_category_id: '',
      icon: 'FiTag'
    });
  };



  if (loading) {
    return (
      <LoadingContainer>
        <LoadingSpinnerStyled></LoadingSpinnerStyled>
        <LoadingText>Loading menu data...</LoadingText>
        <LoadingSubtext>This may take a few seconds</LoadingSubtext>
        <LoadingRetryBtn onClick={fetchMenuData}>Retry</LoadingRetryBtn>
      </LoadingContainer>
    );
  }

  return (
    <MenuManagementContainer>
      <PageHeader>
        <PageTitle>Menu Management</PageTitle>
        <HeaderActions>
          <ResetButton onClick={handleReset}>
            Reset
          </ResetButton>
          <AddCategoryButton onClick={handleAddCategory}>
            <FiFolder /> Add Category
          </AddCategoryButton>
          <AddButton onClick={handleAddItem}>
            <FiPlus /> Add Menu Item
          </AddButton>
        </HeaderActions>
      </PageHeader>

      <TabContainer>
        <Tab 
          active={activeTab === 'categories'}
          onClick={() => setActiveTab('categories')}
        >
          <FiFolder /> Categories
        </Tab>
        <Tab 
          active={activeTab === 'menu'}
          onClick={() => setActiveTab('menu')}
        >
          <FiEye /> Menu Items
        </Tab>
      </TabContainer>

      {error && (
        <ErrorMessage>
          <ErrorContent>
            <ErrorIcon>⚠️</ErrorIcon>
            <span>{error}</span>
          </ErrorContent>
          <ErrorActions>
            <RetryButton onClick={fetchMenuData}>Retry</RetryButton>
            <CloseErrorButton onClick={() => setError('')}>&times;</CloseErrorButton>
          </ErrorActions>
        </ErrorMessage>
      )}

      {activeTab === 'menu' && (
        <MenuContent>
          {/* Search Bar */}
          <SearchSection>
            <SearchContainer>
              <SearchIcon>
                <FiSearch />
              </SearchIcon>
              <SearchInput
                type="text"
                placeholder="Search menu items by name, description, category, or price..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <ClearSearchButton
                  onClick={() => setSearchTerm('')}
                  title="Clear search"
                >
                  ×
                </ClearSearchButton>
              )}
            </SearchContainer>
            {searchTerm && (
              <SearchResultsInfo>
                Showing {getFilteredMenuItems().length} of {menuItems.length} items
              </SearchResultsInfo>
            )}
          </SearchSection>

          {getFilteredMenuItems().length === 0 ? (
            searchTerm ? (
              <EmptySearchState>
                <EmptyIcon>
                  <FiSearch />
                </EmptyIcon>
                <h3>No items found</h3>
                <p>No menu items match your search for "{searchTerm}"</p>
                <ClearSearchButton onClick={() => setSearchTerm('')}>
                  Clear Search
                </ClearSearchButton>
              </EmptySearchState>
            ) : (
              <EmptySearchState>
                <EmptyIcon>
                  <FiPlus />
                </EmptyIcon>
                <h3>No Menu Items Yet</h3>
                <p>Start building your menu by adding your first item.</p>
                <AddButton onClick={handleAddItem}>
                  Add Your First Item
                </AddButton>
              </EmptySearchState>
            )
          ) : (
            <MenuGrid>
              {getFilteredMenuItems().map((item) => (
                <MenuItemCard key={item.id}>
                  <ItemImageContainer>
                    <img 
                      src={getFullImageUrl(item.image_url) || 'https://via.placeholder.com/200x150'} 
                      alt={item.name}
                      className="item-image"
                    />
                    <ItemStatusBadge>
                      {item.is_active ? (
                        <span className="status active">Available</span>
                      ) : (
                        <span className="status inactive">Unavailable</span>
                      )}
                    </ItemStatusBadge>
                  </ItemImageContainer>
                  
                  <ItemContent>
                    <ItemHeader>
                      <ItemTitle>{item.name}</ItemTitle>
                      <div className="item-price">
                        <PriceAmount>${parseFloat(item.price).toFixed(2)}</PriceAmount>
                      </div>
                    </ItemHeader>
                    
                    {item.description && (
                      <ItemDescription>{item.description}</ItemDescription>
                    )}
                    
                    <ItemMeta>
                      <MetaItem>
                        <FiFolder className="meta-icon" />
                        <span className="meta-text">
                          {item.category_name || categories.find(c => parseInt(c.id) === parseInt(item.category_id))?.name || 'Uncategorized'}
                        </span>
                      </MetaItem>
                      {item.subcategory_id && (
                        <MetaItem>
                          <FiTag className="meta-icon" />
                          <span className="meta-text">
                            {item.subcategory_name || categories
                              .find(c => parseInt(c.id) === parseInt(item.category_id))
                              ?.subcategories?.find(s => parseInt(s.id) === parseInt(item.subcategory_id))?.name || 'Unknown'}
                          </span>
                        </MetaItem>
                      )}
                    </ItemMeta>
                    
                    <ItemActions>
                      <ActionButton 
                        className="edit-btn"
                        onClick={() => handleEditItem(item)}
                        title="Edit Item"
                      >
                        <FiEdit2 />
                        <span>Edit</span>
                      </ActionButton>
                      <ActionButton 
                        className="delete-btn"
                        onClick={() => handleDeleteItem(item.id)}
                        title="Delete Item"
                      >
                        <FiTrash2 />
                        <span>Delete</span>
                      </ActionButton>
                      <ActionButton 
                        className={`toggle-btn ${item.is_active ? 'active' : 'inactive'}`}
                        onClick={() => handleToggleAvailability(item.id, !item.is_active)}
                        title={item.is_active ? 'Set Unavailable' : 'Set Available'}
                      >
                        {item.is_active ? <FiEye /> : <FiEyeOff />}
                        <span>{item.is_active ? 'Available' : 'Unavailable'}</span>
                      </ActionButton>
                    </ItemActions>
                  </ItemContent>
                </MenuItemCard>
              ))}
            </MenuGrid>
          )}
        </MenuContent>
      )}

      {activeTab === 'categories' && (
        <CategoriesSection>

          <CategoriesHeader>
            <CategoriesTitle>Categories & Subcategories</CategoriesTitle>
            <AddCategoryBtn
              onClick={() => {
                setShowAddCategoryModal(true);
                resetCategoryForm();
              }}
            >
              <FiPlus /> Add Category
            </AddCategoryBtn>
          </CategoriesHeader>
          
          <div style={{ 
            background: '#fff3cd', 
            border: '1px solid #ffc107', 
            borderRadius: '8px', 
            padding: '12px', 
            marginBottom: '16px',
            fontSize: '14px',
            color: '#856404'
          }}>
            <strong>⚠️ PERMANENT DELETION:</strong> Deleting a category will PERMANENTLY remove all subcategories, menu items, and images from both the database and cloud storage. 
            Deleting a subcategory will PERMANENTLY remove all menu items and images. This action cannot be undone!
          </div>
          
          <ReorderInstructions>
            <ReorderIcon>⬆️⬇️</ReorderIcon>
            <span>Use the up/down arrow buttons to reorder categories. The order will be reflected in the client app.</span>
            <button 
              onClick={() => console.log('🎯 Categories:', categories)} 
              style={{ 
                marginLeft: 'auto',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              📊 Log Categories
            </button>
          </ReorderInstructions>

          {/* Categories Carousel */}
          <CategoriesCarousel>
            {categories.length > 0 ? (
              categories.map((category, index) => (
                <CategoryChipWithMoveButtons
                  key={category.id}
                  category={category}
                  isActive={selectedCategoryForSubcategory === category.id}
                  index={index}
                  totalCategories={categories.length}
                  onClick={() => {
                    setSelectedCategoryForSubcategory(category.id);
                    setSelectedSubcategory(null); // Clear subcategory selection when category changes
                  }}
                  onEdit={(category) => {
                    setEditingCategory(category);
                    setCategoryFormData({
                      name: category.name,
                      parent_category_id: category.parent_category_id || '',
                      icon: category.icon || 'FiTag'
                    });
                    setShowEditCategoryModal(true);
                  }}
                  onDelete={handleDeleteCategory}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                />
              ))
            ) : (
              <EmptyCategories>
                <p>No categories yet</p>
                <AddCategoryBtn
                  onClick={() => {
                    setShowAddCategoryModal(true);
                    resetCategoryForm();
                  }}
                >
                  <FiPlus /> Create Your First Category
                </AddCategoryBtn>
              </EmptyCategories>
            )}
          </CategoriesCarousel>

                    {/* Subcategories Section - Only show when a category is selected */}
          {selectedCategoryForSubcategory ? (
            <SubcategoriesSection>
              <SubcategoriesHeader>
                <h4>
                  Subcategories for "{categories.find(c => c.id === selectedCategoryForSubcategory)?.name}"
                </h4>
                <AddSubcategoryBtn
                  onClick={() => handleAddSubcategory(selectedCategoryForSubcategory)}
                >
                  <FiPlus /> Add Subcategory
                </AddSubcategoryBtn>
              </SubcategoriesHeader>

              {/* Subcategories Carousel */}
              <SubcategoriesCarousel>
                {categories.find(c => c.id === selectedCategoryForSubcategory)?.subcategories?.length > 0 ? (
                  categories.find(c => c.id === selectedCategoryForSubcategory)?.subcategories.map((subcat, index) => (
                    <SubcategoryChip 
                      key={subcat.id} 
                      $selected={selectedSubcategory === subcat.id}
                      onClick={() => setSelectedSubcategory(subcat.id)}
                    >
                      <SubcategoryMoveButtons>
                        <SubcategoryMoveButton 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSubcategoryMoveUp(selectedCategoryForSubcategory, index);
                          }}
                          disabled={index === 0}
                          title="Move Left (Earlier)"
                        >
                          <FiArrowLeft />
                        </SubcategoryMoveButton>
                        <SubcategoryMoveButton 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSubcategoryMoveDown(selectedCategoryForSubcategory, index);
                          }}
                          disabled={index === categories.find(c => c.id === selectedCategoryForSubcategory)?.subcategories?.length - 1}
                          title="Move Right (Later)"
                        >
                          <FiArrowRight />
                        </SubcategoryMoveButton>
                      </SubcategoryMoveButtons>
                      <SubcategoryIcon $selected={selectedSubcategory === subcat.id}>
                        {getIconComponent(subcat.icon)}
                      </SubcategoryIcon>
                      <SubcategoryContent>
                        <h5>{subcat.name}</h5>
                      </SubcategoryContent>
                      <SubcategoryActions>
                        <SubcategoryActionBtn 
                          className="edit-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingSubcategory(subcat);
                            setSubcategoryFormData({
                              name: subcat.name,
                              category_id: selectedCategoryForSubcategory,
                              icon: subcat.icon || 'FiTag'
                            });
                            setShowEditSubcategoryModal(true);
                          }}
                        >
                          <FiEdit2 />
                        </SubcategoryActionBtn>
                        <SubcategoryActionBtn 
                          className="delete-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSubcategory(subcat.id);
                          }}
                        >
                          <FiTrash2 />
                        </SubcategoryActionBtn>
                      </SubcategoryActions>
                    </SubcategoryChip>
                  ))
                ) : (
                  <EmptySubcategories>
                    <p>No subcategories yet</p>
                    <AddSubcategoryBtn
                      onClick={() => handleAddSubcategory(selectedCategoryForSubcategory)}
                    >
                      <FiPlus /> Add Subcategory
                    </AddSubcategoryBtn>
                  </EmptySubcategories>
                )}
              </SubcategoriesCarousel>

              {/* Debug Info */}
              <div style={{ 
                background: '#f0f9ff', 
                border: '1px solid #0ea5e9', 
                borderRadius: '8px', 
                padding: '12px', 
                marginBottom: '16px',
                fontSize: '12px'
              }}>
                <strong>DEBUG:</strong> Category ID: {selectedCategoryForSubcategory} | 
                Subcategory ID: {selectedSubcategory || 'None'} | 
                Total Menu Items: {menuItems.length} | 
                Items in Category: {menuItems.filter(item => parseInt(item.category_id) === parseInt(selectedCategoryForSubcategory)).length}
                <br />
                <strong>Category Details:</strong> {(() => {
                  const cat = categories.find(c => parseInt(c.id) === parseInt(selectedCategoryForSubcategory));
                  return cat ? `Name: ${cat.name}, Subcategories: ${cat.subcategories?.length || 0}` : 'Not found';
                })()}
                <br />
                <strong>Menu Items in Category:</strong> {(() => {
                  const items = menuItems.filter(item => parseInt(item.category_id) === parseInt(selectedCategoryForSubcategory));
                  return items.map(item => `${item.name} (ID: ${item.id})`).join(', ') || 'None';
                })()}
              </div>

              {/* Menu Items for Selected Category */}
              <MenuItemsSection>
                <MenuItemsHeader>
                  <h4>
                    Menu Items
                    {selectedSubcategory && (
                      <span className="subcategory-filter">
                        {' '}in "{categories.find(c => c.id === selectedCategoryForSubcategory)?.subcategories?.find(s => s.id === selectedSubcategory)?.name}"
                      </span>
                    )}
                  </h4>
                  <HeaderActionsStyled>
                    <AddItemBtn
                      onClick={() => {
                        setItemFormData({
                          name: '',
                          description: '',
                          price: '',
                          category_id: selectedCategoryForSubcategory,
                          subcategory_id: selectedSubcategory || '',
                          image: '',
                          available: true
                        });
                        setShowAddItemModal(true);
                      }}
                    >
                      <FiPlus /> Add Menu Item
                    </AddItemBtn>
                  </HeaderActionsStyled>
                </MenuItemsHeader>
                <MenuList>
                  {(() => {
                    let filteredItems = menuItems.filter(item => {
                      const itemCategoryId = parseInt(item.category_id);
                      const selectedCategoryId = parseInt(selectedCategoryForSubcategory);
                      return itemCategoryId === selectedCategoryId;
                    });
                    
                    if (selectedSubcategory) {
                      filteredItems = filteredItems.filter(item => {
                        const itemSubcategoryId = parseInt(item.subcategory_id);
                        const selectedSubcategoryId = parseInt(selectedSubcategory);
                        return itemSubcategoryId === selectedSubcategoryId;
                      });
                    }
                    
                    return filteredItems;
                  })().length > 0 ? (
                    (() => {
                      let filteredItems = menuItems.filter(item => parseInt(item.category_id) === parseInt(selectedCategoryForSubcategory));
                      if (selectedSubcategory) {
                        filteredItems = filteredItems.filter(item => parseInt(item.subcategory_id) === parseInt(selectedSubcategory));
                      }
                      return filteredItems;
                    })().map((item) => (
                      <MenuItemRow key={item.id}>
                        <ItemImage>
                          <img src={getFullImageUrl(item.image_url) || 'https://via.placeholder.com/60'} alt={item.name} />
                        </ItemImage>
                        
                        <ItemInfo>
                          <h3 className="item-title">{item.name}</h3>
                        </ItemInfo>
                        
                        <ItemPrice>
                          <span className="price">${item.price}</span>
                        </ItemPrice>
                        
                        <ItemActionsStyled>
                          <ItemActionBtn 
                            className="edit"
                            onClick={() => {
                              setEditingItem(item);
                              setItemFormData({
                                name: item.name,
                                description: item.description,
                                price: item.price.toString(),
                                category_id: item.category_id,
                                subcategory_id: item.subcategory_id || '',
                                image: item.image_url || '',
                                available: item.is_active
                              });
                              setShowEditItemModal(true);
                            }}
                            title="Edit Item"
                          >
                            <FiEdit />
                          </ItemActionBtn>
                          <ItemActionBtn 
                            className="delete"
                            onClick={() => handleDeleteItem(item.id)}
                            title="Delete Item"
                          >
                            <FiTrash2 />
                          </ItemActionBtn>
                          <ToggleSwitchContainer>
                            <ToggleSwitch
                              type="checkbox"
                              id={`toggle-cat-${item.id}`}
                              checked={item.is_active}
                              onChange={() => handleToggleAvailability(item.id, !item.is_active)}
                            />
                            <ToggleLabel 
                              htmlFor={`toggle-cat-${item.id}`}
                              title={item.is_active ? 'Set Unavailable' : 'Set Available'}
                            >
                              <span className="toggle-slider"></span>
                            </ToggleLabel>
                          </ToggleSwitchContainer>
                        </ItemActionsStyled>
                      </MenuItemRow>
                    ))
                  ) : (
                    <EmptyMenuItems>
                      <p>
                        {selectedSubcategory 
                          ? `No menu items in subcategory "${categories.find(c => c.id === selectedCategoryForSubcategory)?.subcategories?.find(s => s.id === selectedSubcategory)?.name}"`
                          : 'No menu items in this category'
                        }
                      </p>
                      <AddItemBtn
                        onClick={() => {
                          setItemFormData({
                            name: '',
                            description: '',
                            price: '',
                            category_id: selectedCategoryForSubcategory,
                            subcategory_id: selectedSubcategory || '',
                            image: '',
                            available: true
                          });
                          setShowAddItemModal(true);
                        }}
                      >
                        <FiPlus /> Add Menu Item
                      </AddItemBtn>
                    </EmptyMenuItems>
                  )}
                </MenuList>
              </MenuItemsSection>
            </SubcategoriesSection>
          ) : (
            <NoCategorySelected>
              <p>👆 Click on a category above to manage its subcategories and menu items</p>
            </NoCategorySelected>
          )}
        </CategoriesSection>
      )}

      {/* Modals Section */}
        {/* Add/Edit Item Modal */}
        {(showAddItemModal || showEditItemModal) && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>{showAddItemModal ? 'Add New Menu Item' : 'Edit Menu Item'}</ModalTitle>
              <CloseButton onClick={() => {
                setShowAddItemModal(false);
                setShowEditItemModal(false);
              }}>&times;</CloseButton>
            </ModalHeader>
            <Form onSubmit={handleItemSubmit}>
              <FormGroup>
                <Label>Name</Label>
                <Input
                  type="text"
                  name="name"
                  value={itemFormData.name}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Label>Price</Label>
                <div style={{ position: 'relative' }}>
                  <FiDollarSign style={{ 
                    position: 'absolute', 
                    left: '12px', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: '#64748b',
                    zIndex: 1
                  }} />
                  <Input
                    type="number"
                    name="price"
                    value={itemFormData.price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    required
                    style={{ paddingLeft: '40px' }}
                  />
                </div>
              </FormGroup>
              
              <FormGroup>
                <Label>Description</Label>
                <Textarea
                  name="description"
                  value={itemFormData.description}
                  onChange={handleInputChange}
                  rows="3"
                  required
                />
              </FormGroup>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <FormGroup>
                  <Label>Category</Label>
                  <Select
                    name="category_id"
                    value={itemFormData.category_id}
                    onChange={handleInputChange}
                    required
                    onFocus={() => console.log('DEBUG: Category field focused, current value:', itemFormData.category_id)}
                  >
                    <option value="">Select Category</option>
                    {getParentCategories().map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </Select>
                </FormGroup>
                <FormGroup>
                  <Label>Subcategory</Label>
                  <Select
                    name="subcategory_id"
                    value={itemFormData.subcategory_id}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Subcategory</option>
                    {itemFormData.category_id && getSubcategories(itemFormData.category_id).map(subcat => (
                      <option key={subcat.id} value={subcat.id}>{subcat.name}</option>
                    ))}
                  </Select>
                </FormGroup>
              </div>
              
              <FormGroup>
                <Label>Image</Label>
                <FileInput>
                  <FileInputButton 
                    type="button"
                    onClick={() => document.getElementById('image-upload').click()}
                  >
                    <FiImage />
                    {itemFormData.image ? 'Change Image' : 'Choose Image'}
                  </FileInputButton>
                  <HiddenFileInput
                    id="image-upload"
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setItemFormData(prev => ({
                          ...prev,
                          image: file
                        }));
                      }
                    }}
                  />
                </FileInput>
                
                {/* Show selected filename */}
                {itemFormData.image && (
                  <div style={{ 
                    marginTop: '12px', 
                    padding: '8px 12px', 
                    background: '#f0f9ff', 
                    borderRadius: '8px', 
                    border: '1px solid #0ea5e9',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <FiImage style={{ color: '#0ea5e9' }} />
                    <span style={{ fontSize: '14px', color: '#0c4a6e', fontWeight: '500' }}>
                      {typeof itemFormData.image === 'string' ? 'Image selected' : itemFormData.image.name}
                    </span>
                  </div>
                )}
                
                {/* Show current image when editing */}
                {showEditItemModal && editingItem?.image_url && !itemFormData.image && (
                  <div style={{ marginTop: '12px', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#64748b' }}>Current Image:</p>
                    <img 
                      src={getFullImageUrl(editingItem.image_url)} 
                      alt="Current" 
                      style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                  </div>
                )}
                
                {/* Show preview of new image */}
                {itemFormData.image && (
                  <div style={{ marginTop: '12px', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#64748b' }}>Image Preview:</p>
                    <img 
                      src={typeof itemFormData.image === 'string' ? itemFormData.image : URL.createObjectURL(itemFormData.image)} 
                      alt="Preview"
                      style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                  </div>
                )}
              </FormGroup>
              
              <FormGroup>
                <CheckboxContainer>
                  <Checkbox
                    type="checkbox"
                    name="available"
                    checked={itemFormData.available}
                    onChange={handleInputChange}
                  />
                  <CheckboxLabel>Available for ordering</CheckboxLabel>
                </CheckboxContainer>
              </FormGroup>
              
              <FormActions>
                <CancelButton type="button" onClick={() => {
                  setShowAddItemModal(false);
                  setShowEditItemModal(false);
                }}>
                  Cancel
                </CancelButton>
                <SubmitButton type="submit">
                  {showAddItemModal ? 'Add Item' : 'Update Item'}
                </SubmitButton>
              </FormActions>
            </Form>
          </ModalContent>
        </Modal>
      )}

      {/* Add/Edit Category Modal */}
      {(showAddCategoryModal || showEditCategoryModal) && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>{showAddCategoryModal ? 'Add New Category' : 'Edit Category'}</ModalTitle>
              <CloseButton onClick={() => {
                setShowAddCategoryModal(false);
                setShowEditCategoryModal(false);
                setEditingCategory(null);
                resetCategoryForm();
              }}>&times;</CloseButton>
            </ModalHeader>
            <Form onSubmit={handleCategorySubmit}>
              <FormGroup>
                <Label>Name</Label>
                <Input
                  type="text"
                  name="name"
                  value={categoryFormData.name}
                  onChange={(e) => handleInputChange(e, 'category')}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Label>Parent Category (Optional)</Label>
                <Select
                  name="parent_category_id"
                  value={categoryFormData.parent_category_id}
                  onChange={(e) => handleInputChange(e, 'category')}
                >
                  <option value="">No Parent (Main Category)</option>
                  {categories.filter(cat => cat.id !== editingCategory?.id).map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </Select>
              </FormGroup>
              
              <FormGroup>
                <Label>Icon</Label>
                <Select
                  name="icon"
                  value={categoryFormData.icon}
                  onChange={(e) => handleInputChange(e, 'category')}
                >
                  <option value="FiTag">Tag</option>
                  <option value="FiFolder">Folder</option>
                  <option value="FiCoffee">Coffee</option>
                  <option value="FiDroplet">Droplet</option>
                  <option value="FiStar">Star</option>
                </Select>
              </FormGroup>
              
              <FormActions>
                <CancelButton type="button" onClick={() => {
                  setShowAddCategoryModal(false);
                  setShowEditCategoryModal(false);
                  setEditingCategory(null);
                  resetCategoryForm();
                }}>
                  Cancel
                </CancelButton>
                <SubmitButton type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Category'}
                </SubmitButton>
              </FormActions>
            </Form>
          </ModalContent>
        </Modal>
      )}

      {/* Add/Edit Subcategory Modal */}
      {(showAddSubcategoryModal || showEditSubcategoryModal) && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>{showAddSubcategoryModal ? 'Add New Subcategory' : 'Edit Subcategory'}</ModalTitle>
              <CloseButton onClick={() => {
                setShowAddSubcategoryModal(false);
                setShowEditSubcategoryModal(false);
                setEditingSubcategory(null);
                setSelectedCategoryForSubcategory(null);
                resetSubcategoryForm();
              }}>&times;</CloseButton>
            </ModalHeader>
            <Form onSubmit={handleSubcategorySubmit}>
              <FormGroup>
                <Label>Name</Label>
                <Input
                  type="text"
                  name="name"
                  value={subcategoryFormData.name}
                  onChange={(e) => handleInputChange(e, 'subcategory')}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Label>Category</Label>
                <Select
                  name="category_id"
                  value={subcategoryFormData.category_id}
                  onChange={(e) => handleInputChange(e, 'subcategory')}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </Select>
              </FormGroup>
              
              <FormGroup>
                <Label>Icon</Label>
                <Select
                  name="icon"
                  value={subcategoryFormData.icon}
                  onChange={(e) => handleInputChange(e, 'subcategory')}
                >
                  <option value="FiTag">Tag</option>
                  <option value="FiFolder">Folder</option>
                  <option value="FiCoffee">Coffee</option>
                  <option value="FiDroplet">Droplet</option>
                  <option value="FiStar">Star</option>
                </Select>
              </FormGroup>
              
              <FormActions>
                <CancelButton type="button" onClick={() => {
                  setShowAddSubcategoryModal(false);
                  setShowEditSubcategoryModal(false);
                  setEditingSubcategory(null);
                  setSelectedCategoryForSubcategory(null);
                  resetSubcategoryForm();
                }}>
                  Cancel
                </CancelButton>
                <SubmitButton type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Subcategory'}
                </SubmitButton>
              </FormActions>
            </Form>
          </ModalContent>
        </Modal>
      )}
    </MenuManagementContainer>
  );
};

export default MenuManagement;
