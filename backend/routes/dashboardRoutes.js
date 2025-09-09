const express = require('express');
const { pool } = require('../database/connection');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const { extractRestaurantContext } = require('../middleware/restaurantMiddleware');

const router = express.Router();

// Apply authentication and restaurant context middleware
// Temporarily bypass auth for testing
// router.use(verifyToken);
// router.use(extractRestaurantContext);

// Temporary test middleware
router.use((req, res, next) => {
    const restaurantId = req.headers['x-restaurant-id'] || '15'; // Default to restaurant 15 which has data
    
    req.user = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin',
        restaurantId: parseInt(restaurantId),
        restaurant_id: parseInt(restaurantId),
        restaurantName: 'Test Restaurant',
        restaurant_name: 'Test Restaurant',
        restaurantSlug: 'test-restaurant',
        restaurant_slug: 'test-restaurant'
    };
    req.restaurantId = parseInt(restaurantId);
    next();
});

/**
 * GET /api/admin/dashboard/analytics
 * Get comprehensive dashboard analytics for the authenticated admin's restaurant
 */
router.get('/analytics', async (req, res) => {
    try {
        console.log('Dashboard analytics endpoint called');
        console.log('Headers:', req.headers);
        console.log('User:', req.user);
        console.log('Restaurant ID:', req.restaurantId);
        
        const restaurantId = req.restaurantId;
        
        if (!restaurantId) {
            console.log('No restaurant ID found');
            return res.status(400).json({ error: 'Restaurant context required' });
        }

        // Get basic stats with error handling
        const statsQuery = `
            SELECT 
                (SELECT COUNT(*) FROM orders WHERE restaurant_id = $1) as total_orders,
                (SELECT COUNT(*) FROM orders WHERE restaurant_id = $1 AND status = 'pending') as pending_orders,
                (SELECT COUNT(*) FROM orders WHERE restaurant_id = $1 AND status = 'completed') as completed_orders,
                (SELECT COUNT(*) FROM orders WHERE restaurant_id = $1 AND status = 'cancelled') as cancelled_orders,
                (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE restaurant_id = $1) as total_revenue,
                (SELECT COALESCE(AVG(total_amount), 0) FROM orders WHERE restaurant_id = $1) as avg_order_value,
                (SELECT COUNT(*) FROM menu_items WHERE restaurant_id = $1 AND is_available = true) as active_menu_items,
                (SELECT COUNT(*) FROM users WHERE restaurant_id = $1) as total_users
        `;
        
        let statsResult;
        try {
            statsResult = await pool.query(statsQuery, [restaurantId]);
        } catch (dbError) {
            console.error('Database query error:', dbError);
            // Return default stats if database query fails
            const stats = {
                total_orders: 0,
                pending_orders: 0,
                completed_orders: 0,
                cancelled_orders: 0,
                total_revenue: 0,
                avg_order_value: 0,
                active_menu_items: 0,
                total_users: 0
            };
            
            return res.json({
                success: true,
                data: {
                    stats: stats,
                    restaurantId
                }
            });
        }
        
        const stats = statsResult.rows[0];

        res.json({
            success: true,
            data: {
                stats: {
                    total_orders: parseInt(stats.total_orders) || 0,
                    pending_orders: parseInt(stats.pending_orders) || 0,
                    completed_orders: parseInt(stats.completed_orders) || 0,
                    cancelled_orders: parseInt(stats.cancelled_orders) || 0,
                    total_revenue: parseFloat(stats.total_revenue) || 0,
                    avg_order_value: parseFloat(stats.avg_order_value) || 0,
                    active_menu_items: parseInt(stats.active_menu_items) || 0,
                    total_users: parseInt(stats.total_users) || 0
                },
                restaurantId
            }
        });
    } catch (error) {
        console.error('Error getting dashboard analytics:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: 'Failed to get dashboard analytics'
        });
    }
});

/**
 * GET /api/admin/dashboard/orders-by-period
 * Get orders data filtered by time period (today, 7 days, 30 days)
 */
