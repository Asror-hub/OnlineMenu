const express = require('express');
const router = express.Router();
const restaurantService = require('../services/restaurantService');
const { 
    verifyToken, 
    requireRole, 
    requireRestaurantAccess 
} = require('../middleware/authMiddleware');
const { 
    extractRestaurantContext, 
    validateRestaurantAccess, 
    injectRestaurantContext 
} = require('../middleware/restaurantMiddleware');

/**
 * Restaurant Routes with Multi-Tenancy Support
 */

// Apply restaurant context middleware to all routes
router.use(extractRestaurantContext);
router.use(injectRestaurantContext);

// Public routes (no authentication required)
router.get('/public/info', async (req, res) => {
    try {
        const restaurant = await restaurantService.getRestaurantById(req.restaurantId);
        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }

        // Return public restaurant information
        const publicInfo = {
            id: restaurant.id,
            name: restaurant.name,
            description: restaurant.description,
            logo_url: restaurant.logo_url,
            primary_color: restaurant.primary_color,
            secondary_color: restaurant.secondary_color,
            phone: restaurant.phone,
            email: restaurant.email,
            address: restaurant.address,
            google_maps_link: restaurant.google_maps_link,
            open_time: restaurant.open_time,
            close_time: restaurant.close_time,
            timezone: restaurant.timezone
        };

        res.json(publicInfo);
    } catch (error) {
        console.error('Error getting public restaurant info:', error);
        res.status(500).json({ error: 'Failed to get restaurant information' });
    }
});

// Get restaurant content for specific page type
router.get('/public/content/:pageType', async (req, res) => {
    try {
        const { pageType } = req.params;
        const restaurant = await restaurantService.getRestaurantById(req.restaurantId);
        
        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }

        // For now, return null to indicate no custom content exists
        // This will trigger the frontend to use default content
        res.json(null);
        
    } catch (error) {
        console.error('Error getting restaurant content:', error);
        res.status(500).json({ error: 'Failed to get restaurant content' });
    }
});

router.get('/public/branding', async (req, res) => {
    try {
        const restaurant = await restaurantService.getRestaurantById(req.restaurantId);
        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }

        // Return branding information
        const branding = {
            primary_color: restaurant.primary_color,
            secondary_color: restaurant.secondary_color,
            accent_color: restaurant.accent_color,
            font_family: restaurant.font_family,
            logo_url: restaurant.logo_url,
            favicon_url: restaurant.favicon_url,
            hero_image_url: restaurant.hero_image_url,
            custom_css: restaurant.custom_css
        };

        res.json(branding);
    } catch (error) {
        console.error('Error getting restaurant branding:', error);
        res.status(500).json({ error: 'Failed to get restaurant branding' });
    }
});

router.get('/public/content/:pageType', async (req, res) => {
    try {
        const { pageType } = req.params;
        const content = await restaurantService.getRestaurantContent(req.restaurantId, pageType);
        
        if (!content) {
            return res.status(404).json({ error: 'Content not found' });
        }

        res.json(content);
    } catch (error) {
        console.error('Error getting restaurant content:', error);
        res.status(500).json({ error: 'Failed to get restaurant content' });
    }
});

router.get('/public/settings', async (req, res) => {
    try {
        console.log('🔧 DEBUG: New route code is running!', new Date().toISOString());
        
        const restaurant = await restaurantService.getRestaurantById(req.restaurantId);
        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }

        console.log('🔧 DEBUG: Restaurant data:', {
            name: restaurant.name,
            phone: restaurant.phone,
            email: restaurant.email
        });

        // Get settings from restaurant_settings table
        const { pool } = require('../database/connection');
        const settingsResult = await pool.query(`
            SELECT 
                wifi_name,
                wifi_password,
                instagram,
                facebook,
                trip_advisor,
                whatsapp,
                telegram,
                custom_social_media
            FROM restaurant_settings 
            WHERE restaurant_id = $1
        `, [req.restaurantId]);

        const settings = settingsResult.rows[0] || {};

        // Parse custom social media JSON if it exists
        if (settings.custom_social_media) {
            try {
                if (typeof settings.custom_social_media === 'string') {
                    if (settings.custom_social_media.trim() === '') {
                        settings.custom_social_media = [];
                    } else {
                        settings.custom_social_media = JSON.parse(settings.custom_social_media);
                    }
                }
            } catch (error) {
                console.error('Error parsing custom social media:', error);
                settings.custom_social_media = [];
            }
        } else {
            settings.custom_social_media = [];
        }

        // Return combined restaurant info and settings
        const response = {
            // DEBUG: Add a flag to confirm new code is running
            _debug_new_code: true,
            _debug_timestamp: new Date().toISOString(),
            // Basic restaurant information
            restaurant_name: restaurant.name,
            description: restaurant.description,
            google_maps_link: restaurant.google_maps_link,
            phone: restaurant.phone,
            email: restaurant.email,
            open_time: restaurant.open_time,
            close_time: restaurant.close_time,
            // Settings
            wifi_name: settings.wifi_name,
            wifi_password: settings.wifi_password,
            instagram: settings.instagram,
            facebook: settings.facebook,
            trip_advisor: settings.trip_advisor,
            whatsapp: settings.whatsapp,
            telegram: settings.telegram,
            custom_social_media: settings.custom_social_media
        };

        console.log('🔧 DEBUG: Response data:', response);
        res.json(response);
    } catch (error) {
        console.error('Error getting restaurant settings:', error);
        res.status(500).json({ error: 'Failed to get restaurant settings' });
    }
});

