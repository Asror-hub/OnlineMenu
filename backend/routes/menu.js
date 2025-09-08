const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../database/connection');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const b2Service = require('../services/b2Service');
const { 
    extractRestaurantContext, 
    injectRestaurantContext 
} = require('../middleware/restaurantMiddleware');

const router = express.Router();

// Apply restaurant context middleware to all routes
router.use(extractRestaurantContext);
router.use(injectRestaurantContext);

// Configure multer for file uploads (memory storage for B2 upload)
const upload = multer({ 
  storage: multer.memoryStorage(), // Store in memory for B2 upload
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Get all menu items (public)
router.get('/', async (req, res) => {
  try {
    console.log('GET /api/menu called for restaurant:', req.restaurantId);
    
    if (!req.restaurantId) {
      return res.status(400).json({ error: 'Restaurant context required' });
    }
    
    const result = await pool.query(`
      SELECT 
        mi.*,
        COALESCE(c.name, 'Uncategorized') as category_name,
        COALESCE(s.name, '') as subcategory_name
      FROM menu_items mi
      LEFT JOIN categories c ON mi.category_id = c.id
      LEFT JOIN subcategories s ON mi.subcategory_id = s.id
      WHERE mi.restaurant_id = $1
      ORDER BY c.position, s.position, mi.created_at
    `, [req.restaurantId]);
    
    console.log('Query result rows:', result.rows.length);
    console.log('First item sample:', result.rows[0]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get menu items error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Debug endpoint to get all menu items (including inactive) - RESTAURANT ISOLATED
router.get('/debug/all', async (req, res) => {
  try {
    console.log('GET /api/menu/debug/all called for restaurant:', req.restaurantId);
    
    if (!req.restaurantId) {
      return res.status(400).json({ error: 'Restaurant context required' });
    }
    
    const result = await pool.query(`
      SELECT 
        mi.*,
        COALESCE(c.name, 'Uncategorized') as category_name,
        COALESCE(s.name, '') as subcategory_name
      FROM menu_items mi
      LEFT JOIN categories c ON mi.category_id = c.id AND c.restaurant_id = mi.restaurant_id
      LEFT JOIN subcategories s ON mi.subcategory_id = s.id AND s.restaurant_id = mi.restaurant_id
      WHERE mi.restaurant_id = $1
      ORDER BY mi.created_at DESC
    `, [req.restaurantId]);
    
    console.log('Debug endpoint - Total items for restaurant:', req.restaurantId, 'Count:', result.rows.length);
    console.log('Debug endpoint - Sample items:', result.rows.slice(0, 3));
    
    res.json({
      total: result.rows.length,
      items: result.rows
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get menu items by category
router.get('/category/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;
    
    let query;
    let params;
    
    if (categoryId === 'uncategorized') {
      query = `
        SELECT 
          mi.*,
          COALESCE(c.name, 'Uncategorized') as category_name,
          COALESCE(s.name, '') as subcategory_name
        FROM menu_items mi
        LEFT JOIN categories c ON mi.category_id = c.id
        LEFT JOIN subcategories s ON mi.subcategory_id = s.id
        WHERE mi.category_id IS NULL AND mi.is_active = true
        ORDER BY mi.created_at DESC
      `;
      params = [];
    } else {
      query = `
        SELECT 
          mi.*,
          COALESCE(c.name, 'Uncategorized') as category_name,
          COALESCE(s.name, '') as subcategory_name
        FROM menu_items mi
        LEFT JOIN categories c ON mi.category_id = c.id
        LEFT JOIN subcategories s ON mi.subcategory_id = s.id
        WHERE mi.category_id = $1 AND mi.is_active = true
        ORDER BY mi.created_at DESC
      `;
      params = [categoryId];
    }
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get menu items by category error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all categories with subcategories
router.get('/categories', async (req, res) => {
  try {
    if (!req.restaurantId) {
      return res.status(400).json({ error: 'Restaurant context required' });
    }
    
    // Get main categories for this restaurant
    const mainCategories = await pool.query(`
      SELECT id, name, parent_category_id, icon, position, created_at
      FROM categories 
      WHERE parent_category_id IS NULL AND is_active = true AND restaurant_id = $1
      ORDER BY position ASC, name ASC
    `, [req.restaurantId]);

    // Get subcategories for each main category
    const categoriesWithSubs = await Promise.all(
      mainCategories.rows.map(async (category) => {
        const subcategories = await pool.query(`
          SELECT id, name, icon, created_at
          FROM subcategories 
          WHERE category_id = $1 AND is_active = true
          ORDER BY name
        `, [category.id]);
        
        return {
          ...category,
          subcategories: subcategories.rows
        };
      })
    );

    // Add "Uncategorized" category for items without categories
    const uncategorizedCount = await pool.query(`
      SELECT COUNT(*) as count
      FROM menu_items 
      WHERE category_id IS NULL AND is_active = true AND restaurant_id = $1
    `, [req.restaurantId]);

    if (parseInt(uncategorizedCount.rows[0].count) > 0) {
      categoriesWithSubs.push({
        id: 'uncategorized',
        name: 'Uncategorized',
        description: 'Items without assigned categories',
        icon: 'FiHelpCircle',
        created_at: new Date(),
        subcategories: []
      });
    }

    res.json(categoriesWithSubs);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin only: Create new category
router.post('/categories', express.json({ limit: '10mb' }), auth, [
  body('name').trim().isLength({ min: 2 }),
  body('parent_category_id').optional().custom((value) => {
    if (value === '' || value === null || value === undefined) {
      return true; // Allow empty/null values
    }
    return Number.isInteger(Number(value)) && Number(value) >= 1;
  }).withMessage('Parent category ID must be a valid integer'),
  body('icon').optional().trim()
], async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    console.log('Category creation request body:', req.body);
    console.log('User:', req.user);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const { name, parent_category_id, icon } = req.body;

    // Get the highest position value and add 1 for the new category
    const maxPositionResult = await pool.query(
      'SELECT COALESCE(MAX(position), -1) as max_position FROM categories WHERE parent_category_id IS NULL AND restaurant_id = $1',
      [req.restaurantId]
    );
    const newPosition = maxPositionResult.rows[0].max_position + 1;

    const result = await pool.query(
      'INSERT INTO categories (name, parent_category_id, icon, position, created_by, restaurant_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, parent_category_id, icon, newPosition, req.user.userId, req.restaurantId]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin only: Create new subcategory
router.post('/subcategories', express.json({ limit: '10mb' }), auth, [
  body('name').trim().isLength({ min: 2 }),
  body('category_id').isInt({ min: 1 }),
  body('icon').optional().trim()
], async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    console.log('Subcategory creation request body:', req.body);
    console.log('User:', req.user);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const { name, category_id, icon } = req.body;

    const result = await pool.query(
      'INSERT INTO subcategories (name, category_id, icon, created_by, restaurant_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, category_id, icon, req.user.userId, req.restaurantId]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create subcategory error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin only: Update subcategory
router.put('/subcategories/:id', express.json({ limit: '10mb' }), auth, [
  body('name').optional().trim().isLength({ min: 2 }),
  body('category_id').optional().isInt({ min: 1 }),
  body('icon').optional().trim(),
  body('is_active').optional().isIn(['true', 'false', true, false])
], async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const { id } = req.params;
    const updates = req.body;
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        let value = updates[key];
        
        // Convert is_active to boolean if it's a string
        if (key === 'is_active') {
          value = value === 'true' || value === true;
        }
        
        updateFields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id, req.restaurantId);
    const result = await pool.query(
      `UPDATE subcategories SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} AND restaurant_id = $${paramCount + 1} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update subcategory error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin only: Delete subcategory (soft delete)
router.delete('/subcategories/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { id } = req.params;
    
    // Check if subcategory has menu items
    const menuItems = await pool.query(
      'SELECT COUNT(*) FROM menu_items WHERE subcategory_id = $1 AND is_active = true AND restaurant_id = $2',
      [id, req.restaurantId]
    );

    if (parseInt(menuItems.rows[0].count) > 0) {
      return res.status(400).json({ error: 'Cannot delete subcategory with active menu items' });
    }

    const result = await pool.query(
      'UPDATE subcategories SET is_active = false, updated_at = NOW() WHERE id = $1 AND restaurant_id = $2 RETURNING *',
      [id, req.restaurantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }

    res.json({ message: 'Subcategory deleted successfully' });
  } catch (error) {
    console.error('Delete subcategory error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin only: Reorder categories
router.put('/categories/reorder', auth, express.json(), async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { categoryOrders } = req.body;
    
    if (!Array.isArray(categoryOrders)) {
      return res.status(400).json({ error: 'categoryOrders must be an array' });
    }

    // Update positions for all categories
    for (let i = 0; i < categoryOrders.length; i++) {
      const { id, position } = categoryOrders[i];
      
      if (!id || typeof position !== 'number') {
        return res.status(400).json({ error: 'Invalid category order data' });
      }

      await pool.query(
        'UPDATE categories SET position = $1, updated_at = NOW() WHERE id = $2 AND restaurant_id = $3',
        [position, id, req.restaurantId]
      );
    }

    res.json({ message: 'Categories reordered successfully' });
  } catch (error) {
    console.error('Reorder categories error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin only: Update category
router.put('/categories/:id', express.json({ limit: '10mb' }), auth, [
  body('name').optional().trim().isLength({ min: 2 }),
  body('parent_category_id').optional().custom((value) => {
    if (value === '' || value === null || value === undefined) {
      return true; // Allow empty/null values
    }
    return Number.isInteger(Number(value)) && Number(value) >= 1;
  }).withMessage('Parent category ID must be a valid integer'),
  body('icon').optional().trim()
], async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const { id } = req.params;
    const updates = req.body;
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        updateFields.push(`${key} = $${paramCount}`);
        values.push(updates[key]);
        paramCount++;
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id, req.restaurantId);
    const result = await pool.query(
      `UPDATE categories SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} AND restaurant_id = $${paramCount + 1} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin only: Delete category (soft delete)
router.delete('/categories/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { id } = req.params;
    
    // Check if category has menu items
    const menuItems = await pool.query(
      'SELECT COUNT(*) FROM menu_items WHERE category_id = $1 AND is_active = true AND restaurant_id = $2',
      [id, req.restaurantId]
    );

    if (parseInt(menuItems.rows[0].count) > 0) {
      return res.status(400).json({ error: 'Cannot delete category with active menu items' });
    }

    const result = await pool.query(
      'UPDATE categories SET is_active = false, updated_at = NOW() WHERE id = $1 AND restaurant_id = $2 RETURNING *',
      [id, req.restaurantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin only: Create new menu item
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    console.log('Menu item creation request body:', req.body);
    console.log('Request headers:', req.headers);
    console.log('Request content-type:', req.get('Content-Type'));
    console.log('Uploaded file:', req.file);
    console.log('User:', req.user);

    // Validate the request body after multer has processed it
    const { name, description, price, category_id, subcategory_id, is_active } = req.body;
    
    // Manual validation
    const validationErrors = [];
    
    if (!name || name.trim().length < 2) {
      validationErrors.push({ field: 'name', message: 'Name must be at least 2 characters long' });
    }
    
    if (!description || description.trim().length < 10) {
      validationErrors.push({ field: 'description', message: 'Description must be at least 10 characters long' });
    }
    
    if (!price || isNaN(price) || parseFloat(price) < 0.01) {
      validationErrors.push({ field: 'price', message: 'Price must be a valid number greater than 0' });
    }
    
    if (!category_id || isNaN(category_id) || parseInt(category_id) < 1) {
      validationErrors.push({ field: 'category_id', message: 'Category ID must be a valid integer greater than 0' });
    }
    
    if (subcategory_id && (isNaN(subcategory_id) || parseInt(subcategory_id) < 1)) {
      validationErrors.push({ field: 'subcategory_id', message: 'Subcategory ID must be a valid integer greater than 0' });
    }
    
    // Convert is_active to boolean if it's a string
    const isActiveBoolean = is_active === 'true' || is_active === true;
    
    if (validationErrors.length > 0) {
      console.log('Validation errors:', validationErrors);
      return res.status(400).json({ error: 'Validation failed', details: validationErrors });
    }

    // Handle image upload
    let image_url = null;
    if (req.file) {
      try {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = `image-${uniqueSuffix}${path.extname(req.file.originalname)}`;
        
        // Upload to B2
        const uploadResult = await b2Service.uploadImage(req.file, filename);
        image_url = uploadResult.publicUrl;
        console.log('File uploaded to B2 successfully:', image_url);
      } catch (error) {
        console.error('B2 upload failed:', error);
        return res.status(500).json({ error: 'Failed to upload image to cloud storage' });
      }
    } else if (req.body.image_url) {
      // URL was provided
      image_url = req.body.image_url;
      console.log('Image URL provided:', image_url);
    }

    console.log('Final image_url:', image_url);

    const result = await pool.query(
      'INSERT INTO menu_items (name, description, price, category_id, subcategory_id, image_url, is_active, created_by, restaurant_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [name, description, price, category_id, subcategory_id, image_url, isActiveBoolean, req.user.userId, req.user.restaurantId]
    );

    console.log('Menu item created successfully:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create menu item error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Admin only: Update menu item
router.put('/:id', auth, upload.single('image'), [
  body('name').optional().trim().isLength({ min: 2 }),
  body('description').optional().trim().isLength({ min: 10 }),
  body('price').optional().isFloat({ min: 0.01 }),
  body('category_id').optional().isInt({ min: 1 }),
  body('subcategory_id').optional().isInt({ min: 1 }),
  body('is_active').optional().isIn(['true', 'false', true, false])
], async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const { id } = req.params;
    const updates = req.body;
    const updateFields = [];
    const values = [];
    let paramCount = 1;
    let oldImageUrl = null;

    // Get current image URL before updating (for deletion)
    if (req.file) {
      const currentItem = await pool.query('SELECT image_url FROM menu_items WHERE id = $1 AND restaurant_id = $2', [id, req.restaurantId]);
      if (currentItem.rows.length > 0) {
        oldImageUrl = currentItem.rows[0].image_url;
      }
    }

    // Handle image upload
    if (req.file) {
      try {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = `image-${uniqueSuffix}${path.extname(req.file.originalname)}`;
        
        // Upload to B2
        const uploadResult = await b2Service.uploadImage(req.file, filename);
        updateFields.push(`image_url = $${paramCount}`);
        values.push(uploadResult.publicUrl);
        paramCount++;
        console.log('File uploaded to B2 successfully:', uploadResult.publicUrl);
      } catch (error) {
        console.error('B2 upload failed:', error);
        return res.status(500).json({ error: 'Failed to upload image to cloud storage' });
      }
    } else if (updates.image_url !== undefined) {
      // URL was provided
      updateFields.push(`image_url = $${paramCount}`);
      values.push(updates.image_url);
      paramCount++;
    }

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined && key !== 'image_url') {
        let value = updates[key];
        
        // Convert is_active to boolean if it's a string
        if (key === 'is_active') {
          value = value === 'true' || value === true;
        }
        
        updateFields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id, req.restaurantId);
    const result = await pool.query(
      `UPDATE menu_items SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} AND restaurant_id = $${paramCount + 1} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    // Delete old image from B2 if a new image was uploaded
    if (oldImageUrl && oldImageUrl.startsWith('https://f004.backblazeb2.com')) {
      try {
        // Extract filename from B2 URL for deletion
        // URL format: https://f004.backblazeb2.com/file/qr-menu/menu-images/filename.png
        const urlParts = oldImageUrl.split('/');
        const fileName = urlParts.slice(-2).join('/'); // Get "menu-images/filename.png"
        
        console.log('Attempting to delete old image from B2:', fileName);
        const deleteResult = await b2Service.deleteImage(fileName);
        
        if (deleteResult.success) {
          console.log('Old image deleted from B2 successfully:', fileName);
        } else {
          console.log('Old image deletion result:', deleteResult.message);
        }
      } catch (error) {
        console.error('Failed to delete old image from B2:', error);
        // Don't fail the update if deletion fails, just log it
      }
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin only: Delete menu item (soft delete)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { id } = req.params;
    
    const result = await pool.query(
      'UPDATE menu_items SET is_active = false, updated_at = NOW() WHERE id = $1 AND restaurant_id = $2 RETURNING *',
      [id, req.restaurantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
