const fetch = require('node-fetch');

class DNSService {
    constructor() {
        this.apiToken = process.env.CLOUDFLARE_API_TOKEN;
        this.zoneId = process.env.CLOUDFLARE_ZONE_ID;
        this.baseDomain = process.env.BASE_DOMAIN || 'yourdomain.com';
        this.enableDNS = process.env.ENABLE_DNS_AUTOCREATE === 'true';
    }

    /**
     * Create a subdomain for a restaurant
     * @param {string} subdomain - The subdomain to create (e.g., 'pizzapalace')
     * @returns {Promise<Object>} - Result of DNS creation
     */
    async createSubdomain(subdomain) {
        if (!this.enableDNS) {
            console.log(`DNS auto-creation disabled, skipping subdomain: ${subdomain}`);
            return { success: true, message: 'DNS auto-creation disabled' };
        }

        if (!this.apiToken || !this.zoneId) {
            console.warn('Cloudflare credentials not configured, skipping DNS creation');
            return { success: true, message: 'DNS credentials not configured' };
        }

        try {
            console.log(`Creating DNS subdomain: ${subdomain}.${this.baseDomain}`);

            const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${this.zoneId}/dns_records`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type: 'CNAME',
                    name: subdomain,
                    content: this.baseDomain,
                    ttl: 1,
                    proxied: true,
                    comment: `Auto-created for restaurant: ${subdomain}`
                })
            });

            const result = await response.json();

            if (result.success) {
                console.log(`✅ DNS subdomain created successfully: ${subdomain}.${this.baseDomain}`);
                return {
                    success: true,
                    subdomain: `${subdomain}.${this.baseDomain}`,
                    message: 'Subdomain created successfully'
                };
            } else {
                console.error(`❌ DNS subdomain creation failed:`, result.errors);
                return {
                    success: false,
                    errors: result.errors,
                    message: 'Failed to create subdomain'
                };
            }

        } catch (error) {
            console.error(`❌ DNS subdomain creation error:`, error);
            return {
                success: false,
                error: error.message,
                message: 'DNS creation failed'
            };
        }
    }

    /**
     * Delete a subdomain for a restaurant
     * @param {string} subdomain - The subdomain to delete
     * @returns {Promise<Object>} - Result of DNS deletion
     */
    async deleteSubdomain(subdomain) {
        if (!this.enableDNS) {
            return { success: true, message: 'DNS auto-creation disabled' };
        }

        try {
            // First, get the DNS record ID
            const listResponse = await fetch(
                `https://api.cloudflare.com/client/v4/zones/${this.zoneId}/dns_records?name=${subdomain}.${this.baseDomain}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiToken}`
                    }
                }
            );

            const listResult = await listResponse.json();

            if (!listResult.success || listResult.result.length === 0) {
                return { success: true, message: 'Subdomain not found' };
            }

            const recordId = listResult.result[0].id;

            // Delete the DNS record
            const deleteResponse = await fetch(
                `https://api.cloudflare.com/client/v4/zones/${this.zoneId}/dns_records/${recordId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${this.apiToken}`
                    }
                }
            );

            const deleteResult = await deleteResponse.json();

            if (deleteResult.success) {
                console.log(`✅ DNS subdomain deleted successfully: ${subdomain}.${this.baseDomain}`);
                return {
                    success: true,
                    message: 'Subdomain deleted successfully'
                };
            } else {
                console.error(`❌ DNS subdomain deletion failed:`, deleteResult.errors);
                return {
                    success: false,
                    errors: deleteResult.errors,
                    message: 'Failed to delete subdomain'
                };
            }

        } catch (error) {
            console.error(`❌ DNS subdomain deletion error:`, error);
            return {
                success: false,
                error: error.message,
                message: 'DNS deletion failed'
            };
        }
    }

    /**
     * Check if a subdomain exists
     * @param {string} subdomain - The subdomain to check
     * @returns {Promise<boolean>} - Whether the subdomain exists
     */
    async subdomainExists(subdomain) {
        if (!this.enableDNS) {
            return false;
        }

        try {
            const response = await fetch(
                `https://api.cloudflare.com/client/v4/zones/${this.zoneId}/dns_records?name=${subdomain}.${this.baseDomain}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiToken}`
                    }
                }
            );

            const result = await response.json();
            return result.success && result.result.length > 0;

        } catch (error) {
            console.error(`❌ Error checking subdomain existence:`, error);
            return false;
        }
    }

    /**
     * Generate restaurant URLs
     * @param {string} slug - Restaurant slug
     * @param {string} restaurantId - Restaurant ID
     * @returns {Object} - Generated URLs
     */
    generateRestaurantURLs(slug, restaurantId) {
        const baseUrl = process.env.CLIENT_APP_URL || 'https://onlinemenuclient.onrender.com';
        const adminUrl = process.env.ADMIN_APP_URL || 'https://onlinemenuadmin.onrender.com';

        // Use path-based routing for better compatibility and easier setup
        return {
            website: `${baseUrl}/${slug}`,
            tableQR: `${baseUrl}/${slug}/table/{tableNumber}`,
            admin: `${adminUrl}/${slug}/admin`,
            api: `${process.env.API_BASE_URL || 'https://online-menu-backend.onrender.com/api'}/restaurants/${restaurantId}`
        };
    }
}

module.exports = new DNSService();
