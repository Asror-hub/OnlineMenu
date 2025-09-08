import React from 'react';
import styled from 'styled-components';
import { 
  FiInfo, 
  FiMapPin, 
  FiClock, 
  FiWifi, 
  FiPhone, 
  FiMail, 
  FiGlobe, 
  FiInstagram, 
  FiFacebook, 
  FiMessageCircle,
  FiExternalLink
} from 'react-icons/fi';
import { useRestaurant } from '../../contexts/RestaurantContext';
import ReservationButton from '../Reservation/ReservationButton';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const SidebarOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transition: all var(--transition-normal);
  
  @media (min-width: 769px) {
    display: none;
  }
`;

const SidebarContainer = styled.aside<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 320px;
  height: 100vh;
  background: linear-gradient(135deg, var(--color-secondary) 0%, #f8fafc 100%);
  box-shadow: var(--shadow-xl);
  z-index: 1000;
  transform: translateX(${props => props.$isOpen ? '0' : '-100%'});
  transition: transform var(--transition-normal);
  overflow-y: auto;
  
  @media (min-width: 769px) {
    position: static;
    width: 280px;
    height: auto;
    transform: none;
    box-shadow: none;
    border-right: 1px solid var(--color-gray-200);
  }
`;

const SidebarHeader = styled.div`
  padding: var(--spacing-xl);
  border-bottom: 1px solid var(--color-gray-200);
  background: linear-gradient(135deg, var(--color-primary) 0%, #1d4ed8 100%);
  color: var(--color-secondary);
`;

const RestaurantLogo = styled.div`
  width: 64px;
  height: 64px;
  border-radius: var(--radius-xl);
  background: var(--color-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.5rem;
  color: var(--color-primary);
  margin-bottom: var(--spacing-md);
  box-shadow: var(--shadow-md);
`;

const RestaurantName = styled.h2`
  color: var(--color-secondary);
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 var(--spacing-xs) 0;
`;

const RestaurantDescription = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
  margin: 0;
  line-height: 1.5;
`;

const SidebarContent = styled.div`
  padding: var(--spacing-lg);
`;

const Section = styled.div`
  margin-bottom: var(--spacing-xl);
`;

const SectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-gray-700);
  margin: 0 0 var(--spacing-md) 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--color-gray-50);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-sm);
  transition: all var(--transition-fast);

  &:hover {
    background: var(--color-gray-100);
    transform: translateY(-1px);
  }
`;

const InfoIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: var(--color-primary);
  color: var(--color-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    width: 18px;
    height: 18px;
  }
`;

const InfoContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const InfoLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-gray-500);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 2px;
`;

const InfoValue = styled.div`
  font-size: 0.875rem;
  color: var(--color-gray-800);
  font-weight: 500;
  word-break: break-word;
`;

const SocialLinks = styled.div`
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
`;

const SocialLink = styled.a`
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: var(--color-gray-100);
  color: var(--color-gray-600);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);

  &:hover {
    background: var(--color-primary);
    color: var(--color-secondary);
    transform: translateY(-2px);
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const LinkItem = styled.a`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--color-gray-50);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-sm);
  text-decoration: none;
  color: var(--color-gray-800);
  transition: all var(--transition-fast);

  &:hover {
    background: var(--color-gray-100);
    transform: translateY(-1px);
    color: var(--color-primary);
  }
`;

const ContactLink = styled.a`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--color-gray-50);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-sm);
  text-decoration: none;
  color: var(--color-gray-800);
  transition: all var(--transition-fast);

  &:hover {
    background: var(--color-gray-100);
    transform: translateY(-1px);
    color: var(--color-primary);
  }
`;

const SocialMediaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
`;

const SocialMediaLink = styled.a`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  background: var(--color-gray-50);
  border-radius: var(--radius-md);
  text-decoration: none;
  color: var(--color-gray-700);
  font-size: 0.875rem;
  transition: all var(--transition-fast);

  &:hover {
    background: var(--color-gray-100);
    transform: translateY(-1px);
  }

  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }
`;

const InstagramLink = styled(SocialMediaLink)`
  &:hover {
    background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
    color: white;
  }
`;

