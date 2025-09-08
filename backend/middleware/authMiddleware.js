const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../database/connection');

/**
 * Authentication Middleware with Multi-Tenancy Support
 * Handles JWT tokens with restaurant context
 */

/**
 * Generate JWT token with restaurant context
 */
const generateToken = (user, restaurantId) => {
    const payload = {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        restaurantId: restaurantId, // Include restaurant context
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    };

    return jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key');
};

/**
 * Verify JWT token and extract user + restaurant context
 */
const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ 
                error: 'Access denied',
                message: 'No token provided'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // Validate token expiration
        if (decoded.exp < Math.floor(Date.now() / 1000)) {
            return res.status(401).json({ 
                error: 'Token expired',
                message: 'Please login again'
            });
        }

        // Get user from database with restaurant context
        const userQuery = `
            SELECT u.*, r.name as restaurant_name, r.slug as restaurant_slug
            FROM users u
            JOIN restaurants r ON u.restaurant_id = r.id
            WHERE u.id = $1 AND u.restaurant_id = $2
        `;
        
        const userResult = await db.pool.query(userQuery, [decoded.userId, decoded.restaurantId]);
        
        if (userResult.rows.length === 0) {
            return res.status(401).json({ 
                error: 'Invalid token',
                message: 'User not found or restaurant access denied'
            });
        }

        const user = userResult.rows[0];

        // Validate that user still has access to the restaurant
        if (user.restaurant_id !== decoded.restaurantId) {
            return res.status(403).json({ 
                error: 'Access denied',
                message: 'User restaurant access has changed'
            });
        }

        // Attach user and restaurant context to request
        req.user = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            restaurantId: user.restaurant_id,
            restaurant_id: user.restaurant_id, // Add snake_case version for compatibility
            restaurantName: user.restaurant_name,
            restaurant_name: user.restaurant_name, // Add snake_case version for compatibility
            restaurantSlug: user.restaurant_slug,
            restaurant_slug: user.restaurant_slug // Add snake_case version for compatibility
        };

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                error: 'Invalid token',
                message: 'Token is malformed'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                error: 'Token expired',
                message: 'Please login again'
            });
        }

        console.error('Token verification error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            message: 'Failed to verify token'
        });
    }
};

/**
 * Role-based access control middleware
 */
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                error: 'Authentication required',
                message: 'Please login to access this resource'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                error: 'Insufficient permissions',
                message: `Role '${req.user.role}' is not authorized for this action`
            });
        }

        next();
    };
};

/**
 * Restaurant owner/manager access control
 */
const requireRestaurantAccess = (minRole = 'staff') => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                error: 'Authentication required',
                message: 'Please login to access this resource'
            });
        }

        // Check if user has access to the current restaurant
        if (req.user.restaurantId !== req.restaurantId) {
            return res.status(403).json({ 
                error: 'Access denied',
                message: 'User does not have access to this restaurant'
            });
        }

        // Role hierarchy: admin > owner > manager > staff
        const roleHierarchy = {
            'admin': 4,
            'owner': 3,
            'manager': 2,
            'staff': 1
        };

        const userRoleLevel = roleHierarchy[req.user.role] || 0;
        const requiredRoleLevel = roleHierarchy[minRole] || 0;

        if (userRoleLevel < requiredRoleLevel) {
            return res.status(403).json({ 
                error: 'Insufficient permissions',
                message: `Minimum role '${minRole}' required for this action`
            });
        }

        next();
    };
};

/**
 * Guest user authentication (for public ordering)
 */
const authenticateGuest = async (req, res, next) => {
    try {
        const guestToken = req.headers['x-guest-token'];
        
        if (guestToken) {
            try {
                const decoded = jwt.verify(guestToken, process.env.JWT_SECRET || 'your-secret-key');
                
                if (decoded.type === 'guest' && decoded.restaurantId === req.restaurantId) {
                    req.guest = {
                        id: decoded.guestId,
                        restaurantId: decoded.restaurantId,
                        sessionId: decoded.sessionId
                    };
                }
            } catch (error) {
                // Invalid guest token, continue as unauthenticated
                console.log('Invalid guest token:', error.message);
            }
        }

        next();
    } catch (error) {
        console.error('Guest authentication error:', error);
        next(); // Continue without guest context
    }
};

/**
 * Generate guest token for public users
 */
const generateGuestToken = (guestId, restaurantId, sessionId) => {
    const payload = {
        type: 'guest',
        guestId: guestId,
        restaurantId: restaurantId,
        sessionId: sessionId,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days for guests
    };

    return jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key');
};

/**
 * Hash password utility
 */
const hashPassword = async (password) => {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
};

/**
 * Compare password utility
 */
const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

module.exports = {
    generateToken,
    verifyToken,
    requireRole,
    requireRestaurantAccess,
    authenticateGuest,
    generateGuestToken,
    hashPassword,
    comparePassword
};
