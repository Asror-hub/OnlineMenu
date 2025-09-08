const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const auth = require('../middleware/auth');

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'menudb',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

// Get all feedbacks for a restaurant
router.get('/', auth, async (req, res) => {
  try {
    const restaurantId = req.headers['x-restaurant-id'];
    
    const query = `
      SELECT 
        f.*,
        r.name as restaurant_name
      FROM feedbacks f
      LEFT JOIN restaurants r ON f.restaurant_id = r.id
      WHERE f.restaurant_id = $1
      ORDER BY f.created_at DESC
    `;
    
    const result = await pool.query(query, [restaurantId]);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feedbacks',
      error: error.message
    });
  }
});

// Get feedbacks by date range
router.get('/by-date', auth, async (req, res) => {
  try {
    const restaurantId = req.headers['x-restaurant-id'];
    const { startDate, endDate } = req.query;
    
    let query = `
      SELECT 
        f.*,
        r.name as restaurant_name
      FROM feedbacks f
      LEFT JOIN restaurants r ON f.restaurant_id = r.id
      WHERE f.restaurant_id = $1
    `;
    
    const params = [restaurantId];
    
    if (startDate && endDate) {
      query += ` AND f.created_at >= $2 AND f.created_at <= $3`;
      params.push(startDate, endDate);
    }
    
    query += ` ORDER BY f.created_at DESC`;
    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching feedbacks by date:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feedbacks by date',
      error: error.message
    });
  }
});

// Get feedback statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const restaurantId = req.headers['x-restaurant-id'];
    
    const statsQuery = `
      SELECT 
        COUNT(*) as total_feedbacks,
        AVG(food_rating) as avg_food_rating,
        AVG(service_rating) as avg_service_rating,
        AVG(atmosphere_rating) as avg_atmosphere_rating,
        AVG(overall_rating) as avg_overall_rating,
        COUNT(CASE WHEN created_at >= CURRENT_DATE THEN 1 END) as today_feedbacks,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as week_feedbacks,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as month_feedbacks
      FROM feedbacks 
      WHERE restaurant_id = $1
    `;
    
    const result = await pool.query(statsQuery, [restaurantId]);
    const stats = result.rows[0];
    
    res.json({
      success: true,
      data: {
        totalFeedbacks: parseInt(stats.total_feedbacks) || 0,
        averageFoodRating: parseFloat(stats.avg_food_rating) || 0,
        averageServiceRating: parseFloat(stats.avg_service_rating) || 0,
        averageAtmosphereRating: parseFloat(stats.avg_atmosphere_rating) || 0,
        averageOverallRating: parseFloat(stats.avg_overall_rating) || 0,
        todayFeedbacks: parseInt(stats.today_feedbacks) || 0,
        weekFeedbacks: parseInt(stats.week_feedbacks) || 0,
        monthFeedbacks: parseInt(stats.month_feedbacks) || 0
      }
    });
  } catch (error) {
    console.error('Error fetching feedback stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feedback statistics',
      error: error.message
    });
  }
});

// Get single feedback by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const restaurantId = req.headers['x-restaurant-id'];
    const { id } = req.params;
    
    const query = `
      SELECT 
        f.*,
        r.name as restaurant_name
      FROM feedbacks f
      LEFT JOIN restaurants r ON f.restaurant_id = r.id
      WHERE f.id = $1 AND f.restaurant_id = $2
    `;
    
    const result = await pool.query(query, [id, restaurantId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feedback',
      error: error.message
    });
  }
});

// Create a new feedback (for testing/demo purposes)
router.post('/', auth, async (req, res) => {
  try {
    const restaurantId = req.headers['x-restaurant-id'];
    const {
      customer_name,
      customer_email,
      food_rating,
      service_rating,
      atmosphere_rating,
      feedback_text,
      is_public = true,
      is_verified = false
    } = req.body;
    
    // Calculate overall rating as average of the three ratings
    const rating = Math.round((food_rating + service_rating + atmosphere_rating) / 3);
    
    const query = `
      INSERT INTO feedbacks (
        restaurant_id,
        rating,
        customer_name,
        customer_email,
        food_rating,
        service_rating,
        atmosphere_rating,
        feedback_text,
        is_public,
        is_verified,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
      RETURNING *
    `;
    
    const values = [
      restaurantId,
      rating,
      customer_name,
      customer_email,
      Math.round(food_rating),
      Math.round(service_rating),
      Math.round(atmosphere_rating),
      feedback_text,
      is_public,
      is_verified
    ];
    
    const result = await pool.query(query, values);
    
    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Feedback created successfully'
    });
  } catch (error) {
    console.error('Error creating feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating feedback',
      error: error.message
    });
  }
});

// Respond to a feedback
router.post('/:id/respond', auth, async (req, res) => {
  try {
    const restaurantId = req.headers['x-restaurant-id'];
    const { id } = req.params;
    const { response_text } = req.body;
    
    if (!response_text || response_text.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Response text is required'
      });
    }
    
    const query = `
      UPDATE feedbacks 
      SET 
        response_text = $1,
        response_date = NOW(),
        updated_at = NOW()
      WHERE id = $2 AND restaurant_id = $3
      RETURNING *
    `;
    
    const result = await pool.query(query, [response_text.trim(), id, restaurantId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0],
      message: 'Response added successfully'
    });
  } catch (error) {
    console.error('Error responding to feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error responding to feedback',
      error: error.message
    });
  }
});

// Update feedback verification status
router.patch('/:id/verify', auth, async (req, res) => {
  try {
    const restaurantId = req.headers['x-restaurant-id'];
    const { id } = req.params;
    const { is_verified } = req.body;
    
    const query = `
      UPDATE feedbacks 
      SET 
        is_verified = $1,
        updated_at = NOW()
      WHERE id = $2 AND restaurant_id = $3
      RETURNING *
    `;
    
    const result = await pool.query(query, [is_verified, id, restaurantId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0],
      message: `Feedback ${is_verified ? 'verified' : 'unverified'} successfully`
    });
  } catch (error) {
    console.error('Error updating feedback verification:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating feedback verification',
      error: error.message
    });
  }
});

// Delete a feedback
router.delete('/:id', auth, async (req, res) => {
  try {
    const restaurantId = req.headers['x-restaurant-id'];
    const { id } = req.params;
    
    const query = `
      DELETE FROM feedbacks 
      WHERE id = $1 AND restaurant_id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [id, restaurantId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting feedback',
      error: error.message
    });
  }
});

// PUBLIC FEEDBACK ENDPOINT - No authentication required
// POST /api/feedbacks/public
// Create feedback from customer (public endpoint)
router.post('/public', async (req, res) => {
  try {
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
    if (!order_id || !customer_name || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Order ID, customer name, and rating are required'
      });
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Get restaurant_id and order details from the order
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
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const { restaurant_id, order_customer_name, order_customer_email, order_number, order_items } = orderResult.rows[0];

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
    
    const values = [
      restaurant_id,
      order_id,
      finalCustomerName,
      finalCustomerEmail,
      finalRating,
      food_rating || null,
      service_rating || null,
      atmosphere_rating || null,
      feedback_text || null,
      feedback_type,
      order_number,
      JSON.stringify(order_items), // Convert to JSON string
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

module.exports = router;
