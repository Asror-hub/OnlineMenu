# Online Menu System

A complete online menu system with web client, admin panel, and mobile app for restaurants to manage their menu and accept orders.

## Features

### 🍽️ **Client Web App**
- Browse menu by categories
- Add items to cart
- Place orders with delivery details
- Track order status
- User authentication

### 👨‍💼 **Admin Panel**
- Manage menu items (CRUD operations)
- Upload images via Backblaze
- View and manage orders
- Update order status
- Real-time order notifications

### 📱 **Mobile App**
- React Native with Expo
- Same functionality as web client
- Native mobile experience
- Offline support ready

### 🔧 **Backend API**
- Node.js + Express
- PostgreSQL database
- JWT authentication
- Real-time updates with Socket.io
- Image upload to Backblaze
- RESTful API design

## Tech Stack

- **Backend**: Node.js, Express, PostgreSQL, Socket.io
- **Web Apps**: React.js (latest)
- **Mobile**: React Native + Expo (latest)
- **Storage**: Backblaze B2
- **Authentication**: JWT
- **Real-time**: Socket.io

## Project Structure

```
OnlineMenu/
├── backend/                 # Node.js API server
│   ├── routes/             # API endpoints
│   ├── middleware/         # Authentication middleware
│   ├── database/           # Database schema
│   └── server.js           # Main server file
├── client-app/             # Customer web application
│   └── src/
│       ├── components/     # Reusable components
│       ├── pages/          # Page components
│       └── contexts/       # React contexts
├── admin-panel/            # Restaurant admin panel
│   └── src/
│       ├── components/     # Admin components
│       ├── pages/          # Admin pages
│       └── contexts/       # Admin contexts
└── mobile-app/             # React Native mobile app
    └── src/
        ├── screens/        # App screens
        └── contexts/       # Mobile contexts
```

## Prerequisites

- Node.js (v18+)
- PostgreSQL (v14+)
- Backblaze B2 account
- Expo CLI (for mobile development)

## Setup Instructions

### 1. Database Setup

```sql
-- Create database
CREATE DATABASE online_menu_db;

-- Run the schema file
\i backend/database/schema.sql
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Edit .env with your credentials
# - DATABASE_URL
# - JWT_SECRET
# - BACKBLAZE credentials

# Start development server
npm run dev
```

### 3. Client Web App Setup

```bash
cd client-app

# Install dependencies
npm install

# Start development server
npm start
```

### 4. Admin Panel Setup

```bash
cd admin-panel

# Install dependencies
npm install

# Start development server
npm start
```

### 5. Mobile App Setup

```bash
cd mobile-app

# Install dependencies
npm install

# Start Expo development server
npx expo start
```

## Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://username:password@localhost:5432/online_menu_db
JWT_SECRET=your-super-secret-jwt-key-here
BACKBLAZE_ACCESS_KEY_ID=your-access-key-id
BACKBLAZE_SECRET_ACCESS_KEY=your-secret-access-key
BACKBLAZE_BUCKET_NAME=your-bucket-name
BACKBLAZE_REGION=us-west-002
BACKBLAZE_ENDPOINT=https://s3.us-west-002.backblazeb2.com
BACKBLAZE_PUBLIC_URL=https://your-bucket-name.s3.us-west-002.backblazeb2.com
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Menu
- `GET /api/menu` - Get all menu items
- `GET /api/menu/categories` - Get menu categories
- `POST /api/menu` - Create menu item (admin)
- `PUT /api/menu/:id` - Update menu item (admin)
- `DELETE /api/menu/:id` - Delete menu item (admin)

### Orders
- `GET /api/orders` - Get all orders (admin)
- `GET /api/orders/my-orders` - Get user orders
- `POST /api/orders` - Place new order
- `PATCH /api/orders/:id/status` - Update order status (admin)

### Upload
- `POST /api/upload/image` - Upload menu item image (admin)

## Usage

### For Customers
1. Register/Login to the web app or mobile app
2. Browse menu by categories
3. Add items to cart
4. Place order with delivery details
5. Track order status in real-time

### For Restaurant Staff
1. Login to admin panel
2. Manage menu items (add, edit, delete)
3. Upload food images
4. View incoming orders
5. Update order status
6. Monitor order flow

## Development

### Adding New Features
- Backend: Add routes in `backend/routes/`
- Web Apps: Add components in respective `src/components/`
- Mobile: Add screens in `mobile-app/src/screens/`

### Database Changes
- Update schema in `backend/database/schema.sql`
- Run migrations manually or update schema file

### Styling
- Web apps use CSS modules
- Mobile app uses StyleSheet
- Follow existing design patterns

## Deployment

### Backend
- Deploy to Heroku, DigitalOcean, or AWS
- Set production environment variables
- Use production PostgreSQL instance

### Web Apps
- Build with `npm run build`
- Deploy to Vercel, Netlify, or any static hosting

### Mobile App
- Build with `expo build:android` or `expo build:ios`
- Publish to app stores

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Check existing issues
- Create new issue with detailed description
- Include environment details and error logs
