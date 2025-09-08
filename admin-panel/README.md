# Admin Panel - Online Menu System

A comprehensive admin panel for managing your online menu system, built with React and connected to your PostgreSQL backend.

## 🚀 Features

### **Authentication & User Management**
- **Login/Registration**: Secure admin account creation and authentication
- **JWT Integration**: Token-based authentication with your backend
- **Role-based Access**: Admin-only access to management features

### **Menu Management**
- **Add/Edit/Delete**: Full CRUD operations for menu items
- **Category Management**: Organize items by categories
- **Image Support**: Upload and manage item images via Backblaze B2
- **Availability Toggle**: Enable/disable items quickly

### **Order Management**
- **Real-time Updates**: Live order status tracking
- **Status Workflow**: Pending → Confirmed → Preparing → Ready → Delivered
- **Order Details**: Complete customer and item information
- **Bulk Operations**: Manage multiple orders efficiently

### **Dashboard Analytics**
- **Statistics Overview**: Users, menu items, orders, revenue
- **Recent Orders**: Latest order activity
- **Performance Metrics**: Business insights at a glance

## 🛠️ Setup Instructions

### **Prerequisites**
- Node.js 18+ and npm
- Your PostgreSQL backend running on port 5000
- Backblaze B2 account configured

### **1. Install Dependencies**
```bash
cd admin-panel
npm install
```

### **2. Configure Backend Connection**
The admin panel is configured to connect to your backend at `http://localhost:5000`. If your backend runs on a different port or URL, update the configuration in `src/config.js`:

```javascript
export const API_CONFIG = {
  BASE_URL: 'http://your-backend-url:port',
  TIMEOUT: 10000,
};
```

### **3. Start the Development Server**
```bash
npm start
```

The admin panel will open at `http://localhost:3000`

## 🔐 Authentication

### **Demo Account**
- **Username**: admin
- **Password**: admin123

### **Registration**
New users can create admin accounts through the registration form. All registrations automatically get admin role access.

## 📱 API Integration

The admin panel integrates with your existing backend endpoints:

- **Auth**: `/auth/login`, `/auth/register`
- **Menu**: `/menu`, `/menu/categories`
- **Orders**: `/orders`, `/orders/:id/status`
- **Upload**: `/upload/image`

## 🎨 Customization

### **Styling**
- CSS files are organized by component
- Easy to modify colors, fonts, and layouts
- Responsive design for all screen sizes

### **Adding New Features**
- Components are modular and reusable
- API service layer for easy backend integration
- Context API for state management

## 🚨 Troubleshooting

### **Backend Connection Issues**
1. Ensure your backend is running on port 5000
2. Check CORS configuration in your backend
3. Verify JWT_SECRET is properly set

### **Database Issues**
1. Ensure PostgreSQL is running
2. Check database connection in backend
3. Verify table schemas match expected data structure

### **Image Upload Issues**
1. Verify Backblaze B2 credentials
2. Check upload endpoint configuration
3. Ensure proper file permissions

## 🔧 Development

### **Project Structure**
```
src/
├── components/          # React components
├── contexts/           # React contexts
├── services/           # API services
├── config.js           # Configuration
└── App.js             # Main application
```

### **Adding New API Endpoints**
1. Update `src/config.js` with new endpoints
2. Add methods to `src/services/api.js`
3. Integrate with components as needed

## 📊 Backend Requirements

Your backend should provide these endpoints:

- **User authentication** with JWT
- **Menu item CRUD operations**
- **Order management and status updates**
- **File upload for images**
- **User management (optional)**

## 🌟 Next Steps

- [ ] Implement real-time notifications with Socket.io
- [ ] Add image upload functionality with Backblaze B2
- [ ] Create user management endpoints in backend
- [ ] Add reporting and analytics features
- [ ] Implement bulk operations for orders

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Verify backend configuration
3. Review API endpoint documentation

---

**Built with React, connected to your PostgreSQL + Backblaze B2 backend**
