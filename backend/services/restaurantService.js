const { pool } = require('../database/connection');

/**
 * Restaurant Service for Multi-Tenancy
 * Handles all restaurant-related operations
 */

class RestaurantService {
    
    /**
     * Get restaurant by ID with full details
     */
    async getRestaurantById(restaurantId) {
        try {
            // First try the full query with all columns
            let query = `
                SELECT 
                    r.*,
                    rs.wifi_name, rs.wifi_password, rs.instagram, rs.facebook, 
                    rs.trip_advisor, rs.whatsapp, rs.telegram, rs.custom_social_media,
                    rb.primary_color, rb.secondary_color, rb.accent_color, 
                    rb.font_family, rb.logo_url, rb.favicon_url, rb.hero_image_url, rb.custom_css
                FROM restaurants r
                LEFT JOIN restaurant_settings rs ON r.id = rs.restaurant_id
                LEFT JOIN restaurant_branding rb ON r.id = rb.restaurant_id
                WHERE r.id = $1 AND r.is_active = true
            `;
            
            try {
                const result = await pool.query(query, [restaurantId]);
                return result.rows[0] || null;
            } catch (error) {
                console.log('Full query failed, trying simplified query:', error.message);
                
                // If the full query fails (missing columns), try a simplified version
                const simplifiedQuery = `
                    SELECT 
                        r.*,
                        rs.wifi_name, rs.wifi_password, rs.instagram, rs.facebook, 
                        rs.trip_advisor, rs.whatsapp, rs.telegram, rs.custom_social_media,
                        rb.primary_color, rb.secondary_color, rb.accent_color, 
                        rb.font_family, rb.logo_url
                    FROM restaurants r
                    LEFT JOIN restaurant_settings rs ON r.id = rs.restaurant_id
                    LEFT JOIN restaurant_branding rb ON r.id = rb.restaurant_id
                    WHERE r.id = $1 AND r.is_active = true
                `;
                
                const result = await pool.query(simplifiedQuery, [restaurantId]);
                const restaurant = result.rows[0] || null;
                
                // Add missing columns with default values
                if (restaurant) {
                    restaurant.favicon_url = null;
                    restaurant.hero_image_url = null;
                    restaurant.custom_css = null;
                }
                
                return restaurant;
            }
        } catch (error) {
            console.error('Error getting restaurant by ID:', error);
            throw new Error('Failed to get restaurant details');
        }
    }