// Protected routes (authentication required)
router.use(verifyToken);
router.use(validateRestaurantAccess);

// Get current restaurant details (for authenticated users)
router.get('/details', async (req, res) => {
    try {
        const restaurant = await restaurantService.getRestaurantById(req.restaurantId);
        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }

        res.json(restaurant);
    } catch (error) {
        console.error('Error getting restaurant details:', error);
        res.status(500).json({ error: 'Failed to get restaurant details' });
    }
});

// Get restaurant statistics
router.get('/stats', requireRestaurantAccess('staff'), async (req, res) => {
    try {
        const stats = await restaurantService.getRestaurantStats(req.restaurantId);
        res.json(stats);
    } catch (error) {
        console.error('Error getting restaurant stats:', error);
        res.status(500).json({ error: 'Failed to get restaurant statistics' });
    }
});

// Update restaurant details (owner/manager only)
router.put('/details', requireRestaurantAccess('manager'), async (req, res) => {
    try {
        const updateData = req.body;
        
        // Validate required fields
        if (updateData.slug) {
            const isSlugAvailable = await restaurantService.isSlugAvailable(
                updateData.slug, 
                req.restaurantId
            );
            if (!isSlugAvailable) {
                return res.status(400).json({ error: 'Slug is already taken' });
            }
        }

        if (updateData.domain) {
            const isDomainAvailable = await restaurantService.isDomainAvailable(
                updateData.domain, 
                req.restaurantId
            );
            if (!isDomainAvailable) {
                return res.status(400).json({ error: 'Domain is already taken' });
            }
        }

        const updatedRestaurant = await restaurantService.updateRestaurant(
            req.restaurantId, 
            updateData
        );

        res.json(updatedRestaurant);
    } catch (error) {
        console.error('Error updating restaurant details:', error);
        res.status(500).json({ error: 'Failed to update restaurant details' });
    }
});

// Update restaurant branding (owner/manager only)
router.put('/branding', requireRestaurantAccess('manager'), async (req, res) => {
    try {
        const brandingData = req.body;
        const updatedBranding = await restaurantService.updateRestaurantBranding(
            req.restaurantId, 
            brandingData
        );

        res.json(updatedBranding);
    } catch (error) {
        console.error('Error updating restaurant branding:', error);
        res.status(500).json({ error: 'Failed to update restaurant branding' });
    }
});

// Update restaurant content (owner/manager only)
router.put('/content/:pageType', requireRestaurantAccess('manager'), async (req, res) => {
    try {
        const { pageType } = req.params;
        const contentData = req.body;
        
        const updatedContent = await restaurantService.updateRestaurantContent(
            req.restaurantId, 
            pageType, 
            contentData
        );

        res.json(updatedContent);
    } catch (error) {
        console.error('Error updating restaurant content:', error);
        res.status(500).json({ error: 'Failed to update restaurant content' });
    }
});

// Update restaurant settings (owner/manager only)
router.put('/settings', requireRestaurantAccess('manager'), async (req, res) => {
    try {
        const settingsData = req.body;
        
        // This would need to be implemented in the restaurant service
        // For now, we'll return a placeholder
        res.json({ message: 'Settings update endpoint - to be implemented' });
    } catch (error) {
        console.error('Error updating restaurant settings:', error);
        res.status(500).json({ error: 'Failed to update restaurant settings' });
    }
});

// Admin routes (super admin only)
router.get('/admin/all', requireRole(['admin']), async (req, res) => {
    try {
        const { limit = 50, offset = 0 } = req.query;
        const restaurants = await restaurantService.getAllRestaurants(
            parseInt(limit), 
            parseInt(offset)
        );
        
        res.json(restaurants);
    } catch (error) {
        console.error('Error getting all restaurants:', error);
        res.status(500).json({ error: 'Failed to get restaurants list' });
    }
});

router.post('/admin/create', requireRole(['admin']), async (req, res) => {
    try {
        const restaurantData = req.body;
        
        // Validate required fields
        if (!restaurantData.name || !restaurantData.slug) {
            return res.status(400).json({ 
                error: 'Name and slug are required' 
            });
        }

        // Check slug availability
        const isSlugAvailable = await restaurantService.isSlugAvailable(restaurantData.slug);
        if (!isSlugAvailable) {
            return res.status(400).json({ error: 'Slug is already taken' });
        }

        // Check domain availability if provided
        if (restaurantData.domain) {
            const isDomainAvailable = await restaurantService.isDomainAvailable(restaurantData.domain);
            if (!isDomainAvailable) {
                return res.status(400).json({ error: 'Domain is already taken' });
            }
        }

        const newRestaurant = await restaurantService.createRestaurant(restaurantData);
        res.status(201).json(newRestaurant);
    } catch (error) {
        console.error('Error creating restaurant:', error);
        res.status(500).json({ error: 'Failed to create restaurant' });
    }
});

// Utility routes
router.get('/check-slug/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const isAvailable = await restaurantService.isSlugAvailable(slug, req.restaurantId);
        res.json({ available: isAvailable });
    } catch (error) {
        console.error('Error checking slug availability:', error);
        res.status(500).json({ error: 'Failed to check slug availability' });
    }
});

router.get('/check-domain/:domain', async (req, res) => {
    try {
        const { domain } = req.params;
        const isAvailable = await restaurantService.isDomainAvailable(domain, req.restaurantId);
        res.json({ available: isAvailable });
    } catch (error) {
        console.error('Error checking domain availability:', error);
        res.status(500).json({ error: 'Failed to check domain availability' });
    }
});

module.exports = router;