const FacebookLink = styled(SocialMediaLink)`
  &:hover {
    background: #1877f2;
    color: white;
  }
`;

const TripAdvisorLink = styled(SocialMediaLink)`
  &:hover {
    background: #00af87;
    color: white;
  }
`;

const WhatsAppLink = styled(SocialMediaLink)`
  &:hover {
    background: #25d366;
    color: white;
  }
`;

const TelegramLink = styled(SocialMediaLink)`
  &:hover {
    background: #0088cc;
    color: white;
  }
`;

const CustomSocialLink = styled(SocialMediaLink)`
  &:hover {
    background: #6b7280;
    color: white;
  }
`;

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { restaurant, settings } = useRestaurant();

  const formatTime = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getOperatingHours = () => {
    if (!restaurant?.open_time || !restaurant?.close_time) {
      return 'Hours not available';
    }
    return `${formatTime(restaurant.open_time)} - ${formatTime(restaurant.close_time)}`;
  };

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return <FiInstagram />;
      case 'facebook':
        return <FiFacebook />;
      case 'whatsapp':
        return <FiMessageCircle />;
      case 'telegram':
        return <FiMessageCircle />;
      default:
        return <FiGlobe />;
    }
  };

  const getSocialLinkComponent = (platform: string, url: string, name: string) => {
    const icon = getSocialIcon(platform);
    
    switch (platform.toLowerCase()) {
      case 'instagram':
        return (
          <InstagramLink key={name} href={url} target="_blank" rel="noopener noreferrer">
            {icon}
            <span>{name}</span>
          </InstagramLink>
        );
      case 'facebook':
        return (
          <FacebookLink key={name} href={url} target="_blank" rel="noopener noreferrer">
            {icon}
            <span>{name}</span>
          </FacebookLink>
        );
      case 'whatsapp':
        return (
          <WhatsAppLink key={name} href={url} target="_blank" rel="noopener noreferrer">
            {icon}
            <span>{name}</span>
          </WhatsAppLink>
        );
      case 'telegram':
        return (
          <TelegramLink key={name} href={url} target="_blank" rel="noopener noreferrer">
            {icon}
            <span>{name}</span>
          </TelegramLink>
        );
      default:
        return (
          <CustomSocialLink key={name} href={url} target="_blank" rel="noopener noreferrer">
            {icon}
            <span>{name}</span>
          </CustomSocialLink>
        );
    }
  };

  return (
    <>
      <SidebarOverlay $isOpen={isOpen} onClick={onClose} />
      <SidebarContainer $isOpen={isOpen}>
        <SidebarHeader>
          <RestaurantLogo>
            {restaurant?.name?.charAt(0) || 'R'}
          </RestaurantLogo>
          <RestaurantName>
            {restaurant?.name || 'Restaurant'}
          </RestaurantName>
          {restaurant?.description && (
            <RestaurantDescription>
              {restaurant.description}
            </RestaurantDescription>
          )}
        </SidebarHeader>

        <SidebarContent>
          {/* Reservation Button */}
          <Section>
            <ReservationButton variant="sidebar" />
          </Section>

          {/* Basic Information */}
          <Section>
            <SectionTitle>Restaurant Info</SectionTitle>
            
            {restaurant?.description && (
              <InfoItem>
                <InfoIcon>
                  {React.createElement(FiInfo as any)}
                </InfoIcon>
                <InfoContent>
                  <InfoLabel>Description</InfoLabel>
                  <InfoValue>{restaurant.description}</InfoValue>
                </InfoContent>
              </InfoItem>
            )}

            {restaurant?.google_maps_link && (
              <LinkItem href={restaurant.google_maps_link} target="_blank" rel="noopener noreferrer">
                <InfoIcon>
                  {React.createElement(FiMapPin as any)}
                </InfoIcon>
                <InfoContent>
                  <InfoLabel>Location</InfoLabel>
                  <InfoValue>View on Google Maps</InfoValue>
                </InfoContent>
                <FiExternalLink size={16} />
              </LinkItem>
            )}
          </Section>

          {/* Contact Information */}
          <Section>
            <SectionTitle>Contact</SectionTitle>
            
            {restaurant?.phone && (
              <ContactLink href={`tel:${restaurant.phone}`}>
                <InfoIcon>
                  {React.createElement(FiPhone as any)}
                </InfoIcon>
                <InfoContent>
                  <InfoLabel>Phone</InfoLabel>
                  <InfoValue>{restaurant.phone}</InfoValue>
                </InfoContent>
              </ContactLink>
            )}

            {restaurant?.email && (
              <ContactLink href={`mailto:${restaurant.email}`}>
                <InfoIcon>
                  {React.createElement(FiMail as any)}
                </InfoIcon>
                <InfoContent>
                  <InfoLabel>Email</InfoLabel>
                  <InfoValue>{restaurant.email}</InfoValue>
                </InfoContent>
              </ContactLink>
            )}
          </Section>

          {/* Operating Hours */}
          <Section>
            <SectionTitle>Hours</SectionTitle>
            
            <InfoItem>
              <InfoIcon>
                {React.createElement(FiClock as any)}
              </InfoIcon>
              <InfoContent>
                <InfoLabel>Daily Schedule</InfoLabel>
                <InfoValue>{getOperatingHours()}</InfoValue>
              </InfoContent>
            </InfoItem>
          </Section>

          {/* WiFi Information */}
          {(settings?.wifi_name || settings?.wifi_password) && (
            <Section>
              <SectionTitle>WiFi</SectionTitle>
              
              {settings.wifi_name && (
                <InfoItem>
                  <InfoIcon>
                    {React.createElement(FiWifi as any)}
                  </InfoIcon>
                  <InfoContent>
                    <InfoLabel>Network</InfoLabel>
                    <InfoValue>{settings.wifi_name}</InfoValue>
                  </InfoContent>
                </InfoItem>
              )}

              {settings.wifi_password && (
                <InfoItem>
                  <InfoIcon>
                    {React.createElement(FiWifi as any)}
                  </InfoIcon>
                  <InfoContent>
                    <InfoLabel>Password</InfoLabel>
                    <InfoValue>{settings.wifi_password}</InfoValue>
                  </InfoContent>
                </InfoItem>
              )}
            </Section>
          )}

          {/* Social Media */}
          {(settings?.instagram || 
            settings?.facebook || 
            settings?.trip_advisor || 
            settings?.whatsapp || 
            settings?.telegram || 
            (settings?.custom_social_media && settings.custom_social_media.length > 0)) && (
            <Section>
              <SectionTitle>Follow Us</SectionTitle>
              
              <SocialMediaGrid>
                {settings.instagram && (
                  <InstagramLink href={settings.instagram} target="_blank" rel="noopener noreferrer">
                    <FiInstagram />
                    <span>Instagram</span>
                  </InstagramLink>
                )}
                
                {settings.facebook && (
                  <FacebookLink href={settings.facebook} target="_blank" rel="noopener noreferrer">
                    <FiFacebook />
                    <span>Facebook</span>
                  </FacebookLink>
                )}
                
                {settings.trip_advisor && (
                  <TripAdvisorLink href={settings.trip_advisor} target="_blank" rel="noopener noreferrer">
                    <FiGlobe />
                    <span>TripAdvisor</span>
                  </TripAdvisorLink>
                )}
                
                {settings.whatsapp && (
                  <WhatsAppLink href={settings.whatsapp} target="_blank" rel="noopener noreferrer">
                    <FiMessageCircle />
                    <span>WhatsApp</span>
                  </WhatsAppLink>
                )}
                
                {settings.telegram && (
                  <TelegramLink href={settings.telegram} target="_blank" rel="noopener noreferrer">
                    <FiMessageCircle />
                    <span>Telegram</span>
                  </TelegramLink>
                )}
                
                {/* Custom Social Media */}
                {settings.custom_social_media && Array.isArray(settings.custom_social_media) && 
                  settings.custom_social_media.map((social: any) => {
                    if (social.name && social.url) {
                      return getSocialLinkComponent(social.name, social.url, social.name);
                    }
                    return null;
                  })}
              </SocialMediaGrid>
            </Section>
          )}
        </SidebarContent>
      </SidebarContainer>
    </>
  );
};

export default Sidebar;
