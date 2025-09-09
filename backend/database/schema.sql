-- Online Menu System Database Schema
-- This file creates all necessary tables for the restaurant management system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'restaurant_owner')),
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    domain VARCHAR(255),
    description TEXT,
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    google_maps_link TEXT,
    primary_color VARCHAR(7) DEFAULT '#000000',
    secondary_color VARCHAR(7) DEFAULT '#ffffff',
    logo_url VARCHAR(500),
    open_time TIME DEFAULT '09:00:00',
    close_time TIME DEFAULT '22:00:00',
    timezone VARCHAR(50) DEFAULT 'UTC',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Restaurant users (many-to-many relationship)
CREATE TABLE IF NOT EXISTS restaurant_users (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'staff' CHECK (role IN ('owner', 'manager', 'staff')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(restaurant_id, user_id)
);

-- Restaurant staff (separate from restaurant_users for more detailed staff management)
CREATE TABLE IF NOT EXISTS restaurant_staff (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'staff' CHECK (role IN ('owner', 'manager', 'staff', 'waiter', 'chef')),
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(restaurant_id, user_id)
);

-- Menu categories
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Menu subcategories
CREATE TABLE IF NOT EXISTS subcategories (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    position INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Menu items
CREATE TABLE IF NOT EXISTS menu_items (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    subcategory_id INTEGER REFERENCES subcategories(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(500),
    is_available BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add missing columns to existing tables (for production updates)
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS subcategory_id INTEGER REFERENCES subcategories(id) ON DELETE SET NULL;

-- Add missing columns to restaurants table
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS domain VARCHAR(255);
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS google_maps_link TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS open_time TIME DEFAULT '09:00:00';
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS close_time TIME DEFAULT '22:00:00';
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'UTC';

-- Orders
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    order_number VARCHAR(20) UNIQUE NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20),
    customer_email VARCHAR(100),
    delivery_address TEXT,
    delivery_instructions TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')),
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(20) DEFAULT 'cash',
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order items
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id INTEGER REFERENCES menu_items(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    price DECIMAL(10,2) NOT NULL,
    special_instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reservations
CREATE TABLE IF NOT EXISTS reservations (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(100),
    party_size INTEGER NOT NULL DEFAULT 1,
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
    special_requests TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Feedback (note: code uses 'feedbacks' table name)
CREATE TABLE IF NOT EXISTS feedbacks (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
    order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
    customer_name VARCHAR(100),
    customer_email VARCHAR(100),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Restaurant settings
CREATE TABLE IF NOT EXISTS restaurant_settings (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(restaurant_id, setting_key)
);

-- Restaurant branding
CREATE TABLE IF NOT EXISTS restaurant_branding (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
    primary_color VARCHAR(7) DEFAULT '#000000',
    secondary_color VARCHAR(7) DEFAULT '#ffffff',
    accent_color VARCHAR(7) DEFAULT '#FF6B6B',
    font_family VARCHAR(100) DEFAULT 'Arial',
    logo_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(restaurant_id)
);

-- Restaurant content (CMS pages)
CREATE TABLE IF NOT EXISTS restaurant_content (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
    page_type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(restaurant_id, page_type)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_id ON orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant_id ON menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category_id ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_subcategory_id ON menu_items(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_reservations_restaurant_id ON reservations(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(reservation_date);
CREATE INDEX IF NOT EXISTS idx_categories_restaurant_id ON categories(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_subcategories_restaurant_id ON subcategories(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_subcategories_category_id ON subcategories(category_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_restaurant_id ON feedbacks(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_staff_restaurant_id ON restaurant_staff(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_content_restaurant_id ON restaurant_content(restaurant_id);

-- Insert default admin user
INSERT INTO users (username, email, password_hash, role) 
VALUES ('admin', 'admin@example.com', '$2b$10$rQZ8K9L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insert a sample restaurant
INSERT INTO restaurants (name, slug, description, phone, email, address, primary_color, secondary_color)
VALUES ('Sample Restaurant', 'sample-restaurant', 'A sample restaurant for testing', '+1234567890', 'info@samplerestaurant.com', '123 Main St, City, State', '#FF6B6B', '#FFFFFF')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample categories for the sample restaurant
INSERT INTO categories (restaurant_id, name, description, sort_order) 
SELECT r.id, 'Appetizers', 'Start your meal with our delicious appetizers', 1
FROM restaurants r WHERE r.slug = 'sample-restaurant'
ON CONFLICT DO NOTHING;

INSERT INTO categories (restaurant_id, name, description, sort_order) 
SELECT r.id, 'Main Courses', 'Our signature main dishes', 2
FROM restaurants r WHERE r.slug = 'sample-restaurant'
ON CONFLICT DO NOTHING;

INSERT INTO categories (restaurant_id, name, description, sort_order) 
SELECT r.id, 'Desserts', 'Sweet endings to your meal', 3
FROM restaurants r WHERE r.slug = 'sample-restaurant'
ON CONFLICT DO NOTHING;

INSERT INTO categories (restaurant_id, name, description, sort_order) 
SELECT r.id, 'Beverages', 'Refreshing drinks', 4
FROM restaurants r WHERE r.slug = 'sample-restaurant'
ON CONFLICT DO NOTHING;

-- Insert sample menu items
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, is_available) 
SELECT r.id, c.id, 'Caesar Salad', 'Fresh romaine lettuce with caesar dressing', 8.99, true
FROM restaurants r, categories c 
WHERE r.slug = 'sample-restaurant' AND c.restaurant_id = r.id AND c.name = 'Appetizers'
ON CONFLICT DO NOTHING;

INSERT INTO menu_items (restaurant_id, category_id, name, description, price, is_available) 
SELECT r.id, c.id, 'Buffalo Wings', 'Spicy chicken wings with ranch dip', 12.99, true
FROM restaurants r, categories c 
WHERE r.slug = 'sample-restaurant' AND c.restaurant_id = r.id AND c.name = 'Appetizers'
ON CONFLICT DO NOTHING;

INSERT INTO menu_items (restaurant_id, category_id, name, description, price, is_available) 
SELECT r.id, c.id, 'Grilled Salmon', 'Fresh salmon with lemon butter sauce', 24.99, true
FROM restaurants r, categories c 
WHERE r.slug = 'sample-restaurant' AND c.restaurant_id = r.id AND c.name = 'Main Courses'
ON CONFLICT DO NOTHING;

INSERT INTO menu_items (restaurant_id, category_id, name, description, price, is_available) 
SELECT r.id, c.id, 'Beef Steak', 'Tender beef steak cooked to perfection', 28.99, true
FROM restaurants r, categories c 
WHERE r.slug = 'sample-restaurant' AND c.restaurant_id = r.id AND c.name = 'Main Courses'
ON CONFLICT DO NOTHING;

INSERT INTO menu_items (restaurant_id, category_id, name, description, price, is_available) 
SELECT r.id, c.id, 'Chocolate Cake', 'Rich chocolate cake with vanilla ice cream', 6.99, true
FROM restaurants r, categories c 
WHERE r.slug = 'sample-restaurant' AND c.restaurant_id = r.id AND c.name = 'Desserts'
ON CONFLICT DO NOTHING;

INSERT INTO menu_items (restaurant_id, category_id, name, description, price, is_available) 
SELECT r.id, c.id, 'Fresh Orange Juice', 'Freshly squeezed orange juice', 3.99, true
FROM restaurants r, categories c 
WHERE r.slug = 'sample-restaurant' AND c.restaurant_id = r.id AND c.name = 'Beverages'
ON CONFLICT DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at (drop existing ones first)
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_restaurants_updated_at ON restaurants;
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
DROP TRIGGER IF EXISTS update_subcategories_updated_at ON subcategories;
DROP TRIGGER IF EXISTS update_menu_items_updated_at ON menu_items;
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
DROP TRIGGER IF EXISTS update_reservations_updated_at ON reservations;
DROP TRIGGER IF EXISTS update_restaurant_settings_updated_at ON restaurant_settings;
DROP TRIGGER IF EXISTS update_restaurant_branding_updated_at ON restaurant_branding;
DROP TRIGGER IF EXISTS update_restaurant_staff_updated_at ON restaurant_staff;
DROP TRIGGER IF EXISTS update_restaurant_content_updated_at ON restaurant_content;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON restaurants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subcategories_updated_at BEFORE UPDATE ON subcategories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_restaurant_settings_updated_at BEFORE UPDATE ON restaurant_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_restaurant_branding_updated_at BEFORE UPDATE ON restaurant_branding FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_restaurant_staff_updated_at BEFORE UPDATE ON restaurant_staff FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_restaurant_content_updated_at BEFORE UPDATE ON restaurant_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();