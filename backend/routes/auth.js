const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { pool } = require('../database/connection');
const { 
    extractRestaurantContext, 
    injectRestaurantContext 
} = require('../middleware/restaurantMiddleware');

const router = express.Router();

// Apply restaurant context middleware to user management routes only
// (not to register/login routes)
router.use('/users', extractRestaurantContext);
router.use('/users', injectRestaurantContext);

// Add JSON parsing middleware specifically for auth routes
router.use(express.json({ limit: '10mb' }));

// Register new user
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().isLength({ min: 2 }),
  body('role').isIn(['customer', 'admin'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name, role, phone, address, restaurantName, restaurantSlug } = req.body;

    // Check if user already exists
    const userExists = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let restaurantId = null;
    let finalRestaurantSlug = null;

    // If this is an admin user, create a new restaurant
    if (role === 'admin') {
      console.log('🔍 Debug - restaurantName:', restaurantName);
      console.log('🔍 Debug - restaurantSlug:', restaurantSlug);
      
      // Use provided restaurant slug or generate from restaurant name
      let finalSlug = restaurantSlug;
      if (!finalSlug && restaurantName) {
        finalSlug = restaurantName
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();
        console.log('🔍 Debug - Generated slug from restaurant name:', finalSlug);
      }
      
      // If still no slug, generate from email as fallback
      if (!finalSlug) {
        const emailPrefix = email.split('@')[0];
        finalSlug = emailPrefix.toLowerCase().replace(/[^a-z0-9]/g, '');
      }
      
      // Ensure slug is unique
      let counter = 1;
      let uniqueSlug = finalSlug;
      while (true) {
        const slugExists = await pool.query(
          'SELECT id FROM restaurants WHERE slug = $1',
          [uniqueSlug]
        );
        if (slugExists.rows.length === 0) break;
        uniqueSlug = `${finalSlug}${counter}`;
        counter++;
      }
      finalSlug = uniqueSlug;
      finalRestaurantSlug = finalSlug;

      // Create new restaurant
      const newRestaurant = await pool.query(
        `INSERT INTO restaurants (
          name, slug, description, primary_color, secondary_color, 
          open_time, close_time, timezone, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
        [
          restaurantName || `${name}'s Restaurant`, // Use restaurant name from form
          finalSlug,
          `Welcome to ${restaurantName || `${name}'s Restaurant`}!`,
          '#3b82f6', // Default blue
          '#ffffff', // Default white
          '09:00:00', // Default open time
          '22:00:00', // Default close time
          'UTC',
          true
        ]
      );

      restaurantId = newRestaurant.rows[0].id;

      // Create default restaurant branding
      await pool.query(
        `INSERT INTO restaurant_branding (
          restaurant_id, primary_color, secondary_color, accent_color, font_family
        ) VALUES ($1, $2, $3, $4, $5)`,
        [restaurantId, '#3b82f6', '#ffffff', '#10b981', 'Inter']
      );

      // Create default restaurant content
      await pool.query(
        `INSERT INTO restaurant_content (
          restaurant_id, page_type, title, content, is_published
        ) VALUES 
        ($1, 'about', 'About Us', 'Welcome to our restaurant!', true),
        ($1, 'contact', 'Contact Us', 'Get in touch with us.', true)`,
        [restaurantId]
      );

      // Create default restaurant settings
      await pool.query(
        `INSERT INTO restaurant_settings (
          restaurant_id, restaurant_name, description
        ) VALUES ($1, $2, $3)`,
        [restaurantId, restaurantName || `${name}'s Restaurant`, `Restaurant managed by ${name}`]
      );
    } else {
      // For non-admin users, assign to default restaurant
      const defaultRestaurant = await pool.query(
        'SELECT id FROM restaurants WHERE slug = $1',
        ['default']
      );
      restaurantId = defaultRestaurant.rows[0].id;
    }

    // Create user with restaurant_id
    const newUser = await pool.query(
      'INSERT INTO users (email, password, name, role, phone, address, restaurant_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, email, name, role, phone, address, restaurant_id',
      [email, hashedPassword, name, role, phone || null, address || null, restaurantId]
    );

    // Generate JWT with restaurant context
    const token = jwt.sign(
      { 
        userId: newUser.rows[0].id, 
        role,
        restaurantId: restaurantId,
        restaurantSlug: finalRestaurantSlug,
        restaurantName: restaurantName || `${name}'s Restaurant`
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      user: {
        ...newUser.rows[0],
        restaurant_slug: finalRestaurantSlug
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login user
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user with restaurant information
    const user = await pool.query(
      `SELECT u.*, r.slug as restaurant_slug, r.name as restaurant_name 
       FROM users u 
       LEFT JOIN restaurants r ON u.restaurant_id = r.id 
       WHERE u.email = $1`,
      [email]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate JWT with restaurant context
    const token = jwt.sign(
      { 
        userId: user.rows[0].id, 
        role: user.rows[0].role,
        restaurantId: user.rows[0].restaurant_id,
        restaurantSlug: user.rows[0].restaurant_slug,
        restaurantName: user.rows[0].restaurant_name
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      user: {
        id: user.rows[0].id,
        email: user.rows[0].email,
        name: user.rows[0].name,
        role: user.rows[0].role,
        phone: user.rows[0].phone,
        address: user.rows[0].address,
        restaurant_id: user.rows[0].restaurant_id,
        restaurant_slug: user.rows[0].restaurant_slug,
        restaurant_name: user.rows[0].restaurant_name
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Validate token and get user info
router.get('/validate', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user info from database with restaurant information
    const user = await pool.query(
      `SELECT u.id, u.email, u.name, u.role, u.phone, u.address, u.restaurant_id, 
              r.slug as restaurant_slug, r.name as restaurant_name
       FROM users u 
       LEFT JOIN restaurants r ON u.restaurant_id = r.id 
       WHERE u.id = $1`,
      [decoded.userId]
    );

    if (user.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json({
      user: user.rows[0]
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    console.error('Token validation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all users (admin only)
router.get('/users', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user is admin
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    // Get all users for this restaurant only (excluding password)
    if (!req.restaurantId) {
      return res.status(400).json({ error: 'Restaurant context required' });
    }
    
    const users = await pool.query(
      'SELECT id, email, name, role, phone, address, status, created_at as join_date FROM users WHERE restaurant_id = $1 ORDER BY created_at DESC',
      [req.restaurantId]
    );

    res.json(users.rows);
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user information (admin only)
router.put('/users/:id', [
  body('name').optional().trim().isLength({ min: 2 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().trim(),
  body('address').optional().trim(),
  body('role').optional().isIn(['customer', 'admin']),
  body('status').optional().isIn(['active', 'inactive', 'suspended'])
], async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user is admin
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, email, phone, address, role, status } = req.body;

    // Check if user exists and belongs to this restaurant
    if (!req.restaurantId) {
      return res.status(400).json({ error: 'Restaurant context required' });
    }
    
    const userExists = await pool.query('SELECT id FROM users WHERE id = $1 AND restaurant_id = $2', [id, req.restaurantId]);
    if (userExists.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if email is being changed and if it's already taken
    if (email) {
      const emailExists = await pool.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, id]
      );
      if (emailExists.rows.length > 0) {
        return res.status(400).json({ error: 'Email already taken' });
      }
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (name !== undefined) {
      updateFields.push(`name = $${paramCount++}`);
      updateValues.push(name);
    }
    if (email !== undefined) {
      updateFields.push(`email = $${paramCount++}`);
      updateValues.push(email);
    }
    if (phone !== undefined) {
      updateFields.push(`phone = $${paramCount++}`);
      updateValues.push(phone);
    }
    if (address !== undefined) {
      updateFields.push(`address = $${paramCount++}`);
      updateValues.push(address);
    }
    if (role !== undefined) {
      updateFields.push(`role = $${paramCount++}`);
      updateValues.push(role);
    }
    if (status !== undefined) {
      updateFields.push(`status = $${paramCount++}`);
      updateValues.push(status);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateValues.push(id);
    const updateQuery = `
      UPDATE users 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $${paramCount}
      RETURNING id, email, name, role, phone, address, status, created_at as join_date
    `;

    const updatedUser = await pool.query(updateQuery, updateValues);

    res.json(updatedUser.rows[0]);
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete user (admin only)
router.delete('/users/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user is admin
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    const { id } = req.params;

    // Check if user exists and belongs to this restaurant
    if (!req.restaurantId) {
      return res.status(400).json({ error: 'Restaurant context required' });
    }
    
    const userExists = await pool.query('SELECT id FROM users WHERE id = $1 AND restaurant_id = $2', [id, req.restaurantId]);
    if (userExists.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if trying to delete self
    if (parseInt(id) === decoded.userId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    // Delete user
    await pool.query('DELETE FROM users WHERE id = $1', [id]);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
