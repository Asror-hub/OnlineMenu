import React, { useState } from 'react';
import styled from 'styled-components';
import { FaGlobe, FaQrcode, FaCopy, FaExternalLinkAlt, FaDownload, FaTable } from 'react-icons/fa';

const Container = styled.div`
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f8f9fa;
`;

const Title = styled.h3`
  color: #2c3e50;
  margin: 0;
  font-size: 20px;
`;

const Icon = styled.div`
  font-size: 24px;
  color: #3498db;
`;

const Section = styled.div`
  margin-bottom: 25px;
`;

const SectionTitle = styled.h4`
  color: #34495e;
  margin-bottom: 15px;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const UrlCard = styled.div`
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
`;

const UrlLabel = styled.div`
  font-weight: 600;
  color: #495057;
  margin-bottom: 8px;
  font-size: 14px;
`;

const UrlValue = styled.div`
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 10px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  color: #495057;
  word-break: break-all;
  margin-bottom: 10px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-1px);
  }
  
  &.primary {
    background: #3498db;
    color: white;
    
    &:hover {
      background: #2980b9;
    }
  }
  
  &.secondary {
    background: #95a5a6;
    color: white;
    
    &:hover {
      background: #7f8c8d;
    }
  }
  
  &.success {
    background: #27ae60;
    color: white;
    
    &:hover {
      background: #229954;
    }
  }
`;

const QRCodeSection = styled.div`
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
`;

const TableGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
  margin-top: 15px;
`;

const TableCard = styled.div`
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 15px;
`;

const TableHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
`;

const TableNumber = styled.span`
  background: #3498db;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
`;

const TableUrl = styled.div`
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 11px;
  color: #6c757d;
  word-break: break-all;
  margin-bottom: 10px;
`;

const Instructions = styled.div`
  background: #e8f4fd;
  border: 1px solid #bee5eb;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
`;

const InstructionsTitle = styled.h4`
  color: #0c5460;
  margin-bottom: 15px;
  font-size: 16px;
`;

const InstructionsList = styled.ul`
  color: #0c5460;
  margin: 0;
  padding-left: 20px;
`;

const InstructionsItem = styled.li`
  margin-bottom: 8px;
  line-height: 1.5;
`;

const SuccessMessage = styled.div`
  background: #d4edda;
  color: #155724;
  padding: 10px;
  border-radius: 6px;
  margin-top: 10px;
  font-size: 12px;
  text-align: center;