    /**
     * Get restaurant by slug
     */
    async getRestaurantBySlug(slug) {
        try {
            const query = `
                SELECT 
                    r.*,
                    rs.wifi_name, rs.wifi_password, rs.instagram, rs.facebook, 
                    rs.trip_advisor, rs.whatsapp, rs.telegram, rs.custom_social_media,
                    rb.primary_color, rb.secondary_color, rb.accent_color, 
                    rb.font_family, rb.logo_url, rb.favicon_url, rb.hero_image_url, rb.custom_css
                FROM restaurants r
                LEFT JOIN restaurant_settings rs ON r.id = rs.restaurant_id
                LEFT JOIN restaurant_branding rb ON r.id = rb.restaurant_id
                WHERE r.slug = $1 AND r.is_active = true
            `;
            
            const result = await pool.query(query, [slug]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error getting restaurant by slug:', error);
            throw new Error('Failed to get restaurant details');
        }
    }

    /**
     * Get restaurant by domain
     */
    async getRestaurantByDomain(domain) {
        try {
            const query = `
                SELECT 
                    r.*,
                    rs.wifi_name, rs.wifi_password, rs.instagram, rs.facebook, 
                    rs.trip_advisor, rs.whatsapp, rs.telegram, rs.custom_social_media,
                    rb.primary_color, rb.secondary_color, rb.accent_color, 
                    rb.font_family, rb.logo_url, rb.favicon_url, rb.hero_image_url, rb.custom_css
                FROM restaurants r
                LEFT JOIN restaurant_settings rs ON r.id = rs.restaurant_id
                LEFT JOIN restaurant_branding rb ON r.id = rb.restaurant_id
                WHERE (r.domain = $1 OR r.slug = $1) AND r.is_active = true
            `;
            
            const result = await pool.query(query, [domain]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error getting restaurant by domain:', error);
            throw new Error('Failed to get restaurant details');
        }
    }

    /**
     * Create new restaurant with automated setup
     */
    async createRestaurant(restaurantData) {
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            // Create restaurant
            const restaurantQuery = `
                INSERT INTO restaurants (
                    name, slug, domain, description, logo_url, 
                    primary_color, secondary_color, phone, email, 
                    address, google_maps_link, open_time, close_time, timezone
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                RETURNING *
            `;
            
            const restaurantValues = [
                restaurantData.name,
                restaurantData.slug,
                restaurantData.domain || null,
                restaurantData.description || '',
                restaurantData.logo_url || null,
                restaurantData.primary_color || '#000000',
                restaurantData.secondary_color || '#ffffff',
                restaurantData.phone || null,
                restaurantData.email || null,
                restaurantData.address || null,
                restaurantData.google_maps_link || null,
                restaurantData.open_time || '09:00:00',
                restaurantData.close_time || '22:00:00',
                restaurantData.timezone || 'UTC'
            ];
            
            const restaurantResult = await client.query(restaurantQuery, restaurantValues);
            const restaurant = restaurantResult.rows[0];
            
            // Create default settings
            const settingsQuery = `
                INSERT INTO restaurant_settings (restaurant_id)
                VALUES ($1)
            `;
            await client.query(settingsQuery, [restaurant.id]);
            
            // Create default branding
            const brandingQuery = `
                INSERT INTO restaurant_branding (
                    restaurant_id, primary_color, secondary_color, accent_color
                ) VALUES ($1, $2, $3, $4)
            `;
            await client.query(brandingQuery, [
                restaurant.id,
                restaurant.primary_color,
                restaurant.secondary_color,
                '#ff6b6b'
            ]);
            
            // Create default content pages
            const contentQueries = [
                {
                    page_type: 'about',
                    title: `About ${restaurant.name}`,
                    content: `Welcome to ${restaurant.name}! We are passionate about serving delicious food with excellent service.`,
                    meta_description: `Learn more about ${restaurant.name} and our commitment to quality food and service.`
                },
                {
                    page_type: 'contact',
                    title: 'Contact Us',
                    content: 'Get in touch with us for reservations, catering, or any questions you may have.',
                    meta_description: 'Contact information and ways to reach our restaurant for reservations and inquiries.'
                }
            ];
            
            for (const content of contentQueries) {
                const contentQuery = `
                    INSERT INTO restaurant_content (
                        restaurant_id, page_type, title, content, meta_description
                    ) VALUES ($1, $2, $3, $4, $5)
                `;
                await client.query(contentQuery, [
                    restaurant.id,
                    content.page_type,
                    content.title,
                    content.content,
                    content.meta_description
                ]);
            }
            
            // Copy default categories and subcategories from restaurant 1 (default restaurant)
            const defaultCategoriesQuery = `
                SELECT id, name, parent_category_id, icon, position, is_active
                FROM categories 
                WHERE restaurant_id = 1 AND is_active = true
                ORDER BY position
            `;
            const defaultCategories = await client.query(defaultCategoriesQuery);
            
            // Create categories for the new restaurant
            for (const category of defaultCategories.rows) {
                const newCategoryQuery = `
                    INSERT INTO categories (
                        name, parent_category_id, icon, position, is_active, 
                        created_by, restaurant_id
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                    RETURNING id
                `;
                const newCategoryResult = await client.query(newCategoryQuery, [
                    category.name,
                    category.parent_category_id,
                    category.icon,
                    category.position,
                    category.is_active,
                    null, // created_by will be null for default categories
                    restaurant.id
                ]);
                
                const newCategoryId = newCategoryResult.rows[0].id;
                
                // Copy subcategories for this category
                const defaultSubcategoriesQuery = `
                    SELECT name, icon, is_active
                    FROM subcategories 
                    WHERE category_id = $1 AND restaurant_id = 1 AND is_active = true
                `;
                const defaultSubcategories = await client.query(defaultSubcategoriesQuery, [category.id]);
                
                for (const subcategory of defaultSubcategories.rows) {
                    const newSubcategoryQuery = `
                        INSERT INTO subcategories (
                            name, category_id, icon, is_active, 
                            created_by, restaurant_id
                        ) VALUES ($1, $2, $3, $4, $5, $6)
                    `;
                    await client.query(newSubcategoryQuery, [
                        subcategory.name,
                        newCategoryId,
                        subcategory.icon,
                        subcategory.is_active,
                        null, // created_by will be null for default subcategories
                        restaurant.id
                    ]);
                }
            }
            
            // Generate restaurant URLs for the response
            const dnsService = require('./dnsService');
            const urls = dnsService.generateRestaurantURLs(restaurant.slug, restaurant.id);
            
            // Store URLs in restaurant metadata (optional)
            try {
                const urlsQuery = `
                    INSERT INTO restaurant_metadata (restaurant_id, key, value)
                    VALUES ($1, 'urls', $2)
                    ON CONFLICT (restaurant_id, key) 
                    DO UPDATE SET value = $2
                `;
                await client.query(urlsQuery, [restaurant.id, JSON.stringify(urls)]);
            } catch (error) {
                console.log('Note: restaurant_metadata table not found, skipping URL storage');
            }
            
            await client.query('COMMIT');
            
            // Return restaurant with URLs
            return {
                ...restaurant,
                urls
            };
            
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error creating restaurant:', error);
            throw new Error('Failed to create restaurant');
        } finally {
            client.release();
        }
    }

    /**
     * Update restaurant details
     */
    async updateRestaurant(restaurantId, updateData) {
        try {
            const query = `
                UPDATE restaurants 
                SET 
                    name = COALESCE($1, name),
                    slug = COALESCE($2, slug),
                    domain = COALESCE($3, domain),
                    description = COALESCE($4, description),
                    logo_url = COALESCE($5, logo_url),
                    primary_color = COALESCE($6, primary_color),
                    secondary_color = COALESCE($7, secondary_color),
                    phone = COALESCE($8, phone),
                    email = COALESCE($9, email),
                    address = COALESCE($10, address),
                    google_maps_link = COALESCE($11, google_maps_link),
                    open_time = COALESCE($12, open_time),
                    close_time = COALESCE($13, close_time),
                    timezone = COALESCE($14, timezone),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $15
                RETURNING *
            `;
            
            const values = [
                updateData.name, updateData.slug, updateData.domain, updateData.description,
                updateData.logo_url, updateData.primary_color, updateData.secondary_color,
                updateData.phone, updateData.email, updateData.address, updateData.google_maps_link,
                updateData.open_time, updateData.close_time, updateData.timezone, restaurantId
            ];
            
            const result = await pool.query(query, values);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error updating restaurant:', error);
            throw new Error('Failed to update restaurant');
        }
    }

    /**
     * Update restaurant branding
     */
    async updateRestaurantBranding(restaurantId, brandingData) {
        try {
            const query = `
                INSERT INTO restaurant_branding (
                    restaurant_id, primary_color, secondary_color, accent_color,
                    font_family, logo_url, favicon_url, hero_image_url, custom_css
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                ON CONFLICT (restaurant_id) 
                DO UPDATE SET
                    primary_color = EXCLUDED.primary_color,
                    secondary_color = EXCLUDED.secondary_color,
                    accent_color = EXCLUDED.accent_color,
                    font_family = EXCLUDED.font_family,
                    logo_url = EXCLUDED.logo_url,
                    favicon_url = EXCLUDED.favicon_url,
                    hero_image_url = EXCLUDED.hero_image_url,
                    custom_css = EXCLUDED.custom_css,
                    updated_at = CURRENT_TIMESTAMP
                RETURNING *
            `;
            
            const values = [
                restaurantId,
                brandingData.primary_color || '#000000',
                brandingData.secondary_color || '#ffffff',
                brandingData.accent_color || '#ff6b6b',
                brandingData.font_family || 'Inter',
                brandingData.logo_url || null,
                brandingData.favicon_url || null,
                brandingData.hero_image_url || null,
                brandingData.custom_css || null
            ];
            
            const result = await pool.query(query, values);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error updating restaurant branding:', error);
            throw new Error('Failed to update restaurant branding');
        }
    }

    /**
     * Update restaurant content
     */
    async updateRestaurantContent(restaurantId, pageType, contentData) {
        try {
            const query = `
                INSERT INTO restaurant_content (
                    restaurant_id, page_type, title, content, meta_description, meta_keywords
                ) VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (restaurant_id, page_type) 
                DO UPDATE SET
                    title = EXCLUDED.title,
                    content = EXCLUDED.content,
                    meta_description = EXCLUDED.meta_description,
                    meta_keywords = EXCLUDED.meta_keywords,
                    updated_at = CURRENT_TIMESTAMP
                RETURNING *
            `;
            
            const values = [
                restaurantId,
                pageType,
                contentData.title || '',
                contentData.content || '',
                contentData.meta_description || '',
                contentData.meta_keywords || ''
            ];
            
            const result = await pool.query(query, values);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error updating restaurant content:', error);
            throw new Error('Failed to update restaurant content');
        }
    }

    /**
     * Get restaurant content by page type
     */
    async getRestaurantContent(restaurantId, pageType) {
        try {
            const query = `
                SELECT * FROM restaurant_content
                WHERE restaurant_id = $1 AND page_type = $2 AND is_published = true
            `;
            
            const result = await pool.query(query, [restaurantId, pageType]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error getting restaurant content:', error);
            throw new Error('Failed to get restaurant content');
        }
    }

    /**
     * Get restaurant statistics
     */
    async getRestaurantStats(restaurantId) {
        try {
            const query = `
                SELECT 
                    (SELECT COUNT(*) FROM users WHERE restaurant_id = $1) as total_users,
                    (SELECT COUNT(*) FROM menu_items WHERE restaurant_id = $1 AND is_active = true) as active_menu_items,
                    (SELECT COUNT(*) FROM categories WHERE restaurant_id = $1 AND is_active = true) as total_categories,
                    (SELECT COUNT(*) FROM orders WHERE restaurant_id = $1) as total_orders,
                    (SELECT COUNT(*) FROM orders WHERE restaurant_id = $1 AND status = 'pending') as pending_orders,
                    (SELECT COUNT(*) FROM orders WHERE restaurant_id = $1 AND status = 'completed') as completed_orders
            `;
            
            const result = await pool.query(query, [restaurantId]);
            return result.rows[0] || {};
        } catch (error) {
            console.error('Error getting restaurant stats:', error);
            throw new Error('Failed to get restaurant statistics');
        }
    }

    /**
     * Check if restaurant slug is available
     */
    async isSlugAvailable(slug, excludeId = null) {
        try {
            let query = 'SELECT COUNT(*) as count FROM restaurants WHERE slug = $1';
            let values = [slug];
            
            if (excludeId) {
                query += ' AND id != $2';
                values.push(excludeId);
            }
            
            const result = await pool.query(query, values);
            return result.rows[0].count === 0;
        } catch (error) {
            console.error('Error checking slug availability:', error);
            return false;
        }
    }

    /**
     * Check if restaurant domain is available
     */
    async isDomainAvailable(domain, excludeId = null) {
        try {
            let query = 'SELECT COUNT(*) as count FROM restaurants WHERE domain = $1';
            let values = [domain];
            
            if (excludeId) {
                query += ' AND id != $2';
                values.push(excludeId);
            }
            
            const result = await pool.query(query, values);
            return result.rows[0].count === 0;
        } catch (error) {
            console.error('Error checking domain availability:', error);
            return false;
        }
    }

    /**
     * Get all restaurants (for admin panel)
     */
    async getAllRestaurants(limit = 50, offset = 0) {
        try {
            const query = `
                SELECT 
                    r.*,
                    (SELECT COUNT(*) FROM users WHERE restaurant_id = r.id) as user_count,
                    (SELECT COUNT(*) FROM menu_items WHERE restaurant_id = r.id) as menu_item_count,
                    (SELECT COUNT(*) FROM orders WHERE restaurant_id = r.id) as order_count
                FROM restaurants r
                ORDER BY r.created_at DESC
                LIMIT $1 OFFSET $2
            `;
            
            const result = await pool.query(query, [limit, offset]);
            return result.rows;
        } catch (error) {
            console.error('Error getting all restaurants:', error);
            throw new Error('Failed to get restaurants list');
        }
    }
}

module.exports = new RestaurantService();
