import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiSave, FiMapPin, FiPhone, FiMail, FiWifi, FiClock, FiGlobe, FiInstagram, FiFacebook, FiMessageCircle, FiPlus, FiX } from 'react-icons/fi';
import apiService from '../services/api';
import RestaurantSettingsCard from './RestaurantSettingsCard';
import { useAuth } from '../contexts/AuthContext';

const SettingsContainer = styled.div`
  padding: 32px;
  max-width: 1200px;
  margin: 0 auto;
`;

const SettingsHeader = styled.div`
  margin-bottom: 32px;
  text-align: center;
`;

const SettingsTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #1e293b 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 16px;
`;

const SettingsSubtitle = styled.p`
  font-size: 1.1rem;
  color: #64748b;
  margin: 0;
`;

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 32px;
  margin-bottom: 32px;
`;

const SettingsSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    transform: translateY(-2px);
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;

  svg {
    color: #3b82f6;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 24px;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #f9fafb;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    background: white;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #f9fafb;
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    background: white;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const TimeInputGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  align-items: center;
`;

const TimeLabel = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
`;

const SocialMediaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

const SocialMediaInput = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SocialIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  color: white;
  font-size: 1.2rem;
  flex-shrink: 0;
`;

const InstagramIcon = styled(SocialIcon)`
  background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
`;

const FacebookIcon = styled(SocialIcon)`
  background: #1877f2;
`;

const TripAdvisorIcon = styled(SocialIcon)`
  background: #00af87;
`;

const WhatsAppIcon = styled(SocialIcon)`
  background: #25d366;
`;

const TelegramIcon = styled(SocialIcon)`
  background: #0088cc;
`;

const AddSocialButton = styled.button`
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }
`;

const CustomSocialInput = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const CustomSocialIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #6b7280;
  color: white;
  font-size: 1.2rem;
  flex-shrink: 0;
`;

const RemoveButton = styled.button`
  background: #ef4444;
  color: white;
  border: 2px solid #dc2626;
  width: 50px;
  height: 40px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 18px;
  font-weight: bold;
  flex-direction: column;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  position: relative;

  &:hover {
    background: #dc2626;
    border-color: #b91c1c;
    transform: scale(1.05);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }

  &:active {
    transform: scale(0.95);
  }

  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, #ef4444, #dc2626);
    border-radius: 10px;
    z-index: -1;
    opacity: 0.3;
  }
`;

const SocialMediaNameInput = styled.input`
  width: 120px;
  padding: 8px 12px;
  border: 2px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: all 0.3s ease;
  background: #f9fafb;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    background: white;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }
`;

const SaveButton = styled.button`
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 auto;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 15px -3px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const SuccessMessage = styled.div`
  background: #10b981;
  color: white;
  padding: 16px 24px;
  border-radius: 8px;
  margin-bottom: 24px;
  text-align: center;
  font-weight: 600;
  animation: slideIn 0.3s ease;
`;

const ErrorMessage = styled.div`
  background: #ef4444;
  color: white;
  padding: 16px 24px;
  border-radius: 8px;
  margin-bottom: 24px;
  text-align: center;
  font-weight: 600;
  animation: slideIn 0.3s ease;
