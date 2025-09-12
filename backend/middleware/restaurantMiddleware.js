const { pool } = require('../database/connection');

/**
 * Restaurant Middleware for Multi-Tenancy
 * Detects restaurant from request and validates access
 */

/**
 * Extract restaurant context from request
 * Supports: subdomains, custom domains, and path-based routing
 */
const extractRestaurantContext = async (req, res, next) => {
    try {
        let restaurantId = null;
        let restaurantSlug = null;
        let restaurant = null;

        // Debug logging
        console.log('🔍 Restaurant Context Debug:');
        console.log('  Path:', req.path);
        console.log('  Headers:', req.headers);

        // Method 1: Extract from subdomain (restaurant1.yourapp.com)
        const host = req.get('host') || '';
        const subdomain = host.includes(':') ? host.split(':')[0].split('.')[0] : host.split('.')[0];
        console.log('  Host:', host, 'Subdomain:', subdomain);
        
        // Method 2: Extract from custom domain header (if using reverse proxy)
        const customDomain = req.get('x-custom-domain') || req.get('x-forwarded-host');
        console.log('  Custom Domain:', customDomain);
        
        // Method 3: Extract from path parameter (/restaurant1/...)
        const pathRestaurant = req.params.restaurant || req.query.restaurant;
        console.log('  Path Restaurant:', pathRestaurant);
        
        // Method 4: Extract from custom header
        const headerRestaurant = req.get('x-restaurant-slug') || req.get('X-Restaurant-Slug');
        const headerRestaurantId = req.get('x-restaurant-id') || req.get('X-Restaurant-Id');
        console.log('  Header Restaurant Slug:', headerRestaurant);
        console.log('  Header Restaurant ID:', headerRestaurantId);

        // Priority: Custom Domain > Subdomain > Path > Header > Default
        if (customDomain) {
            console.log('  Trying custom domain lookup...');
            restaurant = await getRestaurantByDomain(customDomain);
        } else if (subdomain && subdomain !== 'www' && subdomain !== 'api' && subdomain !== 'localhost') {
            console.log('  Trying subdomain lookup...');
            restaurant = await getRestaurantBySlug(subdomain);
        } else if (pathRestaurant) {
            console.log('  Trying path restaurant lookup...');
            restaurant = await getRestaurantBySlug(pathRestaurant);
        } else if (headerRestaurant) {
            console.log('  Trying header restaurant slug lookup...');
            restaurant = await getRestaurantBySlug(headerRestaurant);
        } else if (headerRestaurantId) {
            console.log('  Trying header restaurant ID lookup...');
            restaurant = await getRestaurantById(headerRestaurantId);
            
            // If specific restaurant ID was provided but not found, return error
            if (!restaurant) {
                return res.status(400).json({ 
                    error: 'Invalid restaurant ID',
                    message: `Restaurant with ID ${headerRestaurantId} not found or inactive`
                });
            }
        }

        // If no restaurant found and no specific ID was provided, use default
        if (!restaurant && !headerRestaurantId) {
            restaurant = await getDefaultRestaurant();
        }

        if (!restaurant) {
            // Check if any restaurant context was attempted
            const attemptedContext = headerRestaurantId || headerRestaurant || pathRestaurant || subdomain;
            
            if (attemptedContext) {
                return res.status(404).json({ 
                    error: 'Restaurant not found',
                    message: `Restaurant context '${attemptedContext}' not found or inactive`
                });
            } else {
                return res.status(400).json({ 
                    error: 'Missing restaurant context',
                    message: 'Please provide restaurant context via X-Restaurant-Id header or other supported methods'
                });
            }
        }

        // Attach restaurant context to request
        req.restaurant = restaurant;
        req.restaurantId = restaurant.id;
        req.restaurantSlug = restaurant.slug;

        next();
    } catch (error) {
        console.error('Error extracting restaurant context:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            message: 'Failed to determine restaurant context'
        });
    }
};

/**
 * Validate that user has access to the requested restaurant
 */
