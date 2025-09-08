const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransporter({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }

    /**
     * Send welcome email to new restaurant owner
     * @param {string} email - Restaurant owner's email
     * @param {Object} restaurant - Restaurant data
     * @param {Object} urls - Generated URLs
     * @returns {Promise<Object>} - Email sending result
     */
    async sendRestaurantWelcome(email, restaurant, urls) {
        try {
            const mailOptions = {
                from: process.env.SMTP_FROM || 'noreply@yourdomain.com',
                to: email,
                subject: `🎉 Welcome to ${restaurant.name} - Your Restaurant App is Ready!`,
                html: this.generateWelcomeEmailHTML(restaurant, urls),
                text: this.generateWelcomeEmailText(restaurant, urls)
            };

            const result = await this.transporter.sendMail(mailOptions);
            
            console.log(`✅ Welcome email sent to ${email} for restaurant: ${restaurant.name}`);
            return {
                success: true,
                messageId: result.messageId,
                message: 'Welcome email sent successfully'
            };

        } catch (error) {
            console.error(`❌ Failed to send welcome email to ${email}:`, error);
            return {
                success: false,
                error: error.message,
                message: 'Failed to send welcome email'
            };
        }
    }

    /**
     * Generate HTML welcome email
     */
    generateWelcomeEmailHTML(restaurant, urls) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Welcome to ${restaurant.name}</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
                    .url-card { background: white; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin: 20px 0; }
                    .url-title { font-weight: bold; color: #495057; margin-bottom: 10px; }
                    .url-value { background: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace; word-break: break-all; }
                    .button { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
                    .button:hover { background: #0056b3; }
                    .qr-section { background: white; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin: 20px 0; }
                    .table-url { margin: 10px 0; padding: 10px; background: #f8f9fa; border-radius: 4px; }
                    .footer { text-align: center; margin-top: 30px; color: #6c757d; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Welcome to ${restaurant.name}!</h1>
                        <p>Your restaurant app is ready and live!</p>
                    </div>
                    
                    <div class="content">
                        <h2>🚀 Your Restaurant App is Live!</h2>
                        <p>Congratulations! Your restaurant now has its own branded online presence. Here's everything you need to get started:</p>
                        
                        <div class="url-card">
                            <div class="url-title">🌐 Your Restaurant Website</div>
                            <div class="url-value">${urls.website}</div>
                            <a href="${urls.website}" class="button" target="_blank">Visit Your Website</a>
                        </div>
                        
                        <div class="url-card">
                            <div class="url-title">⚙️ Admin Panel</div>
                            <div class="url-value">${urls.admin}</div>
                            <a href="${urls.admin}" class="button" target="_blank">Access Admin Panel</a>
                        </div>
                        
                        <div class="qr-section">
                            <h3>📱 Table QR Codes</h3>
                            <p>Generate QR codes for each table so customers can order directly from their phones:</p>
                            
                            <div class="table-url">
                                <strong>Table 1:</strong> ${urls.tableQR.replace('{tableNumber}', '1')}
                            </div>
                            <div class="table-url">
                                <strong>Table 2:</strong> ${urls.tableQR.replace('{tableNumber}', '2')}
                            </div>
                            <div class="table-url">
                                <strong>Table 3:</strong> ${urls.tableQR.replace('{tableNumber}', '3')}
                            </div>
                            <div class="table-url">
                                <strong>Table 4:</strong> ${urls.tableQR.replace('{tableNumber}', '4')}
                            </div>
                            <div class="table-url">
                                <strong>Table 5:</strong> ${urls.tableQR.replace('{tableNumber}', '5')}
                            </div>
                            
                            <p><em>You can generate QR codes for these URLs using any online QR code generator.</em></p>
                        </div>
                        
                        <h3>📋 Next Steps:</h3>
                        <ol>
                            <li><strong>Customize Your Branding:</strong> Upload your logo, set colors, and customize the look</li>
                            <li><strong>Add Your Menu:</strong> Create categories and add menu items with descriptions and prices</li>
                            <li><strong>Generate QR Codes:</strong> Create QR codes for each table using the URLs above</li>
                            <li><strong>Share Your Website:</strong> Add the website URL to your social media, business cards, and marketing materials</li>
                            <li><strong>Start Taking Orders:</strong> Customers can now order online or scan QR codes at tables</li>
                        </ol>
                        
                        <h3>💡 Pro Tips:</h3>
                        <ul>
                            <li>Print QR codes and place them on each table</li>
                            <li>Share your website URL on social media to attract online customers</li>
                            <li>Use the admin panel to monitor orders and manage your menu</li>
                            <li>Update your menu regularly to keep customers engaged</li>
                        </ul>
                    </div>
                    
                    <div class="footer">
                        <p>Need help? Contact our support team at support@yourdomain.com</p>
                        <p>© 2024 Your Restaurant Platform. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    /**
     * Generate text welcome email
     */
    generateWelcomeEmailText(restaurant, urls) {
        return `
Welcome to ${restaurant.name}!

Your restaurant app is ready and live!

🌐 Your Restaurant Website: ${urls.website}
⚙️ Admin Panel: ${urls.admin}

📱 Table QR Code URLs:
Table 1: ${urls.tableQR.replace('{tableNumber}', '1')}
Table 2: ${urls.tableQR.replace('{tableNumber}', '2')}
Table 3: ${urls.tableQR.replace('{tableNumber}', '3')}
Table 4: ${urls.tableQR.replace('{tableNumber}', '4')}
Table 5: ${urls.tableQR.replace('{tableNumber}', '5')}

Next Steps:
1. Customize your branding in the admin panel
2. Add your menu items and categories
3. Generate QR codes for each table
4. Share your website URL on social media
5. Start taking orders!

Need help? Contact support@yourdomain.com

© 2024 Your Restaurant Platform
        `;
    }

    /**
     * Send notification email to admin about new restaurant
     */
    async sendAdminNotification(restaurant, urls) {
        try {
            const mailOptions = {
                from: process.env.SMTP_FROM || 'noreply@yourdomain.com',
                to: process.env.ADMIN_EMAIL || 'admin@yourdomain.com',
                subject: `🏪 New Restaurant Created: ${restaurant.name}`,
                html: `
                    <h2>New Restaurant Created</h2>
                    <p><strong>Name:</strong> ${restaurant.name}</p>
                    <p><strong>Slug:</strong> ${restaurant.slug}</p>
                    <p><strong>Email:</strong> ${restaurant.email}</p>
                    <p><strong>Website:</strong> <a href="${urls.website}">${urls.website}</a></p>
                    <p><strong>Admin Panel:</strong> <a href="${urls.admin}">${urls.admin}</a></p>
                `
            };

            await this.transporter.sendMail(mailOptions);
            console.log(`✅ Admin notification sent for new restaurant: ${restaurant.name}`);

        } catch (error) {
            console.error(`❌ Failed to send admin notification:`, error);
        }
    }
}

module.exports = new EmailService();
