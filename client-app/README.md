# 🍽️ Restaurant Client App

A modern, responsive React client application for displaying restaurant menus with online ordering capabilities. Built with React 19, TypeScript, and styled-components.

## ✨ Features

- **Restaurant Data Isolation**: Each restaurant has its own subdomain and isolated data
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Modern UI**: Beautiful, modern interface with smooth animations
- **Online Ordering**: Add items to cart and place orders
- **Real-time Updates**: Live menu updates and order tracking
- **Restaurant Information**: Display restaurant details, hours, contact info
- **Social Media Integration**: Links to restaurant's social media accounts
- **WiFi Information**: Display restaurant WiFi credentials

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running on port 5000

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp env.example .env
```

3. Update `.env` with your configuration:
```env
REACT_APP_API_URL=http://localhost:5000
```

4. Start the development server:
```bash
npm start
```

The app will open at `http://localhost:3000`

## 🏗️ Architecture

### Restaurant Isolation

The app automatically detects the restaurant context from the URL:

- **Development**: `restaurant-slug.localhost:3000`
- **Production**: `restaurant-slug.yourapp.com`

### Key Components

- **RestaurantContext**: Manages restaurant data and settings
- **OrderContext**: Handles cart and order management
- **MenuCategories**: Category navigation
- **MenuItem**: Individual menu item display
- **Cart**: Shopping cart functionality
- **Sidebar**: Restaurant information and details

### Data Flow

1. App detects restaurant from subdomain
2. Loads restaurant info and settings
3. Fetches menu items and categories
4. Displays menu with restaurant branding
5. Handles cart operations and order placement

## 🎨 Styling

Built with styled-components for:
- Component-scoped styles
- Dynamic theming based on restaurant branding
- Responsive design
- Smooth animations and transitions

## 📱 Responsive Design

- **Desktop**: Full sidebar with detailed restaurant info
- **Tablet**: Collapsible sidebar
- **Mobile**: Bottom navigation with cart overlay

## 🔧 Configuration

### Environment Variables

- `REACT_APP_API_URL`: Backend API URL
- `REACT_APP_DEBUG`: Enable debug mode

### Restaurant Branding

The app automatically applies restaurant branding:
- Primary and secondary colors
- Restaurant logo
- Custom styling

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Subdomain Setup

For production deployment:

1. Configure DNS to point subdomains to your app
2. Set up reverse proxy (nginx) to handle subdomain routing
3. Update environment variables for production API URL

### Example nginx Configuration

```nginx
server {
    listen 80;
    server_name *.yourapp.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🧪 Testing

```bash
npm test
```

## 📦 Build

```bash
npm run build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.