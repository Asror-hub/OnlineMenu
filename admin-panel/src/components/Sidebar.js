import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useRestaurant } from '../contexts/RestaurantContext';
import { FiHome, FiMenu, FiShoppingCart, FiUsers, FiSettings, FiLogOut, FiShoppingBag, FiCalendar, FiMessageSquare } from 'react-icons/fi';
import styled, { keyframes, css } from 'styled-components';

// 🎨 INCREDIBLE AMAZING Keyframes
const slideInLeft = keyframes`
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
`;

const glowPulse = keyframes`
  0%, 100% {
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
  }
  50% {
    box-shadow: 0 0 30px rgba(59, 130, 246, 0.6), 0 0 40px rgba(59, 130, 246, 0.4);
  }
`;

const floatAnimation = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-5px);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
`;

const bounceIn = keyframes`
  0% {
    transform: scale(0.3);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const ripple = keyframes`
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(4);
    opacity: 0;
  }
`;

// 🚀 INCREDIBLE AMAZING Styled Components
const SidebarContainer = styled.aside`
  width: 280px;
  min-width: 280px;
  height: 100vh;
  background: linear-gradient(180deg, #1e293b 0%, #334155 50%, #475569 100%);
  background-size: 200% 200%;
  animation: ${shimmer} 8s ease-in-out infinite;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;
  overflow: hidden;
  box-shadow: 
    0 0 40px rgba(0, 0, 0, 0.3),
    0 0 80px rgba(59, 130, 246, 0.1),
    inset 0 0 0 1px rgba(255, 255, 255, 0.1);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(147, 51, 234, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(236, 72, 153, 0.08) 0%, transparent 50%);
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 1px;
    height: 100%;
    background: linear-gradient(180deg, transparent 0%, rgba(59, 130, 246, 0.5) 50%, transparent 100%);
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
  }
`;

const SidebarHeader = styled.div`
  padding: 32px 24px 24px;
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(51, 65, 85, 0.9) 100%);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%);
    animation: ${floatAnimation} 6s ease-in-out infinite;
  }
`;

const HeaderTitle = styled.h2`
  margin: 0 0 8px 0;
  font-size: 1.75rem;
  font-weight: 800;
  background: linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.025em;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  animation: ${bounceIn} 1s ease-out;
`;

const WelcomeText = styled.p`
  margin: 0;
  color: #cbd5e1;
  font-size: 0.95rem;
  font-weight: 500;
  opacity: 0.9;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  animation: ${bounceIn} 1s ease-out 0.2s both;
`;

const SidebarNav = styled.nav`
  padding: 24px 0;
  flex: 1;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%);
    border-radius: 3px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%);
    box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
  }
`;

const NavList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const NavItem = styled.li`
  margin: 0 16px;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    left: -16px;
    top: 0;
    width: 4px;
    height: 100%;
    background: linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%);
    border-radius: 0 4px 4px 0;
    opacity: 0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    transform: scaleY(0);
  }

  &:hover::before {
    opacity: 1;
    transform: scaleY(1);
  }
`;

const NavLinkStyled = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  color: #e2e8f0;
  text-decoration: none;
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid transparent;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transition: left 0.5s ease;
  }

  &:hover {
    color: #ffffff;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(147, 51, 234, 0.1) 100%);
    border-color: rgba(59, 130, 246, 0.3);
    transform: translateX(8px) scale(1.02);
    box-shadow: 
      0 8px 25px rgba(0, 0, 0, 0.2),
      0 0 20px rgba(59, 130, 246, 0.2);
  }

  &:hover::before {
    left: 100%;
  }

  ${props => props.$isActive && css`
    color: #ffffff;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(147, 51, 234, 0.2) 100%);
    border-color: rgba(59, 130, 246, 0.5);
    box-shadow: 
      0 8px 25px rgba(0, 0, 0, 0.3),
      0 0 30px rgba(59, 130, 246, 0.3);
    animation: ${glowPulse} 2s ease-in-out infinite;
    
    &::after {
      content: '';
      position: absolute;
      right: -8px;
      top: 50%;
      transform: translateY(-50%);
      width: 0;
      height: 0;
      border-left: 8px solid #3b82f6;
      border-top: 6px solid transparent;
      border-bottom: 6px solid transparent;
      filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.8));
    }
  `}