const validateRestaurantAccess = async (req, res, next) => {
    try {
        // Skip validation for public routes
        if (req.path.startsWith('/api/public') || req.path.startsWith('/api/auth')) {
            return next();
        }

        const restaurantId = req.restaurantId;
        const userId = req.user?.id;

        if (!restaurantId) {
            return res.status(400).json({ 
                error: 'Missing restaurant context',
                message: 'Restaurant context not found in request'
            });
        }

        // For authenticated routes, validate user's restaurant access
        if (userId) {
            const hasAccess = await validateUserRestaurantAccess(userId, restaurantId);
            if (!hasAccess) {
                return res.status(403).json({ 
                    error: 'Access denied',
                    message: 'User does not have access to this restaurant'
                });
            }
        }

        next();
    } catch (error) {
        console.error('Error validating restaurant access:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            message: 'Failed to validate restaurant access'
        });
    }
};

/**
 * Inject restaurant context into all database queries
 */
const injectRestaurantContext = (req, res, next) => {
    // Add restaurant context to req object for easy access
    req.dbContext = {
        restaurantId: req.restaurantId,
        restaurantSlug: req.restaurantSlug,
        restaurant: req.restaurant
    };

    // Add helper method to add restaurant filter to queries
    req.addRestaurantFilter = (query, params = []) => {
        if (query.toLowerCase().includes('where')) {
            return {
                text: query + ' AND restaurant_id = $' + (params.length + 1),
                values: [...params, req.restaurantId]
            };
        } else {
            return {
                text: query + ' WHERE restaurant_id = $' + (params.length + 1),
                values: [...params, req.restaurantId]
            };
        }
    };

    next();
};

/**
 * Database helper functions
 */
const getRestaurantByDomain = async (domain) => {
    try {
        const query = `
            SELECT * FROM restaurants 
            WHERE (domain = $1 OR slug = $1) 
            AND is_active = true
        `;
        const result = await pool.query(query, [domain]);
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error getting restaurant by domain:', error);
        return null;
    }
};

const getRestaurantBySlug = async (slug) => {
    try {
        console.log('🔍 getRestaurantBySlug called with slug:', slug);
        
        const query = `
            SELECT * FROM restaurants 
            WHERE slug = $1 
            AND is_active = true
        `;
        
        console.log('  Query:', query);
        console.log('  Parameters:', [slug]);
        
        const result = await pool.query(query, [slug]);
        console.log('  Query result rows:', result.rows.length);
        console.log('  First row:', result.rows[0] || 'No rows');
        
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error getting restaurant by slug:', error);
        return null;
    }
};

const getRestaurantById = async (id) => {
    try {
        console.log('🔍 getRestaurantById called with id:', id);
        
        const query = `
            SELECT * FROM restaurants 
            WHERE id = $1 
            AND is_active = true
        `;
        
        console.log('  Query:', query);
        console.log('  Parameters:', [id]);
        
        const result = await pool.query(query, [id]);
        console.log('  Query result rows:', result.rows.length);
        console.log('  First row:', result.rows[0] || 'No rows');
        
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error getting restaurant by id:', error);
        return null;
    }
};

const getDefaultRestaurant = async () => {
    try {
        const query = `
            SELECT * FROM restaurants 
            WHERE slug = 'default' 
            AND is_active = true
        `;
        const result = await pool.query(query);
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error getting default restaurant:', error);
        return null;
    }
};

const validateUserRestaurantAccess = async (userId, restaurantId) => {
    try {
        // Check if user belongs to the restaurant
        const query = `
            SELECT COUNT(*) as count 
            FROM users 
            WHERE id = $1 AND restaurant_id = $2
        `;
        const result = await pool.query(query, [userId, restaurantId]);
        return result.rows[0].count > 0;
    } catch (error) {
        console.error('Error validating user restaurant access:', error);
        return false;
    }
};

/**
 * Middleware to log restaurant context for debugging
 */
const logRestaurantContext = (req, res, next) => {
    if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Restaurant Context:', {
            restaurantId: req.restaurantId,
            restaurantSlug: req.restaurantSlug,
            restaurantName: req.restaurant?.name,
            path: req.path,
            method: req.method
        });
    }
    next();
};

module.exports = {
    extractRestaurantContext,
    validateRestaurantAccess,
    injectRestaurantContext,
    logRestaurantContext,
    // Export helper functions for use in other parts of the app
    getRestaurantByDomain,
    getRestaurantBySlug,
    getRestaurantById,
    getDefaultRestaurant,
    validateUserRestaurantAccess
};
