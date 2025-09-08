import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FiMapPin, 
  FiPhone, 
  FiMail, 
  FiClock, 
  FiWifi, 
  FiInstagram, 
  FiFacebook, 
  FiGlobe, 
  FiMessageCircle,
  FiExternalLink,
  FiCalendar
} from 'react-icons/fi';
import apiService from '../../services/api';
import { RestaurantSettings } from '../../services/api';
import ReservationButton from '../Reservation/ReservationButton';

interface FooterProps {
  className?: string;
}

interface RestaurantInfo {
  name: string;
  description?: string;
  phone?: string;
  email?: string;
  google_maps_link?: string;
  open_time: string;
  close_time: string;
}

interface CombinedRestaurantData extends RestaurantInfo, RestaurantSettings {}

const FooterContainer = styled.footer`
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  color: white;
  padding: 3rem 0 2rem;
  margin-top: auto;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
`;

const FooterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const FooterSection = styled.div`
  display: flex;
  flex-direction: column;
`;

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #f1f5f9;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    color: #3b82f6;
  }
`;

const SectionContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
  color: #cbd5e1;
  line-height: 1.5;

  svg {
    color: #64748b;
    flex-shrink: 0;
    width: 16px;
    height: 16px;
  }
`;

const LinkItem = styled.a`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
  color: #cbd5e1;
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: #3b82f6;
  }

  svg {
    color: #64748b;
    flex-shrink: 0;
    width: 16px;
    height: 16px;
  }
`;

const SocialMediaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
`;

const SocialLink = styled.a`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  text-decoration: none;
  color: #cbd5e1;
  transition: all 0.2s ease;
  font-size: 0.9rem;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    transform: translateY(-1px);
  }

  svg {
    flex-shrink: 0;
    width: 18px;
    height: 18px;
  }
`;

const InstagramLink = styled(SocialLink)`
  &:hover {
    background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
  }
`;

const FacebookLink = styled(SocialLink)`
  &:hover {
    background: #1877f2;
  }
`;

const TripAdvisorLink = styled(SocialLink)`
  &:hover {
    background: #00af87;
  }
`;

const WhatsAppLink = styled(SocialLink)`
  &:hover {
    background: #25d366;
  }
`;

const TelegramLink = styled(SocialLink)`
  &:hover {
    background: #0088cc;
  }
`;

const CustomSocialLink = styled(SocialLink)`
  &:hover {
    background: #6b7280;
  }
`;

const FooterBottom = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 1.5rem;
  text-align: center;
  color: #94a3b8;
  font-size: 0.875rem;
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #94a3b8;
`;

const ErrorState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #ef4444;
  font-size: 0.9rem;