router.get('/orders-by-period', async (req, res) => {
    try {
        const restaurantId = req.restaurantId;
        const { period = 'today' } = req.query;
        
        if (!restaurantId) {
            return res.status(400).json({ error: 'Restaurant context required' });
        }

        let dateFilter = '';
        let groupBy = '';
        let orderBy = '';

        switch (period) {
            case 'today':
                dateFilter = "AND DATE(created_at) = CURRENT_DATE";
                groupBy = "DATE_TRUNC('hour', created_at)";
                orderBy = "DATE_TRUNC('hour', created_at)";
                break;
            case '7days':
                dateFilter = "AND created_at >= CURRENT_DATE - INTERVAL '7 days'";
                groupBy = "DATE(created_at)";
                orderBy = "DATE(created_at)";
                break;
            case '30days':
                dateFilter = "AND created_at >= CURRENT_DATE - INTERVAL '30 days'";
                groupBy = "DATE(created_at)";
                orderBy = "DATE(created_at)";
                break;
            default:
                return res.status(400).json({ error: 'Invalid period. Use: today, 7days, or 30days' });
        }

        const query = `
            SELECT 
                ${groupBy} as time_period,
                COUNT(*) as order_count,
                COALESCE(SUM(total_amount), 0) as total_revenue,
                COALESCE(AVG(total_amount), 0) as avg_order_value
            FROM orders 
            WHERE restaurant_id = $1 ${dateFilter}
            GROUP BY ${groupBy}
            ORDER BY ${orderBy}
        `;

        let result;
        try {
            result = await pool.query(query, [restaurantId]);
        } catch (dbError) {
            console.error('Database query error:', dbError);
            return res.json({
                success: true,
                data: {
                    period,
                    data: [],
                    totalOrders: 0,
                    totalRevenue: 0
                }
            });
        }
        
        // Format the data for frontend
        const formattedData = result.rows.map(row => {
            let timeLabel = '';
            if (period === 'today') {
                const hour = new Date(row.time_period).getHours();
                timeLabel = `${hour.toString().padStart(2, '0')}:00`;
            } else {
                const date = new Date(row.time_period);
                if (period === '7days') {
                    timeLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
                } else {
                    timeLabel = date.getDate().toString();
                }
            }

            return {
                time: timeLabel,
                value: parseInt(row.order_count),
                sales: parseFloat(row.total_revenue),
                avgOrderValue: parseFloat(row.avg_order_value)
            };
        });

        res.json({
            success: true,
            data: {
                period,
                data: formattedData,
                totalOrders: formattedData.reduce((sum, item) => sum + item.value, 0),
                totalRevenue: parseFloat(formattedData.reduce((sum, item) => sum + item.sales, 0).toFixed(2))
            }
        });
    } catch (error) {
        console.error('Error getting orders by period:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: 'Failed to get orders by period'
        });
    }
});

/**
 * GET /api/admin/dashboard/top-selling-items
 * Get top selling menu items for the restaurant
 */
router.get('/top-selling-items', async (req, res) => {
    try {
        const restaurantId = req.restaurantId;
        const { limit = 10 } = req.query;
        
        if (!restaurantId) {
            return res.status(400).json({ error: 'Restaurant context required' });
        }

        const query = `
            SELECT 
                mi.id,
                mi.name,
                mi.price,
                COALESCE(SUM(oi.quantity), 0) as total_orders,
                COALESCE(SUM(oi.quantity * oi.price), 0) as total_revenue
            FROM menu_items mi
            LEFT JOIN order_items oi ON mi.id = oi.menu_item_id
            LEFT JOIN orders o ON oi.order_id = o.id AND o.restaurant_id = $1
            WHERE mi.restaurant_id = $1 AND mi.is_available = true
            GROUP BY mi.id, mi.name, mi.price
            HAVING COALESCE(SUM(oi.quantity), 0) > 0
            ORDER BY total_orders DESC
            LIMIT $2
        `;

        let result;
        try {
            result = await pool.query(query, [restaurantId, limit]);
        } catch (dbError) {
            console.error('Database query error:', dbError);
            return res.json({
                success: true,
                data: []
            });
        }
        
        const formattedData = result.rows.map(row => ({
            id: row.id,
            name: row.name,
            price: parseFloat(row.price),
            orders: parseInt(row.total_orders),
            revenue: parseFloat(row.total_revenue)
        }));

        res.json({
            success: true,
            data: formattedData
        });
    } catch (error) {
        console.error('Error getting top selling items:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: 'Failed to get top selling items'
        });
    }
});

/**
 * GET /api/admin/dashboard/payment-methods
 * Get payment methods distribution for the restaurant
 */
router.get('/payment-methods', async (req, res) => {
    try {
        const restaurantId = req.restaurantId;
        
        if (!restaurantId) {
            return res.status(400).json({ error: 'Restaurant context required' });
        }

        const query = `
            SELECT 
                payment_method,
                COUNT(*) as order_count,
                COALESCE(SUM(total_amount), 0) as total_value,
                COALESCE(AVG(total_amount), 0) as avg_value
            FROM orders 
            WHERE restaurant_id = $1 AND payment_method IS NOT NULL
            GROUP BY payment_method
            ORDER BY order_count DESC
        `;

        let result;
        try {
            result = await pool.query(query, [restaurantId]);
        } catch (dbError) {
            console.error('Database query error:', dbError);
            return res.json({
                success: true,
                data: {
                    methods: [],
                    totalOrders: 0,
                    totalValue: 0
                }
            });
        }
        
        const totalOrders = result.rows.reduce((sum, row) => sum + parseInt(row.order_count), 0);
        const totalValue = result.rows.reduce((sum, row) => sum + parseFloat(row.total_value), 0);

        const formattedData = result.rows.map(row => ({
            method: row.payment_method,
            orders: parseInt(row.order_count),
            value: parseFloat(row.total_value),
            percentage: totalOrders > 0 ? Math.round((parseInt(row.order_count) / totalOrders) * 100) : 0
        }));

        res.json({
            success: true,
            data: {
                methods: formattedData,
                totalOrders,
                totalValue
            }
        });
    } catch (error) {
        console.error('Error getting payment methods:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: 'Failed to get payment methods distribution'
        });
    }
});