`;

const slideIn = `
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const Settings = () => {
  const { user: currentUser } = useAuth();
  const [settings, setSettings] = useState({
    restaurantName: '',
    description: '',
    googleMapsLink: '',
    phone: '',
    email: '',
    openTime: '09:00',
    closeTime: '22:00',
    wifiName: '',
    wifiPassword: '',
    instagram: '',
    facebook: '',
    tripAdvisor: '',
    whatsapp: '',
    telegram: ''
  });

  const [customSocialMedia, setCustomSocialMedia] = useState([
    {
      id: Date.now(),
      name: 'LinkedIn',
      url: 'https://linkedin.com/company/restaurant'
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    // Load existing settings from API
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await apiService.getRestaurantSettings();
      if (response) {
        setSettings({
          restaurantName: response.restaurant_name || '',
          description: response.description || '',
          googleMapsLink: response.google_maps_link || '',
          phone: response.phone || '',
          email: response.email || '',
          openTime: response.open_time || '09:00',
          closeTime: response.close_time || '22:00',
          wifiName: response.wifi_name || '',
          wifiPassword: response.wifi_password || '',
          instagram: response.instagram || '',
          facebook: response.facebook || '',
          tripAdvisor: response.trip_advisor || '',
          whatsapp: response.whatsapp || '',
          telegram: response.telegram || ''
        });
        
        // Handle custom social media with proper validation
        if (response.custom_social_media && Array.isArray(response.custom_social_media)) {
          setCustomSocialMedia(response.custom_social_media);
        } else if (response.custom_social_media && typeof response.custom_social_media === 'string') {
          try {
            const parsed = JSON.parse(response.custom_social_media);
            if (Array.isArray(parsed)) {
              setCustomSocialMedia(parsed);
            } else {
              setCustomSocialMedia([]);
            }
          } catch (error) {
            console.error('Error parsing custom social media:', error);
            setCustomSocialMedia([]);
          }
        } else {
          setCustomSocialMedia([]);
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setMessage({ type: 'error', text: 'Failed to load settings' });
    }
  };

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Save to backend API
      const response = await apiService.saveRestaurantSettings({
        ...settings,
        customSocialMedia
      });
      
      if (response) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
        
        // Clear message after 3 seconds
        setTimeout(() => {
          setMessage({ type: '', text: '' });
        }, 3000);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const addCustomSocialMedia = () => {
    const newSocial = {
      id: Date.now(),
      name: '',
      url: ''
    };
    setCustomSocialMedia(prev => {
      if (!Array.isArray(prev)) return [newSocial];
      return [...prev, newSocial];
    });
  };

  const removeCustomSocialMedia = (id) => {
    setCustomSocialMedia(prev => {
      if (!Array.isArray(prev)) return [];
      return prev.filter(social => social.id !== id);
    });
  };

  const updateCustomSocialMedia = (id, field, value) => {
    setCustomSocialMedia(prev => {
      if (!Array.isArray(prev)) return [];
      return prev.map(social => 
        social.id === id ? { ...social, [field]: value } : social
      );
    });
  };

  return (
    <SettingsContainer>
      <SettingsHeader>
        <SettingsTitle>Restaurant Settings</SettingsTitle>
        <SettingsSubtitle>Configure your restaurant information and preferences</SettingsSubtitle>
      </SettingsHeader>

      {message.text && (
        message.type === 'success' ? (
          <SuccessMessage>{message.text}</SuccessMessage>
        ) : (
          <ErrorMessage>{message.text}</ErrorMessage>
        )
      )}

      {/* Restaurant Client App URLs */}
      {currentUser && (
        <RestaurantSettingsCard 
          restaurant={{
            id: currentUser.restaurant_id,
            slug: currentUser.restaurant_slug,
            name: currentUser.restaurant_name || settings.restaurantName
          }} 
        />
      )}

      <SettingsGrid>
        {/* Basic Information */}
        <SettingsSection>
          <SectionTitle>
            <FiGlobe />
            Basic Information
          </SectionTitle>
          
          <FormGroup>
            <Label>Restaurant Name</Label>
            <Input
              type="text"
              value={settings.restaurantName}
              onChange={(e) => handleInputChange('restaurantName', e.target.value)}
              placeholder="Enter restaurant name"
            />
          </FormGroup>

          <FormGroup>
            <Label>Description / Subtitle</Label>
            <Textarea
              value={settings.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter restaurant description or tagline"
            />
          </FormGroup>

          <FormGroup>
            <Label>Google Maps Link</Label>
            <Input
              type="url"
              value={settings.googleMapsLink}
              onChange={(e) => handleInputChange('googleMapsLink', e.target.value)}
              placeholder="https://maps.google.com/..."
            />
          </FormGroup>
        </SettingsSection>

        {/* Contact Information */}
        <SettingsSection>
          <SectionTitle>
            <FiPhone />
            Contact Information
          </SectionTitle>
          
          <FormGroup>
            <Label>Phone Number</Label>
            <Input
              type="tel"
              value={settings.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
            />
          </FormGroup>

          <FormGroup>
            <Label>Email Address</Label>
            <Input
              type="email"
              value={settings.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="contact@restaurant.com"
            />
          </FormGroup>
        </SettingsSection>

        {/* Operating Hours */}
        <SettingsSection>
          <SectionTitle>
            <FiClock />
            Operating Hours
          </SectionTitle>
          
          <FormGroup>
            <Label>Daily Schedule</Label>
            <TimeInputGroup>
              <div>
                <TimeLabel>Open Time</TimeLabel>
                <Input
                  type="time"
                  value={settings.openTime}
                  onChange={(e) => handleInputChange('openTime', e.target.value)}
                />
              </div>
              <div>
                <TimeLabel>Close Time</TimeLabel>
                <Input
                  type="time"
                  value={settings.closeTime}
                  onChange={(e) => handleInputChange('closeTime', e.target.value)}
                />
              </div>
            </TimeInputGroup>
          </FormGroup>
        </SettingsSection>

        {/* WiFi Information */}
        <SettingsSection>
          <SectionTitle>
            <FiWifi />
            WiFi Information
          </SectionTitle>
          
          <FormGroup>
            <Label>WiFi Network Name</Label>
            <Input
              type="text"
              value={settings.wifiName}
              onChange={(e) => handleInputChange('wifiName', e.target.value)}
              placeholder="Restaurant_WiFi"
            />
          </FormGroup>

          <FormGroup>
            <Label>WiFi Password</Label>
            <Input
              type="text"
              value={settings.wifiPassword}
              onChange={(e) => handleInputChange('wifiPassword', e.target.value)}
              placeholder="Enter WiFi password"
            />
          </FormGroup>
        </SettingsSection>

        {/* Social Media */}
        <SettingsSection>
          <SectionTitle>
            <FiInstagram />
            Social Media
          </SectionTitle>
          
          <SocialMediaGrid>
            <FormGroup>
              <Label>Instagram</Label>
              <SocialMediaInput>
                <InstagramIcon>
                  <FiInstagram />
                </InstagramIcon>
                <Input
                  type="url"
                  value={settings.instagram}
                  onChange={(e) => handleInputChange('instagram', e.target.value)}
                  placeholder="https://instagram.com/..."
                />
              </SocialMediaInput>
            </FormGroup>

            <FormGroup>
              <Label>Facebook</Label>
              <SocialMediaInput>
                <FacebookIcon>
                  <FiFacebook />
                </FacebookIcon>
                <Input
                  type="url"
                  value={settings.facebook}
                  onChange={(e) => handleInputChange('facebook', e.target.value)}
                  placeholder="https://facebook.com/..."
                />
              </SocialMediaInput>
            </FormGroup>

            <FormGroup>
              <Label>TripAdvisor</Label>
              <SocialMediaInput>
                <TripAdvisorIcon>
                  <FiGlobe />
                </TripAdvisorIcon>
                <Input
                  type="url"
                  value={settings.tripAdvisor}
                  onChange={(e) => handleInputChange('tripAdvisor', e.target.value)}
                  placeholder="https://tripadvisor.com/..."
                />
              </SocialMediaInput>
            </FormGroup>

            <FormGroup>
              <Label>WhatsApp</Label>
              <SocialMediaInput>
                <WhatsAppIcon>
                  <FiMessageCircle />
                </WhatsAppIcon>
                <Input
                  type="url"
                  value={settings.whatsapp}
                  onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                  placeholder="https://wa.me/..."
                />
              </SocialMediaInput>
            </FormGroup>

            <FormGroup>
              <Label>Telegram</Label>
              <SocialMediaInput>
                <TelegramIcon>
                  <FiMessageCircle />
                </TelegramIcon>
                <Input
                  type="url"
                  value={settings.telegram}
                  onChange={(e) => handleInputChange('telegram', e.target.value)}
                  placeholder="https://t.me/..."
                />
              </SocialMediaInput>
            </FormGroup>
          </SocialMediaGrid>

          {/* Custom Social Media Links */}
          {console.log('Custom social media:', customSocialMedia)}
          {Array.isArray(customSocialMedia) ? customSocialMedia.map((social) => (
            <FormGroup key={social.id}>
              <Label>Custom Social Media</Label>
              <CustomSocialInput>
                <CustomSocialIcon>
                  <FiGlobe />
                </CustomSocialIcon>
                <SocialMediaNameInput
                  type="text"
                  value={social.name || ''}
                  onChange={(e) => updateCustomSocialMedia(social.id, 'name', e.target.value)}
                  placeholder="Platform name"
                />
                <Input
                  type="url"
                  value={social.url || ''}
                  onChange={(e) => updateCustomSocialMedia(social.id, 'url', e.target.value)}
                  placeholder="https://..."
                />
                <RemoveButton 
                  onClick={() => removeCustomSocialMedia(social.id)}
                  title="Delete this social media platform"
                  aria-label="Delete social media platform"
                >
                  <FiX />
                  <span style={{ fontSize: '10px', marginLeft: '2px' }}>DEL</span>
                </RemoveButton>
              </CustomSocialInput>
            </FormGroup>
          )) : (
            <FormGroup>
              <Label>Custom Social Media</Label>
              <div style={{ color: '#6b7280', fontSize: '0.875rem', fontStyle: 'italic' }}>
                Loading custom social media...
              </div>
            </FormGroup>
          )}

          <AddSocialButton onClick={addCustomSocialMedia}>
            <FiPlus />
            Add More Social Media
          </AddSocialButton>
        </SettingsSection>
      </SettingsGrid>

      <SaveButton onClick={handleSave} disabled={isLoading}>
        <FiSave />
        {isLoading ? 'Saving...' : 'Save Settings'}
      </SaveButton>

      <style>{slideIn}</style>
    </SettingsContainer>
  );
};

export default Settings;