`;

const Footer: React.FC<FooterProps> = ({ className }) => {
  const [restaurantData, setRestaurantData] = useState<CombinedRestaurantData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRestaurantData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [restaurantInfo, restaurantSettings] = await Promise.all([
          apiService.getRestaurantInfo(),
          apiService.getRestaurantSettings()
        ]);

        setRestaurantData({
          ...restaurantInfo,
          ...restaurantSettings
        });
      } catch (err: any) {
        console.error('Failed to load restaurant data for footer:', err);
        setError('Failed to load restaurant information');
      } finally {
        setLoading(false);
      }
    };

    loadRestaurantData();
  }, []);

  if (loading) {
    return (
      <FooterContainer className={className}>
        <FooterContent>
          <LoadingState>Loading restaurant information...</LoadingState>
        </FooterContent>
      </FooterContainer>
    );
  }

  if (error || !restaurantData) {
    return (
      <FooterContainer className={className}>
        <FooterContent>
          <ErrorState>{error || 'Restaurant information not available'}</ErrorState>
        </FooterContent>
      </FooterContainer>
    );
  }

  const formatTime = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
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
            <FiExternalLink />
          </InstagramLink>
        );
      case 'facebook':
        return (
          <FacebookLink key={name} href={url} target="_blank" rel="noopener noreferrer">
            {icon}
            <span>{name}</span>
            <FiExternalLink />
          </FacebookLink>
        );
      case 'whatsapp':
        return (
          <WhatsAppLink key={name} href={url} target="_blank" rel="noopener noreferrer">
            {icon}
            <span>{name}</span>
            <FiExternalLink />
          </WhatsAppLink>
        );
      case 'telegram':
        return (
          <TelegramLink key={name} href={url} target="_blank" rel="noopener noreferrer">
            {icon}
            <span>{name}</span>
            <FiExternalLink />
          </TelegramLink>
        );
      default:
        return (
          <CustomSocialLink key={name} href={url} target="_blank" rel="noopener noreferrer">
            {icon}
            <span>{name}</span>
            <FiExternalLink />
          </CustomSocialLink>
        );
    }
  };

  return (
    <FooterContainer className={className}>
      <FooterContent>
        <FooterGrid>
          {/* Basic Information */}
          <FooterSection>
            <SectionTitle>
              <FiGlobe />
              {restaurantData.name}
            </SectionTitle>
            <SectionContent>
              {restaurantData.description && (
                <InfoItem>
                  <span>{restaurantData.description}</span>
                </InfoItem>
              )}
              {restaurantData.google_maps_link && (
                <LinkItem 
                  href={restaurantData.google_maps_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <FiMapPin />
                  <span>View on Google Maps</span>
                  <FiExternalLink />
                </LinkItem>
              )}
            </SectionContent>
          </FooterSection>

          {/* Contact Information */}
          <FooterSection>
            <SectionTitle>
              <FiPhone />
              Contact Information
            </SectionTitle>
            <SectionContent>
              {restaurantData.phone && (
                <LinkItem href={`tel:${restaurantData.phone}`}>
                  <FiPhone />
                  <span>{restaurantData.phone}</span>
                </LinkItem>
              )}
              {restaurantData.email && (
                <LinkItem href={`mailto:${restaurantData.email}`}>
                  <FiMail />
                  <span>{restaurantData.email}</span>
                </LinkItem>
              )}
            </SectionContent>
          </FooterSection>

          {/* Operating Hours */}
          <FooterSection>
            <SectionTitle>
              <FiClock />
              Operating Hours
            </SectionTitle>
            <SectionContent>
              <InfoItem>
                <FiClock />
                <span>
                  {formatTime(restaurantData.open_time)} - {formatTime(restaurantData.close_time)}
                </span>
              </InfoItem>
            </SectionContent>
          </FooterSection>

          {/* WiFi Information */}
          {(restaurantData.wifi_name || restaurantData.wifi_password) && (
            <FooterSection>
              <SectionTitle>
                <FiWifi />
                WiFi Information
              </SectionTitle>
              <SectionContent>
                {restaurantData.wifi_name && (
                  <InfoItem>
                    <FiWifi />
                    <span>Network: {restaurantData.wifi_name}</span>
                  </InfoItem>
                )}
                {restaurantData.wifi_password && (
                  <InfoItem>
                    <FiWifi />
                    <span>Password: {restaurantData.wifi_password}</span>
                  </InfoItem>
                )}
              </SectionContent>
            </FooterSection>
          )}

          {/* Reservations */}
          <FooterSection>
            <SectionTitle>
              <FiCalendar />
              Reservations
            </SectionTitle>
            <SectionContent>
              <InfoItem>
                <FiCalendar />
                <span>Book your table online</span>
              </InfoItem>
              <ReservationButton variant="footer" />
            </SectionContent>
          </FooterSection>

          {/* Social Media */}
          {(restaurantData.instagram || 
            restaurantData.facebook || 
            restaurantData.trip_advisor || 
            restaurantData.whatsapp || 
            restaurantData.telegram || 
            (restaurantData.custom_social_media && restaurantData.custom_social_media.length > 0)) && (
            <FooterSection>
              <SectionTitle>
                <FiInstagram />
                Social Media
              </SectionTitle>
              <SectionContent>
                <SocialMediaGrid>
                  {restaurantData.instagram && (
                    <InstagramLink 
                      href={restaurantData.instagram} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <FiInstagram />
                      <span>Instagram</span>
                      <FiExternalLink />
                    </InstagramLink>
                  )}
                  
                  {restaurantData.facebook && (
                    <FacebookLink 
                      href={restaurantData.facebook} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <FiFacebook />
                      <span>Facebook</span>
                      <FiExternalLink />
                    </FacebookLink>
                  )}
                  
                  {restaurantData.trip_advisor && (
                    <TripAdvisorLink 
                      href={restaurantData.trip_advisor} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <FiGlobe />
                      <span>TripAdvisor</span>
                      <FiExternalLink />
                    </TripAdvisorLink>
                  )}
                  
                  {restaurantData.whatsapp && (
                    <WhatsAppLink 
                      href={restaurantData.whatsapp} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <FiMessageCircle />
                      <span>WhatsApp</span>
                      <FiExternalLink />
                    </WhatsAppLink>
                  )}
                  
                  {restaurantData.telegram && (
                    <TelegramLink 
                      href={restaurantData.telegram} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <FiMessageCircle />
                      <span>Telegram</span>
                      <FiExternalLink />
                    </TelegramLink>
                  )}
                  
                  {/* Custom Social Media */}
                  {restaurantData.custom_social_media && restaurantData.custom_social_media.map((social: any) => {
                    if (social.name && social.url) {
                      return getSocialLinkComponent(social.name, social.url, social.name);
                    }
                    return null;
                  })}
                </SocialMediaGrid>
              </SectionContent>
            </FooterSection>
          )}
        </FooterGrid>

        <FooterBottom>
          <p>&copy; {new Date().getFullYear()} {restaurantData.name}. All rights reserved.</p>
        </FooterBottom>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer;

