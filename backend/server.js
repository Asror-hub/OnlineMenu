const express = require('express');
const cors = require('cors');
// const helmet = require('helmet');
// const rateLimit = require('express-rate-limit');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { setIO } = require('./database/connection');
require('dotenv').config();

const app = express();
const server = createServer(app);

// Minimal Socket.io setup
const io = new Server(server, {
  cors: {
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
  }
});

// Set io instance in connection file
setIO(io);

// CORS and middleware
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Restaurant-Id', 'X-Restaurant-Slug', 'X-Session-Id']
}));

// Health check endpoint for Render
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Online Menu Backend API'
  });
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working' });
});

// Test feedback endpoint
app.post('/api/feedbacks/test', (req, res) => {
  console.log('🧪 Test feedback endpoint called');
  res.json({ 
    success: true, 
    message: 'Test feedback endpoint is working',
    received: req.body 
  });
});

// Test database connection endpoint
app.get('/api/test-db', async (req, res) => {
  try {
    const { pool } = require('./database/connection');
    
    // Test basic connection
    const result = await pool.query('SELECT NOW() as current_time');
    
    // Test if tables exist
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    res.json({
      success: true,
      message: 'Database connection successful',
      currentTime: result.rows[0].current_time,
      tables: tablesResult.rows.map(row => row.table_name)
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Public orders endpoint (bypasses all middleware)
app.get('/api/orders/public/active', async (req, res) => {
  try {
    const { pool } = require('./database/connection');
    
    console.log('🔍 Public active orders endpoint called');
    console.log('  Headers:', req.headers);
    
    // Get restaurant ID from header
    const restaurantSlug = req.get('x-restaurant-slug');
    
    if (!restaurantSlug) {
      return res.status(400).json({ error: 'Restaurant context required (X-Restaurant-Slug header)' });
    }
    
    // Get restaurant ID from slug
    const restaurantResult = await pool.query(
      'SELECT id FROM restaurants WHERE slug = $1',
      [restaurantSlug]
    );
    
    if (restaurantResult.rows.length === 0) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    
    const restaurantId = restaurantResult.rows[0].id;
    console.log('  Restaurant ID:', restaurantId);

    const result = await pool.query(
      `SELECT o.*, 
              json_agg(
                json_build_object(
                  'id', oi.id,
                  'menu_item_id', oi.menu_item_id,
                  'quantity', oi.quantity,
                  'price', oi.price,
                  'notes', oi.notes,
                  'menuItem', json_build_object(
                    'id', mi.id,
                    'name', mi.name,
                    'description', mi.description,
                    'price', mi.price,
                    'image_url', mi.image_url,
                    'category_id', mi.category_id,
                    'subcategory_id', mi.subcategory_id
                  )
                )
              ) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
       WHERE o.status NOT IN ('delivered', 'cancelled') AND o.restaurant_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [restaurantId]
    );

    console.log('  Orders found:', result.rows.length);
    res.json({ orders: result.rows });
  } catch (error) {
    console.error('Get public active orders error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get recently finished orders (for feedback trigger) - PUBLIC ACCESS
app.get('/api/orders/public/recently-finished', async (req, res) => {
  try {
    const { pool } = require('./database/connection');
    
    console.log('🔍 Recently finished orders endpoint called');
    console.log('  Headers:', req.headers);
    
    // Get restaurant ID from header
    const restaurantSlug = req.get('x-restaurant-slug');
    
    if (!restaurantSlug) {
      return res.status(400).json({ error: 'Restaurant context required (X-Restaurant-Slug header)' });
    }
    
    // Get restaurant ID from slug
    const restaurantResult = await pool.query(
      'SELECT id FROM restaurants WHERE slug = $1',
      [restaurantSlug]
    );
    
    if (restaurantResult.rows.length === 0) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    
    const restaurantId = restaurantResult.rows[0].id;
    console.log('  Restaurant ID:', restaurantId);

    // Get orders that were finished in the last 24 hours
    const result = await pool.query(
      `SELECT o.*, 
              json_agg(
                json_build_object(
                  'id', oi.id,
                  'menu_item_id', oi.menu_item_id,
                  'quantity', oi.quantity,
                  'price', oi.price,
                  'notes', oi.notes,
                  'menuItem', json_build_object(
                    'id', mi.id,
                    'name', mi.name,
                    'description', mi.description,
                    'price', mi.price,
                    'image_url', mi.image_url,
                    'category_id', mi.category_id,
                    'subcategory_id', mi.category_id
                  )
                )
              ) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
       WHERE o.status IN ('delivered', 'finished', 'completed') 
         AND o.restaurant_id = $1
         AND o.updated_at > NOW() - INTERVAL '24 hours'
       GROUP BY o.id
       ORDER BY o.updated_at DESC`,
      [restaurantId]
    );

    console.log('  Recently finished orders found:', result.rows.length);
    res.json({ orders: result.rows });
  } catch (error) {
    console.error('Get recently finished orders error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Public feedback endpoint (for customer feedback submission)
app.post('/api/feedbacks/public', async (req, res) => {
  try {
    const { pool } = require('./database/connection');
    
    console.log('🔍 PUBLIC FEEDBACK ENDPOINT CALLED - MANUAL TEST');
    console.log('  ================================================');
    console.log('  Headers:', JSON.stringify(req.headers, null, 2));
    console.log('  Body:', JSON.stringify(req.body, null, 2));
    console.log('  X-Restaurant-Slug:', req.get('x-restaurant-slug'));
    console.log('  Order ID from body:', req.body.order_id, 'type:', typeof req.body.order_id);
    console.log('  Customer name:', req.body.customer_name);
    console.log('  Rating:', req.body.rating);
    console.log('  ================================================');
    
    const {
      order_id,
      customer_name,
      customer_email,
      rating,
      food_rating,
      service_rating,
      atmosphere_rating,
      feedback_text,
      feedback_type = 'general',
      is_public = true,
      is_verified = false
    } = req.body;

    // Validate required fields
    if (!customer_name || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Customer name and rating are required'
      });
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Get restaurant_id from the order (if order_id is provided and not 0)
    let restaurant_id, order_customer_name, order_customer_email, order_number, order_items;
    
    console.log('🔍 ORDER PROCESSING LOGIC:');
    console.log('  order_id:', order_id, 'type:', typeof order_id);
    console.log('  order_id !== 0:', order_id !== 0);
    console.log('  order_id && order_id !== 0:', order_id && order_id !== 0);
    
    if (order_id && order_id !== 0) {
      console.log('  ✅ ENTERING ORDER-SPECIFIC FEEDBACK PATH');
      const orderQuery = `
        SELECT 
          o.restaurant_id, 
          o.customer_name as order_customer_name, 
          o.customer_email as order_customer_email,
          CONCAT('ORD-', LPAD(o.id::text, 6, '0')) as order_number,
          json_agg(
            json_build_object(
              'name', mi.name,
              'quantity', oi.quantity,
              'price', oi.price,
              'notes', oi.notes
            )
          ) as order_items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
        WHERE o.id = $1
        GROUP BY o.id, o.restaurant_id, o.customer_name, o.customer_email
      `;
      
      const orderResult = await pool.query(orderQuery, [order_id]);
      
      if (orderResult.rows.length === 0) {
        // For test orders (like order_id: 999), try to get restaurant from headers first
        console.log(`Order ${order_id} not found, trying to get restaurant from headers`);
        
        // Try to get restaurant from X-Restaurant-Slug header
        const restaurantSlug = req.get('x-restaurant-slug');
        let restaurantQuery, restaurantParams;
        
        if (restaurantSlug) {
          restaurantQuery = `SELECT id FROM restaurants WHERE slug = $1 AND is_active = true`;
          restaurantParams = [restaurantSlug];
          console.log(`Looking for restaurant with slug: ${restaurantSlug}`);
        } else {
          // Fallback to first available restaurant
          restaurantQuery = `SELECT id FROM restaurants WHERE is_active = true LIMIT 1`;
          restaurantParams = [];
          console.log('No restaurant slug in headers, using default restaurant');
        }
        
        const restaurantResult = await pool.query(restaurantQuery, restaurantParams);
        
        if (restaurantResult.rows.length === 0) {
          return res.status(500).json({
            success: false,
            message: 'No active restaurant found'
          });
        }
        
        restaurant_id = restaurantResult.rows[0].id;
        order_customer_name = 'Test Customer';
        order_customer_email = 'test@example.com';
        console.log(`Using restaurant ID: ${restaurant_id} for test feedback`);
      } else {
        const order = orderResult.rows[0];
        restaurant_id = order.restaurant_id;
        order_customer_name = order.order_customer_name;
        order_customer_email = order.order_customer_email;
        order_number = order.order_number;
        order_items = order.order_items;
      }
    } else {
      // No order_id provided (general feedback), get restaurant from headers
      console.log('  ❌ ENTERING GENERAL FEEDBACK PATH (NO ORDER DETAILS)');
      console.log('  No order_id provided, getting restaurant from headers for general feedback');
      
      const restaurantSlug = req.get('x-restaurant-slug');
      
      let restaurantQuery, restaurantParams;
      
      if (restaurantSlug) {
        restaurantQuery = `SELECT id FROM restaurants WHERE slug = $1 AND is_active = true`;
        restaurantParams = [restaurantSlug];
        console.log(`Looking for restaurant with slug: ${restaurantSlug}`);
      } else {
        // Fallback to first available restaurant
        restaurantQuery = `SELECT id FROM restaurants WHERE is_active = true LIMIT 1`;
        restaurantParams = [];
        console.log('No restaurant slug in headers, using default restaurant');
      }
      
      const restaurantResult = await pool.query(restaurantQuery, restaurantParams);
      
      if (restaurantResult.rows.length === 0) {
        return res.status(500).json({
          success: false,
          message: 'No active restaurant found'
        });
      }
      
      restaurant_id = restaurantResult.rows[0].id;
      order_customer_name = customer_name || 'Guest';
      order_customer_email = customer_email || '';
      console.log(`Using restaurant ID: ${restaurant_id} for general feedback`);
    }

    // Use order customer info if not provided
    const finalCustomerName = customer_name || order_customer_name || 'Guest';
    const finalCustomerEmail = customer_email || order_customer_email || '';

    // Calculate overall rating if individual ratings are provided
    let finalRating = rating;
    if (food_rating && service_rating && atmosphere_rating) {
      finalRating = Math.round((food_rating + service_rating + atmosphere_rating) / 3);
    }

    // Insert feedback
    const query = `
      INSERT INTO feedbacks (
        restaurant_id,
        order_id,
        customer_name,
        customer_email,
        rating,
        food_rating,
        service_rating,
        atmosphere_rating,
        feedback_text,
        feedback_type,
        order_number,
        order_items,
        is_public,
        is_verified,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
      RETURNING *
    `;
    
    // Use NULL for order_id if it's 0, null, or doesn't exist, otherwise use the actual order_id
    const finalOrderId = (!order_id || order_id === 0 || order_id === 999) ? null : order_id;
    
    const values = [
      restaurant_id,
      finalOrderId,
      finalCustomerName,
      finalCustomerEmail,
      finalRating,
      food_rating || null,
      service_rating || null,
      atmosphere_rating || null,
      feedback_text || null,
      feedback_type,
      order_number || null,
      order_items ? JSON.stringify(order_items) : null, // Convert to JSON string
      is_public,
      is_verified
    ];
    
    const result = await pool.query(query, values);
    
    console.log(`Feedback created for order ${order_id} in restaurant ${restaurant_id}`);
    
    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Feedback submitted successfully'
    });
  } catch (error) {
    console.error('Error creating public feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting feedback',
      error: error.message
    });
  }
});

// Auth routes
app.use('/api/auth', require('./routes/auth'));

// Menu routes
app.use('/api/menu', require('./routes/menu'));

// Admin routes
app.use('/api/admin', require('./routes/adminRoutes'));

// Restaurant routes
app.use('/api/restaurants', require('./routes/restaurantRoutes'));

// Orders routes
app.use('/api/orders', require('./routes/orders')(io));

// Reservations routes
app.use('/api/reservations', require('./routes/reservations')(io));

// Settings routes
app.use('/api/settings', require('./routes/settings'));

// Dashboard routes
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// Feedback routes
app.use('/api/feedbacks', require('./routes/feedbackRoutes'));

// Socket.io connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Handle restaurant room joining
  socket.on('join_restaurant', (restaurantId) => {
    const roomName = `restaurant_${restaurantId}`;
    socket.join(roomName);
    console.log(`Client ${socket.id} joined room: ${roomName}`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
