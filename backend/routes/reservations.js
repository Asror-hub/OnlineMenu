const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../database/connection');
const auth = require('../middleware/auth');
const { 
    extractRestaurantContext, 
    injectRestaurantContext 
} = require('../middleware/restaurantMiddleware');

module.exports = (io) => {
  const router = express.Router();

  // Apply restaurant context middleware to all routes
  router.use(extractRestaurantContext);
  router.use(injectRestaurantContext);

  // Get all reservations (admin only) - RESTAURANT ISOLATED
  router.get('/', auth, async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }

      if (!req.restaurantId) {
        return res.status(400).json({ error: 'Restaurant context required' });
      }

      const result = await pool.query(
        `SELECT r.*, 
                COALESCE(u.name, r.customer_name) as customer_name, 
                COALESCE(u.email, r.customer_email) as customer_email 
         FROM reservations r 
         LEFT JOIN users u ON r.created_by = u.id 
         WHERE r.restaurant_id = $1
         ORDER BY r.reservation_date DESC, r.reservation_time DESC`,
        [req.restaurantId]
      );
      res.json(result.rows);
    } catch (error) {
      console.error('Get reservations error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Get reservations by date range - RESTAURANT ISOLATED
  router.get('/by-date', auth, async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }

      if (!req.restaurantId) {
        return res.status(400).json({ error: 'Restaurant context required' });
      }

      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Start date and end date are required' });
      }

      const result = await pool.query(
        `SELECT r.*, 
                COALESCE(u.name, r.customer_name) as customer_name, 
                COALESCE(u.email, r.customer_email) as customer_email 
         FROM reservations r 
         LEFT JOIN users u ON r.created_by = u.id 
         WHERE r.restaurant_id = $1 
         AND r.reservation_date BETWEEN $2 AND $3
         ORDER BY r.reservation_date ASC, r.reservation_time ASC`,
        [req.restaurantId, startDate, endDate]
      );
      res.json(result.rows);
    } catch (error) {
      console.error('Get reservations by date error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Get reservation by ID - RESTAURANT ISOLATED
  router.get('/:id', auth, async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }

      if (!req.restaurantId) {
        return res.status(400).json({ error: 'Restaurant context required' });
      }

      const { id } = req.params;

      const result = await pool.query(
        `SELECT r.*, 
                COALESCE(u.name, r.customer_name) as customer_name, 
                COALESCE(u.email, r.customer_email) as customer_email 
         FROM reservations r 
         LEFT JOIN users u ON r.created_by = u.id 
         WHERE r.id = $1 AND r.restaurant_id = $2`,
        [id, req.restaurantId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Reservation not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Get reservation error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Create new reservation - RESTAURANT ISOLATED
  router.post('/', [
    body('customer_name').notEmpty().withMessage('Customer name is required'),
    body('customer_email').isEmail().withMessage('Valid email is required'),
    body('customer_phone').optional().isLength({ min: 10 }).withMessage('Phone must be at least 10 characters'),
    body('reservation_date').isISO8601().withMessage('Valid reservation date is required'),
    body('reservation_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time format (HH:MM) is required'),
    body('party_size').isInt({ min: 1 }).withMessage('Party size must be at least 1'),
    body('special_requests').optional().isLength({ max: 500 }).withMessage('Special requests must be less than 500 characters'),
    body('table_number').optional().isLength({ max: 20 }).withMessage('Table number must be less than 20 characters'),
    body('notes').optional().isLength({ max: 500 }).withMessage('Notes must be less than 500 characters')
  ], auth, async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (!req.restaurantId) {
        return res.status(400).json({ error: 'Restaurant context required' });
      }

      const {
        customer_name,
        customer_email,
        customer_phone,
        reservation_date,
        reservation_time,
        party_size,
        special_requests,
        table_number,
        notes
      } = req.body;

      // Check if reservation date is not in the past (allow 1 hour buffer)
      const reservationDateTime = new Date(`${reservation_date}T${reservation_time}`);
      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + (60 * 60 * 1000)); // Add 1 hour buffer
      
      if (reservationDateTime <= oneHourFromNow) {
        return res.status(400).json({ error: 'Reservation must be at least 1 hour in the future' });
      }

      const result = await pool.query(
        `INSERT INTO reservations (
          restaurant_id, customer_name, customer_email, customer_phone,
          reservation_date, reservation_time, party_size, special_requests,
          table_number, created_by, notes, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending')
        RETURNING *`,
        [
          req.restaurantId,
          customer_name,
          customer_email,
          customer_phone,
          reservation_date,
          reservation_time,
          party_size,
          special_requests,
          table_number,
          req.user.userId,
          notes
        ]
      );

      // Emit real-time update to admin panel
      if (io) {
        io.to(`restaurant_${req.restaurantId}`).emit('reservation_created', result.rows[0]);
      }

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Create reservation error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Update reservation status - RESTAURANT ISOLATED
  router.patch('/:id/status', [
    body('status').isIn(['pending', 'confirmed', 'cancelled', 'completed', 'started']).withMessage('Invalid status')
  ], auth, async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }

      if (!req.restaurantId) {
        return res.status(400).json({ error: 'Restaurant context required' });
      }

      const { id } = req.params;
      const { status } = req.body;

      const result = await pool.query(
        `UPDATE reservations 
         SET status = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2 AND restaurant_id = $3
         RETURNING *`,
        [status, id, req.restaurantId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Reservation not found' });
      }

      // Emit real-time update to admin panel
      if (io) {
        io.to(`restaurant_${req.restaurantId}`).emit('reservation_updated', result.rows[0]);
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Update reservation status error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Update reservation details - RESTAURANT ISOLATED
  router.put('/:id', [
    body('customer_name').optional().notEmpty().withMessage('Customer name cannot be empty'),
    body('customer_email').optional().isEmail().withMessage('Valid email is required'),
    body('customer_phone').optional().isLength({ min: 10 }).withMessage('Phone must be at least 10 characters'),
    body('reservation_date').optional().isISO8601().withMessage('Valid reservation date is required'),
    body('reservation_time').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time format (HH:MM) is required'),
    body('party_size').optional().isInt({ min: 1 }).withMessage('Party size must be at least 1'),
    body('special_requests').optional().isLength({ max: 500 }).withMessage('Special requests must be less than 500 characters'),
    body('table_number').optional().isLength({ max: 20 }).withMessage('Table number must be less than 20 characters'),
    body('notes').optional().isLength({ max: 500 }).withMessage('Notes must be less than 500 characters')
  ], auth, async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }

      if (!req.restaurantId) {
        return res.status(400).json({ error: 'Restaurant context required' });
      }

      const { id } = req.params;
      const updateFields = req.body;

      // Build dynamic update query
      const setClause = Object.keys(updateFields)
        .map((key, index) => `${key} = $${index + 2}`)
        .join(', ');

      const values = [id, req.restaurantId, ...Object.values(updateFields)];

      const result = await pool.query(
        `UPDATE reservations 
         SET ${setClause}, updated_at = CURRENT_TIMESTAMP
         WHERE id = $1 AND restaurant_id = $2
         RETURNING *`,
        values
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Reservation not found' });
      }

      // Emit real-time update to admin panel
      if (io) {
        io.to(`restaurant_${req.restaurantId}`).emit('reservation_updated', result.rows[0]);
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Update reservation error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Delete reservation - RESTAURANT ISOLATED
  router.delete('/:id', auth, async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }

      if (!req.restaurantId) {
        return res.status(400).json({ error: 'Restaurant context required' });
      }

      const { id } = req.params;

      const result = await pool.query(
        'DELETE FROM reservations WHERE id = $1 AND restaurant_id = $2 RETURNING *',
        [id, req.restaurantId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Reservation not found' });
      }

      // Emit real-time update to admin panel
      if (io) {
        io.to(`restaurant_${req.restaurantId}`).emit('reservation_deleted', { id: parseInt(id) });
      }

      res.json({ message: 'Reservation deleted successfully' });
    } catch (error) {
      console.error('Delete reservation error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Get reservation statistics - RESTAURANT ISOLATED
  router.get('/stats/overview', auth, async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }

      if (!req.restaurantId) {
        return res.status(400).json({ error: 'Restaurant context required' });
      }

      const result = await pool.query(
        `SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
          COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed,
          COUNT(CASE WHEN status = 'started' THEN 1 END) as started,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
          COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled
         FROM reservations 
         WHERE restaurant_id = $1`,
        [req.restaurantId]
      );

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Get reservation stats error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // PUBLIC RESERVATION ENDPOINTS (No authentication required)
  
  // Create reservation (public) - RESTAURANT ISOLATED
  router.post('/public', [
    body('customer_name').notEmpty().withMessage('Customer name is required'),
    body('customer_email').optional().isEmail().withMessage('Valid email is required'),
    body('customer_phone').isLength({ min: 10 }).withMessage('Phone must be at least 10 characters'),
    body('reservation_date').isISO8601().withMessage('Valid reservation date is required'),
    body('reservation_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time format (HH:MM) is required'),
    body('party_size').isInt({ min: 1 }).withMessage('Party size must be at least 1'),
    body('special_requests').optional().isLength({ max: 500 }).withMessage('Special requests must be less than 500 characters'),
    body('table_number').optional().isLength({ max: 20 }).withMessage('Table number must be less than 20 characters')
  ], async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (!req.restaurantId) {
        return res.status(400).json({ error: 'Restaurant context required' });
      }

      const {
        customer_name,
        customer_email,
        customer_phone,
        reservation_date,
        reservation_time,
        party_size,
        special_requests,
        table_number
      } = req.body;

      // Validate reservation date is in the future (allow 1 hour buffer)
      const reservationDateTime = new Date(`${reservation_date}T${reservation_time}`);
      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + (60 * 60 * 1000)); // Add 1 hour buffer
      
      if (reservationDateTime <= oneHourFromNow) {
        return res.status(400).json({ error: 'Reservation must be at least 1 hour in the future' });
      }

      // Use default email if not provided
      const email = customer_email || 'no-email@example.com';

      const result = await pool.query(
        `INSERT INTO reservations (
          restaurant_id, customer_name, customer_email, customer_phone,
          reservation_date, reservation_time, party_size, special_requests,
          table_number, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending')
        RETURNING *`,
        [
          req.restaurantId,
          customer_name,
          email,
          customer_phone,
          reservation_date,
          reservation_time,
          party_size,
          special_requests,
          table_number
        ]
      );

      // Emit real-time update to admin panel
      if (io) {
        io.to(`restaurant_${req.restaurantId}`).emit('reservation_created', result.rows[0]);
      }

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Create public reservation error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Get reservation by ID (public) - RESTAURANT ISOLATED
  router.get('/public/:id', async (req, res) => {
    try {
      if (!req.restaurantId) {
        return res.status(400).json({ error: 'Restaurant context required' });
      }

      const { id } = req.params;

      const result = await pool.query(
        `SELECT * FROM reservations 
         WHERE id = $1 AND restaurant_id = $2`,
        [id, req.restaurantId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Reservation not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Get public reservation error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Update reservation (public) - RESTAURANT ISOLATED
  router.put('/public/:id', [
    body('customer_name').optional().notEmpty().withMessage('Customer name cannot be empty'),
    body('customer_email').optional().isEmail().withMessage('Valid email is required'),
    body('customer_phone').optional().isLength({ min: 10 }).withMessage('Phone must be at least 10 characters'),
    body('reservation_date').optional().isISO8601().withMessage('Valid reservation date is required'),
    body('reservation_time').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time format (HH:MM) is required'),
    body('party_size').optional().isInt({ min: 1 }).withMessage('Party size must be at least 1'),
    body('special_requests').optional().isLength({ max: 500 }).withMessage('Special requests must be less than 500 characters'),
    body('table_number').optional().isLength({ max: 20 }).withMessage('Table number must be less than 20 characters')
  ], async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (!req.restaurantId) {
        return res.status(400).json({ error: 'Restaurant context required' });
      }

      const { id } = req.params;
      const updateFields = req.body;

      // Build dynamic update query
      const setClause = Object.keys(updateFields)
        .map((key, index) => `${key} = $${index + 3}`)
        .join(', ');

      const values = [id, req.restaurantId, ...Object.values(updateFields)];

      const result = await pool.query(
        `UPDATE reservations 
         SET ${setClause}, updated_at = CURRENT_TIMESTAMP
         WHERE id = $1 AND restaurant_id = $2
         RETURNING *`,
        values
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Reservation not found' });
      }

      // Emit real-time update to admin panel
      if (io) {
        io.to(`restaurant_${req.restaurantId}`).emit('reservation_updated', result.rows[0]);
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Update public reservation error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Update reservation status (admin only) - RESTAURANT ISOLATED
  router.patch('/:id/status', auth, async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }

      if (!req.restaurantId) {
        return res.status(400).json({ error: 'Restaurant context required' });
      }

      const { id } = req.params;
      const { status } = req.body;

      // Validate status
      const validStatuses = ['pending', 'confirmed', 'started', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') });
      }

      const result = await pool.query(
        `UPDATE reservations 
         SET status = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2 AND restaurant_id = $3
         RETURNING *`,
        [status, id, req.restaurantId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Reservation not found' });
      }

      // Emit real-time update to admin panel
      if (io) {
        io.to(`restaurant_${req.restaurantId}`).emit('reservation_updated', result.rows[0]);
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Update reservation status error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Cancel reservation (public) - RESTAURANT ISOLATED
  router.patch('/public/:id/cancel', async (req, res) => {
    try {
      if (!req.restaurantId) {
        return res.status(400).json({ error: 'Restaurant context required' });
      }

      const { id } = req.params;

      const result = await pool.query(
        `UPDATE reservations 
         SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
         WHERE id = $1 AND restaurant_id = $2
         RETURNING *`,
        [id, req.restaurantId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Reservation not found' });
      }

      // Emit real-time update to admin panel
      if (io) {
        io.to(`restaurant_${req.restaurantId}`).emit('reservation_updated', result.rows[0]);
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Cancel public reservation error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  return router;
};
