const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../database/connection');
const auth = require('../middleware/auth');
const { 
    extractRestaurantContext, 
    injectRestaurantContext 
} = require('../middleware/restaurantMiddleware');

const router = express.Router();

// Apply restaurant context middleware to all routes
router.use(extractRestaurantContext);
router.use(injectRestaurantContext);

// Get restaurant settings (public) - RESTAURANT ISOLATED
router.get('/', async (req, res) => {
  try {
    console.log('GET /api/settings called for restaurant:', req.restaurantId);
    
    if (!req.restaurantId) {
      return res.status(400).json({ error: 'Restaurant context required' });
    }
    
    const restaurant = req.restaurant;
    
    // First try to get settings from the new multi-tenant restaurant_settings table
    let result = await pool.query(`
      SELECT 
        rs.wifi_name,
        rs.wifi_password,
        rs.instagram,
        rs.facebook,
        rs.trip_advisor,
        rs.whatsapp,
        rs.telegram,
        rs.custom_social_media,
        r.name as restaurant_name,
        r.description,
        r.google_maps_link,
        r.phone,
        r.email,
        r.open_time,
        r.close_time
      FROM restaurants r
      LEFT JOIN restaurant_settings rs ON r.id = rs.restaurant_id
      WHERE r.id = $1
    `, [restaurant.id]);
    
    // If no settings found in new table, try the old table as fallback
    if (result.rows.length === 0) {
      console.log('No settings found in new table, trying old table');
      result = await pool.query(`
        SELECT 
          restaurant_name,
          description,
          google_maps_link,
          phone,
          email,
          open_time,
          close_time,
          wifi_name,
          wifi_password,
          instagram,
          facebook,
          trip_advisor,
          whatsapp,
          telegram,
          custom_social_media
        FROM restaurant_settings 
        ORDER BY id DESC 
        LIMIT 1
      `);
    }
    
    if (result.rows.length > 0) {
      const settings = result.rows[0];
      
      // Parse custom social media JSON if it exists
      if (settings.custom_social_media) {
        try {
          // Check if it's already an object or a string
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
      
      res.json(settings);
    } else {
      // Return default settings if none exist
      res.json({
        restaurant_name: '',
        description: '',
        google_maps_link: '',
        phone: '',
        email: '',
        open_time: '09:00',
        close_time: '22:00',
        wifi_name: '',
        wifi_password: '',
        instagram: '',
        facebook: '',
        trip_advisor: '',
        whatsapp: '',
        telegram: '',
        custom_social_media: []
      });
    }
  } catch (error) {
    console.error('Get restaurant settings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Save restaurant settings (admin only)
router.post('/', auth, [
  body('restaurantName').optional().trim().isLength({ max: 100 }),
  body('description').optional().trim().isLength({ max: 500 }),
  body('googleMapsLink').optional().trim().custom((value) => {
    if (value && value !== '') {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    }
    return true; // Allow empty strings
  }).withMessage('Invalid Google Maps URL'),
  body('phone').optional().trim().isLength({ max: 20 }),
  body('email').optional().trim().custom((value) => {
    if (value && value !== '') {
      // Simple email validation regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    }
    return true; // Allow empty strings
  }).withMessage('Invalid email format'),
  body('openTime').optional().custom((value) => {
    if (!value || value === '') return true; // Allow empty
    // Accept HH:MM or HH:MM:SS format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
    return timeRegex.test(value);
  }).withMessage('Invalid open time format. Use HH:MM or HH:MM:SS'),
  body('closeTime').optional().custom((value) => {
    if (!value || value === '') return true; // Allow empty
    // Accept HH:MM or HH:MM:SS format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
    return timeRegex.test(value);
  }).withMessage('Invalid close time format. Use HH:MM or HH:MM:SS'),
  body('wifiName').optional().trim().isLength({ max: 50 }),
  body('wifiPassword').optional().trim().isLength({ max: 50 }),
  body('instagram').optional().trim().custom((value) => {
    if (value && value !== '') {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    }
    return true; // Allow empty strings
  }).withMessage('Invalid Instagram URL'),
  body('facebook').optional().trim().custom((value) => {
    if (value && value !== '') {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    }
    return true; // Allow empty strings
  }).withMessage('Invalid Facebook URL'),
  body('tripAdvisor').optional().trim().custom((value) => {
    if (value && value !== '') {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    }
    return true; // Allow empty strings
  }).withMessage('Invalid TripAdvisor URL'),
  body('whatsapp').optional().trim().custom((value) => {
    if (value && value !== '') {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    }
    return true; // Allow empty strings
  }).withMessage('Invalid WhatsApp URL'),
  body('telegram').optional().trim().custom((value) => {
    if (value && value !== '') {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    }
    return true; // Allow empty strings
  }).withMessage('Invalid Telegram URL'),
  body('customSocialMedia').optional().isArray()
], async (req, res) => {
  try {
    console.log('POST /api/settings called for restaurant:', req.restaurantId);
    console.log('Request body:', req.body);
    
    if (!req.restaurantId) {
      return res.status(400).json({ error: 'Restaurant context required' });
    }
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array() 
      });
    }

    const {
      restaurantName,
      description,
      googleMapsLink,
      phone,
      email,
      openTime,
      closeTime,
      wifiName,
      wifiPassword,
      instagram,
      facebook,
      tripAdvisor,
      whatsapp,
      telegram,
      customSocialMedia
    } = req.body;

    // Update restaurant basic information in the restaurants table
    await pool.query(`
      UPDATE restaurants SET
        name = $1,
        description = $2,
        google_maps_link = $3,
        phone = $4,
        email = $5,
        open_time = $6,
        close_time = $7,
        updated_at = NOW()
      WHERE id = $8
    `, [
      restaurantName || '',
      description || '',
      googleMapsLink || '',
      phone || '',
      email || '',
      openTime || '09:00',
      closeTime || '22:00',
      req.restaurantId
    ]);

    // Check if settings already exist for this restaurant
    const existingSettings = await pool.query('SELECT id FROM restaurant_settings WHERE restaurant_id = $1', [req.restaurantId]);
    
    let result;
    if (existingSettings.rows.length > 0) {
      // Update existing settings
      result = await pool.query(`
        UPDATE restaurant_settings SET
          wifi_name = $1,
          wifi_password = $2,
          instagram = $3,
          facebook = $4,
          trip_advisor = $5,
          whatsapp = $6,
          telegram = $7,
          custom_social_media = $8,
          updated_at = NOW()
        WHERE id = $9 AND restaurant_id = $10
        RETURNING *
      `, [
        wifiName || '',
        wifiPassword || '',
        instagram || '',
        facebook || '',
        tripAdvisor || '',
        whatsapp || '',
        telegram || '',
        customSocialMedia ? JSON.stringify(customSocialMedia) : '[]',
        existingSettings.rows[0].id,
        req.restaurantId
      ]);
    } else {
      // Create new settings
      result = await pool.query(`
        INSERT INTO restaurant_settings (
          restaurant_id,
          wifi_name,
          wifi_password,
          instagram,
          facebook,
          trip_advisor,
          whatsapp,
          telegram,
          custom_social_media,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
        RETURNING *
      `, [
        req.restaurantId,
        wifiName || '',
        wifiPassword || '',
        instagram || '',
        facebook || '',
        tripAdvisor || '',
        whatsapp || '',
        telegram || '',
        customSocialMedia ? JSON.stringify(customSocialMedia) : '[]'
      ]);
    }

    // Get the updated restaurant info and settings to return
    const updatedData = await pool.query(`
      SELECT 
        rs.wifi_name,
        rs.wifi_password,
        rs.instagram,
        rs.facebook,
        rs.trip_advisor,
        rs.whatsapp,
        rs.telegram,
        rs.custom_social_media,
        r.name as restaurant_name,
        r.description,
        r.google_maps_link,
        r.phone,
        r.email,
        r.open_time,
        r.close_time
      FROM restaurants r
      LEFT JOIN restaurant_settings rs ON r.id = rs.restaurant_id
      WHERE r.id = $1
    `, [req.restaurantId]);

    const responseData = updatedData.rows[0] || {};
    
    // Parse custom social media JSON if it exists
    if (responseData.custom_social_media) {
      try {
        if (typeof responseData.custom_social_media === 'string') {
          if (responseData.custom_social_media.trim() === '') {
            responseData.custom_social_media = [];
          } else {
            responseData.custom_social_media = JSON.parse(responseData.custom_social_media);
          }
        }
      } catch (error) {
        console.error('Error parsing custom social media:', error);
        responseData.custom_social_media = [];
      }
    } else {
      responseData.custom_social_media = [];
    }

    console.log('Settings saved successfully');
    res.json({ 
      message: 'Settings saved successfully',
      settings: responseData
    });
  } catch (error) {
    console.error('Save restaurant settings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