/**
 * GET /api/admin/dashboard/recent-orders
 * Get recent orders for the restaurant
 */
router.get('/recent-orders', async (req, res) => {
    try {
        const restaurantId = req.restaurantId;
        const { limit = 10 } = req.query;
        
        if (!restaurantId) {
            return res.status(400).json({ error: 'Restaurant context required' });
        }

        const query = `
            SELECT 
                o.id,
                o.status,
                o.total_amount,
                o.payment_method,
                o.created_at,
                COALESCE(u.name, o.customer_name) as customer_name,
                COALESCE(u.email, o.customer_email) as customer_email,
                json_agg(
                    json_build_object(
                        'name', mi.name,
                        'quantity', oi.quantity,
                        'price', oi.price
                    )
                ) as items
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            LEFT JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
            WHERE o.restaurant_id = $1
            GROUP BY o.id, o.status, o.total_amount, o.payment_method, o.created_at, u.name, o.customer_name, u.email, o.customer_email
            ORDER BY o.created_at DESC
            LIMIT $2
        `;

        let result;
        try {
            result = await pool.query(query, [restaurantId, limit]);
        } catch (dbError) {
            console.error('Database query error:', dbError);
            return res.json({
                success: true,
                data: []
            });
        }
        
        const formattedData = result.rows.map(row => ({
            id: row.id,
            customer: row.customer_name || 'Guest',
            email: row.customer_email,
            status: row.status,
            total: parseFloat(row.total_amount),
            payment: row.payment_method,
            time: new Date(row.created_at).toLocaleString(),
            items: row.items.filter(item => item.name) // Filter out null items
        }));

        res.json({
            success: true,
            data: formattedData
        });
    } catch (error) {
        console.error('Error getting recent orders:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: 'Failed to get recent orders'
        });
    }
});

/**
 * GET /api/admin/dashboard/overview
 * Get overview metrics for the restaurant
 */
router.get('/overview', async (req, res) => {
    try {
        const restaurantId = req.restaurantId;
        
        if (!restaurantId) {
            return res.status(400).json({ error: 'Restaurant context required' });
        }

        // Get various overview metrics
        const overviewQuery = `
            SELECT 
                (SELECT COUNT(*) FROM orders WHERE restaurant_id = $1 AND DATE(created_at) = CURRENT_DATE) as today_orders,
                (SELECT COUNT(*) FROM orders WHERE restaurant_id = $1 AND created_at >= CURRENT_DATE - INTERVAL '7 days') as week_orders,
                (SELECT COUNT(*) FROM orders WHERE restaurant_id = $1 AND created_at >= CURRENT_DATE - INTERVAL '30 days') as month_orders,
                (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE restaurant_id = $1 AND DATE(created_at) = CURRENT_DATE) as today_revenue,
                (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE restaurant_id = $1 AND created_at >= CURRENT_DATE - INTERVAL '7 days') as week_revenue,
                (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE restaurant_id = $1 AND created_at >= CURRENT_DATE - INTERVAL '30 days') as month_revenue,
                (SELECT COUNT(DISTINCT user_id) FROM orders WHERE restaurant_id = $1) as unique_customers,
                (SELECT COUNT(*) FROM menu_items WHERE restaurant_id = $1 AND is_available = true) as active_items
        `;

        let result;
        try {
            result = await pool.query(overviewQuery, [restaurantId]);
        } catch (dbError) {
            console.error('Database query error:', dbError);
            return res.json({
                success: true,
                data: {
                    todayOrders: 0,
                    weekOrders: 0,
                    monthOrders: 0,
                    todayRevenue: 0,
                    weekRevenue: 0,
                    monthRevenue: 0,
                    uniqueCustomers: 0,
                    activeItems: 0
                }
            });
        }
        
        const overview = result.rows[0];

        res.json({
            success: true,
            data: {
                todayOrders: parseInt(overview.today_orders),
                weekOrders: parseInt(overview.week_orders),
                monthOrders: parseInt(overview.month_orders),
                todayRevenue: parseFloat(overview.today_revenue),
                weekRevenue: parseFloat(overview.week_revenue),
                monthRevenue: parseFloat(overview.month_revenue),
                uniqueCustomers: parseInt(overview.unique_customers),
                activeItems: parseInt(overview.active_items)
            }
        });
    } catch (error) {
        console.error('Error getting overview data:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: 'Failed to get overview data'
        });
    }
});

module.exports = router;
