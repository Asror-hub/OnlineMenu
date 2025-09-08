# Multi-Tenancy Database Architecture

## Overview
This document explains the multi-tenant database structure that allows hundreds of restaurants to use the same application while maintaining complete data isolation.

## Core Concept
Each restaurant has its own isolated data space identified by `restaurant_id`. All queries automatically filter by this ID to ensure restaurants can never see each other's data.

## Database Tables Structure

### 1. Core Restaurant Table
```sql
restaurants
├── id (Primary Key)
├── name (Restaurant name)
├── slug (URL-friendly identifier: restaurant1.yourapp.com)
├── domain (Custom domain: pizzapalace.com)
├── description, logo_url, colors, contact info
├── is_active (Enable/disable restaurant)
└── timestamps
```

### 2. Multi-Tenant Data Tables
All existing tables now include `restaurant_id`:
- `users` - Restaurant staff and customers
- `menu_items` - Food items specific to each restaurant
- `categories` - Menu categories per restaurant
- `subcategories` - Subcategories per restaurant
- `orders` - Orders for each restaurant
- `order_items` - Order details per restaurant

### 3. Restaurant-Specific Tables
- `restaurant_settings` - WiFi, social media, additional settings
- `restaurant_staff` - Staff roles and permissions within each restaurant
- `restaurant_branding` - Custom colors, fonts, logos per restaurant
- `restaurant_content` - CMS pages (about, contact, policies) per restaurant

## Data Isolation Strategy

### Database Level
- Every table has `restaurant_id` as a foreign key
- All queries must include `WHERE restaurant_id = ?`
- Database functions validate restaurant access

### Application Level
- JWT tokens include `restaurant_id`
- API middleware validates restaurant access
- Frontend context stores current restaurant

### Security Features
- Row-level security through foreign keys
- User can only access their assigned restaurant
- No cross-restaurant data leakage possible

## URL Routing Strategy

### Option 1: Subdomains
- `restaurant1.yourapp.com` → Loads restaurant1 data
- `restaurant2.yourapp.com` → Loads restaurant2 data

### Option 2: Custom Domains
- `pizzapalace.com` → Points to your app, loads corresponding restaurant
- `burgerjoint.com` → Points to your app, loads corresponding restaurant

### Option 3: Path-based
- `yourapp.com/restaurant1` → Loads restaurant1 data
- `yourapp.com/restaurant2` → Loads restaurant2 data

## How It Works

### 1. Restaurant Detection
```javascript
// Frontend detects restaurant from URL/domain
const restaurantSlug = getRestaurantFromURL();
// restaurant1.yourapp.com → restaurantSlug = "restaurant1"

// Backend API calls include restaurant context
const response = await api.get(`/api/menu-items?restaurant=${restaurantSlug}`);
```

### 2. Data Filtering
```sql
-- All queries automatically filter by restaurant_id
SELECT * FROM menu_items 
WHERE restaurant_id = $1 AND is_active = true;

-- Users can only see their restaurant's data
SELECT * FROM orders 
WHERE restaurant_id = $1 AND user_id = $2;
```

### 3. Authentication
```javascript
// JWT token includes restaurant_id
const token = {
  userId: 123,
  restaurantId: 456,  // User can only access restaurant 456
  role: 'manager'
};

// API middleware validates access
if (user.restaurantId !== requestedRestaurantId) {
  return res.status(403).json({ error: 'Access denied' });
}
```

## Benefits

### For Restaurant Owners
- Complete data isolation
- Custom branding and themes
- Personal domain/website
- Independent analytics

### For Developers
- Single codebase to maintain
- Shared infrastructure
- Easier updates and bug fixes
- Centralized monitoring

### For Business
- Scalable to thousands of restaurants
- Lower operational costs
- Faster feature development
- Better data insights

## Migration Process

### Phase 1: Database Migration
1. Run `multi_tenancy_migration.sql`
2. Existing data assigned to "Default Restaurant"
3. New structure ready for multi-tenancy

### Phase 2: Backend Updates
1. Update API endpoints to filter by restaurant
2. Add restaurant validation middleware
3. Update authentication to include restaurant context

### Phase 3: Frontend Updates
1. Add restaurant context providers
2. Update API calls to include restaurant
3. Implement dynamic theming system

### Phase 4: Testing
1. Test data isolation between restaurants
2. Verify no cross-restaurant data leakage
3. Test custom domains and subdomains

## Adding New Restaurants

### 1. Create Restaurant Record
```sql
INSERT INTO restaurants (name, slug, domain, description) 
VALUES ('Pizza Palace', 'pizzapalace', 'pizzapalace.com', 'Best pizza in town');
```

### 2. Set Up Branding
```sql
INSERT INTO restaurant_branding (restaurant_id, primary_color, secondary_color)
VALUES (1, '#ff6b6b', '#ffffff');
```

### 3. Create Content Pages
```sql
INSERT INTO restaurant_content (restaurant_id, page_type, title, content)
VALUES (1, 'about', 'About Pizza Palace', 'We serve the best pizza...');
```

### 4. Add Staff Members
```sql
INSERT INTO restaurant_staff (restaurant_id, user_id, role)
VALUES (1, 123, 'owner');
```

## Performance Considerations

### Indexes
- `restaurant_id` indexes on all tables
- Composite indexes for common queries
- Efficient restaurant-based filtering

### Caching
- Redis keys prefixed with restaurant IDs
- Restaurant-specific cache invalidation
- Shared cache for common data

### Scaling
- Horizontal scaling with restaurant-based sharding
- Database partitioning by restaurant
- Load balancing across restaurant instances

## Security Checklist

- [ ] All API endpoints validate restaurant access
- [ ] JWT tokens include restaurant_id
- [ ] Database queries filter by restaurant_id
- [ ] No cross-restaurant data exposure
- [ ] User permissions scoped to restaurant
- [ ] File uploads isolated by restaurant
- [ ] API rate limiting per restaurant

## Next Steps

1. **Review the migration script** - Understand what changes will be made
2. **Backup your database** - Always backup before major changes
3. **Test in development** - Run migration on a copy first
4. **Plan the rollout** - Coordinate with your team
5. **Monitor performance** - Watch for any performance impacts

## Support

If you encounter any issues during migration:
1. Check the database logs for errors
2. Verify all foreign key constraints
3. Test data isolation between restaurants
4. Ensure all API endpoints include restaurant filtering