`;

const RestaurantSettingsCard = ({ restaurant }) => {
  const [copiedUrl, setCopiedUrl] = useState('');
  const [showQR, setShowQR] = useState(false);

  // Generate restaurant URLs
  const generateUrls = () => {
    const baseUrl = process.env.REACT_APP_CLIENT_URL || 'https://onlinemenuclient.onrender.com';
    const adminUrl = process.env.REACT_APP_ADMIN_URL || 'https://onlinemenuadmin.onrender.com';
    
    // For production, use subdomains for complete restaurant isolation
    if (process.env.NODE_ENV === 'production') {
      return {
        website: `https://${restaurant.slug}.onlinemenuclient.onrender.com`,
        tableQR: `https://${restaurant.slug}.onlinemenuclient.onrender.com/table/{tableNumber}`,
        admin: `https://onlinemenuadmin.onrender.com/${restaurant.slug}/admin`
      };
    }
    
    // For development, use localhost with subdomains
    const domain = baseUrl.replace(/^https?:\/\//, '');
    const adminDomain = adminUrl.replace(/^https?:\/\//, '');
    
    return {
      website: `http://${restaurant.slug}.${domain}`,
      tableQR: `http://${restaurant.slug}.${domain}/table/{tableNumber}`,
      admin: `http://${restaurant.slug}.${adminDomain}/admin`
    };
  };

  const urls = generateUrls();

  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedUrl(label);
      setTimeout(() => setCopiedUrl(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const openUrl = (url) => {
    window.open(url, '_blank');
  };

  const generateQRCode = (tableNumber) => {
    const tableUrl = urls.tableQR.replace('{tableNumber}', tableNumber);
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(tableUrl)}`;
    
    // Open QR code in new tab for download
    window.open(qrCodeUrl, '_blank');
  };

  const downloadQRCode = (tableNumber) => {
    const tableUrl = urls.tableQR.replace('{tableNumber}', tableNumber);
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(tableUrl)}`;
    
    // Create download link
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `table-${tableNumber}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!restaurant) {
    return (
      <Container>
        <div style={{ textAlign: 'center', color: '#6c757d' }}>
          <p>Restaurant information not available</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Icon>🌐</Icon>
        <Title>Restaurant Client App</Title>
      </Header>

      <Section>
        <SectionTitle>
          <FaGlobe /> Website URL
        </SectionTitle>
        <UrlCard>
          <UrlLabel>Your Restaurant Website</UrlLabel>
          <UrlValue>{urls.website}</UrlValue>
          <ButtonGroup>
            <Button className="primary" onClick={() => openUrl(urls.website)}>
              <FaExternalLinkAlt /> Visit Website
            </Button>
            <Button className="secondary" onClick={() => copyToClipboard(urls.website, 'website')}>
              <FaCopy /> Copy URL
            </Button>
          </ButtonGroup>
          {copiedUrl === 'website' && <SuccessMessage>URL copied to clipboard!</SuccessMessage>}
        </UrlCard>
      </Section>

      <Section>
        <SectionTitle>
          <FaQrcode /> Table QR Codes
        </SectionTitle>
        <QRCodeSection>
          <p style={{ color: '#6c757d', marginBottom: '15px' }}>
            Generate QR codes for each table so customers can order directly from their phones.
          </p>
          
          <TableGrid>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(tableNum => (
              <TableCard key={tableNum}>
                <TableHeader>
                  <FaTable />
                  <TableNumber>Table {tableNum}</TableNumber>
                </TableHeader>
                <TableUrl>
                  {urls.tableQR.replace('{tableNumber}', tableNum)}
                </TableUrl>
                <ButtonGroup>
                  <Button 
                    className="success" 
                    onClick={() => generateQRCode(tableNum)}
                  >
                    <FaQrcode /> Generate QR
                  </Button>
                  <Button 
                    className="secondary" 
                    onClick={() => downloadQRCode(tableNum)}
                  >
                    <FaDownload /> Download
                  </Button>
                </ButtonGroup>
              </TableCard>
            ))}
          </TableGrid>
        </QRCodeSection>
      </Section>

      <Section>
        <SectionTitle>
          <FaExternalLinkAlt /> Admin Access
        </SectionTitle>
        <UrlCard>
          <UrlLabel>Admin Panel</UrlLabel>
          <UrlValue>{urls.admin}</UrlValue>
          <ButtonGroup>
            <Button className="primary" onClick={() => openUrl(urls.admin)}>
              <FaExternalLinkAlt /> Open Admin Panel
            </Button>
            <Button className="secondary" onClick={() => copyToClipboard(urls.admin, 'admin')}>
              <FaCopy /> Copy URL
            </Button>
          </ButtonGroup>
          {copiedUrl === 'admin' && <SuccessMessage>Admin URL copied to clipboard!</SuccessMessage>}
        </UrlCard>
      </Section>

      <Instructions>
        <InstructionsTitle>📋 Instructions for Restaurant Owner</InstructionsTitle>
        <InstructionsList>
          <InstructionsItem>
            <strong>Share your website:</strong> Add the website URL to social media, business cards, and marketing materials
          </InstructionsItem>
          <InstructionsItem>
            <strong>Print QR codes:</strong> Generate and print QR codes for each table using the Table QR section above
          </InstructionsItem>
          <InstructionsItem>
            <strong>Place QR codes:</strong> Put the printed QR codes on each table so customers can scan and order
          </InstructionsItem>
          <InstructionsItem>
            <strong>Monitor orders:</strong> Use the admin panel to track orders and manage your menu
          </InstructionsItem>
          <InstructionsItem>
            <strong>Customize branding:</strong> Update colors, logo, and content in the admin panel to match your brand
          </InstructionsItem>
        </InstructionsList>
      </Instructions>

      <div style={{ marginTop: '20px', textAlign: 'center', color: '#6c757d', fontSize: '14px' }}>
        <p>💡 <strong>Pro Tip:</strong> Your restaurant app is live immediately after creation!</p>
        <p>Customers can start ordering as soon as you share the website URL or place QR codes on tables.</p>
      </div>
    </Container>
  );
};

export default RestaurantSettingsCard;
