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

// Get all orders (admin only) - RESTAURANT ISOLATED
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!req.restaurantId) {
      return res.status(400).json({ error: 'Restaurant context required' });
    }

    const result = await pool.query(
      `SELECT o.*, 
              COALESCE(u.name, o.customer_name) as customer_name, 
              COALESCE(u.email, o.customer_email) as customer_email 
       FROM orders o 
       LEFT JOIN users u ON o.user_id = u.id 
       WHERE o.restaurant_id = $1
       ORDER BY o.created_at DESC`,
      [req.restaurantId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's orders - RESTAURANT ISOLATED
router.get('/my-orders', auth, async (req, res) => {
  try {
    if (!req.restaurantId) {
      return res.status(400).json({ error: 'Restaurant context required' });
    }

    const result = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 AND restaurant_id = $2 ORDER BY created_at DESC',
      [req.user.userId, req.restaurantId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get order by ID - RESTAURANT ISOLATED
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.restaurantId) {
      return res.status(400).json({ error: 'Restaurant context required' });
    }

    const result = await pool.query(
      `SELECT o.*, 
              COALESCE(u.name, o.customer_name) as customer_name, 
              COALESCE(u.email, o.customer_email) as customer_email,
              oi.menu_item_id, oi.quantity, oi.price, oi.notes,
              mi.name as item_name, mi.description, mi.image_url
       FROM orders o 
       LEFT JOIN users u ON o.user_id = u.id
       JOIN order_items oi ON o.id = oi.order_id
       JOIN menu_items mi ON oi.menu_item_id = mi.id
       WHERE o.id = $1 AND o.restaurant_id = $2`,
      [id, req.restaurantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Format order data
    const order = {
      id: result.rows[0].id,
      status: result.rows[0].status,
      total_amount: result.rows[0].total_amount,
      customer_name: result.rows[0].customer_name,
      customer_email: result.rows[0].customer_email,
      customer_phone: result.rows[0].customer_phone,
      delivery_address: result.rows[0].delivery_address,
      special_instructions: result.rows[0].special_instructions,
      payment_method: result.rows[0].payment_method,
      tip_amount: result.rows[0].tip_amount,
      created_at: result.rows[0].created_at,
      items: result.rows.map(row => ({
        menu_item_id: row.menu_item_id,
        name: row.item_name,
        description: row.description,
        image_url: row.image_url,
        quantity: row.quantity,
        price: row.price,
        notes: row.notes
      }))
    };

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Place new order
router.post('/', auth, [
  body('items').isArray({ min: 1 }),
  body('items.*.menu_item_id').isInt(),
  body('items.*.quantity').isInt({ min: 1 }),
  body('items.*.notes').optional().trim(),
  body('delivery_address').optional().trim(),
  body('special_instructions').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { items, delivery_address, special_instructions } = req.body;

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Calculate total and validate items
      let total_amount = 0;
      for (const item of items) {
        const menuItem = await client.query(
          'SELECT price, is_active FROM menu_items WHERE id = $1',
          [item.menu_item_id]
        );

        if (menuItem.rows.length === 0) {
          throw new Error(`Menu item ${item.menu_item_id} not found`);
        }

        if (!menuItem.rows[0].is_active) {
          throw new Error(`Menu item ${item.menu_item_id} is not available`);
        }

        total_amount += menuItem.rows[0].price * item.quantity;
      }

      // Create order
      const orderResult = await client.query(
        `INSERT INTO orders (user_id, total_amount, status, delivery_address, special_instructions, restaurant_id) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [req.user.userId, total_amount, 'pending', delivery_address, special_instructions, req.restaurantId]
      );

      const orderId = orderResult.rows[0].id;

      // Create order items
      for (const item of items) {
        const menuItem = await client.query(
          'SELECT price FROM menu_items WHERE id = $1',
          [item.menu_item_id]
        );

        await client.query(
          `INSERT INTO order_items (order_id, menu_item_id, quantity, price, notes, restaurant_id) 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [orderId, item.menu_item_id, item.quantity, menuItem.rows[0].price, item.notes, req.restaurantId]
        );
      }

      await client.query('COMMIT');

      // Notify admin via socket
      io.emit('new-order', { orderId, userId: req.user.userId });

      res.status(201).json({
        message: 'Order placed successfully',
        order_id: orderId,
        total_amount
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Place order error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Place guest order (no authentication required)
router.post('/guest', async (req, res) => {
  try {
    console.log('📥 Guest order request received:', req.body);
    const { items, special_instructions, session_id, payment_method, tip_amount } = req.body;

    // Basic validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items array is required and must not be empty' });
    }

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Calculate total and validate items
      let total_amount = 0;
      for (const item of items) {
        if (!item.menu_item_id || !item.quantity) {
          throw new Error('Each item must have menu_item_id and quantity');
        }

        const menuItem = await client.query(
          'SELECT price, is_active FROM menu_items WHERE id = $1',
          [item.menu_item_id]
        );

        if (menuItem.rows.length === 0) {
          throw new Error(`Menu item ${item.menu_item_id} not found`);
        }

        if (!menuItem.rows[0].is_active) {
          throw new Error(`Menu item ${item.menu_item_id} is not available`);
        }

        total_amount += menuItem.rows[0].price * item.quantity;
      }

      // Add tip amount to total
      const tipAmount = tip_amount || 0;
      const finalTotal = total_amount + tipAmount;

      // Create order without user_id (guest order) - Dine-in restaurant
      const orderResult = await client.query(
        `INSERT INTO orders (total_amount, status, delivery_address, special_instructions, customer_name, customer_email, customer_phone, session_id, restaurant_id, payment_method, tip_amount) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
        [
          finalTotal, 
          'pending', 
          'Dine-in', 
          special_instructions || '',
          'Guest',
          'guest@restaurant.com',
          '',
          session_id || null,
          req.restaurantId,
          payment_method || 'cash',
          tipAmount
        ]
      );

      const orderId = orderResult.rows[0].id;

      // Create order items
      for (const item of items) {
        const menuItem = await client.query(
          'SELECT price FROM menu_items WHERE id = $1',
          [item.menu_item_id]
        );

        await client.query(
          `INSERT INTO order_items (order_id, menu_item_id, quantity, price, notes, restaurant_id) 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [orderId, item.menu_item_id, item.quantity, menuItem.rows[0].price, item.notes || '', req.restaurantId]
        );
      }

      await client.query('COMMIT');
      console.log('✅ Order committed to database with ID:', orderId);

      // Notify admin via socket if available
      console.log('Socket.io available:', !!io);
      if (io) {
        console.log('Emitting new-order event for order:', orderId);
        io.emit('new-order', { orderId, isGuest: true });
        console.log('Event emitted successfully');
      } else {
        console.log('Socket.io not available, cannot emit event');
      }

      console.log('📤 Sending success response to client');
      res.status(201).json({
        message: 'Order placed successfully',
        order_id: orderId,
        total_amount
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Place guest order error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Update order status (admin only)
router.patch('/:id/status', auth, [
  body('status').isIn(['pending', 'accept', 'accepted', 'preparing', 'ready', 'delivered', 'cancelled'])
], async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    let { status } = req.body;

    // Normalize status values for backward compatibility
    if (status === 'accept') {
      status = 'accepted';
    }

    const result = await pool.query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 AND restaurant_id = $3 RETURNING *',
      [status, id, req.restaurantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Notify customer via socket
    const order = await pool.query(
      'SELECT user_id, customer_name, customer_email FROM orders WHERE id = $1',
      [id]
    );

    if (order.rows.length > 0) {
      const orderData = {
        orderId: parseInt(id),
        status,
        timestamp: new Date().toISOString()
      };

      // Emit to the specific order room (both guest and user orders)
      io.to(`order-${id}`).emit('order-status-updated', orderData);
      console.log(`Order ${id} status updated to ${status}, emitted to order room`);
      
      // Also emit to all clients for guest orders (since they don't have specific user rooms)
      if (!order.rows[0].user_id) {
        io.emit('guest-order-status-updated', orderData);
        console.log(`Guest order ${id} status updated to ${status}, also emitted to all clients`);
      }
    }

    res.json({ message: 'Order status updated successfully', order: result.rows[0] });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get active orders (non-delivered, non-cancelled orders) - RESTAURANT ISOLATED - PUBLIC ACCESS
router.get('/active', async (req, res) => {
  try {
    console.log('🔍 Active orders endpoint called');
    console.log('  Restaurant ID:', req.restaurantId);
    console.log('  Headers:', req.headers);
    
    if (!req.restaurantId) {
      return res.status(400).json({ error: 'Restaurant context required' });
    }

    const result = await pool.query(
      `SELECT o.*, 
              json_agg(
                json_build_object(
                  'id', oi.id,
                  'menu_item_id', oi.menu_item_id,
                  'quantity', oi.quantity,
                  'price', oi.price,
                  'notes', oi.notes
                )
              ) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.status NOT IN ('delivered', 'cancelled') AND o.restaurant_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [req.restaurantId]
    );

    console.log('  Orders found:', result.rows.length);
    res.json({ orders: result.rows });
  } catch (error) {
    console.error('Get active orders error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get orders by session ID (for guest orders) - RESTAURANT ISOLATED
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!req.restaurantId) {
      return res.status(400).json({ error: 'Restaurant context required' });
    }
    
    const result = await pool.query(
      `SELECT o.*, 
              json_agg(
                json_build_object(
                  'id', oi.id,
                  'menu_item_id', oi.menu_item_id,
                  'quantity', oi.quantity,
                  'price', oi.price,
                  'notes', oi.notes
                )
              ) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.session_id = $1 AND o.status NOT IN ('delivered', 'cancelled') AND o.restaurant_id = $2
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [sessionId, req.restaurantId]
    );

    res.json({ orders: result.rows });
  } catch (error) {
    console.error('Get orders by session error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

  return router;
};