`;

const NavIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: inherit;
  transition: all 0.3s ease;
  
  svg {
    width: 20px;
    height: 20px;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
  }

  ${props => props.$isActive && css`
    transform: scale(1.2);
    filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.8));
  `}
`;

const NavText = styled.span`
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.025em;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
`;

const SidebarFooter = styled.div`
  padding: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.8) 100%);
  backdrop-filter: blur(20px);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 50% 50%, rgba(239, 68, 68, 0.1) 0%, transparent 70%);
    pointer-events: none;
  }
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  padding: 16px 20px;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.1) 100%);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 16px;
  color: #fca5a5;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: rgba(239, 68, 68, 0.3);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    transition: width 0.6s ease, height 0.6s ease;
  }

  &:hover {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.4) 0%, rgba(220, 38, 38, 0.2) 100%);
    border-color: rgba(239, 68, 68, 0.6);
    color: #fecaca;
    transform: translateY(-2px);
    box-shadow: 
      0 8px 25px rgba(0, 0, 0, 0.3),
      0 0 20px rgba(239, 68, 68, 0.3);
  }

  &:hover::before {
    width: 300px;
    height: 300px;
  }

  &:active {
    transform: translateY(0);
  }
`;

const LogoutIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: inherit;
  transition: all 0.3s ease;
  
  svg {
    width: 20px;
    height: 20px;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
  }
`;

const LogoutText = styled.span`
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.025em;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
`;

const RestaurantInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const RestaurantIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  color: #10b981;
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const RestaurantName = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: #e2e8f0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
`;

const Sidebar = () => {
  const { logout, user } = useAuth();
  const { restaurant } = useRestaurant();
  const location = useLocation();

  const navItems = [
    { path: `/${restaurant?.slug}/admin`, label: 'Dashboard', icon: FiHome },
    { path: `/${restaurant?.slug}/admin/menu`, label: 'Menu Management', icon: FiMenu },
    { path: `/${restaurant?.slug}/admin/orders`, label: 'Orders', icon: FiShoppingCart },
    { path: `/${restaurant?.slug}/admin/reservations`, label: 'Reservations', icon: FiCalendar },
    { path: `/${restaurant?.slug}/admin/feedbacks`, label: 'Feedbacks', icon: FiMessageSquare },
    { path: `/${restaurant?.slug}/admin/users`, label: 'Users', icon: FiUsers },
    { path: `/${restaurant?.slug}/admin/settings`, label: 'Settings', icon: FiSettings }
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <SidebarContainer>
      <SidebarHeader>
        <HeaderTitle>Admin Panel</HeaderTitle>
        <RestaurantInfo>
          <RestaurantIcon>
            <FiShoppingBag />
          </RestaurantIcon>
          <RestaurantName>{restaurant?.name || 'Loading...'}</RestaurantName>
        </RestaurantInfo>
        <WelcomeText>Welcome, {user?.name}</WelcomeText>
      </SidebarHeader>
      
      <SidebarNav>
        <NavList>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <NavItem key={item.path}>
                <NavLinkStyled
                  to={item.path}
                  $isActive={isActive}
                >
                  <NavIcon $isActive={isActive}>
                    <Icon />
                  </NavIcon>
                  <NavText>{item.label}</NavText>
                </NavLinkStyled>
              </NavItem>
            );
          })}
        </NavList>
      </SidebarNav>
      
      <SidebarFooter>
        <LogoutButton onClick={handleLogout}>
          <LogoutIcon>
            <FiLogOut />
          </LogoutIcon>
          <LogoutText>Logout</LogoutText>
        </LogoutButton>
      </SidebarFooter>
    </SidebarContainer>
  );
};

export default Sidebar;

