import React, { useState } from 'react';
import styled from 'styled-components';
import { FaPlus, FaGlobe, FaPalette, FaClock, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  color: #2c3e50;
  margin-bottom: 10px;
`;

const Subtitle = styled.p`
  color: #7f8c8d;
  font-size: 16px;
`;

const Form = styled.form`
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const FormSection = styled.div`
  margin-bottom: 30px;
`;

const SectionTitle = styled.h3`
  color: #2c3e50;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #34495e;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s;
  
  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
  min-height: 100px;
  resize: vertical;
  transition: border-color 0.3s;
  
  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const ColorInput = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ColorPicker = styled.input`
  width: 50px;
  height: 40px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-2px);
  }
  
  &:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
    transform: none;
  }
`;

const SuccessMessage = styled.div`
  background: #d4edda;
  color: #155724;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
`;

const LoadingSpinner = styled.div`
  text-align: center;
  padding: 20px;
  color: #7f8c8d;
`;

const RestaurantCreation = () => {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    domain: '',
    description: '',
    logo_url: '',
    primary_color: '#000000',
    secondary_color: '#ffffff',
    phone: '',
    email: '',
    address: '',
    google_maps_link: '',
    open_time: '09:00',
    close_time: '22:00',
    timezone: 'UTC',
    owner_email: '',
    owner_name: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateSlug = () => {
    const slug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    setFormData(prev => ({
      ...prev,
      slug: slug
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/admin/restaurants/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess({
          message: result.message,
          restaurant: result.restaurant,
          urls: result.urls
        });
        
        // Reset form
        setFormData({
          name: '',
          slug: '',
          domain: '',
          description: '',
          logo_url: '',
          primary_color: '#000000',
          secondary_color: '#ffffff',
          phone: '',
          email: '',
          address: '',
          google_maps_link: '',
          open_time: '09:00',
          close_time: '22:00',
          timezone: 'UTC',
          owner_email: '',
          owner_name: ''
        });
      } else {
        setError(result.message || 'Failed to create restaurant');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingSpinner>
          <h2>Creating restaurant...</h2>
          <p>Please wait while we set up your restaurant with instant client app access.</p>
        </LoadingSpinner>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>🏪 Create New Restaurant</Title>
        <Subtitle>Set up a new restaurant with instant client app access</Subtitle>
      </Header>

      {success && (
        <SuccessMessage>
          <h3>🎉 Restaurant Created Successfully!</h3>
          <p><strong>{success.restaurant.name}</strong> is now live with instant client app access!</p>
          <div style={{ marginTop: '15px', textAlign: 'left' }}>
            <p><strong>🌐 Website:</strong> <a href={success.urls.website} target="_blank" rel="noopener noreferrer">{success.urls.website}</a></p>
            <p><strong>⚙️ Admin Panel:</strong> <a href={success.urls.admin} target="_blank" rel="noopener noreferrer">{success.urls.admin}</a></p>
            <p><strong>📱 Table QR:</strong> {success.urls.tableQR}</p>
          </div>
        </SuccessMessage>
      )}

      {error && (
        <ErrorMessage>
          <h3>❌ Error Creating Restaurant</h3>
          <p>{error}</p>
        </ErrorMessage>
      )}

      <Form onSubmit={handleSubmit}>
        <FormSection>
          <SectionTitle>
            <FaGlobe /> Basic Information
          </SectionTitle>
          <FormGrid>
            <FormGroup>
              <Label>Restaurant Name *</Label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Pizza Palace"
                required
              />
            </FormGroup>
            <FormGroup>
              <Label>Slug *</Label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  placeholder="e.g., pizzapalace"
                  required
                />
                <button
                  type="button"
                  onClick={generateSlug}
                  style={{
                    padding: '8px 12px',
                    background: '#3498db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Auto
                </button>
              </div>
            </FormGroup>
          </FormGrid>
          
          <FormGroup>
            <Label>Description</Label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Tell customers about your restaurant..."
            />
          </FormGroup>
        </FormSection>

        <FormSection>
          <SectionTitle>
            <FaPalette /> Branding & Colors
          </SectionTitle>
          <FormGrid>
            <FormGroup>
              <Label>Primary Color</Label>
              <ColorInput>
                <ColorPicker
                  type="color"
                  name="primary_color"
                  value={formData.primary_color}
                  onChange={handleInputChange}
                />
                <Input
                  type="text"
                  name="primary_color"
                  value={formData.primary_color}
                  onChange={handleInputChange}
                  placeholder="#000000"
                />
              </ColorInput>
            </FormGroup>
            <FormGroup>
              <Label>Secondary Color</Label>
              <ColorInput>
                <ColorPicker
                  type="color"
                  name="secondary_color"
                  value={formData.secondary_color}
                  onChange={handleInputChange}
                />
                <Input
                  type="text"
                  name="secondary_color"
                  value={formData.secondary_color}
                  onChange={handleInputChange}
                  placeholder="#ffffff"
                />
              </ColorInput>
            </FormGroup>
          </FormGrid>
          
          <FormGroup>
            <Label>Logo URL</Label>
            <Input
              type="url"
              name="logo_url"
              value={formData.logo_url}
              onChange={handleInputChange}
              placeholder="https://example.com/logo.png"
            />
          </FormGroup>
        </FormSection>

        <FormSection>
          <SectionTitle>
            <FaClock /> Business Hours
          </SectionTitle>
          <FormGrid>
            <FormGroup>
              <Label>Opening Time</Label>
              <Input
                type="time"
                name="open_time"
                value={formData.open_time}
                onChange={handleInputChange}
              />
            </FormGroup>
            <FormGroup>
              <Label>Closing Time</Label>
              <Input
                type="time"
                name="close_time"
                value={formData.close_time}
                onChange={handleInputChange}
              />
            </FormGroup>
          </FormGrid>
          
          <FormGroup>
            <Label>Timezone</Label>
            <Input
              type="text"
              name="timezone"
              value={formData.timezone}
              onChange={handleInputChange}
              placeholder="UTC"
            />
          </FormGroup>
        </FormSection>

        <FormSection>
          <SectionTitle>
            <FaMapMarkerAlt /> Contact Information
          </SectionTitle>
          <FormGroup>
            <Label>Address</Label>
            <Textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Restaurant address..."
            />
          </FormGroup>
          
          <FormGrid>
            <FormGroup>
              <Label>Phone</Label>
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+1 (555) 123-4567"
              />
            </FormGroup>
            <FormGroup>
              <Label>Email</Label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="info@restaurant.com"
              />
            </FormGroup>
          </FormGrid>
          
          <FormGroup>
            <Label>Google Maps Link</Label>
            <Input
              type="url"
              name="google_maps_link"
              value={formData.google_maps_link}
              onChange={handleInputChange}
              placeholder="https://maps.google.com/..."
            />
          </FormGroup>
        </FormSection>

        <FormSection>
          <SectionTitle>
            <FaEnvelope /> Owner Information
          </SectionTitle>
          <FormGrid>
            <FormGroup>
              <Label>Owner Name</Label>
              <Input
                type="text"
                name="owner_name"
                value={formData.owner_name}
                onChange={handleInputChange}
                placeholder="Restaurant owner's name"
              />
            </FormGroup>
            <FormGroup>
              <Label>Owner Email</Label>
              <Input
                type="email"
                name="owner_email"
                value={formData.owner_email}
                onChange={handleInputChange}
                placeholder="owner@restaurant.com"
              />
            </FormGroup>
          </FormGrid>
        </FormSection>

        <SubmitButton type="submit" disabled={loading}>
          <FaPlus /> Create Restaurant with Instant Client App Access
        </SubmitButton>
      </Form>
    </Container>
  );
};

export default RestaurantCreation;
